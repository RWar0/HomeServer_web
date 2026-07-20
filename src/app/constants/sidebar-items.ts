import { SidebarSection } from '../core/types/sidebar.type';

export const SIDEBAR_ITEMS: SidebarSection[] = [
  {
    title: 'Podstawowe',
    items: [
      {
        title: 'Strona główna',
        url: '/dashboard',
        icon: 'lucideHouse',
      },
      {
        title: 'Kalendarz',
        url: '/calendar',
        icon: 'lucideCalendar',
      },
    ],
  },
  // {
  //   title: 'Administracja',
  //   icon: 'lucideLockKeyholeOpen',
  //   roles: ['Admin'],
  //   items: [
  //     {
  //       title: 'Użytkownicy',
  //       url: '/admin/users',
  //       icon: 'lucideUsers',
  //     },
  //   ],
  // },
];
