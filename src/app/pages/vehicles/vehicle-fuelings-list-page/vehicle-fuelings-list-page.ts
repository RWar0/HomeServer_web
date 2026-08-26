import { ApplicationRef, Component, inject, input, resource, signal } from '@angular/core';
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
import { lucideFilterX, lucideNotebookPen, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { TableColumn } from '../../../core/models/data-table.model';
import { VehicleFuelingOfVehicleListItemDto } from '../../../core/models/vehicle-fueling.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { toast } from '@spartan-ng/brain/sonner';
import { VehicleFuelingService } from '../../../core/services/vehicle-fueling/vehicle-fueling.service';
import { DateFilterDto } from '../../../core/models/common-filters.model';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { VehicleFuelingForVehicleCreateEditDialog } from '../../../components/vehicle-fuelings/vehicle-fueling-for-vehicle-create-edit-dialog/vehicle-fueling-for-vehicle-create-edit-dialog';

@Component({
  selector: 'app-vehicle-fuelings-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    VehicleFuelingForVehicleCreateEditDialog,
    FormDatePicker,
  ],
  templateUrl: './vehicle-fuelings-list-page.html',
  styleUrl: './vehicle-fuelings-list-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideFilterX }),
  ],
})
export class VehicleFuelingsListPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly vehicleService = inject(VehicleService);
  private readonly vehicleFuelingService = inject(VehicleFuelingService);
  protected readonly paginationStore = inject(PaginationStore);

  // Inputs
  protected readonly vehicleId = input.required<string>();

  // Signals
  private readonly refreshSignal = signal(0);

  protected readonly filters = signal<DateFilterDto>({
    fromDate: null,
    toDate: null,
  });

  // Table columns
  protected readonly fuelingColumns: TableColumn<VehicleFuelingOfVehicleListItemDto>[] = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'date', label: 'Data', sortable: true },
    { key: 'quantity', label: 'Ilość (L)', sortable: true },
    { key: 'cost', label: 'Koszt', sortable: true },
  ];

  constructor() {
    syncPaginationQueryParams();
  }

  protected readonly fuelingsList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
      vehicleId: this.vehicleId(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.vehicleService
          .getFuelings(params.vehicleId, params.paginationState, params.filters)
          .pipe(
            tap((res) => this.paginationStore.setPagination(res.pagination)),
            catchError((err) => {
              this.paginationStore.reset();
              displayApiError(err);
              this.appRef.tick();
              return of(emptyPaginatedResponse<VehicleFuelingOfVehicleListItemDto>());
            }),
          ),
      ),
  });

  protected get fuelingsRecords(): VehicleFuelingOfVehicleListItemDto[] {
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

    this.vehicleFuelingService.delete(fuelingId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (error) => displayApiError(error),
    });
  }

  // Helpers
  protected setFilter<K extends keyof DateFilterDto>(key: K, value: DateFilterDto[K]): void {
    this.filters.update((filters) => ({
      ...filters,
      [key]: value,
    }));
  }

  protected clearAllFilters(): void {
    this.setFilter('fromDate', null);
    this.setFilter('toDate', null);
  }
}
