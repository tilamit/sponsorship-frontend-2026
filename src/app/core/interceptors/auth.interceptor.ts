import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const auth = inject(AuthService);

  // Auth endpoints manage their own cookies/credentials; just ensure withCredentials.
  if (req.url.includes('/api/auth/')) {
    return next(req.clone({ withCredentials: true }));
  }

  // No auth state at all → let the request go (likely public or will 401 naturally).
  if (!tokens.state()) return next(req);

  // Both tokens expired → don't even bother making the call.
  if (tokens.isRefreshTokenExpired() && tokens.isAccessTokenExpired()) {
    auth.forceLogin();
    return throwError(() => new Error('Session expired — please log in again.'));
  }

  // Access token expired, refresh token still valid → refresh first, then send.
  if (tokens.canRefresh()) {
    return auth.refresh().pipe(
      switchMap(newToken => next(attach(req, newToken)))
    );
  }

  // Access token still valid → just attach it.
  return next(attach(req, tokens.accessToken()!)).pipe(
    // Reactive fallback for unexpected 401 (clock drift, revoked, etc.).
    catchError(err => {
      if (err.status === 401 && !tokens.isRefreshTokenExpired()) {
        return auth.refresh().pipe(
          switchMap(newToken => next(attach(req, newToken))),
          catchError(refreshErr => {
            auth.forceLogin();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  ) as Observable<HttpEvent<unknown>>;
};

function attach(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
}
