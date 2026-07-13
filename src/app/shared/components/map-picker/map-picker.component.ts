import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  template: `
    <div class="map-picker">
      <div class="map-picker__container" #mapContainer></div>
      <button type="button" class="map-picker__locate-btn" (click)="useCurrentLocation()">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        Usar mi ubicacion
      </button>
    </div>
  `,
  styles: `
    .map-picker {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .map-picker__container {
      width: 100%;
      height: 250px;
      border-radius: 8px;
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .map-picker__locate-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      width: fit-content;

      &:hover {
        color: var(--gold);
        border-color: var(--gold);
      }
    }
  `,
})
export class MapPickerComponent implements OnDestroy {
  private mapContainer = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  private map: any;
  private marker: any;
  private L: typeof import('leaflet') | null = null;

  lat = input<number>(-33.4489);
  lng = input<number>(-70.6693);
  locationChange = output<{ lat: number; lng: number }>();

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.loadLeaflet();
      }
    });
  }

  private async loadLeaflet(): Promise<void> {
    this.L = await import('leaflet');
    this.zone.runOutsideAngular(() => {
      this.initMap();
    });
  }

  private initMap(): void {
    if (!this.L) return;

    const lat = this.lat();
    const lng = this.lng();
    const L = this.L;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.zone.run(() => {
        this.locationChange.emit({ lat: pos.lat, lng: pos.lng });
      });
    });

    this.map.on('click', (e: any) => {
      this.marker.setLatLng(e.latlng);
      this.zone.run(() => {
        this.locationChange.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    });
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (this.marker && this.map) {
          this.marker.setLatLng([latitude, longitude]);
          this.map.setView([latitude, longitude], 15);
          this.zone.run(() => {
            this.locationChange.emit({ lat: latitude, lng: longitude });
          });
        }
      },
      () => {
        // Silently fail if user denies permission
      },
    );
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
