import { OpenApiRoute } from '@orbstation/oas/OpenApi'
import { GET } from '@orbstation/route/RouteDef'
import { loadableHandler } from '@orbstation/route/loadableHandler'

export const basePath = ''

export const routes: OpenApiRoute[] = [
    {
        id: 'home', method: GET, path: basePath + '/',
        handler: loadableHandler(() => import ('./handler/HomeHandler.js').then(module => module.default)),
        noSpec: true,
    },
    {
        id: 'stream-static', method: GET, path: basePath + '/stream-static',
        handler: loadableHandler(() => import ('./handler/StreamStaticHandler.js').then(module => module.default)),
        noSpec: true,
    },
    {
        id: 'stream', method: GET, path: basePath + '/stream',
        handler: loadableHandler(() => import ('./handler/StreamHandler.js').then(module => module.default)),
        noSpec: true,
    },
    {
        id: 'api.ping', method: GET, path: basePath + '/api/ping',
        handler: loadableHandler(() => import ('./handler/ApiPingHandler.js').then(module => module.default)),
        noSpec: true,
    },
    {
        id: 'api.demo-data', method: GET, path: basePath + '/api/demo-data',
        handler: loadableHandler(() => import ('./handler/ApiDemoDataHandler.js').then(module => module.default)),
        noSpec: true,
    },
    {
        id: 'locales.locale', method: 'get',
        path: basePath + '/locales/{locale}/{ns}',
        handler: loadableHandler(() => import ('./handler/LocaleHandler.js').then(module => module.default)),
        noSpec: true,
        spec: {
            parameters: [
                {
                    in: 'path',
                    required: true,
                    name: 'locale',
                    schema: {
                        type: 'string',
                    },
                },
                {
                    in: 'path',
                    required: true,
                    name: 'ns',
                    schema: {
                        type: 'string',
                    },
                },
            ],
        },
    },
]
