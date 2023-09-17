import process from 'process'
import path from 'path'
import { fileURLToPath } from 'url'
import { ServiceContainer } from 'service-service'
import { IdManager } from '@bemit/cloud-id/IdManager'
import { SchemaService } from '@bemit/schema/SchemaService'
import { CommandDispatcher } from '@orbstation/command/CommandDispatcher'
import { CommandResolverFolder } from '@orbstation/command/CommandResolverFolder'
import { AppConfig } from './config/AppConfig.js'
import { schemaFileResolver, SchemaRegistryFile } from '@bemit/schema/SchemaRegistryFile'
import { schemaRegistryResolver } from '@bemit/schema/SchemaRegistry'
import { AppAuth } from '@bemit/auth-perms/AppAuth'
import { OrbService, OrbServiceFeatures } from '@orbstation/service'
import { OpenApiApp } from '@orbstation/oas/OpenApiApp'
import { authCanDo } from './config/authGrants.js'
import { AssetManager } from './services/AssetManager.js'
import { Styler } from './services/Styler.js'
import { TemplateRegistry } from './services/TemplateRegistry.js'
import { TranslationService } from './services/TranslationService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const ServiceService = new ServiceContainer<AppConfig>()

export interface ServiceConfig {
    isProd?: boolean
    buildInfo: AppConfig['buildInfo']
    packageJson: { name?: string, version?: string, [k: string]: unknown }
    service: OrbService<OrbServiceFeatures<{}>>
}

export const services = async(serviceConfig: ServiceConfig) => {
    const {isProd, buildInfo} = serviceConfig

    ServiceService.configure('host', process.env.HOST || ('http://localhost:' + process.env.PORT))
    ServiceService.configure('buildInfo', buildInfo)
    ServiceService.configure('assetsDir', path.join(__dirname, 'assets'))
    const clientAssetsFolder = path.join(__dirname, 'client-assets')

    ServiceService.define(OpenApiApp, (): ConstructorParameters<typeof OpenApiApp> => [
        {
            title: 'Space-Page',
            description: 'Page builder preview system thing.',
            version: buildInfo?.GIT_COMMIT?.split('/')?.[2]?.slice(0, 6) || 'v0.0.1',
            license: {name: 'UNLICENSED'},
        },
        [],
        {
            securitySchemes: {},
            security: [],
            servers: [
                {
                    url: ServiceService.config('host'),
                    variables: {},
                },
            ],
        },
    ])

    ServiceService.define(IdManager, (): ConstructorParameters<typeof IdManager> => [{
        host: process.env.ID_HOST,
        validation: process.env.ID_KEY_URL ?
            {
                type: 'load-key',
                issuer: process.env.ID_ISSUER as string,
                audience: process.env.ID_AUDIENCE as string,
                keyUrl: process.env.ID_KEY_URL,
                algorithms: process.env.ID_ALGOS ? process.env.ID_ALGOS.split(',') as any[] : ['RS256'],
            } :
            {
                type: 'memory-key',
                issuer: process.env.ID_ISSUER as string,
                audience: process.env.ID_AUDIENCE as string,
                keyMem: process.env.ID_KEY as string,
                algorithms: process.env.ID_ALGOS ? process.env.ID_ALGOS.split(',') as any[] : ['HS256'],
            },
        cacheExpire: 60 * (isProd ? 60 * 6 : 15),
        cacheExpireMemory: 60 * 5,
    }])
    ServiceService.define<typeof AppAuth<typeof authCanDo>>(AppAuth, (): ConstructorParameters<typeof AppAuth<typeof authCanDo>> => [
        authCanDo,
    ])

    ServiceService.define(CommandDispatcher, (): ConstructorParameters<typeof CommandDispatcher> => [{
        resolver: [
            new CommandResolverFolder({folder: path.join(__dirname, 'commands')}),
        ],
    }])

    ServiceService.define(SchemaService, (): ConstructorParameters<typeof SchemaService> => [{
        resolver: [
            schemaRegistryResolver({
                errors: (id: string) => new SchemaRegistryFile(id, path.resolve(__dirname, 'data/errors'), '.json'),
            }),
            {resolve: schemaFileResolver('.json')},
        ],
    }])

    ServiceService.define(AssetManager, (): ConstructorParameters<typeof AssetManager> => [
        clientAssetsFolder,
        {
            // embed scripts smaller than 8KB directly in HTML
            embedScriptMaxBytes: 8192,
        },
    ])
    ServiceService.define(Styler, (): ConstructorParameters<typeof Styler> => [{
        resolveFolders: [
            path.join(__dirname, '../', 'node_modules'),
        ],
    }])
    ServiceService.define(TranslationService, (): ConstructorParameters<typeof TranslationService> => [[
        path.join(__dirname, 'locales'),
    ]])
    ServiceService.define(TemplateRegistry, (): ConstructorParameters<typeof TemplateRegistry> => [
        path.join(__dirname, 'templates'),
        {
            cache: isProd,
            layouts: [
                path.join(__dirname, 'templates', 'layouts'),
            ],
            partials: [
                path.join(__dirname, 'templates', 'views'),
            ],
        },
    ])

    return ServiceService
}
