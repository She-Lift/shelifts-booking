import { type User } from '@src/services/auth-service';

export const ROUTES = {
  home: '/',
  login: '/login',
  changePassword: '/change-password',
  admin: '/admin',
  customer: '/customer',
} as const;

export const ROLE_ROUTES: Record<User['role'], string> = {
  admin: ROUTES.admin,
  customer: ROUTES.customer,
};
