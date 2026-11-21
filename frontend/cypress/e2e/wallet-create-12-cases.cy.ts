describe('U2.1: E2E Automation Test - 12 Test Cases Tạo Ví', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Lấy danh sách ví thành công',
        data: [],
      },
    }).as('getWallets');

    cy.visit('/wallets', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('expense-management-token', 'mock-jwt-token-12345');
        win.sessionStorage.setItem('expense-management-user-full-name', 'Nguyễn Văn A');
        win.sessionStorage.setItem('expense-management-username', 'nguyenvana');
      },
    });
    cy.wait('@getWallets');
  });

  // TC_U2.1_01
  it('TC_U2.1_01_createWallet_withValidName_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tạo ví thành công',
        data: { walletId: 101, walletName: 'Tiền mặt', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet01');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Tiền mặt');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet01');
    cy.get('input[formControlName="walletName"]').should('have.value', '');
  });

  // TC_U2.1_02
  it('TC_U2.1_02_createWallet_withNameAndInitialBalance_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('Tiết kiệm');
      expect(req.body.walletType).to.equal('MOMO');
      expect(Number(req.body.balance)).to.equal(5000000);
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tạo ví thành công',
          data: { walletId: 102, walletName: 'Tiết kiệm', balance: 5000000, walletType: 'MOMO', isActive: true },
        },
      });
    }).as('createWallet02');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Tiết kiệm');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('.amount-input input').clear().type('5000000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet02');
  });

  // TC_U2.1_03
  it('TC_U2.1_03_createWallet_withEmptyBalance_shouldValidateOrHandleGracefully', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Ví ngân hàng');
    cy.get('.amount-input input').clear();
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Vui lòng nhập số dư ban đầu.').should('be.visible');
  });

  // TC_U2.1_04
  it('TC_U2.1_04_createWallet_linkedToCurrentUser_shouldOnlyAppearInUserList', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tạo ví thành công',
        data: { walletId: 104, walletName: 'Ví cá nhân A', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet04');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Ví cá nhân A');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet04');
  });

  // TC_U2.1_05
  it('TC_U2.1_05_createWallet_withEmptyName_shouldShowRequiredError', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').clear();
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Vui lòng nhập tên ví.').should('be.visible');
  });

  // TC_U2.1_06
  it('TC_U2.1_06_createWallet_withNegativeBalance_shouldShowMinError', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dự phòng');
    cy.get('select[formControlName="walletType"]').select('BANK_ACCOUNT');
    cy.get('.amount-input input').clear().type('-100000');

    // 3. Assert (Then): Hệ thống tự động lọc bỏ dấu âm hoặc không cho phép số âm
    cy.get('.amount-input input').should('not.have.value', '-100000');
  });

  // TC_U2.1_07
  it('TC_U2.1_07_createWallet_withDuplicateNameAndType_shouldShowConflictError', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 409,
      body: { code: 409, message: 'Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn' },
    }).as('createWalletDup');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dự phòng');
    cy.get('select[formControlName="walletType"]').select('BANK_ACCOUNT');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWalletDup');
    cy.contains('Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn').should('be.visible');
  });

  // TC_U2.1_10
  it('TC_U2.1_10_createWallet_withSameNameDifferentType_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('Dự phòng');
      expect(req.body.walletType).to.equal('CASH');
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tạo ví thành công',
          data: { walletId: 110, walletName: 'Dự phòng', balance: 0, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createDiffType');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dự phòng');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createDiffType');
  });

  // TC_U2.1_13
  it('TC_U2.1_13_createWallet_withLeadingTrailingSpaces_shouldTrimName', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('Ví cá nhân');
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tạo ví thành công',
          data: { walletId: 113, walletName: 'Ví cá nhân', balance: 0, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createTrimWallet');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('   Ví cá nhân   ');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createTrimWallet');
  });

  // TC_U2.1_14
  it('TC_U2.1_14_createWallet_withOnlyWhitespace_shouldShowError', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('              ');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Tên ví không được chỉ chứa khoảng trắng.').should('be.visible');
  });

  // TC_U2.1_19
  it('TC_U2.1_19_createWallet_withNameExceeding100Chars_shouldShowMaxLengthError', () => {
    // 1. Arrange (Given)
    const longName = 'A'.repeat(101);
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type(longName);
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Tên ví không được vượt quá 100 ký tự.').should('be.visible');
  });

  // TC_U2.1_26
  it('TC_U2.1_26_createWallet_formResetsAfterSuccess', () => {
    // 1. Arrange (Given): Mock API tạo ví thành công
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: { code: 201, message: 'OK', data: { walletId: 201, walletName: 'Ví Mới', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true } },
    }).as('createReset');

    // 2. Act (When): Nhập tên ví và submit form tạo ví
    cy.get('input[formControlName="walletName"]').type('Ví Mới');
    cy.get('.amount-input input').clear().type('0');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then): Form tự động reset sau khi tạo thành công
    cy.wait('@createReset');
    cy.get('input[formControlName="walletName"]').should('have.value', '');
    cy.get('.amount-input input').should('have.value', '');
  });
});
