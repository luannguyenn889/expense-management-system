import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletCreateForm } from './wallet-create-form';

describe('WalletCreateForm', () => {
  it('should accept wallet names up to 100 characters', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(
        of({ walletId: 1, walletName: 'a'.repeat(100), balance: 0, walletType: 'BANK_ACCOUNT' }),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'a'.repeat(100);
    inputs[0].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(walletService.createWallet).toHaveBeenCalledWith({
      walletName: 'a'.repeat(100),
      balance: 0,
      walletType: 'BANK_ACCOUNT',
    });
  });

  it('should submit the selected wallet type and clear the form after success', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(
        of({
          walletId: 1,
          walletName: 'Ví dự phòng',
          balance: 250000,
          walletType: 'BANK_ACCOUNT',
        }),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = '  Ví dự phòng  ';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '250000';
    inputs[1].dispatchEvent(new Event('input'));
    const typeSelect = fixture.nativeElement.querySelector('select');
    typeSelect.value = 'MOMO';
    typeSelect.dispatchEvent(new Event('change'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(walletService.createWallet).toHaveBeenCalledWith({
      walletName: 'Ví dự phòng',
      balance: 250000,
      walletType: 'MOMO',
    });
    expect(inputs[0].value).toBe('');
    expect(typeSelect.value).toBe('BANK_ACCOUNT');
  });

  it('should reject balances above 9,999,999,999,999 VND', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'Ví dự phòng';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '10000000000000';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Số dư không được vượt quá 9.999.999.999.999 đ.',
    );
  });
});
