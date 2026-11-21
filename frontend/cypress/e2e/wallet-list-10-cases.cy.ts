describe('U2.2: E2E Automation Test - 10 Test Cases Xem Danh Sách Ví và Số Dư', () => {
  const mock3Wallets = [
    { walletId: 1, walletName: 'Ví tiền mặt', balance: 500000, walletType: 'CASH', isActive: true },
    { walletId: 2, walletName: 'Ví Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
    { walletId: 3, walletName: 'Ví tiết kiệm', balance: 2000000, walletType: 'BANK_ACCOUNT', isActive: true },
  ];

  const setupAuth = (win: any, username = 'nguyenvana') => {
    win.sessionStorage.setItem('expense-management-token', 'mock-jwt-token-12345');
    win.sessionStorage.setItem('expense-management-user-full-name', 'Nguyễn Văn A');
    win.sessionStorage.setItem('expense-management-username', username);
  };

  // TC_U2.2_01
  it('TC_U2.2_01_viewWallets_shouldDisplayAllUserWallets', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Thành công', data: mock3Wallets },
    }).as('get3Wallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get3Wallets');

    cy.contains('Ví tiền mặt').should('be.visible');
    cy.contains('Ví Momo').should('be.visible');
    cy.contains('Ví tiết kiệm').should('be.visible');
  });

  // TC_U2.2_02
  it('TC_U2.2_02_viewWallets_shouldDisplayCorrectNameAndType', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Thành công',
        data: [
          { walletId: 1, walletName: 'Ví tiền mặt', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'Ví Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
        ],
      },
    }).as('get2Wallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get2Wallets');

    cy.contains('Ví tiền mặt').should('be.visible');
    cy.contains('Tiền mặt').should('be.visible');
    cy.contains('Ví Momo').should('be.visible');
    cy.contains('MoMo').should('be.visible');
  });

  // TC_U2.2_03
  it('TC_U2.2_03_viewWallets_shouldDisplayCorrectBalanceForEachWallet', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Thành công',
        data: [
          { walletId: 1, walletName: 'Ví tiền mặt', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'Ví Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
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
        message: 'Thành công',
        data: [{ walletId: 1, walletName: 'Ví Tiền mặt A', balance: 500000, walletType: 'CASH', isActive: true }],
      },
    }).as('getWalletsA');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win, 'userA') });
    // 3. Assert (Then)
    cy.wait('@getWalletsA');

    cy.contains('Ví Tiền mặt A').should('be.visible');
    cy.contains('Ví Momo B').should('not.exist');
  });

  // TC_U2.2_05
  it('TC_U2.2_05_viewWallets_emptyState_shouldDisplayEmptyMessage', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Thành công', data: [] },
    }).as('getEmptyWallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getEmptyWallets');

    cy.contains('Bạn chưa có ví nào').should('be.visible');
    cy.contains('Tạo ví đầu tiên để bắt đầu quản lý tài chính của mình.').should('be.visible');
    cy.get('.balance-wallet-count').should('contain.text', '0 ví');
  });

  // TC_U2.2_06
  it('TC_U2.2_06_viewWallets_persistsOnPageReload', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Thành công', data: mock3Wallets },
    }).as('getWalletsReload');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsReload');
    cy.reload();
    cy.wait('@getWalletsReload');

    cy.contains('Ví tiền mặt').should('be.visible');
    cy.contains('500.000').should('be.visible');
  });

  // TC_U2.2_07
  it('TC_U2.2_07_viewWallets_calculateTotalBalanceMultipleWallets', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Thành công', data: mock3Wallets },
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
      body: { code: 200, message: 'Thành công', data: [] },
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
        req.reply({ statusCode: 200, body: { code: 200, message: 'OK', data: [{ walletId: 1, walletName: 'Ví 1', balance: 500000, walletType: 'CASH', isActive: true }] } });
      } else {
        req.reply({ statusCode: 200, body: { code: 200, message: 'OK', data: [
          { walletId: 1, walletName: 'Ví 1', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'Ví 2', balance: 1000000, walletType: 'MOMO', isActive: true }
        ] } });
      }
    }).as('getWalletsDynamic');

    cy.intercept('POST', '**/api/v1/wallets', {
      statusCode: 201,
      body: { code: 201, message: 'OK', data: { walletId: 2, walletName: 'Ví 2', balance: 1000000, walletType: 'MOMO', isActive: true } },
    }).as('createWallet10');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsDynamic');
    cy.get('.balance-banner-copy strong').should('contain.text', '500.000');

    cy.get('input[formControlName="walletName"]').type('Ví 2');
    cy.get('select[formControlName="walletType"]').select('MOMO');
    cy.get('.amount-input input').clear().type('1000000');
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
      body: { code: 200, message: 'Thành công', data: mock3Wallets },
    }).as('get3WalletsCount');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get3WalletsCount');

    cy.get('.wallet-count').should('contain.text', '3');
    cy.get('.balance-wallet-count').should('contain.text', '3 ví');
  });
});
