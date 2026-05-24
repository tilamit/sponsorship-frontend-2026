import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QueueState } from '../queue-base';
import { WorkflowService } from '../../services/workflow.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-finance-queue',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule, MatTooltipModule,
    StatusBadgeComponent
  ],
  templateUrl: '../manager-queue/manager-queue.component.html',
  styleUrls: ['../queue.shared.scss']
})
export class FinanceQueueComponent extends QueueState {
  private readonly service = inject(WorkflowService);
  override title = 'Finance Review Queue';
  override emptyMessage = 'No requests are pending finance review.';

  constructor() {
    super();
    this.service.pendingFinance().subscribe({
      next: list => { this.items.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
