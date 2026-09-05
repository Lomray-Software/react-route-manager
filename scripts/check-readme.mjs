import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const consumer = process.argv[2];
assert.ok(consumer, 'Provide the packed-package consumer directory (React Router 7+).');
const scratch = mkdtempSync(join(tmpdir(), 'route-manager-readme-'));
symlinkSync(join(consumer, 'node_modules'), join(scratch, 'node_modules'), 'dir');
const readme = readFileSync(
  join(consumer, 'node_modules/@lomray/react-route-manager/README.md'),
  'utf8',
);
assert.equal(
  readme,
  readFileSync(join(root, 'README.md'), 'utf8'),
  'The package must ship the current README.',
);
const examples = [...readme.matchAll(/```typescript(?: jsx)?\n([\s\S]*?)```/g)];
assert.equal(examples.length, 2, 'Compile both README examples verbatim.');
const files = examples.map(([, code], index) => {
  const file = join(scratch, `example-${index}.tsx`);
  writeFileSync(file, code);
  return file;
});
// These modules belong to the application, as documented above the example.
const page = join(scratch, 'page.ts');
writeFileSync(page, 'export const Component = () => null;\n');
const config = join(scratch, 'tsconfig.json');
writeFileSync(
  config,
  JSON.stringify(
    {
      compilerOptions: {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        lib: ['ES2022', 'DOM'],
        types: ['react'],
        typeRoots: [join(consumer, 'node_modules/@types')],
        paths: {
          '@lomray/react-route-manager': [
            join(consumer, 'node_modules/@lomray/react-route-manager/index.d.ts'),
          ],
          '@pages/*': [page],
        },
      },
      files,
    },
    null,
    2,
  ),
);
execFileSync(
  process.execPath,
  [join(consumer, 'node_modules/typescript/bin/tsc'), '--project', config],
  {
    encoding: 'utf8',
    timeout: 10_000,
    stdio: 'pipe',
  },
);
console.log('PASS both README examples compile verbatim (strict, skipLibCheck=false)');
