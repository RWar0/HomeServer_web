import { Injectable } from '@angular/core';
import {
  AquariumDetailsDto,
  AquariumListItem,
  AquariumParameterCheckListItem,
  AquariumPhotoDto,
  CreateEditAquariumDto,
} from '../../models/aquarium.model';
import { Observable } from 'rxjs';
import { BaseService } from '../common/base.service';
import { MessageResponse } from '../../models/message-response.model';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { AquariumWaterChangeListItem } from '../../models/water-changes.model';
import { SelectOption } from '../../models/select.model';

@Injectable({
  providedIn: 'root',
})
export class AquariumService extends BaseService {
  createAquarium(aquarium: CreateEditAquariumDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('aquariums/create', aquarium);
  }

  getAquariums(): Observable<AquariumListItem[]> {
    return this.apiService.get<AquariumListItem[]>('aquariums/list');
  }

  getAquariumsForSelect(): Observable<SelectOption[]> {
    return this.apiService.get<AquariumListItem[]>('aquariums/for-select');
  }

  getAquariumDetails(id: string): Observable<AquariumDetailsDto> {
    return this.apiService.get<AquariumDetailsDto>(`aquariums/${id}/details`);
  }

  getAquariumPhotos(
    id: string,
    pagination: PageRequest,
  ): Observable<PageResponse<AquariumPhotoDto>> {
    return this.apiService.get<PageResponse<AquariumPhotoDto>>(`aquariums/${id}/photos`, {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
      },
    });
  }

  getAquariumWaterChanges(
    id: string,
    pagination: PageRequest,
  ): Observable<PageResponse<AquariumWaterChangeListItem>> {
    return this.apiService.get<PageResponse<AquariumWaterChangeListItem>>(
      `aquariums/${id}/water-changes`,
      {
        params: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: pagination.sortBy,
          sortDirection: pagination.sortDirection,
        },
      },
    );
  }

  getAquariumParameterChecks(
    id: string,
    pagination: PageRequest,
  ): Observable<PageResponse<AquariumParameterCheckListItem>> {
    return this.apiService.get<PageResponse<AquariumParameterCheckListItem>>(
      `aquariums/${id}/parameter-checks`,
      {
        params: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: pagination.sortBy,
          sortDirection: pagination.sortDirection,
        },
      },
    );
  }

  getAquariumForEdit(id: string): Observable<CreateEditAquariumDto> {
    return this.apiService.get<CreateEditAquariumDto>(`aquariums/${id}/for-edit`);
  }

  uploadPhoto(aquariumId: string, file: File): Observable<MessageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<MessageResponse>(`aquariums/${aquariumId}/upload-photo`, formData);
  }

  updateAquarium(id: string, aquarium: CreateEditAquariumDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`aquariums/${id}`, aquarium);
  }

  deleteAquarium(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`aquariums/${id}`);
  }

  deletePhoto(aquariumId: string, photoId: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`aquariums/${aquariumId}/photo/${photoId}`);
  }
}
