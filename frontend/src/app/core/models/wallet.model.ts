export interface Wallet {
  walletId: number;
  walletName: string;
  balance: number;
  isActive?: boolean;
}

export interface WalletCreateRequest {
  walletName: string;
  balance: number;
}
