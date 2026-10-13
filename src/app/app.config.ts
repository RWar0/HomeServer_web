import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { LOCALE_ID } from '@angular/core';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { AuthService } from './core/services/auth/auth.service';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { provideBrnCalendarI18n } from '@spartan-ng/brain/calendar';

registerLocaleData(localePl);

const polishMonthNames = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
];

const polishMonthShortNames: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] = [
  'sty',
  'lut',
  'mar',
  'kwi',
  'maj',
  'cze',
  'lip',
  'sie',
  'wrz',
  'paź',
  'lis',
  'gru',
];

const polishWeekdays = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];
const polishWeekdayLabels = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
];

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'pl-PL',
    },
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
    provideSpartanHlm(),
    provideBrnCalendarI18n({
      firstDayOfWeek: () => 1,
      formatWeekdayName: (index) => polishWeekdays[index],
      labelWeekday: (index) => polishWeekdayLabels[index],
      months: () => polishMonthShortNames,
      formatMonth: (month) => polishMonthNames[month] ?? '',
      formatHeader: (month, year) =>
        `${polishMonthNames[month]?.charAt(0).toUpperCase()}${polishMonthNames[month]?.slice(1)} ${year}`,
      labelPrevious: () => 'Poprzedni miesiąc',
      labelNext: () => 'Następny miesiąc',
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initializeAuth();
    }),
  ],
};
