import { Component, PLATFORM_ID, inject, signal, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OcupacionReserva, ReservarPublicService } from '../../services/reservar-public.service';
import { Empresa } from '../../../../core/interfaces/empresa.interface';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { HorarioSucursal } from '../../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../../core/interfaces/servicio-empleado.interface';
import { ConfiguracionEmpresa } from '../../../../core/interfaces/configuracion-empresa.interface';
import { ReservaConPago, ReservarFormComponent } from '../reservar-form/reservar-form.component';
import { ReservaPagoContextoService } from '../../services/reserva-pago-contexto.service';
import { ReservarConfirmacionComponent } from '../reservar-confirmacion/reservar-confirmacion.component';
import { ReservaResumen } from '../../interfaces/reserva-resumen.interface';

@Component({
  selector: 'app-reservar-page',
  standalone: true,
  imports: [ReservarFormComponent, ReservarConfirmacionComponent],
  templateUrl: './reservar-page.component.html',
  styleUrl: './reservar-page.component.scss',
})
export class ReservarPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reservarService = inject(ReservarPublicService);
  private pagoContexto = inject(ReservaPagoContextoService);
  private platformId = inject(PLATFORM_ID);

  empresa = signal<Empresa | null>(null);
  sucursal = signal<Sucursal | null>(null);
  servicios = signal<Servicio[]>([]);
  empleados = signal<Empleado[]>([]);
  horarios = signal<HorarioSucursal[]>([]);
  bloqueos = signal<BloqueoAgenda[]>([]);
  ocupacion = signal<OcupacionReserva[]>([]);
  serviciosEmpleados = signal<ServicioEmpleado[]>([]);
  configuracion = signal<ConfiguracionEmpresa | null>(null);
  cargando = signal(true);
  reservaConfirmada = signal(false);
  reservaResumen = signal<ReservaResumen | null>(null);
  error = signal('');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('empresaSlug') || '';
    const sucursalId = Number(this.route.snapshot.paramMap.get('sucursalId'));

    if (!slug || !sucursalId) {
      this.cargando.set(false);
      this.error.set('Link de reserva invalido.');
      return;
    }

    this.reservarService.getEmpresaBySlug(slug).subscribe({
      next: (empresa) => {
        if (!empresa) {
          this.cargando.set(false);
          this.error.set('Empresa no encontrada.');
          return;
        }
        this.empresa.set(empresa);
        this.cargarSucursal(sucursalId);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Error al cargar la empresa.');
      },
    });
  }

  private cargarSucursal(sucursalId: number): void {
    this.reservarService.getSucursal(sucursalId).subscribe({
      next: (sucursal) => {
        if (!sucursal) {
          this.cargando.set(false);
          this.error.set('Sucursal no encontrada.');
          return;
        }
        this.sucursal.set(sucursal);
        this.cargarDatos(sucursalId);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Error al cargar la sucursal.');
      },
    });
  }

  private cargarDatos(sucursalId: number): void {
    const empresaId = this.empresa()!.id;

    forkJoin({
      servicios: this.reservarService.getServiciosByEmpresa(empresaId),
      empleados: this.reservarService.getEmpleadosBySucursal(sucursalId),
      horarios: this.reservarService.getHorariosBySucursal(sucursalId),
      bloqueos: this.reservarService.getBloqueosBySucursal(sucursalId),
      serviciosEmpleados: this.reservarService.getServiciosEmpleados(sucursalId),
      ocupacion: this.reservarService.getOcupacion(sucursalId),
    }).subscribe({
      next: (data) => {
        this.servicios.set(data.servicios);
        this.empleados.set(data.empleados);
        this.horarios.set(data.horarios);
        this.bloqueos.set(data.bloqueos);
        this.serviciosEmpleados.set(data.serviciosEmpleados);
        this.ocupacion.set(data.ocupacion);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Error al cargar los datos de la sucursal.');
      },
    });
  }

  onReservaConfirmada(resumen: ReservaResumen): void {
    this.reservaResumen.set(resumen);
    this.reservaConfirmada.set(true);
  }

  /**
   * SPEC 06: la reserva quedó Pendiente con un cobro en Flow. Se guarda lo necesario para la
   * página de resultado (/reserva/pago) y el navegador se va a Flow.
   */
  onPagoIniciado({ resumen, pago }: ReservaConPago): void {
    const empresa = this.empresa();
    const sucursal = this.sucursal();
    if (empresa && sucursal) {
      this.pagoContexto.guardar({
        resumen,
        empresaSlug: empresa.slug,
        sucursalId: sucursal.id,
        empresaNombre: empresa.nombreComercial || empresa.nombre,
        sucursalNombre: sucursal.nombre || '',
        direccion: this.formatearDireccion(),
      });
    }
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = pago.urlPago;
    }
  }

  /** SPEC 06: 409 al reservar. La hora se tomó: se vuelve a pedir la ocupación. */
  recargarOcupacion(): void {
    const sucursalId = this.sucursal()?.id;
    if (!sucursalId) return;
    this.reservarService.getOcupacion(sucursalId).subscribe({
      next: (ocupacion) => this.ocupacion.set(ocupacion),
      error: () => {
        // Sin ocupación nueva, la API vuelve a rechazar la hora tomada si se intenta otra vez.
      },
    });
  }

  formatearDireccion(): string {
    const s = this.sucursal();
    if (!s) return '';
    return [s.direccion, s.comuna, s.ciudad].filter(Boolean).join(', ');
  }
}
