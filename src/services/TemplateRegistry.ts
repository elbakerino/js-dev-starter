import path from 'path'
import { unified } from 'unified'
import { Liquid } from 'liquidjs'
import remarkParse from 'remark-parse'
import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import remarkPresetLintNoDuplicateHeadings from 'remark-lint-no-duplicate-headings'
import remarkLintListItemIndent from 'remark-lint-list-item-indent'
import remarkLintFinalNewline from 'remark-lint-final-newline'
// @ts-ignore
import remarkFrontmatter from 'remark-frontmatter'
// @ts-ignore
import { remarkDefinitionList } from 'remark-definition-list'
// @ts-ignore
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
// @ts-ignore
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import { visit } from 'unist-util-visit'
import { Root as HastRoot } from 'hast'
import yaml from 'yaml'

export function styleThings(tree: HastRoot) {
    visit(tree, 'element', function(node) {
        const name = node.type === 'element' ? node.tagName.toLowerCase() : ''
        if(name.length === 1 && name === 'p') {
            // this would be in mdast:
            // node.data = {hProperties: {className: ['body1']}}
            // but we are already in hast:
            node.properties = {className: ['body1']}
        } else if(name.length === 2 && name[0] === 'h') {
            node.properties = {className: ['h' + name[1]]}
        }
    })
}

export interface LiquidOptions {
    cache?: boolean
    root?: string
    /**
     * Further liquid JS partials added to the default one.
     */
    layouts?: string[]
    /**
     * Further liquid JS partials added to the default one.
     */
    partials?: string[]
}

const mdParserInternal = () => unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkPresetLintConsistent)
    .use(remarkPresetLintRecommended)
    .use(remarkPresetLintNoDuplicateHeadings)
    .use(remarkLintListItemIndent, 'space')
    .use(remarkLintFinalNewline, false)
    .use(remarkFrontmatter, {type: 'yaml', anywhere: true, marker: '-'})
    .use(remarkGfm, {
        singleTilde: false,
    })
    // .use(remarkInsert)
    // .use(remarkUnderline)
    // .use(remarkMark)
    // .use(remarkSubSuper)
    .use(remarkDefinitionList)

export const mdParser = mdParserInternal()

const mdToHtmlParser = (templateRegistry: TemplateRegistry) => mdParserInternal()
    .use(remarkRehype, null, {
        allowDangerousHtml: true,
        handlers: {
            yaml(_state, node) {
                if(node.position.start.line === 1) {
                    // ignoring frontmatter
                    return null
                }
                const blockData = yaml.parse(node.value)
                if(!('type' in blockData)) return null
                if(blockData.type === 'render') {
                    return {
                        type: 'raw',
                        value: templateRegistry.renderPartialSync(blockData.template, blockData),
                    }
                }
                return {
                    type: 'raw',
                    value: `<pre><code>${node.value}</code></pre>`,
                }
            },
            mark(state, node) {
                return {
                    type: 'element',
                    tagName: 'mark',
                    properties: {},
                    children: state.all(node),
                }
            },
        },
    })
    .use(rehypeStringify, {
        allowDangerousHtml: true,
    })

export class TemplateRegistry {
    protected engine: Liquid
    protected globals?: { [k: string]: any }
    protected mdParser: ReturnType<typeof mdToHtmlParser>

    constructor(
        root: string,
        opts?: LiquidOptions,
    ) {
        this.engine = new Liquid({
            cache: opts?.cache || false,
            root: opts?.root || path.resolve(root, 'views/'),
            layouts: opts?.layouts || [],
            partials: opts?.partials || [],
            extname: '.liquid',
            relativeReference: false,
            strictFilters: true,
            outputEscape: 'escape',
            // strictVariables: true,
            // dateFormat: '',
        })
        this.mdParser = mdToHtmlParser(this)
        this.engine.registerFilter('md', async(content) => {
            const mdAst = this.mdParser.parse(content)
            // console.log('mdAst', mdAst)
            const htmlAst = await this.mdParser.run(mdAst)
            // @ts-ignore
            styleThings(htmlAst)
            const htmlStr = this.mdParser.stringify(htmlAst)
            // console.log('htmlAst', htmlAst)
            // console.log('htmlStr', htmlStr)
            return htmlStr
        })

        const parseAndRender = (html, data) => this.parseAndRender(html, data)

        this.engine.registerFilter('liquid', async function(content) {
            return parseAndRender(content, this.context.getAll())
        })

        // todo: allow adding reusable filters/tags
        // todo: allow adding custom filters/tags per page

        this.engine.registerFilter('price_to_amount', function(price) {
            return `${(price.unit_amount / 100).toFixed(2)} ${price.currency}`
        })
    }

    render<D extends {}>(view: string, data: D) {
        return this.engine.renderFile(view, data, {globals: {}})
    }


    renderPartial<D extends {}>(view: string, data: D) {
        return this.engine.renderFile(view, data, {
            globals: {},
            // @ts-ignore
            lookupType: 'partials',
        })
    }

    renderPartialSync<D extends {}>(view: string, data: D) {
        return this.engine.renderFileSync(view, data, {
            globals: {},
            // @ts-ignore
            lookupType: 'partials',
        })
    }

    parseAndRender<D extends {}>(html: string, data: D) {
        return this.engine.parseAndRender(html, data, {globals: {}})
    }
}
