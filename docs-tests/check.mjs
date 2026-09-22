import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import Ajv from 'ajv';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('context7.json', root), 'utf8'));
const schemaResponse = await fetch('https://context7.com/schema/context7.json');
assert.equal(schemaResponse.status, 200);
const schema = await schemaResponse.json();
const ajv = new Ajv({ strict: false, formats: { uri: true } });
const validate = ajv.compile(schema);
assert.ok(validate(config), JSON.stringify(validate.errors));
assert.equal(config.branch, 'prod');
assert.ok(config.excludeFolders.includes('docs-tests'));
async function runExample(output) {
  const original = console.log;
  const calls = [];
  console.log = (...args) => calls.push(args);
  try { await import(output.href); } finally { console.log = original; }
  assert.deepEqual(calls, [[':id'], ['/users/alice']]);
}

const require = createRequire(import.meta.url);
const { build } = await import('esbuild');
const dir = new URL('.generated/', import.meta.url);
await mkdir(dir, { recursive: true });
try {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const matches = [...readme.matchAll(/<!-- docs-test:example -->\s*```(?:typescript|tsx)\n([\s\S]*?)```/g)];
  assert.equal(matches.length, 1, 'Expected exactly one marked README example');
  const input = new URL('example.tsx', dir);
  await writeFile(input, matches[0][1]);
  const tsc = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tsc, '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'bundler', '--jsx', 'react-jsx', '--esModuleInterop', fileURLToPath(input)], { stdio: 'inherit' });
  const output = new URL('example.mjs', dir);
  await build({ entryPoints: [fileURLToPath(input)], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
  await runExample(output);
  console.log('PASS: Context7 schema, README semantic typecheck and released-package smoke');
} finally {
  await rm(dir, { recursive: true, force: true });
}
