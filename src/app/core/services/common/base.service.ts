import { inject } from '@angular/core';
import { ApiService } from './api.service';

export abstract class BaseService {
  protected apiService = inject(ApiService);
}
