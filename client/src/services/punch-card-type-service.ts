import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export interface PunchCardType {
  id: string;
  name: string;
  total_credits: number;
  validity_months: number;
  max_sessions_per_week: number | null;
  is_active: boolean;
}

export interface CreatePunchCardTypeRequest {
  name: string;
  totalCredits: number;
  validityMonths: number;
  maxSessionsPerWeek?: number | null;
}

export type UpdatePunchCardTypeRequest =
  Partial<CreatePunchCardTypeRequest>;

export interface CreatePunchCardTypeResponse {
  message: string;
}

class PunchCardTypesServiceImpl {
  async getAll(): Promise<PunchCardType[]> {
    const response = await HttpService.get({
      url: api.uri('/punch-cards/types'),
    });

    return response.json() as Promise<PunchCardType[]>;
  }

  async getById(id: number | string): Promise<PunchCardType> {
    const response = await HttpService.get({
      url: api.uri('/punch-cards/types/:id', { id }),
    });

    return response.json() as Promise<PunchCardType>;
  }

  async create(
    data: CreatePunchCardTypeRequest
  ): Promise<CreatePunchCardTypeResponse> {
    const response = await HttpService.post({
      url: api.uri('/punch-cards/types'),
      body: data,
    });

    return response.json() as Promise<CreatePunchCardTypeResponse>;
  }

  async update(
    id: number | string,
    data: UpdatePunchCardTypeRequest
  ): Promise<void> {
    await HttpService.patch({
      url: api.uri('/punch-cards/types/:id', { id }),
      body: data,
    });
  }

  async deactivate(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/punch-cards/types/:id/deactivate', { id }),
      body: {},
    });
  }

  async activate(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/punch-cards/types/:id/activate', { id }),
      body: {},
    });
  }
}

export const PunchCardTypesService = new PunchCardTypesServiceImpl();
