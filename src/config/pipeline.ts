import express from 'express'
import { ServiceContainer } from 'service-service'
import { OrbService, OrbServiceFeatures } from '@orbstation/service'
import { AuthMiddleware } from '../middleware/AuthMiddleware.js'
import { AppConfig } from './AppConfig.js'
import { AppAuth } from '@bemit/auth-perms/AppAuth'
import { IdManager } from '@bemit/cloud-id/IdManager'

export type AppPipelineSetup = {
    app: express.Express
    ServiceService: ServiceContainer<AppConfig>
    service: OrbService<OrbServiceFeatures<{}>>
}

export default (
    {app, ServiceService}: AppPipelineSetup,
) => {
    app.use(express.json({limit: '0.5mb'}))
    app.use(express.urlencoded({extended: true}))

    app.use(AuthMiddleware(
        ServiceService.use(AppAuth).authCanDo,
        ServiceService.use(IdManager),
    ))
}
