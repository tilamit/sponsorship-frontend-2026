import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  LoginRequest, LoginResponse, RefreshResponse, StoredAuthState
} from '../models/auth';
import { Role } from '../models/role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiBaseUrl}/api/auth`;

  // Concurrency guard so parallel 401s share ONE refresh call.
  private refreshing$ = new BehaviorSubject<boolean>(false);
  private lastRefreshAccessToken: string | null = null;

  readonly user = this.tokens.currentUser;
  readonly isAuthenticatedSignal = computed(() => this.tokens.state() !== null);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, req, { withCredentials: true })
      .pipe(tap(res => this.tokens.save(this.toStored(res))));
  }

  logout(navigate = true): void {
    // Fire-and-forget the server-side revocation. We don't gate local cleanup
    // on the response — a network failure or revoked session must still log
    // the user out locally.
    this.http
      .post<void>(`${this.base}/logout`, {}, { withCredentials: true })
      .subscribe({ next: () => {}, error: () => {} });

    this.tokens.clear();
    if (navigate) this.router.navigate(['/login']);
  }

  /**
   * Attempts to refresh the access token using the httpOnly refresh cookie.
   * Returns the new access token on success; throws on failure.
   * Coalesces concurrent calls so only one network refresh happens at a time.
   */
  refresh(): Observable<string> {
    if (this.tokens.isRefreshTokenExpired()) {
      this.forceLogin();
      return throwError(() => new Error('Refresh token expired'));
    }

    if (this.refreshing$.value) {
      return this.refreshing$.pipe(
        filter(inFlight => !inFlight),
        take(1),
        switchMap(() => this.lastRefreshAccessToken
          ? of(this.lastRefreshAccessToken)
          : throwError(() => new Error('Refresh failed')))
      );
    }

    this.refreshing$.next(true);
    this.lastRefreshAccessToken = null;

    return this.http
      .post<RefreshResponse>(`${this.base}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          const current = this.tokens.state();
          if (!current) throw new Error('No auth state to refresh');
          this.tokens.save({
            ...current,
            accessToken: res.accessToken,
            accessTokenExpiresAt: res.accessTokenExpiresAt,
            refreshTokenExpiresAt: res.refreshTokenExpiresAt
          });
          this.lastRefreshAccessToken = res.accessToken;
        }),
        switchMap(res => of(res.accessToken)),
        catchError(err => {
          // 401 from refresh = server invalidated our session (revoked, theft detection, etc.)
          this.forceLogin();
          return throwError(() => err);
        }),
        finalize(() => this.refreshing$.next(false))
      );
  }

  forceLogin(): void {
    this.tokens.clear();
    this.router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
  }

  isAuthenticated(): boolean {
    const s = this.tokens.state();
    if (!s) return false;
    return !this.tokens.isAccessTokenExpired() || this.tokens.canRefresh();
  }

  hasRole(...roles: Role[]): boolean {
    const u = this.tokens.currentUser();
    return !!u && roles.includes(u.role);
  }

  accessToken(): string | null {
    return this.tokens.accessToken();
  }

  private toStored(res: LoginResponse): StoredAuthState {
    return {
      accessToken: res.accessToken,
      accessTokenExpiresAt: res.accessTokenExpiresAt,
      refreshTokenExpiresAt: res.refreshTokenExpiresAt,
      user: res.user
    };
  }
}
