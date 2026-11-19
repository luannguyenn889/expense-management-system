import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { WalletService } from '../../../core/services/wallet.service';
import { WalletCreateForm } from './wallet-create-form';

describe('WalletCreateForm Component (15 Test Cases)', () => {
  // ==========================================
  // NHÓM 1: VALIDATION TÊN VÍ (TC01 - TC05)
  // ==========================================

  it('TC01: should show required error when wallet name is left empty', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập tên ví.');
  });

  it('TC02: should reject wallet name containing only whitespace', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    nameInput.value = '    ';
    nameInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên ví không được chỉ chứa khoảng trắng.');
  });

  it('TC03: should accept wallet name up to maximum boundary of 100 characters', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(of({ walletId: 1, walletName: 'A'.repeat(100), balance: 10000, walletType: 'BANK_ACCOUNT' })),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');
    nameInput.value = 'A'.repeat(100);
    nameInput.dispatchEvent(new Event('input'));
    balanceInput.value = '10000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).toHaveBeenCalledWith(expect.objectContaining({ walletName: 'A'.repeat(100) }));
  });

  it('TC04: should reject wallet name exceeding 100 characters', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    nameInput.value = 'A'.repeat(101);
    nameInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Tên ví không được vượt quá 100 ký tự.');
  });

  it('TC05: should trim leading and trailing spaces from wallet name upon submit', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(of({ walletId: 2, walletName: 'Ví tiết kiệm', balance: 50000, walletType: 'BANK_ACCOUNT' })),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');
    nameInput.value = '   Ví tiết kiệm   ';
    nameInput.dispatchEvent(new Event('input'));
    balanceInput.value = '50000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).toHaveBeenCalledWith(expect.objectContaining({ walletName: 'Ví tiết kiệm' }));
  });

  // ==========================================
  // NHÓM 2: VALIDATION SỐ DƯ & AUTO-FORMATTING (TC06 - TC10)
  // ==========================================

  it('TC06: should require initial balance and display validation message when left empty', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    nameInput.value = 'Ví chi tiêu';
    nameInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vui lòng nhập số dư ban đầu.');
  });

  it('TC07: should automatically format thousand separators when typing numbers', async () => {
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: { createWallet: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input') as HTMLInputElement;
    balanceInput.value = '1000000';
    balanceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance['balanceDisplay']()).toBe('1.000.000');
    expect(fixture.componentInstance['walletForm'].controls.balance.value).toBe(1000000);
  });

  it('TC08: should parse correctly when user inputs formatted amount with dots (e.g. 100.000)', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(of({ walletId: 3, walletName: 'Ví phụ', balance: 100000, walletType: 'BANK_ACCOUNT' })),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input') as HTMLInputElement;
    nameInput.value = 'Ví phụ';
    nameInput.dispatchEvent(new Event('input'));
    balanceInput.value = '100.000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).toHaveBeenCalledWith(expect.objectContaining({ balance: 100000 }));
  });

  it('TC09: should clear balance value and set null when clearing amount input', async () => {
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: { createWallet: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input') as HTMLInputElement;
    balanceInput.value = '50000';
    balanceInput.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance['walletForm'].controls.balance.value).toBe(50000);

    balanceInput.value = '';
    balanceInput.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance['walletForm'].controls.balance.value).toBeNull();
    expect(fixture.componentInstance['balanceDisplay']()).toBe('');
  });

  it('TC10: should reject initial balance exceeding 9,999,999,999,999 VND', async () => {
    const walletService = { createWallet: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    nameInput.value = 'Ví tỷ phú';
    nameInput.dispatchEvent(new Event('input'));
    fixture.componentInstance['walletForm'].controls.balance.setValue(10_000_000_000_000);
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Số dư không được vượt quá 9.999.999.999.999 đ.');
  });

  // ==========================================
  // NHÓM 3: LOẠI VÍ & FORM SUBMISSION (TC11 - TC15)
  // ==========================================

  it('TC11: should submit with CASH wallet type when selected', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(of({ walletId: 4, walletName: 'Tiền mặt', balance: 200000, walletType: 'CASH' })),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const typeSelect = fixture.nativeElement.querySelector('select[formControlName="walletType"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');

    nameInput.value = 'Tiền mặt';
    nameInput.dispatchEvent(new Event('input'));
    typeSelect.value = 'CASH';
    typeSelect.dispatchEvent(new Event('change'));
    balanceInput.value = '200000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).toHaveBeenCalledWith({
      walletName: 'Tiền mặt',
      walletType: 'CASH',
      balance: 200000,
    });
  });

  it('TC12: should submit with MOMO wallet type when selected', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(of({ walletId: 5, walletName: 'Ví MoMo', balance: 150000, walletType: 'MOMO' })),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const typeSelect = fixture.nativeElement.querySelector('select[formControlName="walletType"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');

    nameInput.value = 'Ví MoMo';
    nameInput.dispatchEvent(new Event('input'));
    typeSelect.value = 'MOMO';
    typeSelect.dispatchEvent(new Event('change'));
    balanceInput.value = '150000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(walletService.createWallet).toHaveBeenCalledWith({
      walletName: 'Ví MoMo',
      walletType: 'MOMO',
      balance: 150000,
    });
  });

  it('TC13: should disable submit button and show loading state during creation', async () => {
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: { createWallet: vi.fn() } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);

    fixture.componentInstance['isLoading'].set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Đang tạo ví...');
  });

  it('TC14: should reset form and emit walletCreated output upon successful creation', async () => {
    const createdWallet = { walletId: 10, walletName: 'Ví mới', balance: 300000, walletType: 'BANK_ACCOUNT' };
    const walletService = { createWallet: vi.fn().mockReturnValue(of(createdWallet)) };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const emitSpy = vi.fn();
    fixture.componentInstance.walletCreated.subscribe(emitSpy);

    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');
    nameInput.value = 'Ví mới';
    nameInput.dispatchEvent(new Event('input'));
    balanceInput.value = '300000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(createdWallet);
    expect(fixture.componentInstance['walletForm'].controls.walletName.value).toBe('');
    expect(fixture.componentInstance['walletForm'].controls.balance.value).toBeNull();
    expect(fixture.componentInstance['balanceDisplay']()).toBe('');
  });

  it('TC15: should display error message when backend returns creation failure', async () => {
    const walletService = {
      createWallet: vi.fn().mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Ví cùng tên và loại đã tồn tại' } })),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [WalletCreateForm],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(WalletCreateForm);
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector('input[formControlName="walletName"]');
    const balanceInput = fixture.nativeElement.querySelector('.amount-input input');
    nameInput.value = 'Ví trùng';
    nameInput.dispatchEvent(new Event('input'));
    balanceInput.value = '10000';
    balanceInput.dispatchEvent(new Event('input'));

    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ví cùng tên và loại đã tồn tại');
  });
});
