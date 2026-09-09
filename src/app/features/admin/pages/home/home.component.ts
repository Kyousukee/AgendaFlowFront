import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService, SUCURSAL_UPDATED } from '../../../../core/services/auth.service';
import { ServiciosService } from '../../services/servicios.service';
import { HorariosService } from '../../services/horarios.service';
import { ReservarPublicService } from '../../../reservar/services/reservar-public.service';
import { PagosService } from '../../services/pagos.service';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { HorarioSucursal } from '../../interfaces/horario-sucursal.interface';
import { Reserva, PagoReserva } from '../../../../core/interfaces/reserva.interface';

interface TimelineItem {
  type: 'reserva' | 'disponible';
  hora: string;
  horaFin: string;
  servicio?: Servicio;
  cliente?: string;
  empleado?: string;
  reserva?: Reserva;
}

interface TimelineRow {
  hora: string;
  horaFin: string;
  items: TimelineItem[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private serviciosService = inject(ServiciosService);
  private horariosService = inject(HorariosService);
  private reservarService = inject(ReservarPublicService);
  private pagosService = inject(PagosService);

  selectedDate = signal(new Date());
  servicios = signal<Servicio[]>([]);
  horarios = signal<HorarioSucursal[]>([]);
  reservas = signal<Reserva[]>([]);
  cargando = signal(true);
  linkCopiado = signal(false);

  modalPagoAbierto = signal(false);
  reservaSeleccionada = signal<Reserva | null>(null);
  montoPago = signal(0);
  metodoPago = signal('Efectivo');
  codigoTransaccion = signal('');
  guardandoPago = signal(false);
  pagoExitoso = signal(false);
  pagoError = signal('');

  pagoSeleccionado = signal<PagoReserva | null>(null);
  nuevoEstadoPago = signal('');
  actualizandoEstado = signal(false);
  estadoActualizado = signal(false);

  nuevoEstadoReserva = signal('');
  actualizandoEstadoReserva = signal(false);
  estadoReservaActualizado = signal(false);

  private sucursalUpdateHandler = (): void => {
    this.cargarDatos();
  };

  selectedDay = computed(() => {
    const d = this.selectedDate();
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  fechaStr = computed(() => {
    const d = this.selectedDate();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  timeline = computed(() => {
    const fecha = this.fechaStr();
    const d = new Date(fecha + 'T12:00:00');
    const diaSemana = d.getDay() === 0 ? 7 : d.getDay();

    const horario = this.horarios().find((h) => h.diaSemana === diaSemana && h.abierto);
    if (!horario) return [];

    const reservasDelDia = this.reservas().filter((r) => r.fecha === fecha);
    const serviciosList = this.servicios();

    const [aperturaH, aperturaM] = horario.horaInicio.split(':').map(Number);
    const [cierreH, cierreM] = horario.horaFin.split(':').map(Number);
    const apertura = aperturaH * 60 + aperturaM;
    const cierre = cierreH * 60 + cierreM;

    const reservasOrdenadas = [...reservasDelDia].sort(
      (a, b) => this.timeToMinutes(a.horaInicio) - this.timeToMinutes(b.horaInicio),
    );

    const allPoints = new Set<number>();
    const rangosReservas = reservasOrdenadas.map((r) => ({
      start: this.timeToMinutes(r.horaInicio),
      end: this.timeToMinutes(r.horaFin),
    }));
    for (let t = apertura; t <= cierre; t += 30) {
      const dentroDeReserva = rangosReservas.some((r) => t > r.start && t < r.end);
      if (!dentroDeReserva) {
        allPoints.add(t);
      }
    }
    allPoints.add(cierre);
    for (const r of reservasOrdenadas) {
      allPoints.add(this.timeToMinutes(r.horaInicio));
      allPoints.add(this.timeToMinutes(r.horaFin));
    }
    const points = [...allPoints].sort((a, b) => a - b);

    const rows: TimelineRow[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const overlapping = reservasOrdenadas.filter((r) => {
        const rInicio = this.timeToMinutes(r.horaInicio);
        const rFin = this.timeToMinutes(r.horaFin);
        return rInicio < end && rFin > start;
      });

      const items: TimelineItem[] = [];

      if (overlapping.length > 0) {
        for (const r of overlapping) {
          const servicio = serviciosList.find((s) => s.id === r.servicio.id) || r.servicio;
          const clienteNombre = [r.cliente?.nombre, r.cliente?.apellido]
            .filter(Boolean)
            .join(' ') || 'Cliente';
          const empleadoNombre = [r.empleado?.nombre, r.empleado?.apellido]
            .filter(Boolean)
            .join(' ') || '';
          items.push({
            type: 'reserva',
            hora: r.horaInicio.substring(0, 5),
            horaFin: r.horaFin.substring(0, 5),
            servicio,
            cliente: clienteNombre,
            empleado: empleadoNombre,
            reserva: r,
          });
        }
      } else {
        items.push({
          type: 'disponible',
          hora: this.minutesToStr(start),
          horaFin: this.minutesToStr(end),
        });
      }

      rows.push({
        hora: this.minutesToStr(start),
        horaFin: this.minutesToStr(end),
        items,
      });
    }

    return rows;
  });

  totalOcupados = computed(() => {
    let count = 0;
    for (const row of this.timeline()) {
      for (const item of row.items) {
        if (item.type === 'reserva') count++;
      }
    }
    return count;
  });

  totalDisponibles = computed(() => this.timeline().filter((r) => r.items.length === 1 && r.items[0].type === 'disponible').length);

  ngOnInit(): void {
    this.cargarDatos();
    if (typeof window !== 'undefined') {
      window.addEventListener(SUCURSAL_UPDATED, this.sucursalUpdateHandler);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener(SUCURSAL_UPDATED, this.sucursalUpdateHandler);
    }
  }

  cargarDatos(): void {
    const empresa = this.authService.empresa();
    const sucursal = this.authService.sucursalActual();
    if (!empresa || !sucursal) return;

    this.cargando.set(true);

    this.serviciosService.getByEmpresa(empresa.id).subscribe({
      next: (servicios) => {
        this.servicios.set(servicios.filter((s) => s.activo));
      },
      error: () => this.servicios.set([]),
    });

    this.horariosService.getBySucursal(sucursal.id).subscribe({
      next: (horarios) => this.horarios.set(horarios),
      error: () => this.horarios.set([]),
    });

    this.cargarReservas();
  }

  cargarReservas(): void {
    const sucursal = this.authService.sucursalActual();
    if (!sucursal) return;

    this.reservarService.getReservasBySucursal(sucursal.id).subscribe({
      next: (reservas) => {
        this.reservas.set(reservas);
        this.cargando.set(false);
      },
      error: () => {
        this.reservas.set([]);
        this.cargando.set(false);
      },
    });
  }

  diaAnterior(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() - 1);
    this.selectedDate.set(d);
  }

  diaSiguiente(): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + 1);
    this.selectedDate.set(d);
  }

  getLinkReserva(): string {
    const empresa = this.authService.empresa();
    const sucursal = this.authService.sucursalActual();
    if (!empresa || !sucursal) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/reservar/${empresa.slug}/${sucursal.id}`;
  }

  copiarLink(): void {
    const link = this.getLinkReserva();
    if (!link) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        this.linkCopiado.set(true);
        setTimeout(() => this.linkCopiado.set(false), 2500);
      });
    }
  }

  abrirModalPago(reserva: Reserva): void {
    this.reservaSeleccionada.set(reserva);
    this.montoPago.set(reserva.precio || 0);
    this.metodoPago.set('Efectivo');
    this.codigoTransaccion.set('');
    this.pagoExitoso.set(false);
    this.pagoError.set('');
    this.pagoSeleccionado.set(null);
    this.nuevoEstadoPago.set('');
    this.estadoActualizado.set(false);
    this.nuevoEstadoReserva.set(reserva.estado?.id?.toString() || '');
    this.estadoReservaActualizado.set(false);
    this.modalPagoAbierto.set(true);
  }

  cerrarModalPago(): void {
    this.modalPagoAbierto.set(false);
    this.reservaSeleccionada.set(null);
    this.pagoSeleccionado.set(null);
  }

  actualizarEstadoReserva(): void {
    const reserva = this.reservaSeleccionada();
    const estadoId = Number(this.nuevoEstadoReserva());
    if (!reserva || !estadoId || this.actualizandoEstadoReserva()) return;

    this.actualizandoEstadoReserva.set(true);
    this.reservarService.actualizarEstadoReserva(reserva.id, estadoId).subscribe({
      next: () => {
        this.actualizandoEstadoReserva.set(false);
        this.estadoReservaActualizado.set(true);
        this.cargarReservas();
      },
      error: () => {
        this.actualizandoEstadoReserva.set(false);
        this.pagoError.set('Error al actualizar el estado de la reserva');
      },
    });
  }

  tienePago(reserva: Reserva): boolean {
    return !!(reserva.pagos && reserva.pagos.length > 0);
  }

  seleccionarPago(pago: PagoReserva): void {
    this.pagoSeleccionado.set(pago);
    this.nuevoEstadoPago.set('');
    this.estadoActualizado.set(false);
  }

  cerrarDetallePago(): void {
    this.pagoSeleccionado.set(null);
    this.estadoActualizado.set(false);
  }

  actualizarEstadoPago(): void {
    const pago = this.pagoSeleccionado();
    const estadoId = Number(this.nuevoEstadoPago());
    if (!pago || !estadoId || this.actualizandoEstado()) return;

    this.actualizandoEstado.set(true);
    this.pagosService.actualizarEstado(pago.id, estadoId).subscribe({
      next: () => {
        this.actualizandoEstado.set(false);
        this.estadoActualizado.set(true);
        this.cargarReservas();
        setTimeout(() => {
          this.cerrarDetallePago();
        }, 1200);
      },
      error: () => {
        this.actualizandoEstado.set(false);
        this.pagoError.set('Error al actualizar el estado');
      },
    });
  }

  guardarPago(): void {
    const reserva = this.reservaSeleccionada();
    if (!reserva || this.guardandoPago()) return;

    this.guardandoPago.set(true);
    this.pagoError.set('');

    const now = new Date();
    const fechaPago = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    this.pagosService.crear({
      reservaId: reserva.id,
      monto: this.montoPago(),
      metodoPago: this.metodoPago(),
      codigoTransaccion: this.codigoTransaccion(),
      fechaPago,
      estadoId: 1,
    }).subscribe({
      next: () => {
        this.guardandoPago.set(false);
        this.pagoExitoso.set(true);
        this.cargarReservas();
        setTimeout(() => this.cerrarModalPago(), 1500);
      },
      error: () => {
        this.guardandoPago.set(false);
        this.pagoError.set('Error al guardar el pago');
      },
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToStr(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
