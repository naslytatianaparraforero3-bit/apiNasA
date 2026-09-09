import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string | number;
  email: string;
  name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://sla-api.alejogiraldo.dev';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
      this.isLoggedInSubject.next(true);
    }
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(email: string, password?: string): Observable<any> {
    const body = typeof email === 'object' ? email : { email, password };
    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  refreshAccessToken(refreshToken?: string): Observable<any> {
    const tokenToUse = refreshToken || this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken: tokenToUse }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role || null : null;
  }

  getUserName(): string {
    const user = this.currentUserSubject.value;
    return user ? user.name || user.email : '';
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }
}