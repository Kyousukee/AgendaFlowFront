import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { ConfiguracionEmpresa } from '../../../core/interfaces/configuracion-empresa.interface';

const MOCK_CONFIGURACION: ConfiguracionEmpresa = {
  id: 1,
  empresaId: 1,
  permitePagoAnticipado: true,
  tipoAnticipo: 'Porcentaje',
  montoAnticipo: 30,
  tiempoCancelacionHoras: 24,
  tiempoReservaMinutos: 30,
  permiteSeleccionEmpleado: true,
  mostrarPrecios: true,
  enviarCorreo: true,
  enviarWhatsapp: false,
};

@Injectable({ providedIn: 'root' })
export class ConfiguracionEmpresaService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'agendaflow_configuracion_empresa';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.persistir(MOCK_CONFIGURACION);
      }
    }
  }

  getByEmpresa(empresaId: number): Observable<ConfiguracionEmpresa> {
    return of(this.obtenerSync(empresaId));
  }

  guardar(config: ConfiguracionEmpresa): Observable<ConfiguracionEmpresa> {
    this.persistir(config);
    return of(config);
  }

  private obtenerSync(empresaId: number): ConfiguracionEmpresa {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConfiguracionEmpresa;
        if (parsed.empresaId === empresaId) {
          return parsed;
        }
      }
    }
    return { ...MOCK_CONFIGURACION, empresaId };
  }

  private persistir(config: ConfiguracionEmpresa): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    }
  }
}
