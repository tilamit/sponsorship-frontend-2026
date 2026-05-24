import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SponsorshipType } from '../models/sponsorship-request';

@Injectable({ providedIn: 'root' })
export class SponsorshipTypeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/sponsorship-types`;

  list(activeOnly = true): Observable<SponsorshipType[]> {
    return this.http.get<SponsorshipType[]>(`${this.base}?activeOnly=${activeOnly}`);
  }

  create(name: string): Observable<SponsorshipType> {
    return this.http.post<SponsorshipType>(this.base, { name });
  }

  update(id: number, name: string, isActive: boolean): Observable<SponsorshipType> {
    return this.http.put<SponsorshipType>(`${this.base}/${id}`, { name, isActive });
  }
}
