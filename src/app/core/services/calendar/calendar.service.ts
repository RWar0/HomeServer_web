import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { CalendarEvent, CreateEditCalendarEvent } from '../../models/calendar-event.model';
import { MessageResponse } from '../../models/message-response.model';
import { DateFilterDto } from '../../models/common-filters.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CalendarService extends BaseService {
  getAll(filters?: DateFilterDto): Observable<CalendarEvent[]> {
    let params: HttpParams = new HttpParams();
    if (filters) {
      if (filters.fromDate) {
        params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
      }
      if (filters.toDate) {
        params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
      }
    }

    return this.apiService.get<CalendarEvent[]>('calendar', { params });
  }
}
