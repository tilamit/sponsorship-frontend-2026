// Shared imports + base state for queue pages. Each concrete queue
// component declares its own @Component decorator with its own imports
// (Angular's standalone-component imports cannot be inherited from a
// base class).
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SponsorshipRequest } from '../../requests/models/sponsorship-request';

@Component({ template: '', standalone: true })
export class QueueState {
  protected readonly router = inject(Router);
  readonly items = signal<SponsorshipRequest[]>([]);
  readonly loading = signal(true);
  readonly columns = ['title', 'requestor', 'type', 'event', 'amount', 'status', 'actions'];
  title = '';
  emptyMessage = '';

  open(id: string): void {
    this.router.navigate(['/requests', id]);
  }
}
