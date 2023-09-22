import path from 'node:path'
import { fileURLToPath } from 'node:url'
import TerserPlugin from 'terser-webpack-plugin'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import webpack from 'webpack'
import { packages } from './packages.js'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
    path: path.join(__dirname, '.env'),
})

const isProd = process.env.NODE_ENV === 'production'
const minimize = isProd

const safeEnvVars = ['NODE_ENV']
const baseDir = __dirname
const publicPath = '/assets/'
const src = path.join(baseDir, 'src', 'app')
const build = path.join(baseDir, 'build', 'client-assets')

const config: webpack.Configuration = {
    entry: {
        main: path.join(src, 'client.tsx'),
        tools: path.join(src, 'scripts', 'tools.ts'),
    },
    output: {
        filename: '[name].[contenthash:12].js',
        path: build,
        chunkFilename: '[name].chunk.[contenthash:12].js',
        publicPath: publicPath,
        module: true,
        library: {
            type: 'module',
        },
    },
    experiments: {
        outputModule: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        extensionAlias: {
            '.js': ['.ts', '.js', '.tsx', '.jsx'],
        },
        // todo: find options to also use alias loading in NodeJS/babel, to optimize src/build folder and the package-json-exports
        // todo: check on how to get docker support running again, now with the build folder in same level as each packages src
        alias: packages.reduce((alias, pkg) => ({
            ...alias,
            [pkg.name]: path.join(baseDir, pkg.src),
        }), {}),
        modules: [
            'node_modules',
        ],
    },
    target: 'web',
    mode: isProd ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        compact: minimize,
                    },
                }],
            },
        ],
    },
    optimization: {
        minimize: minimize,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    module: true,
                    ecma: 2020,
                    compress: {
                        ecma: 2020,
                        comparisons: false,
                        inline: 2,
                    },
                    mangle: {
                        // safari10: true,
                    },
                    keep_classnames: false,
                    keep_fnames: false,
                    output: {
                        ecma: 2020,
                        comments: false,
                        ascii_only: true,
                    },
                },
            }),
        ],
        runtimeChunk: 'single',
        ...isProd ? {
            concatenateModules: true,
            providedExports: true,
            usedExports: true,
        } : {},
        splitChunks: {chunks: 'all'},
    },
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    plugins: [
        new WebpackManifestPlugin({
            fileName: 'asset-manifest.json',
            generate: (_seed, files, entries) => {
                const filesMap = files.reduce((filesMap, file) => ({
                    ...filesMap,
                    [file.path.split('/').slice(-1).join('')]: file,
                }), {})

                const entryFileMap = {}
                for(const entry in entries) {
                    const entryScripts = entries[entry]
                    entryFileMap[entry] = []
                    entryScripts.forEach(entryScript => {
                        if(!filesMap[entryScript].isInitial) return
                        entryFileMap[entry].push(filesMap[entryScript].path)
                    })
                }
                return entryFileMap
            },
            removeKeyHash: false,
            writeToFileEmit: true,
            useEntryKeys: false,
        }),
        new webpack.DefinePlugin({
            'process.env': (() => {
                const safeEnv = {}
                Object.keys(process.env)
                    .filter(k =>
                        safeEnvVars.includes(k) ||
                        k.indexOf('REACT_APP_') === 0 ||
                        k.indexOf('WEB_APP_') === 0,
                    )
                    .map(k =>
                        safeEnv[k] = JSON.stringify(process.env[k]),
                    )
                return safeEnv
            })(),
        }),

    ],
}

export default config
