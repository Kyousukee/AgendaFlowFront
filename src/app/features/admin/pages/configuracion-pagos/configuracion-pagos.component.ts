import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import {
  ApiErrorBody,
  CredencialesFlow,
  CuentaFlowSucursal,
  CuentasFlowEmpresa,
} from '../../../../core/interfaces/configuracion-empresa.interface';
import { ConfiguracionEmpresaService } from '../../services/configuracion-empresa.service';

/** Sitio de Flow, donde el negocio inicia sesión para ver sus llaves. */
export const FLOW_AYUDA_URL = 'https://www.flow.cl';

/**
 * SPEC 06: cuentas Flow que reciben los abonos de las reservas. La del negocio la usan todas las
 * sucursales, salvo las que tienen cuenta propia. La Secret Key solo viaja en el PUT: el
 * formulario se vacía al enviarla y la API nunca la devuelve.
 */
@Component({
  selector: 'app-configuracion-pagos',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './configuracion-pagos.component.html',
  // Reusa las secciones, campos y pestañas de Configuración.
  styleUrls: [
    '../configuracion/configuracion.component.scss',
    './configuracion-pagos.component.scss',
  ],
})
export class ConfiguracionPagosComponent implements OnInit {
  private configService = inject(ConfiguracionEmpresaService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly ayudaUrl = FLOW_AYUDA_URL;

  cuentas = signal<CuentasFlowEmpresa | null>(null);
  cargando = signal(true);
  errorCarga = signal(false);

  /** Acción en curso: 'empresa' o el id de la sucursal. */
  ocupado = signal<'empresa' | number | null>(null);
  editandoEmpresa = signal(false);
  confirmarQuitarEmpresa = signal(false);
  /** Sucursal con el formulario de cuenta propia abierto. */
  editandoSucursal = signal<number | null>(null);

  formEmpresa = this.crearFormulario();
  formSucursal = this.crearFormulario();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.configService.obtenerCuentasFlow().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorCarga.set(true);
      },
    });
  }

  /** Activa y sin cuenta: sus reservas se crean sin pago y bloquea activar el cobro al reservar. */
  sinCuenta(sucursal: CuentaFlowSucursal): boolean {
    return sucursal.activa && !sucursal.cuentaPropia && !sucursal.usaCuentaEmpresa;
  }

  nombreSucursal(sucursal: CuentaFlowSucursal): string {
    return sucursal.nombre || `Sucursal ${sucursal.sucursalId}`;
  }

  // ---- Cuenta del negocio ----

  abrirFormEmpresa(): void {
    this.formEmpresa.reset();
    this.editandoEmpresa.set(true);
  }

  cancelarFormEmpresa(): void {
    this.formEmpresa.reset();
    this.editandoEmpresa.set(false);
  }

  guardarEmpresa(): void {
    const credenciales = this.leerCredenciales(this.formEmpresa);
    if (!credenciales || this.ocupado()) return;

    this.ejecutar(
      'empresa',
      this.configService.guardarCuentaFlowEmpresa(credenciales),
      'Cuenta Flow del negocio guardada',
      () => {
        this.formEmpresa.reset();
        this.editandoEmpresa.set(false);
      },
    );
  }

  quitarEmpresa(): void {
    if (this.ocupado()) return;
    this.ejecutar(
      'empresa',
      this.configService.quitarCuentaFlowEmpresa(),
      'Cuenta Flow del negocio quitada',
      () => this.confirmarQuitarEmpresa.set(false),
    );
  }

  // ---- Cuentas de las sucursales ----

  abrirFormSucursal(sucursalId: number): void {
    this.formSucursal.reset();
    this.editandoSucursal.set(sucursalId);
  }

  cancelarFormSucursal(): void {
    this.formSucursal.reset();
    this.editandoSucursal.set(null);
  }

  guardarSucursal(sucursal: CuentaFlowSucursal): void {
    const credenciales = this.leerCredenciales(this.formSucursal);
    if (!credenciales || this.ocupado()) return;

    this.ejecutar(
      sucursal.sucursalId,
      this.configService.guardarCuentaFlowSucursal(sucursal.sucursalId, credenciales),
      `${this.nombreSucursal(sucursal)} usa ahora su propia cuenta Flow`,
      () => this.cancelarFormSucursal(),
    );
  }

  volverACuentaEmpresa(sucursal: CuentaFlowSucursal): void {
    if (this.ocupado()) return;
    this.ejecutar(
      sucursal.sucursalId,
      this.configService.quitarCuentaFlowSucursal(sucursal.sucursalId),
      `${this.nombreSucursal(sucursal)} vuelve a usar la cuenta del negocio`,
    );
  }

  campoInvalido(form: typeof this.formEmpresa, campo: 'apiKey' | 'secretKey'): boolean {
    const control = form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  private crearFormulario() {
    return this.fb.nonNullable.group({
      apiKey: ['', [Validators.required, Validators.maxLength(100)]],
      secretKey: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  private leerCredenciales(form: typeof this.formEmpresa): CredencialesFlow | null {
    if (form.invalid) {
      form.markAllAsTouched();
      return null;
    }
    const { apiKey, secretKey } = form.getRawValue();
    return { apiKey: apiKey.trim(), secretKey: secretKey.trim() };
  }

  private ejecutar(
    clave: 'empresa' | number,
    peticion: Observable<unknown>,
    exito: string,
    alTerminar?: () => void,
  ): void {
    this.ocupado.set(clave);
    peticion.subscribe({
      next: () => {
        this.ocupado.set(null);
        alTerminar?.();
        this.snackBar.open(exito, 'Cerrar', { duration: 4000 });
        this.cargar();
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        // La Secret Key no se conserva en pantalla aunque falle: se vuelve a escribir.
        this.formEmpresa.controls.secretKey.reset();
        this.formSucursal.controls.secretKey.reset();
        this.snackBar.open(this.mensajeError(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private mensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 503) {
        return 'No se pueden guardar cuentas Flow por ahora. Inténtalo más tarde.';
      }
      if (err.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }
      const body = err.error as ApiErrorBody | null;
      const detalle = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
      if (detalle) return detalle;
    }
    return 'No pudimos guardar el cambio. Inténtalo de nuevo.';
  }
}
