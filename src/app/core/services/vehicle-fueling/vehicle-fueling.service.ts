import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import {
  CreateEditVehicleDto,
  VehicleFuelingFilterDto,
  VehicleFuelingForEditDto,
  VehicleFuelingListItemDto,
} from '../../models/vehicle-fueling.model';
import { MessageResponse } from '../../models/message-response.model';
import { Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VehicleFuelingService extends BaseService {
  create(fuelingData: CreateEditVehicleDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`vehicle-fuelings`, fuelingData);
  }

  getAll(
    pagination: PageRequest,
    filters?: VehicleFuelingFilterDto,
  ): Observable<PageResponse<VehicleFuelingListItemDto>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    if (filters?.vehicleId) {
      params = params.set('vehicleId', filters.vehicleId);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    return this.apiService.get<PageResponse<VehicleFuelingListItemDto>>(`vehicle-fuelings/list`, {
      params,
    });
  }

  getForEdit(id: string): Observable<VehicleFuelingForEditDto> {
    return this.apiService.get<VehicleFuelingForEditDto>(`vehicle-fuelings/${id}/for-edit`);
  }

  update(id: string, fuelingData: CreateEditVehicleDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`vehicle-fuelings/${id}`, fuelingData);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`vehicle-fuelings/${id}`);
  }
}
