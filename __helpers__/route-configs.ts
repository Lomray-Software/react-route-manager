// Frozen before the audit fixes; copied from vite-template prod's route-manager.ts.
export const templateRoutes = {
  home: {
    url: '/',
  },
  details: {
    url: '/details',
    children: {
      user: {
        url: '/user/:id',
        params: { id: '' },
      },
    },
  },
  errorBoundary: {
    url: '/error-boundary',
  },
  nestedSuspense: {
    url: '/nested-suspense',
  },
  redirect: {
    url: '/redirect-demo',
  },
  onlyClientPage: {
    url: '/only-client-page',
  },
  notLazy: {
    url: '/not-lazy',
  },
};

// Frozen configuration from the README Usage example.
export const readmeRoutes = {
  home: {
    url: '/',
  },
  details: {
    url: '/details',
    children: {
      user: {
        url: '/user/:id',
        params: { id: '' }, // id required param
      },
    },
  },
  about: {
    url: '/about',
  },
};

// The original Route params example repeats `id` six times. JavaScript keeps
// its final undefined value; the pattern itself contains no parameters.
export const readmeParamsRoutes = {
  user: { url: '/user', params: { id: undefined as 'first' | 'second' | undefined } },
};
