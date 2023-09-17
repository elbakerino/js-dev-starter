import { fs } from '../lib/fsPromise.js'
import path from 'node:path'
import yaml from 'yaml'

export class TranslationService {
    private readonly paths: string[]
    private cached?: {
        [locale: string]: {
            [locale: string]: {
                data: any
                files: [file: string, values: object | undefined, mtime: number][]
            }
        }
    }

    constructor(path: string[]) {
        this.paths = path
    }

    private async loadPath(cached: NonNullable<TranslationService['cached']>, rootFolder: string) {
        const localeFolders = await fs.readdir(rootFolder)
        // todo: support file watching
        for(const locale of localeFolders) {
            const fileStat = await fs.stat(path.join(rootFolder, locale))
            if(!fileStat.isDirectory()) {
                continue
            }
            if(!cached[locale]) {
                cached[locale] = {}
            }
            const namespaces = await fs.readdir(path.join(rootFolder, locale))

            for(const namespaceFile of namespaces) {
                const fileStat = await fs.stat(path.join(rootFolder, locale, namespaceFile))
                if(!fileStat.isFile()) {
                    continue
                }
                const namespace = namespaceFile.split('.')[0]
                if(!cached[locale][namespace]) {
                    cached[locale][namespace] = {files: [], data: null}
                }
                cached[locale][namespace].files.push([
                    path.join(rootFolder, locale, namespaceFile),
                    undefined,
                    fileStat.mtimeMs,
                ])
            }
        }
        return cached
    }

    private async loadPaths() {
        this.cached = {}
        for(const folder of this.paths) {
            this.cached = await this.loadPath(this.cached, folder)
        }
        return this.cached as NonNullable<typeof this.cached>
    }

    async namespaces(locale: string): Promise<string[] | undefined> {
        const index = await this.loadPaths()
        if(!index[locale]) return undefined
        return Object.keys(index[locale])
    }

    private isObject(obj: any): boolean {
        return typeof obj === 'object' && obj !== null
    }

    private mergeTranslations(dictA: any, dictB: any): any {
        if(typeof dictA === 'function') {
            dictA = dictA()
        }
        if(typeof dictB === 'function') {
            dictB = dictB()
        }

        if(!this.isObject(dictA) || !this.isObject(dictB)) {
            return dictB || dictA
        }

        const result: any = {...dictA || {}}

        for(const key in dictB) {
            if(key in dictA) {
                result[key] = this.mergeTranslations(dictA[key], dictB[key])
            } else {
                result[key] = dictB[key]
            }
        }

        return result
    }


    async loadNamespace(locale: string, namespace: string) {
        const index = await this.loadPaths()
        const data = index[locale][namespace].data
        if(data) return data
        const files = index[locale][namespace].files
        let ns: any = {}
        for(const fileInfo of files) {
            const [file, value] = fileInfo
            if(value) {
                ns = this.mergeTranslations(ns, value)
                continue
            }
            const translations = await fs.readFile(file)
                .then(f => {
                    if(file.endsWith('.json')) {
                        return JSON.parse(f.toString())
                    } else if(file.endsWith('.yml') || file.endsWith('.yaml')) {
                        return yaml.parse(f.toString())
                    }
                    throw new Error(`Invalid locale file, no parser: "${file}"`)
                })
            fileInfo[1] = translations
            ns = this.mergeTranslations(ns, translations)
        }
        index[locale][namespace].data = ns
        return ns
    }

    async namespaceLoaders(locale: string) {
        const namespaces = await this.namespaces(locale)
        if(!namespaces) return {}
        return namespaces.reduce<{ [ns: string]: () => Promise<object> }>((loaders, namespace) => {
            return {
                ...loaders,
                [namespace]: () => this.loadNamespace(locale, namespace),
            }
        }, {})
    }
}
