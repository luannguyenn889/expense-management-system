import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

type ProfileTab = 'details' | 'password';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private savedProfile = this.authService.profile();
  protected readonly activeTab = signal<ProfileTab>('details');
  protected readonly successMessage = signal('');
  protected readonly profileForm = this.formBuilder.nonNullable.group({
    fullName: [
      this.savedProfile.fullName,
      [Validators.required, Validators.pattern(/.*\S.*/), Validators.maxLength(100)],
    ],
    username: [
      this.savedProfile.username,
      [Validators.required, Validators.pattern(/.*\S.*/), Validators.maxLength(50)],
    ],
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected selectTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
    this.successMessage.set('');
  }

  protected onSave(): void {
    this.successMessage.set('');
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }

    const updatedProfile = {
      fullName: this.profileForm.controls.fullName.value.trim(),
      username: this.profileForm.controls.username.value.trim(),
    };
    this.authService.updateProfileLocally(updatedProfile);
    this.savedProfile = updatedProfile;
    this.profileForm.setValue(updatedProfile);
    this.successMessage.set(
      'Đã cập nhật thông tin trên giao diện. Dữ liệu sẽ được đồng bộ với hệ thống khi backend hoàn thiện.',
    );
  }

  protected onCancel(): void {
    this.profileForm.reset(this.savedProfile);
    this.profileForm.markAsPristine();
    this.successMessage.set('');
  }

  protected onChangePassword(): void {
    this.successMessage.set('');
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordForm.reset();
    this.successMessage.set(
      'Biểu mẫu hợp lệ. Chức năng đổi mật khẩu sẽ hoạt động khi backend hoàn thiện.',
    );
  }

  protected onCancelPasswordChange(): void {
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
    this.successMessage.set('');
  }
}
