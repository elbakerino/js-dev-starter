import type { StorybookConfig } from '@storybook/react-webpack5'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { join, dirname } from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
    stories: [
        '../src/**/*.mdx',
        '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
        '../packages/*/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ],
    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@storybook/addon-onboarding'),
        getAbsolutePath('@storybook/addon-interactions'),
    ],
    framework: {
        name: getAbsolutePath('@storybook/react-webpack5'),
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    staticDirs: [
        {from: '../src/assets/fonts', to: '/fonts'},
        {from: '../src/assets/media', to: '/media'},
        {from: '../src/assets/public', to: '/public'},
    ],
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.s[ac]ss$/i,
            use: [
                // Creates `style` nodes from JS strings
                'style-loader',
                // Translates CSS into CommonJS
                'css-loader',
                // Compiles Sass to CSS
                'sass-loader',
            ],
        })
        return config
    },
    webpackFinal: async(config) => {
        const tsRule = {
            test: /\.(tsx?|jsx?)$/,
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
            },
        }

        if(config.resolve) {
            config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx']
            config.resolve.extensionAlias = {
                '.js': ['.ts', '.js', '.tsx', '.jsx'],
            }
            config.resolve.plugins = [
                ...(config.resolve.plugins || []),
                new TsconfigPathsPlugin({
                    extensions: config.resolve.extensions,
                }),
            ]
        }

        return {
            ...config,
            module: {
                ...config.module,
                rules: [...(config.module?.rules || []), tsRule],
            },
        }
    },
    typescript: {
        skipBabel: true,
        check: false,
    },
    core: {
        disableTelemetry: true,
    },
}
export default config
