import { ApplicationRef, Component, inject, resource, signal } from '@angular/core';
import { RolesEnum } from '../../../core/enums/roles.enum';
import { RefreshListButton } from '../../../components/common/refresh-list-button/refresh-list-button';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../../constants/empty-pagination-state';
import { ParametersCheckService } from '../../../core/services/parameters-check/parameters-check.service';
import { syncPaginationQueryParams } from '../../../core/helpers/pagination-query-sync';
import { TableColumn } from '../../../core/models/data-table.model';
import {
  ParametersCheckListFiltersDto,
  ParametersCheckListItem,
} from '../../../core/models/parameters-check.model';
import { DatePipe } from '@angular/common';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { Pagination } from '../../../components/common/pagination/pagination';
import { DataTable } from '../../../components/data-table/data-table/data-table';
import { syncQueryParams } from '../../../core/helpers/signal-patameter-query-sync';
import { FormSelect } from '../../../components/select/form-select/form-select';
import { FormDatePicker } from '../../../components/date-picker/form-date-picker/form-date-picker';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFilterX } from '@ng-icons/lucide';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { SelectOption } from '../../../core/models/select.model';

@Component({
  selector: 'app-parameters-check-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    Pagination,
    DataTable,
    RefreshListButton,
    FormSelect,
    FormDatePicker,
    NgIcon,
  ],
  templateUrl: './parameter-checks-page.html',
  styleUrl: './parameter-checks-page.css',
  providers: [PaginationStore, DatePipe, provideIcons({ lucideFilterX })],
})
export class ParameterChecksPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly parametersCheckService = inject(ParametersCheckService);
  private readonly aquariumService = inject(AquariumService);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // Signals
  protected readonly refreshSignal = signal(0);
  protected readonly RolesEnum = RolesEnum;
  protected readonly filters = signal<ParametersCheckListFiltersDto>({
    aquariumId: null,
    fromDate: null,
    toDate: null,
  });

  // Table Columns
  protected readonly parametersCheckColumns: TableColumn<ParametersCheckListItem>[] = [
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
          return '—';
        }
        return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '—';
      },
    },
    {
      key: 'aquariumName',
      label: 'Akwarium',
      sortable: true,
    },
    {
      key: 'ph',
      label: 'pH',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'kH',
      label: 'KH',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'gH',
      label: 'GH',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'nO3',
      label: 'NO3',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'nO2',
      label: 'NO2',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'temperature',
      label: 'Temperatura (°C)',
      format: (value) => (value != null ? value.toString() : '-'),
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
  }

  // Resources
  protected readonly parametersCheckList = resource({
    params: () => ({
      paginationState: this.paginationStore.state,
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.parametersCheckService.getAll(params.paginationState, params.filters).pipe(
          tap((res) => {
            this.paginationStore.setPagination(res.pagination);
          }),
          catchError((err) => {
            this.paginationStore.reset();
            displayApiError(err);
            this.appRef.tick();
            return of(emptyPaginatedResponse<any>());
          }),
        ),
      ),
  });

  protected get parametersCheckRecords(): ParametersCheckListItem[] {
    return this.parametersCheckList.value()?.data ?? [];
  }

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

  protected refreshList() {
    this.refreshSignal.set(this.refreshSignal() + 1);
  }

  // Row Actions

  // Helpers
  protected setFilter<K extends keyof ParametersCheckListFiltersDto>(
    filter: K,
    value: ParametersCheckListFiltersDto[K],
  ) {
    this.filters.update((prev) => ({ ...prev, [filter]: value }));
  }

  protected clearAllFilters() {
    this.filters.set({
      aquariumId: null,
      fromDate: null,
      toDate: null,
    });
  }
}
