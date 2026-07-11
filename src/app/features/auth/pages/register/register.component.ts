import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  businessName = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
