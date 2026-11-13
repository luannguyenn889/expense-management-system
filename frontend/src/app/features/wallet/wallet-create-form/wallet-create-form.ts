import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { WalletService } from '../../../core/services/wallet.service';
import { Wallet } from '../../../core/models/wallet.model';
import { getErrorMessage } from '../../../core/utils/error-message.util';

const MAX_WALLET_BALANCE = 9_999_999_999_999;

@Component({
  selector: 'app-wallet-create-form',
  imports: [ReactiveFormsModule],
  templateUrl: './wallet-create-form.html',
  styleUrl: './wallet-create-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletCreateForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly walletCreated = output<Wallet>();
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly walletForm = this.formBuilder.nonNullable.group({
    walletName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    walletType: this.formBuilder.nonNullable.control<'BANK_ACCOUNT' | 'CASH' | 'MOMO'>(
      'BANK_ACCOUNT',
      Validators.required,
    ),
    balance: this.formBuilder.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(MAX_WALLET_BALANCE),
      ]),
    //balance: [0, [Validators.required, Validators.min(0), Validators.max(MAX_WALLET_BALANCE)]],
  });

  protected onSubmit(): void {
    this.errorMessage.set('');
    if (this.walletForm.invalid) {
      this.walletForm.markAllAsTouched();
      return;
    }

const request = this.walletForm.getRawValue();
this.isLoading.set(true);

      this.walletService
        .createWallet({
          ...request,
          walletName: request.walletName.trim(),
          balance: request.balance!,
        })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (wallet) => {
          this.walletForm.reset({ walletName: '', walletType: 'BANK_ACCOUNT', balance: null });
          this.walletCreated.emit(wallet);
        },
        error: (error: unknown) =>
          this.errorMessage.set(getErrorMessage(error, 'Không thể tạo ví. Vui lòng thử lại.')),
      });
  }
}
