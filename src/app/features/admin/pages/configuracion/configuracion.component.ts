import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfiguracionEmpresaService } from '../../services/configuracion-empresa.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent {
  private authService = inject(AuthService);
  private configService = inject(ConfiguracionEmpresaService);
  private fb = inject(FormBuilder);

  guardando = signal(false);
  cargando = signal(true);
  guardado = signal(false);
  private lastEmpresaId = 0;

  form = this.fb.nonNullable.group({
    permitePagoAnticipado: [false],
    tipoAnticipo: ['Porcentaje'],
    montoAnticipo: [0, [Validators.min(0)]],
    tiempoCancelacionHoras: [24, [Validators.min(0)]],
    tiempoReservaMinutos: [30, [Validators.min(5)]],
    permiteSeleccionEmpleado: [true],
    mostrarPrecios: [true],
    enviarCorreo: [true],
    enviarWhatsapp: [false],
  });

  configuracionId = 0;

  constructor() {
    effect(() => {
      const emp = this.authService.empresa();
      const empresaId = emp?.id ?? 0;
      if (empresaId && empresaId !== this.lastEmpresaId) {
        this.lastEmpresaId = empresaId;
        this.cargarConfiguracion();
      }
    });

    this.form.get('permitePagoAnticipado')?.valueChanges.subscribe((value) => {
      const montoControl = this.form.get('montoAnticipo');
      const tipoControl = this.form.get('tipoAnticipo');
      if (value) {
        montoControl?.enable();
        tipoControl?.enable();
      } else {
        montoControl?.disable();
        tipoControl?.disable();
      }
    });
  }

  cargarConfiguracion(): void {
    const empresaId = this.authService.empresa()?.id;
    if (!empresaId) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.configService.obtener().subscribe({
      next: (config) => {
        this.configuracionId = config.id;
        this.form.patchValue({
          permitePagoAnticipado: config.permitePagoAnticipado,
          tipoAnticipo: config.tipoAnticipo,
          montoAnticipo: config.montoAnticipo,
          tiempoCancelacionHoras: config.tiempoCancelacionHoras,
          tiempoReservaMinutos: config.tiempoReservaMinutos,
          permiteSeleccionEmpleado: config.permiteSeleccionEmpleado,
          mostrarPrecios: config.mostrarPrecios,
          enviarCorreo: config.enviarCorreo,
          enviarWhatsapp: config.enviarWhatsapp,
        });

        if (!config.permitePagoAnticipado) {
          this.form.get('montoAnticipo')?.disable();
          this.form.get('tipoAnticipo')?.disable();
        }

        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);
    const formValue = this.form.getRawValue();

    const data = {
      permitePagoAnticipado: formValue.permitePagoAnticipado,
      tipoAnticipo: formValue.tipoAnticipo,
      montoAnticipo: formValue.montoAnticipo,
      tiempoCancelacionHoras: formValue.tiempoCancelacionHoras,
      tiempoReservaMinutos: formValue.tiempoReservaMinutos,
      permiteSeleccionEmpleado: formValue.permiteSeleccionEmpleado,
      mostrarPrecios: formValue.mostrarPrecios,
      enviarCorreo: formValue.enviarCorreo,
      enviarWhatsapp: formValue.enviarWhatsapp,
    };

    const request$ = this.configuracionId > 0
      ? this.configService.actualizar(data)
      : this.configService.crear(data);

    request$.subscribe({
      next: (config) => {
        this.configuracionId = config.id;
        this.guardando.set(false);
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 3000);
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }
}
