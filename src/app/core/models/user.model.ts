import { Role } from './role.model';

export interface CurrentUser {
  name: string;
  email: string;
  role: Role;
}
