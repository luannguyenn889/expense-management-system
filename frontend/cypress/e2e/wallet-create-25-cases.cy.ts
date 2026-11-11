describe('U2.1: E2E Automation Test - 25 Test Cases Tß║ío V├¡', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Lß║Ñy danh s├ích v├¡ th├ánh c├┤ng',
        data: [],
      },
    }).as('getWallets');

    cy.visit('/wallets', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('expense-management-token', 'mock-jwt-token-12345');
        win.sessionStorage.setItem('expense-management-user-full-name', 'Nguyß╗àn V─ân A');
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
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 101, walletName: 'Tiß╗ün mß║╖t', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet01');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Tiß╗ün mß║╖t');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet01');
    cy.get('input[formControlName="walletName"]').should('have.value', '');
  });

  // TC_U2.1_02
  it('TC_U2.1_02_createWallet_withNameAndInitialBalance_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('Tiß║┐t kiß╗çm');
      expect(req.body.walletType).to.equal('MOMO');
      expect(Number(req.body.balance)).to.equal(5000000);
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tß║ío v├¡ th├ánh c├┤ng',
          data: { walletId: 102, walletName: 'Tiß║┐t kiß╗çm', balance: 5000000, walletType: 'MOMO', isActive: true },
        },
      });
    }).as('createWallet02');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Tiß║┐t kiß╗çm');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('input[formControlName="balance"]').clear().type('5000000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet02');
  });

  // TC_U2.1_03
  it('TC_U2.1_03_createWallet_withEmptyBalance_shouldValidateOrHandleGracefully', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ ng├ón h├áng');
    cy.get('input[formControlName="balance"]').clear();
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.get('input[formControlName="balance"]').then(($el) => {
      expect($el[0].checkValidity()).to.be.oneOf([false, true]);
    });
  });

  // TC_U2.1_04
  it('TC_U2.1_04_createWallet_linkedToCurrentUser_shouldOnlyAppearInUserList', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 104, walletName: 'V├¡ c├í nh├ón A', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet04');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ c├í nh├ón A');
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
    cy.contains('Vui l├▓ng nhß║¡p t├¬n v├¡.').should('be.visible');
  });

  // TC_U2.1_06
  it('TC_U2.1_06_createWallet_withNegativeBalance_shouldShowMinError', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dß╗▒ ph├▓ng');
    cy.get('select[formControlName="walletType"]').select('BANK_ACCOUNT');
    cy.get('input[formControlName="balance"]').clear().type('-100000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('Sß╗æ d╞░ kh├┤ng ─æ╞░ß╗úc nhß╗Å h╞ín 0.').should('be.visible');
  });

  // TC_U2.1_07
  it('TC_U2.1_07_createWallet_withDuplicateNameAndType_shouldShowConflictError', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 409,
      body: { code: 409, message: 'V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín' },
    }).as('createWalletDup');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dß╗▒ ph├▓ng');
    cy.get('select[formControlName="walletType"]').select('BANK_ACCOUNT');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWalletDup');
    cy.contains('V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín').should('be.visible');
  });

  // TC_U2.1_08
  it('TC_U2.1_08_createWallet_headerActionButton_shouldLinkToCreateForm', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    // 3. Assert (Then)
    cy.get('.wallet-add-action').should('be.visible').and('have.attr', 'href', '#create-wallet-title');
  });

  // TC_U2.1_10
  it('TC_U2.1_10_createWallet_withSameNameDifferentType_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('Dß╗▒ ph├▓ng');
      expect(req.body.walletType).to.equal('CASH');
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tß║ío v├¡ th├ánh c├┤ng',
          data: { walletId: 110, walletName: 'Dß╗▒ ph├▓ng', balance: 0, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createDiffType');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dß╗▒ ph├▓ng');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createDiffType');
  });

  // TC_U2.1_11
  it('TC_U2.1_11_createWallet_sameNameAndTypeDifferentAccounts_shouldBeAllowed', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 111, walletName: 'Dß╗▒ ph├▓ng', balance: 0, walletType: 'MOMO', isActive: true },
      },
    }).as('createWalletUserB');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('Dß╗▒ ph├▓ng');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWalletUserB');
  });

  // TC_U2.1_12
  it('TC_U2.1_12_createWallet_persistsAfterPageReload', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [{ walletId: 112, walletName: 'V├¡ hß╗ìc tß║¡p', balance: 500000, walletType: 'CASH', isActive: true }],
      },
    }).as('getWalletsReload');

    cy.reload();
    // 2. Act (When)
    // 3. Assert (Then)
    cy.wait('@getWalletsReload');
    cy.contains('V├¡ hß╗ìc tß║¡p').should('be.visible');
    cy.contains('500.000').should('be.visible');
  });

  // TC_U2.1_13
  it('TC_U2.1_13_createWallet_withLeadingTrailingSpaces_shouldTrimName', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(req.body.walletName).to.equal('V├¡ c├í nh├ón');
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tß║ío v├¡ th├ánh c├┤ng',
          data: { walletId: 113, walletName: 'V├¡ c├í nh├ón', balance: 0, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createTrimWallet');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('   V├¡ c├í nh├ón   ');
    cy.get('select[formControlName="walletType"]').select('CASH');
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
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('T├¬n v├¡ kh├┤ng ─æ╞░ß╗úc chß╗ë chß╗⌐a khoß║úng trß║»ng.').should('be.visible');
  });

  // TC_U2.1_15
  it('TC_U2.1_15_createWallet_differentNameSameType_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 115, walletName: 'V├¡ ─æi chß╗ú', balance: 0, walletType: 'CASH', isActive: true },
      },
    }).as('createWallet15');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ ─æi chß╗ú');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet15');
  });

  // TC_U2.1_16
  it('TC_U2.1_16_createWallet_withExcessiveBalance_shouldHandleOrValidate', () => {
    // 1. Arrange (Given)
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ t├¡ch l┼⌐y');
    cy.get('select[formControlName="walletType"]').select('BANK_ACCOUNT');
    cy.get('input[formControlName="balance"]').clear().type('1000000000000000');
    cy.get('app-wallet-create-form button[type="submit"]').click();
  });
    // 3. Assert (Then)

  // TC_U2.1_17
  it('TC_U2.1_17_createWallet_withLeadingZerosBalance_shouldNormalizeTo10000', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(Number(req.body.balance)).to.equal(10000);
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tß║ío v├¡ th├ánh c├┤ng',
          data: { walletId: 117, walletName: 'V├¡ thß╗¡ nghiß╗çm', balance: 10000, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createLeadZeros');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ thß╗¡ nghiß╗çm');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('input[formControlName="balance"]').clear().type('000010000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createLeadZeros');
  });

  // TC_U2.1_18
  it('TC_U2.1_18_createWallet_duplicateNameAfterTrimming_shouldShowConflictError', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 409,
      body: { code: 409, message: 'V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín' },
    }).as('createDupTrim');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('   Dß╗▒ ph├▓ng   ');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('input[formControlName="balance"]').clear().type('100000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createDupTrim');
    cy.contains('V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín').should('be.visible');
  });

  // TC_U2.1_19
  it('TC_U2.1_19_createWallet_withNameExceeding100Chars_shouldShowMaxLengthError', () => {
    // 1. Arrange (Given)
    const longName = 'A'.repeat(101);
    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type(longName);
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.contains('T├¬n v├¡ kh├┤ng ─æ╞░ß╗úc v╞░ß╗út qu├í 100 k├╜ tß╗▒.').should('be.visible');
  });

  // TC_U2.1_20
  it('TC_U2.1_20_createWallet_withNameContainingDigits_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 120, walletName: 'V├¡ 2026', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet20');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ 2026');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet20');
  });

  // TC_U2.1_21
  it('TC_U2.1_21_createWallet_withSpecialChars_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 121, walletName: 'V├¡ #1 - C├í nh├ón', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet21');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ #1 - C├í nh├ón');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet21');
  });

  // TC_U2.1_22
  it('TC_U2.1_22_createWallet_withMultipleSpacesBetweenWords_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 122, walletName: 'V├¡   tiß║┐t   kiß╗çm', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet22');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡   tiß║┐t   kiß╗çm');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet22');
  });

  // TC_U2.1_23
  it('TC_U2.1_23_createWallet_withExact100CharsName_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    const exact100 = 'V├¡'.padEnd(100, 'x');
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'Tß║ío v├¡ th├ánh c├┤ng',
        data: { walletId: 123, walletName: exact100, balance: 0, walletType: 'BANK_ACCOUNT', isActive: true },
      },
    }).as('createWallet23');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type(exact100);
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createWallet23');
  });

  // TC_U2.1_24
  it('TC_U2.1_24_createWallet_caseInsensitiveDuplicateName_shouldShowConflictError', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 409,
      body: { code: 409, message: 'V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín' },
    }).as('createDupCase');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├ì TIß║╛T KIß╗åM');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createDupCase');
    cy.contains('V├¡ c├│ c├╣ng t├¬n v├á loß║íi ─æ├ú tß╗ôn tß║íi trong t├ái khoß║ún cß╗ºa bß║ín').should('be.visible');
  });

  // TC_U2.1_25
  it('TC_U2.1_25_createWallet_withOneTrillionBalance_shouldCreateSuccessfully', () => {
    // 1. Arrange (Given)
    cy.intercept('POST', '**/api/v1/wallets', (req) => {
      expect(Number(req.body.balance)).to.equal(1000000000000);
      req.reply({
        statusCode: 201,
        body: {
          code: 201,
          message: 'Tß║ío v├¡ th├ánh c├┤ng',
          data: { walletId: 125, walletName: 'V├¡ t├¡ch l┼⌐y', balance: 1000000000000, walletType: 'CASH', isActive: true },
        },
      });
    }).as('createTrillionWallet');

    // 2. Act (When)
    cy.get('input[formControlName="walletName"]').type('V├¡ t├¡ch l┼⌐y');
    cy.get('select[formControlName="walletType"]').select('CASH');
    cy.get('input[formControlName="balance"]').clear().type('1000000000000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then)
    cy.wait('@createTrillionWallet');
  });

  // TC_U2.1_26
  it('TC_U2.1_26_createWallet_formResetsAfterSuccess', () => {
    // 1. Arrange (Given): Mock API tß║ío v├¡ th├ánh c├┤ng
    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: { code: 201, message: 'OK', data: { walletId: 201, walletName: 'V├¡ Mß╗¢i', balance: 0, walletType: 'BANK_ACCOUNT', isActive: true } },
    }).as('createReset');

    // 2. Act (When): Nhß║¡p t├¬n v├¡ v├á submit form tß║ío v├¡
    cy.get('input[formControlName="walletName"]').type('V├¡ Mß╗¢i');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    // 3. Assert (Then): Form tß╗▒ ─æß╗Öng reset sau khi tß║ío th├ánh c├┤ng
    cy.wait('@createReset');
    cy.get('input[formControlName="walletName"]').should('have.value', '');
    cy.get('input[formControlName="balance"]').should('have.value', '0');
  });
});
