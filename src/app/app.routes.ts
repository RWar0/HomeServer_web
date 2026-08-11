import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout/app-layout';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { CalendarPage } from './pages/calendar-page/calendar-page';
import { AquariumListPage } from './pages/aquariums/aquarium-list-page/aquarium-list-page';
import { AquariumDetailsPage } from './pages/aquariums/aquarium-details-page/aquarium-details-page';
import { AquariumDetailsLayout } from './layouts/aquarium-details-layout/aquarium-details-layout';
import { AquariumPhotosPage } from './pages/aquariums/aquarium-photos-page/aquarium-photos-page';
import { PhotoPreview } from './pages/photos/photo-preview/photo-preview';
import { AquariumWaterChangesPage } from './pages/aquariums/aquarium-water-changes-page/aquarium-water-changes-page';
import { WaterChangesPage } from './pages/water-changes/water-changes-page/water-changes-page';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'calendar',
        component: CalendarPage,
      },
      {
        path: 'aquariums',
        children: [
          {
            path: '',
            component: AquariumListPage,
          },
          {
            path: 'water-changes',
            component: WaterChangesPage,
          },
        ],
      },
      {
        path: 'aquariums/:aquariumId',
        component: AquariumDetailsLayout,
        children: [
          {
            path: '',
            component: AquariumDetailsPage,
          },
          {
            path: 'photos',
            component: AquariumPhotosPage,
          },
          {
            path: 'water-changes',
            component: AquariumWaterChangesPage,
          },
        ],
      },
      {
        path: 'photo/:photoId',
        component: PhotoPreview,
      },
    ],
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [guestGuard],
  },
];
