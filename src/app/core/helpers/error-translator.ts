const statusTranslations: Record<string, string> = {
  Unauthorized: 'Brak autoryzacji!',
  Forbidden: 'Brak uprawnień!',
  NoServerConnection: 'Brak polaczenia z serwerem',
  BadRequest: 'Niepoprawne dane!',
  NotFound: 'Nie znaleziono!',
  Conflict: 'Wystąpił konflikt!',
  'Bad Request': 'Niepoprawne dane!',
  'Not Found': 'Nie znaleziono!',
  'Internal Server Error': 'Błąd serwera!',
};

/**
 * Translates an error status title to a more user-friendly format.
 *
 * @param statusTitle - The error status title to translate.
 * @returns string - The translated error status title.
 *
 * @example
 * const translatedTitle = translateErrorStatusTitle(error.title);
 *
 * const translatedTitle = translateErrorStatusTitle('Not Found'); // -> 'Nie znaleziono!'
 */
export function translateErrorStatusTitle(statusTitle: string) {
  return statusTranslations[statusTitle] ?? statusTitle;
}
