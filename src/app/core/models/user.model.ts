import { RolesEnum } from '../enums/roles.enum';
import { Role } from '../types/role.type';

export interface CurrentUser {
  name: string;
  email: string;
  role: Role;
}

export interface UserListItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: RolesEnum;
}

export interface UserForEdit {
  id: string;
  name: string;
  username: string;
  email: string;
  role: RolesEnum;
}

export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RolesEnum;
}

export interface EditUserDto {
  name: string;
  username: string;
  email: string;
  role: RolesEnum;
}

export interface EditUserPasswordDto {
  password: string;
  confirmPassword: string;
}
