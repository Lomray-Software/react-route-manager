import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'route-manager-package-'));
const env = { ...process.env };
delete env.NO_COLOR;
const run = (command, args, cwd = scratch) => {
  console.log(`$ ${command} ${args.join(' ')}`);
  return execFileSync(command, args, { cwd, env, encoding: 'utf8', timeout: 120_000 });
};

// Pack the release directory, exactly as semantic-release does.
const pack = JSON.parse(
  run(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', scratch],
    join(root, 'lib'),
  ),
)[0];
const files = new Set(pack.files.map(({ path }) => path));

// Preserve public entries and package documents; internal chunk names may change.
for (const file of [
  'index.js',
  'index.d.ts',
  'manager.js',
  'package.json',
  'README.md',
  'LICENSE',
]) {
  assert.ok(files.has(file), `Missing public package file: ${file}`);
}
assert.ok(files.has('interfaces.d.ts'), 'TypeScript must emit interfaces.d.ts naturally.');
console.log('PASS package layout: public entries present; internal chunk names may change');
console.log('PASS natural declaration output: interfaces.d.ts');
writeFileSync(join(scratch, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
console.log(
  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-save',
    join(scratch, pack.filename),
    'typescript@6.0.3',
    'react@19.2.8',
    'react-dom@19.2.8',
    'react-router@8.3.1',
    '@types/react@19.2.18',
    '@types/react-dom@19.2.7',
  ]),
);
const manifest = JSON.parse(
  readFileSync(join(scratch, 'node_modules/@lomray/react-route-manager/package.json'), 'utf8'),
);
assert.deepEqual(
  [manifest.main, manifest.types, manifest.type, manifest.peerDependencies],
  ['index.js', 'index.d.ts', 'module', { 'react-router': '>=6.12.1' }],
);
console.log('PASS unchanged entry points and peer range');
const declarations = readFileSync(
  join(scratch, 'node_modules/@lomray/react-route-manager/manager.d.ts'),
  'utf8',
);
for (const property of ['makeURL', 'path']) {
  assert.match(declarations, new RegExp(`${property}: <TKey extends TRouteKeys<TRoutesConfig>>`));
}
assert.ok(declarations.length < 5000, 'Manager declarations must retain their aliases.');
console.log(
  `PASS compact declarations: ${declarations.length} bytes; makeURL/path retain TRouteKeys`,
);
writeFileSync(
  join(scratch, 'public-entry.mts'),
  readFileSync(join(root, '__type_tests__/public-entry.fixture')),
);
writeFileSync(
  join(scratch, 'routes.mts'),
  readFileSync(join(root, '__type_tests__/routes.mts'), 'utf8').replaceAll(
    '../src/index.js',
    '@lomray/react-route-manager',
  ),
);

const timings = [];
for (const [resolution, module] of [
  ['bundler', 'esnext'],
  ['node16', 'node16'],
]) {
  const args = [
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    'false',
    '--target',
    'es2022',
    '--module',
    module,
    '--moduleResolution',
    resolution,
    'public-entry.mts',
    'routes.mts',
  ];
  console.log(`$ node ${args.join(' ')}`);
  const start = performance.now();
  const result = spawnSync(process.execPath, args, {
    cwd: scratch,
    env,
    encoding: 'utf8',
    timeout: 30_000,
  });
  const seconds = ((performance.now() - start) / 1000).toFixed(2);
  console.log(result.stdout, result.stderr);
  assert.equal(result.status, 0, result.error?.message ?? 'Full declaration check failed.');
  timings.push({ resolution, skipLibCheck: false, exit: result.status, seconds });
  console.log(`PASS ${resolution}: skipLibCheck=false; exit 0; ${seconds} s`);
}
writeFileSync(join(scratch, 'timings.json'), JSON.stringify(timings, null, 2));
console.log(`Package fixtures and timings: ${scratch}`);
