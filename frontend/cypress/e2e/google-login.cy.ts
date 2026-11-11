describe('U1.3: E2E Automation Test - Đăng Nhập Bằng Google', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://accounts.google.com/gsi/client', {
      statusCode: 200,
      body: 'console.log("Mocked Google GIS loaded");',
    }).as('gsiScript');

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
    // 1. Arrange (Given): Đang ở trang đăng nhập với dịch vụ Google sẵn sàng
    cy.url().should('include', '/login');

    // 2. Act (When): Nhấn nút Đăng nhập bằng Google
    cy.get('.google-button').should('be.visible').click();

    // 3. Assert (Then): Hệ thống chuyển hướng vào dashboard
    cy.url().should('include', '/dashboard');
  });

});
