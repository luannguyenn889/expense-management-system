import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { TOKEN_STORAGE_KEY, USER_FULL_NAME_STORAGE_KEY } from '../constants/auth.constants';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTesting: HttpTestingController;

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should save the authenticated full name and clear it on logout', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);

    authService.login({ username: 'vana', password: 'password123' }).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush({
      code: 200,
      message: 'Success',
      data: {
        accessToken: 'jwt-token',
        user: { userId: 1, fullName: 'Nguyễn Văn A', username: 'vana', email: 'vana@example.com' },
      },
    });

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('jwt-token');
    expect(authService.getFullName()).toBe('Nguyễn Văn A');

    authService.logout();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(USER_FULL_NAME_STORAGE_KEY)).toBeNull();
  });
});
