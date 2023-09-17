import * as sass from 'sass'
import postcss from 'postcss'
import postcssImport from 'postcss-import'
import autoprefixer from 'autoprefixer'
import cssnanoPlugin from 'cssnano'
import { fs } from '../lib/fsPromise.js'
import path from 'path'
import { StyleSourcePath } from './AssetManager.js'
import * as url from 'url'

export class Styler {
    protected options?: {
        cssAutoPrefix?: boolean
        nanoCss?: boolean
        resolveFolders?: string[]
    }
    protected readonly watcherMaps: {
        [sourceFile: string]: {
            urls: URL[]
        }
    } = {}

    constructor(options?: Styler['options']) {
        this.options = options
    }

    async compile(
        sourcePath: string,
        rootStylePath: string,
        optionsOverwrites?: Partial<Styler['options']>,
        variables?: string,
    ): Promise<[string, URL[]]> {
        const config = {...optionsOverwrites || {}, ...this.options || {}}
        let css: string
        let loadedUrls: URL[]
        if(sourcePath.endsWith('.css')) {
            // todo: support fetching?
            // todo: css vars are different, better to switch to values definitions to convert here for css or scss
            //       `{ [var: string]: string | {value?: string, default?: boolean} } }`
            // css = await fs.readFile(sourcePath).then(f => (variables ? variables + '\n' : '') + f.toString())
            css = await fs.readFile(sourcePath).then(f => f.toString())
            loadedUrls = [new URL(url.pathToFileURL(sourcePath))]
        } else {
            const scss = await fs.readFile(sourcePath).then(f => f.toString())
            const compiledSass = sass.compileString(
                (variables ? variables + '\n' : '') + scss,
                {
                    style: 'compressed',
                    url: new URL(url.pathToFileURL(sourcePath)),
                    // importers: [],
                    loadPaths: [
                        rootStylePath,
                        ...config?.resolveFolders || [],
                    ],
                    // sourceMap: true,
                },
            )
            loadedUrls = compiledSass.loadedUrls
            css = compiledSass.css
        }
        return await postcss([
            postcssImport({
                root: rootStylePath,
            }),
            ...(config?.cssAutoPrefix ? [autoprefixer()] : []),
            ...(config?.nanoCss ? [cssnanoPlugin()] : []),
        ])
            .process(
                css,
                {
                    from: sourcePath,
                    // from: relStylePath,
                },
            )
            // todo: the loadedUrls here seem to miss e.g. imported css files from `postcss-import`
            .then((css): [string, URL[]] => [css.css, loadedUrls])
    }

    /**
     * Checks for existence and if missing compiles the stylesheet.
     *
     * @param pathDist the folder where to store the CSS files
     * @param sourceStyles a list of files which should be compiled
     * @param watchFiles to activate a `fs.stat` based file-has-changed detection, using all imported files of the sourceStyle
     * @param variables custom scss added before compiling
     */
    async makeOrUse(
        pathDist: string,
        sourceStyles: StyleSourcePath[],
        watchFiles?: boolean,
        variables?: string,
    ) {
        const styles: { sourcePath: StyleSourcePath, cssName: string, cssPath: string, cssFile: string }[] = []
        for(const sourcePath of sourceStyles) {
            const cssName = sourcePath.split('.').slice(0, -1).join('.') + '.css'
            const cssPath = path.join(pathDist, path.basename(cssName))
            const getLastMod = async(filePath: string) => {
                try {
                    const stats = await fs.stat(filePath)
                    return stats.mtimeMs
                } catch(e) {
                    if(e instanceof Error && 'code' in e && e.code === 'ENOENT') {
                        // noop
                    } else {
                        throw e
                    }
                }
                return null
            }

            const lastModCss: number | null = await getLastMod(cssPath)
            let exists = false
            if(lastModCss) {
                const watcherMap = this.watcherMaps[sourcePath]
                exists = Boolean(!watchFiles || (watchFiles && watcherMap))
                if(watchFiles && watcherMap) {
                    for(const url of watcherMap.urls) {
                        let filePath: string
                        if(process.platform.startsWith('win')) {
                            const driveLetter = url.pathname.charAt(1).toUpperCase()
                            const filePathWithoutDrive = url.pathname.slice(4)
                            filePath = path.join(driveLetter + ':/', filePathWithoutDrive)
                        } else {
                            filePath = decodeURIComponent(url.pathname)
                        }
                        const lastMod: number | null = await getLastMod(filePath)
                        if(!lastMod || lastMod > lastModCss) {
                            console.debug(`${!lastMod ? 'delete' : 'change'} detected for "${filePath}"`)
                            exists = false
                            break
                        }
                    }
                }
            }

            if(!exists) {
                const [, loadedUrls] = await this.compileAndSave(sourcePath, cssPath, variables)
                this.watcherMaps[sourcePath] = {
                    urls: loadedUrls,
                }
            }

            styles.push({sourcePath: sourcePath, cssName, cssPath, cssFile: path.basename(cssName)})
        }
        return styles
    }

    async compileAndSave(
        sourcePath: string,
        cssPath: string,
        variables?: string,
    ): ReturnType<Styler['compile']> {
        const startTime = performance.now()
        const [resultPostCss, loadedUrls] = await this.compile(sourcePath, path.dirname(sourcePath), undefined, variables)
        const endTime = performance.now()
        console.debug(`compiled "${sourcePath}" in ${((endTime - startTime) / 1000).toFixed(3)}s`)
        const css = resultPostCss
        await fs.mkdir(path.dirname(cssPath), {recursive: true})
        await fs.writeFile(cssPath, css)
        return [resultPostCss, loadedUrls]
    }
}
