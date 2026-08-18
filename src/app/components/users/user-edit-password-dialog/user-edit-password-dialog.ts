import { Component, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/users/user.service';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { EditUserPasswordDto } from '../../../core/models/user.model';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';

@Component({
  selector: 'user-edit-password-dialog',
  imports: [
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    ErrorLabel,
    ReactiveFormsModule,
    HlmSpinnerImports,
    SubmitButton,
  ],
  templateUrl: './user-edit-password-dialog.html',
  styleUrl: './user-edit-password-dialog.css',
})
export class UserEditPasswordDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userService = inject(UserService);

  // Signals
  private readonly userId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isSubmitting = signal(false);

  private passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get('password')?.value;
      const confirmPassword = control.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordsMismatch: true };
    };
  }

  protected readonly updatePasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(5)]],
    confirmPassword: ['', [Validators.required, this.passwordsMatchValidator()]],
  });

  protected submitForm() {
    if (!this.userId()) {
      toast.error('Wystąpił nieoczekiwany błąd z ID użytkownika!');
      this.dialog()?.close();
      this.updatePasswordForm.reset();
      this.updatePasswordForm.markAsUntouched();
      this.userId.set(null);
      return;
    }

    if (this.updatePasswordForm.invalid) {
      this.updatePasswordForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.updatePasswordForm.getRawValue();
    const userData: EditUserPasswordDto = {
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    this.isSubmitting.set(true);

    this.userService
      .updatePassword(this.userId()!, userData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          toast.success(res.message);
          this.dialog()?.close();
          this.updatePasswordForm.reset();
          this.updatePasswordForm.markAsUntouched();
        },
        error: (err) => {
          displayApiError(err);
        },
      });
  }

  open(userId: string) {
    this.updatePasswordForm.reset();
    this.updatePasswordForm.markAsUntouched();

    this.userId.set(userId);
    this.dialog().open();
  }
}
