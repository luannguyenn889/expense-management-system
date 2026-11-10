describe('U1.2: E2E Automation Test - 11 Test Cases Đăng Nhập Bằng Mật Khẩu', () => {
  beforeEach(() => {
    // 1. Truy cập vào trang đăng nhập trước mỗi ca kiểm thử
    cy.visit('/login');
  });

  // TC_U1.2_01
  it('TC_U1.2_01_login_withValidData_shouldRedirectToDashboard', () => {
    // 1. Arrange (Given): Chuẩn bị tài khoản hợp lệ và mock API login thành công
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Đăng nhập thành công',
        data: {
          token: 'mock-jwt-token-12345',
          user: { fullName: 'Nguyễn Văn A', username: 'nguyenvana' },
        },
      },
    }).as('loginSuccess');

    // 2. Act (When): Nhập thông tin đăng nhập hợp lệ và nhấn Đăng nhập
    cy.get('input[formControlName="username"]').type('nguyenvana');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Chuyển hướng về trang chủ /dashboard và tạo phiên đăng nhập
    cy.wait('@loginSuccess');
    cy.url().should('include', '/dashboard');
  });

  // TC_U1.2_02
  it('TC_U1.2_02_login_withIncorrectPassword_shouldShowErrorMessage', () => {
    // 1. Arrange (Given): Mock API login trả về lỗi sai mật khẩu
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { code: 401, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' },
    }).as('loginWrongPass');

    // 2. Act (When): Nhập đúng tên đăng nhập nhưng mật khẩu sai
    cy.get('input[formControlName="username"]').type('nguyenvana');
    cy.get('input[formControlName="password"]').type('Wrong@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo lỗi và không đăng nhập thành công
    cy.wait('@loginWrongPass');
    cy.get('.form-alert').should('be.visible').and('contain.text', 'Tên đăng nhập hoặc mật khẩu không chính xác');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_03
  it('TC_U1.2_03_login_withNonExistentAccount_shouldShowErrorMessage', () => {
    // 1. Arrange (Given): Mock API login trả về lỗi tài khoản không tồn tại
    cy.intercept('POST', '**/auth/login', {
      statusCode: 404,
      body: { code: 404, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' },
    }).as('loginNonExistUser');

    // 2. Act (When): Nhập tài khoản chưa đăng ký
    cy.get('input[formControlName="username"]').type('userabc');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo lỗi và không chuyển hướng
    cy.wait('@loginNonExistUser');
    cy.get('.form-alert').should('be.visible').and('contain.text', 'Tên đăng nhập hoặc mật khẩu không chính xác');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_04
  it('TC_U1.2_04_login_withEmptyUsername_shouldShowRequiredError', () => {
    // 1. Arrange & Act: Để trống tên đăng nhập, chỉ nhập mật khẩu và nhấn Đăng nhập
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 2. Assert (Then): Hiển thị thông báo lỗi "Vui lòng nhập tên đăng nhập."
    cy.contains('Vui lòng nhập tên đăng nhập.').should('be.visible');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_05
  it('TC_U1.2_05_login_withEmptyPassword_shouldShowRequiredError', () => {
    // 1. Arrange & Act: Nhập tên đăng nhập, để trống mật khẩu và nhấn Đăng nhập
    cy.get('input[formControlName="username"]').type('nguyenvana');
    cy.get('button[type="submit"]').click();

    // 2. Assert (Then): Hiển thị thông báo lỗi "Vui lòng nhập mật khẩu."
    cy.contains('Vui lòng nhập mật khẩu.').should('be.visible');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_06
  it('TC_U1.2_06_login_withEmptyAllFields_shouldShowAllRequiredErrors', () => {
    // 1. Act: Để trống cả 2 trường và nhấn Đăng nhập
    cy.get('button[type="submit"]').click();

    // 2. Assert (Then): Hiển thị đồng thời cả 2 thông báo lỗi bắt buộc
    cy.contains('Vui lòng nhập tên đăng nhập.').should('be.visible');
    cy.contains('Vui lòng nhập mật khẩu.').should('be.visible');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_07
  it('TC_U1.2_07_login_withEmailContainingLeadingTrailingSpaces_shouldTrimAndLoginSuccess', () => {
    // 1. Arrange (Given): Kiểm tra request được tự động cắt khoảng trắng trước khi gửi
    cy.intercept('POST', '**/auth/login', (req) => {
      expect(req.body.username).to.equal('vana@gmail.com');
      req.reply({
        statusCode: 200,
        body: {
          code: 200,
          message: 'Đăng nhập thành công',
          data: {
            token: 'mock-jwt-token-trimmed-email',
            user: { fullName: 'Nguyễn Văn A', username: 'vana' },
          },
        },
      });
    }).as('loginTrimEmail');

    // 2. Act (When): Nhập email có khoảng trắng ở đầu và cuối
    cy.get('input[formControlName="username"]').type('   vana@gmail.com   ');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hệ thống cắt khoảng trắng, đăng nhập thành công và về trang chủ
    cy.wait('@loginTrimEmail');
    cy.url().should('include', '/dashboard');
  });

  // TC_U1.2_08
  it('TC_U1.2_08_login_withUsernameContainingLeadingTrailingSpaces_shouldTrimAndLoginSuccess', () => {
    // 1. Arrange (Given): Kiểm tra request tự động cắt khoảng trắng tên đăng nhập
    cy.intercept('POST', '**/auth/login', (req) => {
      expect(req.body.username).to.equal('nguyenvana');
      req.reply({
        statusCode: 200,
        body: {
          code: 200,
          message: 'Đăng nhập thành công',
          data: {
            token: 'mock-jwt-token-trimmed-user',
            user: { fullName: 'Nguyễn Văn A', username: 'nguyenvana' },
          },
        },
      });
    }).as('loginTrimUsername');

    // 2. Act (When): Nhập tên đăng nhập có khoảng trắng ở đầu và cuối
    cy.get('input[formControlName="username"]').type('   nguyenvana   ');
    cy.get('input[formControlName="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hệ thống cắt khoảng trắng, đăng nhập thành công
    cy.wait('@loginTrimUsername');
    cy.url().should('include', '/dashboard');
  });

  // TC_U1.2_09
  it('TC_U1.2_09_login_withPasswordLessThan8Chars_shouldShowMinLengthError', () => {
    // 1. Arrange & Act: Nhập mật khẩu nhỏ hơn 8 ký tự (Abc123)
    cy.get('input[formControlName="username"]').type('user01');
    cy.get('input[formControlName="password"]').type('Abc123');
    cy.get('button[type="submit"]').click();

    // 2. Assert (Then): Hiển thị thông báo "Mật khẩu phải có ít nhất 8 ký tự."
    cy.contains('Mật khẩu phải có ít nhất 8 ký tự.').should('be.visible');
    cy.url().should('include', '/login');
  });

  // TC_U1.2_10
  it('TC_U1.2_10_login_passwordMaxLength72_shouldNotAllowMoreThan72Chars', () => {
    // 1. Arrange (Given): Chuỗi gồm 75 ký tự
    const longPassword75 = 'Pass12345'.repeat(8) + 'xyz'; // 9*8 + 3 = 75 ký tự
    const expectedPassword72 = longPassword75.slice(0, 72);

    // 2. Act (When): Nhập tên đăng nhập và thử gõ vượt quá 72 ký tự
    cy.get('input[formControlName="username"]').type('user01');
    cy.get('input[formControlName="password"]').type(longPassword75);

    // 3. Assert (Then): Input có thuộc tính maxlength="72", chỉ nhận đúng 72 ký tự và không báo lỗi
    cy.get('input[formControlName="password"]').should('have.attr', 'maxlength', '72');
    cy.get('input[formControlName="password"]').should('have.value', expectedPassword72);
    cy.contains('Mật khẩu không được vượt quá 72 ký tự.').should('not.exist');
  });

  // TC_U1.2_11
  it('TC_U1.2_11_login_caseSensitivePassword_shouldShowErrorMessage', () => {
    // 1. Arrange (Given): Mock API từ chối mật khẩu do sai hoa/thường (test@123 thay vì Test@123)
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { code: 401, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' },
    }).as('loginCaseMismatch');

    // 2. Act (When): Nhập đúng username, nhưng nhập sai chữ hoa chữ thường của password
    cy.get('input[formControlName="username"]').type('user01');
    cy.get('input[formControlName="password"]').type('test@123');
    cy.get('button[type="submit"]').click();

    // 3. Assert (Then): Hiển thị thông báo lỗi và không tạo phiên đăng nhập
    cy.wait('@loginCaseMismatch');
    cy.get('.form-alert').should('be.visible').and('contain.text', 'Tên đăng nhập hoặc mật khẩu không chính xác');
    cy.url().should('include', '/login');
  });
});
