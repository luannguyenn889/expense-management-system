describe('U1.3: E2E Automation Test - Đăng Nhập Bằng Google', () => {
  beforeEach(() => {
    // Chặn file script ngoài để tránh bị ghi đè
    cy.intercept('GET', 'https://accounts.google.com/gsi/client', {
      statusCode: 200,
      body: 'console.log("Mocked Google GIS loaded");',
    }).as('gsiScript');

    // Intercept Google auth API
    cy.intercept('POST', '**/api/v1/auth/google', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Đăng nhập Google thành công',
        data: {
          token: 'mock-google-jwt-token-12345',
          user: {
            userId: 99,
            fullName: 'Trang Trương',
            username: 'trangtruong_google',
            email: 'trangtruong@gmail.com',
          },
        },
      },
    }).as('googleAuthApi');

    // Chặn fallback endpoint nếu không có prefix api/v1
    cy.intercept('POST', '**/auth/google', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'Đăng nhập Google thành công',
        data: {
          token: 'mock-google-jwt-token-12345',
          user: {
            userId: 99,
            fullName: 'Trang Trương',
            username: 'trangtruong_google',
            email: 'trangtruong@gmail.com',
          },
        },
      },
    }).as('googleAuthApiFallback');

    cy.visit('/login', {
      onBeforeLoad(win: any) {
        let authCallback: any = null;
        win.google = {
          accounts: {
            id: {
              initialize: (config: any) => {
                authCallback = config.callback;
              },
              prompt: () => {
                setTimeout(() => {
                  if (authCallback) {
                    authCallback({
                      credential: 'mock-google-id-token-valid',
                    });
                  }
                }, 50);
              },
            },
          },
        };
      },
    });
  });

  // TC_U1.3_01
  it('TC_U1.3_01_loginWithGoogle_withValidGoogleAccount_shouldRedirectToDashboard', () => {
    cy.url().should('include', '/login');
    cy.get('.google-button').should('be.visible').click();

    // Hệ thống chuyển hướng về trang chủ
    cy.url().should('include', '/dashboard');
  });
});
