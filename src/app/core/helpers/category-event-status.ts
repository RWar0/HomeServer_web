import { CalendarStatusEnum } from '../enums/calendar-status.enum';

export const translateCalendarStatus = (status: CalendarStatusEnum) => {
  switch (status) {
    case CalendarStatusEnum.WAITING:
      return 'Oczekujące';
    case CalendarStatusEnum.COMPLETED:
      return 'Zrealizowane';
    case CalendarStatusEnum.OVERDUE:
      return 'Po terminie';
  }
};

export const getCalendarEventStatusIcon = (status: CalendarStatusEnum) => {
  switch (status) {
    case CalendarStatusEnum.WAITING:
      return 'lucideClock';
    case CalendarStatusEnum.COMPLETED:
      return 'lucideCheckSquare2';
    case CalendarStatusEnum.OVERDUE:
      return 'lucideAlertTriangle';
  }
};

export const getCalendarEventIconStatusColorClass = (status: CalendarStatusEnum) => {
  switch (status) {
    case CalendarStatusEnum.WAITING:
      return 'text-blue-700';
    case CalendarStatusEnum.COMPLETED:
      return 'text-green-700';
    case CalendarStatusEnum.OVERDUE:
      return 'text-red-700';
  }
};

export const getCalendarEventIconBgColorClass = (status: CalendarStatusEnum) => {
  switch (status) {
    case CalendarStatusEnum.WAITING:
      return 'bg-blue-50';
    case CalendarStatusEnum.COMPLETED:
      return 'bg-green-50';
    case CalendarStatusEnum.OVERDUE:
      return 'bg-red-50';
  }
};
