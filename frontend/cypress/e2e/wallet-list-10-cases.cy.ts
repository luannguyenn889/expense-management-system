describe('U2.2: E2E Automation Test - 10 Test Cases Xem Danh S├ích V├¡ v├á Sß╗æ D╞░', () => {
  const mock3Wallets = [
    { walletId: 1, walletName: 'V├¡ tiß╗ün mß║╖t', balance: 500000, walletType: 'CASH', isActive: true },
    { walletId: 2, walletName: 'V├¡ Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
    { walletId: 3, walletName: 'V├¡ tiß║┐t kiß╗çm', balance: 2000000, walletType: 'BANK_ACCOUNT', isActive: true },
  ];

  const setupAuth = (win: any, username = 'nguyenvana') => {
    win.sessionStorage.setItem('expense-management-token', 'mock-jwt-token-12345');
    win.sessionStorage.setItem('expense-management-user-full-name', 'Nguyß╗àn V─ân A');
    win.sessionStorage.setItem('expense-management-username', username);
  };

    // TC_U2.2_01
  it('TC_U2.2_01_viewWallets_shouldDisplayAllUserWallets', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('get3Wallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get3Wallets');

    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');
    cy.contains('V├¡ Momo').should('be.visible');
    cy.contains('V├¡ tiß║┐t kiß╗çm').should('be.visible');
  });

  // TC_U2.2_02
  it('TC_U2.2_02_viewWallets_shouldDisplayCorrectNameAndType', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [
          { walletId: 1, walletName: 'V├¡ tiß╗ün mß║╖t', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'V├¡ Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
        ],
      },
    }).as('get2Wallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get2Wallets');

    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');
    cy.contains('Tiß╗ün mß║╖t').should('be.visible');
    cy.contains('V├¡ Momo').should('be.visible');
    cy.contains('MoMo').should('be.visible');
  });

  // TC_U2.2_03
  it('TC_U2.2_03_viewWallets_shouldDisplayCorrectBalanceForEachWallet', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [
          { walletId: 1, walletName: 'V├¡ tiß╗ün mß║╖t', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'V├¡ Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
        ],
      },
    }).as('getBalances');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getBalances');

    cy.contains('500.000').should('be.visible');
    cy.contains('1.000.000').should('be.visible');
  });

  // TC_U2.2_04
  it('TC_U2.2_04_viewWallets_shouldOnlyDisplayWalletsOfCurrentUser', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [{ walletId: 1, walletName: 'V├¡ Tiß╗ün mß║╖t A', balance: 500000, walletType: 'CASH', isActive: true }],
      },
    }).as('getWalletsA');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win, 'userA') });
    // 3. Assert (Then)
    cy.wait('@getWalletsA');

    cy.contains('V├¡ Tiß╗ün mß║╖t A').should('be.visible');
    cy.contains('V├¡ Momo B').should('not.exist');
  });

  // TC_U2.2_05
  it('TC_U2.2_05_viewWallets_emptyState_shouldDisplayEmptyMessage', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: [] },
    }).as('getEmptyWallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getEmptyWallets');

    cy.contains('Bß║ín ch╞░a c├│ v├¡ n├áo').should('be.visible');
    cy.contains('Tß║ío v├¡ ─æß║ºu ti├¬n ─æß╗â bß║»t ─æß║ºu quß║ún l├╜ t├ái ch├¡nh cß╗ºa m├¼nh.').should('be.visible');
    cy.get('.balance-wallet-count').should('contain.text', '0 v├¡');
  });

  // TC_U2.2_06
  it('TC_U2.2_06_viewWallets_persistsOnPageReload', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('getWalletsReload');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsReload');
    cy.reload();
    cy.wait('@getWalletsReload');

    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');
    cy.contains('500.000').should('be.visible');
  });

  // TC_U2.2_07
  it('TC_U2.2_07_viewWallets_calculateTotalBalanceMultipleWallets', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('get3WalletsSum');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get3WalletsSum');

    cy.get('.balance-banner-copy strong').should('contain.text', '3.500.000');
  });

  // TC_U2.2_09
  it('TC_U2.2_09_viewWallets_totalBalanceWhenNoWallets_shouldBeZero', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: [] },
    }).as('getZeroWallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getZeroWallets');

    cy.get('.balance-banner-copy strong').should('contain.text', '0');
  });

  // TC_U2.2_10
  it('TC_U2.2_10_viewWallets_updateTotalBalanceAfterCreatingNewWallet', () => {
    // 1. Arrange (Given)
    let callCount = 0;
    cy.intercept('GET', '**/api/v1/wallets', (req) => {
      callCount++;
      if (callCount === 1) {
        req.reply({ statusCode: 200, body: { code: 200, message: 'OK', data: [{ walletId: 1, walletName: 'V├¡ 1', balance: 500000, walletType: 'CASH', isActive: true }] } });
      } else {
        req.reply({ statusCode: 200, body: { code: 200, message: 'OK', data: [
          { walletId: 1, walletName: 'V├¡ 1', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'V├¡ 2', balance: 1000000, walletType: 'MOMO', isActive: true }
        ] } });
      }
    }).as('getWalletsDynamic');

    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: { code: 201, message: 'OK', data: { walletId: 2, walletName: 'V├¡ 2', balance: 1000000, walletType: 'MOMO', isActive: true } },
    }).as('createWallet10');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsDynamic');
    cy.get('.balance-banner-copy strong').should('contain.text', '500.000');

    cy.get('input[formControlName="walletName"]').type('V├¡ 2');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('input[formControlName="balance"]').clear().type('1000000');
    cy.get('app-wallet-create-form button[type="submit"]').click();

    cy.wait('@createWallet10');
    cy.wait('@getWalletsDynamic');
    cy.get('.balance-banner-copy strong').should('contain.text', '1.500.000');
  });

  // TC_U2.2_11
  it('TC_U2.2_11_viewWallets_shouldDisplayCorrectWalletCount', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('get3WalletsCount');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get3WalletsCount');

    cy.get('.wallet-count').should('contain.text', '3');
    cy.get('.balance-wallet-count').should('contain.text', '3 v├¡');
  });
});
