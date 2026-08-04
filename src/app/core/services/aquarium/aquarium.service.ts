import { Injectable } from '@angular/core';
import {
  AquariumDetailsDto,
  AquariumListItem,
  CreateEditAquariumDto,
} from '../../models/aquarium.model';
import { Observable } from 'rxjs';
import { BaseService } from '../common/base.service';
import { MessageResponse } from '../../models/message-response.model';

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

  getAquariumDetails(id: string): Observable<AquariumDetailsDto> {
    return this.apiService.get<AquariumDetailsDto>(`aquariums/${id}/details`);
  }

  getAquariumForEdit(id: string): Observable<CreateEditAquariumDto> {
    return this.apiService.get<CreateEditAquariumDto>(`aquariums/for-edit/${id}`);
  }

  uploadPhoto(aquariumId: string, file: File): Observable<MessageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<MessageResponse>(`aquariums/${aquariumId}/upload-photo`, formData);
  }

  updateAquarium(id: string, aquarium: CreateEditAquariumDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`aquariums/update/${id}`, aquarium);
  }

  deleteAquarium(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`aquariums/${id}`);
  }
}
