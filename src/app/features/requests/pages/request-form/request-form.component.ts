import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SponsorshipRequestService } from '../../services/sponsorship-request.service';
import { SponsorshipTypeService } from '../../services/sponsorship-type.service';
import { SponsorshipType, SponsorshipRequest, CreateRequest } from '../../models/sponsorship-request';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.scss'
})
export class RequestFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(SponsorshipRequestService);
  private readonly typeService = inject(SponsorshipTypeService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    department: ['', [Validators.required, Validators.maxLength(100)]],
    sponsorshipTypeId: [0, [Validators.required, Validators.min(1)]],
    eventName: ['', [Validators.required, Validators.maxLength(200)]],
    eventDate: [null as Date | null, [Validators.required]],
    requestedAmount: [0, [Validators.required, Validators.min(0.01)]],
    purpose: ['', [Validators.required, Validators.maxLength(2000)]],
    expectedBenefit: ['', [Validators.maxLength(1000)]],
    remarks: ['', [Validators.maxLength(500)]]
  });

  readonly id = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly types = signal<SponsorshipType[]>([]);
  readonly currentStatus = signal<string | null>(null);
  readonly isEditMode = computed(() => this.id() !== null);
  readonly minDate = new Date();

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id.set(idParam);

    if (idParam) {
      forkJoin({
        types: this.typeService.list(true),
        request: this.requestService.get(idParam)
      }).subscribe({
        next: ({ types, request }) => {
          this.types.set(types);
          this.currentStatus.set(request.status);
          if (request.status !== 'Draft') {
            this.form.disable();
          }
          this.form.patchValue({
            title: request.title,
            department: request.department,
            sponsorshipTypeId: request.sponsorshipTypeId,
            eventName: request.eventName,
            eventDate: new Date(request.eventDate),
            requestedAmount: request.requestedAmount,
            purpose: request.purpose,
            expectedBenefit: request.expectedBenefit ?? '',
            remarks: request.remarks ?? ''
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.typeService.list(true).subscribe({
        next: t => { this.types.set(t); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  save(then?: 'submit'): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const dto: CreateRequest = {
      title: v.title,
      department: v.department,
      sponsorshipTypeId: v.sponsorshipTypeId,
      eventName: v.eventName,
      eventDate: toIsoDate(v.eventDate!),
      requestedAmount: v.requestedAmount,
      purpose: v.purpose,
      expectedBenefit: v.expectedBenefit || null,
      remarks: v.remarks || null
    };

    const id = this.id();
    const op$ = id
      ? this.requestService.update(id, dto)
      : this.requestService.create(dto);

    op$.subscribe({
      next: (r: SponsorshipRequest) => {
        if (then === 'submit') {
          this.requestService.submit(r.id).subscribe({
            next: () => { this.saving.set(false); this.router.navigate(['/requests', r.id]); },
            error: () => this.saving.set(false)
          });
        } else {
          this.saving.set(false);
          this.router.navigate(['/requests', r.id]);
        }
      },
      error: () => this.saving.set(false)
    });
  }

  cancel(): void {
    const id = this.id();
    if (id) this.router.navigate(['/requests', id]);
    else this.router.navigate(['/requests']);
  }
}

function toIsoDate(d: Date): string {
  // YYYY-MM-DD (date-only) — backend column type is `date`
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
