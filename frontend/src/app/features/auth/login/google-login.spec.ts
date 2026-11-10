import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('U1.3: Đăng nhập bằng Google - Automation Test Script', () => {
  // TC_U1.3_01: Đăng nhập Google thành công
  it('TC_U1.3_01: Đăng nhập Google với tài khoản hợp lệ -> Chuyển hướng về trang chủ', async () => {
    // 1. Arrange (Given): Người dùng đang ở trang đăng nhập và có tài khoản Google hợp lệ
    const authService = {
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockReturnValue(
        of({
          token: 'mock-google-jwt-token-12345',
          user: {
            userId: 99,
            fullName: 'Trang Trương',
            username: 'trangtruong_google',
            email: 'trangtruong@gmail.com',
          },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // 2. Act (When):
    // - Bước 1: Nhấn nút Đăng nhập bằng Google
    // - Bước 2: Chọn tài khoản Google hợp lệ
    // - Bước 3: Hoàn tất xác thực với Google Credential
    component.handleGoogleCredential('mock-google-id-token-valid');
    fixture.detectChanges();
    await fixture.whenStable();

    // 3. Assert (Then): Xác thực Google thành công và chuyển hướng về /dashboard
    expect(authService.loginWithGoogle).toHaveBeenCalledWith('mock-google-id-token-valid');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });
});
