import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateRequest,
  SponsorshipRequest,
  UpdateRequest
} from '../models/sponsorship-request';

@Injectable({ providedIn: 'root' })
export class SponsorshipRequestService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/sponsorship-requests`;

  list(): Observable<SponsorshipRequest[]> {
    return this.http.get<SponsorshipRequest[]>(this.base);
  }

  get(id: string): Observable<SponsorshipRequest> {
    return this.http.get<SponsorshipRequest>(`${this.base}/${id}`);
  }

  create(dto: CreateRequest): Observable<SponsorshipRequest> {
    return this.http.post<SponsorshipRequest>(this.base, dto);
  }

  update(id: string, dto: UpdateRequest): Observable<SponsorshipRequest> {
    return this.http.put<SponsorshipRequest>(`${this.base}/${id}`, dto);
  }

  submit(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/submit`, {});
  }

  cancel(id: string, remarks?: string | null): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/cancel`, { remarks });
  }
}
