import { Component, input } from '@angular/core';
import { DashboardAttentionListItem } from '../../../core/models/dashboard.model';
import { NgIcon } from '@ng-icons/core';
import { CalendarStatusEnum } from '../../../core/enums/calendar-status.enum';
import {
  getCalendarEventStatusIcon,
  getEventStatusByDate,
} from '../../../core/helpers/category-event-status';
import { getEventCategoryIcon } from '../../../core/helpers/category-event-icon';
import { getDayDifference } from '../../../core/helpers/date-utils';
import { RouterLink } from '@angular/router';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { translateEventCategory } from '../../../core/helpers/calendar-event-category-translator';

@Component({
  selector: 'dashboard-attention-list',
  imports: [NgIcon, RouterLink, HlmSpinner],
  templateUrl: './dashboard-attention-list.html',
  styleUrl: './dashboard-attention-list.css',
})
export class DashboardAttentionList {
  // Inputs
  readonly items = input.required<DashboardAttentionListItem[] | null>();
  readonly isLoading = input.required<boolean>();

  // Assigned
  protected readonly calendarStatusEnum = CalendarStatusEnum;

  protected readonly translateCategory = translateEventCategory;

  // Helpers
  protected getStatus(item: DashboardAttentionListItem): CalendarStatusEnum {
    return getEventStatusByDate(item.date, item.completionDate);
  }

  protected getStatusIcon(item: DashboardAttentionListItem): string {
    const status = getEventStatusByDate(item.date, item.completionDate);
    return getCalendarEventStatusIcon(status);
  }

  protected getStatusClass(item: DashboardAttentionListItem): string {
    const status = getEventStatusByDate(item.date, item.completionDate);

    switch (status) {
      case CalendarStatusEnum.OVERDUE:
        return 'bg-red-50 text-red-600';

      case CalendarStatusEnum.WAITING:
        return 'bg-amber-50 text-amber-600';

      case CalendarStatusEnum.COMPLETED:
        return 'bg-emerald-50 text-emerald-600';
    }
  }

  protected getIconForCategory(item: DashboardAttentionListItem): string {
    return getEventCategoryIcon(item.category);
  }

  protected getIconClass(item: DashboardAttentionListItem): string {
    const status = getEventStatusByDate(item.date, item.completionDate);

    switch (status) {
      case CalendarStatusEnum.OVERDUE:
        return 'text-red-500';

      case CalendarStatusEnum.WAITING:
        return 'text-amber-500';

      case CalendarStatusEnum.COMPLETED:
        return 'text-emerald-500';
    }
  }

  protected getStatusLabel(item: DashboardAttentionListItem): string {
    const status = getEventStatusByDate(item.date, item.completionDate);

    switch (status) {
      case CalendarStatusEnum.OVERDUE:
        return 'Zaległe';

      case CalendarStatusEnum.WAITING:
        return 'Oczekujące';

      case CalendarStatusEnum.COMPLETED:
        return 'Ukończone';
    }
  }

  protected getDateLabel(item: DashboardAttentionListItem) {
    const dayDiff = getDayDifference(item.date, new Date());

    if (dayDiff === 0) {
      return 'Dzisiaj';
    }

    if (dayDiff === -1) {
      if (getEventStatusByDate(item.date, item.completionDate) === CalendarStatusEnum.OVERDUE) {
        return 'Zaległe z wczoraj';
      }
      return 'Wczorajsze';
    }

    if (dayDiff < -1) {
      return `Zaległe o ${Math.abs(dayDiff)} dni`;
    }

    if (dayDiff === 1) {
      return 'Jutro';
    }

    return `Za ${dayDiff} dni`;
  }
}
