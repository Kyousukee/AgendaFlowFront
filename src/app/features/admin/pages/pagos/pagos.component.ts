import { Component } from '@angular/core';

@Component({
  selector: 'app-pagos',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pagos</h1>
        <p class="page-subtitle">Historial de pagos y facturacion</p>
      </div>
    </div>
    <div class="empty-state">
      <p>Proximamente...</p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
    .page-subtitle { font-size: 0.875rem; color: var(--text-muted); }
    .empty-state { color: var(--text-muted); font-size: 0.875rem; }
  `],
})
export class PagosComponent {}
