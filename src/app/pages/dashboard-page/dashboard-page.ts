import { Component, computed, inject, OnDestroy, OnInit, resource, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../core/services/error/error.service';
import { catchError, firstValueFrom, of, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowRight,
  lucideCalendar,
  lucideCalendarDays,
  lucideCheckCircle,
  lucideCheckSquare2,
  lucideChevronRight,
  lucideCircleAlert,
  lucideCircleX,
  lucideClock,
  lucideFish,
  lucideHistory,
  lucideHome,
  lucideHouse,
  lucideInfo,
  lucideLeaf,
  lucidePlus,
  lucideUser,
} from '@ng-icons/lucide';
import { DashboardAttentionList } from '../../components/dashboard/dashboard-attention-list/dashboard-attention-list';
import {
  DashboardAttentionListItem,
  DashboardRecentActivity,
  DashboardStatusData,
  DashboardSummaryData,
  DashboardUpcomingEvent,
} from '../../core/models/dashboard.model';
import { tablerCar } from '@ng-icons/tabler-icons';
import { DashboardUpcomingEvents } from '../../components/dashboard/dashboard-upcoming-events/dashboard-upcoming-events';
import { DashboardRecentActivities } from '../../components/dashboard/dashboard-recent-activities/dashboard-recent-activities';
import { DashboardStatus } from '../../components/dashboard/dashboard-status/dashboard-status';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { displayApiError } from '../../core/helpers/error-handler';
import { DashboardSummary } from '../../components/dashboard/dashboard-summary/dashboard-summary';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    DashboardAttentionList,
    DashboardUpcomingEvents,
    DashboardRecentActivities,
    DashboardStatus,
    DashboardSummary,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  providers: [
    provideIcons({
      lucideCalendar,
      lucideInfo,
      lucideClock,
      lucideCheckCircle,
      lucideChevronRight,
      lucideCheckSquare2,
      lucideAlertTriangle,
      lucideCircleAlert,
      lucideArrowRight,
      lucideFish,
      tablerCar,
      lucideHome,
      lucideUser,
      lucideCalendarDays,
      lucideHistory,
      lucideHouse,
      lucideLeaf,
      lucidePlus,
      lucideCircleX,
    }),
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  // Injects
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(DashboardService);
  private readonly errorService = inject(ErrorService);
  private readonly authService = inject(AuthService);

  // Signals
  protected readonly userName = signal<string>('');
  protected readonly today = signal<Date>(new Date());

  protected readonly summaryDataResource = resource({
    loader: () =>
      firstValueFrom(
        this.dashboardService.getSummary().pipe(
          catchError((err) => {
            displayApiError(err);
            return of(null);
          }),
        ),
      ),
  });

  protected get summaryData(): DashboardSummaryData | null {
    return this.summaryDataResource.value() ?? null;
  }

  protected readonly attentionListItemsResource = resource({
    loader: () =>
      firstValueFrom(
        this.dashboardService.getAttentionItems().pipe(
          catchError((err) => {
            displayApiError(err);
            return of(null);
          }),
        ),
      ),
  });

  protected get attentionListItems(): DashboardAttentionListItem[] | null {
    return this.attentionListItemsResource.value() ?? null;
  }

  protected readonly upcomingEventsResource = resource({
    loader: () =>
      firstValueFrom(
        this.dashboardService.getUpcomingEvents().pipe(
          catchError((err) => {
            displayApiError(err);
            return of(null);
          }),
        ),
      ),
  });

  protected get upcomingEvents(): DashboardUpcomingEvent[] | null {
    return this.upcomingEventsResource.value() ?? null;
  }

  protected readonly recentActivitiesResource = resource({
    loader: () =>
      firstValueFrom(
        this.dashboardService.getRecentActivities().pipe(
          catchError((err) => {
            displayApiError(err);
            return of(null);
          }),
        ),
      ),
  });

  protected get recentActivities(): DashboardRecentActivity[] | null {
    return this.recentActivitiesResource.value() ?? null;
  }
  protected readonly statusData = computed<DashboardStatusData | null>(() =>
    this.summaryData ? this.dashboardService.getStatusDataFromSummary(this.summaryData) : null,
  );

  // Fields
  private queryParamsSub?: Subscription;

  // Lifecycle hooks
  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      this.errorService.displayForbiddenError(
        params['forbidden'],
        params['redirected_from'],
        this.route,
      );

      this.userName.set(this.authService.user()?.name || 'Użytkownik');
    });
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
  }
}
