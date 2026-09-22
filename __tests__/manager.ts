import { describe, expect, it } from 'vitest';
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

  it('should separate relative child paths', () => {
    const relative = new Manager({
      routes: { parent: { url: '/parent', children: { child: { url: 'child' } } } },
    });

    expect(relative.makeURL('parent.child')).to.equal('/parent/child');
    expect(relative.path('parent.child', { isFullPath: true })).to.equal('parent/child');
  });

  it('should collapse separators below the root', () => {
    const root = new Manager({
      routes: { home: { url: '/', children: { child: { url: '/child' } } } },
    });

    expect(root.makeURL('home.child')).to.equal('/child');
    expect(root.path('home.child', { isFullPath: true })).to.equal('child');
    expect(root.path('home.child', { isFullPath: true, hasLeadingSlash: true })).to.equal('/child');
  });

  it('should make url with domain', () => {
    const manager2 = new Manager({
      routes: { home: { url: '/home' } },
      domain: 'https://demo.test',
    });

    expect(manager2.makeURL('home', {}, { hasDomain: true })).to.equal('https://demo.test/home');
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

  it('should exclude descendants of a selected parameterized parent', () => {
    expect(manager.getAllStaticURLs('user')).to.deep.equal([]);
  });

  it('should enumerate static patterns regardless of params metadata', () => {
    const staticRoutes = new Manager({
      routes: {
        about: { url: '/about', params: {} },
        parent: {
          url: '/parent',
          params: { unused: '' },
          children: { child: { url: '/child' } },
        },
      },
    });

    expect(staticRoutes.getAllStaticURLs()).to.deep.equal(['/about', '/parent', '/parent/child']);
    expect(staticRoutes.getAllStaticURLs('parent')).to.deep.equal(['/parent/child']);
  });

  it('should exclude required, optional and splat patterns without metadata', () => {
    const dynamic = new Manager({
      routes: {
        required: { url: '/:id', children: { child: { url: '/child' } } },
        optional: { url: '/:id?', children: { child: { url: '/child' } } },
        splat: { url: '/*', children: { child: { url: '/child' } } },
      },
    });

    expect(dynamic.getAllStaticURLs()).to.deep.equal([]);
    expect(dynamic.getAllStaticURLs('required')).to.deep.equal([]);
    expect(dynamic.getAllStaticURLs('optional')).to.deep.equal([]);
    expect(dynamic.getAllStaticURLs('splat')).to.deep.equal([]);
  });
});
