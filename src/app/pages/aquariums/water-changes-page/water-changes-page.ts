import { ApplicationRef, Component, inject, resource, signal } from '@angular/core';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { WaterChangeListItem } from '../../../core/models/water-changes.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { TableColumn } from '../../../core/models/data-table.model';
import { DatePipe } from '@angular/common';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { toast } from '@spartan-ng/brain/sonner';

@Component({
  selector: 'app-water-changes-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    Pagination,
    DataTable,
    NgIcon,
    DeleteConfirmDialog,
    RefreshListButton,
  ],
  templateUrl: './water-changes-page.html',
  styleUrl: './water-changes-page.css',
  providers: [PaginationStore, DatePipe, provideIcons({ lucidePlus, lucideTrash2 })],
})
export class WaterChangesPage {
  // injects
  private readonly appRef = inject(ApplicationRef);
  private readonly waterChangesService = inject(WaterChangeService);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // signals
  private readonly refreshSignal = signal(0);

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
  }

  // resources
  protected readonly waterChangesList = resource({
    params: () => ({
      paginationState: this.paginationStore.state,
      refreshState: this.refreshSignal(),
    }),
    loader: () =>
      firstValueFrom(
        this.waterChangesService.getAll(this.paginationStore.state).pipe(
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
}
