import { ApplicationRef, Component, inject, input, resource, signal } from '@angular/core';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { DatePipe } from '@angular/common';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { TableColumn } from '../../../core/models/data-table.model';
import { AquariumParameterCheckListItem } from '../../../core/models/aquarium.model';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { toast } from '@spartan-ng/brain/sonner';
import { ParametersCheckService } from '../../../core/services/parameters-check/parameters-check.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DeleteConfirmDialog } from '../../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { lucideInfo, lucideNotebookPen, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { AquariumParameterCheckCreateEditDialog } from '../../../components/aquariums/aquarium-parameter-check-create-edit-dialog/aquarium-parameter-check-create-edit-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ParameterCheckInfoDialog } from '../../../components/parameter-checks/parameter-check-info-dialog/parameter-check-info-dialog';

@Component({
  selector: 'app-aquarium-parameter-checks-page',
  imports: [
    NgIcon,
    DataTable,
    Pagination,
    DeleteConfirmDialog,
    RefreshListButton,
    HlmDropdownMenuImports,
    HlmButtonImports,
    AquariumParameterCheckCreateEditDialog,
    ParameterCheckInfoDialog,
  ],
  templateUrl: './aquarium-parameter-checks-page.html',
  styleUrl: './aquarium-parameter-checks-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({ lucideNotebookPen, lucidePlus, lucideTrash2, lucideInfo }),
  ],
})
export class AquariumParameterChecksPage {
  // Injects
  private readonly aquariumService = inject(AquariumService);
  private readonly parameterCheckService = inject(ParametersCheckService);
  private readonly appRef = inject(ApplicationRef);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // Inputs
  protected readonly aquariumId = input.required<string>();

  // Signals
  protected readonly refreshSignal = signal(0);

  // Table column definitions
  protected readonly parameterCheckColumns: TableColumn<AquariumParameterCheckListItem>[] = [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'measuredAt',
      label: 'Data pomiaru',
      sortable: true,
      format: (value) => {
        if (!value) {
          return '-';
        }
        return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '-';
      },
    },
    {
      key: 'ph',
      label: 'pH',
      format: (value) => (value != null ? `${value}` : '-'),
    },
    {
      key: 'kh',
      label: 'KH',
      format: (value) => (value != null ? `${value}` : '-'),
    },
    {
      key: 'gh',
      label: 'GH',
      format: (value) => (value != null ? `${value}` : '-'),
    },
    {
      key: 'no3',
      label: 'NO3',
      format: (value) => (value != null ? `${value}` : '-'),
    },
    {
      key: 'no2',
      label: 'NO2',
      format: (value) => (value != null ? `${value}` : '-'),
    },
    {
      key: 'temperature',
      label: 'Temp. (°C)',
      format: (value) => (value != null ? `${value}` : '-'),
    },
  ];

  constructor() {
    syncPaginationQueryParams();
  }

  // Resources
  protected readonly parameterChecksData = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.aquariumService
          .getAquariumParameterChecks(this.aquariumId(), params.paginationState)
          .pipe(
            tap((res) => {
              this.paginationStore.setPagination(res.pagination);
            }),
            catchError((err) => {
              this.paginationStore.reset();
              displayApiError(err);
              this.appRef.tick();
              return of(emptyPaginatedResponse<AquariumParameterCheckListItem>());
            }),
          ),
      ),
  });

  protected get parameterCheckRecords(): AquariumParameterCheckListItem[] {
    return this.parameterChecksData.value()?.data ?? [];
  }

  // Row actions
  protected onDelete(waterChangeId: string): void {
    if (!waterChangeId) {
      toast.error('Brak danych', { description: 'Identyfikator pomiaru parametrów jest wymagany' });
      return;
    }

    this.parameterCheckService.delete(waterChangeId).subscribe({
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
  protected refreshList(): void {
    this.refreshSignal.update((value) => value + 1);
  }
}
