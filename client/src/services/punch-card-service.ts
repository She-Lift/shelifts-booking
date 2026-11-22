import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export type PunchCardStatus = 'active' | 'revoked';

/** Assigned punch card from vw_user_punch_cards. */
export interface PunchCard {
  id: string;
  user_id: string;
  username: string;
  punch_card_type_id: string;
  punch_card_type_name: string;
  total_credits: number;
  remaining_credits: number;
  max_sessions_per_week: number | null;
  valid_from: string;
  valid_until: string;
  status: PunchCardStatus;
  created_at: string;
}

/** The current backend expects string IDs for this particular request. */
export interface AssignPunchCardRequest {
  userId: string;
  punchCardTypeId: string;
  validFrom: string;
}

export interface AssignPunchCardResponse {
  message: string;
  punchCardId: string;
}

class PunchCardsServiceImpl {
  async getAll(): Promise<PunchCard[]> {
    const response = await HttpService.get({
      url: api.uri('/punch-cards'),
    });

    return response.json() as Promise<PunchCard[]>;
  }

  async getMyPunchCards(): Promise<PunchCard[]> {
    const response = await HttpService.get({
      url: api.uri('/punch-cards/me'),
    });

    return response.json() as Promise<PunchCard[]>;
  }

  async getById(id: number | string): Promise<PunchCard> {
    const response = await HttpService.get({
      url: api.uri('/punch-cards/:id', { id }),
    });

    return response.json() as Promise<PunchCard>;
  }

  async assign(
    data: AssignPunchCardRequest
  ): Promise<AssignPunchCardResponse> {
    const response = await HttpService.post({
      url: api.uri('/punch-cards'),
      body: data,
    });

    return response.json() as Promise<AssignPunchCardResponse>;
  }
}

export const PunchCardsService = new PunchCardsServiceImpl();
