import { ApplicationRef, Component, inject, input, resource, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { FormSelect } from '../../../components/select/form-select/form-select';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { DatePipe } from '@angular/common';
import { lucideFilterX, lucideNotebookPen, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { VehicleServicesService } from '../../../core/services/vehicle-service/vehicle-service.service';
import {
  VehicleServiceForVehicleFilterDto,
  VehicleServiceForVehicleListItemDto,
} from '../../../core/models/vehicle-service.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { syncQueryParams } from '../../../core/helpers/signal-patameter-query-sync';
import { toast } from '@spartan-ng/brain/sonner';
import { displayApiError } from '../../../core/helpers/error-handler';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { TableColumn } from '../../../core/models/data-table.model';
import { VehicleServiceForVehicleCreateEditDialog } from '../../../components/vehicle-services/vehicle-service-for-vehicle-create-edit-dialog/vehicle-service-for-vehicle-create-edit-dialog';

@Component({
  selector: 'app-vehicle-services-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    FormDatePicker,
    VehicleServiceForVehicleCreateEditDialog,
  ],
  templateUrl: './vehicle-services-list-page.html',
  styleUrl: './vehicle-services-list-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen, lucideFilterX }),
  ],
})
export class VehicleServicesListPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly vehicleServicesService = inject(VehicleServicesService);
  private readonly vehicleService = inject(VehicleService);
  protected readonly paginationStore = inject(PaginationStore);

  // Inputs
  protected readonly vehicleId = input.required<string>();

  // Signals
  private readonly refreshSignal = signal(0);

  protected readonly filters = signal<VehicleServiceForVehicleFilterDto>({
    title: null,
    fromCost: null,
    toCost: null,
    fromDate: null,
    toDate: null,
  });

  protected readonly serviceColumns: TableColumn<VehicleServiceForVehicleListItemDto>[] = [
    { key: 'id', label: 'ID', hidden: true },
    { key: 'date', label: 'Data', sortable: true },
    { key: 'title', label: 'Usługa', sortable: true },
    { key: 'cost', label: 'Koszt', sortable: true },
    { key: 'itemsCount', label: 'Pozycje', sortable: true },
  ];

  constructor() {
    syncPaginationQueryParams();
    syncQueryParams(this.filters, {
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
  }

  protected readonly servicesList = resource({
    params: () => ({
      vehicleId: this.vehicleId(),
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.vehicleService
          .getServices(params.vehicleId, params.paginationState, params.filters)
          .pipe(
            tap((res) => this.paginationStore.setPagination(res.pagination)),
            catchError((err) => {
              this.paginationStore.reset();
              displayApiError(err);
              this.appRef.tick();
              return of(emptyPaginatedResponse<VehicleServiceForVehicleListItemDto>());
            }),
          ),
      ),
  });

  protected get servicesRecords(): VehicleServiceForVehicleListItemDto[] {
    return this.servicesList.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((v) => v + 1);
  }

  // Row Actions
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

  // Helpers
  protected setFilter<K extends keyof VehicleServiceForVehicleFilterDto>(
    key: K,
    value: VehicleServiceForVehicleFilterDto[K],
  ) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  protected clearAllFilters(): void {
    this.filters.set({
      title: null,
      fromCost: null,
      toCost: null,
      fromDate: null,
      toDate: null,
    });
  }
}
