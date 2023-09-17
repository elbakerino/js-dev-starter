import { RouteHandler } from '@orbstation/route/RouteHandler'
import { renderToString } from 'react-dom/server'
import { App } from '../app/App.js'
import { StaticContentDataProvider } from '../app/lib/ContentDataProvider.js'
import { PageHome } from '../app/pages/PageHome.js'
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

const minifyHtml = true

const HomeHandler: RouteHandler = async(req, res) => {
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
        content: '# Welcome',
        content_type: 'md',
    }

    const app = renderToString(
        <App>
            <StaticContentDataProvider contentData={contentData}>
                <PageHome/>
            </StaticContentDataProvider>
        </App>,
    )

    const scripts = await assetManager.scripts()
    const sourceStyles = assetManager.styles()
    const styles = await styler.makeOrUse(
        // todo: use another folder as dist
        path.join(ServiceService.config('assetsDir'), 'public'),
        sourceStyles,
        false,
        // todo: these variable have a relation to siteData, but only to the pure-data,
        //       but the siteData depends for assets on the result of styler
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
            title: 'JS Dev',
            description: 'JS development starter for isomorphic ReactJS apps',
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

export default HomeHandler
