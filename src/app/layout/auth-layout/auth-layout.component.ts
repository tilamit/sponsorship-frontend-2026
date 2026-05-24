import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-bg">
      <router-outlet />
    </div>
  `,
  styles: [`
    .auth-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      padding: 16px;
    }
  `]
})
export class AuthLayoutComponent {}
