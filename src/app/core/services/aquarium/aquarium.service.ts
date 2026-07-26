import { Injectable } from '@angular/core';
import { AquariumListItem, CreateEditAquariumDto } from '../../models/aquarium.model';
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

  getAquariumForEdit(id: string): Observable<CreateEditAquariumDto> {
    return this.apiService.get<CreateEditAquariumDto>(`aquariums/for-edit/${id}`);
  }

  updateAquarium(id: string, aquarium: CreateEditAquariumDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`aquariums/update/${id}`, aquarium);
  }

  deleteAquarium(id: string): Observable<MessageResponse> {
    return this.apiService.delete<MessageResponse>(`aquariums/${id}`);
  }
}
