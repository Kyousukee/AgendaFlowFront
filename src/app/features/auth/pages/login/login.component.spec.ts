import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorAutenticacion } from '../../../../core/errors/error-autenticacion';
import { LoginComponent } from './login.component';

describe('LoginComponent: recuperación de contraseña', () => {
  async function abrir(url: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginComponent }]),
        { provide: AuthService, useValue: {} },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  }

  it('enlaza a /olvide-contrasena', async () => {
    const el = await abrir('/login');
    const enlace = el.querySelector('a[href="/olvide-contrasena"]');
    expect(enlace?.textContent).toContain('¿Olvidaste tu contraseña?');
  });

  it('con ?restablecida=1 confirma que la contraseña cambió', async () => {
    const el = await abrir('/login?restablecida=1');
    expect(el.querySelector('.form-success-banner')?.textContent).toContain('contraseña cambió');
  });

  it('sin el parámetro no muestra la confirmación', async () => {
    const el = await abrir('/login');
    expect(el.querySelector('.form-success-banner')).toBeNull();
  });
});

describe('LoginComponent: cuenta creada con Google', () => {
  async function loginFallido(status: number): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginComponent }]),
        {
          provide: AuthService,
          useValue: {
            login: () =>
              throwError(() => new ErrorAutenticacion(status, 'Email o contrasena incorrectos')),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');
    const el = harness.routeNativeElement as HTMLElement;
    const email = el.querySelector<HTMLInputElement>('#email')!;
    const password = el.querySelector<HTMLInputElement>('#password')!;
    email.value = 'ana@gmail.com';
    email.dispatchEvent(new Event('input'));
    password.value = 'algo';
    password.dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await harness.fixture.whenStable();
    return el;
  }

  it('con un 401 sugiere "Olvidé mi contraseña" por si la cuenta no tiene contraseña', async () => {
    const el = await loginFallido(401);
    const nota = el.querySelector('.form-error-banner__nota');
    expect(nota?.textContent).toContain('¿Creaste tu cuenta con Google?');
    expect(nota?.querySelector('a[href="/olvide-contrasena"]')).not.toBeNull();
  });

  it('con otro error no muestra la sugerencia', async () => {
    const el = await loginFallido(0);
    expect(el.querySelector('.form-error-banner')).not.toBeNull();
    expect(el.querySelector('.form-error-banner__nota')).toBeNull();
  });
});
