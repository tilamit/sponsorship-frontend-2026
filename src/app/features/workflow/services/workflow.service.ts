import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApprovalAction,
  SponsorshipRequest,
  WorkflowHistoryEntry
} from '../../requests/models/sponsorship-request';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/workflow`;

  pendingManager(): Observable<SponsorshipRequest[]> {
    return this.http.get<SponsorshipRequest[]>(`${this.base}/pending-manager`);
  }

  pendingFinance(): Observable<SponsorshipRequest[]> {
    return this.http.get<SponsorshipRequest[]>(`${this.base}/pending-finance`);
  }

  managerDecision(id: string, decision: ApprovalAction): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/manager-decision`, decision);
  }

  financeDecision(id: string, decision: ApprovalAction): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/finance-decision`, decision);
  }

  history(id: string): Observable<WorkflowHistoryEntry[]> {
    return this.http.get<WorkflowHistoryEntry[]>(`${this.base}/${id}/history`);
  }
}
