import { Role } from '../types/role.type';

export interface CurrentUser {
  name: string;
  email: string;
  role: Role;
}
