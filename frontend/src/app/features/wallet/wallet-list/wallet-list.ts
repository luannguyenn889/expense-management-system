import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Wallet } from '../../../core/models/wallet.model';
import { WalletService } from '../../../core/services/wallet.service';
import { getErrorMessage } from '../../../core/utils/error-message.util';
import { getWalletTypeIcon, getWalletTypeLabel } from '../../../core/utils/wallet-type.util';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { WalletCreateForm } from '../wallet-create-form/wallet-create-form';

type WalletAction = 'deactivate' | 'delete';

@Component({
  selector: 'app-wallet-list',
  imports: [CurrencyVndPipe, WalletCreateForm],
  templateUrl: './wallet-list.html',
  styleUrls: ['./wallet-list.css', './wallet-actions.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletList implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly wallets = signal<Wallet[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly walletActionError = signal('');
  protected readonly isWalletActionLoading = signal(false);
  protected readonly pendingWalletAction = signal<{
    wallet: Wallet;
    action: WalletAction;
  } | null>(null);
  protected readonly totalBalance = computed(() =>
    this.wallets().reduce((total, wallet) => total + wallet.balance, 0),
  );
  protected readonly walletTypeIcon = getWalletTypeIcon;
  protected readonly walletTypeLabel = getWalletTypeLabel;

  ngOnInit(): void {
    this.loadWallets();
  }

  protected loadWallets(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.walletService
      .getWallets()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (wallets) => this.wallets.set(wallets),
        error: (error: unknown) =>
          this.errorMessage.set(getErrorMessage(error, 'Không thể tải danh sách ví. Vui lòng thử lại.')),
      });
  }

  protected onWalletCreated(): void {
    this.loadWallets();
  }

  protected openWalletAction(wallet: Wallet, action: WalletAction): void {
    this.walletActionError.set('');
    this.pendingWalletAction.set({ wallet, action });
  }

  protected closeWalletAction(): void {
    if (this.isWalletActionLoading()) {
      return;
    }
    this.pendingWalletAction.set(null);
    this.walletActionError.set('');
  }

  protected confirmWalletAction(): void {
    const pending = this.pendingWalletAction();
    if (!pending || this.isWalletActionLoading()) {
      return;
    }

    this.walletActionError.set('');
    this.isWalletActionLoading.set(true);
    const request =
      pending.action === 'deactivate'
        ? this.walletService.deactivateWallet(pending.wallet.walletId)
        : this.walletService.deleteWallet(pending.wallet.walletId);

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isWalletActionLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.pendingWalletAction.set(null);
          this.loadWallets();
        },
        error: (error: unknown) => {
          const actionLabel = pending.action === 'deactivate' ? 'ngừng sử dụng' : 'xóa';
          this.walletActionError.set(
            getErrorMessage(
              error,
              `Không thể ${actionLabel} ví. Backend có thể chưa hỗ trợ API này hoặc hiện không khả dụng.`,
            ),
          );
        },
      });
  }
}
