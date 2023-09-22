import { ContentParser } from '@content-ui/md/parser/ContentParser'
import { parseTo } from '@content-ui/md/parser/ParseTo'
import { RouteHandler } from '@orbstation/route/RouteHandler'
import { renderToPipeableStream } from 'react-dom/server'
import { App } from '../app/App.js'
import { StaticContentDataProvider } from '../app/lib/ContentDataProvider.js'
import { PageStream } from '../app/pages/PageStream.js'
import RootApp from '../app/RootApp.js'
import { ServiceService } from '../services.js'
import { AssetManager } from '../services/AssetManager.js'
import path from 'path'
import { Styler } from '../services/Styler.js'

/**
 * Example handler which can resolve `Suspense` with 100% React as template, with client hydration support.
 * Using streaming to client.
 */
const StreamStaticHandler: RouteHandler = async(_req, res) => {
    const urlRelative = '/'

    const assetManager = ServiceService.use(AssetManager)
    const styler = ServiceService.use(Styler)
    const scripts = await assetManager.scripts()
    const sourceStyles = assetManager.styles()
    const styles = await styler.makeOrUse(
        // todo: use another folder as dist
        path.join(ServiceService.config('assetsDir'), 'public'),
        sourceStyles,
        false,
        `$cdn-url: ${JSON.stringify(urlRelative)};`,
    )
    const assets = {
        styles: styles.map(s => ({href: `/${s.cssFile}`})),
        scripts: scripts.map(s => s.path),
    }

    const meta = {
        lang: 'en',
        title: 'Stream - JS Dev',
    }

    const contentData = {
        content: `# Suspense Resolved

The next data block is resolved using \`Suspense\` on server and client, fully streamed from server to client, 100% React as template.
`,
        content_type: 'md',
    }

    const ast = await parseTo(contentData.content, ContentParser)

    const rootAppProps = {styles: assets.styles, meta}

    const stream = renderToPipeableStream(
        <RootApp {...rootAppProps}>
            <App>
                <StaticContentDataProvider contentData={contentData} {...ast}>
                    <PageStream/>
                </StaticContentDataProvider>
            </App>,
        </RootApp>,
        {
            bootstrapScripts: assets.scripts,
            bootstrapScriptContent: `window.rootAppProps = ${JSON.stringify(rootAppProps)};`,
            onShellReady() {
                res.setHeader('Content-type', 'text/html')
                stream.pipe(res)
            },
        },
    )
}

export default StreamStaticHandler
