import { Injectable, computed, signal } from '@angular/core';
import { CurrentUser, StoredAuthState } from '../models/auth';

const STORAGE_KEY = 'sponsorship.auth';
// Tiny clock-skew buffer — treat a token as "expired" 10 seconds before its actual expiry
// so we don't get caught with an in-flight request that expires mid-flight.
const SKEW_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly _state = signal<StoredAuthState | null>(this.loadFromStorage());

  readonly state = this._state.asReadonly();
  readonly currentUser = computed<CurrentUser | null>(() => this._state()?.user ?? null);
  readonly accessToken = computed(() => this._state()?.accessToken ?? null);

  save(state: StoredAuthState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this._state.set(state);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._state.set(null);
  }

  isAccessTokenExpired(): boolean {
    const s = this._state();
    if (!s) return true;
    return Date.parse(s.accessTokenExpiresAt) - SKEW_MS <= Date.now();
  }

  isRefreshTokenExpired(): boolean {
    const s = this._state();
    if (!s) return true;
    return Date.parse(s.refreshTokenExpiresAt) - SKEW_MS <= Date.now();
  }

  /** True only when the access token has expired BUT a refresh is still possible. */
  canRefresh(): boolean {
    return this.isAccessTokenExpired() && !this.isRefreshTokenExpired();
  }

  private loadFromStorage(): StoredAuthState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as StoredAuthState : null;
    } catch {
      return null;
    }
  }
}
