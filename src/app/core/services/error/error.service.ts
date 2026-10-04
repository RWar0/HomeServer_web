import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar-items';
import { displayApiError } from '../../helpers/error-handler';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly router = inject(Router);

  displayForbiddenError(
    forbiddenParam: unknown,
    redirectedFrom: unknown,
    currentRoute: ActivatedRoute,
  ) {
    if (forbiddenParam === 'true') {
      let error = {
        error: {
          title: 'Forbidden',
          detail: 'Nie posiadasz uprawnień dostępu do tej strony!',
          status: 403,
          type: 'unauthorized',
        },
      };

      if (redirectedFrom) {
        const section = SIDEBAR_ITEMS.find((section) =>
          section.items.find((item) => item.url === redirectedFrom),
        );

        const title = section && section.items.find((item) => item.url === redirectedFrom)?.title;

        const readableTitle =
          section && title ? `${section?.title} -> ${title}` : 'niezidentyfikowanej sekcji';

        error.error.detail = `Nie posiadasz uprawnień dostępu do sekcji: ${readableTitle}!`;
      }

      displayApiError(error, 10000);
      this.clearQueryParams(currentRoute);
    }
  }

  private clearQueryParams(currentRoute: ActivatedRoute) {
    this.router.navigate([], {
      relativeTo: currentRoute,
      queryParams: { forbidden: null, redirected_from: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
