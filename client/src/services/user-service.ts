import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export type UserRole = 'admin' | 'customer';

/** GET /api/users and GET /api/users/:id return snake_case fields. */
export interface Customer {
  id: string;
  username: string;
  role: 'customer';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface CreateCustomerRequest {
  username: string;
  password: string;
}

export interface CreateCustomerResponse {
  message: string;
}

export interface ChangeMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetCustomerPasswordRequest {
  newPassword: string;
}

class UsersServiceImpl {
  async getAll(): Promise<Customer[]> {
    const response = await HttpService.get({
      url: api.uri('/users'),
    });

    return response.json() as Promise<Customer[]>;
  }

  async getById(id: number | string): Promise<Customer> {
    const response = await HttpService.get({
      url: api.uri('/users/:id', { id }),
    });

    return response.json() as Promise<Customer>;
  }

  async create(
    data: CreateCustomerRequest
  ): Promise<CreateCustomerResponse> {
    const response = await HttpService.post({
      url: api.uri('/users'),
      body: data,
    });

    return response.json() as Promise<CreateCustomerResponse>;
  }

  async changeMyPassword(
    data: ChangeMyPasswordRequest
  ): Promise<void> {
    await HttpService.patch({
      url: api.uri('/users/me/password'),
      body: data,
    });
  }

  async resetPassword(
    id: number | string,
    data: ResetCustomerPasswordRequest
  ): Promise<void> {
    await HttpService.patch({
      url: api.uri('/users/:id/password', { id }),
      body: data,
    });
  }

  async deactivate(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/users/:id/deactivate', { id }),
      body: {},
    });
  }

  async activate(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/users/:id/activate', { id }),
      body: {},
    });
  }
}

export const UsersService = new UsersServiceImpl();
