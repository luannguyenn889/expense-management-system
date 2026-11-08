import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('Register', () => {
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
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên tài khoản.');
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

  it('should return to login after a successful registration', async () => {
    const authService = { register: vi.fn().mockReturnValue(of({ token: 'test-token' })) };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyen An', 'user@example.com', 'nguyenan', 'password123', 'password123'];
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
      fullName: 'Nguyen An',
      username: 'nguyenan',
      email: 'user@example.com',
      password: 'password123',
    });
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
