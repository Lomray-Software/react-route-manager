import { generatePath } from 'react-router';
import type {
  TRouterConfig,
  IRouterServiceParams,
  IRouterUrlOptions,
  TRouteKeys,
  TRouteParams,
} from './interfaces';

/**
 * @example
 * {
 *  user: {
 *    url: '/user',
 *    params: {
 *      id: '', // required
 *      obj: '' as 'aaa' | 'dddd', // required union
 *      enumField: DD, // required enum
 *      name: undefined, // optional
 *      next: undefined as 'aaa' | 'dddd' | undefined, // optional union
 *      enumOptional: undefined as DD | undefined // optional enum
 *    },
 *    children: {} // nested
 *  }
 */

/**
 * Manage application routes
 */
class Manager<TRoutesConfig extends TRouterConfig> {
  /**
   * Application routes config
   */
  protected readonly routes: TRoutesConfig;

  /**
   * Application domain
   */
  protected readonly domain?: string;

  /**
   * Service params
   */
  protected readonly params: Omit<IRouterServiceParams<TRoutesConfig>, 'routes'>;

  /**
   * @constructor
   */
  constructor({ routes, domain, ...params }: IRouterServiceParams<TRoutesConfig>) {
    this.domain = domain;
    this.routes = routes;
    this.params = params;
  }

  /**
   * Get route full url
   */
  protected getRouteUrl(key: string, isFullPath = false): string {
    const { urls } = key.split('.').reduce(
      (res, routeKey) => {
        if (!res?.routes || !routeKey) {
          return res;
        }

        const { url, children } = res.routes[routeKey] ?? {};

        return {
          urls: [...res.urls, url],
          routes: children,
        };
      },
      { routes: this.routes, urls: [] },
    );

    if (!isFullPath) {
      urls.slice(-1);
    }

    return urls.join('');
  }

  /**
   * Generate route url with params
   */
  public makeURL = <TKey extends TRouteKeys<TRoutesConfig>>(
    route: TKey,
    params?: TRouteParams<TRoutesConfig, TKey>,
    { hasDomain = false }: IRouterUrlOptions = {},
  ): string => {
    const path = this.getRouteUrl(route as string, true);
    const url = generatePath(path, params);

    return hasDomain && this.domain ? `${this.domain}${url}` : url;
  };

  /**
   * Get URL path for router
   */
  public path = <TKey extends TRouteKeys<TRoutesConfig>>(route: TKey, isFullPath = false): string =>
    this.getRouteUrl(route as string, isFullPath);
}

export default Manager;
