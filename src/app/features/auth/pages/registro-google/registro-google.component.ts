import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, MENSAJE_GOOGLE_INVALIDO } from '../../../../core/services/auth.service';
import { GoogleIdentityService } from '../../../../core/services/google-identity.service';
import { ErrorAutenticacion } from '../../../../core/errors/error-autenticacion';
import { GoogleRegistroRequest } from '../../../../core/interfaces/google-auth.interface';
import { AccesoGoogleComponent } from '../../components/acceso-google/acceso-google.component';
import { NegocioFieldsComponent } from '../../components/negocio-fields/negocio-fields.component';
import { SucursalFieldsComponent } from '../../components/sucursal-fields/sucursal-fields.component';
import { crearFormNegocio, crearFormSucursal, datosNegocio } from '../../forms/datos-negocio.form';

/**
 * Registro con Google: la cuenta ya está validada por Google, falta el negocio.
 * El `credential` vive solo en memoria (`AuthService.registroGoogle`): si se recarga la página
 * se pierde y el usuario vuelve a /register a pasar otra vez por Google.
 */
@Component({
  selector: 'app-registro-google',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AccesoGoogleComponent,
    NegocioFieldsComponent,
    SucursalFieldsComponent,
  ],
  templateUrl: './registro-google.component.html',
  styleUrl: './registro-google.component.scss',
})
export class RegistroGoogleComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  protected google = inject(GoogleIdentityService);

  readonly totalSteps = 3;

  currentStep = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  /** El `credential` venció o no es válido (401): hay que volver a pasar por Google. */
  reautenticar = signal(false);
  /** El error se corrige en los datos (409, 400): se ofrece volver al primer paso. */
  revisarDatos = signal(false);

  email = computed(() => this.auth.registroGoogle()?.perfil.email ?? '');

  datosForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: [''],
    // SPEC 04: sin aceptar términos y privacidad no se crea la cuenta.
    terms: [false, [Validators.requiredTrue]],
  });
  businessForm = crearFormNegocio(this.fb.nonNullable);
  branchForm = crearFormSucursal(this.fb.nonNullable);

  constructor() {
    const pendiente = this.auth.registroGoogle();
    if (!pendiente) {
      this.router.navigate(['/register'], { replaceUrl: true });
      return;
    }
    this.datosForm.patchValue({
      nombre: pendiente.perfil.nombre ?? '',
      apellido: pendiente.perfil.apellido ?? '',
    });
  }

  fieldError(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  irADatos(): void {
    this.errorMessage.set('');
    this.revisarDatos.set(false);
    this.currentStep.set(1);
  }

  limpiarAvisos(): void {
    this.errorMessage.set('');
    this.revisarDatos.set(false);
  }

  /** Google entregó un `credential` nuevo: el registro pendiente ya quedó actualizado. */
  onGoogleListo(): void {
    this.reautenticar.set(false);
  }

  onGoogleError(err: ErrorAutenticacion): void {
    this.errorMessage.set(err.message);
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    const pendiente = this.auth.registroGoogle();
    if (!pendiente) {
      this.errorMessage.set(MENSAJE_GOOGLE_INVALIDO);
      this.reautenticar.set(true);
      return;
    }

    this.limpiarAvisos();
    this.isLoading.set(true);

    const datos = this.datosForm.getRawValue();
    const payload: GoogleRegistroRequest = {
      credential: pendiente.credential,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      ...datosNegocio(this.businessForm, this.branchForm),
    };

    this.auth.registrarConGoogle(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: ErrorAutenticacion) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
        this.reautenticar.set(err.status === 401);
        this.revisarDatos.set(err.status === 409 || err.status === 400);
      },
    });
  }
}
