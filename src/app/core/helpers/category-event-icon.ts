import { CalendarEventCategory } from '../enums/calendar-event-category.enum';

export function getEventCategoryIcon(category: CalendarEventCategory) {
  switch (category) {
    case CalendarEventCategory.Aquarium: {
      return 'lucideFish';
    }
    case CalendarEventCategory.Vehicle: {
      return 'tablerCar';
    }
    case CalendarEventCategory.Home: {
      return 'lucideHome';
    }
    case CalendarEventCategory.Personal: {
      return 'lucideUser';
    }
    case CalendarEventCategory.Other: {
      return 'lucideCalendar';
    }
    default: {
      return 'lucideCalendar';
    }
  }
}

export function getEventCategoryIconColorClass(category: CalendarEventCategory) {
  switch (category) {
    case CalendarEventCategory.Aquarium: {
      return 'bg-cyan-50 text-cyan-800 border-cyan-100';
    }
    case CalendarEventCategory.Vehicle: {
      return 'bg-orange-50 text-orange-800 border-orange-100';
    }
    case CalendarEventCategory.Home: {
      return 'bg-blue-50 text-blue-800 border-blue-100';
    }
    case CalendarEventCategory.Personal: {
      return 'bg-red-50 text-red-800 border-red-100';
    }
    case CalendarEventCategory.Other: {
      return 'bg-purple-50 text-purple-800 border-purple-100';
    }
    default: {
      return 'bg-purple-50 text-purple-800 border-purple-100';
    }
  }
}
