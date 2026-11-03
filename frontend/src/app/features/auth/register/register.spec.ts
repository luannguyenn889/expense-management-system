import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('Register', () => {
  it('should reject a password confirmation mismatch', async () => {
    const authService = { register: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyen An', 'user@example.com', 'password123', 'different123'];
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

  it('should display success after a valid registration response', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        of({ userId: 1, fullName: 'Nguyen An', email: 'user@example.com' }),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const values = ['Nguyen An', 'user@example.com', 'password123', 'password123'];
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
      email: 'user@example.com',
      password: 'password123',
    });
    expect(fixture.nativeElement.textContent).toContain('Đăng ký thành công');
  });
});
