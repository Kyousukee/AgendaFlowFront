import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { UserData } from '../../../../core/interfaces/auth-response.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent: aviso de verificación de email', () => {
  const urlApi = `${environment.apiUrl}/auth/reenviar-verificacion`;
  let fixture: ComponentFixture<LayoutComponent>;
  let controller: HttpTestingController;

  const usuario: UserData = {
    id: 1,
    nombre: 'Ana',
    email: 'ana@correo.cl',
    empresaId: 1,
    rolId: 1,
  };
  const currentUser = signal<UserData | null>(null);
  const actualizarEmailVerificado = vi.fn((valor: boolean) => {
    currentUser.update((u) => (u ? { ...u, emailVerificado: valor } : u));
  });

  async function crear(emailVerificado?: boolean, sinSesion = false): Promise<void> {
    currentUser.set(sinSesion ? null : { ...usuario, emailVerificado });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser,
            actualizarEmailVerificado,
            esAdmin: () => false,
            empresa: signal(null),
            sucursales: signal([]),
            sucursalActual: signal(null),
            logout: vi.fn(),
          },
        },
        {
          provide: SuscripcionService,
          useValue: {
            suscripcion: signal(null),
            etiquetaPlan: signal(null),
            mostrarAviso: signal(false),
          },
        },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LayoutComponent);
    await fixture.whenStable();
  }

  beforeEach(() => actualizarEmailVerificado.mockClear());
  afterEach(() => controller.verify());

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const aviso = (): Element | null => el().querySelector('.aviso-verificacion');
  const boton = (): HTMLButtonElement =>
    el().querySelector('.aviso-verificacion__boton') as HTMLButtonElement;

  it('se muestra con emailVerificado false', async () => {
    await crear(false);
    expect(aviso()).not.toBeNull();
    expect(boton().textContent).toContain('Reenviar correo');
  });

  it('no se muestra con emailVerificado true', async () => {
    await crear(true);
    expect(aviso()).toBeNull();
  });

  it('no se muestra con emailVerificado undefined (sesión antigua)', async () => {
    await crear(undefined);
    expect(aviso()).toBeNull();
  });

  it('no se muestra sin sesión', async () => {
    await crear(undefined, true);
    expect(aviso()).toBeNull();
  });

  it('deshabilita el botón mientras la petición está en curso', async () => {
    await crear(false);
    boton().click();
    await fixture.whenStable();
    expect(boton().disabled).toBe(true);

    controller.expectOne(urlApi).flush({ emailVerificado: false });
    await fixture.whenStable();
    expect(boton().disabled).toBe(false);
  });

  it('con true actualiza el usuario y oculta el aviso', async () => {
    await crear(false);
    boton().click();
    controller.expectOne(urlApi).flush({ emailVerificado: true });
    await fixture.whenStable();
    expect(actualizarEmailVerificado).toHaveBeenCalledWith(true);
    expect(aviso()).toBeNull();
  });

  it('con false muestra el mensaje sin afirmar que se envió', async () => {
    await crear(false);
    boton().click();
    controller.expectOne(urlApi).flush({ emailVerificado: false });
    await fixture.whenStable();
    expect(aviso()?.textContent).toContain(
      'Si pasó al menos un minuto desde el último envío, te enviamos otro correo. Revisa también el spam.',
    );
    expect(actualizarEmailVerificado).not.toHaveBeenCalled();
  });

  it('con 429 avisa y vuelve a habilitar el botón', async () => {
    await crear(false);
    boton().click();
    controller.expectOne(urlApi).flush(null, { status: 429, statusText: 'Too Many Requests' });
    await fixture.whenStable();
    expect(aviso()?.textContent).toContain('demasiados intentos');
    expect(boton().disabled).toBe(false);
  });
});
