import { Role } from './role';

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  department?: string | null;
  role: Role;
}
