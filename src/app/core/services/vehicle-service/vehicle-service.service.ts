import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import {
  CreateEditVehicleServiceDto,
  VehicleServiceFilterDto,
  VehicleServiceListItemDto,
} from '../../models/vehicle-service.model';
import {
  CreateEditVehicleServiceItemDto,
  VehicleServiceItemDto,
} from '../../models/vehicle-service-item.model';
import { MessageResponse } from '../../models/message-response.model';
import { Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VehicleServicesService extends BaseService {
  create(serviceData: CreateEditVehicleServiceDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`vehicle-services`, serviceData);
  }

  getAll(
    pagination: PageRequest,
    filters?: VehicleServiceFilterDto,
  ): Observable<PageResponse<VehicleServiceListItemDto>> {
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

    if (filters?.title) {
      params = params.set('title', filters.title);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    if (filters?.fromCost) {
      params = params.set('fromCost', filters.fromCost!);
    }

    if (filters?.toCost) {
      params = params.set('toCost', filters.toCost!);
    }

    return this.apiService.get<PageResponse<VehicleServiceListItemDto>>(`vehicle-services/list`, {
      params,
    });
  }

  getForEdit(id: string): Observable<CreateEditVehicleServiceDto> {
    return this.apiService.get<CreateEditVehicleServiceDto>(`vehicle-services/${id}/for-edit`);
  }

  update(id: string, serviceData: CreateEditVehicleServiceDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`vehicle-services/${id}`, serviceData);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`vehicle-services/${id}`);
  }

  // Items management
  getItems(serviceId: string): Observable<VehicleServiceItemDto[]> {
    return this.apiService.get<VehicleServiceItemDto[]>(`vehicle-services/${serviceId}/items`);
  }
}
