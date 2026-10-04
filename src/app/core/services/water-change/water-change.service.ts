import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { MessageResponse } from '../../models/message-response.model';
import {
  CreateEditWaterChangeDto,
  CreateEditWaterChangeOfAquariumDto,
  WaterChangeInfoItem,
  WaterChangeListFiltersDto,
  WaterChangeListItem,
} from '../../models/water-changes.model';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WaterChangeService extends BaseService {
  createWaterChange(waterChangeData: CreateEditWaterChangeDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`water-changes`, waterChangeData);
  }

  createWaterChangeForAquarium(
    aquariumId: string,
    waterChangeData: CreateEditWaterChangeOfAquariumDto,
  ): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(
      `water-changes/for-aquarium/${aquariumId}`,
      waterChangeData,
    );
  }

  getAll(
    pagination: PageRequest,
    filters?: WaterChangeListFiltersDto,
  ): Observable<PageResponse<WaterChangeListItem>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    if (filters?.aquariumId) {
      params = params.set('aquariumId', filters.aquariumId);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    return this.apiService.get<PageResponse<WaterChangeListItem>>('water-changes/list', {
      params,
    });
  }

  getById(waterChangeId: string): Observable<WaterChangeInfoItem> {
    return this.apiService.get<WaterChangeInfoItem>(`water-changes/${waterChangeId}`);
  }
  getWaterChangeForEdit(waterChangeId: string): Observable<CreateEditWaterChangeDto> {
    return this.apiService.get<CreateEditWaterChangeDto>(`water-changes/${waterChangeId}/for-edit`);
  }

  getWaterChangeOfAquariumForEdit(
    waterChangeId: string,
  ): Observable<CreateEditWaterChangeOfAquariumDto> {
    return this.apiService.get<CreateEditWaterChangeOfAquariumDto>(
      `water-changes/${waterChangeId}/for-aquarium-edit`,
    );
  }

  updateWaterChangeForAquarium(
    waterChangeId: string,
    waterChangeData: CreateEditWaterChangeOfAquariumDto,
  ): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(
      `water-changes/for-aquarium/${waterChangeId}`,
      waterChangeData,
    );
  }

  updateWaterChange(
    waterChangeId: string,
    waterChangeData: CreateEditWaterChangeDto,
  ): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`water-changes/${waterChangeId}`, waterChangeData);
  }

  deleteWaterChange(waterChangeId: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`water-changes/${waterChangeId}`);
  }
}
