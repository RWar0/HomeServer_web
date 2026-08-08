const statusTranslations: Record<string, string> = {
  Unauthorized: 'Brak autoryzacji!',
  Forbidden: 'Brak uprawnień!',
  NoServerConnection: 'Brak polaczenia z serwerem',
  BadRequest: 'Niepoprawne dane!',
  NotFound: 'Nie znaleziono!',
  'Bad Request': 'Niepoprawne dane!',
  'Not Found': 'Nie znaleziono!',
  'Internal Server Error': 'Błąd serwera!',
};

export function translateErrorStatusTitle(statusTitle: string) {
  return statusTranslations[statusTitle] ?? statusTitle;
}
