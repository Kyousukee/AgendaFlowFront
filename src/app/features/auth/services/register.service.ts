import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginApiResponse } from '../../../core/interfaces/auth-response.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/register`;

  register(data: RegisterRequest): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(this.apiUrl, data);
  }
}
