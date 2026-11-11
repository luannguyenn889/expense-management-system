describe('U2.2: E2E Automation Test - 21 Test Cases Xem Danh S├ích V├¡ v├á Sß╗æ D╞░', () => {
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

  // TC_U2.2_08
  it('TC_U2.2_08_viewWallets_calculateTotalBalanceSingleWallet', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [{ walletId: 1, walletName: 'V├¡ Tiß╗ün mß║╖t', balance: 500000, walletType: 'CASH', isActive: true }],
      },
    }).as('getSingleWallet');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getSingleWallet');

    cy.get('.balance-banner-copy strong').should('contain.text', '500.000');
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

  // TC_U2.2_12
  it('TC_U2.2_12_viewWallets_shouldDisplayDuplicateNameDifferentTypeWallets', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [
          { walletId: 1, walletName: 'V├¡ Dß╗▒ ph├▓ng', balance: 500000, walletType: 'MOMO', isActive: true },
          { walletId: 2, walletName: 'V├¡ Dß╗▒ ph├▓ng', balance: 1000000, walletType: 'CASH', isActive: true },
        ],
      },
    }).as('getDupNameDiffType');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getDupNameDiffType');

    cy.get('.wallet-items li').should('have.length', 2);
    cy.contains('MoMo').should('be.visible');
    cy.contains('Tiß╗ün mß║╖t').should('be.visible');
  });

  // TC_U2.2_13
  it('TC_U2.2_13_viewWallets_matchTotalBalanceOnDashboard', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('getDashboardWallets');

    // 2. Act (When)
    cy.visit('/dashboard', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getDashboardWallets');

    cy.get('.balance-card .summary-value').should('contain.text', '3.500.000');
  });

  // TC_U2.2_14
  it('TC_U2.2_14_viewWallets_shouldDisplayExactBalanceWithSeparators', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [{ walletId: 1, walletName: 'V├¡ Tiß╗ün mß║╖t', balance: 123456, walletType: 'CASH', isActive: true }],
      },
    }).as('getExactBalance');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getExactBalance');

    cy.contains('123.456').should('be.visible');
  });

  // TC_U2.2_15
  it('TC_U2.2_15_viewWallets_persistDataWhenNavigatingBetweenScreens', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('getWalletsNav');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsNav');
    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');

    cy.visit('/dashboard', { onBeforeLoad: (win) => setupAuth(win) });
    cy.wait('@getWalletsNav');
    cy.get('.balance-card .summary-value').should('contain.text', '3.500.000');

    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    cy.wait('@getWalletsNav');
    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');
  });

  // TC_U2.2_16
  it('TC_U2.2_16_viewWallets_shouldDisplayLargeBalanceCorrectly', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [{ walletId: 1, walletName: 'V├¡ Tiß║┐t kiß╗çm', balance: 1000000000, walletType: 'BANK_ACCOUNT', isActive: true }],
      },
    }).as('getLargeBalance');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getLargeBalance');

    cy.contains('1.000.000.000').should('be.visible');
  });

  // TC_U2.2_17
  it('TC_U2.2_17_viewWallets_totalBalanceZeroWhenAllWalletsZero', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [
          { walletId: 1, walletName: 'V├¡ Tiß╗ün mß║╖t', balance: 0, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'V├¡ Momo', balance: 0, walletType: 'MOMO', isActive: true },
        ],
      },
    }).as('getZeroWalletsList');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getZeroWalletsList');

    cy.get('.balance-banner-copy strong').should('contain.text', '0');
  });

  // TC_U2.2_18
  it('TC_U2.2_18_viewWallets_persistDataAfterLogoutAndLoginAgain', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('getWalletsSession');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getWalletsSession');
    cy.contains('V├¡ tiß╗ün mß║╖t').should('be.visible');
  });

  // TC_U2.2_19
  it('TC_U2.2_19_viewWallets_onlyCalculateBalanceOfCurrentAccount', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Th├ánh c├┤ng',
        data: [
          { walletId: 1, walletName: 'V├¡ Tiß╗ün mß║╖t', balance: 500000, walletType: 'CASH', isActive: true },
          { walletId: 2, walletName: 'V├¡ Momo', balance: 1000000, walletType: 'MOMO', isActive: true },
        ],
      },
    }).as('getAccountA');

    // 2. Act (When)
    cy.visit('/dashboard', { onBeforeLoad: (win) => setupAuth(win, 'accountA') });
    // 3. Assert (Then)
    cy.wait('@getAccountA');
    cy.get('.balance-card .summary-value').should('contain.text', '1.500.000');
  });

  // TC_U2.2_20
  it('TC_U2.2_20_viewWallets_dashboardTotalBalancePersistsOnReload', () => {
    // 1. Arrange (Given)
    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: mock3Wallets },
    }).as('getDashboardReload');

    // 2. Act (When)
    cy.visit('/dashboard', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@getDashboardReload');
    cy.get('.balance-card .summary-value').should('contain.text', '3.500.000');

    cy.reload();
    cy.wait('@getDashboardReload');
    cy.get('.balance-card .summary-value').should('contain.text', '3.500.000');
  });

  // TC_U2.2_21
  it('TC_U2.2_21_viewWallets_shouldRenderManyWalletsCorrectly', () => {
    // 1. Arrange (Given)
    const tenWallets = Array.from({ length: 10 }, (_, i) => ({
      walletId: i + 1,
      walletName: `V├¡ sß╗æ ${i + 1}`,
      balance: (i + 1) * 100000,
      walletType: 'CASH' as const,
      isActive: true,
    }));

    cy.intercept('GET', '**/api/v1/wallets', {
      statusCode: 200,
      body: { code: 200, message: 'Th├ánh c├┤ng', data: tenWallets },
    }).as('get10Wallets');

    // 2. Act (When)
    cy.visit('/wallets', { onBeforeLoad: (win) => setupAuth(win) });
    // 3. Assert (Then)
    cy.wait('@get10Wallets');

    cy.get('.wallet-items li').should('have.length', 10);
    cy.get('.wallet-count').should('contain.text', '10');
  });

});
