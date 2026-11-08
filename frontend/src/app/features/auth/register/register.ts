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

const fullNamePattern = /^[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)*$/u;
const usernamePattern = /^[A-Za-z0-9_]+$/;
const fullNameValidator: ValidatorFn = (control) => {
  const fullName = typeof control.value === 'string' ? control.value.trim() : '';
  if (!fullName) {
    return { required: true };
  }
  return fullNamePattern.test(fullName) ? null : { fullNamePattern: true };
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
  protected readonly isPasswordVisible = signal(false);
  protected readonly isConfirmPasswordVisible = signal(false);
  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      fullName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          fullNameValidator,
        ],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(usernamePattern),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
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
    const fullName = this.registerForm.controls.fullName.value.trim();
    const username = this.registerForm.controls.username.value.trim();
    const email = this.registerForm.controls.email.value.trim().toLowerCase();
    this.registerForm.patchValue({ fullName, username, email });

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password } = this.registerForm.getRawValue();
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
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) =>
          this.errorMessage.set(
            getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'),
          ),
      });
  }
}
