import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Register } from './register';

describe('U1.1: Đăng ký tài khoản - Bộ 29 Automation Test Scripts', () => {
  async function createTestContext(authServiceMock?: any) {
    const defaultAuthService = {
      register: vi.fn().mockReturnValue(of({ user: { userId: 1, email: 'vana@gmail.com' }, token: 'mock-token' })),
    };
    const authService: any = authServiceMock || defaultAuthService;

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();

    const fillAndSubmit = (data: {
      fullName?: string;
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
    }) => {
      const form = fixture.componentInstance['registerForm'];
      if (data.fullName !== undefined) {
        form.controls.fullName.setValue(data.fullName);
        form.controls.fullName.markAsTouched();
      }
      if (data.email !== undefined) {
        form.controls.email.setValue(data.email);
        form.controls.email.markAsTouched();
      }
      if (data.username !== undefined) {
        form.controls.username.setValue(data.username);
        form.controls.username.markAsTouched();
      }
      if (data.password !== undefined) {
        form.controls.password.setValue(data.password);
        form.controls.password.markAsTouched();
      }
      if (data.confirmPassword !== undefined) {
        form.controls.confirmPassword.setValue(data.confirmPassword);
        form.controls.confirmPassword.markAsTouched();
      }
      fixture.detectChanges();

      fixture.nativeElement.querySelector('form').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
    };

    return { fixture, authService, fillAndSubmit };
  }

  // TC_U1.1_01: Đăng ký tài khoản với thông tin hợp lệ
  it('TC_U1.1_01: Đăng ký tài khoản với thông tin hợp lệ -> Thành công', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });
    await fixture.whenStable();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Nguyễn Văn A',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
    });
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  // TC_U1.1_02: Đăng ký khi bỏ trống họ và tên
  it('TC_U1.1_02: Đăng ký khi bỏ trống họ và tên -> Hiển thị lỗi họ và tên', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: '',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập họ và tên.');
  });

  // TC_U1.1_03: Đăng ký khi bỏ trống tên đăng nhập
  it('TC_U1.1_03: Đăng ký khi bỏ trống tên đăng nhập -> Hiển thị lỗi tên đăng nhập', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana@gmail.com',
      username: '',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
  });

  // TC_U1.1_04: Đăng ký khi bỏ trống mật khẩu
  it('TC_U1.1_04: Đăng ký khi bỏ trống mật khẩu -> Hiển thị lỗi mật khẩu', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: '',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
  });

  // TC_U1.1_05: Đăng ký khi bỏ trống email
  it('TC_U1.1_05: Đăng ký khi bỏ trống email -> Hiển thị lỗi email', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: '',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập email.');
  });

  // TC_U1.1_06: Đăng ký với email không hợp lệ
  it('TC_U1.1_06: Đăng ký với email sai định dạng (vana.gmail.com) -> Báo lỗi', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana.gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Email chưa đúng định dạng.');
  });

  // TC_U1.1_07: Đăng ký với tên đăng nhập đã tồn tại
  it('TC_U1.1_07: Đăng ký với tên đăng nhập đã tồn tại -> Hiển thị thông báo trùng username', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({
          status: 409,
          error: { message: 'Tên đăng nhập đã được sử dụng.' }
        }))
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);
    fillAndSubmit({
      fullName: 'Nguyễn Văn B',
      email: 'vanb@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(fixture.nativeElement.textContent).toContain('Tên đăng nhập đã được sử dụng.');
  });

  // TC_U1.1_08: Đăng ký với họ và tên có chứa chữ số
  it('TC_U1.1_08: Đăng ký với họ và tên chứa chữ số (Nguyễn A1) -> Báo lỗi', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn A1',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
  });

  // TC_U1.1_09: Đăng ký với họ và tên có chứa ký tự đặc biệt
  it('TC_U1.1_09: Đăng ký với họ và tên chứa ký tự đặc biệt (Nguyễn A@) -> Báo lỗi', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn A@',
      email: 'vana@gmail.com',
      username: 'nguyenvana',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên chỉ được chứa chữ cái và khoảng trắng.');
  });

  // TC_U1.1_10: Đăng ký với họ và tên vượt quá 100 ký tự
  it('TC_U1.1_10: Đăng ký với họ và tên dài 101 ký tự -> Báo lỗi vượt quá 100 ký tự', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'A'.repeat(101),
      email: 'vana09@gmail.com',
      username: 'nguyenvana09',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Họ và tên không được vượt quá 100 ký tự.');
  });

  // TC_U1.1_11: Đăng ký với họ và tên có độ dài đúng 100 ký tự
  it('TC_U1.1_11: Đăng ký với họ và tên đúng 100 ký tự -> Chấp nhận thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'A'.repeat(100),
      email: 'vana10@gmail.com',
      username: 'nguyenvana10',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_12: Đăng ký với email viết hoa
  it('TC_U1.1_12: Đăng ký với email viết hoa -> Tự chuẩn hóa thành chữ thường', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'VANA12@GMAIL.COM',
      username: 'nguyenvana12',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'vana12@gmail.com' })
    );
  });

  // TC_U1.1_13: Đăng ký với tên đăng nhập ít hơn 3 ký tự
  it('TC_U1.1_13: Đăng ký tên đăng nhập 2 ký tự (ab) -> Báo lỗi phải từ 3 đến 50 ký tự', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana13@gmail.com',
      username: 'ab',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản phải có từ 3 đến 50 ký tự.');
  });

  // TC_U1.1_14: Đăng ký với tên đăng nhập có ký tự đặc biệt
  it('TC_U1.1_14: Đăng ký username có ký tự đặc biệt (nguyenvana@12) -> Báo lỗi', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana14@gmail.com',
      username: 'nguyenvana@12',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.');
  });

  // TC_U1.1_15: Đăng ký với tên đăng nhập chứa dấu cách
  it('TC_U1.1_15: Đăng ký username chứa dấu cách (nguyen van) -> Báo lỗi', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana15@gmail.com',
      username: 'nguyen van',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.');
  });

  // TC_U1.1_16: Đăng ký với xác nhận mật khẩu không trùng với mật khẩu
  it('TC_U1.1_16: Đăng ký mật khẩu xác nhận không khớp -> Báo lỗi không khớp', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana16@gmail.com',
      username: 'nguyenvana16',
      password: 'Password123@',
      confirmPassword: 'Password124@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu xác nhận không khớp.');
  });

  // TC_U1.1_17: Đăng ký với mật khẩu có chứa khoảng trắng
  it('TC_U1.1_17: Đăng ký với mật khẩu chứa khoảng trắng -> Báo lỗi xác nhận', async () => {
    const { fixture, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana17@gmail.com',
      username: 'nguyenvana17',
      password: 'Pass word 123',
      confirmPassword: 'Pass word 124',
    });

    expect(fixture.nativeElement.textContent).toContain('Mật khẩu xác nhận không khớp.');
  });

  // TC_U1.1_18: Đăng ký khi bỏ trống xác nhận mật khẩu
  it('TC_U1.1_18: Bỏ trống xác nhận mật khẩu -> Báo lỗi vui lòng xác nhận mật khẩu', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana18@gmail.com',
      username: 'nguyenvana18',
      password: 'Password123@',
      confirmPassword: '',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng xác nhận mật khẩu.');
  });

  // TC_U1.1_19: Đăng ký với tên đăng nhập dài hơn 50 ký tự
  it('TC_U1.1_19: Username dài 51 ký tự -> Báo lỗi phải từ 3 đến 50 ký tự', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana19@gmail.com',
      username: 'a'.repeat(51),
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên tài khoản phải có từ 3 đến 50 ký tự.');
  });

  // TC_U1.1_20: Đăng ký với mật khẩu vượt quá 72 ký tự (kiểm tra maxlength HTML)
  it('TC_U1.1_20: Kiểm tra ô mật khẩu có thuộc tính maxlength="72"', async () => {
    const { fixture } = await createTestContext();
    const passwordInput = fixture.nativeElement.querySelector('#register-password') as HTMLInputElement;
    expect(passwordInput.getAttribute('maxlength')).toBe('72');
  });

  // TC_U1.1_21: Đăng ký với tên đăng nhập đúng 3 ký tự
  it('TC_U1.1_21: Tên đăng nhập đúng 3 ký tự (abc) -> Chấp nhận thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana21@gmail.com',
      username: 'abc',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_22: Đăng ký với tên đăng nhập đúng 50 ký tự
  it('TC_U1.1_22: Tên đăng nhập đúng 50 ký tự -> Chấp nhận thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana22@gmail.com',
      username: 'a'.repeat(50),
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_23: Đăng ký với email đã tồn tại
  it('TC_U1.1_23: Đăng ký với email đã tồn tại -> Hiển thị lỗi email đã sử dụng', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({
          status: 409,
          error: { message: 'Email đã được sử dụng.' }
        }))
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);
    fillAndSubmit({
      fullName: 'Nguyễn Văn B',
      email: 'vana@gmail.com',
      username: 'nguyenvana23',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(fixture.nativeElement.textContent).toContain('Email đã được sử dụng.');
  });

  // TC_U1.1_24: Đăng ký khi bỏ trống tất cả các trường
  it('TC_U1.1_24: Bỏ trống tất cả các trường -> Hiển thị đồng loạt 5 thông báo lỗi bắt buộc', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập họ và tên.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập email.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên đăng nhập.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập mật khẩu.');
    expect(fixture.nativeElement.textContent).toContain('Vui lòng xác nhận mật khẩu.');
  });

  // TC_U1.1_25: Đăng ký với mật khẩu ít hơn 8 ký tự
  it('TC_U1.1_25: Mật khẩu 7 ký tự (Test@12) -> Báo lỗi ít nhất 8 ký tự', async () => {
    const { fixture, authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana25@gmail.com',
      username: 'nguyenvana25',
      password: 'Test@12',
      confirmPassword: 'Test@12',
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Mật khẩu phải có ít nhất 8 ký tự.');
  });

  // TC_U1.1_26: Đăng ký với mật khẩu đúng 8 ký tự
  it('TC_U1.1_26: Mật khẩu đúng 8 ký tự (Test@123) -> Chấp nhận thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana26@gmail.com',
      username: 'nguyenvana26',
      password: 'Test@123',
      confirmPassword: 'Test@123',
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_27: Đăng ký với mật khẩu đúng 72 ký tự
  it('TC_U1.1_27: Mật khẩu đúng 72 ký tự -> Chấp nhận thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana27@gmail.com',
      username: 'nguyenvana27',
      password: 'A'.repeat(72),
      confirmPassword: 'A'.repeat(72),
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_28: Đăng ký với tên đăng nhập có chứa dấu gạch dưới
  it('TC_U1.1_28: Tên đăng nhập có chứa dấu gạch dưới (nguyen_van28) -> Thành công', async () => {
    const { authService, fillAndSubmit } = await createTestContext();
    fillAndSubmit({
      fullName: 'Nguyễn Văn A',
      email: 'vana28@gmail.com',
      username: 'nguyen_van28',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(authService.register).toHaveBeenCalled();
  });

  // TC_U1.1_29: Đăng ký với email đã tồn tại nhưng khác chữ hoa/thường
  it('TC_U1.1_29: Email tồn tại nhưng nhập HOA (VANA@GMAIL.COM) -> Báo lỗi trùng email', async () => {
    const authService = {
      register: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({
          status: 409,
          error: { message: 'Email đã được sử dụng.' }
        }))
      ),
    };
    const { fixture, fillAndSubmit } = await createTestContext(authService);
    fillAndSubmit({
      fullName: 'Nguyễn Văn B',
      email: 'VANA@GMAIL.COM',
      username: 'nguyenvana29',
      password: 'Password123@',
      confirmPassword: 'Password123@',
    });

    expect(fixture.nativeElement.textContent).toContain('Email đã được sử dụng.');
  });
});
