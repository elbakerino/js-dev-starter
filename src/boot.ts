import { services } from './services.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import process from 'process'
import { envIsTrue } from '@orbstation/service/envIs'
import preloadEnv from './config/preload/preloadEnv.js'
import preloadPackage from './config/preload/preloadPackage.js'
import preloadBuildInfo from './config/preload/preloadBuildInfo.js'
import { serviceFeatures } from './config/serviceFeatures.js'
import { OrbExtensions, OrbService, OrbServiceExtension } from '@orbstation/service'
import { bindHalt } from './lib/bindHalt.js'
import { AssetManager, StyleSourcePath } from './services/AssetManager.js'
import path from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

if(!envIsTrue(process.env.NO_DOTENV)) {
    preloadEnv(__dirname)
}
const packageJson = preloadPackage(__dirname)
const buildInfo = preloadBuildInfo(__dirname, packageJson)

export default async(nodeType?: 'api' | 'cli') => {
    const onHalt = bindHalt(
        ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'],
        envIsTrue(process.env.SERVER_DEBUG_SHUTDOWN),
        // todo: nodemon native on windows has some strange not yet checked behaviour
        process.env.NODE_ENV !== 'production' || nodeType === 'cli',
    )
    serviceFeatures.parseFeatureConfig(process.env as { [k: string]: string })

    serviceFeatures.debugFeatures()

    const service = new OrbService(
        {
            name: process.env.SERVICE_NAME as string || process.env.LOG_SERVICE_NAME as string,
            environment: process.env.APP_ENV as string,
            version: packageJson?.version || buildInfo?.GIT_COMMIT?.split('/')?.[2]?.slice(0, 6) || 'v0.0.1',
            buildNo: (buildInfo?.GIT_COMMIT ? buildInfo?.GIT_COMMIT + '.' : '') + (buildInfo?.GIT_CI_RUN || process.env.K_REVISION),
        },
        serviceFeatures,
    )

    const extensions = new OrbExtensions<OrbServiceExtension<{ service: typeof service, ServiceService: typeof ServiceService }>>([])

    const ServiceService = await services({
        service: service,
        isProd: process.env.NODE_ENV !== 'development',
        packageJson: packageJson,
        buildInfo: buildInfo,
    })

    const assetManager = ServiceService.use(AssetManager)
    assetManager.addStyle(path.join(__dirname, 'assets', 'styles', 'main.scss') as StyleSourcePath)

    await extensions.boot({service, ServiceService})

    return {service, extensions, ServiceService, onHalt}
}
