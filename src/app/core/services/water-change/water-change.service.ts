import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { MessageResponse } from '../../models/message-response.model';
import {
  CreateEditWaterChangeDto,
  CreateEditWaterChangeOfAquariumDto,
  WaterChangeListItem,
} from '../../models/water-changes.model';
import { PageRequest, PageResponse } from '../../models/pagination.model';

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

  getAll(pagination: PageRequest): Observable<PageResponse<WaterChangeListItem>> {
    return this.apiService.get<PageResponse<WaterChangeListItem>>('water-changes/list', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection,
      },
    });
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
