const statusTranslations: Record<string, string> = {
  Unauthorized: 'Brak autoryzacji!',
  Forbidden: 'Brak uprawnień!',
  NoServerConnection: 'Brak polaczenia z serwerem',
  BadRequest: 'Niepoprawne dane!',
  'Bad Request': 'Niepoprawne dane!',
  'Internal Server Error': 'Błąd serwera!',
};

export function translateErrorStatusTitle(statusTitle: string) {
  return statusTranslations[statusTitle] ?? statusTitle;
}
