import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { Profile } from './profile';

describe('Profile', () => {
  it('should save profile details locally and show a success message', async () => {
    const profile = { fullName: 'Nguyễn Văn A', username: 'vana' };
    const authService = {
      profile: () => profile,
      updateProfileLocally: (updated: typeof profile) => Object.assign(profile, updated),
    };
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    const fullName = fixture.nativeElement.querySelector('#profile-full-name') as HTMLInputElement;
    const username = fixture.nativeElement.querySelector('#profile-username') as HTMLInputElement;
    fullName.value = '  Nguyễn An  ';
    fullName.dispatchEvent(new Event('input'));
    username.value = '  nguyenan  ';
    username.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(profile).toEqual({ fullName: 'Nguyễn An', username: 'nguyenan' });
    expect(fixture.nativeElement.textContent).toContain('Đã cập nhật thông tin trên giao diện');
  });

  it('should discard unsaved profile edits when canceled', async () => {
    const authService = {
      profile: () => ({ fullName: 'Nguyễn Văn A', username: 'vana' }),
      updateProfileLocally: () => {
        throw new Error('Cancel must not save profile data');
      },
    };
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    const fullName = fixture.nativeElement.querySelector('#profile-full-name') as HTMLInputElement;
    fullName.value = 'Tên chưa lưu';
    fullName.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('.profile-cancel').click();
    fixture.detectChanges();

    expect(fullName.value).toBe('Nguyễn Văn A');
    expect(fixture.nativeElement.textContent).not.toContain('Đã cập nhật thông tin');
  });

  it('should switch between account details and password change forms', async () => {
    const authService = {
      profile: () => ({ fullName: 'Nguyễn Văn A', username: 'vana' }),
      updateProfileLocally: () => undefined,
    };
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#profile-full-name')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#profile-current-password')).toBeNull();

    fixture.nativeElement.querySelector('.profile-tabs button:nth-child(2)').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#profile-full-name')).toBeNull();
    expect(fixture.nativeElement.querySelector('#profile-current-password')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#profile-new-password')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#profile-confirm-password')).not.toBeNull();

    fixture.nativeElement.querySelector('.profile-tabs button:nth-child(1)').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#profile-full-name')).not.toBeNull();
  });

  it('should validate the new password and matching confirmation without changing it', async () => {
    const authService = {
      profile: () => ({ fullName: 'Nguyễn Văn A', username: 'vana' }),
      updateProfileLocally: () => undefined,
    };
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.profile-tabs button:nth-child(2)').click();
    fixture.detectChanges();

    const inputs = [
      ['#profile-current-password', 'old-password'],
      ['#profile-new-password', 'new-password'],
      ['#profile-confirm-password', 'different-password'],
    ];
    for (const [selector, value] of inputs) {
      const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mật khẩu xác nhận không khớp.');
    expect(fixture.nativeElement.textContent).not.toContain('Biểu mẫu hợp lệ.');
  });
});
