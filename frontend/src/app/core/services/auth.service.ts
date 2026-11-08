import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TOKEN_STORAGE_KEY,
  USER_FULL_NAME_STORAGE_KEY,
  USERNAME_STORAGE_KEY,
} from '../constants/auth.constants';
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
  readonly profile = signal({
    fullName: sessionStorage.getItem(USER_FULL_NAME_STORAGE_KEY)?.trim() || 'Người dùng',
    username: sessionStorage.getItem(USERNAME_STORAGE_KEY)?.trim() || '',
  });

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
        tap((session) => this.storeSession(session)),
      );
  }

  loginWithGoogle(idToken: string): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/auth/google`, { idToken })
      .pipe(
        map(unwrapApiResponse),
        map((session) => this.requireToken(session)),
        tap((session) => this.storeSession(session)),
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  getFullName(): string {
    return this.profile().fullName;
  }

  getUsername(): string {
    return this.profile().username;
  }

  updateProfileLocally(profile: { fullName: string; username: string }): void {
    const updatedProfile = {
      fullName: profile.fullName.trim(),
      username: profile.username.trim(),
    };
    sessionStorage.setItem(USER_FULL_NAME_STORAGE_KEY, updatedProfile.fullName);
    sessionStorage.setItem(USERNAME_STORAGE_KEY, updatedProfile.username);
    this.profile.set(updatedProfile);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken()?.trim());
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_FULL_NAME_STORAGE_KEY);
    sessionStorage.removeItem(USERNAME_STORAGE_KEY);
    this.profile.set({ fullName: 'Người dùng', username: '' });
  }

  private storeSession(session: AuthSession): void {
    if (session.token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    }

    const fullName = session.user?.fullName?.trim();
    if (fullName) {
      sessionStorage.setItem(USER_FULL_NAME_STORAGE_KEY, fullName);
    } else {
      sessionStorage.removeItem(USER_FULL_NAME_STORAGE_KEY);
    }

    const username = session.user?.username?.trim();
    if (username) {
      sessionStorage.setItem(USERNAME_STORAGE_KEY, username);
    } else {
      sessionStorage.removeItem(USERNAME_STORAGE_KEY);
    }
    this.profile.set({
      fullName: fullName || 'Người dùng',
      username: username || '',
    });
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
