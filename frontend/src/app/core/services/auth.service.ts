import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TOKEN_STORAGE_KEY } from '../constants/auth.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthSession,
  LoginRequest,
  UserCreationRequest,
} from '../models/auth.model';
import { unwrapApiResponse } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  register(request: UserCreationRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/users/register`, request)
      .pipe(
        map(unwrapApiResponse),
        map((session) => this.requireToken(session)),
        tap((session) => sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token)),
      );
  }

  login(request: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        map(unwrapApiResponse),
        map((session) => this.requireToken(session)),
        tap((session) => sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token)),
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken()?.trim());
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private requireToken(session: AuthSession): AuthSession {
    if (!session.token?.trim()) {
      throw new Error('Phản hồi xác thực không chứa token hợp lệ.');
    }

    return session;
  }
}
