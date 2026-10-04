import { CalendarEventCategory } from '../enums/calendar-event-category.enum';
import { CalendarEventSubCategory } from '../enums/calendar-event-subcategory.enum';

export interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarEventCategory;
  subCategory?: CalendarEventSubCategory;
  date: Date;
  time?: string;
  location?: string;
  description?: string;
  completionDate?: Date;
  isCustomEvent: boolean;
}

export interface CreateEditCalendarEvent {
  title: string;
  category: CalendarEventCategory;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
}
