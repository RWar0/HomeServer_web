import { ApplicationRef, Component, inject, resource, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
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
import { lucideNotebookPen, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { TableColumn } from '../../../core/models/data-table.model';
import { VehicleListItemDto } from '../../../core/models/vehicle.model';
import { translateVehicleType } from '../../../core/helpers/vehicle-type-translator';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { VehicleCreateEditDialog } from '../../../components/vehicles/vehicle-create-edit-dialog/vehicle-create-edit-dialog';

@Component({
  selector: 'app-vehicle-list-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
    VehicleCreateEditDialog,
  ],
  templateUrl: './vehicle-list-page.html',
  styleUrl: './vehicle-list-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucidePlus, lucideTrash2, lucideNotebookPen }),
  ],
})
export class VehicleListPage {
  // injects
  private readonly appRef = inject(ApplicationRef);
  private readonly vehicleService = inject(VehicleService);
  protected readonly paginationStore = inject(PaginationStore);

  // signals
  private readonly refreshSignal = signal(0);

  // table colimn definitions
  protected readonly vehicleColumns: TableColumn<VehicleListItemDto>[] = [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'brand',
      label: 'Marka',
      sortable: true,
    },
    {
      key: 'model',
      label: 'Model',
      sortable: true,
    },
    {
      key: 'production',
      label: 'Rocznik',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Rodzaj',
      sortable: true,
      format: (value) => translateVehicleType(value as string),
    },
  ];

  constructor() {
    syncPaginationQueryParams();
  }

  protected readonly vehiclesList = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.vehicleService.getAll(params.paginationState).pipe(
          tap((res) => {
            this.paginationStore.setPagination(res.pagination);
          }),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<VehicleListItemDto>());
          }),
        ),
      ),
  });

  protected get vehiclesRecords(): VehicleListItemDto[] {
    return this.vehiclesList.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((value) => value + 1);
  }

  // Row actions
  protected onDelete(vehicleId: string): void {
    if (!vehicleId) {
      toast.error('Brak danych', { description: 'Identyfikator pojazdu jest wymagany' });
      return;
    }

    this.vehicleService.delete(vehicleId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (error) => {
        displayApiError(error);
      },
    });
  }
}
