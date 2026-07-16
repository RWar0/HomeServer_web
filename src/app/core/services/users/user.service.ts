import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  getMyProfile(): Observable<CurrentUser> {
    return this.apiService.get<CurrentUser>('users/my-profile');
  }
}
