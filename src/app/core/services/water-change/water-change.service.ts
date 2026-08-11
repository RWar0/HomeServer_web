import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { MessageResponse } from '../../models/message-response.model';
import { CreateEditWaterChangeDto } from '../../models/water-changes.model';

@Injectable({
  providedIn: 'root',
})
export class WaterChangeService extends BaseService {
  createWaterChange(
    aquariumId: string,
    waterChangeData: CreateEditWaterChangeDto,
  ): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(
      `water-changes/for-aquarium/${aquariumId}`,
      waterChangeData,
    );
  }

  getWaterChangeForEdit(waterChangeId: string): Observable<CreateEditWaterChangeDto> {
    return this.apiService.get<CreateEditWaterChangeDto>(`water-changes/${waterChangeId}/for-edit`);
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
