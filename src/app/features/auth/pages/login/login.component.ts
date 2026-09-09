import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.valid && !this.isLoading()) {
      this.errorMessage.set('');
      this.isLoading.set(true);

      const { email, password } = this.form.getRawValue();

      this.auth.login(email, password).subscribe({
        // setSession() ya navega a /admin/home; aqui solo se apaga el spinner.
        next: () => this.isLoading.set(false),
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(
            err.error?.message ?? 'No se pudo iniciar sesión',
          );
          this.isLoading.set(false);
        },
      });
    }
  }
}
