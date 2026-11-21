import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { dedupe } from 'wretch/middlewares';

export const HttpStatus = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  Locked: 423,
  InternalServerError: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  url: string;
  headers?: HeadersInit;
}

type PostRequestOptions = {
  body: object;
} & RequestOptions;

type PatchRequestOptions = {
  body: object;
} & RequestOptions;

type DeleteRequestOptions = {
  body?: object;
} & RequestOptions;

type AnyRequestOptions = RequestOptions | PostRequestOptions | PatchRequestOptions | DeleteRequestOptions;

class HttpServiceImpl {
  public request = wretch('/api', { credentials: 'same-origin' }).addon(QueryStringAddon).middlewares([dedupe()]);

  #buildRequest(options: AnyRequestOptions) {
    let req = this.request.url(options.url);

    if (options.headers !== undefined) {
      req = req.headers(options.headers);
    }

    if ('body' in options && options.body !== undefined) {
      req = req.json(options.body);
    }

    return req;
  }

  get(options: RequestOptions): Promise<Response> {
    return this.#buildRequest(options).get().res();
  }

  post(options: PostRequestOptions): Promise<Response> {
    return this.#buildRequest(options).post().res();
  }

  patch(options: PatchRequestOptions): Promise<Response> {
    return this.#buildRequest(options).patch().res();
  }

  delete(options: DeleteRequestOptions): Promise<Response> {
    return this.#buildRequest(options).delete().res();
  }
}

export { WretchError as HttpError } from 'wretch/resolver';
export const HttpService = new HttpServiceImpl();
