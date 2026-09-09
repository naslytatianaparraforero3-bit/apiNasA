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
  private apiUrl = 'https://sla-api.areasoftccyt.com/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
        this.isLoggedInSubject.next(true);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(credentials: { email: string; password?: string } | string, password?: string): Observable<any> {
    const body = typeof credentials === 'object' ? credentials : { email: credentials, password };
    
    return this.http.post<any>(`${this.apiUrl}/login`, body).pipe(
      tap(response => {
        const data = response.data || response;
        const token = data.token || response.token;
        const refreshToken = data.refreshToken || response.refreshToken;
        const user = data.user || response.user;

        if (token) {
          localStorage.setItem('token', token);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {}
      });
    }
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