import { WalletType } from '../models/wallet.model';

export function getWalletTypeLabel(walletType?: WalletType): string {
  switch (walletType) {
    case 'CASH':
      return 'Tiền mặt';
    case 'MOMO':
      return 'MoMo';
    case 'BANK_ACCOUNT':
    default:
      return 'Tài khoản ngân hàng';
  }
}

export function getWalletTypeIcon(walletType?: WalletType): string {
  switch (walletType) {
    case 'CASH':
      return 'payments';
    case 'MOMO':
      return 'account_balance_wallet';
    case 'BANK_ACCOUNT':
    default:
      return 'account_balance';
  }
}
