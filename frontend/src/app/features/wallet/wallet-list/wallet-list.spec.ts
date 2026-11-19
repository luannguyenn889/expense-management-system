import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletList } from './wallet-list';

describe('WalletList Component (15 Test Cases)', () => {
  // ==========================================
  // NHÓM 1: EMPTY STATE & NAVIGATION (TC01 - TC02)
  // ==========================================

  it('TC01: should show empty state illustration when user has no wallets', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(walletService.getWallets).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Bạn chưa có ví nào');
    expect(fixture.nativeElement.textContent).toContain('Tạo ví đầu tiên để bắt đầu quản lý tài chính của mình.');
  });

  it('TC02: should render navigation link back to dashboard', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const homeLink = fixture.nativeElement.querySelector('.wallet-add-action') as HTMLAnchorElement;
    expect(homeLink).not.toBeNull();
    expect(homeLink.textContent).toContain('Về trang chủ');
    expect(homeLink.getAttribute('href')).toBe('/dashboard');
  });

  // ==========================================
  // NHÓM 2: RENDERING, TOTAL BALANCE & FORMAT (TC03 - TC08)
  // ==========================================

  it('TC03: should render correct count of wallet items in the list', async () => {
    const wallets = [
      { walletId: 1, walletName: 'Ví 1', balance: 100000, walletType: 'BANK_ACCOUNT', isActive: true },
      { walletId: 2, walletName: 'Ví 2', balance: 200000, walletType: 'CASH', isActive: true },
      { walletId: 3, walletName: 'Ví 3', balance: 300000, walletType: 'MOMO', isActive: true },
    ];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.wallet-item');
    expect(items.length).toBe(3);
    expect(fixture.nativeElement.querySelector('.wallet-count').textContent).toBe('3');
  });

  it('TC04: should compute and display correct totalBalance for multiple wallets', async () => {
    const wallets = [
      { walletId: 1, walletName: 'Ví 1', balance: 500000, walletType: 'BANK_ACCOUNT', isActive: true },
      { walletId: 2, walletName: 'Ví 2', balance: 1000000, walletType: 'CASH', isActive: true },
      { walletId: 3, walletName: 'Ví 3', balance: 2000000, walletType: 'MOMO', isActive: true },
    ];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance['totalBalance']()).toBe(3500000);
    expect(fixture.nativeElement.querySelector('.balance-banner-copy strong').textContent).toContain('3.500.000');
  });

  it('TC05: should format individual wallet balances in Vietnamese dong currency', async () => {
    const wallets = [{ walletId: 10, walletName: 'Ví chi tiêu', balance: 1250000, walletType: 'BANK_ACCOUNT', isActive: true }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const balanceEl = fixture.nativeElement.querySelector('.wallet-balance');
    expect(balanceEl.textContent).toContain('1.250.000');
  });

  it('TC06: should render appropriate icon and label for BANK_ACCOUNT wallet type', async () => {
    const wallets = [{ walletId: 1, walletName: 'Vietcombank', balance: 500000, walletType: 'BANK_ACCOUNT', isActive: true }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tài khoản ngân hàng');
    expect(fixture.nativeElement.querySelector('.wallet-icon').textContent).toContain('account_balance');
  });

  it('TC07: should render appropriate icon and label for CASH wallet type', async () => {
    const wallets = [{ walletId: 2, walletName: 'Tiền trong túi', balance: 200000, walletType: 'CASH', isActive: true }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tiền mặt');
    expect(fixture.nativeElement.querySelector('.wallet-icon').textContent).toContain('payments');
  });

  it('TC08: should render appropriate icon and label for MOMO wallet type', async () => {
    const wallets = [{ walletId: 3, walletName: 'Ví MoMo', balance: 150000, walletType: 'MOMO', isActive: true }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ví MoMo');
    expect(fixture.nativeElement.querySelector('.wallet-icon').textContent).toContain('smartphone');
  });

  // ==========================================
  // NHÓM 3: WALLET ACTIONS (DEACTIVATE & DELETE) (TC09 - TC15)
  // ==========================================

  it('TC09: should display both deactivate and delete action buttons for active wallet', async () => {
    const wallets = [{ walletId: 1, walletName: 'Ví hoạt động', balance: 100000, walletType: 'CASH', isActive: true }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.wallet-action-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Ngừng sử dụng');
    expect(buttons[1].textContent).toContain('Xóa');
  });

  it('TC10: should only display delete button and hide deactivate button for inactive wallet', async () => {
    const wallets = [{ walletId: 2, walletName: 'Ví đã ngưng', balance: 50000, walletType: 'CASH', isActive: false }];
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of(wallets)),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.wallet-action-button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('Xóa');
    expect(fixture.nativeElement.textContent).toContain('Đã tạm ngưng');
  });

  it('TC11: should open confirmation dialog with deactivate message when clicking deactivate button', async () => {
    const wallet = { walletId: 5, walletName: 'Ví ngân hàng', balance: 200000, walletType: 'BANK_ACCOUNT', isActive: true };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Ngừng sử dụng Ví ngân hàng"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ngừng sử dụng ví?');
    expect(fixture.nativeElement.textContent).toContain('Số dư và lịch sử giao dịch vẫn được giữ nguyên');
  });

  it('TC12: should open confirmation dialog with delete warning when clicking delete button', async () => {
    const wallet = { walletId: 6, walletName: 'Ví thẻ phụ', balance: 100000, walletType: 'BANK_ACCOUNT', isActive: true };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Xóa Ví thẻ phụ"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Xóa ví?');
    expect(fixture.nativeElement.textContent).toContain('Thao tác này sẽ xóa ví khỏi tài khoản');
  });

  it('TC13: should dismiss confirmation dialog when clicking close button without calling API', async () => {
    const wallet = { walletId: 7, walletName: 'Ví test', balance: 100000, walletType: 'CASH', isActive: true };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Xóa Ví test"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.wallet-action-dialog')).not.toBeNull();

    (fixture.nativeElement.querySelector('.wallet-dialog-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.wallet-action-dialog')).toBeNull();
    expect(walletService.deleteWallet).not.toHaveBeenCalled();
  });

  it('TC14: should call deleteWallet API and refresh list when confirming delete action', async () => {
    const wallet = { walletId: 8, walletName: 'Ví cần xóa', balance: 100000, walletType: 'CASH', isActive: true };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn().mockReturnValue(of(void 0)),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Xóa Ví cần xóa"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.wallet-dialog-confirm') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(walletService.deleteWallet).toHaveBeenCalledWith(8);
    expect(walletService.getWallets).toHaveBeenCalledTimes(2);
  });

  it('TC15: should show backend error message and keep dialog open when action fails', async () => {
    const wallet = { walletId: 9, walletName: 'Ví lỗi', balance: 50000, walletType: 'CASH', isActive: true };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn().mockReturnValue(
        throwError(() => new Error('Không thể xóa ví này')),
      ),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[aria-label="Ngừng sử dụng Ví lỗi"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.wallet-dialog-confirm') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Không thể xóa ví này');
    expect(fixture.nativeElement.querySelector('.wallet-action-dialog')).not.toBeNull();
  });
});
