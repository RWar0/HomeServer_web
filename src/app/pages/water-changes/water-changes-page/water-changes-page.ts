import {
  ApplicationRef,
  Component,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import {
  WaterChangeListFiltersDto,
  WaterChangeListItem,
} from '../../../core/models/water-changes.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { TableColumn } from '../../../core/models/data-table.model';
import { DatePipe } from '@angular/common';
import {
  lucideFilterX,
  lucideInfo,
  lucideNotebookPen,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { toast } from '@spartan-ng/brain/sonner';
import { WaterChangeCreateEditDialog } from '../../../components/water-changes/water-change-create-edit-dialog/water-change-create-edit-dialog';
import { RolesEnum } from '../../../core/enums/roles.enum';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { FormSelect } from '../../../components/select/form-select/form-select';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { SelectOption } from '../../../core/models/select.model';
import { syncQueryParams } from '../../../core/helpers/signal-patameter-query-sync';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { WaterChangeInfoDialog } from '../../../components/water-changes/water-change-info-dialog/water-change-info-dialog';
import { getOpenDialogAndRemoveQueryParam } from '../../../core/helpers/get-open-dialog-and-remove-query-param';

@Component({
  selector: 'app-water-changes-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    WaterChangeCreateEditDialog,
    FormSelect,
    FormDatePicker,
    WaterChangeInfoDialog,
  ],
  templateUrl: './water-changes-page.html',
  styleUrl: './water-changes-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideFilterX, lucideInfo }),
  ],
})
export class WaterChangesPage {
  // injects
  private readonly appRef = inject(ApplicationRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly waterChangesService = inject(WaterChangeService);
  private readonly aquariumService = inject(AquariumService);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // viewChilds
  protected readonly infoDialogCmp = viewChild<WaterChangeInfoDialog>('infoDialogCmp');

  // signals
  private readonly refreshSignal = signal(0);
  protected readonly RolesEnum = RolesEnum;

  // filtration
  protected readonly filters = signal<WaterChangeListFiltersDto>({
    aquariumId: null,
    fromDate: null,
    toDate: null,
  });

  // table colimn definitions
  protected readonly waterChangeColumns: TableColumn<WaterChangeListItem>[] = [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'changeDate',
      label: 'Data zmiany',
      sortable: true,
      format: (value) => {
        if (!value) {
          return '—';
        }
        return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '—';
      },
    },
    {
      key: 'amount',
      label: 'Ilość (l)',
      sortable: true,
      format: (value) => (value != null ? `${value} l` : '—'),
    },
    {
      key: 'aquariumName',
      label: 'Akwarium',
      sortable: true,
    },
  ];

  constructor() {
    syncPaginationQueryParams();
    syncQueryParams(this.filters, {
      aquariumId: {
        setter: (value) => this.setFilter('aquariumId', value),
      },
      fromDate: {
        setter: (value) => this.setFilter('fromDate', value ? new Date(value) : null),
        formatter: (filters) => filters?.toISOString().split('T')[0],
      },
      toDate: {
        setter: (value) => this.setFilter('toDate', value ? new Date(value) : null),
        formatter: (filters) => filters?.toISOString().split('T')[0],
      },
    });

    effect(() => {
      getOpenDialogAndRemoveQueryParam(this.route, this.router, 'show_id', (showId) =>
        this.infoDialogCmp()?.open(showId),
      );
    });
  }

  // resources
  protected readonly waterChangesList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.waterChangesService.getAll(params.paginationState, params.filters).pipe(
          tap((res) => {
            this.paginationStore.setPagination(res.pagination);
          }),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<WaterChangeListItem>());
          }),
        ),
      ),
  });

  protected readonly aquariumsSelectList = resource({
    params: () => ({
      refreshState: this.refreshSignal(),
    }),
    loader: () =>
      firstValueFrom(
        this.aquariumService.getAquariumsForSelect().pipe(
          catchError((err) => {
            displayApiError(err);
            this.appRef.tick();
            return of([]);
          }),
        ),
      ),
  });

  protected get aquariumsSelectRecords(): SelectOption[] {
    return this.aquariumsSelectList.value() ?? [];
  }

  protected get waterChangeRecords(): WaterChangeListItem[] {
    return this.waterChangesList.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((value) => value + 1);
  }

  // Row actions
  protected onDelete(waterChangeId: string): void {
    if (!waterChangeId) {
      toast.error('Brak danych', { description: 'Identyfikator podmiany wody jest wymagany' });
      return;
    }

    this.waterChangesService.deleteWaterChange(waterChangeId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (error) => {
        displayApiError(error);
      },
    });
  }

  // Helpers
  protected setFilter<K extends keyof WaterChangeListFiltersDto>(
    key: K,
    value: WaterChangeListFiltersDto[K],
  ): void {
    this.filters.update((filters) => ({
      ...filters,
      [key]: value,
    }));
  }

  protected clearAllFilters(): void {
    this.setFilter('aquariumId', null);
    this.setFilter('fromDate', null);
    this.setFilter('toDate', null);
  }
}
