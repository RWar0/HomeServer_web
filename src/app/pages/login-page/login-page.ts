import { Component, inject } from '@angular/core';
import { HlmCard } from '@spartan-ng/helm/card';
import { HlmFieldGroup, HlmField } from '../../../../libs/ui/field/src';
import { HlmInput } from '../../../../libs/ui/input/src';
import { HlmButton } from '@spartan-ng/helm/button';
import { ErrorLabel } from '../../components/common/error-label/error-label';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginCredentials } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { displayApiError } from '../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [HlmCard, HlmFieldGroup, HlmField, HlmInput, HlmButton, ErrorLabel, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = this.route.snapshot.queryParams;

  protected readonly loginForm = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.params['expired'] === 'true') {
      displayApiError({ message: 'Twoja sesja wygasła. Zaloguj się ponownie.' }, Infinity);
    }
  }

  protected login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginCredentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        toast.success('Zalogowano pomyślnie!');
      },
      error: (err) => {
        this.loginForm.patchValue({
          password: '',
        });
        this.clearPassword();
        displayApiError(err);
      },
    });
  }

  private clearPassword(): void {
    this.loginForm.patchValue({ password: '' });
    this.loginForm.controls.password.markAsUntouched();
  }
}
