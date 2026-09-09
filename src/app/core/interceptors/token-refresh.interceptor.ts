import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/refresh')) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
      authService.clearSession();
      window.location.href = '/auth/login';
      return throwError(() => new Error('No refresh token'));
    }

    return authService.refreshAccessToken(refreshToken).pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${response.accessToken}` }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.clearSession();
        window.location.href = '/auth/login';
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(token => {
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}