import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { WalletService } from '../../core/services/wallet.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  it('should summarize wallets returned by the API', async () => {
    const walletService = {
      getWallets: vi.fn().mockReturnValue(
        of([
          {
            walletId: 1,
            walletName: 'Ví hằng ngày',
            balance: 1500000,
            walletType: 'CASH',
          },
          { walletId: 2, walletName: 'Ví tiết kiệm', balance: 2500000, isActive: false },
        ]),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(walletService.getWallets).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('4.000.000');
    expect(fixture.nativeElement.textContent).toContain('Ví hằng ngày');
    expect(fixture.nativeElement.textContent).toContain('Tiền mặt');
    expect(fixture.nativeElement.textContent).toContain('Ví tiết kiệm');
    expect(fixture.nativeElement.textContent).toContain('Chưa có giao dịch');
  });
});
