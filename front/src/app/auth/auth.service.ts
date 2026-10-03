import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

import { API_URL } from '../api';
import { LoginResponse } from '../models';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(sessionStorage.getItem('token'));

  readonly tokenValue = this.token.asReadonly();

  readonly isLoggedIn = computed(() => this.token() !== null);

  login(login: string, password: string) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { login, password }).pipe(
      tap((response) => {
        this.token.set(response.token);
        sessionStorage.setItem('token', response.token);
      }),
    );
  }

  logout() {
    return this.http.post(`${API_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearToken();
      }),
    );
  }

  clearToken(): void {
    this.token.set(null);
    sessionStorage.removeItem('token');
  }
}
