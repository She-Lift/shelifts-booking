import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export const ROLES: Record<User['role'], string> = {
  admin: '/admin',
  customer: '/customer',
};

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'customer';
  mustChangePassword: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthServiceImpl {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await HttpService.post({
      url: api.uri('/auth'),
      body: credentials,
    });
    const data: { user: User } = await response.json();
    return data.user;
  }

  async getSession(): Promise<User> {
    const response = await HttpService.get({
      url: api.uri('/auth'),
    });
    const data: { user: User } = await response.json();
    return data.user;
  }

  async logout(): Promise<void> {
    await HttpService.delete({
      url: api.uri('/auth'),
    });
  }
}

export const AuthService = new AuthServiceImpl();
