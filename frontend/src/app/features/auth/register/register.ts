import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/utils/error-message.util';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isRegistered = signal(false);
  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected onSubmit(): void {
    this.errorMessage.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.registerForm.getRawValue();
    this.isLoading.set(true);
    this.authService
      .register({ fullName: fullName.trim(), email: email.trim(), password })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => this.isRegistered.set(true),
        error: (error: unknown) =>
          this.errorMessage.set(getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.')),
      });
  }
}
