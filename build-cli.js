const pkg = require('./package.json')

require('esbuild').build({
    entryPoints: ['./cli/index.ts'],
    platform: 'node',
    target: 'node14',
    format: 'esm',
    outfile: './dist/index.mjs',
    bundle: true,
    external: Object.keys(pkg.dependencies)
})
