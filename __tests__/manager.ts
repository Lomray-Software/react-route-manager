/* eslint-disable sonarjs/no-duplicate-string */
import { expect } from 'chai';
import { describe, it } from 'vitest';
import { Manager } from '../src';

describe('Route manager', () => {
  const manager = new Manager({
    routes: {
      home: { url: '/' },
      aboutUs: { url: '/about-us' },
      details: {
        url: '/details',
        children: {
          example: {
            url: '/example',
          },
        },
      },
      user: {
        url: '/user/:id',
        params: { id: '' },
        children: {
          profile: { url: '/profile' },
          settings: { url: '/settings' },
        },
      },
    },
  });

  it('should make url with prefix', () => {
    manager.setPrefix('en');

    const url = manager.makeURL('home');

    manager.setPrefix(undefined); // cleanup

    expect(url).to.equal('/en');
  });

  it('should make url with domain', () => {
    const manager2 = new Manager({
      routes: { home: { url: '/home' } },
      domain: 'https://demo.test',
    });

    expect(manager2.makeURL('home', {}, { hasDomain: true })).to.equal('https://demo.test/home');
  });

  it('should get route URL', () => {
    const url = manager.getRouteUrl('user.profile');

    expect(url).to.equal('/profile');
  });

  it('should get routes', () => {
    const result = manager.getRoutes('user');

    expect(result).to.deep.equal({
      profile: { url: '/profile' },
      settings: { url: '/settings' },
    });
  });

  it('should make URL with params', () => {
    const url = manager.makeURL('user', { id: '123' });

    expect(url).to.equal('/user/123');
  });

  it('should generate path', () => {
    const path = manager.path('user.profile');

    expect(path).to.equal('profile');
  });

  it('should generate full path', () => {
    const path = manager.path('user.profile', { isFullPath: true });

    expect(path).to.equal('user/:id/profile');
  });

  it('should generate full path with leading slash', () => {
    const path = manager.path('user.profile', { isFullPath: true, hasLeadingSlash: true });

    expect(path).to.equal('/user/:id/profile');
  });

  it('should get all static URLs', () => {
    const result = manager.getAllStaticURLs();

    expect(result).to.deep.equal(['/', '/about-us', '/details', '/details/example']);
  });

  it('should get static URLs from provided route', () => {
    const result = manager.getAllStaticURLs('details');

    expect(result).to.deep.equal(['/details/example']);
  });
});
