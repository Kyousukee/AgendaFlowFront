import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import {
  DIAS_POR_PAGO,
  PRECIO_PRO_TEXTO,
  PagoSuscripcionService,
} from '../../../../core/services/pago-suscripcion.service';
import {
  PagoMensualidad,
  RecursoLimitado,
  SuscripcionLimiteError,
} from '../../../../core/interfaces/suscripcion.interface';
import {
  ApiErrorBody,
  TipoAnticipo,
} from '../../../../core/interfaces/configuracion-empresa.interface';
import { ConfiguracionEmpresaService } from '../../services/configuracion-empresa.service';

const LOGO_TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const LOGO_TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

/** SPEC 06: error al guardar el anticipo, mostrado junto a la sección de pagos. */
interface ErrorAnticipo {
  mensaje: string;
  /** 'plan': el plan no incluye pagos online. 'cuentas': faltan cuentas Flow. */
  tipo: 'plan' | 'cuentas' | 'otro';
}

const entero: ValidatorFn = (control) =>
  control.value === null || Number.isInteger(Number(control.value)) ? null : { entero: true };

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
    RouterLink,
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
  pagoSuscripcion = inject(PagoSuscripcionService);

  // SPEC 06: mensualidad Pro
  readonly precioPro = PRECIO_PRO_TEXTO;
  readonly diasPorPago = DIAS_POR_PAGO;
  pagosMensualidad = signal<PagoMensualidad[]>([]);
  cargandoPagosMensualidad = signal(true);

  // SPEC 06: anticipo
  readonly tiposAnticipo: { valor: TipoAnticipo; etiqueta: string }[] = [
    { valor: 'Monto', etiqueta: 'Monto fijo' },
    { valor: 'Porcentaje', etiqueta: 'Porcentaje del servicio' },
    { valor: 'Completo', etiqueta: 'Servicio completo' },
  ];
  errorAnticipo = signal<ErrorAnticipo | null>(null);

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
    // SPEC 08: las invitaciones pendientes también cuentan.
    { clave: 'recepcionistas', etiqueta: 'Recepcionistas' },
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
    pagoObligatorio: [true],
    tipoAnticipo: this.fb.control<TipoAnticipo | null>('Porcentaje'),
    montoAnticipo: [0],
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

    this.form.controls.permitePagoAnticipado.valueChanges.subscribe(() =>
      this.actualizarControlesAnticipo(),
    );
    this.form.controls.tipoAnticipo.valueChanges.subscribe(() =>
      this.actualizarControlesAnticipo(),
    );

    this.cargarPagosMensualidad();
  }

  /** SPEC 06: el monto solo aplica en Monto (CLP entero) y en Porcentaje (1–100). */
  get muestraMontoAnticipo(): boolean {
    const tipo = this.form.controls.tipoAnticipo.value;
    return (
      this.form.controls.permitePagoAnticipado.value && (tipo === 'Monto' || tipo === 'Porcentaje')
    );
  }

  private actualizarControlesAnticipo(): void {
    const { permitePagoAnticipado, tipoAnticipo, montoAnticipo, pagoObligatorio } =
      this.form.controls;
    const activo = permitePagoAnticipado.value;
    const sinEvento = { emitEvent: false };

    if (activo) {
      tipoAnticipo.enable(sinEvento);
      pagoObligatorio.enable(sinEvento);
      if (!tipoAnticipo.value) tipoAnticipo.setValue('Porcentaje', sinEvento);
    } else {
      tipoAnticipo.disable(sinEvento);
      pagoObligatorio.disable(sinEvento);
    }

    const tipo = tipoAnticipo.value;
    if (activo && tipo === 'Monto') {
      montoAnticipo.setValidators([Validators.required, Validators.min(1), entero]);
      montoAnticipo.enable(sinEvento);
    } else if (activo && tipo === 'Porcentaje') {
      montoAnticipo.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        entero,
      ]);
      montoAnticipo.enable(sinEvento);
    } else {
      montoAnticipo.clearValidators();
      montoAnticipo.disable(sinEvento);
    }
    montoAnticipo.updateValueAndValidity(sinEvento);
    this.errorAnticipo.set(null);
  }

  private cargarPagosMensualidad(): void {
    this.cargandoPagosMensualidad.set(true);
    this.pagoSuscripcion.historial().subscribe({
      next: (pagos) => {
        this.pagosMensualidad.set(pagos);
        this.cargandoPagosMensualidad.set(false);
      },
      error: () => {
        this.pagosMensualidad.set([]);
        this.cargandoPagosMensualidad.set(false);
      },
    });
  }

  claseEstadoPago(pago: PagoMensualidad): string {
    return (pago.estado?.nombre ?? '').toLowerCase();
  }

  formatearPrecio(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(monto);
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
          pagoObligatorio: config.pagoObligatorio ?? true,
          tipoAnticipo: config.tipoAnticipo ?? 'Porcentaje',
          montoAnticipo: config.montoAnticipo,
          tiempoCancelacionHoras: config.tiempoCancelacionHoras,
          tiempoReservaMinutos: config.tiempoReservaMinutos,
          permiteSeleccionEmpleado: config.permiteSeleccionEmpleado,
          mostrarPrecios: config.mostrarPrecios,
          enviarCorreo: config.enviarCorreo,
          enviarWhatsapp: config.enviarWhatsapp,
        });

        this.actualizarControlesAnticipo();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorAnticipo.set(null);
    const formValue = this.form.getRawValue();

    const data = {
      permitePagoAnticipado: formValue.permitePagoAnticipado,
      pagoObligatorio: formValue.pagoObligatorio,
      tipoAnticipo: formValue.tipoAnticipo,
      montoAnticipo: Number(formValue.montoAnticipo) || 0,
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
      error: (err: unknown) => {
        this.guardando.set(false);
        const errorAnticipo = this.leerErrorAnticipo(err);
        if (errorAnticipo) {
          this.errorAnticipo.set(errorAnticipo);
          return;
        }
        this.snackBar.open('No pudimos guardar la configuración. Tus cambios siguen en pantalla: inténtalo de nuevo.', 'Cerrar', { duration: 8000 });
      },
    });
  }

  /** SPEC 06: 403 pagosOnline (el plan no lo incluye) y 400 (validación o sucursales sin cuenta). */
  private leerErrorAnticipo(err: unknown): ErrorAnticipo | null {
    if (!(err instanceof HttpErrorResponse)) return null;
    if (err.status === 403 && err.error?.code === 'SUSCRIPCION_LIMITE') {
      const body = err.error as SuscripcionLimiteError;
      return { mensaje: body.message, tipo: 'plan' };
    }
    if (err.status === 400) {
      const body = err.error as (ApiErrorBody & { sucursalesSinCuenta?: unknown[] }) | null;
      const mensaje = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
      const faltanCuentas = !!body?.sucursalesSinCuenta || /flow/i.test(mensaje ?? '');
      return {
        mensaje: mensaje || 'Revisa la configuración del cobro al reservar.',
        tipo: faltanCuentas ? 'cuentas' : 'otro',
      };
    }
    return null;
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
