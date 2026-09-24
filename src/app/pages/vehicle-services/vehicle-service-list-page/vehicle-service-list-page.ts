import {
  ApplicationRef,
  Component,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { PaginationStore } from '../../../core/stores/pagination.store';
import {
  lucideNotebookPen,
  lucidePlus,
  lucideTrash2,
  lucideFilterX,
  lucideInfo,
} from '@ng-icons/lucide';
import { VehicleServicesService } from '../../../core/services/vehicle-service/vehicle-service.service';
import { TableColumn } from '../../../core/models/data-table.model';
import {
  VehicleServiceListItemDto,
  VehicleServiceFilterDto,
} from '../../../core/models/vehicle-service.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { syncQueryParams } from '../../../core/helpers/signal-patameter-query-sync';
import { SelectOption } from '../../../core/models/select.model';
import { FormSelect } from '../../../components/select/form-select/form-select';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { VehicleServiceCreateEditDialog } from '../../../components/vehicle-services/vehicle-service-create-edit-dialog/vehicle-service-create-edit-dialog';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { FilterSearchInput } from '../../../components/common/filter-search-input/filter-search-input';
import { VehicleServiceInfoDialog } from '../../../components/vehicle-services/vehicle-service-info-dialog/vehicle-service-info-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { getOpenDialogAndRemoveQueryParam } from '../../../core/helpers/get-open-dialog-and-remove-query-param';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-vehicle-service-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    VehicleServiceCreateEditDialog,
    FormSelect,
    FormDatePicker,
    FilterSearchInput,
    VehicleServiceInfoDialog,
  ],
  templateUrl: './vehicle-service-list-page.html',
  styleUrl: './vehicle-service-list-page.css',
  providers: [
    PaginationStore,
    CurrencyPipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideFilterX, lucideInfo }),
  ],
})
export class VehicleServiceListPage {
  // Injects
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly appRef = inject(ApplicationRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vehicleServicesService = inject(VehicleServicesService);
  private readonly vehicleService = inject(VehicleService);
  protected readonly paginationStore = inject(PaginationStore);

  // Signals
  protected readonly infoDialogCmp = viewChild<VehicleServiceInfoDialog>('infoDialogCmp');
  private readonly refreshSignal = signal(0);

  protected readonly filters = signal<VehicleServiceFilterDto>({
    vehicleId: null,
    title: null,
    fromCost: null,
    toCost: null,
    fromDate: null,
    toDate: null,
  });

  protected readonly serviceColumns: TableColumn<VehicleServiceListItemDto>[] = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'date', label: 'Data', sortable: true },
    { key: 'vehicleName', label: 'Pojazd', sortable: true },
    {
      key: 'mileage',
      label: 'Przebieg (km)',
      sortable: true,
      format: (v) => (v ? v.toString() : '-'),
    },
    { key: 'title', label: 'Usługa', sortable: true },
    {
      key: 'cost',
      label: 'Koszt',
      sortable: true,
      format: (v: unknown) =>
        v ? (this.currencyPipe.transform(v as number, 'PLN', 'symbol') ?? '-') : '-',
    },
    { key: 'itemsCount', label: 'Pozycje', sortable: true },
  ];

  constructor() {
    syncPaginationQueryParams();
    syncQueryParams(this.filters, {
      vehicleId: { setter: (v) => this.setFilter('vehicleId', v) },
      title: { setter: (v) => this.setFilter('title', v) },
      fromDate: {
        setter: (v) => this.setFilter('fromDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
      toDate: {
        setter: (v) => this.setFilter('toDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
    });

    effect(() => {
      getOpenDialogAndRemoveQueryParam(this.route, this.router, 'show_id', (showId) =>
        this.infoDialogCmp()?.open(showId),
      );
    });
  }

  protected readonly servicesList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.vehicleServicesService.getAll(params.paginationState, params.filters).pipe(
          tap((res) => this.paginationStore.setPagination(res.pagination)),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<VehicleServiceListItemDto>());
          }),
        ),
      ),
  });

  protected readonly vehiclesSelectList = resource({
    params: () => ({ refreshState: this.refreshSignal() }),
    loader: () =>
      firstValueFrom(
        this.vehicleService.getForSelect().pipe(
          catchError((err) => {
            displayApiError(err);
            this.appRef.tick();
            return of([]);
          }),
        ),
      ),
  });

  protected get vehiclesSelectRecords(): SelectOption[] {
    return this.vehiclesSelectList.value() ?? [];
  }

  protected get servicesRecords(): VehicleServiceListItemDto[] {
    return this.servicesList.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((v) => v + 1);
  }

  protected onDelete(id: string): void {
    if (!id) return;
    this.vehicleServicesService.delete(id).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  protected setFilter<K extends keyof VehicleServiceFilterDto>(
    key: K,
    value: VehicleServiceFilterDto[K],
  ) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  protected clearAllFilters(): void {
    this.filters.set({
      vehicleId: null,
      title: null,
      fromCost: null,
      toCost: null,
      fromDate: null,
      toDate: null,
    });
  }
}
