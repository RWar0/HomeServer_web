import { CalendarEventCategory } from '../enums/calendar-event-category.enum';

export interface DashboardSummaryData {
  todayEventsCount: number;
  overdueEventsCount: number;
  remainingDaysToNextEvent?: number;
  remainingEventTitle?: string;
  todayCompletedEventsCount: number;
}

export interface DashboardAttentionListItem {
  id: string;
  category: CalendarEventCategory;
  title: string;
  date: Date;
  completionDate?: Date;
}

export interface DashboardUpcomingEvent {
  id: string;
  category: CalendarEventCategory;
  title: string;
  date: Date;
  time?: string;
}

export interface DashboardRecentActivity {
  id: string;
  category: CalendarEventCategory;
  title: string;
  date: Date;
}

export interface DashboardStatusData {
  todayEventsCount: number;
  overdueEventsCount: number;
  todayCompletedEventsCount: number;
}

export enum DashboardStatusTypeEnum {
  error,
  overdueTasks,
  currentTasks,
  doneCurrentTasks,
  freeDay,
}
