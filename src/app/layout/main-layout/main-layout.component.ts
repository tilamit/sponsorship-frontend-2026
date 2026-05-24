import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { Roles } from '../../core/models/role';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  visible: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;

  readonly navItems = computed<NavItem[]>(() => {
    const u = this.user();
    if (!u) return [];
    return [
      { label: 'My Requests', icon: 'list_alt', link: '/requests',
        visible: u.role === Roles.Requestor },
      { label: 'All Requests', icon: 'view_list', link: '/requests',
        visible: u.role !== Roles.Requestor },
      { label: 'New Request', icon: 'add_circle', link: '/requests/new',
        visible: u.role === Roles.Requestor },
      { label: 'Manager Queue', icon: 'fact_check', link: '/workflow/manager',
        visible: u.role === Roles.Manager || u.role === Roles.SystemAdmin },
      { label: 'Finance Queue', icon: 'attach_money', link: '/workflow/finance',
        visible: u.role === Roles.FinanceAdmin || u.role === Roles.SystemAdmin },
      { label: 'Sponsorship Types', icon: 'category', link: '/admin/sponsorship-types',
        visible: u.role === Roles.SystemAdmin },
    ].filter(i => i.visible);
  });

  logout(): void {
    this.auth.logout();
  }
}
