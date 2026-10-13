import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import {
  CreateEditCalendarEvent,
  CustomEventItemDto,
  CustomEventListFilters,
} from '../../models/calendar-event.model';
import { MessageResponse } from '../../models/message-response.model';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({
  providedIn: 'root',
})
export class CustomEventService extends BaseService {
  create(event: CreateEditCalendarEvent): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('custom-events', event);
  }

  getAll(
    pagination: PageRequest,
    filters?: CustomEventListFilters,
  ): Observable<PageResponse<CustomEventItemDto>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    if (filters?.title) {
      params = params.set('title', filters.title);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.location) {
      params = params.set('location', filters.location);
    }

    if (filters?.description) {
      params = params.set('description', filters.description);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', new Date(filters.fromDate).toISOString().split('T')[0]);
    }

    if (filters?.toDate) {
      params = params.set('toDate', new Date(filters.toDate).toISOString().split('T')[0]);
    }

    if (filters?.isCompleted) {
      if (filters.isCompleted !== 'true' && filters.isCompleted !== 'false') {
        toast.error('Nieprawidłowa wartość filtra statusu wykonania!');
      } else {
        params = params.set('isCompleted', filters.isCompleted);
      }
    }

    if (filters?.fromCompletionDate) {
      params = params.set(
        'fromCompletionDate',
        new Date(filters.fromCompletionDate).toISOString().split('T')[0],
      );
    }

    if (filters?.toCompletionDate) {
      params = params.set(
        'toCompletionDate',
        new Date(filters.toCompletionDate).toISOString().split('T')[0],
      );
    }

    return this.apiService.get<PageResponse<CustomEventItemDto>>('custom-events/list', {
      params,
    });
  }

  getForEdit(id: string): Observable<CreateEditCalendarEvent> {
    return this.apiService.get<CreateEditCalendarEvent>(`custom-events/${id}`);
  }

  getById(id: string): Observable<CustomEventItemDto> {
    return this.apiService.get<CustomEventItemDto>(`custom-events/${id}`);
  }

  update(id: string, event: CreateEditCalendarEvent): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`custom-events/${id}`, event);
  }

  markAsDone(id: string): Observable<MessageResponse> {
    return this.apiService.patch<MessageResponse>(`custom-events/${id}/mark-done`);
  }

  markAsNotDone(id: string): Observable<MessageResponse> {
    return this.apiService.patch<MessageResponse>(`custom-events/${id}/mark-not-done`);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`custom-events/${id}`);
  }
}
