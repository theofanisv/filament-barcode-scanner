import * as esbuild from 'esbuild'

const isDev = process.argv.includes('--dev')

async function compile(options) {
    const context = await esbuild.context(options)

    if (isDev) {
        console.log('👀 Watching for changes...')
        await context.watch()
    } else {
        await context.rebuild()
        await context.dispose()
        console.log('✅ Build complete')
    }
}

const defaultOptions = {
    define: {
        'process.env.NODE_ENV': isDev ? `'development'` : `'production'`,
    },
    bundle: true,
    mainFields: ['module', 'main'],
    platform: 'neutral',
    sourcemap: isDev ? 'inline' : false,
    sourcesContent: isDev,
    treeShaking: true,
    target: ['es2020'],
    minify: !isDev,
    plugins: [{
        name: 'watchPlugin',
        setup(build) {
            build.onStart(() => {
                console.log(`🔨 Building: ${build.initialOptions.outfile}`)
            })
            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    console.log(`❌ Build failed`, result.errors)
                } else {
                    console.log(`✅ Built: ${build.initialOptions.outfile}`)
                }
            })
        }
    }],
}

compile({
    ...defaultOptions,
    entryPoints: ['./resources/js/barcode-scanner.js'],
    outfile: './resources/dist/barcode-scanner.js',
})
