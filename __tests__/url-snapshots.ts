import { describe, expect, it } from 'vitest';
import { templateRoutes, readmeRoutes, readmeParamsRoutes } from '../__helpers__/route-configs';
import { Manager } from '../src';
import type { TRouterConfig } from '../src';

const allKeys = (routes: TRouterConfig, parent = ''): string[] =>
  Object.entries(routes).flatMap(([key, value]) => {
    const route = parent ? `${parent}.${key}` : key;

    return [route, ...allKeys(value.children ?? {}, route)];
  });

// Evaluate every key, including the README's explicit calls (id 1 becomes "1").
const outputs = (routes: TRouterConfig) => {
  const manager = new Manager({ routes });

  return Object.fromEntries(
    allKeys(routes).map((key) => [
      key,
      {
        makeURL: manager.makeURL(key, { id: '1' }),
        path: manager.path(key),
        variants: [false, true].flatMap((isFullPath) =>
          [false, true].map((hasLeadingSlash) => ({
            isFullPath,
            hasLeadingSlash,
            path: manager.path(key, { isFullPath, hasLeadingSlash }),
          })),
        ),
      },
    ]),
  );
};

describe('URL compatibility snapshots captured before the audit fixes', () => {
  it.each([
    ['template (all eight keys)', templateRoutes],
    ['README usage (all four keys)', readmeRoutes],
    ['README route params', readmeParamsRoutes],
    [
      'existing trailing slashes',
      {
        parent: {
          url: '/parent',
          children: { child: { url: '/child/' }, index: { url: '/' } },
        },
        trailing: { url: '/trailing/' },
      },
    ],
  ] as const)('%s', (_name, routes) => {
    expect(outputs(routes)).toMatchSnapshot();
  });
});
