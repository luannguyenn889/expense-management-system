export type WalletType = 'BANK_ACCOUNT' | 'CASH' | 'MOMO';

export interface Wallet {
  walletId: number;
  walletName: string;
  balance: number;
  walletType?: WalletType;
  isActive?: boolean;
}

export interface WalletCreateRequest {
  walletName: string;
  balance: number;
  walletType: WalletType;
}
