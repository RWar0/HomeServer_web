import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { CalculateCO2Request, CalculateCO2Response } from '../../models/calculators.model';

@Injectable({
  providedIn: 'root',
})
export class CalculatorsService extends BaseService {
  calculateCO2(req: CalculateCO2Request): Observable<CalculateCO2Response> {
    return this.apiService.post<CalculateCO2Response>('calculators/co2', req);
  }
}
