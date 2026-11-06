import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor, esApiPropia } from './auth.interceptor';
import { sessionInterceptor } from './session.interceptor';

describe('interceptores de sesión', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  const logout = vi.fn();

  beforeEach(() => {
    logout.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, sessionInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => 'token-secreto', logout } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('adjunta el token a nuestra API', () => {
    http.get(`${environment.apiUrl}/sucursales`).subscribe();
    const req = controller.expectOne(`${environment.apiUrl}/sucursales`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-secreto');
    req.flush([]);
  });

  it('no envía el token a Nominatim', () => {
    const url = 'https://nominatim.openstreetmap.org/reverse?format=json';
    http.get(url).subscribe();
    const req = controller.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('no confunde un dominio que empieza igual que la API', () => {
    expect(esApiPropia(`${environment.apiUrl}.otro.com/robar`)).toBe(false);
    expect(esApiPropia(`${environment.apiUrl}/reservas`)).toBe(true);
  });

  it('cierra sesión ante un 401 de nuestra API', () => {
    http.get(`${environment.apiUrl}/sucursales`).subscribe({ error: () => {} });
    controller
      .expectOne(`${environment.apiUrl}/sucursales`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('no cierra sesión ante un 401 de un tercero', () => {
    const url = 'https://nominatim.openstreetmap.org/reverse';
    http.get(url).subscribe({ error: () => {} });
    controller.expectOne(url).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(logout).not.toHaveBeenCalled();
  });
});
