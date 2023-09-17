import { CommandHandler } from '@orbstation/command/CommandHandler'
import { ServiceService } from '../services.js'
import { Styler } from '../services/Styler.js'
import path from 'path'
import * as chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { AssetManager } from '../services/AssetManager.js'
import { cling } from '@orbstation/cling'
import * as url from 'url'

export const stylesCommand: CommandHandler['run'] = async(c, args) => {
    const doWatch = args.includes('--watch') || args.includes('-w')
    const assetManager = ServiceService.use(AssetManager)
    const styler = ServiceService.use(Styler)
    const sourceStyles = assetManager.styles()
    const urlRelative = '/'
    const watchers: { [file: string]: FSWatcher } = {}

    const compileAndWatch = async(sourceStyle: string, compileArgs: Parameters<typeof styler.compileAndSave>) => {
        let lastLoadedUrls: string[] = []

        const recompile = async() => {
            let loadedUrls
            try {
                [, loadedUrls] = await styler.compileAndSave(...compileArgs)
            } catch(e) {
                cling.message('error', `Failed to compile "${sourceStyle}":\n\n${e}`)
                return {
                    toUnwatch: [],
                    toWatch: [],
                }
            }
            const filesToAdd: string[] = []
            loadedUrls.forEach((loadedUrl) => {
                const i = lastLoadedUrls.findIndex(lastUrl => lastUrl === loadedUrl.href)
                if(i === -1) {
                    // not yet watched
                    filesToAdd.push(url.fileURLToPath(loadedUrl.href))
                } else {
                    // already watched
                    lastLoadedUrls.splice(i, 1)
                }
            })

            // those still remaining are not used anymore
            const toUnwatch = lastLoadedUrls.map(lastUrl => url.fileURLToPath(lastUrl))

            lastLoadedUrls = loadedUrls.map(lastUrl => lastUrl.href)
            return {
                toUnwatch: toUnwatch,
                toWatch: filesToAdd,
            }
        }

        const initialResult = await recompile()

        if(!doWatch) return

        cling.line(`Starting file watcher for "${sourceStyle}"`)
        const watcher = chokidar.watch(sourceStyle, {
            ignoreInitial: true,
        })

        watcher.on('ready', () => {
            cling.line(`File watcher is ready for "${sourceStyle}", watching "${Object.values(watcher.getWatched()).flat().length}" files`)
        })

        const handleWatcherUpdate = ({toUnwatch, toWatch}: { toUnwatch: string[], toWatch: string[] }) => {
            if(toUnwatch.length) {
                watcher.unwatch(toUnwatch)
            }
            if(toWatch.length) {
                watcher.add(toWatch)
            }
        }

        handleWatcherUpdate(initialResult)

        watcher
            .on('add', () => {
                // cling.line(`File ${path} has been added`)
                return recompile().then(handleWatcherUpdate)
            })
            .on('change', () => {
                // cling.line(`File ${path} has been changed`)
                return recompile().then(handleWatcherUpdate)
            })
            .on('unlink', () => {
                // cling.line(`File ${path} has been removed`)
                return recompile().then(handleWatcherUpdate)
            })

        watchers[sourceStyle] = watcher
    }
    const pathDist = path.join(ServiceService.config('assetsDir'), 'public')

    for(const sourcePath of sourceStyles) {
        const cssName = sourcePath.split('.').slice(0, -1).join('.') + '.css'
        const cssPath = path.join(pathDist, path.basename(cssName))
        const sassVars = `$cdn-url: ${JSON.stringify(urlRelative)};`
        await compileAndWatch(sourcePath, [sourcePath, cssPath, sassVars])
    }

    if(doWatch) {
        do {
            await new Promise((resolve) => setTimeout(resolve, 200))
        } while(!c.shouldHalt)

        await Promise.allSettled(Object.values(watchers).map((w, i) => w.close().then(() => console.debug(`watcher "${i}" closed`))))
    }
}

export const command: CommandHandler = {
    help: `Creates all stylesheets, supports file watching`,
    run: stylesCommand,
}
