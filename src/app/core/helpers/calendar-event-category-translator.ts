const eventCategoryTranslator: Record<string, string> = {
  Aquarium: 'Akwarium',
  Vehicle: 'Pojazd',
  Home: 'Dom',
  Personal: 'Osobiste',
  Other: 'Inne',
};

/**
 * Translates a event category name to Polish.
 *
 * @param category - The event category name to translate.
 * @returns string - The translated event category name.
 *
 * @example
 * const translatedCategory = translateEventCategory('Aquarium');
 */
export function translateEventCategory(category: string) {
  return eventCategoryTranslator[category] ?? category;
}
