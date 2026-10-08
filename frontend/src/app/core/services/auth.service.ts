import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, UserSummary } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1/auth';
  
  currentUser = signal<UserSummary | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const savedToken = localStorage.getItem('vh_token');
    const savedUser = localStorage.getItem('vh_user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.token.set(res.token);
        this.currentUser.set(res.user);
        localStorage.setItem('vh_token', res.token);
        localStorage.setItem('vh_user', JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('vh_token');
    localStorage.removeItem('vh_user');
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(role) : false;
  }
}
