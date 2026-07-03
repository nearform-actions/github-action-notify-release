// ncc's ESM output externalizes Node builtins as bare `require("...")` calls,
// which are not defined in ES module scope. ncc already imports `createRequire`
// (aliased __WEBPACK_EXTERNAL_createRequire); define a module-scoped `require`
// from it so those externals resolve at runtime.
import { readFileSync, writeFileSync } from 'node:fs'

const DIST = new URL('../dist/index.js', import.meta.url)
const ANCHOR =
  'import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";'
const INJECT =
  'const require = __WEBPACK_EXTERNAL_createRequire(import.meta.url);'

const source = readFileSync(DIST, 'utf8')

if (source.includes(INJECT)) {
  console.log('patch-dist-require: already patched')
  process.exit(0)
}

if (!source.includes(ANCHOR)) {
  console.error(
    'patch-dist-require: expected createRequire import not found in dist/index.js. ' +
      'The ncc output format may have changed; update this script.'
  )
  process.exit(1)
}

writeFileSync(DIST, source.replace(ANCHOR, `${ANCHOR}\n${INJECT}`))
console.log('patch-dist-require: injected createRequire-based require')
