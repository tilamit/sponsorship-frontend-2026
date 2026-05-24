import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SponsorshipRequestService } from '../../services/sponsorship-request.service';
import { WorkflowService } from '../../../workflow/services/workflow.service';
import {
  SponsorshipRequest, WorkflowHistoryEntry, ApprovalDecision
} from '../../models/sponsorship-request';
import { AuthService } from '../../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { RemarksDialogComponent } from '../../../../shared/components/remarks-dialog/remarks-dialog.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule, MatDialogModule,
    StatusBadgeComponent
  ],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss'
})
export class RequestDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(SponsorshipRequestService);
  private readonly workflowService = inject(WorkflowService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly request = signal<SponsorshipRequest | null>(null);
  readonly history = signal<WorkflowHistoryEntry[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly user = this.auth.user;

  readonly isOwner = computed(() => {
    const r = this.request();
    const u = this.user();
    return !!r && !!u && r.requestorId === u.id;
  });

  readonly canEdit = computed(() => this.isOwner() && this.request()?.status === 'Draft');
  readonly canSubmit = computed(() => this.isOwner() && this.request()?.status === 'Draft');
  readonly canCancel = computed(() => {
    const s = this.request()?.status;
    return this.isOwner() && (s === 'Draft' || s === 'PendingManagerApproval' || s === 'PendingFinanceReview');
  });
  readonly canManagerDecide = computed(() =>
    this.user()?.role === 'Manager' && this.request()?.status === 'PendingManagerApproval');
  readonly canFinanceDecide = computed(() =>
    this.user()?.role === 'FinanceAdmin' && this.request()?.status === 'PendingFinanceReview');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/requests']); return; }
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    forkJoin({
      request: this.requestService.get(id),
      history: this.workflowService.history(id)
    }).subscribe({
      next: ({ request, history }) => {
        this.request.set(request);
        this.history.set(history);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/requests']);
      }
    });
  }

  submit(): void {
    const r = this.request(); if (!r) return;
    this.busy.set(true);
    this.requestService.submit(r.id).subscribe({
      next: () => this.load(r.id),
      error: () => this.busy.set(false)
    });
  }

  cancel(): void {
    const r = this.request(); if (!r) return;
    this.openRemarks('Cancel request', 'Cancellation reason (optional)')
      .subscribe(remarks => {
        if (remarks === undefined) return;
        this.busy.set(true);
        this.requestService.cancel(r.id, remarks).subscribe({
          next: () => this.load(r.id),
          error: () => this.busy.set(false)
        });
      });
  }

  managerDecide(decision: ApprovalDecision): void {
    const r = this.request(); if (!r) return;
    const verb = decision === 1 ? 'Approve' : 'Reject';
    this.openRemarks(`${verb} (Manager)`, 'Remarks (optional)')
      .subscribe(remarks => {
        if (remarks === undefined) return;
        this.busy.set(true);
        this.workflowService.managerDecision(r.id, { action: decision, remarks }).subscribe({
          next: () => this.load(r.id),
          error: () => this.busy.set(false)
        });
      });
  }

  financeDecide(decision: ApprovalDecision): void {
    const r = this.request(); if (!r) return;
    const verb = decision === 1 ? 'Approve' : 'Reject';
    this.openRemarks(`${verb} (Finance)`, 'Remarks (optional)')
      .subscribe(remarks => {
        if (remarks === undefined) return;
        this.busy.set(true);
        this.workflowService.financeDecision(r.id, { action: decision, remarks }).subscribe({
          next: () => this.load(r.id),
          error: () => this.busy.set(false)
        });
      });
  }

  private openRemarks(title: string, label: string) {
    return this.dialog.open(RemarksDialogComponent, {
      width: '420px',
      data: { title, label }
    }).afterClosed();
  }
}
