import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
}

export interface GeocodedAddress {
  direccion: string;
  comuna: string;
  ciudad: string;
  region: string;
  pais: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);

  reverse(lat: number, lng: number): Observable<GeocodedAddress> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
    return this.http.get<NominatimResponse>(url).pipe(map((res) => this.mapAddress(res.address)));
  }

  private mapAddress(addr: NominatimAddress): GeocodedAddress {
    const road = addr.road || '';
    const number = addr.house_number || '';
    const direccion = number ? `${road} ${number}`.trim() : road;

    const ciudad = addr.city || addr.town || addr.village || '';

    return {
      direccion,
      comuna: addr.suburb || addr.municipality || ciudad,
      ciudad,
      region: addr.state || '',
      pais: addr.country || '',
    };
  }
}
