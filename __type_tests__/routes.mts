import { Manager } from '../src/index.js';
import type { TRouterConfig, TRouteKeys, TRouteParams } from '../src/index.js';

const repeated = new Manager({
  routes: {
    item: {
      url: '/item',
      children: { item: { url: '/item', children: { leaf: { url: '/leaf' } } } },
    },
  },
});
repeated.makeURL('item.item.leaf');
repeated.path('item.item.leaf');
// @ts-expect-error Unknown descendants must still be rejected.
repeated.makeURL('item.item.missing');

const empty = new Manager({ routes: { home: { url: '/', children: {} } } });
empty.makeURL('home');
empty.path('home');
// @ts-expect-error Empty children cannot invent a child route.
empty.makeURL('home.missing');

const routes = {
  user: {
    url: '/user/:id',
    params: { id: '' },
    children: {
      profile: { url: '/profile' },
      post: { url: '/post/:postId', params: { postId: '' } },
    },
  },
} satisfies TRouterConfig;
const manager = new Manager({ routes });
manager.getRoutes() satisfies typeof routes;
manager.getRoutes('user') satisfies typeof routes.user.children;
manager.getRoutes('user').profile.url satisfies string;
manager.getRoutes('user.profile') satisfies Record<string, never>;
// @ts-expect-error The subtree contains profile and post, not user.
manager.getRoutes('user').user.url;
// @ts-expect-error The root does not contain profile.
manager.getRoutes().profile;
// @ts-expect-error Unknown route keys are rejected by getRoutes.
manager.getRoutes('user.missing');

manager.makeURL('user', { id: '42' });
manager.makeURL('user.profile', { id: '42' }, { hasDomain: true });
manager.makeURL('user.post', { id: '42', postId: '7' });
// @ts-expect-error Required parameter objects cannot be omitted.
manager.makeURL('user');
// @ts-expect-error Required inherited parameter objects cannot be omitted.
manager.makeURL('user.profile');
// @ts-expect-error Undefined cannot replace required params.
manager.makeURL('user', undefined);
// @ts-expect-error Empty params lack id.
manager.makeURL('user', {});
// @ts-expect-error String params must reject numeric values.
manager.makeURL('user', { id: 1 });
// @ts-expect-error Descendant params do not replace the parent's required id.
manager.makeURL('user.post', { postId: '7' });

const optional = new Manager({
  routes: {
    docs: { url: '/docs/:page?', params: { page: undefined } },
    about: { url: '/about', params: {} },
  },
});
optional.makeURL('docs');
optional.makeURL('docs', {});
optional.makeURL('docs', { page: 'intro' });
optional.makeURL('docs', undefined, { hasDomain: true });
optional.makeURL('about');
optional.makeURL('about', {}, { hasDomain: true });

// Exercise both branches of MergeObjects and optional/enum parameter inference.
enum Status {
  First = 'first',
  Second = 'second',
}
const richRoutes = {
  user: {
    url: '/user/:id/:kind/:status/:name?/:next?/:optionalStatus?',
    params: {
      id: '',
      kind: '' as 'aaa' | 'dddd',
      status: Status,
      name: undefined,
      next: undefined as 'aaa' | 'dddd' | undefined,
      optionalStatus: undefined as Status | undefined,
    },
  },
};
const rich = new Manager({ routes: richRoutes });
const params: TRouteParams<typeof richRoutes, 'user'> = {
  id: '1',
  kind: 'aaa',
  status: Status.First,
};
rich.makeURL('user', params);
rich.makeURL('user', { ...params, name: 'name', next: 'dddd', optionalStatus: Status.Second });
// @ts-expect-error Required union and enum params cannot be omitted.
rich.makeURL('user', { id: '1' });
// @ts-expect-error Invalid union values are rejected.
rich.makeURL('user', { ...params, kind: 'invalid' });

// Recursive configurations terminate without comparing segment names.
type RecursiveRoutes = {
  item: { url: string; children: RecursiveRoutes };
};
const recursiveKey: TRouteKeys<RecursiveRoutes> = 'item.item.item';
void recursiveKey;

const deepestKey: TRouteKeys<RecursiveRoutes> =
  'item.item.item.item.item.item.item.item.item.item.item.item.item.item.item.item';
// @ts-expect-error The documented depth limit is 16 segments.
const tooDeepKey: TRouteKeys<RecursiveRoutes> =
  'item.item.item.item.item.item.item.item.item.item.item.item.item.item.item.item.item';
void [deepestKey, tooDeepKey];
