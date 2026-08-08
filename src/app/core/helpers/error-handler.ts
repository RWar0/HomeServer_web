import { toast } from '@spartan-ng/brain/sonner';
import { translateErrorStatusTitle } from './error-translator';
export interface CustomApiError {
  title: string;
  detail: string;
  status: number;
  type: string;
}

function isCustomApiError(err: any): err is CustomApiError {
  return (
    err !== null &&
    typeof err === 'object' &&
    'title' in err &&
    'detail' in err &&
    'status' in err &&
    'type' in err
  );
}

export function displayApiError(err: any, duration?: number) {
  const error = err.error;

  if (isCustomApiError(error)) {
    toast.error(translateErrorStatusTitle(error.title), { description: error.detail, duration });
    return;
  }

  if (typeof error === 'string') {
    toast.error(error, { duration });
    return;
  }

  if (err.error && err.error.errors) {
    const messages = Object.values(err.error.errors).flat().reverse() as string[];
    messages.forEach((item) => toast.error(item, { duration }));
    return;
  }

  if (err.error && err.error.title) {
    toast.error(translateErrorStatusTitle(err.error.title), { duration });
    return;
  }

  if (err.status === 0 || err.statusText === 'Unknown error') {
    toast.error('Niezidentyfikowany błąd!', {
      description:
        'Proszę skontaktować się z administratorem, ponieważ może serwer nie działać poprawnie!',
      duration,
    });
    return;
  }

  if (err.error instanceof Blob && err.error.type === 'application/problem+json') {
    err.error.text().then((text: any) => {
      const parsedError = JSON.parse(text);
      toast.error(translateErrorStatusTitle(parsedError.title), {
        description: parsedError.detail,
        duration,
      });
    });
  }

  if (err.name && err.name === 'HttpErrorResponse' && err.status) {
    switch (err.status) {
      case 400:
        toast.error('Błąd w trakcie czynności!', {
          description: 'Nie udało się załadować zasobu, ponieważ serwer napotkał błąd.',
          duration,
        });
        break;
      case 404:
        toast.error('Nie znaleziono strony!', {
          description:
            'Nie udało się wykonać podanej czynności, ponieważ podstrona akcji nie istnieje lub została usunięta.',
          duration,
        });
        break;
      default:
        toast.error('Błąd serwera!', {
          description: 'Nie udało się wykonać podanej czynności, ponieważ serwer napotkał błąd.',
          duration,
        });
    }
    return;
  }

  toast.error(err.message, { duration });
}
