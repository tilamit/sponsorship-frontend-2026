import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { SponsorshipTypeService } from '../../../requests/services/sponsorship-type.service';
import { SponsorshipType } from '../../../requests/models/sponsorship-request';

@Component({
  selector: 'app-sponsorship-types',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule, MatSlideToggleModule, MatTableModule
  ],
  templateUrl: './sponsorship-types.component.html',
  styleUrl: './sponsorship-types.component.scss'
})
export class SponsorshipTypesComponent {
  private readonly service = inject(SponsorshipTypeService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<SponsorshipType[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly columns = ['name', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list(false).subscribe({
      next: list => { this.items.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  add(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.service.create(this.form.getRawValue().name).subscribe({
      next: () => {
        this.form.reset({ name: '' });
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false)
    });
  }

  toggle(t: SponsorshipType): void {
    this.service.update(t.id, t.name, !t.isActive).subscribe({
      next: () => this.load()
    });
  }
}
