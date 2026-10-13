import {
  ApplicationRef,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { RefreshListButton } from '../../components/common/refresh-list-button/refresh-list-button';
import { tablerCalendarEvent } from '@ng-icons/tabler-icons';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { CalendarEventDialog } from '../../components/calendar/custom-event-create-edit-dialog/custom-event-create-edit-dialog';
import { CustomEventService } from '../../core/services/custom-event/custom-event.service';
import { PaginationStore } from '../../core/stores/pagination.store';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../core/helpers/error-handler';
import { emptyPaginatedResponse } from '../../constants/empty-pagination-state';
import { CustomEventItemDto, CustomEventListFilters } from '../../core/models/calendar-event.model';
import {
  lucideCheck,
  lucideCheckCircle,
  lucideFilterX,
  lucideInfo,
  lucideNotebookPen,
  lucidePlus,
  lucideTrash2,
  lucideUndo2,
  lucideXCircle,
} from '@ng-icons/lucide';
import { syncPaginationQueryParams } from '../../core/helpers/pagination-query-sync';
import { syncQueryParams } from '../../core/helpers/signal-patameter-query-sync';
import { TableColumn } from '../../core/models/data-table.model';
import { DatePipe } from '@angular/common';
import { DataTable } from '../../components/data-table/data-table/data-table';
import { HlmDropdownMenuImports, HlmDropdownMenuSeparator } from '@spartan-ng/helm/dropdown-menu';
import { DeleteConfirmDialog } from '../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { Pagination } from '../../components/common/pagination/pagination';
import { toast } from '@spartan-ng/brain/sonner';
import { CustomEventInfoDialog } from '../../components/custom-events/custom-event-info-dialog/custom-event-info-dialog';
import { translateEventCategory } from '../../core/helpers/calendar-event-category-translator';
import { getOpenDialogAndRemoveQueryParam } from '../../core/helpers/get-open-dialog-and-remove-query-param';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterSearchInput } from '../../components/common/filter-search-input/filter-search-input';
import { FormSelect } from '../../components/select/form-select/form-select';
import { FormDatePicker } from '../../components/date-picker/form-date-picker/form-date-picker';
import { CalendarEventCategory } from '../../core/enums/calendar-event-category.enum';
import { SelectOption } from '../../core/models/select.model';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { ConfirmDialog } from '../../components/common/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-custom-events-page',
  imports: [
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmPopoverImports,
    NgIcon,
    RefreshListButton,
    CalendarEventDialog,
    DataTable,
    HlmDropdownMenuSeparator,
    DeleteConfirmDialog,
    Pagination,
    CustomEventInfoDialog,
    FilterSearchInput,
    FormSelect,
    FormDatePicker,
    ConfirmDialog,
  ],
  templateUrl: './custom-events-page.html',
  styleUrl: './custom-events-page.css',
  providers: [
    PaginationStore,
    DatePipe,
    provideIcons({
      tablerCalendarEvent,
      lucidePlus,
      lucideNotebookPen,
      lucideTrash2,
      lucideInfo,
      lucideFilterX,
      lucideCheckCircle,
      lucideCheck,
      lucideXCircle,
      lucideUndo2,
    }),
  ],
})
export class CustomEventsPage {
  // Injects
  private readonly appRef = inject(ApplicationRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customEventService = inject(CustomEventService);
  private readonly datePipe = inject(DatePipe);
  protected readonly paginationStore = inject(PaginationStore);

  // Constants
  protected readonly eventCategorySelectOptions: SelectOption[] = Object.entries(
    CalendarEventCategory,
  ).map(([key, value]) => ({ id: key, name: translateEventCategory(value) }));

  protected readonly eventCompletionSelectOptions: SelectOption[] = [
    { id: 'true', name: 'Zakończone' },
    { id: 'false', name: 'Niezakończone' },
  ];

  // Computer
  protected readonly isDateFilterActive = computed(
    () =>
      this.filters().fromDate ||
      this.filters().toDate ||
      this.filters().fromCompletionDate ||
      this.filters().toCompletionDate,
  );

  protected readonly isOtherFilterActive = computed(
    () => this.filters().location || this.filters().description,
  );

  // Signals
  protected readonly infoDialogCmp = viewChild<CustomEventInfoDialog>('infoDialogCmp');
  protected readonly refreshSignal = signal(0);

  // Filters
  protected readonly filters = signal<CustomEventListFilters>({
    title: null,
    category: null,
    location: null,
    description: null,
    fromDate: null,
    toDate: null,
    isCompleted: null,
    fromCompletionDate: null,
    toCompletionDate: null,
  });

  // Table Columns
  protected readonly eventsColumns: TableColumn<CustomEventItemDto>[] = [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'date',
      label: 'Data wydarzenia',
      sortable: true,
      format: (value) => {
        if (!value) {
          return '-';
        }
        return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '-';
      },
    },
    {
      key: 'time',
      label: 'Godzina wydarzenia',
      isVisible: false,
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'title',
      label: 'Nazwa wydarzenia',
      sortable: true,
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'category',
      label: 'Kategoria',
      sortable: true,
      format: (value) => (value != null ? translateEventCategory(value.toString()) : '-'),
    },
    {
      key: 'location',
      label: 'Lokalizacja',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'description',
      label: 'Opis',
      format: (value) => (value != null ? value.toString() : '-'),
    },
    {
      key: 'completionDate',
      label: 'Data ukończenia',
      sortable: true,
      format: (value) => {
        if (!value) {
          return '-';
        }
        return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '-';
      },
    },
  ];

  constructor() {
    syncPaginationQueryParams();
    syncQueryParams(this.filters, {
      title: { setter: (v) => this.setFilter('title', v) },
      category: {
        setter: (v) => this.setFilter('category', v as CalendarEventCategory),
      },
      location: { setter: (v) => this.setFilter('location', v) },
      description: { setter: (v) => this.setFilter('description', v) },
      isCompleted: {
        setter: (v) => this.setFilter('isCompleted', v),
      },
      fromDate: {
        setter: (v) => this.setFilter('fromDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
      toDate: {
        setter: (v) => this.setFilter('toDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
      fromCompletionDate: {
        setter: (v) => this.setFilter('fromCompletionDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
      toCompletionDate: {
        setter: (v) => this.setFilter('toCompletionDate', v ? new Date(v) : null),
        formatter: (v) => v?.toISOString().split('T')[0],
      },
    });

    effect(() => {
      getOpenDialogAndRemoveQueryParam(this.route, this.router, 'show_id', (showId) =>
        this.infoDialogCmp()?.open(showId),
      );
    });
  }

  // Resource
  protected readonly eventsResource = resource({
    params: () => ({
      paginationState: this.paginationStore.requestParams(),
      filters: this.filters(),
      refreshState: this.refreshSignal(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.customEventService.getAll(params.paginationState, params.filters).pipe(
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

  protected get eventsRecords(): CustomEventItemDto[] {
    return this.eventsResource.value()?.data ?? [];
  }

  protected refreshList() {
    this.refreshSignal.update((v) => v + 1);
  }

  protected formatEventDate(dateVal: Date | string): string {
    return this.datePipe.transform(dateVal, 'dd.MM.yyyy') ?? '';
  }

  // Row actions
  protected onDelete(eventId: string): void {
    this.customEventService.delete(eventId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  protected markAsDone(eventId: string) {
    this.customEventService.markAsDone(eventId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  protected markAsNotDone(eventId: string) {
    this.customEventService.markAsNotDone(eventId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  // Filters
  protected onCategorySelect(value: string | null): void {
    if (!value) {
      this.setFilter('category', null);
      return;
    }

    if (!(value in CalendarEventCategory)) {
      toast.warning('Wybrano nieprawidłową kategorię');
      this.setFilter('category', null);
      return;
    }

    this.setFilter('category', value as CalendarEventCategory);
  }

  protected onCompletionSelect(value: string | null): void {
    if (!value) {
      this.setFilter('isCompleted', null);
      return;
    }

    if (value !== 'true' && value !== 'false') {
      toast.warning('Wybrano nieprawidłowy status');
      this.setFilter('isCompleted', null);
      return;
    }

    this.setFilter('isCompleted', value);
  }

  protected setFilter<K extends keyof CustomEventListFilters>(
    key: K,
    value: CustomEventListFilters[K],
  ) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  protected clearAllFilters(): void {
    this.filters.set({
      title: null,
      category: null,
      location: null,
      description: null,
      fromDate: null,
      toDate: null,
      isCompleted: null,
      fromCompletionDate: null,
      toCompletionDate: null,
    });
  }
}
