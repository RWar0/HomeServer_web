import { ApplicationRef, Component, inject, input, resource, signal } from '@angular/core';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { AquariumWaterChangeListItem } from '../../../core/models/water-changes.model';
import { TableColumn } from '../../../core/models/data-table.model';
import { DatePipe } from '@angular/common';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideNotebookPen, lucidePlus, lucideRotateCw, lucideTrash2 } from '@ng-icons/lucide';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { AquariumWaterChangeCreateEditDialog } from '../../../components/aquariums/aquarium-water-change-create-edit-dialog/aquarium-water-change-create-edit-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';

@Component({
  selector: 'app-aquarium-water-changes-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    AquariumWaterChangeCreateEditDialog,
    RefreshListButton,
  ],
  templateUrl: './aquarium-water-changes-page.html',
  styleUrl: './aquarium-water-changes-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucideNotebookPen, lucideTrash2, lucidePlus, lucideRotateCw }),
  ],
})
export class AquariumWaterChangesPage {
  // Services
  private readonly aquariumService = inject(AquariumService);
  private readonly waterChangeService = inject(WaterChangeService);
  private readonly appRef = inject(ApplicationRef);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // Inputs
  protected readonly aquariumId = input.required<string>();

  // Signals
  protected readonly refreshSignal = signal(0);

  // Table column definitions
  protected readonly waterChangeColumns: TableColumn<AquariumWaterChangeListItem>[] = [
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
  ];

  constructor() {
    syncPaginationQueryParams();
  }

  // Resources
  protected readonly waterChangesMetadataResponse = resource({
    params: () => ({
      paginationState: this.paginationStore.state,
      refreshState: this.refreshSignal(),
    }),
    loader: () =>
      firstValueFrom(
        this.aquariumService
          .getAquariumWaterChanges(this.aquariumId(), this.paginationStore.state)
          .pipe(
            tap((res) => {
              this.paginationStore.setPagination(res.pagination);
            }),
            catchError((err) => {
              this.paginationStore.reset();
              displayApiError(err);
              this.appRef.tick();
              return of(emptyPaginatedResponse<AquariumWaterChangeListItem>());
            }),
          ),
      ),
  });

  protected get waterChangeRecords(): AquariumWaterChangeListItem[] {
    return this.waterChangesMetadataResponse.value()?.data ?? [];
  }

  protected refreshList(): void {
    this.refreshSignal.update((val) => val + 1);
  }

  // Row actions
  protected onEdit(waterChangeId: string): void {
    console.log('Edytuj:', waterChangeId);
  }

  protected onDelete(waterChangeId: string): void {
    if (!waterChangeId) {
      toast.error('Brak danych', { description: 'Identyfikator podmiany wody jest wymagany' });
      return;
    }

    this.waterChangeService.deleteWaterChange(waterChangeId).subscribe({
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
