import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('Login Component (25 Test Cases)', () => {
  // ==========================================
  // NHÓM 1: FORM VALIDATION & BOUNDARY TESTING (TC01 - TC10)
  // ==========================================

  it('TC01: should show required error when username is empty on submit', async () => {
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
  });

  it('TC02: should show required error when password is empty on submit', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  it('TC03: should accept username at minimum length boundary (1 character)', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'a';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({ username: 'a', password: 'password123' });
  });

  it('TC04: should accept username at maximum length boundary (255 characters)', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const maxUsername = 'u'.repeat(255);
    inputs[0].value = maxUsername;
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({ username: maxUsername, password: 'password123' });
  });

  it('TC05: should reject username exceeding 255 characters', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'u'.repeat(256);
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc email không được vượt quá 255 ký tự.');
  });

  it('TC06: should reject password below minimum length boundary (7 characters)', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '1234567';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu phải có ít nhất 8 ký tự.');
  });

  it('TC07: should accept password at minimum length boundary (8 characters)', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '12345678';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({ username: 'user123', password: '12345678' });
  });

  it('TC08: should accept password at maximum length boundary (72 characters)', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const maxPass = 'p'.repeat(72);
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = maxPass;
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({ username: 'user123', password: maxPass });
  });

  it('TC09: should reject password exceeding maximum length boundary (73 characters)', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'p'.repeat(73);
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu không được vượt quá 72 ký tự.');
  });

  it('TC10: should mark both fields as touched when submitting completely blank form', async () => {
    const authService = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component['loginForm'].controls.username.touched).toBe(false);
    expect(component['loginForm'].controls.password.touched).toBe(false);

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(component['loginForm'].controls.username.touched).toBe(true);
    expect(component['loginForm'].controls.password.touched).toBe(true);
  });

  // ==========================================
  // NHÓM 2: USER INTERACTION & DATA NORMALIZATION (TC11 - TC15)
  // ==========================================

  it('TC11: should trim leading and trailing whitespace from username before submit', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'test-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '   trung_user   ';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({ username: 'trung_user', password: 'password123' });
  });

  it('TC12: should render remember me checkbox and allow checking it', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('.remember-option input[type="checkbox"]');
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
    checkbox.click();
    expect(checkbox.checked).toBe(true);
  });

  it('TC13: should render link redirecting to register page', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const registerLink = fixture.nativeElement.querySelector('.auth-footer a');
    expect(registerLink).not.toBeNull();
    expect(registerLink.getAttribute('href')).toBe('/register');
    expect(registerLink.textContent).toContain('Đăng ký tài khoản');
  });

  it('TC14: should clear previous error message when resubmitting the form', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Unauthorized' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'wrongpass';
    inputs[1].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance['errorMessage']()).not.toBe('');

    // Sửa mật khẩu và submit lại
    authService.login.mockReturnValue(of({ token: 'new-token' }));
    inputs[1].value = 'rightpass';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(fixture.componentInstance['errorMessage']()).toBe('');
  });

  it('TC15: should disable submit button and display loading text when isLoading is true', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain('Đăng nhập');

    fixture.componentInstance['isLoading'].set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Đang đăng nhập...');
  });

  // ==========================================
  // NHÓM 3: HTTP RESPONSE STATUS & EXCEPTION HANDLING (TC16 - TC20)
  // ==========================================

  it('TC16: should navigate to /dashboard upon successful login (HTTP 200)', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'jwt-12345' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'validuser';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'validpass123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('TC17: should display safe credentials error for HTTP 400 Bad Request', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Invalid payload' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'pass12345';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  it('TC18: should display safe credentials error for HTTP 403 Forbidden', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Account locked' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'pass12345';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  it('TC19: should display fallback error for HTTP 500 Server Error', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, error: null })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'pass12345';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Không thể đăng nhập. Vui lòng thử lại sau.');
  });

  it('TC20: should handle network offline error (status 0) gracefully', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user123';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'pass12345';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Không thể đăng nhập. Vui lòng thử lại sau.');
  });

  // ==========================================
  // NHÓM 4: GOOGLE SIGN-IN FLOW (TC21 - TC25)
  // ==========================================

  it('TC21: should show notification when Google sign-in script is not loaded', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    (window as any).google = undefined;
    fixture.nativeElement.querySelector('.social-login-button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dịch vụ Google Sign-In chưa sẵn sàng hoặc bị chặn. Vui lòng thử lại sau.');
  });

  it('TC22: should notify user when browser blocks Google popup', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    (window as any).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          prompt: vi.fn().mockImplementation((callback) => {
            callback({ isNotDisplayed: () => true });
          }),
        },
      },
    };
    fixture.nativeElement.querySelector('.social-login-button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup và thử lại.');
  });

  it('TC23: should notify user when user skips Google prompt moment', async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    (window as any).google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          prompt: vi.fn().mockImplementation((callback) => {
            callback({ isSkippedMoment: () => true });
          }),
        },
      },
    };
    fixture.nativeElement.querySelector('.social-login-button').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup và thử lại.');
  });

  it('TC24: should handle valid Google credential and navigate to dashboard', async () => {
    const authService = {
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockReturnValue(of({ token: 'google-jwt-token' })),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.handleGoogleCredential('google-id-token-xyz');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.loginWithGoogle).toHaveBeenCalledWith('google-id-token-xyz');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('TC25: should show error when Google backend authentication fails', async () => {
    const authService = {
      login: vi.fn(),
      loginWithGoogle: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Token Google không hợp lệ' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.handleGoogleCredential('invalid-google-token');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Token Google không hợp lệ');
  });
});
