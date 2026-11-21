import { buildPath, type UriBuilder } from '@src/utils/uri-builder';

export type AppRoutes = '/auth';

export const api = {
  uri: ((route: string, params?: Record<string, string | number>) =>
    buildPath('', route, params)) as UriBuilder<AppRoutes>,
} as const;
