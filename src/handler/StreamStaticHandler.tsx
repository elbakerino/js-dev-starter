import { ContentParser } from '@content-ui/md/parser/ContentParser'
import { parseTo } from '@content-ui/md/parser/ParseTo'
import { RouteHandler } from '@orbstation/route/RouteHandler'
import { renderToPipeableStream } from 'react-dom/server'
import { App } from '../app/App.js'
import { StaticContentDataProvider } from '../app/lib/ContentDataProvider.js'
import { PageStream } from '../app/pages/PageStream.js'
import { HtmlWritable } from '../lib/HtmlWritable.js'
import { ServiceService } from '../services.js'
import { AssetManager } from '../services/AssetManager.js'
import { minify } from 'html-minifier-terser'
import { TemplateRegistry } from '../services/TemplateRegistry.js'
import path from 'path'
import { Styler } from '../services/Styler.js'
import { toHumanSize } from '@app/helpers/SizeFormat'

type IPublishEnv = {
    env: string
    mode: 'development' | 'production'
    url: string
}

const minifyHtml = false

/**
 * Example handler which can resolve `Suspense` with custom HTML around, with client hydration support.
 * But not using streaming to client.
 */
const StreamStaticHandler: RouteHandler = async(req, res) => {
    const slug = req.path
    const urlRelative = '/'
    const env: IPublishEnv = {
        env: 'local', mode: 'development',
        url: req.protocol + '://' + req.get('host') + (urlRelative.endsWith('/') ? urlRelative.slice(0, -1) : urlRelative),
    }

    const assetManager = ServiceService.use(AssetManager)
    const templateRegistry = ServiceService.use(TemplateRegistry)
    const styler = ServiceService.use(Styler)
    const contentData = {
        content: `# Suspense Resolved

The next data block is resolved using \`Suspense\` on server and client, but not streamed from server to client, but fully resolved on server and injected in a custom HTML template.
`,
        content_type: 'md',
    }

    const ast = await parseTo(contentData.content, ContentParser)

    const writable = new HtmlWritable()
    const stream = renderToPipeableStream(
        <App>
            <StaticContentDataProvider contentData={contentData} {...ast}>
                <PageStream/>
            </StaticContentDataProvider>
        </App>,
        {
            onShellReady() {
                res.setHeader('Content-type', 'text/html')
                stream.pipe(writable)
            },
        },
    )
    const app = await new Promise<string>((resolve) => {
        writable.on('finish', () => {
            const html = writable.getHtml()
            resolve(html)
        })
    })

    const scripts = await assetManager.scripts()
    const sourceStyles = assetManager.styles()
    const styles = await styler.makeOrUse(
        // todo: use another folder as dist
        path.join(ServiceService.config('assetsDir'), 'public'),
        sourceStyles,
        false,
        `$cdn-url: ${JSON.stringify(urlRelative)};`,
    )

    const siteData = {
        styles: styles.map(s => ({href: `/${s.cssFile}`})),
        scripts: scripts,
        reactRoot: app,
        url: {
            base: env.url,
            canonical: env.url + slug,
        },
        meta: {
            lang: 'en',
            title: 'Stream Static - JS Dev',
        },
        content: contentData,
        appConfig: {
            BASE_PATH: '',
            USE_ROUTER: false,
        },
    }

    let html = await templateRegistry.render('page.liquid', siteData)
    const initialSize = new Blob([html]).size

    if(minifyHtml) {
        html = await minify(html, {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: false,
            collapseWhitespace: true,
            // decode entities somehow are wrongly displayed in JetBrains IDE preview in FF on Windows
            decodeEntities: true,
            html5: true,
            removeAttributeQuotes: true,
            removeTagWhitespace: false,
            removeComments: true,
        })
    }
    const finalSize = new Blob([html]).size
    console.debug('HTML Size:', toHumanSize(initialSize), ...finalSize !== initialSize ? ['>', toHumanSize(finalSize)] : [])
    return res.send(html)
}

export default StreamStaticHandler
