describe('U1.1: E2E Automation Test - 14 Test Cases Đăng Ký Tài Khoản', () => {
  beforeEach(() => {
    // Truy cập vào trang đăng ký trước mỗi ca kiểm thử
    cy.visit('/register');
  });

    // TC_U1.1_01
  it('TC_U1.1_01_register_withValidData_shouldRedirectToDashboard', () => {
    // 1. Arrange (Given): Chuẩn bị thông tin hợp lệ với dữ liệu duy nhất
    const timestamp = Date.now();
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, message: 'Đăng ký tài khoản thành công', data: { token: 'mock-token' } },
    }).as('registerSuccess');

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Đăng nhập thành công',
        data: {
          token: 'mock-jwt-token-12345',
          user: { fullName: 'Nguyễn Văn A', username: `nguyenvana_${timestamp}` },
        },
      },
    }).as('loginSuccess');

    cy.intercept('GET', '**/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'OK', data: [] },
    }).as('getWallets');

    // 2. Act (When): Điền đầy đủ thông tin hợp lệ và nhấn Đăng ký
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana_${timestamp}@gmail.com`);
    cy.get('input[formControlName="username"]').type(`nguyenvana_${timestamp}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hệ thống chuyển hướng vào dashboard/trang chủ
    cy.wait('@registerSuccess');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_02
  it('TC_U1.1_02_register_withEmptyFullName_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Để trống họ và tên, nhập các trường khác
    cy.get('input[formControlName="email"]').type('vana02@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana02');
    cy.get('input[formControlName="password"]').type('Test123@');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo bắt buộc nhập họ và tên
    cy.contains('Vui lòng nhập họ và tên.').should('be.visible');
  });

  // TC_U1.1_03
  it('TC_U1.1_03_register_withEmptyUsername_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Để trống tên đăng nhập
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana03@gmail.com');
    cy.get('input[formControlName="password"]').type('Test123@');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo bắt buộc nhập tên đăng nhập
    cy.contains('Vui lòng nhập tên đăng nhập.').should('be.visible');
  });

  // TC_U1.1_04
  it('TC_U1.1_04_register_withEmptyPassword_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Để trống mật khẩu
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana04@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana04');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo bắt buộc nhập mật khẩu
    cy.contains('Vui lòng nhập mật khẩu.').should('be.visible');
  });

  // TC_U1.1_05
  it('TC_U1.1_05_register_withEmptyEmail_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Để trống email
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="username"]').type('nguyenvana05');
    cy.get('input[formControlName="password"]').type('Test123@');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo bắt buộc nhập email
    cy.contains('Vui lòng nhập email.').should('be.visible');
  });

  // TC_U1.1_06
  it('TC_U1.1_06_register_withInvalidEmailFormat_shouldShowFormatError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Nhập email sai định dạng
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana.gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana06');
    cy.get('input[formControlName="password"]').type('Test123@');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi email chưa đúng định dạng
    cy.contains('Email chưa đúng định dạng.').should('be.visible');
  });

  // TC_U1.1_07
  it('TC_U1.1_07_register_withDuplicateUsername_shouldShowConflictError', () => {
    // 1. Arrange (Given): Mô phỏng backend trả lỗi trùng tên đăng nhập
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 409,
      body: { code: 409, message: 'Tên đăng nhập đã được sử dụng.' },
    }).as('registerDupUser');

    // 2. Act (When): Nhập thông tin với username đã tồn tại
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn B');
    cy.get('input[formControlName="email"]').type('vanb@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana');
    cy.get('input[formControlName="password"]').type('Test123@');
    cy.get('input[formControlName="confirmPassword"]').type('Test123@');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi trùng tên đăng nhập
    cy.wait('@registerDupUser');
    cy.contains('Tên đăng nhập đã được sử dụng.').should('be.visible');
  });

  // TC_U1.1_08
  it('TC_U1.1_08_register_withFullNameContainingDigits_shouldShowPatternError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Họ tên chứa chữ số
    cy.get('input[formControlName="fullName"]').type('Nguyễn A1');
    cy.get('input[formControlName="email"]').type('vana08@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana08');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi họ và tên chỉ được chứa chữ cái và khoảng trắng
    cy.contains('Họ và tên chỉ được chứa chữ cái và khoảng trắng.').should('be.visible');
  });

  // TC_U1.1_10
  it('TC_U1.1_10_register_withFullNameExceeding100Chars_shouldShowMaxLengthError', () => {
    // 1. Arrange (Given): Chuỗi dài 101 ký tự
    const longName = 'Nguyen Van A '.repeat(8).substring(0, 101);

    // 2. Act (When):
    cy.get('input[formControlName="fullName"]').type(longName);
    cy.get('input[formControlName="email"]').type('vana10@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana10');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi vượt quá 100 ký tự
    cy.contains('Họ và tên không được vượt quá 100 ký tự.').should('be.visible');
  });

  // TC_U1.1_13
  it('TC_U1.1_13_register_withUsernameLessThan3Chars_shouldShowMinLengthError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Username 2 ký tự (ab)
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana13@gmail.com');
    cy.get('input[formControlName="username"]').type('ab');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi 3 đến 50 ký tự
    cy.contains('Tên tài khoản phải có từ 3 đến 50 ký tự.').should('be.visible');
  });

  // TC_U1.1_14
  it('TC_U1.1_14_register_withUsernameContainingSpecialChar_shouldShowPatternError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Username có ký tự @
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana14@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana@12');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi tên tài khoản chỉ được chứa chữ không dấu, số, gạch dưới
    cy.contains('Tên tài khoản chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới.').should('be.visible');
  });

  // TC_U1.1_16
  it('TC_U1.1_16_register_withPasswordMismatch_shouldShowMismatchError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Xác nhận mật khẩu khác mật khẩu
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana16@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana16');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@124');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi mật khẩu xác nhận không khớp
    cy.contains('Mật khẩu xác nhận không khớp.').should('be.visible');
  });

  // TC_U1.1_23
  it('TC_U1.1_23_register_withDuplicateEmail_shouldShowConflictError', () => {
    // 1. Arrange (Given): Mô phỏng backend trả lỗi trùng email
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 409,
      body: { code: 409, message: 'Email đã được sử dụng.' },
    }).as('registerDupEmail');

    // 2. Act (When):
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn B');
    cy.get('input[formControlName="email"]').type('vana@gmail.com');
    cy.get('input[formControlName="username"]').type(`nguyenvana23_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi email đã được sử dụng
    cy.wait('@registerDupEmail');
    cy.contains('Email đã được sử dụng.').should('be.visible');
  });

  // TC_U1.1_25
  it('TC_U1.1_25_register_withPasswordLessThan8Chars_shouldShowMinLengthError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Mật khẩu 7 ký tự
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana25@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana25');
    cy.get('input[formControlName="password"]').type('Test@12');
    cy.get('input[formControlName="confirmPassword"]').type('Test@12');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi mật khẩu phải có ít nhất 8 ký tự
    cy.contains('Mật khẩu phải có ít nhất 8 ký tự.').should('be.visible');
  });
});
