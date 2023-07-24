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
   * @constructor
   */
  constructor({ routes, domain }: IRouterServiceParams<TRoutesConfig>) {
    this.domain = domain;
    this.routes = routes;
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
   * Return routes
   */
  public getRoutes<TKey extends TRouteKeys<TRoutesConfig>>(route?: TKey): TRoutesConfig {
    let { routes } = this;

    if (route) {
      routes = (route as string)
        .split('.')
        .reduce((res, key) => res?.[key]?.children ?? {}, routes) as TRoutesConfig;
    }

    return routes;
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

  /**
   * Get static app URLs (without params)
   */
  public getAllStaticURLs<TKey extends TRouteKeys<TRoutesConfig>>(route?: TKey): string[] {
    const result: string[] = [];
    const routes = this.getRoutes(route);

    Object.entries(routes).forEach(([key, value]) => {
      const routeKey = [route, key].filter(Boolean).join('.') as TRouteKeys<TRoutesConfig>;

      if (value.url && !value.params) {
        result.push(this.makeURL(routeKey));
      }

      if (value.children) {
        result.push(...this.getAllStaticURLs(routeKey));
      }
    });

    return result;
  }
}

export default Manager;
