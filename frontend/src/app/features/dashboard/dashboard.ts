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
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Wallet } from '../../core/models/wallet.model';
import { WalletService } from '../../core/services/wallet.service';
import { getErrorMessage } from '../../core/utils/error-message.util';
import { getWalletTypeIcon, getWalletTypeLabel } from '../../core/utils/wallet-type.util';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyVndPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly wallets = signal<Wallet[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly totalBalance = computed(() =>
    this.wallets().reduce((total, wallet) => total + wallet.balance, 0),
  );
  protected readonly activeWalletCount = computed(
    () => this.wallets().filter((wallet) => wallet.isActive !== false).length,
  );
  protected readonly walletTypeIcon = getWalletTypeIcon;
  protected readonly walletTypeLabel = getWalletTypeLabel;
  protected readonly today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

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
          this.errorMessage.set(
            getErrorMessage(error, 'Không thể tải dữ liệu tổng quan. Vui lòng thử lại.'),
          ),
      });
  }
}