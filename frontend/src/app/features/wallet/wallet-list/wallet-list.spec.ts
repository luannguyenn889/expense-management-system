import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletList } from './wallet-list';

describe('WalletList', () => {
  it('should show the empty state when no wallets exist', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(of([])),
      createWallet: vi.fn(),
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
  });

  it('should render wallets and format their balances', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(
        of([{ walletId: 5, walletName: 'Ví hằng ngày', balance: 1500000 }]),
      ),
      createWallet: vi.fn(),
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
});
