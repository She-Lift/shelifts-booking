import { api } from '@src/services/api-routes';
import { HttpService } from '@src/services/http-service';

export type WorkoutStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Workout {
  id: string;
  schedule_id: string | null;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
  booked_slots: number;
  available_slots: number;
}

export interface CreateWorkoutRequest {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

export type UpdateWorkoutRequest = Partial<CreateWorkoutRequest>;

export interface CreateWorkoutResponse {
  message: string;
  workoutId: string;
}

class WorkoutsServiceImpl {
  async getAll(): Promise<Workout[]> {
    const response = await HttpService.get({
      url: api.uri('/workouts'),
    });

    return response.json() as Promise<Workout[]>;
  }

  async getById(id: number | string): Promise<Workout> {
    const response = await HttpService.get({
      url: api.uri('/workouts/:id', { id }),
    });

    return response.json() as Promise<Workout>;
  }

  async create(data: CreateWorkoutRequest): Promise<CreateWorkoutResponse> {
    const response = await HttpService.post({
      url: api.uri('/workouts'),
      body: data,
    });

    return response.json() as Promise<CreateWorkoutResponse>;
  }

  async update(id: number | string, data: UpdateWorkoutRequest): Promise<void> {
    await HttpService.patch({
      url: api.uri('/workouts/:id', { id }),
      body: data,
    });
  }

  async cancel(id: number | string): Promise<void> {
    await HttpService.patch({
      url: api.uri('/workouts/:id/cancel', { id }),
      body: {},
    });
  }
}

export const WorkoutsService = new WorkoutsServiceImpl();
