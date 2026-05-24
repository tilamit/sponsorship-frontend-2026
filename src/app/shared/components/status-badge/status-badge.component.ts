import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { RequestStatus } from '../../../features/requests/models/sponsorship-request';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  template: `<span class="badge" [ngClass]="cssClass">{{ status | statusLabel }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }
    .draft { background: #e0e0e0; color: #424242; }
    .pending-mgr { background: #fff3cd; color: #856404; }
    .pending-fin { background: #cce5ff; color: #004085; }
    .approved { background: #d4edda; color: #155724; }
    .rejected { background: #f8d7da; color: #721c24; }
    .cancelled { background: #e2e3e5; color: #383d41; }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: RequestStatus;

  get cssClass(): string {
    switch (this.status) {
      case 'Draft': return 'draft';
      case 'PendingManagerApproval': return 'pending-mgr';
      case 'PendingFinanceReview': return 'pending-fin';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      case 'Cancelled': return 'cancelled';
      default: return '';
    }
  }
}
