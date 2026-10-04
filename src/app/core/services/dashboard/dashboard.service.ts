import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable, forkJoin, map } from 'rxjs';
import { CalendarEvent, CreateEditCalendarEvent } from '../../models/calendar-event.model';
import { MessageResponse } from '../../models/message-response.model';
import { DateFilterDto } from '../../models/common-filters.model';
import {
  DashboardAttentionListItem,
  DashboardRecentActivity,
  DashboardStatusData,
  DashboardSummaryData,
  DashboardUpcomingEvent,
} from '../../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService {
  getSummary(): Observable<DashboardSummaryData> {
    return this.apiService.get<DashboardSummaryData>('dashboard/summary');
  }

  getAttentionItems(): Observable<DashboardAttentionListItem[]> {
    return this.apiService.get<DashboardAttentionListItem[]>('dashboard/attention-items');
  }

  getUpcomingEvents(): Observable<DashboardUpcomingEvent[]> {
    return this.apiService.get<DashboardUpcomingEvent[]>('dashboard/upcoming-events');
  }

  getRecentActivities(): Observable<DashboardRecentActivity[]> {
    return this.apiService.get<DashboardRecentActivity[]>('dashboard/recent-activities');
  }

  getStatusDataFromSummary(summaryData: DashboardSummaryData): DashboardStatusData {
    return {
      todayEventsCount: summaryData.todayEventsCount,
      overdueEventsCount: summaryData.overdueEventsCount,
      todayCompletedEventsCount: summaryData.todayCompletedEventsCount,
    };
  }
}
