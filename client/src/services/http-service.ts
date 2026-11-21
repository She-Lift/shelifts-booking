import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

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
  public request = wretch('/api', { credentials: 'same-origin' })
    .addon(QueryStringAddon)
    .catcherFallback((err) => {
      // We need to add custom http errors and throw them here. I'll add an error handler to the react createRoot, for now its jsut a console.error.
      console.error('Unhandled API error:', err);
      throw err;
    });

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
