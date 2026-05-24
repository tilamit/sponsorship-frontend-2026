import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Don't toast 401s — auth interceptor handles refresh, and the
      // login form has its own error display.
      if (err.status !== 401) {
        const message = extractMessage(err);
        snack.open(message, 'Dismiss', { duration: 5000 });
      }
      return throwError(() => err);
    })
  );
};

function extractMessage(err: HttpErrorResponse): string {
  if (err.error?.detail) return err.error.detail;
  if (err.error?.title) return err.error.title;
  if (err.error?.errors) {
    const flat = Object.values(err.error.errors).flat() as string[];
    if (flat.length) return flat.join(' • ');
  }
  if (typeof err.error === 'string' && err.error) return err.error;
  return err.message || `Request failed (${err.status})`;
}
