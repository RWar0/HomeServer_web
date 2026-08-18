import { Component, computed, inject, output, signal, viewChild } from '@angular/core';
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
import { RolesEnum } from '../../../core/enums/roles.enum';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateUserDto } from '../../../core/models/user.model';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { FormSelect } from '../../select/form-select/form-select';
import { SelectOption } from '../../../core/models/select.model';
import { translateRole } from '../../../core/helpers/role-translator';

@Component({
  selector: 'user-create-dialog',
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
    FormSelect,
  ],
  templateUrl: './user-create-dialog.html',
  styleUrl: './user-create-dialog.css',
})
export class UserCreateDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userService = inject(UserService);

  // Outputs
  readonly refreshList = output<void>();

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isSubmitting = signal(false);

  protected readonly rolesSelectOption = computed<SelectOption[]>(() => {
    return Object.values(RolesEnum).map((role) => ({
      id: role,
      name: translateRole(role),
    }));
  });

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

  private customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[^\s@]{2,}$/;

      return emailRegex.test(control.value) ? null : { email: true };
    };
  }

  protected readonly userForm = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, this.customEmailValidator()]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    confirmPassword: ['', [Validators.required, this.passwordsMatchValidator()]],
    role: [RolesEnum.User, Validators.required],
  });

  protected selectRole(value: string | null): void {
    if (!value || !(value in RolesEnum)) {
      toast.warning('Wybrano niepoprawną rolę!');
      return;
    }

    this.userForm.controls.role.setValue(value as RolesEnum);
  }

  protected submitForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.userForm.getRawValue();
    const userData: CreateUserDto = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
    };

    this.isSubmitting.set(true);

    this.userService
      .create(userData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.refreshList.emit();
          toast.success(res.message);
          this.dialog()?.close();
          this.userForm.reset();
          this.userForm.markAsUntouched();
        },
        error: (err) => {
          displayApiError(err);
        },
      });
  }

  open() {
    this.userForm.reset();
    this.userForm.markAsUntouched();

    this.dialog().open();
  }
}
