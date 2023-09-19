import { ContentParser } from '@content-ui/md/parser/ContentParser'
import { parseTo } from '@content-ui/md/parser/ParseTo'
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
        content: `# Welcome & Introduction

**JavaScript** (JS) has come a long way from its inception in *1995* as a tool to add simple interactivity to web pages. Fast forward to today, and we find ourselves in a world where modern JavaScript, with its **ECMAScript Modules (ESM)** and **ReactJS**, delivers powerful client and server-side rendering for web applications.

## The Tech Odyssey of JavaScript

1. **The Birth of Interactivity**: In 1995, JS was born as a tool for adding rudimentary interactivity to static web pages. It ushered in an era of dynamic web experiences.
2. **Dynamic Web Emerges**: As the web matured, JavaScript evolved alongside it. Libraries like **jQuery** (2006) provided a standardized way to interact with the Document Object Model (DOM), making web development more accessible.
3. **The Rise of Ajax**: The early 2000s saw the advent of **Ajax (Asynchronous JavaScript and XML)**, enabling web applications to fetch and display data without refreshing the entire page. This marked a significant leap in user experience.
4. **Node.js Revolution (2009)**: Node.js, created by Ryan Dahl, brought JavaScript to the server-side. Its event-driven, non-blocking I/O architecture made it ideal for building scalable, real-time applications.
5. **ECMAScript Standardization (1997 - Present)**: ECMAScript, the standardized core of JavaScript, was established to ensure consistency across different implementations. It has continued to evolve, with each version introducing new language features and improvements.
6. **The Rise of Single-Page Applications (SPAs)**: In the mid-2010s, SPAs became popular. Libraries like **AngularJS** and later **ReactJS** revolutionized UI development by introducing component-based architectures and virtual DOM rendering.
7. **The Dominance of ES6 (2015)**: ECMAScript 6, also known as ES6 or ECMAScript 2015, was a pivotal release. It introduced features like *arrow functions*, *classes*, and, most importantly, *module imports* with \`import\` and \`export\`. This marked a significant shift in how JavaScript code was organized.
8. **ReactJS Innovation (2013 - Present)**: ReactJS, introduced by Facebook in 2013, transformed UI development. Its virtual DOM and declarative syntax made it faster and more efficient for rendering user interfaces. React continues to evolve with new features and enhancements.

## Modern JavaScript

- *ESM*: ECMAScript 6 (2015) brought modular code with \`import\` and \`export\`.
- *ReactJS*: Component-based UI with virtual DOM for speed.

## ReactJS Everywhere

**Client & Server Harmony**: ReactJS empowers isomorphic rendering, where applications can run efficiently both on the client and server sides.

---

*Let's dive in and code the future!*`,
        content_type: 'md',
    }

    const ast = await parseTo(contentData.content, ContentParser)

    const app = renderToString(
        <App>
            <StaticContentDataProvider
                contentData={contentData}
                {...ast}
            >
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
