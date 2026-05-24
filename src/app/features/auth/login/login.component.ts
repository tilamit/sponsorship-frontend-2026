import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly demoAccounts = [
    { email: 'requestor@demo.local', role: 'Requestor' },
    { email: 'manager@demo.local', role: 'Manager' },
    { email: 'finance@demo.local', role: 'Finance Admin' },
    { email: 'admin@demo.local', role: 'System Admin' }
  ];

  constructor() {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session-expired') {
      this.notice.set('Your session has expired. Please log in again.');
    }
  }

  fill(email: string): void {
    this.form.patchValue({ email, password: 'Demo@123' });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Login failed.');
      }
    });
  }
}
