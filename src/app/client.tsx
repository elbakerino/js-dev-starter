import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ContentDataProvider } from './lib/ContentDataProvider.js'
import { PageHome } from './pages/PageHome.js'
import { routes } from './routes.js'

const element = document.querySelector('#root') as Element
if(element) {
    import ('./App.js')
        .then(m => m.App)
        .then(App => {
            const config = document.querySelector('script[type="application/json"][data-bind="app-config"]') as HTMLScriptElement
            let router: any
            if(config) {
                const parsedConfig = JSON.parse(config.innerText)
                const basePath = parsedConfig.BASE_PATH || ''
                if(parsedConfig.USE_ROUTER) {
                    router = createBrowserRouter(routes(basePath))
                }
            } else {
                console.error('Missing appConfig for client, skipping router setup')
            }

            const initialContentDataElem = document.querySelector('script[type="application/json"][data-bind="content-data"]') as HTMLScriptElement
            let initialContentData: any = undefined
            if(initialContentDataElem) {
                initialContentData = JSON.parse(initialContentDataElem.innerText)
            }

            const initialContentAstElem = document.querySelector('script[type="application/json"][data-bind="content-ast"]') as HTMLScriptElement
            let initialContentAst: any = undefined
            if(initialContentAstElem) {
                initialContentAst = JSON.parse(initialContentAstElem.innerText)
            }

            const node =
                <React.Profiler id="Your-Page" onRender={() => null}>
                    <App>
                        <ContentDataProvider initialContentData={initialContentData} initialAst={initialContentAst}>
                            {router ?
                                <RouterProvider router={router} fallbackElement={null}/> :
                                <PageHome/>}
                        </ContentDataProvider>
                    </App>
                </React.Profiler>

            hydrateRoot(element, node)
        })
} else {
    console.log('PWA root not found')
}
