import { Injectable } from '@angular/core';
import { BaseService } from '../common/base.service';
import { Observable } from 'rxjs';
import {
  CreateUserDto,
  CurrentUser,
  EditUserDto,
  EditUserPasswordDto,
  UserForEdit,
  UserListItem,
} from '../../models/user.model';
import { PageRequest, PageResponse } from '../../models/pagination.model';
import { MessageResponse } from '../../models/message-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  create(userData: CreateUserDto): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('users', userData);
  }

  getMyProfile(): Observable<CurrentUser> {
    return this.apiService.get<CurrentUser>('users/my-profile');
  }

  getAll(pagination: PageRequest): Observable<PageResponse<UserListItem>> {
    return this.apiService.get<PageResponse<UserListItem>>('users/list', {
      params: pagination,
    });
  }

  getById(userId: string): Observable<UserForEdit> {
    return this.apiService.get<UserForEdit>(`users/${userId}/for-edit`);
  }

  update(userId: string, userData: EditUserDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`users/${userId}`, userData);
  }

  updatePassword(userId: string, userData: EditUserPasswordDto): Observable<MessageResponse> {
    return this.apiService.put<MessageResponse>(`users/${userId}/password`, userData);
  }

  deleteUser(userId: string): Observable<MessageResponse> {
    return this.apiService.delete(`users/${userId}`);
  }
}
