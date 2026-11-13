import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, forkJoin } from 'rxjs';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import {
  BarberoProximaHora,
  CrearReservaPanelDto,
  ProximaHoraResponse,
} from '../../../../core/interfaces/reserva-panel.interface';
import { HorarioSucursal } from '../../interfaces/horario-sucursal.interface';
import { ReservasService } from '../../services/reservas.service';
import {
  OcupacionReserva,
  ReservarPublicService,
} from '../../../reservar/services/reservar-public.service';
import { mensajeDeError } from '../../utils/reembolsos.util';

export interface AgendarClienteDialogData {
  empresaId: number;
  sucursalId: number;
}

/** Lo que devuelve el diálogo al agendar: la página avisa y recarga la agenda. */
export interface AgendarClienteDialogResult {
  conEmail: boolean;
}

type Modo = 'hoy' | 'otra';

interface DatosSucursal {
  horarios: HorarioSucursal[];
  bloqueos: BloqueoAgenda[];
  ocupacion: OcupacionReserva[];
}

const ZONA_NEGOCIO = 'America/Santiago';
const MENSAJE_HORA_OCUPADA = 'Esa hora se acaba de ocupar';

/** Fecha `AAAA-MM-DD` de hoy en el negocio (la API usa America/Santiago). */
function hoyEnNegocio(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_NEGOCIO }).format(new Date());
}

/**
 * SPEC 08: agenda al cliente que llega al local (o llama). Para el servicio elegido muestra cada
 * barbero con su primer hueco y su cola (`GET /reservas/proxima-hora`) y confirma con
 * `POST /reservas` la misma hora que se le dijo al cliente.
 */
@Component({
  selector: 'app-agendar-cliente-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './agendar-cliente-dialog.component.html',
  styleUrl: './agendar-cliente-dialog.component.scss',
})
export class AgendarClienteDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservasService = inject(ReservasService);
  private reservarPublic = inject(ReservarPublicService);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(
    MatDialogRef<AgendarClienteDialogComponent, AgendarClienteDialogResult>,
  );
  data = inject<AgendarClienteDialogData>(MAT_DIALOG_DATA);

  readonly hoy = hoyEnNegocio();

  servicios = signal<Servicio[]>([]);
  cargandoServicios = signal(true);
  modo = signal<Modo>('hoy');

  proxima = signal<ProximaHoraResponse | null>(null);
  cargandoProxima = signal(false);
  /** Error de la lista (carga fallida o un 409 al confirmar). */
  errorLista = signal('');

  barbero = signal<BarberoProximaHora | null>(null);
  /** Horas libres del barbero en "Otra fecha u hora", con la lógica de la página pública. */
  horasLibres = signal<string[]>([]);
  private datosSucursal: DatosSucursal | null = null;

  enviando = signal(false);
  errorEnvio = signal('');

  servicioControl = this.fb.control<number | null>(null, Validators.required);
  fechaControl = this.fb.nonNullable.control(this.hoy);
  horaControl = this.fb.nonNullable.control('');

  clienteForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    observacion: ['', [Validators.maxLength(1000)]],
  });

  private servicioId = toSignal(this.servicioControl.valueChanges, { initialValue: null });
  private hora = toSignal(this.horaControl.valueChanges, { initialValue: '' });
  private consulta: Subscription | null = null;

  servicio = computed(() => this.servicios().find((s) => s.id === this.servicioId()) ?? null);

  esHoy = computed(() => (this.proxima()?.fecha ?? this.hoy) === this.hoy);

  /** La primera fila con hora va destacada como "Más pronto". */
  masProntoId = computed(
    () => this.proxima()?.empleados.find((e) => e.horaInicio !== null)?.empleadoId ?? null,
  );

  /** Hora que se va a agendar: la elegida en "Otra fecha u hora" o el primer hueco. */
  horaFinal = computed(
    () => (this.modo() === 'otra' ? this.hora() : this.barbero()?.horaInicio) || '',
  );

  /** La cola solo se conoce para el primer hueco que calculó la API. */
  colaConocida = computed(() => {
    const b = this.barbero();
    return !!b && b.horaInicio === this.horaFinal();
  });

  ngOnInit(): void {
    this.reservarPublic.getServiciosByEmpresa(this.data.empresaId).subscribe({
      next: (servicios) => {
        this.servicios.set(servicios.filter((s) => s.activo !== false));
        this.cargandoServicios.set(false);
      },
      error: () => {
        this.cargandoServicios.set(false);
        this.errorLista.set('No pudimos cargar los servicios. Cierra y vuelve a intentarlo.');
      },
    });

    this.servicioControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.consultar());
    this.fechaControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.consultar());
  }

  cambiarModo(modo: Modo): void {
    if (this.modo() === modo) return;
    this.modo.set(modo);
    if (modo === 'hoy') {
      this.fechaControl.setValue(this.hoy, { emitEvent: false });
    }
    this.consultar();
  }

  /** Vuelve a pedir `proxima-hora` y, en "Otra fecha u hora", la ocupación de la sucursal. */
  consultar(): void {
    const servicioId = this.servicioControl.value;
    this.barbero.set(null);
    this.errorEnvio.set('');
    this.consulta?.unsubscribe();
    if (!servicioId) {
      this.proxima.set(null);
      return;
    }
    const fecha = this.modo() === 'otra' ? this.fechaControl.value : undefined;
    if (fecha !== undefined && (!fecha || fecha < this.hoy)) {
      this.proxima.set(null);
      this.errorLista.set('Elige una fecha desde hoy.');
      return;
    }

    this.cargandoProxima.set(true);
    this.errorLista.set('');
    this.consulta = this.reservasService
      .proximaHora(this.data.sucursalId, servicioId, fecha)
      .subscribe({
        next: (respuesta) => {
          this.proxima.set(respuesta);
          this.cargandoProxima.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.proxima.set(null);
          this.cargandoProxima.set(false);
          this.errorLista.set(
            (error.status === 400 && mensajeDeError(error)) ||
              'No pudimos consultar las horas. Inténtalo de nuevo.',
          );
        },
      });
    if (this.modo() === 'otra') {
      this.cargarDatosSucursal(true);
    }
  }

  elegir(barbero: BarberoProximaHora): void {
    if (!barbero.horaInicio) return;
    this.barbero.set(barbero);
    this.errorEnvio.set('');
    if (this.modo() === 'otra') {
      this.horaControl.setValue(barbero.horaInicio);
      this.calcularHorasLibres();
    }
  }

  volverALista(): void {
    this.barbero.set(null);
    this.errorEnvio.set('');
  }

  confirmar(): void {
    const servicio = this.servicio();
    const barbero = this.barbero();
    const proxima = this.proxima();
    const hora = this.horaFinal();
    this.clienteForm.markAllAsTouched();
    if (!servicio || !barbero || !proxima || !hora || this.clienteForm.invalid) return;
    if (this.enviando()) return;

    const { nombre, telefono, email, observacion } = this.clienteForm.getRawValue();
    // Los opcionales vacíos no se envían: el back valida el formato de lo que llega.
    const datos: CrearReservaPanelDto = {
      sucursalId: this.data.sucursalId,
      servicioId: servicio.id,
      empleadoId: barbero.empleadoId,
      fecha: proxima.fecha,
      horaInicio: hora,
      clienteNombre: nombre.trim(),
    };
    if (telefono.trim()) datos.clienteTelefono = telefono.trim();
    if (email.trim()) datos.clienteEmail = email.trim();
    if (observacion.trim()) datos.observacion = observacion.trim();

    this.enviando.set(true);
    this.errorEnvio.set('');
    this.reservasService.crearDesdePanel(datos).subscribe({
      next: () => this.dialogRef.close({ conEmail: !!datos.clienteEmail }),
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 409) {
          // La hora que se le dijo al cliente ya no está: se vuelve a consultar la lista.
          this.consultar();
          this.errorLista.set(`${MENSAJE_HORA_OCUPADA}. Elige otra.`);
          return;
        }
        if (error.status === 400) {
          this.errorEnvio.set(mensajeDeError(error) ?? 'Revisa los datos de la reserva.');
          return;
        }
        this.errorEnvio.set(
          error.status === 0
            ? 'No se pudo conectar con el servidor. Revisa tu conexión.'
            : 'No pudimos agendar la reserva. Inténtalo de nuevo.',
        );
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  nombreBarbero(b: BarberoProximaHora): string {
    return [b.nombre, b.apellido].filter(Boolean).join(' ');
  }

  iniciales(b: BarberoProximaHora): string {
    return [b.nombre, b.apellido]
      .filter((p): p is string => !!p)
      .map((p) => p.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  /** "Hoy" o "el lunes 16 de noviembre". */
  diaTexto(): string {
    if (this.esHoy()) return 'hoy';
    const fecha = this.proxima()?.fecha;
    if (!fecha) return '';
    const texto = new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return `el ${texto}`;
  }

  /** Primera letra en mayúscula, para el inicio de una frase. */
  capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  cola(reservasAntes: number): string {
    return reservasAntes === 0 ? 'Sin espera' : `${reservasAntes} antes`;
  }

  espera(minutos: number): string {
    return `~${Math.max(0, Math.round(minutos))} min`;
  }

  campoInvalido(campo: 'nombre' | 'telefono' | 'email' | 'observacion'): boolean {
    const control = this.clienteForm.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  private cargarDatosSucursal(recargar: boolean): void {
    if (this.datosSucursal && !recargar) {
      this.calcularHorasLibres();
      return;
    }
    const sucursalId = this.data.sucursalId;
    forkJoin({
      horarios: this.reservarPublic.getHorariosBySucursal(sucursalId),
      bloqueos: this.reservarPublic.getBloqueosBySucursal(sucursalId),
      ocupacion: this.reservarPublic.getOcupacion(sucursalId),
    }).subscribe({
      next: (datos) => {
        this.datosSucursal = datos;
        this.calcularHorasLibres();
      },
      // Sin estos datos queda al menos el primer hueco de `proxima-hora`.
      error: () => {
        this.datosSucursal = null;
        this.calcularHorasLibres();
      },
    });
  }

  /** Misma lógica que la página pública (`getHorariosDisponibles`), más el primer hueco. */
  private calcularHorasLibres(): void {
    const barbero = this.barbero();
    const servicio = this.servicio();
    const proxima = this.proxima();
    if (!barbero?.horaInicio || !servicio || !proxima) {
      this.horasLibres.set([]);
      return;
    }
    const primera = barbero.horaInicio;
    const datos = this.datosSucursal;
    if (!datos) {
      this.horasLibres.set([primera]);
      return;
    }
    this.reservarPublic
      .getHorariosDisponibles(
        this.data.sucursalId,
        barbero.empleadoId,
        servicio.id,
        proxima.fecha,
        this.servicios(),
        datos.horarios,
        datos.bloqueos,
        datos.ocupacion,
      )
      .subscribe((horas) => {
        const todas = new Set([primera, ...horas]);
        this.horasLibres.set([...todas].sort());
      });
  }
}
