import { type User } from '@src/services/auth-service';

export const ROLE_ROUTES: Record<User['role'], string> = {
  admin: '/admin',
  customer: '/customer',
};
