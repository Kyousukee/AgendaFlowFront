import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest, RegisterResponse } from '../interfaces/register-request.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/register`;

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, data);
  }
}
