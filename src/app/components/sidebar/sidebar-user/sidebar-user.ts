import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideUserCircle2, lucideChevronsUpDown } from '@ng-icons/lucide';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { toast } from '@spartan-ng/brain/sonner';
import { displayApiError } from '../../../core/helpers/error-handler';
import { translateRole } from '../../../core/helpers/role-translator';

@Component({
  selector: 'sidebar-user',
  imports: [NgIcon, HlmDropdownMenuImports, HlmButtonImports],
  templateUrl: './sidebar-user.html',
  styleUrl: './sidebar-user.css',
  viewProviders: [provideIcons({ lucideUserCircle2, lucideLogOut, lucideChevronsUpDown })],
})
export class SidebarUser {
  private readonly authService = inject(AuthService);
  protected readonly user = signal(this.authService.user());

  protected readonly translatedRole = computed(() => translateRole(this.user()?.role ?? ''));

  protected logOut() {
    this.authService.logout().subscribe({
      next: (res) => {
        toast.success(res.message);
      },
      error: (err) => {
        displayApiError(err);
      },
    });
  }
}
