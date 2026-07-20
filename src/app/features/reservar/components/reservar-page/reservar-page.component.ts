import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReservarPublicService } from '../../services/reservar-public.service';
import { Empresa } from '../../../../core/interfaces/empresa.interface';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import { Servicio } from '../../../../core/interfaces/servicio.interface';
import { Empleado } from '../../../../core/interfaces/empleado.interface';
import { HorarioSucursal } from '../../../admin/interfaces/horario-sucursal.interface';
import { BloqueoAgenda } from '../../../../core/interfaces/bloqueo-agenda.interface';
import { ServicioEmpleado } from '../../../../core/interfaces/servicio-empleado.interface';
import { ConfiguracionEmpresa } from '../../../../core/interfaces/configuracion-empresa.interface';
import { ReservarFormComponent } from '../reservar-form/reservar-form.component';
import { ReservarConfirmacionComponent } from '../reservar-confirmacion/reservar-confirmacion.component';

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

  empresa = signal<Empresa | null>(null);
  sucursal = signal<Sucursal | null>(null);
  servicios = signal<Servicio[]>([]);
  empleados = signal<Empleado[]>([]);
  horarios = signal<HorarioSucursal[]>([]);
  bloqueos = signal<BloqueoAgenda[]>([]);
  serviciosEmpleados = signal<ServicioEmpleado[]>([]);
  configuracion = signal<ConfiguracionEmpresa | null>(null);
  cargando = signal(true);
  reservaConfirmada = signal(false);
  reservaCodigo = signal('');
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
        console.log('Empresa por slug:', slug, empresa);
        if (!empresa) {
          this.cargando.set(false);
          this.error.set('Empresa no encontrada.');
          return;
        }
        this.empresa.set(empresa);
        this.cargarSucursal(sucursalId);
      },
      error: (err) => {
        console.error('Error al buscar empresa:', err);
        this.cargando.set(false);
        this.error.set('Error al cargar la empresa.');
      },
    });
  }

  private cargarSucursal(sucursalId: number): void {
    this.reservarService.getSucursal(sucursalId).subscribe({
      next: (sucursal) => {
        console.log('Sucursal:', sucursalId, sucursal);
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
    }).subscribe({
      next: (data) => {
        console.log('Servicios:', data.servicios);
        console.log('Empleados:', data.empleados);
        console.log('Horarios:', data.horarios);
        console.log('Bloqueos:', data.bloqueos);
        console.log('ServiciosEmpleados:', data.serviciosEmpleados);
        console.log('ServiciosEmpleados:', data.serviciosEmpleados);
        this.servicios.set(data.servicios);
        this.empleados.set(data.empleados);
        this.horarios.set(data.horarios);
        this.bloqueos.set(data.bloqueos);
        this.serviciosEmpleados.set(data.serviciosEmpleados);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error en forkJoin reservar:', err);
        this.cargando.set(false);
        this.error.set('Error al cargar los datos de la sucursal.');
      },
    });
  }

  onReservaConfirmada(codigo: string): void {
    this.reservaCodigo.set(codigo);
    this.reservaConfirmada.set(true);
  }

  formatearDireccion(): string {
    const s = this.sucursal();
    if (!s) return '';
    return [s.direccion, s.comuna, s.ciudad].filter(Boolean).join(', ');
  }
}
