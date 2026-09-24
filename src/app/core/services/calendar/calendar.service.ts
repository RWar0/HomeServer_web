import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { forkJoin, map, Observable } from 'rxjs';
import { CalendarEvent, CreateEditCalendarEvent } from '../../models/calendar-event.model';
import { MessageResponse } from '../../models/message-response.model';
import { DateFilterDto } from '../../models/common-filters.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CalendarService extends BaseService {
  createEvent(event: CreateEditCalendarEvent): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('custom-events', event);
  }

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

  getCustomEventForEdit(id: string): Observable<CreateEditCalendarEvent> {
    return this.apiService.get<CreateEditCalendarEvent>(`custom-events/${id}`);
  }

  getCustomEventById(id: string): Observable<CalendarEvent> {
    return this.apiService.get<CalendarEvent>(`custom-events/${id}`);
  }

  updateEvent(id: string, event: CreateEditCalendarEvent): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`custom-events/${id}`, event);
  }

  markAsDone(id: string): Observable<MessageResponse> {
    return this.apiService.patch<MessageResponse>(`custom-events/${id}/mark-done`);
  }

  deleteEvent(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`custom-events/${id}`);
  }
}
