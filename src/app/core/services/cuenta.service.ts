import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmailVerificadoResponse,
  InvitacionVista,
  MensajeCuentaResponse,
} from '../interfaces/cuenta.interface';

/** Mensaje para errores que no son del formulario: límite de peticiones, conexión o servidor. */
export function mensajeErrorCuenta(error: HttpErrorResponse): string {
  if (error.status === 429) {
    return 'Hiciste demasiados intentos. Espera un minuto y vuelve a intentarlo.';
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.';
  }
  return 'Algo salió mal. Vuelve a intentarlo en unos minutos.';
}

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  verificarEmail(token: string): Observable<EmailVerificadoResponse> {
    return this.http.post<EmailVerificadoResponse>(`${this.url}/verificar-email`, { token });
  }

  reenviarVerificacion(): Observable<EmailVerificadoResponse> {
    return this.http.post<EmailVerificadoResponse>(`${this.url}/reenviar-verificacion`, null);
  }

  olvideContrasena(email: string): Observable<MensajeCuentaResponse> {
    return this.http.post<MensajeCuentaResponse>(`${this.url}/olvide-contrasena`, { email });
  }

  restablecerContrasena(token: string, password: string): Observable<MensajeCuentaResponse> {
    return this.http.post<MensajeCuentaResponse>(`${this.url}/restablecer-contrasena`, {
      token,
      password,
    });
  }

  /** SPEC 08: a quién invitaron y a qué sucursal. `400` si el enlace no sirve. */
  getInvitacion(token: string): Observable<InvitacionVista> {
    return this.http.get<InvitacionVista>(`${this.url}/invitacion/${encodeURIComponent(token)}`);
  }
}
