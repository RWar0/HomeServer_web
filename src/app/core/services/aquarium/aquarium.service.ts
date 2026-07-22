import { Injectable } from '@angular/core';
import { AquariumListItem, CreateAquariumDto } from '../../models/aquarium.model';
import { Observable } from 'rxjs';
import { BaseService } from '../common/base.service';
import { MessageResponse } from '../../models/message-response.model';

@Injectable({
  providedIn: 'root',
})
export class AquariumService extends BaseService {
  createAquarium(aquarium: CreateAquariumDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('aquariums/create', aquarium);
  }

  getAquariums(): Observable<AquariumListItem[]> {
    return this.apiService.get<AquariumListItem[]>('aquariums/list');
  }
}
