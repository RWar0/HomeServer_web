import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideHouse, lucideLockKeyholeOpen, lucideUsers } from '@ng-icons/lucide';
import {
  HlmSidebarWrapper,
  HlmSidebar,
  HlmSidebarHeader,
  HlmSidebarContent,
  HlmSidebarGroup,
  HlmSidebarFooter,
} from '@spartan-ng/helm/sidebar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarUser } from '../sidebar-user/sidebar-user';
import { SidebarSection } from '../../../core/types/sidebar.type';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar-items';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    HlmSidebarWrapper,
    HlmSidebar,
    HlmSidebarHeader,
    HlmSidebarContent,
    HlmSidebarGroup,
    HlmSidebarFooter,
    NgIcon,
    RouterLink,
    SidebarUser,
    RouterLinkActive,
  ],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
  viewProviders: [
    provideIcons({ lucideHouse, lucideCalendar, lucideUsers, lucideLockKeyholeOpen }),
  ],
})
export class Sidebar {
  private readonly authService = inject(AuthService);

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
