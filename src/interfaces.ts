interface IRouterServiceParams<TRoutesConfig extends TRouterConfig> {
  routes: TRoutesConfig;
  domain?: string;
  prefix?: string;
}

type TRouterConfig = {
  [key: string]: {
    url: string;
    params?: Record<string, any>;
    children?: TRouterConfig;
  };
};

interface IRouterUrlOptions {
  hasDomain?: boolean;
}

/** Route keys include up to 16 segments, regardless of repeated names. */
type TRouteKeys<
  TConfig extends TRouterConfig,
  TDepth extends unknown[] = [],
> = TDepth['length'] extends 16
  ? never
  : {
      [K in keyof TConfig & string]:
        | K
        | (TConfig[K] extends { children: infer TChildren extends TRouterConfig }
            ? `${K}.${TRouteKeys<TChildren, [...TDepth, unknown]>}`
            : never);
    }[keyof TConfig & string];

type TRouteAt<TConfig, TKey extends string> = TKey extends `${infer THead}.${infer TTail}`
  ? THead extends keyof TConfig
    ? TConfig[THead] extends { children: infer TChildren }
      ? TRouteAt<TChildren, TTail>
      : never
    : never
  : TKey extends keyof TConfig
    ? TConfig[TKey]
    : never;

type TChildrenAt<TConfig, TKey extends string> =
  TRouteAt<TConfig, TKey> extends {
    children: infer TChildren extends TRouterConfig;
  }
    ? TChildren
    : Record<string, never>;

// eslint-disable-next-line @typescript-eslint/ban-types
type TURLArgs<TParams> = {} extends TParams
  ? [params?: TParams, options?: IRouterUrlOptions]
  : [params: TParams, options?: IRouterUrlOptions];

type OptionalFieldsOnly<T> = {
  [K in keyof T as T[K] extends infer TUndef
    ? TUndef extends undefined
      ? K
      : never
    : never]: T[K];
};

type IsEnum<T> = T extends object ? T[keyof T] : T;
type IsEmptyObject<TObj> = keyof TObj extends [never] ? true : false;

// eslint-disable-next-line @typescript-eslint/ban-types
type TNonEmptyParams<TParams, TDefault = {}> = TParams extends infer TO
  ? IsEmptyObject<TO> extends true
    ? TDefault
    : TO
  : TDefault;

type TRouteParamsType<TObj extends Record<string, any>> = TNonEmptyParams<{
  [field in keyof Omit<TObj, keyof OptionalFieldsOnly<TObj>>]: IsEnum<TObj[field]>;
}> &
  TNonEmptyParams<{
    [field in keyof OptionalFieldsOnly<TObj>]?: TObj[field] extends undefined
      ? string
      : IsEnum<TObj[field]>;
  }>;

type MergeObjects<T, TU> = {
  [K in keyof T | keyof TU]: K extends keyof T ? T[K] : K extends keyof TU ? TU[K] : never;
};

type TRouteParamsValues<
  TConfig extends TRouterConfig,
  TKey extends string,
> = TKey extends `${infer TPrefix}.${infer TPostfix}`
  ? TPrefix extends keyof TConfig
    ? TConfig[TPrefix] extends { children: infer TChildren extends TRouterConfig }
      ? MergeObjects<TRouteParamsValues<TChildren, TPostfix>, TConfig[TPrefix]['params']>
      : never
    : never
  : TKey extends keyof TConfig
    ? MergeObjects<TConfig[TKey]['params'], object>
    : never;

type TRouteParams<
  TConfig extends TRouterConfig,
  TKey extends TRouteKeys<TConfig>,
> = TRouteParamsType<TRouteParamsValues<TConfig, TKey>>;

interface IRouteUrlOptions {
  isFullPath?: boolean;
  hasLeadingSlash?: boolean;
}

export type {
  IRouterServiceParams,
  IRouterUrlOptions,
  TRouterConfig,
  TRouteKeys,
  TRouteParams,
  IRouteUrlOptions,
  TChildrenAt,
  TURLArgs,
};
