import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/error-message.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly googleLoginMessage = signal('');
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  ngOnInit(): void {
    this.initGoogleAuth();
  }

  protected onSubmit(): void {
    this.errorMessage.set('');
    this.googleLoginMessage.set('');
    const username = this.loginForm.controls.username.value.trim();
    this.loginForm.controls.username.setValue(username);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();

    this.isLoading.set(true);
    this.authService
      .login(credentials)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) => this.errorMessage.set(this.getLoginErrorMessage(error)),
      });
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && [400, 401, 403, 404].includes(error.status)) {
      return 'Tên đăng nhập hoặc mật khẩu không chính xác';
    }

    return getErrorMessage(error, 'Không thể đăng nhập. Vui lòng thử lại sau.');
  }

  protected onGoogleLogin(): void {
    this.errorMessage.set('');
    this.googleLoginMessage.set('');

    const google = typeof window !== 'undefined' ? (window as any).google : undefined;
    if (!google?.accounts?.id) {
      this.googleLoginMessage.set(
        'Dịch vụ Google Sign-In chưa sẵn sàng hoặc bị chặn. Vui lòng thử lại sau.',
      );
      return;
    }

    this.initGoogleAuth();
    google.accounts.id.prompt((notification: any) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        this.googleLoginMessage.set(
          'Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup và thử lại.',
        );
      }
    });
  }

  public handleGoogleCredential(credential: string): void {
    this.isLoading.set(true);
    this.googleLoginMessage.set('Đang xác thực với Google...');
    this.authService
      .loginWithGoogle(credential)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.googleLoginMessage.set('');
          void this.router.navigateByUrl('/dashboard');
        },
        error: (error: unknown) =>
          this.googleLoginMessage.set(
            getErrorMessage(error, 'Đăng nhập Google thất bại. Vui lòng thử lại.'),
          ),
      });
  }

  private initGoogleAuth(): void {
    const google = typeof window !== 'undefined' ? (window as any).google : undefined;
    if (!google?.accounts?.id || !environment.googleClientId) {
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          this.handleGoogleCredential(response.credential);
        }
      },
    });
  }
}
