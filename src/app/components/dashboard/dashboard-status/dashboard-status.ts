import { Component, computed, input } from '@angular/core';
import { DashboardStatusData, DashboardStatusTypeEnum } from '../../../core/models/dashboard.model';
import { NgIcon } from '@ng-icons/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'dashboard-status',
  imports: [NgIcon, HlmSpinner],
  templateUrl: './dashboard-status.html',
  styleUrl: './dashboard-status.css',
})
export class DashboardStatus {
  // Inputs
  public readonly statusData = input.required<DashboardStatusData | null>();
  public readonly isLoading = input.required<boolean>();

  // Computed
  protected readonly homeStatus = computed<DashboardStatusTypeEnum>(() => this.getHomeStatus());

  // Methods
  protected getStatusTitle(): string {
    switch (this.homeStatus()) {
      case DashboardStatusTypeEnum.error:
        return 'Błąd pobierania danych!';

      case DashboardStatusTypeEnum.overdueTasks:
        return 'Trzeba trochę nadrobić!';

      case DashboardStatusTypeEnum.currentTasks:
        return 'Dziś jest co robić!';

      case DashboardStatusTypeEnum.doneCurrentTasks:
        return 'Wszystko pod kontrolą!';

      case DashboardStatusTypeEnum.freeDay:
        return 'Dzień wolny!';

      default:
        return 'Brak danych o stanie!';
    }
  }

  protected getStatusColor(): string {
    switch (this.homeStatus()) {
      case DashboardStatusTypeEnum.overdueTasks:
        return 'text-red-500';

      case DashboardStatusTypeEnum.currentTasks:
        return 'text-yellow-500';

      case DashboardStatusTypeEnum.doneCurrentTasks:
      case DashboardStatusTypeEnum.freeDay:
        return 'text-emerald-500';

      default:
        return 'text-gray-500';
    }
  }

  protected getTodayTasksDescription(): string {
    if (!this.statusData()) {
      return 'Bład pobierania danych!';
    }

    if (this.statusData()!.todayEventsCount === 0) {
      return 'Dzień wolny od nowych obowiązków!';
    }

    if (this.statusData()!.todayCompletedEventsCount === 0) {
      return `Jest ${this.statusData()!.todayEventsCount} zadań do wykonania dzisiaj.`;
    }

    return `Wykonano: ${this.statusData()!.todayCompletedEventsCount} z ${this.statusData()!.todayEventsCount} zadań.`;
  }

  protected getOverdueTasksDescription(): string {
    if (!this.statusData()) {
      return 'Bład pobierania danych!';
    }

    switch (this.statusData()!.overdueEventsCount) {
      case 1:
        return 'Jest 1 zaległe zadanie.';

      case 2:
      case 3:
      case 4:
        return `Jest ${this.statusData()!.overdueEventsCount} zaległe zadania.`;

      default:
        return `Jest ${this.statusData()!.overdueEventsCount} zaległych zadań.`;
    }
  }

  private getHomeStatus(): DashboardStatusTypeEnum {
    if (!this.statusData()) {
      return DashboardStatusTypeEnum.error;
    }

    if (this.statusData()!.overdueEventsCount > 0) {
      return DashboardStatusTypeEnum.overdueTasks;
    }

    if (
      this.statusData()!.todayEventsCount > 0 &&
      this.statusData()!.todayCompletedEventsCount < this.statusData()!.todayEventsCount
    ) {
      return DashboardStatusTypeEnum.currentTasks;
    }

    if (
      this.statusData()!.todayEventsCount > 0 &&
      this.statusData()!.todayCompletedEventsCount === this.statusData()!.todayEventsCount
    ) {
      return DashboardStatusTypeEnum.doneCurrentTasks;
    }

    return DashboardStatusTypeEnum.freeDay;
  }
}
