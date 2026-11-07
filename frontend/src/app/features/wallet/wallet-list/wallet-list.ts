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
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Wallet } from '../../../core/models/wallet.model';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { getErrorMessage } from '../../../core/utils/error-message.util';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { WalletCreateForm } from '../wallet-create-form/wallet-create-form';

@Component({
  selector: 'app-wallet-list',
  imports: [CurrencyVndPipe, RouterLink, WalletCreateForm],
  templateUrl: './wallet-list.html',
  styleUrl: './wallet-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletList implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly wallets = signal<Wallet[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly totalBalance = computed(() =>
    this.wallets().reduce((total, wallet) => total + wallet.balance, 0),
  );

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

  protected onLogout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
