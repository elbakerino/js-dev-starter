import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ContentDataProvider } from './lib/ContentDataProvider.js'
import { PageHome } from './pages/PageHome.js'
import { PageStream } from './pages/PageStream.js'
import RootApp from './RootApp.js'
import { App } from './App.js'
import { routes } from './routes.js'

const getHydrationNode = () => {
    const config = document.querySelector('script[type="application/json"][data-bind="app-config"]') as HTMLScriptElement
    let router: any
    if(config) {
        const parsedConfig = JSON.parse(config.innerText)
        const basePath = parsedConfig.BASE_PATH || ''
        if(parsedConfig.USE_ROUTER) {
            router = createBrowserRouter(routes(basePath))
        }
    } else {
        console.warn('Missing appConfig for client, skipping react-router setup')
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

    return (
        <React.Profiler id="ReactApp" onRender={() => null}>
            <App>
                <ContentDataProvider initialContentData={initialContentData} initialAst={initialContentAst}>
                    {router ?
                        <RouterProvider router={router} fallbackElement={null}/> :
                        // todo: get some alternative router up and running
                        window.location.pathname === '/' ?
                            <PageHome/> :
                            window.location.pathname === '/stream-static' || window.location.pathname === '/stream' ?
                                <PageStream/> :
                                <div><p>404 Not found</p></div>
                    }
                </ContentDataProvider>
            </App>
        </React.Profiler>
    )
}

const element = document.querySelector('#root') as Element
if(element) {
    hydrateRoot(element, getHydrationNode())
} else {
    console.log('PWA root not found, using full hydrate')
    // @ts-ignore
    const rootAppProps = window.rootAppProps
    if(rootAppProps) {
        hydrateRoot(document,
            <RootApp {...rootAppProps}>
                {getHydrationNode()}
            </RootApp>,
        )
    } else {
        throw new Error('Missing rootAppProps')
    }
}
