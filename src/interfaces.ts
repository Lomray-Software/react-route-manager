interface IRouterServiceParams<TRoutesConfig extends TRouterConfig> {
  routes: TRoutesConfig;
  domain?: string;
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

// eslint-disable-next-line @typescript-eslint/ban-types
type TRouteKeysDeep<TE extends TRouterConfig, TP extends string, TExistKeys = {}> = TE[TP] extends {
  children: TRouterConfig;
}
  ? TExistKeys extends { [key in TP]: any } // avoid infinite recursion
    ? never
    : keyof {
        [PF in keyof TE[TP]['children'] as
          | (PF extends string
              ? // @ts-ignore
                `${TP}.${TRouteKeysDeep<
                  TE[TP]['children'],
                  PF,
                  { [key in TP | keyof TExistKeys]: any }
                >}`
              : never)
          | TP]: any;
      }
  : TP;

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

type TRouteParamsValues<
  TConfig extends TRouterConfig,
  TKey extends TRouteKeys<TConfig>,
> = TKey extends `${infer TPrefix}.${infer TPostfix}`
  ? TPostfix extends string
    ? TConfig[TPrefix]['children'] extends TRouterConfig
      ? // @ts-ignore
        TRouteParamsValues<TConfig[TPrefix]['children'], TPostfix>
      : never
    : never
  : TConfig[TKey]['params'] extends Record<string, any>
  ? TConfig[TKey]['params']
  : never;

type TRouteKeys<TConfig extends TRouterConfig> = keyof {
  [P in keyof TConfig as P extends string ? TRouteKeysDeep<TConfig, P> : never]: any;
};

type TRouteParams<
  TConfig extends TRouterConfig,
  TKey extends TRouteKeys<TConfig>,
> = TRouteParamsType<TRouteParamsValues<TConfig, TKey>>;

export type { IRouterServiceParams, IRouterUrlOptions, TRouterConfig, TRouteKeys, TRouteParams };
