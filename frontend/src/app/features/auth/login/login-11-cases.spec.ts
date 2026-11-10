import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Login } from './login';

describe('U1.2: Đăng nhập bằng mật khẩu - Bộ 11 Automation Test Scripts', () => {
  async function createTestContext(authServiceMock?: any) {
    const defaultAuthService = {
      login: vi.fn().mockReturnValue(
        of({
          token: 'mock-jwt-token-12345',
          user: { fullName: 'Nguyễn Văn A', username: 'nguyenvana' },
        }),
      ),
    };
    const authService: any = authServiceMock || defaultAuthService;

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    const fillAndSubmit = (data: { username?: string; password?: string }) => {
      const usernameInput = fixture.nativeElement.querySelector(
        'input[formControlName="username"]',
      ) as HTMLInputElement;
      const passwordInput = fixture.nativeElement.querySelector(
        'input[formControlName="password"]',
      ) as HTMLInputElement;

      if (data.username !== undefined) {
        usernameInput.value = data.username;
        usernameInput.dispatchEvent(new Event('input'));
      }
      if (data.password !== undefined) {
        passwordInput.value = data.password;
        passwordInput.dispatchEvent(new Event('input'));
      }

      fixture.nativeElement.querySelector('form').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
    };

    return { fixture, authService, fillAndSubmit };
  }

  // TC_U1.2_01: Đăng nhập với thông tin hợp lệ
  it('TC_U1.2_01: Đăng nhập với thông tin hợp lệ -> Đăng nhập thành công và chuyển hướng về trang chủ', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: 'nguyenvana', password: 'Test@123' });
    await fixture.whenStable();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'nguyenvana',
      password: 'Test@123',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  // TC_U1.2_02: Đăng nhập với mật khẩu không chính xác
  it('TC_U1.2_02: Đăng nhập với mật khẩu không chính xác -> Hiển thị lỗi mật khẩu không chính xác', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
            }),
        ),
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);

    fillAndSubmit({ username: 'nguyenvana', password: 'Wrong@123' });

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  // TC_U1.2_03: Đăng nhập với tên tài khoản không tồn tại
  it('TC_U1.2_03: Đăng nhập với tên tài khoản không tồn tại -> Hiển thị lỗi tài khoản không chính xác', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 404,
              error: { message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
            }),
        ),
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);

    fillAndSubmit({ username: 'userabc', password: 'Test@123' });

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  // TC_U1.2_04: Đăng nhập khi bỏ trống tên tài khoản
  it('TC_U1.2_04: Đăng nhập khi bỏ trống tên tài khoản -> Hiển thị thông báo "Vui lòng nhập tên đăng nhập."', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: '', password: 'Test@123' });

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
  });

  // TC_U1.2_05: Đăng nhập khi bỏ trống mật khẩu
  it('TC_U1.2_05: Đăng nhập khi bỏ trống mật khẩu -> Hiển thị thông báo "Vui lòng nhập mật khẩu."', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: 'nguyenvana', password: '' });

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  // TC_U1.2_06: Đăng nhập khi bỏ trống cả 2 trường tên đăng nhập và mật khẩu
  it('TC_U1.2_06: Đăng nhập khi bỏ trống cả 2 trường -> Hiển thị cả 2 thông báo lỗi bắt buộc', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: '', password: '' });

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  // TC_U1.2_07: Đăng nhập bằng email có khoảng trắng ở đầu và cuối
  it('TC_U1.2_07: Đăng nhập bằng email có khoảng trắng ở đầu và cuối -> Cắt khoảng trắng và đăng nhập thành công', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: '   vana@gmail.com   ', password: 'Test@123' });
    await fixture.whenStable();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'vana@gmail.com',
      password: 'Test@123',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  // TC_U1.2_08: Đăng nhập với tên đăng nhập có khoảng trắng ở đầu và cuối
  it('TC_U1.2_08: Đăng nhập với tên đăng nhập có khoảng trắng ở đầu và cuối -> Cắt khoảng trắng và đăng nhập thành công', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: '   nguyenvana   ', password: 'Test@123' });
    await fixture.whenStable();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'nguyenvana',
      password: 'Test@123',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  // TC_U1.2_09: Đăng nhập với mật khẩu có độ dài nhỏ hơn 8 ký tự
  it('TC_U1.2_09: Đăng nhập với mật khẩu nhỏ hơn 8 ký tự -> Hiển thị lỗi "Mật khẩu phải có ít nhất 8 ký tự."', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();

    fillAndSubmit({ username: 'user01', password: 'Abc123' });

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu phải có ít nhất 8 ký tự.');
  });

  // TC_U1.2_10: Kiểm tra không cho nhập mật khẩu vượt quá 72 ký tự
  it('TC_U1.2_10: Kiểm tra thuộc tính maxlength 72 ký tự của trường mật khẩu', async () => {
    const { fixture } = await createTestContext();
    const passwordInput = fixture.nativeElement.querySelector(
      'input[formControlName="password"]',
    ) as HTMLInputElement;

    expect(passwordInput.getAttribute('maxlength')).toBe('72');
  });

  // TC_U1.2_11: Kiểm tra hệ thống phân biệt mật khẩu chữ hoa/ chữ thường
  it('TC_U1.2_11: Mật khẩu test@123 sai chữ hoa/thường -> Báo lỗi không chính xác', async () => {
    const authService = {
      login: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
            }),
        ),
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);

    fillAndSubmit({ username: 'user01', password: 'test@123' });

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập hoặc mật khẩu không chính xác');
  });
});
