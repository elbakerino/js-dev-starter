import { fs } from '../lib/fsPromise.js'
import path from 'node:path'

export type StyleSourcePath = `${string}.css` | `${string}.scss` | `${string}.sass`

export class AssetManager {
    protected _scriptsClientFolder: string
    protected _assetManifest?: { [entry: string]: string[] } = undefined
    protected opts?: { embedScriptMaxBytes?: number }
    protected _scripts?: {
        /**
         * absolute path to compiled file
         */
        file: string
        /**
         * public routing path
         */
        path: string
        size: number
        mtime: number
        ctime: number
        js: string | undefined
    }[] = undefined
    protected _styles: StyleSourcePath[] = []

    constructor(
        scriptsClientFolder: string,
        opts?: AssetManager['opts'],
    ) {
        this._scriptsClientFolder = scriptsClientFolder
        this.opts = opts
    }

    get scriptsClientFolder(): string {
        return this._scriptsClientFolder
    }

    addStyle(style: StyleSourcePath) {
        this._styles.push(style)
    }

    styles() {
        return this._styles
    }

    async manifest(): Promise<NonNullable<AssetManager['_assetManifest']>> {
        if(!this._assetManifest) {
            this._assetManifest = await fs.readFile(path.join(this._scriptsClientFolder, 'asset-manifest.json'))
                .then(f => JSON.parse(f.toString()) as NonNullable<AssetManager['_assetManifest']>)
        }
        return this._assetManifest
    }

    async scriptsPublicPaths(entries?: string[]): Promise<string[]> {
        const manifest = await this.manifest()
        let entriesFiles: string[][]
        if(entries?.length) {
            entriesFiles = entries.reduce<string[][]>((files, entry) => {
                files = files.concat(manifest[entry])
                return files
            }, [])
        } else {
            entriesFiles = Object.values(manifest)
        }
        return Array.from(new Set(entriesFiles.flat()))
    }

    async scripts(entries?: string[]): Promise<NonNullable<AssetManager['_scripts']>> {
        if(!this._scripts) {
            const scriptPublicPaths = await this.scriptsPublicPaths(entries)
            this._scripts = []
            for(const scriptPublicPath of scriptPublicPaths) {
                const scriptFilePath = path.join(this._scriptsClientFolder, scriptPublicPath.split('/').slice(-1).join(''))
                const stats = await fs.stat(scriptFilePath)
                let js: string | undefined
                if(typeof this.opts?.embedScriptMaxBytes === 'number' && stats.size < this.opts.embedScriptMaxBytes) {
                    js = await fs.readFile(scriptFilePath).then(r => r.toString())
                }
                this._scripts.push({
                    file: scriptFilePath,
                    // tdo: path to href for same like css
                    path: scriptPublicPath,
                    size: stats.size,
                    mtime: stats.mtimeMs,
                    ctime: stats.ctimeMs,
                    js: js,
                })
            }
        }
        return this._scripts
    }
}
