describe('U1.1: E2E Automation Test - 35 Test Cases Đăng Ký Tài Khoản', () => {
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

  // TC_U1.1_09
  it('TC_U1.1_09_register_withFullNameContainingSpecialChar_shouldShowPatternError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Họ tên chứa ký tự đặc biệt
    cy.get('input[formControlName="fullName"]').type('Nguyễn A@');
    cy.get('input[formControlName="email"]').type('vana09@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana09');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi họ tên chỉ chứa chữ cái và khoảng trắng
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

  // TC_U1.1_11
  it('TC_U1.1_11_register_withFullNameExact100Chars_shouldBeAccepted', () => {
    // 1. Arrange (Given): Chuỗi đúng 100 ký tự
    const exact100Name = 'Nguyen Van A '.repeat(8).substring(0, 100);
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, message: 'Đăng ký thành công', data: { token: 'mock-token' } },
    }).as('register100Success');

    // 2. Act (When):
    cy.get('input[formControlName="fullName"]').type(exact100Name);
    cy.get('input[formControlName="email"]').type(`vana11_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type(`nguyenvana11_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@register100Success');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_12
  it('TC_U1.1_12_register_withUppercaseEmail_shouldNormalizeToLowercase', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/users/register', (req) => {
      expect(req.body.email).to.equal('vana12@gmail.com');
      req.reply({ statusCode: 201, body: { code: 201, data: { token: 'mock-token' } } });
    }).as('registerNormalizedEmail');

    // 2. Act (When): Nhập email IN HOA
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('VANA12@GMAIL.COM');
    cy.get('input[formControlName="username"]').type(`nguyenvana12_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Email gửi lên đã được chuyển về chữ thường
    cy.wait('@registerNormalizedEmail');
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

  // TC_U1.1_15
  it('TC_U1.1_15_register_withUsernameContainingSpace_shouldShowPatternError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Username chứa khoảng trắng
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana15@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyen van');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi
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

  // TC_U1.1_17
  it('TC_U1.1_17_register_withPasswordContainingSpace_shouldValidate', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Mật khẩu có khoảng trắng và không khớp
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana17@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana17');
    cy.get('input[formControlName="password"]').type('Test 123');
    cy.get('input[formControlName="confirmPassword"]').type('Test 124');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Mật khẩu xác nhận không khớp.').should('be.visible');
  });

  // TC_U1.1_18
  it('TC_U1.1_18_register_withEmptyConfirmPassword_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Bỏ trống xác nhận mật khẩu
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana18@gmail.com');
    cy.get('input[formControlName="username"]').type('nguyenvana18');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi vui lòng xác nhận mật khẩu
    cy.contains('Vui lòng xác nhận mật khẩu.').should('be.visible');
  });

  // TC_U1.1_19
  it('TC_U1.1_19_register_withUsernameExceeding50Chars_shouldShowMaxLengthError', () => {
    // 1. Arrange (Given): Username 51 ký tự
    const longUsername = 'a'.repeat(51);

    // 2. Act (When):
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type('vana19@gmail.com');
    cy.get('input[formControlName="username"]').type(longUsername);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi phải từ 3 đến 50 ký tự
    cy.contains('Tên tài khoản phải có từ 3 đến 50 ký tự.').should('be.visible');
  });

  // TC_U1.1_20
  it('TC_U1.1_20_register_passwordInput_shouldHaveMaxlength72Attribute', () => {
    // 1. Arrange (Given) & 2. Act (When)
    // 3. Assert (Then): Kiểm tra ô input có thuộc tính maxlength="72"
    cy.get('#register-password').should('have.attr', 'maxlength', '72');
  });

  // TC_U1.1_21
  it('TC_U1.1_21_register_withUsernameExact3Chars_shouldBeAccepted', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, data: { token: 'mock-token' } },
    }).as('register3CharsSuccess');

    // 2. Act (When): Username đúng 3 ký tự
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana21_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type('abc');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@register3CharsSuccess');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_22
  it('TC_U1.1_22_register_withUsernameExact50Chars_shouldBeAccepted', () => {
    // 1. Arrange (Given)
    const exact50Username = 'a'.repeat(50);
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, data: { token: 'mock-token' } },
    }).as('register50CharsSuccess');

    // 2. Act (When): Username đúng 50 ký tự
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana22_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type(exact50Username);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@register50CharsSuccess');
    cy.url().should('not.include', '/register');
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

  // TC_U1.1_24
  it('TC_U1.1_24_register_withAllFieldsEmpty_shouldShowAllValidationErrors', () => {
    // 1. Arrange (Given)
    // 2. Act (When): Bấm Đăng ký ngay khi chưa nhập gì
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị đồng loạt các thông báo lỗi bắt buộc
    cy.contains('Vui lòng nhập họ và tên.').should('be.visible');
    cy.contains('Vui lòng nhập email.').should('be.visible');
    cy.contains('Vui lòng nhập tên đăng nhập.').should('be.visible');
    cy.contains('Vui lòng nhập mật khẩu.').should('be.visible');
    cy.contains('Vui lòng xác nhận mật khẩu.').should('be.visible');
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

  // TC_U1.1_26
  it('TC_U1.1_26_register_withPasswordExact8Chars_shouldBeAccepted', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, data: { token: 'mock-token' } },
    }).as('registerPass8Success');

    // 2. Act (When): Mật khẩu đúng 8 ký tự
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana26_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type(`nguyenvana26_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@registerPass8Success');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_27
  it('TC_U1.1_27_register_withPasswordExact72Chars_shouldBeAccepted', () => {
    // 1. Arrange (Given): Mật khẩu đúng 72 ký tự
    const exact72Password = 'A'.repeat(72);
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, data: { token: 'mock-token' } },
    }).as('registerPass72Success');

    // 2. Act (When):
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana27_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type(`nguyenvana27_${Date.now()}`);
    cy.get('input[formControlName="password"]').type(exact72Password);
    cy.get('input[formControlName="confirmPassword"]').type(exact72Password);
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@registerPass72Success');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_28
  it('TC_U1.1_28_register_withUsernameContainingUnderscore_shouldBeAccepted', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 201,
      body: { code: 201, data: { token: 'mock-token' } },
    }).as('registerUnderscoreSuccess');

    // 2. Act (When): Username chứa dấu gạch dưới
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="email"]').type(`vana28_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="username"]').type(`nguyen_van28_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then):
    cy.wait('@registerUnderscoreSuccess');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_29
  it('TC_U1.1_29_register_withDuplicateEmailUppercase_shouldShowConflictError', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 409,
      body: { code: 409, message: 'Email đã được sử dụng.' },
    }).as('registerDupEmailUpper');

    // 2. Act (When): Nhập email IN HOA trùng lặp
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn B');
    cy.get('input[formControlName="email"]').type('VANA@GMAIL.COM');
    cy.get('input[formControlName="username"]').type(`nguyenvana29_${Date.now()}`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Báo lỗi email đã được sử dụng
    cy.wait('@registerDupEmailUpper');
    cy.contains('Email đã được sử dụng.').should('be.visible');
  });

  // TC_U1.1_30
  it('TC_U1.1_30_register_togglePasswordVisibility_shouldShowAndHidePassword', () => {
    // 1. Arrange (Given): Nhập mật khẩu vào trường Mật khẩu
    cy.get('#register-password').type('Test@123');

    // 2. Act & Assert: Ban đầu mật khẩu hiển thị dưới dạng ký tự ẩn
    cy.get('#register-password').should('have.attr', 'type', 'password');

    // 3. Act & Assert: Nhấn biểu tượng con mắt -> mật khẩu hiển thị rõ (type="text")
    cy.get('#register-password').parent().find('.password-visibility-toggle').click();
    cy.get('#register-password').should('have.attr', 'type', 'text');

    // 4. Act & Assert: Nhấn biểu tượng con mắt lần nữa -> mật khẩu được ẩn trở lại (type="password")
    cy.get('#register-password').parent().find('.password-visibility-toggle').click();
    cy.get('#register-password').should('have.attr', 'type', 'password');
  });

  // TC_U1.1_31
  it('TC_U1.1_31_register_toggleConfirmPasswordVisibility_shouldShowAndHidePassword', () => {
    // 1. Arrange (Given): Nhập mật khẩu vào trường Xác nhận mật khẩu
    cy.get('#register-confirm-password').type('Test@123');

    // 2. Act & Assert: Ban đầu mật khẩu hiển thị dưới dạng ký tự ẩn
    cy.get('#register-confirm-password').should('have.attr', 'type', 'password');

    // 3. Act & Assert: Nhấn biểu tượng con mắt -> mật khẩu hiển thị rõ (type="text")
    cy.get('#register-confirm-password').parent().find('.password-visibility-toggle').click();
    cy.get('#register-confirm-password').should('have.attr', 'type', 'text');

    // 4. Act & Assert: Nhấn biểu tượng con mắt lần nữa -> mật khẩu được ẩn trở lại (type="password")
    cy.get('#register-confirm-password').parent().find('.password-visibility-toggle').click();
    cy.get('#register-confirm-password').should('have.attr', 'type', 'password');
  });

  // TC_U1.1_32
  it('TC_U1.1_32_register_withEmailContainingLeadingTrailingSpaces_shouldTrimAndRegister', () => {
    // 1. Arrange (Given): Email có khoảng trắng ở đầu và cuối
    const timestamp = Date.now();
    cy.intercept('POST', '**/api/v1/users/register', (req) => {
      expect(req.body.email).to.equal(`vana32_${timestamp}@gmail.com`);
      req.reply({
        statusCode: 201,
        body: { code: 201, message: 'Đăng ký tài khoản thành công', data: { token: 'mock-token' } },
      });
    }).as('registerTrimEmail');

    // 2. Act (When): Nhập email có khoảng trắng đầu/cuối
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="username"]').type(`nguyenvana32_${timestamp}`);
    cy.get('input[formControlName="email"]').type(`   vana32_${timestamp}@gmail.com   `);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hệ thống tự động cắt khoảng trắng và đăng ký thành công
    cy.wait('@registerTrimEmail');
    cy.url().should('not.include', '/register');
  });

  // TC_U1.1_33
  it('TC_U1.1_33_register_withCaseInsensitiveDuplicateUsername_shouldShowConflictError', () => {
    // 1. Arrange (Given): Mock lỗi trùng tên đăng nhập khác hoa/thường
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 409,
      body: { code: 409, message: 'Tên đăng nhập đã được sử dụng.' },
    }).as('registerDupUserCase');

    // 2. Act (When): Nhập username NguyenVanA khi nguyenvana đã tồn tại
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn B');
    cy.get('input[formControlName="username"]').type('NguyenVanA');
    cy.get('input[formControlName="email"]').type(`nguyenvana35_${Date.now()}@gmail.com`);
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo "Tên đăng nhập đã được sử dụng."
    cy.wait('@registerDupUserCase');
    cy.contains('Tên đăng nhập đã được sử dụng.').should('be.visible');
  });

  // TC_U1.1_34
  it('TC_U1.1_34_register_withEmailMissingDomainPart_shouldShowFormatError', () => {
    // 1. Arrange: Mock API báo lỗi định dạng email thiếu tên miền
    cy.intercept('POST', '**/api/v1/users/register', {
      statusCode: 400,
      body: { code: 400, message: 'Email chưa đúng định dạng.' },
    }).as('registerInvalidEmailDomain');

    // 2. Act: Nhập email thiếu phần tên miền (abc@gmail) và submit
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="username"]').type(`nguyenvana33_${Date.now()}`);
    cy.get('input[formControlName="email"]').type('abc@gmail');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo lỗi "Email chưa đúng định dạng."
    cy.contains('Email chưa đúng định dạng.').should('be.visible');
  });

  // TC_U1.1_35
  it('TC_U1.1_35_register_withEmailInvalidDomainSyntax_shouldShowFormatError', () => {
    // 1. Arrange & Act: Nhập email có tên miền không hợp lệ (abc@.com)
    cy.get('input[formControlName="fullName"]').type('Nguyễn Văn A');
    cy.get('input[formControlName="username"]').type(`nguyenvana36_${Date.now()}`);
    cy.get('input[formControlName="email"]').type('abc@.com');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('input[formControlName="confirmPassword"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 2. Assert (Then): Hiển thị thông báo lỗi "Email chưa đúng định dạng."
    cy.contains('Email chưa đúng định dạng.').should('be.visible');
  });
});
