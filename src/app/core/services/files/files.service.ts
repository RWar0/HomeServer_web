import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilesService extends BaseService {
  getImageById(id: string): Observable<Blob> {
    return this.apiService.get(`files/images/${id}`, {
      responseType: 'blob',
    });
  }
}
