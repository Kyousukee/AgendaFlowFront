import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { RecursoLimitado } from '../../../../core/interfaces/suscripcion.interface';
import { ApiErrorBody } from '../../../../core/interfaces/configuracion-empresa.interface';
import { ConfiguracionEmpresaService } from '../../services/configuracion-empresa.service';

const LOGO_TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const LOGO_TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent {
  private authService = inject(AuthService);
  private configService = inject(ConfiguracionEmpresaService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  suscripcion = inject(SuscripcionService);

  // Logo de la empresa
  readonly logoAccept = LOGO_TIPOS_PERMITIDOS.join(',');
  empresa = this.authService.empresa;
  logoArchivo = signal<File | null>(null);
  logoPreview = signal<string | null>(null);
  logoError = signal('');
  logoSubiendo = signal(false);
  logoEliminando = signal(false);
  logoConfirmarEliminar = signal(false);
  logoArrastrando = signal(false);
  logoUrlSubida = signal<string | null>(null);
  logoMostrado = computed(() => this.logoPreview() ?? this.empresa()?.logo ?? null);
  logoOcupado = computed(() => this.logoSubiendo() || this.logoEliminando());
  nombreEmpresa = computed(
    () => this.empresa()?.nombreComercial || this.empresa()?.nombre || 'Empresa',
  );

  readonly recursos: { clave: RecursoLimitado; etiqueta: string }[] = [
    { clave: 'sucursales', etiqueta: 'Sucursales' },
    { clave: 'empleados', etiqueta: 'Empleados' },
    { clave: 'servicios', etiqueta: 'Servicios' },
  ];

  porcentajeUso(uso: number, limite: number): number {
    return limite > 0 ? Math.min(100, (uso / limite) * 100) : 100;
  }

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
    inject(DestroyRef).onDestroy(() => this.liberarPreview());

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
      // SPEC 04 (TS mínimo autorizado): el guardado fallido se avisa.
      error: () => {
        this.guardando.set(false);
        this.snackBar.open('No pudimos guardar la configuración. Tus cambios siguen en pantalla: inténtalo de nuevo.', 'Cerrar', { duration: 8000 });
      },
    });
  }

  // ---- Logo ----

  onLogoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Se limpia para que volver a elegir el mismo archivo dispare `change` otra vez.
    input.value = '';
    if (file) this.prepararLogo(file);
  }

  onLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.logoOcupado()) this.logoArrastrando.set(true);
  }

  onLogoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.logoArrastrando.set(false);
  }

  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.logoArrastrando.set(false);
    if (this.logoOcupado()) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.prepararLogo(file);
  }

  private prepararLogo(file: File): void {
    const error = this.validarLogo(file);
    if (error) {
      this.logoError.set(error);
      return;
    }
    this.logoError.set('');
    this.logoConfirmarEliminar.set(false);
    this.liberarPreview();
    this.logoArchivo.set(file);
    this.logoPreview.set(URL.createObjectURL(file));
  }

  private validarLogo(file: File): string {
    if (!LOGO_TIPOS_PERMITIDOS.includes(file.type)) {
      return 'Formato no permitido. Usa una imagen PNG, JPG o WEBP (SVG no está permitido).';
    }
    if (file.size > LOGO_TAMANO_MAXIMO) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `El archivo pesa ${mb} MB. El tamaño máximo es 2 MB.`;
    }
    return '';
  }

  cancelarLogo(): void {
    this.liberarPreview();
    this.logoArchivo.set(null);
    this.logoError.set('');
  }

  subirLogo(): void {
    const file = this.logoArchivo();
    if (!file || this.logoOcupado()) return;

    this.logoSubiendo.set(true);
    this.configService.uploadEmpresaLogo(file).subscribe({
      next: ({ logo }) => {
        this.authService.actualizarEmpresa({ logo });
        this.logoUrlSubida.set(logo);
        this.liberarPreview();
        this.logoArchivo.set(null);
        this.logoSubiendo.set(false);
        this.snackBar.open('Logo actualizado', 'Cerrar', { duration: 4000 });
      },
      error: (err: unknown) => {
        this.logoSubiendo.set(false);
        this.notificarError(err, 'No se pudo subir el logo.');
      },
    });
  }

  eliminarLogo(): void {
    if (this.logoOcupado()) return;

    this.logoEliminando.set(true);
    this.configService.deleteEmpresaLogo().subscribe({
      next: () => {
        this.authService.actualizarEmpresa({ logo: null });
        this.logoUrlSubida.set(null);
        this.logoConfirmarEliminar.set(false);
        this.logoEliminando.set(false);
        this.snackBar.open('Logo eliminado', 'Cerrar', { duration: 4000 });
      },
      error: (err: unknown) => {
        this.logoEliminando.set(false);
        this.notificarError(err, 'No se pudo eliminar el logo.');
      },
    });
  }

  private liberarPreview(): void {
    const url = this.logoPreview();
    if (url) URL.revokeObjectURL(url);
    this.logoPreview.set(null);
  }

  private notificarError(err: unknown, porDefecto: string): void {
    let mensaje = porDefecto;
    if (err instanceof HttpErrorResponse) {
      const body = err.error as ApiErrorBody | null;
      const detalle = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
      if (detalle) {
        mensaje = detalle;
      } else if (err.status === 0) {
        mensaje = 'No se pudo conectar con el servidor.';
      } else if (err.status === 403) {
        mensaje = 'Solo un administrador puede cambiar el logo.';
      }
    }
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
  }
}
