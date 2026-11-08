import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/error-message.util';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password: unknown = control.get('password')?.value;
  const confirmPassword: unknown = control.get('confirmPassword')?.value;

  return typeof password === 'string' &&
    typeof confirmPassword === 'string' &&
    password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected get isConfirmPasswordInvalid(): boolean {
    const confirmPassword = this.registerForm.controls.confirmPassword;
    return (
      confirmPassword.touched &&
      (confirmPassword.invalid || this.registerForm.hasError('passwordMismatch'))
    );
  }

  protected onSubmit(): void {
    this.errorMessage.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, username, email, password } = this.registerForm.getRawValue();
    this.isLoading.set(true);
    this.authService
      .register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/wallets'),
        error: (error: unknown) =>
          this.errorMessage.set(
            getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'),
          ),
      });
  }
}
