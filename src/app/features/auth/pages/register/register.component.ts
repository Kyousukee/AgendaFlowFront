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
import { RegisterService } from '../../services/register.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MapPickerComponent } from '../../../../shared/components/map-picker/map-picker.component';
import { GeocodingService } from '../../../../shared/services/geocoding.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MapPickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private registerService = inject(RegisterService);
  private authService = inject(AuthService);
  private geocodingService = inject(GeocodingService);

  currentStep = signal(1);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  mapLat = signal(-33.4489);
  mapLng = signal(-70.6693);

  totalSteps = 3;

  accountForm = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  businessForm = this.fb.nonNullable.group({
    empresaNombre: ['', [Validators.required, Validators.minLength(2)]],
    nombreComercial: [''],
    empresaEmail: ['', [Validators.email]],
    telefono: [''],
  });

  branchForm = this.fb.nonNullable.group({
    sucursalNombre: [''],
    direccion: [''],
    comuna: [''],
    ciudad: [''],
    region: [''],
    pais: ['Chile'],
    latitud: [null as number | null],
    longitud: [null as number | null],
  });

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

  onMapLocationChange(event: { lat: number; lng: number }): void {
    this.mapLat.set(event.lat);
    this.mapLng.set(event.lng);
    this.branchForm.patchValue({
      latitud: event.lat,
      longitud: event.lng,
    });

    this.geocodingService.reverse(event.lat, event.lng).subscribe((addr) => {
      this.branchForm.patchValue({
        direccion: addr.direccion,
        comuna: addr.comuna,
        ciudad: addr.ciudad,
        region: addr.region,
        pais: addr.pais,
      });
    });
  }

  fieldError(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    this.errorMessage.set('');

    const account = this.accountForm.getRawValue();
    const business = this.businessForm.getRawValue();
    const branch = this.branchForm.getRawValue();

    this.isLoading.set(true);

    this.registerService
      .register({
        empresa: {
          nombre: business.empresaNombre,
          nombreComercial: business.nombreComercial || undefined,
          email: business.empresaEmail || undefined,
          telefono: business.telefono || undefined,
        },
        usuario: {
          nombre: account.nombre,
          apellido: account.apellido || undefined,
          email: account.email,
          password: account.password,
          telefono: business.telefono || undefined,
        },
        sucursal: {
          nombre: branch.sucursalNombre || undefined,
          direccion: branch.direccion || undefined,
          comuna: branch.comuna || undefined,
          ciudad: branch.ciudad || undefined,
          region: branch.region || undefined,
          pais: branch.pais || undefined,
          latitud: branch.latitud ?? undefined,
          longitud: branch.longitud ?? undefined,
        },
      })
      .subscribe({
        next: (res) => {
          this.authService.setSession(res.token, res.usuario);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Error al crear la cuenta. Intenta de nuevo.',
          );
        },
      });
  }
}
