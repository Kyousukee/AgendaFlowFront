import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { PagoOnlinePublico } from '../../../../core/interfaces/empresa.interface';
import { ApiErrorBody } from '../../../../core/interfaces/configuracion-empresa.interface';
import { HorarioSucursal } from '../../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../../core/interfaces/servicio-empleado.interface';
import {
  OcupacionReserva,
  PagoIniciado,
  ReservarPublicService,
} from '../../services/reservar-public.service';
import { ReservaResumen } from '../../interfaces/reserva-resumen.interface';

/** SPEC 06: la reserva quedó retenida y hay que pagar en Flow. */
export interface ReservaConPago {
  resumen: ReservaResumen;
  pago: PagoIniciado;
}

@Component({
  selector: 'app-reservar-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservar-form.component.html',
  styleUrl: './reservar-form.component.scss',
})
export class ReservarFormComponent implements OnChanges {
  @Input({ required: true }) empresaId = 0;
  @Input({ required: true }) sucursalId = 0;
  @Input({ required: true }) servicios: Servicio[] = [];
  @Input({ required: true }) empleados: Empleado[] = [];
  @Input({ required: true }) horarios: HorarioSucursal[] = [];
  @Input({ required: true }) bloqueos: BloqueoAgenda[] = [];
  @Input({ required: true }) serviciosEmpleados: ServicioEmpleado[] = [];
  @Input({ required: true }) ocupacion: OcupacionReserva[] = [];
  /** SPEC 06: configuración de cobro al reservar del negocio. */
  @Input() pagoOnline: PagoOnlinePublico | null = null;
  // SPEC 04 (TS mínimo autorizado): emite el resumen, no solo el código, para la confirmación.
  @Output() reservaCreada = new EventEmitter<ReservaResumen>();
  /** SPEC 06: la respuesta trae `pago`; la página redirige a Flow. */
  @Output() pagoIniciado = new EventEmitter<ReservaConPago>();
  /** SPEC 06: 409, otra persona tomó la hora. La página recarga la ocupación. */
  @Output() horaTomada = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private reservarService = inject(ReservarPublicService);

  paso = signal(1);
  guardando = signal(false);
  /** SPEC 04: la falla al confirmar ya no es silenciosa. SPEC 06: con el mensaje del back. */
  errorReserva = signal<string | null>(null);
  /** SPEC 06: el cliente elige pagar ahora o en el local (solo si el pago no es obligatorio). */
  pagarAhora = signal(true);
  /** SPEC 06: la reserva quedó retenida y el navegador se va a Flow. */
  redirigiendoAFlow = signal(false);
  servicioSeleccionado = signal<Servicio | null>(null);
  empleadoSeleccionado = signal<Empleado | null>(null);
  fechaSeleccionada = signal('');
  horaSeleccionada = signal('');
  horasDisponibles = signal<string[]>([]);
  fechasDisponibles = signal<string[]>([]);
  configuracion = signal<{ permiteSeleccionEmpleado: boolean }>({ permiteSeleccionEmpleado: true });

  totalPasos = computed(() => {
    return this.configuracion().permiteSeleccionEmpleado ? 4 : 3;
  });

  // El email ya era obligatorio; con pago online también lo exige Flow (SPEC 06).
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    observacion: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviciosEmpleados']) {
      this.generarFechasDisponibles();
    }
    // SPEC 06: después de un 409 la página recarga la ocupación y las horas se recalculan.
    if (changes['ocupacion'] && !changes['ocupacion'].firstChange && this.fechaSeleccionada()) {
      this.cargarHorasDisponibles();
    }
  }

  // ---- SPEC 06: abono ----

  /** Abono del servicio elegido, o null si este servicio no se cobra al reservar. */
  abono(): number | null {
    const servicio = this.servicioSeleccionado();
    if (!this.pagoOnline?.activo || !servicio) return null;
    return servicio.abono ?? null;
  }

  /** El cliente puede elegir pagar en el local. */
  pagoOpcional(): boolean {
    return this.abono() !== null && !this.pagoOnline?.obligatorio;
  }

  /** Se cobrará al confirmar, salvo que el back decida otra cosa (su respuesta manda). */
  aplicaPago(): boolean {
    return this.abono() !== null && (!!this.pagoOnline?.obligatorio || this.pagarAhora());
  }

  esPagoCompleto(): boolean {
    return this.pagoOnline?.tipo === 'Completo';
  }

  saldoEnLocal(): number {
    const servicio = this.servicioSeleccionado();
    const abono = this.abono();
    if (!servicio || abono === null) return 0;
    return Math.max(0, servicio.precio - abono);
  }

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado.set(servicio);
    this.empleadoSeleccionado.set(null);
    this.fechaSeleccionada.set('');
    this.horaSeleccionada.set('');
    this.horasDisponibles.set([]);

    const empleadosQueOfrecen = this.empleados.filter((e) =>
      this.serviciosEmpleados.some((se) => se.servicioId === servicio.id && se.empleadoId === e.id),
    );

    if (empleadosQueOfrecen.length === 1) {
      this.empleadoSeleccionado.set(empleadosQueOfrecen[0]);
      this.generarFechasDisponibles();
      if (!this.configuracion().permiteSeleccionEmpleado) {
        this.paso.set(this.paso() + 1);
      }
    } else if (!this.configuracion().permiteSeleccionEmpleado) {
      this.empleadoSeleccionado.set(empleadosQueOfrecen[0] || null);
      this.generarFechasDisponibles();
    }
  }

  seleccionarEmpleado(empleado: Empleado): void {
    this.empleadoSeleccionado.set(empleado);
    this.fechaSeleccionada.set('');
    this.horaSeleccionada.set('');
    this.horasDisponibles.set([]);
    this.generarFechasDisponibles();
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha);
    this.horaSeleccionada.set('');
    this.cargarHorasDisponibles();
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada.set(hora);
  }

  avanzarPaso(): void {
    if (this.paso() < this.totalPasos()) {
      this.paso.set(this.paso() + 1);
    }
  }

  retrocederPaso(): void {
    if (this.paso() > 1) {
      this.paso.set(this.paso() - 1);
    }
  }

  calcularHoraFin(): string {
    const servicio = this.servicioSeleccionado();
    const hora = this.horaSeleccionada();
    if (!servicio || !hora) return '';

    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + servicio.duracionMinutos;
    const finH = Math.floor(totalMin / 60);
    const finM = totalMin % 60;
    return `${finH.toString().padStart(2, '0')}:${finM.toString().padStart(2, '0')}`;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  confirmar(): void {
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);
    this.errorReserva.set(null);
    const formValue = this.form.getRawValue();
    const servicio = this.servicioSeleccionado()!;
    const empleado = this.empleadoSeleccionado()!;

    this.reservarService
      .crearReserva({
        empresaId: this.empresaId,
        sucursalId: this.sucursalId,
        servicioId: servicio.id,
        empleadoId: empleado.id,
        fecha: this.fechaSeleccionada(),
        horaInicio: this.horaSeleccionada(),
        clienteNombre: [formValue.nombre, formValue.apellido].filter(Boolean).join(' '),
        clienteEmail: formValue.email,
        clienteTelefono: formValue.telefono,
        observacion: formValue.observacion,
        ...(this.pagoOpcional() && { pagarAhora: this.pagarAhora() }),
      })
      .subscribe({
        next: (reserva) => {
          const resumen: ReservaResumen = {
            codigo: reserva.codigo,
            servicio: servicio.nombre ?? '',
            profesional: this.getNombreEmpleado(empleado),
            fecha: this.formatearFecha(this.fechaSeleccionada()),
            horaInicio: this.horaSeleccionada(),
            horaFin: this.calcularHoraFin(),
          };
          // SPEC 06: la respuesta es la fuente de verdad. Con `pago` se va a Flow, y `guardando`
          // sigue en true para que no se pueda reservar dos veces.
          if (reserva.pago) {
            this.redirigiendoAFlow.set(true);
            this.pagoIniciado.emit({ resumen, pago: reserva.pago });
            return;
          }
          this.guardando.set(false);
          this.reservaCreada.emit(resumen);
        },
        error: (error: unknown) => {
          this.guardando.set(false);
          this.errorReserva.set(this.mensajeError(error));
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.horaSeleccionada.set('');
            this.horaTomada.emit();
          }
        },
      });
  }

  getNombreEmpleado(e: Empleado): string {
    return [e.nombre, e.apellido].filter(Boolean).join(' ') || 'Sin nombre';
  }

  empleadoOfreceServicio(empleadoId: number, servicioId: number): boolean {
    return this.serviciosEmpleados.some(
      (se) => se.empleadoId === empleadoId && se.servicioId === servicioId,
    );
  }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'La hora ya no está disponible. Vuelve atrás y elige otra.';
      }
      if (error.status === 400) {
        const body = error.error as ApiErrorBody | null;
        const detalle = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
        if (detalle) return detalle;
      }
    }
    return (
      'No pudimos confirmar tu reserva. Revisa tu conexión e inténtalo de nuevo. Si el problema ' +
      'sigue, puede que esa hora se haya tomado: vuelve atrás y elige otra.'
    );
  }

  private generarFechasDisponibles(): void {
    const fechas: string[] = [];
    const hoy = new Date();

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();

      const abierto = this.horarios.some((h) => h.diaSemana === diaSemana && h.abierto);

      if (abierto) {
        const y = fecha.getFullYear();
        const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const d = fecha.getDate().toString().padStart(2, '0');
        fechas.push(`${y}-${m}-${d}`);
      }
    }

    this.fechasDisponibles.set(fechas);
  }

  private cargarHorasDisponibles(): void {
    const servicio = this.servicioSeleccionado();
    const empleado = this.empleadoSeleccionado();
    const fecha = this.fechaSeleccionada();

    if (!servicio || !empleado || !fecha) return;

    this.reservarService
      .getHorariosDisponibles(
        this.sucursalId,
        empleado.id,
        servicio.id,
        fecha,
        this.servicios,
        this.horarios,
        this.bloqueos,
        this.ocupacion,
      )
      .subscribe((horas) => {
        this.horasDisponibles.set(horas);
      });
  }

  fieldError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
