import { CalendarEventSubCategory } from '../enums/calendar-event-subcategory.enum';

export const redirectPaths: Record<CalendarEventSubCategory, string> = {
  [CalendarEventSubCategory.WaterChange]: '/aquariums/water-changes',
  [CalendarEventSubCategory.ParameterCheck]: '/aquariums/parameter-checks',
  [CalendarEventSubCategory.VehicleFueling]: '/vehicles/fuelings',
  [CalendarEventSubCategory.VehicleService]: '/vehicles/services',
};

export function existsCalendarEventSubCategory(subCategory?: string): boolean {
  return !!subCategory && subCategory in redirectPaths;
}

export function getRedirectPathForCalendarEventSubcategory(
  subCategory?: CalendarEventSubCategory,
): string | null {
  if (!existsCalendarEventSubCategory(subCategory)) {
    return null;
  }

  return redirectPaths[subCategory!];
}
