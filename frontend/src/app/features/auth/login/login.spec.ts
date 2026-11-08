import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('Login', () => {
  it('should show required field validation without calling the API', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  it('should submit valid credentials and handle the API response', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'test-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '  minhanh  ';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'minhanh',
      password: 'password123',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('should show an API error after a rejected sign-in', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { message: 'Tài khoản không tồn tại' },
            }),
        ),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'minhanh';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Tên đăng nhập hoặc mật khẩu không chính xác',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Tài khoản không tồn tại');
  });

  it('should reject passwords longer than 72 characters before calling the API', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'minhanh';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'a'.repeat(73);
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu không được vượt quá 72 ký tự.');
  });

  it('should show notice when Google sign-in service is not yet loaded', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login: vi.fn(), loginWithGoogle: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.social-login-button').click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.social-login-button').textContent.trim(),
    ).toBe('Tiếp tục với Google');
    expect(fixture.nativeElement.querySelector('.google-mark path[fill="#4285F4"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.google-mark path[fill="#34A853"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.google-mark path[fill="#FBBC05"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.google-mark path[fill="#EA4335"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Dịch vụ Google Sign-In chưa sẵn sàng hoặc bị chặn. Vui lòng thử lại sau.',
    );
  });

  it('should authenticate with Google credential and navigate to dashboard', async () => {
    const authService = {
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockReturnValue(of({ token: 'test-google-token' })),
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
    component.handleGoogleCredential('sample-google-id-token');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.loginWithGoogle).toHaveBeenCalledWith('sample-google-id-token');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });
});
