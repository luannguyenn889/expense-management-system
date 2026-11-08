import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('Register', () => {
  it('should not show the Google sign-in button', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Tiếp tục với Google');
    expect(fixture.nativeElement.querySelector('.google-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.auth-divider')).toBeNull();
  });

  it('should show required field validation without calling the API', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập họ và tên.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập email.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng xác nhận mật khẩu.');
  });

  it('should reject a password confirmation mismatch', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyen An', 'user@example.com', 'nguyenan', 'password123', 'different123'];
    inputs.forEach((input: HTMLInputElement, index: number) => {
      input.value = values[index];
      input.dispatchEvent(new Event('input'));
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu xác nhận không khớp.');
  });

  it('should enforce name, username and password constraints before registration', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyễn An 2', 'user@example.com', 'user.name', 'a'.repeat(73), 'a'.repeat(73)];
    inputs.forEach((input: HTMLInputElement, index: number) => {
      input.value = values[index];
      input.dispatchEvent(new Event('input'));
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Họ và tên chỉ được chứa chữ cái và khoảng trắng.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.',
    );
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu không được vượt quá 72 ký tự.');
  });

  it('should toggle visibility independently for password and confirmation', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const passwordInput = fixture.nativeElement.querySelector('#register-password');
    const confirmPasswordInput = fixture.nativeElement.querySelector('#register-confirm-password');
    const [passwordToggle, confirmPasswordToggle] =
      fixture.nativeElement.querySelectorAll('.password-visibility-toggle');

    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    passwordToggle.click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('text');
    expect(confirmPasswordInput.type).toBe('password');

    confirmPasswordToggle.click();
    fixture.detectChanges();
    expect(confirmPasswordInput.type).toBe('text');

    passwordToggle.click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('text');
  });

  it('should log in and navigate to dashboard after a successful registration', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'test-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = [
      '  Nguyễn An  ',
      '  USER@example.com ',
      ' nguyen_an ',
      'password123',
      'password123',
    ];
    inputs.forEach((input: HTMLInputElement, index: number) => {
      input.value = values[index];
      input.dispatchEvent(new Event('input'));
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Nguyễn An',
      username: 'nguyen_an',
      email: 'user@example.com',
      password: 'password123',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('should show the backend duplicate username or email message', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: { message: 'Email đã được sử dụng' },
            }),
        ),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyễn An', 'USER@example.com', 'nguyenan', 'password123', 'password123'];
    inputs.forEach((input: HTMLInputElement, index: number) => {
      input.value = values[index];
      input.dispatchEvent(new Event('input'));
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Nguyễn An',
      username: 'nguyenan',
      email: 'user@example.com',
      password: 'password123',
    });
    expect(fixture.nativeElement.textContent).toContain('Email đã được sử dụng');
  });
});
