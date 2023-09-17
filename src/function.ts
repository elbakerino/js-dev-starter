import express from 'express'
import { DELETE, GET, POST, PUT, PATCH } from '@orbstation/route/RouteDef'
import boot from './boot.js'
import { handlerErrorWrapper } from './lib/routing.js'
import { ErrorHandlerMiddleware } from '@orbstation/route/ErrorHandlerMiddleware'
import { OpenApiApp } from '@orbstation/oas/OpenApiApp'
import { routes } from './routes.js'
import { AssetManager } from './services/AssetManager.js'
import path from 'node:path'

export const appStarter = () =>
    boot('api')
        .then((setup) => {
            const app = express()
            app.disable('x-powered-by')
            return {app, ...setup}
        })
        .then((setup) =>
            import ( './config/pipeline.js')
                .then((pipeline) => {
                    pipeline.default(setup)
                    return setup
                }),
        )
        .then((setup) => {
            const {extensions, ServiceService} = setup
            const oas = ServiceService.use(OpenApiApp)

            oas.addRoutes(...routes)

            extensions.list().forEach((extension) => {
                if(extension.routes) {
                    oas.addRoutes(
                        ...(typeof extension.routes === 'function' ?
                            extension.routes() :
                            extension.routes),
                    )
                }
            })

            return {oas, ...setup}
        })
        .then((setup) => {
            const {app, oas, ServiceService} = setup

            const assetManager = ServiceService.use(AssetManager)
            app.use(
                `/assets`,
                express.static(assetManager.scriptsClientFolder, {maxAge: -1}),
            )
            const staticFiles: { from: string, to?: string }[] = [
                {from: path.join(ServiceService.config('assetsDir'), 'fonts'), to: '/fonts'},
                {from: path.join(ServiceService.config('assetsDir'), 'media'), to: '/media'},
                {from: path.join(ServiceService.config('assetsDir'), 'public'), to: '/'},
            ]
            staticFiles.forEach(staticFile => {
                app.use(
                    (staticFile.to ? (staticFile.to.startsWith('/') ? '' : '/') + staticFile.to : ''),
                    express.static(
                        staticFile.from,
                        {maxAge: -1},
                    ),
                )
            })

            oas.getRoutes().forEach(({id, method, path, pathServer, handler, spec}) => {
                const routePath = pathServer ? pathServer : oas.pathToExpress(path, spec?.parameters)
                const handle = handlerErrorWrapper(id, handler)
                method === GET && app.get(routePath, handle)
                method === PUT && app.put(routePath, handle)
                method === POST && app.post(routePath, handle)
                method === PATCH && app.patch(routePath, handle)
                method === DELETE && app.delete(routePath, handle)
            })
            return setup
        })
        .then((setup) => {
            const {app} = setup
            // todo: find a better way to ensure that this is added after all routes
            app.use(ErrorHandlerMiddleware)
            return setup
        })
