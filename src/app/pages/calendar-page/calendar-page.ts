import { Component, computed, effect, inject, resource, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideCalendar,
  lucideClock,
  lucideMapPin,
  lucidePlus,
  lucideTrash2,
  lucideHistory,
  lucideFish,
  lucideCar,
  lucideCheckCircle2,
  lucideFilter,
  lucideCalendarDays,
  lucideAlertCircle,
  lucideRefreshCcw,
  lucideNotebookPen,
  lucideHome,
  lucideUser,
  lucideAlertTriangle,
  lucideCheckSquare2,
  lucideCheck,
  lucideCalendarCheck,
  lucideInfo,
} from '@ng-icons/lucide';
import { tablerCar } from '@ng-icons/tabler-icons';
import { CalendarService } from '../../core/services/calendar/calendar.service';
import { CalendarEvent } from '../../core/models/calendar-event.model';
import { CalendarEventDialog } from '../../components/calendar/custom-event-create-edit-dialog/custom-event-create-edit-dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { CalendarEventCategory } from '../../core/enums/calendar-event-category.enum';
import { translateEventCategory } from '../../core/helpers/calendar-event-category-translator';
import { catchError, firstValueFrom, of } from 'rxjs';
import { displayApiError } from '../../core/helpers/error-handler';
import { RefreshListButton } from '../../components/common/refresh-list-button/refresh-list-button';
import { CalendarDayCell } from '../../core/models/calendar.model';
import { formatDateToIsoDate, isSameDay } from '../../core/helpers/date-utils';
import { DeleteConfirmDialog } from '../../components/common/delete-confirm-dialog/delete-confirm-dialog';
import { DateFilterDto } from '../../core/models/common-filters.model';
import { syncQueryParams } from '../../core/helpers/signal-patameter-query-sync';
import { CalendarStatusEnum } from '../../core/enums/calendar-status.enum';
import {
  getCalendarEventIconBgColorClass,
  getCalendarEventIconStatusColorClass,
  getCalendarEventStatusIcon,
  getEventStatus,
  translateCalendarStatus,
} from '../../core/helpers/category-event-status';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import {
  existsCalendarEventSubCategory,
  getRedirectPathForCalendarEventSubcategory,
} from '../../core/helpers/calendar-event-subcategory';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  getEventCategoryIcon,
  getEventCategoryIconColorClass,
} from '../../core/helpers/category-event-icon';
import { getOpenDialogAndRemoveQueryParam } from '../../core/helpers/get-open-dialog-and-remove-query-param';

@Component({
  selector: 'app-calendar-page',
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmTooltipImports,
    NgIcon,
    CalendarEventDialog,
    RefreshListButton,
    DeleteConfirmDialog,
    HlmSpinner,
    RouterLink,
  ],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.css',
  providers: [
    DatePipe,
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideCalendar,
      lucideCalendarCheck,
      lucideClock,
      lucideMapPin,
      lucidePlus,
      lucideTrash2,
      lucideHistory,
      lucideFish,
      lucideCar,
      lucideCheck,
      lucideCheckCircle2,
      lucideCheckSquare2,
      lucideFilter,
      lucideCalendarDays,
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideRefreshCcw,
      tablerCar,
      lucideNotebookPen,
      lucideHome,
      lucideUser,
      lucideInfo,
    }),
  ],
})
export class CalendarPage {
  // Injects
  private readonly calendarService = inject(CalendarService);
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // View childs
  readonly eventDialog = viewChild.required(CalendarEventDialog);

  // Access to methods
  protected readonly CalendarEventCategory = CalendarEventCategory;
  protected readonly translateEventCategory = translateEventCategory;
  protected readonly CalendarEventCategoryEntries = Object.entries(CalendarEventCategory).map(
    ([key, value]) => ({ key: value, value: translateEventCategory(value) }),
  );

  // Custom methods allowing easy access to helper functions and HTML
  protected readonly getStatusIcon = getCalendarEventStatusIcon;
  protected readonly getStatusIconColorClass = getCalendarEventIconStatusColorClass;
  protected readonly getStatusIconBgColorClass = getCalendarEventIconBgColorClass;
  protected readonly translateCalendarStatus = translateCalendarStatus;
  protected readonly existsCalendarEventSubCategory = existsCalendarEventSubCategory;
  protected readonly getRedirectPathForCalendarEventSubcategory =
    getRedirectPathForCalendarEventSubcategory;

  // State Signals
  protected readonly isLoading = computed(() => this.eventsResource.status() === 'loading');
  readonly activeDate = signal<Date>(new Date());
  readonly selectedDate = signal<Date>(new Date());
  readonly selectedDateStr = computed(() => formatDateToIsoDate(this.selectedDate()));
  readonly selectedCategory = signal<null | CalendarEventCategory>(null);

  readonly refreshSignal = signal(0);

  protected readonly filters = signal<DateFilterDto>({
    fromDate: new Date(this.activeDate().getFullYear(), this.activeDate().getMonth(), 1),
    toDate: new Date(this.activeDate().getFullYear(), this.activeDate().getMonth() + 1, 0),
  });

  // Polish Weekday Headers (starting Monday)
  readonly weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];

  constructor() {
    syncQueryParams(this.filters, {
      fromDate: {
        setter: (value) => this.setFilter('fromDate', value ? new Date(value) : null),
        formatter: (filters) => filters?.toISOString().split('T')[0],
      },
      toDate: {
        setter: (value) => this.setFilter('toDate', value ? new Date(value) : null),
        formatter: (filters) => filters?.toISOString().split('T')[0],
      },
    });

    effect(() => {
      getOpenDialogAndRemoveQueryParam(this.route, this.router, 'addEvent', () =>
        this.eventDialog()?.openCreate(),
      );
    });

    effect(() => {
      const queryParam = this.route.snapshot.queryParamMap.get('open_date');

      if (queryParam) {
        // Set selected date and apply filters
        const dateObj = new Date(queryParam);

        // Calculate filters based on year and month
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();

        const fromDate = new Date(year, month, 2);
        const toDate = new Date(year, month + 1, 1);

        // Set filters
        this.setFilter('fromDate', fromDate);
        this.setFilter('toDate', toDate);

        // Set active date
        this.activeDate.set(dateObj);
        this.selectedDate.set(dateObj);

        // Remove query param from URL
        setTimeout(() => {
          this.router.navigate([], {
            queryParams: { open_date: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        });
      }
    });
  }

  // Polish Month Display Title (e.g. "Wrzesień 2026")
  readonly monthTitle = computed(() => {
    const dt = this.activeDate();
    const monthName = dt.toLocaleDateString('pl-PL', { month: 'long' });
    const capitalizedMonth = monthName
      ? monthName.charAt(0).toUpperCase() + monthName.slice(1)
      : '';
    return `${capitalizedMonth} ${dt.getFullYear()}`;
  });

  // Resource of calendar events
  protected readonly eventsResource = resource({
    params: () => ({
      refreshState: this.refreshSignal(),
      filters: this.filters(),
    }),
    loader: ({ params }) =>
      firstValueFrom(
        this.calendarService.getAll(params.filters).pipe(
          catchError((err) => {
            displayApiError(err);
            return of([]);
          }),
        ),
      ),
  });

  protected get calendarEvents(): CalendarEvent[] {
    return this.eventsResource.value() ?? [];
  }

  // Events filtered by active category selection
  readonly events = computed(() => {
    const all = this.calendarEvents;
    const cat = this.selectedCategory();

    if (cat === null) {
      return all;
    }

    return all.filter((e) => e.category === cat);
  });

  // Calculate grid cells for month view
  readonly calendarGrid = computed<CalendarDayCell[]>(() => {
    const currentActive = this.activeDate();
    const today = new Date();
    const selected = this.selectedDate();
    const allEvents = this.events();

    const year = currentActive.getFullYear();
    const month = currentActive.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const jsDay = firstOfMonth.getDay();
    const firstWeekday = jsDay === 0 ? 7 : jsDay;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Pad days from previous month (Monday based)
    const prevDaysCount = firstWeekday - 1;

    const totalGridSize = prevDaysCount + daysInMonth > 35 ? 42 : 35;
    const cells: CalendarDayCell[] = [];

    for (let i = 0; i < totalGridSize; i++) {
      const cellDate = new Date(year, month, 1 - prevDaysCount + i);
      const dateStr = formatDateToIsoDate(cellDate);
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = isSameDay(cellDate, today);
      const isSelected = isSameDay(cellDate, selected);

      const dayEvents = allEvents.filter((e) => isSameDay(e.date, cellDate));
      const hasAkwarium = dayEvents.some((e) => e.category === CalendarEventCategory.Aquarium);
      const hasPojazd = dayEvents.some((e) => e.category === CalendarEventCategory.Vehicle);

      // Overflow indicator if day has more than 3 events
      const overflowCount = dayEvents.length > 3 ? dayEvents.length - 3 : 0;

      cells.push({
        date: cellDate,
        dateStr,
        dayNumber: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        events: dayEvents,
        hasAkwarium,
        hasPojazd,
        overflowCount,
      });
    }

    return cells;
  });

  // Selected Day Details Header text (e.g. "Czwartek, 4 września 2026")
  readonly selectedDayTitle = computed(() => {
    const dt = this.selectedDate();
    if (!dt) {
      return '';
    }
    const dayName = dt.toLocaleDateString('pl-PL', { weekday: 'long' });
    const capitalizedDay = dayName ? dayName.charAt(0).toUpperCase() + dayName.slice(1) : '';
    const monthName = dt.toLocaleDateString('pl-PL', { month: 'long' });

    return `${capitalizedDay}, ${dt.getDate()} ${monthName} ${dt.getFullYear()}`;
  });

  // Selected Day Events list
  readonly selectedDayEvents = computed<CalendarEvent[]>(() => {
    const selected = this.selectedDate();
    return this.events().filter((e) => isSameDay(e.date, selected));
  });

  private updateMonthFilters(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1 + 1);
    const lastDay = new Date(year, month + 1, 0 + 1);

    this.filters.set({
      fromDate: firstDay,
      toDate: lastDay,
    });
  }

  // Actions
  prevMonth(): void {
    this.activeDate.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.updateMonthFilters(this.activeDate());
  }

  nextMonth(): void {
    this.activeDate.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.updateMonthFilters(this.activeDate());
  }

  goToToday(): void {
    const today = new Date();

    if (today.getMonth() !== this.activeDate().getMonth()) {
      this.updateMonthFilters(today);
    }

    this.activeDate.set(today);
    this.selectedDate.set(today);
  }

  selectCell(cell: CalendarDayCell): void {
    if (cell.isCurrentMonth) {
      this.selectedDate.set(cell.date);
      return;
    }

    if (cell.date.getMonth() < this.activeDate().getMonth()) {
      this.prevMonth();
    } else {
      this.nextMonth();
    }

    this.selectedDate.set(cell.date);
    this.updateMonthFilters(cell.date);
  }

  setCategoryFilter(category: null | CalendarEventCategory): void {
    this.selectedCategory.set(category);
  }

  onDelete(eventId: string): void {
    this.calendarService.deleteEvent(eventId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  completeCustomEvent(eventId: string) {
    this.calendarService.markAsDone(eventId).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.refreshList();
      },
      error: (err) => displayApiError(err),
    });
  }

  formatEventDate(dateVal: Date | string): string {
    return this.datePipe.transform(dateVal, 'dd.MM.yyyy') ?? '';
  }

  protected refreshList() {
    this.refreshSignal.update((value) => value + 1);
  }

  private setFilter<K extends keyof DateFilterDto>(filter: K, value: DateFilterDto[K]) {
    this.filters.update((prev) => ({ ...prev, [filter]: value }));
  }

  // Statuses for calendar event
  protected getEventStatus(event: CalendarEvent): CalendarStatusEnum {
    return getEventStatus(event);
  }

  // Classes (colors, styles, etc) for event categories

  protected readonly LegendWithColor = computed(() =>
    this.CalendarEventCategoryEntries.map(({ key, value }) => ({
      key,
      value,
      color: this.getColorForCategoryLegend(key),
    })),
  );

  protected getIconForCategory(category: CalendarEventCategory): string {
    return getEventCategoryIcon(category);
  }

  protected getClassesForEventCategory(category: CalendarEventCategory): string {
    return getEventCategoryIconColorClass(category);
  }

  protected getColorForEventDot(category: CalendarEventCategory): string {
    switch (category) {
      case CalendarEventCategory.Aquarium: {
        return 'bg-cyan-500 ring-cyan-200';
      }
      case CalendarEventCategory.Vehicle: {
        return 'bg-orange-500 ring-orange-200';
      }
      case CalendarEventCategory.Home: {
        return 'bg-blue-500 ring-blue-200';
      }
      case CalendarEventCategory.Personal: {
        return 'bg-red-500 ring-red-200';
      }
      case CalendarEventCategory.Other: {
        return 'bg-purple-500 ring-purple-200';
      }
    }
  }

  private getColorForCategoryLegend(category: CalendarEventCategory): string {
    switch (category) {
      case CalendarEventCategory.Aquarium: {
        return 'bg-cyan-500';
      }
      case CalendarEventCategory.Vehicle: {
        return 'bg-orange-500';
      }
      case CalendarEventCategory.Home: {
        return 'bg-blue-500';
      }
      case CalendarEventCategory.Personal: {
        return 'bg-red-500';
      }
      case CalendarEventCategory.Other: {
        return 'bg-purple-500';
      }
    }
  }
}
