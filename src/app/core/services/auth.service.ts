import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'agendaflow_logged_in';
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  isLoggedIn = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn.set(localStorage.getItem(this.STORAGE_KEY) === 'true');
    }
  }

  login(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, 'true');
    }
    this.isLoggedIn.set(true);
    this.router.navigate(['/admin/home']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
