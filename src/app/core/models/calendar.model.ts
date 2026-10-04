import { CalendarEvent } from './calendar-event.model';

export interface CalendarDayCell {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  hasAkwarium: boolean;
  hasPojazd: boolean;
  overflowCount: number;
}
