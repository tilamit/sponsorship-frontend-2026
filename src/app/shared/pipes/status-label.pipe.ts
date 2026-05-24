import { Pipe, PipeTransform } from '@angular/core';
import { RequestStatus } from '../../features/requests/models/sponsorship-request';

const LABELS: Record<RequestStatus, string> = {
  Draft: 'Draft',
  PendingManagerApproval: 'Pending Manager',
  PendingFinanceReview: 'Pending Finance',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
};

@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: RequestStatus | string | null | undefined): string {
    if (!value) return '';
    return LABELS[value as RequestStatus] ?? value;
  }
}
