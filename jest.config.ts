import type { Config } from '@jest/types'

const packages: [pkg: string, pkgDir?: string][] = [
    ['@app/design-system', 'design-system'],
    ['@app/helpers', 'helpers'],
]

const base: Partial<Config.InitialOptions> = {
    transformIgnorePatterns: [
        // todo: check if packages are needed in the ignore patterns for app-integration tests
        'node_modules',
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.tsx$': 'ts-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        ...packages.reduce<{ [k: string]: string }>((moduleNameMapper, [pkg, pkgDir]) => ({
            ...moduleNameMapper,
            [`^${pkg}(.*)$`]: `<rootDir>/packages/${pkgDir || pkg}/src$1`,
        }), {}),
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
}

const config: Config.InitialOptions = {
    ...base,
    projects: [
        {
            displayName: 'test',
            ...base,
            moduleDirectories: ['node_modules'],
            testMatch: [
                '<rootDir>/src/**/*.(test|spec).(js|ts|tsx)',
                '<rootDir>/tests/**/*.(test|spec).(js|ts|tsx)',
            ],
        },
        ...packages.map(([pkg, pkgDir]) => ({
            displayName: 'test-' + pkg.replace(/[@\\/]/g, '-'),
            ...base,
            moduleDirectories: [
                'node_modules', '<rootDir>/packages/' + (pkgDir || pkg) + '/node_modules',
            ],
            testMatch: [
                '<rootDir>/packages/' + (pkgDir || pkg) + '/src/**/*.(test|spec).(js|ts|tsx)',
                '<rootDir>/packages/' + (pkgDir || pkg) + '/tests/**/*.(test|spec).(js|ts|tsx)',
            ],
        })),
    ],
    testPathIgnorePatterns: ['<rootDir>/build'],
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    coverageDirectory: '<rootDir>/coverage',
}

export default config
