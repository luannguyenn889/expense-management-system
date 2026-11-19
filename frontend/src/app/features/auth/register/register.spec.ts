import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('Register Component (35 Test Cases)', () => {
  // ==========================================
  // NHÓM 1: VALIDATION HỌ VÀ TÊN (TC01 - TC07)
  // ==========================================

  it('TC01: should show required error when fullName is left empty on submit', async () => {
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
  });

  it('TC02: should reject fullName containing only whitespace', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '     ';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập họ và tên.');
  });

  it('TC03: should reject fullName containing digits (e.g. "Nguyen Van 1")', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen Van 1';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
  });

  it('TC04: should reject fullName containing special symbols (e.g. "@nh Nguyen")', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '@nh Nguyen';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
  });

  it('TC05: should accept standard Vietnamese fullName with diacritics', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyễn Quốc Trung';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'trung@example.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'quoctrung';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalled();
  });

  it('TC06: should accept fullName at maximum boundary length (100 characters)', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const valid100Name = 'Nguyen '.repeat(14) + 'Van'; // 7*14 + 3 = 101 -> cut to 100
    const name100 = 'A'.repeat(100);
    inputs[0].value = name100;
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'test@example.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'username123';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ fullName: name100 }));
  });

  it('TC07: should reject fullName exceeding 100 characters', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'A'.repeat(101);
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên không được vượt quá 100 ký tự.');
  });

  // ==========================================
  // NHÓM 2: VALIDATION USERNAME / TÊN ĐĂNG NHẬP (TC08 - TC14)
  // ==========================================

  it('TC08: should show required error when username is left empty on submit', async () => {
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

    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
  });

  it('TC09: should reject username below minimum length boundary (2 characters)', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[2].value = 'ab';
    inputs[2].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản phải có từ 3 đến 50 ký tự.');
  });

  it('TC10: should accept username at minimum length boundary (3 characters)', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'abc';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ username: 'abc' }));
  });

  it('TC11: should accept username at maximum length boundary (50 characters)', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const user50 = 'a'.repeat(50);
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = user50;
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ username: user50 }));
  });

  it('TC12: should reject username exceeding 50 characters', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[2].value = 'a'.repeat(51);
    inputs[2].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản phải có từ 3 đến 50 ký tự.');
  });

  it('TC13: should reject username containing spaces or Vietnamese diacritics', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[2].value = 'nguyen trung';
    inputs[2].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.');
  });

  it('TC14: should reject username containing invalid special characters (e.g. "user!@#")', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[2].value = 'user!@#';
    inputs[2].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.');
  });

  // ==========================================
  // NHÓM 3: VALIDATION EMAIL (TC15 - TC20)
  // ==========================================

  it('TC15: should show required error when email is left empty on submit', async () => {
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

    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập email.');
  });

  it('TC16: should reject malformed email lacking @ symbol', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[1].value = 'plainaddress';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Email chưa đúng định dạng.');
  });

  it('TC17: should reject malformed email lacking domain name (e.g. "user@")', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[1].value = 'user@';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Email chưa đúng định dạng.');
  });

  it('TC18: should accept valid email format and auto lowercase on submit', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '  MYEMAIL@GMAIL.COM  ';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ email: 'myemail@gmail.com' }));
  });

  it('TC19: should reject email exceeding 255 characters', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const longEmail = 'a'.repeat(245) + '@example.com'; // > 255
    inputs[1].value = longEmail;
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Email không được vượt quá 255 ký tự.');
  });

  it('TC20: should trim whitespace around email and full name before submitting', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '   Tran Van B   ';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '   b@gmail.com   ';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = '   tran_van_b   ';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Tran Van B',
      email: 'b@gmail.com',
      username: 'tran_van_b',
      password: 'password123',
    });
  });

  // ==========================================
  // NHÓM 4: VALIDATION MẬT KHẨU & CONFIRM (TC21 - TC28)
  // ==========================================

  it('TC21: should show required error when password is empty on submit', async () => {
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

    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  it('TC22: should reject password below minimum length (7 characters)', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[3].value = '1234567';
    inputs[3].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu phải có ít nhất 8 ký tự.');
  });

  it('TC23: should accept password at boundary length (8 characters)', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'mock-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = '12345678';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = '12345678';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ password: '12345678' }));
  });

  it('TC24: should reject password exceeding 72 characters', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[3].value = 'p'.repeat(73);
    inputs[3].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu không được vượt quá 72 ký tự.');
  });

  it('TC25: should show required error when confirmPassword is empty', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng xác nhận mật khẩu.');
  });

  it('TC26: should reject confirmation mismatch when confirmPassword differs from password', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'different123';
    inputs[4].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu xác nhận không khớp.');
  });

  it('TC27: should toggle password input visibility when toggle button is clicked', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const passwordInput = fixture.nativeElement.querySelector('#register-password');
    const toggles = fixture.nativeElement.querySelectorAll('.password-visibility-toggle');

    expect(passwordInput.type).toBe('password');
    toggles[0].click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('text');
    toggles[0].click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('password');
  });

  it('TC28: should toggle confirmPassword input visibility independently', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const confirmInput = fixture.nativeElement.querySelector('#register-confirm-password');
    const toggles = fixture.nativeElement.querySelectorAll('.password-visibility-toggle');

    expect(confirmInput.type).toBe('password');
    toggles[1].click();
    fixture.detectChanges();
    expect(confirmInput.type).toBe('text');
  });

  // ==========================================
  // NHÓM 5: UI STATE, API RESPONSE & ROUTING (TC29 - TC35)
  // ==========================================

  it('TC29: should not render Google Sign-in button on registration card', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.google-button')).toBeNull();
  });

  it('TC30: should disable submit button and show loading text when isLoading is true', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);

    fixture.componentInstance['isLoading'].set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Đang đăng ký...');
  });

  it('TC31: should navigate to /dashboard after successful registration', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'new-jwt-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([{ path: 'dashboard', children: [] }]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('TC32: should show backend duplicate username message on HTTP 409', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Tên đăng nhập đã tồn tại' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập đã tồn tại');
  });

  it('TC33: should show backend duplicate email message on HTTP 409', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Email đã được sử dụng' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Email đã được sử dụng');
  });

  it('TC34: should show general fallback error on HTTP 500 server error', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, error: null })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Nguyen An';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'an@gmail.com';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'nguyenan';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'password123';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'password123';
    inputs[4].dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Đăng ký không thành công. Vui lòng thử lại.');
  });

  it('TC35: should render navigation link back to /login page', async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const loginLink = fixture.nativeElement.querySelector('.auth-footer a');
    expect(loginLink).not.toBeNull();
    expect(loginLink.getAttribute('href')).toBe('/login');
    expect(loginLink.textContent).toContain('Đăng nhập');
  });
});
