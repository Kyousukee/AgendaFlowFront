import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CuentaService, mensajeErrorCuenta } from './cuenta.service';

describe('CuentaService', () => {
  let service: CuentaService;
  let controller: HttpTestingController;
  const url = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CuentaService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('verificarEmail envía el token', () => {
    let respuesta: unknown;
    service.verificarEmail('abc').subscribe((r) => (respuesta = r));
    const req = controller.expectOne(`${url}/verificar-email`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'abc' });
    req.flush({ emailVerificado: true });
    expect(respuesta).toEqual({ emailVerificado: true });
  });

  it('reenviarVerificacion va sin cuerpo', () => {
    let respuesta: unknown;
    service.reenviarVerificacion().subscribe((r) => (respuesta = r));
    const req = controller.expectOne(`${url}/reenviar-verificacion`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ emailVerificado: false });
    expect(respuesta).toEqual({ emailVerificado: false });
  });

  it('olvideContrasena envía el email', () => {
    service.olvideContrasena('a@b.cl').subscribe();
    const req = controller.expectOne(`${url}/olvide-contrasena`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.cl' });
    req.flush({ message: 'ok' });
  });

  it('restablecerContrasena envía el token y la contraseña', () => {
    service.restablecerContrasena('abc', 'unaclave123').subscribe();
    const req = controller.expectOne(`${url}/restablecer-contrasena`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'abc', password: 'unaclave123' });
    req.flush({ message: 'ok' });
  });

  it('mensajeErrorCuenta distingue el límite, la conexión y el resto', () => {
    const mensaje = (status: number) => mensajeErrorCuenta(new HttpErrorResponse({ status }));
    expect(mensaje(429)).toContain('demasiados intentos');
    expect(mensaje(0)).toContain('conectar');
    expect(mensaje(500)).toContain('salió mal');
  });
});
