# React route manager for [react-router](https://reactrouter.com/)

Define and manager application url's in one place.

![npm](https://img.shields.io/npm/v/@lomray/react-route-manager)
![GitHub](https://img.shields.io/github/license/Lomray-Software/react-route-manager)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=react-route-manager)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=react-route-manager)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=react-route-manager)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=react-route-manager)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=react-route-manager)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=react-route-manager&metric=coverage)](https://sonarcloud.io/summary/new_code?id=react-route-manager)

## Getting started

The package is distributed using [npm](https://www.npmjs.com/), the node package manager.

```
npm i --save @lomray/react-route-manager
```

## Usage

```typescript jsx
import { Manager } from '@lomray/react-route-manager';
import type { RouteObject } from 'react-router';

/**
 * Application URL manager
 */
const manager = new Manager({
  routes: {
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
  },
});


/**
 * Now we can use it for get routes path for react-router
 */
const routes: RouteObject[] = [
  {
    path: manager.path('home'),
    lazy: () => import('@pages/home'),
  },
  {
    path: manager.path('details'),
    children: [
      {
        index: true,
        lazy: () => import('@pages/details'),
      },
      {
        path: manager.path('details.user'),
        lazy: () => import('@pages/details/user'),
      },
    ],
  },
  {
    path: manager.path('about'),
    lazy: () => import('@pages/about'),
  },
];


/**
 * Also we can use it for generate url's
 */
const MyComponent = () => {
  return (
    <>
      <Link to{manager.makeURL('home')}>Home page</Link>
      <Link to{manager.makeURL('about')}>About page</Link>
      <Link to{manager.makeURL('details')}>Details page</Link>
      <Link to{manager.makeURL('details.user', { id: 1 })}>User page</Link>
    </>
  )
}
```

## Route params
```typescript
const manager = new Manager({
  routes: {
    user: {
      url: '/user',
      params: {
          // required
          id: '',
          // required union
          id: '' as 'aaa' | 'dddd',
          // required enum
          id: DD,
          // optional
          id: undefined,
          // optional union
          id: undefined as 'aaa' | 'dddd' | undefined,
          // optional enum
          id: undefined as DD | undefined
      }
    }
  }
});
```

Explore [demo app](https://github.com/Lomray-Software/vite-template) to more understand.

## Bugs and feature requests

Bug or a feature request, [please open a new issue](https://github.com/Lomray-Software/react-route-manager/issues/new).

## License
Made with 💚

Published under [MIT License](./LICENSE).
