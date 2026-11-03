import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập email.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  it('should submit valid credentials and handle the API response', async () => {
    const authService = { login: vi.fn().mockReturnValue(of({ token: 'test-token' })) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'wallets', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user@example.com';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should show an API error after a rejected sign-in', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(throwError(() => new Error('Thông tin đăng nhập không đúng.'))),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'user@example.com';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'password123';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Thông tin đăng nhập không đúng.');
  });
});
