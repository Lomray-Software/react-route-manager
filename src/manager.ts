import { generatePath } from 'react-router';
import type {
  TRouterConfig,
  IRouterServiceParams,
  TRouteKeys,
  TRouteParams,
  IRouteUrlOptions,
  TChildrenAt,
  TURLArgs,
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
   * Url prefix (e.g. language code)
   */
  protected prefix?: string;

  /**
   * @constructor
   */
  constructor({ routes, domain, prefix }: IRouterServiceParams<TRoutesConfig>) {
    this.domain = domain;
    this.routes = routes;
    this.prefix = prefix;
  }

  /**
   * Set url prefix
   */
  public setPrefix(prefix?: string): void {
    this.prefix = prefix;
  }

  /**
   * Get route full url
   */
  protected getRouteUrl(
    key: string,
    { isFullPath = false, hasLeadingSlash = true }: IRouteUrlOptions = {},
  ): string {
    const { urls } = key.split('.').reduce<{ routes?: TRouterConfig; urls: string[] }>(
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

    // Collapse separators at fragment boundaries while preserving the final slash.
    const url = (!isFullPath ? urls.slice(-1) : urls).join('/').replace(/\/{2,}/g, '/');

    if (!hasLeadingSlash && url.startsWith('/')) {
      return url.substring(1);
    } else if (hasLeadingSlash && !url.startsWith('/')) {
      return `/${url}`;
    }

    return url;
  }

  /**
   * Return routes
   */
  public getRoutes(): TRoutesConfig;
  public getRoutes<TKey extends TRouteKeys<TRoutesConfig>>(
    route: TKey,
  ): TChildrenAt<TRoutesConfig, TKey>;
  public getRoutes(route?: string): TRouterConfig {
    return route
      ? route.split('.').reduce<TRouterConfig>((res, key) => res[key]?.children ?? {}, this.routes)
      : this.routes;
  }

  /**
   * Generate route url with params
   */
  public makeURL: <TKey extends TRouteKeys<TRoutesConfig>>(
    route: TKey,
    ...args: TURLArgs<TRouteParams<TRoutesConfig, TKey>>
  ) => string = (route, ...[params, { hasDomain = false } = {}]) => {
    const path = this.getRouteUrl(route as string, { isFullPath: true });

    return this.formatURL(generatePath(path, params), hasDomain);
  };

  /**
   * Apply the configured prefix and domain to a generated URL.
   */
  private formatURL(url: string, hasDomain = false): string {
    if (this.prefix) {
      url = `/${this.prefix}${url === '/' ? '' : url}`;
    }

    return hasDomain && this.domain ? `${this.domain}${url}` : url;
  }

  /**
   * Get URL path for router
   */
  public path: <TKey extends TRouteKeys<TRoutesConfig>>(
    route: TKey,
    options?: IRouteUrlOptions,
  ) => string = (route, { isFullPath = false, hasLeadingSlash = false } = {}) =>
    this.getRouteUrl(route as string, { isFullPath, hasLeadingSlash });

  /**
   * Get static app URLs (without params)
   */
  public getAllStaticURLs<TKey extends TRouteKeys<TRoutesConfig>>(route?: TKey): string[] {
    const result: string[] = [];
    const routes: TRouterConfig = route === undefined ? this.getRoutes() : this.getRoutes(route);

    Object.entries(routes).forEach(([key, value]) => {
      const routeKey = [route, key].filter(Boolean).join('.') as TRouteKeys<TRoutesConfig>;
      const fullPath = this.getRouteUrl(routeKey as string, { isFullPath: true });
      const hasParams = fullPath
        .split('/')
        .some((segment) => segment.startsWith(':') || segment === '*');

      if (value.url && !hasParams) {
        result.push(this.formatURL(generatePath(fullPath)));
      }

      if (value.children) {
        result.push(...this.getAllStaticURLs(routeKey));
      }
    });

    return result;
  }
}

export default Manager;
