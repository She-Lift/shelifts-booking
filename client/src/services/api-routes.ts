import { buildPath, type UriBuilder } from '@src/utils/uri-builder';

export type AppRoutes =
  // Authentication
  | '/auth'

  // Users
  | '/users'
  | '/users/:id'
  | '/users/me/password'
  | '/users/:id/password'
  | '/users/:id/deactivate'
  | '/users/:id/activate'

  // Workouts
  | '/workouts'
  | '/workouts/:id'
  | '/workouts/:id/cancel'

  // Bookings
  | '/bookings'
  | '/bookings/me'
  | '/bookings/:id'
  | '/bookings/:id/cancel'

  // Assigned Punch Cards
  | '/punch-cards'
  | '/punch-cards/me'
  | '/punch-cards/:id'

  // Punch Card Types
  | '/punch-cards/types'
  | '/punch-cards/types/:id'
  | '/punch-cards/types/:id/activate'
  | '/punch-cards/types/:id/deactivate';

export const api = {
  uri: ((route: string, params?: Record<string, string | number>) =>
    buildPath('', route, params)) as UriBuilder<AppRoutes>,
} as const;
