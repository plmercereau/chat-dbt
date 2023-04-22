const pkg = require('./package.json')
const esbuild = require('esbuild')
var nodemon = require('nodemon')

const main = async () => {
    const ctx = await esbuild.context({
        entryPoints: ['./cli/index.ts'],
        platform: 'node',
        target: 'node14',
        format: 'esm',
        outfile: './dist/index.mjs',
        bundle: true,
        external: Object.keys(pkg.dependencies)
    })

    await ctx.watch()

    nodemon({
        script: 'dist/index.mjs',
        args: ['--env', '.env.local', ...process.argv.slice(2)],
        stdin: false
    })
    nodemon.on('restart', () => {
        // Write a new line when restarting
        console.log()
    })
}

main()
