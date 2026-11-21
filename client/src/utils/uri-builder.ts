type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractRouteParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
    ? Param
    : never;

export type RouteParams<T extends string> = {
  [K in ExtractRouteParams<T>]: string | number;
};

export interface UriBuilder<TAllowedRoutes extends string> {
  <TRoute extends TAllowedRoutes>(route: ExtractRouteParams<TRoute> extends never ? TRoute : never): string;

  <TRoute extends TAllowedRoutes>(
    route: ExtractRouteParams<TRoute> extends never ? never : TRoute,
    params: RouteParams<TRoute>,
  ): string;
}

export function buildPath(prefix: string, uri: string, params?: Record<string, string | number>) {
  let result = `${prefix}${uri}`;
  Object.entries(params || {}).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}
