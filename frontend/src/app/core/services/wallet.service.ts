import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Wallet, WalletCreateRequest } from '../models/wallet.model';
import { unwrapApiResponse } from '../utils/api-response.util';

export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getWallets(): Observable<Wallet[]> {
    return this.http
      .get<ApiResponse<Wallet[]>>(`${this.apiUrl}/wallets`)
      .pipe(map(unwrapApiResponse));
  }

  createWallet(request: WalletCreateRequest): Observable<Wallet> {
    return this.http
      .post<ApiResponse<Wallet>>(`${this.apiUrl}/wallets`, request)
      .pipe(map(unwrapApiResponse));
  }
}

Injectable({ providedIn: 'root' })(WalletService);
