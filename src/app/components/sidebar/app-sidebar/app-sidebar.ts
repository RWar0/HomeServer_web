import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideChevronRight,
  lucideHouse,
  lucideLockKeyholeOpen,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { SidebarUser } from '../sidebar-user/sidebar-user';
import { SidebarSection } from '../../../core/types/sidebar.type';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar-items';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';

@Component({
  selector: 'app-sidebar',
  imports: [
    HlmSidebarImports,
    HlmCollapsibleImports,
    NgIcon,
    RouterLink,
    SidebarUser,
    RouterLinkActive,
  ],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
  viewProviders: [
    provideIcons({
      lucideHouse,
      lucideCalendar,
      lucideUsers,
      lucideLockKeyholeOpen,
      lucideChevronRight,
    }),
  ],
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly activeCollapsible = signal<string | null>(null);

  constructor() {
    // On initial, set active collapsible if sub-page is active
    setTimeout(() => {
      this.checkActiveRoute(this.router.url);
    });
  }

  private checkActiveRoute(url: string) {
    const activeItem = SIDEBAR_ITEMS.flatMap((section) => section.items || []).find(
      (item) => item.subItems && (url === item.url || url.startsWith(`${item.url}/`)),
    );

    if (activeItem && this.activeCollapsible() !== activeItem.title) {
      this.activeCollapsible.set(activeItem.title);
    }
  }

  protected toggleCollapsible(title: string, expanded: boolean) {
    if (expanded) {
      this.activeCollapsible.set(title);
    } else if (this.activeCollapsible() === title) {
      this.activeCollapsible.set(null);
    }
  }

  protected readonly _sections = computed<SidebarSection[]>(() => {
    const user = this.authService.user();
    if (!user) {
      return [];
    }

    return SIDEBAR_ITEMS.filter((section) => {
      if (!section.roles) {
        return true;
      }

      return section.roles.some((role) => user.role === role);
    });
  });
}
