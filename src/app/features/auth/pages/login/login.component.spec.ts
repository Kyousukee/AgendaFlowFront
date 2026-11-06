import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from '../../../../core/services/auth.service';
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
