import { ActivatedRoute, Router } from '@angular/router';

export const getOpenDialogAndRemoveQueryParam = (
  route: ActivatedRoute,
  router: Router,
  queryParamName: string,
  onCallback: (value: string) => void,
) => {
  const queryParam = route.snapshot.queryParamMap.get(queryParamName);

  if (queryParam) {
    onCallback(queryParam);

    router.navigate([], {
      queryParams: { [queryParamName]: null },
      queryParamsHandling: 'merge',
    });
    return queryParam;
  }

  return null;
};
