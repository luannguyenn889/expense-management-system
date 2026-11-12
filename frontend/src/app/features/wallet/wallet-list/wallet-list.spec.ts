import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletList } from './wallet-list';

describe('WalletList', () => {
  it('should show the empty state when no wallets exist', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [
        provideRouter([]),
        { provide: WalletService, useValue: walletService },
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(walletService.getWallets).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Bạn chưa có ví nào');
    const homeLink = fixture.nativeElement.querySelector('.wallet-add-action') as HTMLAnchorElement;
    expect(homeLink.textContent).toContain('Về trang chủ');
    expect(homeLink.getAttribute('href')).toBe('/dashboard');
  });

  it('should render wallets and format their balances', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(
        of([{ walletId: 5, walletName: 'Ví hằng ngày', balance: 1500000 }]),
      ),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn(),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [
        provideRouter([]),
        { provide: WalletService, useValue: walletService },
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ví hằng ngày');
    expect(fixture.nativeElement.textContent).toContain('1.500.000');
    expect(fixture.nativeElement.textContent).toContain('Tổng số dư');
  });

  it('should call the backend to deactivate or delete the selected wallet', async () => {
    const activeWallet = {
      walletId: 5,
      walletName: 'Ví hằng ngày',
      balance: 1500000,
      isActive: true,
    };
    const deactivateWallet = vi.fn().mockReturnValue(of(void 0));
    const deleteWallet = vi.fn().mockReturnValue(of(void 0));
    const walletService = {
      getWallets: vi.fn().mockReturnValueOnce(of([activeWallet])).mockReturnValue(of([])),
      createWallet: vi.fn(),
      deactivateWallet,
      deleteWallet,
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [
        provideRouter([]),
        { provide: WalletService, useValue: walletService },
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        '[aria-label="Ngừng sử dụng Ví hằng ngày"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ngừng sử dụng ví?');
    expect(fixture.nativeElement.textContent).toContain('Số dư và lịch sử giao dịch vẫn được giữ nguyên');
    (
      fixture.nativeElement.querySelector('.wallet-dialog-confirm') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(deactivateWallet).toHaveBeenCalledWith(activeWallet.walletId);
    expect(walletService.getWallets).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).not.toContain('Ví hằng ngày');

    const inactiveWallet = { ...activeWallet, isActive: false };
    walletService.getWallets.mockReturnValueOnce(of([inactiveWallet]));
    fixture.componentInstance['wallets'].set([inactiveWallet]);
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[aria-label="Xóa Ví hằng ngày"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Xóa ví?');
    (
      fixture.nativeElement.querySelector('.wallet-dialog-confirm') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(deleteWallet).toHaveBeenCalledWith(activeWallet.walletId);
    expect(walletService.createWallet).not.toHaveBeenCalled();
  });

  it('should show backend errors and keep the wallet when an action fails', async () => {
    const wallet = {
      walletId: 12,
      walletName: 'Ví dự phòng',
      balance: 500000,
      isActive: true,
    };
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([wallet])),
      createWallet: vi.fn(),
      deactivateWallet: vi.fn().mockReturnValue(
        throwError(() => new Error('Backend chưa hỗ trợ ngừng sử dụng ví')),
      ),
      deleteWallet: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletList],
      providers: [
        provideRouter([]),
        { provide: WalletService, useValue: walletService },
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '[aria-label="Ngừng sử dụng Ví dự phòng"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('.wallet-dialog-confirm') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Backend chưa hỗ trợ ngừng sử dụng ví');
    expect(fixture.nativeElement.textContent).toContain('Ví dự phòng');
    expect(walletService.getWallets).toHaveBeenCalledOnce();
  });
});
