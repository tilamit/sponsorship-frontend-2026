import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  if (!tokens.state()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Both tokens expired → force login with the friendly reason.
  if (tokens.isAccessTokenExpired() && tokens.isRefreshTokenExpired()) {
    tokens.clear();
    return router.createUrlTree(['/login'], { queryParams: { reason: 'session-expired' } });
  }

  // Access expired but refresh still valid → let the interceptor handle it,
  // the guard's job is just to not block access.
  return true;
};
