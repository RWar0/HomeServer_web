import { ApplicationRef, Component, inject, resource, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { DatePipe } from '@angular/common';
import { lucideNotebookPen, lucidePlus, lucideTrash2, lucideFilterX } from '@ng-icons/lucide';
import { VehicleFuelingService } from '../../../core/services/vehicle-fueling/vehicle-fueling.service';
import { TableColumn } from '../../../core/models/data-table.model';
import {
  VehicleFuelingListItemDto,
  VehicleFuelingFilterDto,
} from '../../../core/models/vehicle-fueling.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { syncQueryParams } from '../../../core/helpers/signal-patameter-query-sync';
import { SelectOption } from '../../../core/models/select.model';
import { FormSelect } from '../../../components/select/form-select/form-select';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { VehicleFuelingCreateEditDialog } from '../../../components/vehicle-fuelings/vehicle-fueling-create-edit-dialog/vehicle-fueling-create-edit-dialog';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';

@Component({
  selector: 'app-vehicle-fueling-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    VehicleFuelingCreateEditDialog,
    FormSelect,
    FormDatePicker,
  ],
  templateUrl: './vehicle-fueling-list-page.html',
  styleUrl: './vehicle-fueling-list-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideFilterX }),
  ],
})
export class VehicleFuelingListPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly fuelingService = inject(VehicleFuelingService);
  private readonly vehicleService = inject(VehicleService);
  protected readonly paginationStore = inject(PaginationStore);

  // Signals
  private readonly refreshSignal = signal(0);

  protected readonly filters = signal<VehicleFuelingFilterDto>({
    vehicleId: null,
    fromDate: null,
    toDate: null,
  });

  // Table columns
  protected readonly fuelingColumns: TableColumn<VehicleFuelingListItemDto>[] = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'date', label: 'Data', sortable: true },
    { key: 'vehicleName', label: 'Pojazd', sortable: true },
    { key: 'quantity', label: 'Ilość (L)', sortable: true },
    { key: 'cost', label: 'Koszt', sortable: true },
  ];

  constructor() {
    syncPaginationQueryParams();
    syncQueryParams(this.filters, {
      vehicleId: {
        setter: (value) => this.setFilter('vehicleId', value),
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
  } 

  protected readonly fuelingsList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.fuelingService.getAll(params.paginationState, params.filters).pipe(
          tap((res) => this.paginationStore.setPagination(res.pagination)),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<VehicleFuelingListItemDto>());
          }),
        ),
      ),
  });

  protected readonly vehiclesSelectList = resource({
    params: () => ({
      refreshState: this.refreshSignal(),
    }),
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

  protected get fuelingsRecords(): VehicleFuelingListItemDto[] {
    return this.fuelingsList.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((value) => value + 1);
  }

  // Row Actions
  protected onDelete(fuelingId: string): void {
    if (!fuelingId) {
      toast.error('Brak danych', { description: 'Identyfikator tankowania jest wymagany' });
      return;
    }

    this.fuelingService.delete(fuelingId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (error) => displayApiError(error),
    });
  }

  // Helpers
  protected setFilter<K extends keyof VehicleFuelingFilterDto>(
    key: K,
    value: VehicleFuelingFilterDto[K],
  ): void {
    this.filters.update((filters) => ({
      ...filters,
      [key]: value,
    }));
  }

  protected clearAllFilters(): void {
    this.setFilter('vehicleId', null);
    this.setFilter('fromDate', null);
    this.setFilter('toDate', null);
  }
}
