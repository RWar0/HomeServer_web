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
      {
        title: 'Akwaria',
        url: '/aquariums',
        icon: 'lucideFish',
        subItems: [
          {
            title: 'Lista',
            url: '',
            icon: 'lucideList',
          },
          {
            title: 'Podmiany wody',
            url: 'water-changes',
            icon: 'tablerBucket',
          },
          {
            title: 'Parametry wody',
            url: 'parameter-checks',
            icon: 'lucideTestTube2',
          },
        ],
      },
      {
        title: 'Samochody',
        url: '/vehicles',
        icon: 'tablerCar',
        subItems: [
          {
            title: 'Lista',
            url: '',
            icon: 'lucideList',
          },
          {
            title: 'Historia tankowania',
            url: 'fuelings',
            icon: 'lucideFuel',
          },
          // {
          //   title: 'Serwis pojazdów',
          //   url: 'parameter-checks',
          //   icon: 'lucideTestTube2',
          // },
        ],
      },
    ],
  },
  {
    title: 'Administracja',
    icon: 'lucideLockKeyholeOpen',
    roles: ['Admin'],
    items: [
      {
        title: 'Użytkownicy',
        url: '/admin/users',
        icon: 'lucideUsers',
      },
    ],
  },
];
