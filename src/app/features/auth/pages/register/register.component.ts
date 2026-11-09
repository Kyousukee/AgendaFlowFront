import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../interfaces/register-request.interface';
import { AccesoGoogleComponent } from '../../components/acceso-google/acceso-google.component';
import { NegocioFieldsComponent } from '../../components/negocio-fields/negocio-fields.component';
import { SucursalFieldsComponent } from '../../components/sucursal-fields/sucursal-fields.component';
import { crearFormNegocio, crearFormSucursal, datosNegocio } from '../../forms/datos-negocio.form';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AccesoGoogleComponent,
    NegocioFieldsComponent,
    SucursalFieldsComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  currentStep = signal(1);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  totalSteps = 3;

  accountForm = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      // SPEC 04 (TS mínimo autorizado): sin aceptar términos y privacidad no se avanza.
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: this.passwordMatchValidator },
  );

  businessForm = crearFormNegocio(this.fb.nonNullable);
  branchForm = crearFormSucursal(this.fb.nonNullable);

  get step1Valid(): boolean {
    return this.accountForm.valid;
  }

  get step2Valid(): boolean {
    return this.businessForm.valid;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
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

  fieldError(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    this.errorMessage.set('');

    const account = this.accountForm.getRawValue();

    this.isLoading.set(true);

    const payload: RegisterRequest = {
      nombre: account.nombre,
      apellido: account.apellido || '',
      email: account.email,
      password: account.password,
      ...datosNegocio(this.businessForm, this.branchForm),
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
}
