import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'client';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession(): void {
    const token = this.getAccessToken();
    if (token) {
      this.getMe().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        },
        error: () => {
          this.clearSession();
        }
      });
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => this.saveSession(response)),
        catchError(error => {
          const message = error.error?.error?.message || 'Error al iniciar sesión';
          return throwError(() => new Error(message));
        })
      );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/register`, { name, email, password })
      .pipe(
        tap(response => this.saveSession(response)),
        catchError(error => {
          const message = error.error?.error?.message || 'Error al registrar usuario';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    this.clearSession();

    if (refreshToken) {
      return this.http.post(`${this.apiUrl}/api/auth/logout`, { refreshToken })
        .pipe(catchError(() => []));
    }
    return new Observable(observer => observer.complete());
  }

  refreshAccessToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.saveSession(response)),
        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/auth/me`);
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    this.currentUserSubject.next(response.user);
    this.isLoggedInSubject.next(true);
  }

  clearSession(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.getCurrentUser()?.role || null;
  }
}