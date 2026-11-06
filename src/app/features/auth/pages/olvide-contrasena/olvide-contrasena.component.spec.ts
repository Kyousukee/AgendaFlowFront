import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { OlvideContrasenaComponent } from './olvide-contrasena.component';

describe('OlvideContrasenaComponent', () => {
  const urlApi = `${environment.apiUrl}/auth/olvide-contrasena`;
  const MENSAJE =
    'Si el email está registrado, te enviaremos un enlace para restablecer tu contraseña.';
  let fixture: ComponentFixture<OlvideContrasenaComponent>;
  let controller: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OlvideContrasenaComponent);
    await fixture.whenStable();
  });

  afterEach(() => controller.verify());

  const texto = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  async function enviar(email = 'ana@correo.cl'): Promise<void> {
    fixture.componentInstance.form.setValue({ email });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
  }

  it('no llama a la API con un correo inválido', async () => {
    await enviar('no-es-correo');
    controller.expectNone(urlApi);
    expect(texto()).toContain('correo válido');
  });

  it('en 200 muestra el mensaje de la API y oculta el formulario', async () => {
    await enviar();
    const req = controller.expectOne(urlApi);
    expect(req.request.body).toEqual({ email: 'ana@correo.cl' });
    req.flush({ message: MENSAJE });
    await fixture.whenStable();

    expect(texto()).toContain(MENSAJE);
    expect((fixture.nativeElement as HTMLElement).querySelector('form')).toBeNull();
  });

  it('con 429 pide esperar y conserva el formulario', async () => {
    await enviar();
    controller.expectOne(urlApi).flush(null, { status: 429, statusText: 'Too Many Requests' });
    await fixture.whenStable();
    expect(texto()).toContain('demasiados intentos');
    expect((fixture.nativeElement as HTMLElement).querySelector('form')).not.toBeNull();
  });

  it('sin conexión avisa del error', async () => {
    await enviar();
    controller.expectOne(urlApi).error(new ProgressEvent('error'), { status: 0 });
    await fixture.whenStable();
    expect(texto()).toContain('conectar con el servidor');
  });

  it('con 400 pide un correo válido', async () => {
    await enviar('a@b');
    controller.expectOne(urlApi).flush(
      { message: ['email must be an email'] },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
    await fixture.whenStable();
    expect(texto()).toContain('correo válido');
  });
});
