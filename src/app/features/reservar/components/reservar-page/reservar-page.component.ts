import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('empresaSlug') || '';
    const sucursalId = Number(this.route.snapshot.paramMap.get('sucursalId'));

    if (!slug || !sucursalId) {
      this.cargando.set(false);
      return;
    }

    this.reservarService.getEmpresaBySlug(slug).subscribe((empresa) => {
      if (!empresa) {
        this.cargando.set(false);
        return;
      }
      this.empresa.set(empresa);

      this.reservarService.getSucursal(sucursalId).subscribe((sucursal) => {
        if (!sucursal) {
          this.cargando.set(false);
          return;
        }
        this.sucursal.set(sucursal);

        this.reservarService.getServiciosByEmpresa(empresa.id).subscribe((servicios) => {
          this.servicios.set(servicios);
        });

        this.reservarService.getEmpleadosBySucursal(sucursalId).subscribe((empleados) => {
          this.empleados.set(empleados);

          const empleadoIds = empleados.map((e) => e.id);
          this.reservarService.getBloqueosBySucursal(empleadoIds).subscribe((bloqueos) => {
            this.bloqueos.set(bloqueos);
          });
        });

        this.reservarService.getHorariosBySucursal(sucursalId).subscribe((horarios) => {
          this.horarios.set(horarios);
        });

        this.reservarService.getServiciosEmpleados(sucursalId).subscribe((se) => {
          this.serviciosEmpleados.set(se);
          this.cargando.set(false);
        });
      });
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
