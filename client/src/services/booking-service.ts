import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export type BookingStatus =
  | 'booked'
  | 'cancelled_by_customer'
  | 'cancelled_by_admin'
  | 'completed';

export type WorkoutStatus =
  | 'scheduled'
  | 'cancelled'
  | 'completed';

export interface Booking {
  id: string;
  user_id: string;
  username: string;

  workout_id: string;
  workout_title: string;
  workout_starts_at: string;
  workout_ends_at: string;
  workout_status: WorkoutStatus;

  user_punch_card_id: string;
  punch_card_type_name: string;

  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
}

export interface CreateBookingRequest {
  workoutId: number;
  punchCardId: number;
}

export interface CreateBookingResponse {
  message: string;
  bookingId: string;
}

class BookingsServiceImpl {
  async getAll(): Promise<Booking[]> {
    const response = await HttpService.get({
      url: api.uri('/bookings'),
    });

    return response.json() as Promise<Booking[]>;
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await HttpService.get({
      url: api.uri('/bookings/me'),
    });

    return response.json() as Promise<Booking[]>;
  }

  async getById(id: number | string): Promise<Booking> {
    const response = await HttpService.get({
      url: api.uri('/bookings/:id', { id }),
    });

    return response.json() as Promise<Booking>;
  }

  async create(
    data: CreateBookingRequest
  ): Promise<CreateBookingResponse> {
    const response = await HttpService.post({
      url: api.uri('/bookings'),
      body: data,
    });

    return response.json() as Promise<CreateBookingResponse>;
  }

  async cancel(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/bookings/:id/cancel', { id }),
      body: {},
    });
  }
}

export const BookingsService = new BookingsServiceImpl();
