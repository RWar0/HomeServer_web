const statusTranslations: Record<string, string> = {
  Unauthorized: 'Brak autoryzacji!',
  NoServerConnection: 'Brak polaczenia z serwerem',
  BadRequest: 'Niepoprawne dane!',
  'Bad Request': 'Niepoprawne dane!',
};

export function translateErrorStatusTitle(statusTitle: string) {
  return statusTranslations[statusTitle] ?? statusTitle;
}
