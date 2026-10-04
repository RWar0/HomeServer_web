import { Injectable } from '@angular/core';
import {
  CreateEditVehicleDto,
  VehicleBaseDataDto,
  VehicleForEditDto,
  VehicleListItemDto,
} from '../../models/vehicle.model';
import { BaseService } from '../common/base.service';
import { MessageResponse } from '../../models/message-response.model';
import { Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';
import { SelectOption } from '../../models/select.model';
import { VehicleFuelingOfVehicleListItemDto } from '../../models/vehicle-fueling.model';
import { DateFilterDto } from '../../models/common-filters.model';
import {
  VehicleServiceForVehicleFilterDto,
  VehicleServiceForVehicleListItemDto,
} from '../../models/vehicle-service.model';

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

  getBaseData(vehicleId: string): Observable<VehicleBaseDataDto> {
    return this.apiService.get<VehicleBaseDataDto>(`vehicles/${vehicleId}/base-data`);
  }

  getForEdit(id: string): Observable<VehicleForEditDto> {
    return this.apiService.get<VehicleForEditDto>(`vehicles/${id}/for-edit`);
  }

  getForSelect(): Observable<SelectOption[]> {
    return this.apiService.get<SelectOption[]>(`vehicles/for-select`);
  }

  getFuelings(
    vehicleId: string,
    pagination: PageRequest,
    filters: DateFilterDto,
  ): Observable<PageResponse<VehicleFuelingOfVehicleListItemDto>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters.toDate) {
      params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    return this.apiService.get<PageResponse<VehicleFuelingOfVehicleListItemDto>>(
      `vehicles/${vehicleId}/fuelings`,
      { params },
    );
  }

  getServices(
    vehicleId: string,
    pagination: PageRequest,
    filters?: VehicleServiceForVehicleFilterDto,
  ): Observable<PageResponse<VehicleServiceForVehicleListItemDto>> {
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

    return this.apiService.get<PageResponse<VehicleServiceForVehicleListItemDto>>(
      `vehicles/${vehicleId}/services`,
      {
        params,
      },
    );
  }

  update(id: string, vehicleData: CreateEditVehicleDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`vehicles/${id}`, vehicleData);
  }

  delete(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`vehicles/${id}`);
  }
}
