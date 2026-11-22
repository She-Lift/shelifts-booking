import { userContext } from '@src/context/router-context';
import { ROLE_ROUTES, ROUTES } from '@src/routes';
import { AuthService, type User } from '@src/services/auth-service';
import { HttpError, HttpStatus } from '@src/services/http-service';
import { redirect, type MiddlewareFunction } from 'react-router';

export const authMiddleware: MiddlewareFunction = async ({ context }) => {
  try {
    const user = await AuthService.getSession();
    context.set(userContext, user);
  } catch (error) {
    if (error instanceof HttpError && error.status === HttpStatus.Unauthorized) {
      context.set(userContext, null);
      return;
    }
    throw error;
  }
};

export const requireAuth: MiddlewareFunction = ({ context }) => {
  const user = context.get(userContext);

  if (!user) {
    throw redirect(ROUTES.login);
  }

  if (user.mustChangePassword) {
    // Not supported yet!
    //throw redirect(ROUTES.changePassword);
  }
};

export function requireRole(allowedRole: User['role']): MiddlewareFunction {
  return ({ context }) => {
    const user = context.get(userContext);

    if (!user || user.role !== allowedRole) {
      throw redirect(user ? ROLE_ROUTES[user.role] : ROUTES.login);
    }
  };
}
