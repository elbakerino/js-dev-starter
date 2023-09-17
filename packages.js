export const packages = [
    {
        name: '@app/design-system',
        src: 'packages/design-system/src',
        out: 'packages/design-system/build',
        extensions: '.ts,.js,.tsx,.jsx',
        copyFiles: true,
    },
    {
        name: '@app/helpers',
        src: 'packages/helpers/src',
        out: 'packages/helpers/build',
        extensions: '.ts,.js,.tsx,.jsx',
        copyFiles: true,
    },
]
