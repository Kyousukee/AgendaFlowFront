import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { RegisterRequest } from '../interfaces/register-request.interface';

/** Paso "Negocio" del registro (con correo o con Google). */
export function crearFormNegocio(fb: NonNullableFormBuilder) {
  return fb.group({
    empresaNombre: ['', [Validators.required, Validators.minLength(2)]],
    nombreComercial: [''],
    empresaEmail: ['', [Validators.email]],
    telefono: [''],
  });
}

/** Paso "Sucursal" del registro: todo opcional. */
export function crearFormSucursal(fb: NonNullableFormBuilder) {
  return fb.group({
    sucursalNombre: [''],
    direccion: [''],
    comuna: [''],
    ciudad: [''],
    region: [''],
    pais: ['Chile'],
    latitud: [null as number | null],
    longitud: [null as number | null],
  });
}

export type FormNegocio = ReturnType<typeof crearFormNegocio>;
export type FormSucursal = ReturnType<typeof crearFormSucursal>;

export type DatosNegocio = Omit<RegisterRequest, 'nombre' | 'apellido' | 'email' | 'password'>;

/** Arma la parte del negocio y la sucursal del payload; los campos vacíos no se envían. */
export function datosNegocio(negocio: FormNegocio, sucursal: FormSucursal): DatosNegocio {
  const business = negocio.getRawValue();
  const branch = sucursal.getRawValue();
  return {
    empresaNombre: business.empresaNombre,
    nombreComercial: business.nombreComercial || undefined,
    empresaEmail: business.empresaEmail || undefined,
    telefono: business.telefono || undefined,
    sucursalNombre: branch.sucursalNombre || undefined,
    direccion: branch.direccion || undefined,
    comuna: branch.comuna || undefined,
    ciudad: branch.ciudad || undefined,
    region: branch.region || undefined,
    pais: branch.pais || undefined,
    latitud: branch.latitud,
    longitud: branch.longitud,
  };
}
