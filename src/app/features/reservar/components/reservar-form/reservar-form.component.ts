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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { HorarioSucursal } from '../../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../../core/interfaces/servicio-empleado.interface';
import { ReservarPublicService } from '../../services/reservar-public.service';

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
  @Output() reservaCreada = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  private reservarService = inject(ReservarPublicService);

  paso = signal(1);
  guardando = signal(false);
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
  }

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado.set(servicio);
    this.empleadoSeleccionado.set(null);
    this.fechaSeleccionada.set('');
    this.horaSeleccionada.set('');
    this.horasDisponibles.set([]);

    const empleadosQueOfrecen = this.empleados.filter((e) =>
      this.serviciosEmpleados.some(
        (se) => se.servicioId === servicio.id && se.empleadoId === e.id,
      ),
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
    const formValue = this.form.getRawValue();
    const servicio = this.servicioSeleccionado()!;
    const empleado = this.empleadoSeleccionado()!;

    this.reservarService.crearReserva({
      empresaId: this.empresaId,
      sucursalId: this.sucursalId,
      servicioId: servicio.id,
      empleadoId: empleado.id,
      fecha: this.fechaSeleccionada(),
      horaInicio: this.horaSeleccionada(),
      horaFin: this.calcularHoraFin(),
      clienteNombre: formValue.nombre,
      clienteApellido: formValue.apellido,
      clienteEmail: formValue.email,
      clienteTelefono: formValue.telefono,
      observacion: formValue.observacion,
    }).subscribe({
      next: (reserva) => {
        this.guardando.set(false);
        this.reservaCreada.emit(reserva.codigo);
      },
      error: () => {
        this.guardando.set(false);
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

  private generarFechasDisponibles(): void {
    const fechas: string[] = [];
    const hoy = new Date();

    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay() + 1;

      const abierto = this.horarios.some(
        (h) => h.diaSemana === diaSemana && h.abierto,
      );

      if (abierto) {
        const str = fecha.toISOString().split('T')[0];
        fechas.push(str);
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
      .getHorariosDisponibles(this.sucursalId, empleado.id, servicio.id, fecha)
      .subscribe((horas) => {
        this.horasDisponibles.set(horas);
      });
  }

  fieldError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
