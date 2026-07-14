import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface UserData {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  empresaId: number;
  rolId: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'agendaflow_token';
  private readonly USER_KEY = 'agendaflow_user';
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isLoggedIn = signal(false);
  currentUser = signal<UserData | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      if (token && userJson) {
        this.isLoggedIn.set(true);
        this.currentUser.set(JSON.parse(userJson));
      }
    }
  }

  setSession(token: string, user: UserData): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
    this.router.navigate(['/admin/home']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  login(): void {
    const mockUser: UserData = {
      id: 1,
      nombre: 'Usuario',
      apellido: 'Demo',
      email: 'demo@agendaflow.cl',
      empresaId: 1,
      rolId: 1,
    };
    this.setSession('mock-token', mockUser);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
