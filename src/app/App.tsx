import { ContentLeafsProvider, contentUIDecorators } from '@content-ui/react/ContentLeaf'
import React, { Suspense } from 'react'
import { contentUIMapping } from './components/content-ui/contentUI.js'
import { ErrorBoundary } from './lib/ErrorBoundary.js'

export const App: React.FC<React.PropsWithChildren<{}>> = ({children}) => {
    return <ErrorBoundary fallback={<div>Failed to fetch data!</div>}>
        <Suspense fallback={<span>{'...'}</span>}>
            <ContentLeafsProvider deco={contentUIDecorators} render={contentUIMapping}>
                <div className={'flex flex-column flex-wrap my1 grow-1x'}>
                    {children}
                </div>
            </ContentLeafsProvider>
        </Suspense>
    </ErrorBoundary>
}
