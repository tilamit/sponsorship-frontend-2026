import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { SponsorshipRequestService } from '../../services/sponsorship-request.service';
import { RequestStatus, SponsorshipRequest } from '../../models/sponsorship-request';
import { AuthService } from '../../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatTooltipModule, MatFormFieldModule, MatSelectModule,
    StatusBadgeComponent
  ],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss'
})
export class RequestListComponent {
  private readonly service = inject(SponsorshipRequestService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly all = signal<SponsorshipRequest[]>([]);
  readonly statusFilter = signal<RequestStatus | 'All'>('All');

  readonly statuses: (RequestStatus | 'All')[] = [
    'All', 'Draft', 'PendingManagerApproval', 'PendingFinanceReview',
    'Approved', 'Rejected', 'Cancelled'
  ];

  readonly filtered = computed(() => {
    const f = this.statusFilter();
    const list = this.all();
    return f === 'All' ? list : list.filter(r => r.status === f);
  });

  readonly columns = ['title', 'requestor', 'type', 'event', 'amount', 'status', 'actions'];

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: list => { this.all.set(list); this.loading.set(false); },
      error: err => { this.error.set(err?.error?.detail ?? 'Failed to load.'); this.loading.set(false); }
    });
  }

  open(id: string): void {
    this.router.navigate(['/requests', id]);
  }
}
