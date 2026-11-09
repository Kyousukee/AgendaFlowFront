import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormNegocio } from '../../forms/datos-negocio.form';

/** Campos del paso "Negocio". El `<form>` y los botones de navegación los pone la página. */
@Component({
  selector: 'app-negocio-fields',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './negocio-fields.component.html',
  styleUrl: './negocio-fields.component.scss',
})
export class NegocioFieldsComponent {
  form = input.required<FormNegocio>();

  fieldError(field: keyof FormNegocio['controls']): boolean {
    const control = this.form().controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
}
