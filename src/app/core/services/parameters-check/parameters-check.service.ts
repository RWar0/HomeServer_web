import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateEditParametersCheckDto,
  ParametersCheckListFiltersDto,
  ParametersCheckListItem,
} from '../../models/parameters-check.model';
import { BaseService } from '../common/base.service';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { HttpParams } from '@angular/common/http';
import { CreateEditWaterChangeDto } from '../../models/water-changes.model';
import { MessageResponse } from '../../models/message-response.model';

@Injectable({
  providedIn: 'root',
})
export class ParametersCheckService extends BaseService {
  create(parameterCheckData: CreateEditParametersCheckDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`parameter-checks`, parameterCheckData);
  }

  getAll(
    pagination: PageRequest,
    filters?: ParametersCheckListFiltersDto,
  ): Observable<PageResponse<ParametersCheckListItem>> {
    let params: HttpParams = new HttpParams()
      .set('page', pagination.page)
      .set('pageSize', pagination.pageSize);

    if (filters?.aquariumId) {
      params = params.set('aquariumId', filters.aquariumId);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortDirection', pagination.sortDirection);
    }

    return this.apiService.get<PageResponse<ParametersCheckListItem>>('parameter-checks/list', {
      params,
    });
  }

  getForEdit(parameterCheckId: string): Observable<CreateEditParametersCheckDto> {
    return this.apiService.get<CreateEditParametersCheckDto>(
      `parameter-checks/${parameterCheckId}/for-edit`,
    );
  }

  update(
    parameterCheckId: string,
    parameterCheckData: CreateEditParametersCheckDto,
  ): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(
      `parameter-checks/${parameterCheckId}`,
      parameterCheckData,
    );
  }

  delete(parameterCheckId: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`parameter-checks/${parameterCheckId}`);
  }
}
