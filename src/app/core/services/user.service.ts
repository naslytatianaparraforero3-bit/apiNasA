import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://sla-api.areasoftccyt.com/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  changeRole(userId: string | number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/role`, { role });
  }
}