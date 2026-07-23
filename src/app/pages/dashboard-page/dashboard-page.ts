import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '../../core/services/error/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-page',
  imports: [],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly errorService = inject(ErrorService);
  private queryParamsSub?: Subscription;

  ngOnInit() {
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      this.errorService.displayForbiddenError(
        params['forbidden'],
        params['redirected_from'],
        this.route,
      );
    });
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
  }
}
