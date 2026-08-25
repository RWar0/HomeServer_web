import { Injectable } from '@angular/core';
import {
  CreateEditVehicleDto,
  VehicleForEditDto,
  VehicleListItemDto,
} from '../../models/vehicle.model';
import { BaseService } from '../common/base.service';
import { MessageResponse } from '../../models/message-response.model';
import { Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';
import { SelectOption } from '../../models/select.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService extends BaseService {
  create(vehicleData: CreateEditVehicleDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`vehicles`, vehicleData);
  }

  getAll(pagination: PageRequest): Observable<PageResponse<VehicleListItemDto>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    return this.apiService.get<PageResponse<VehicleListItemDto>>(`vehicles/list`, { params });
  }

  getForEdit(id: string): Observable<VehicleForEditDto> {
    return this.apiService.get<VehicleForEditDto>(`vehicles/${id}/for-edit`);
  }

  getForSelect(): Observable<SelectOption[]> {
    return this.apiService.get<SelectOption[]>(`vehicles/for-select`);
  }

  update(id: string, vehicleData: CreateEditVehicleDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`vehicles/${id}`, vehicleData);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`vehicles/${id}`);
  }
}
