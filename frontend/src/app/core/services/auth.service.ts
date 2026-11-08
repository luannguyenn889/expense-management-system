import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TOKEN_STORAGE_KEY } from '../constants/auth.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthSession,
  GoogleLoginRequest,
  LoginRequest,
  UserCreationRequest,
  UserResponse,
} from '../models/auth.model';
import { unwrapApiResponse } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  register(request: UserCreationRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<UserResponse>>(`${this.apiUrl}/users/register`, request)
      .pipe(
        map(unwrapApiResponse),
        switchMap(() =>
          this.login({
            username: request.username,
            password: request.password,
          }),
        ),
      );
  }

  login(request: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        map(unwrapApiResponse),
        map((session) => this.requireToken(session)),
        tap((session) => {
          if (session.token) {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token);
          }
        }),
      );
  }

  loginWithGoogle(idToken: string): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/auth/google`, { idToken })
      .pipe(
        map(unwrapApiResponse),
        map((session) => this.requireToken(session)),
        tap((session) => {
          if (session.token) {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token);
          }
        }),
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
    const rawToken = session.accessToken?.trim() || session.token?.trim();
    if (!rawToken) {
      throw new Error('Phản hồi xác thực không chứa token hợp lệ.');
    }

    return {
      ...session,
      token: rawToken,
    };
  }
}
