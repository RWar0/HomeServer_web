import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';

@Directive({
  selector: '[appHasRole], [appHasAnyRole]',
  standalone: true,
})
export class HasRoleDirective {
  private authService = inject(AuthService);

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set appHasRole(role: string) {
    this.viewContainer.clear();

    if (this.authService.hasRole(role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  @Input() set appHasAnyRole(roles: string[]) {
    this.viewContainer.clear();
    if (this.authService.hasAnyRole(roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
