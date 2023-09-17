import { CommandHandler } from '@orbstation/command/CommandHandler'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { cling } from '@orbstation/cling'

const fsStats = util.promisify(fs.stat)
const fsMkDir = (path: string) => new Promise<undefined>((resolve, reject) => {
    fs.mkdir(path, {recursive: true}, (err) => {
        if(err) {
            cling.message('error', 'failed to create folder: ' + path + ' \nError: ' + err.message)
            reject(err)
            return
        }
        cling.message('success', 'created folder: ' + path)
        resolve(undefined)
    })
})
const fsWrite = (path: string, data: string) => new Promise<undefined>((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
        if(err) {
            cling.message('error', 'failed to write file: ' + path + ' \nError: ' + err.message)
            reject(err)
            return
        }
        cling.message('success', 'written file: ' + path)
        resolve(undefined)
    })
})

const extensionTypes: { [k: string]: { folder: string, definition: string } } = {
    feature: {folder: 'features', definition: '{id}.{type}.ts'},
    extension: {folder: 'extensions', definition: '{id}.{type}.ts'},
}
export const extensionInitCommand: CommandHandler['run'] = async(_c, args) => {
    const [extensionId, type = 'extension'] = args
    if(!extensionId) {
        throw new Error('requires arg: featureId')
    }
    const extensionType = extensionTypes[type]
    if(!extensionType) {
        throw new Error('invalid arg: type, must be one of: ' + Object.keys(extensionTypes).join(', '))
    }
    // todo: this must NOT be _dirname, as would be in `build`
    // todo: validate how orbito\render template init does that
    // const featurePath = path.join(path.dirname(__dirname), 'features', featureId)
    const extensionPath = path.resolve('src', extensionType.folder, extensionId)
    const exists = await fsStats(extensionPath).catch(() => undefined)
    if(exists) {
        throw new Error('feature already exists at ' + extensionPath)
    }
    cling.line('creating ' + type + ' `' + extensionId + '`... target: ' + extensionPath)
    await Promise.all([
        fsMkDir(path.join(extensionPath, 'commands')),
        fsMkDir(path.join(extensionPath, 'events')),
        fsMkDir(path.join(extensionPath, 'handler')),
        fsMkDir(path.join(extensionPath, 'model')),
        fsMkDir(path.join(extensionPath, 'service')),
    ])
    const extensionFileDefault = `import { OrbServiceExtension } from '@orbstation/service'

export default (): OrbServiceExtension => {
    return {
        id: '${extensionId}',
        onBoot: () => {
            // todo: implement
        },
        routes: [],
    }
}
`
    const definitionFileName = extensionType.definition
        .replace('{id}', extensionId)
        .replace('{type}', type)
    await Promise.all([
        fsWrite(path.join(extensionPath, definitionFileName), extensionFileDefault),
    ])

    cling.message('success', 'created new ' + type + ' `' + extensionId + '` in ' + extensionPath)
}

export const command: CommandHandler = {
    help: `Creates a new extension / feature folder, with basic folder and file structure`,
    run: extensionInitCommand,
}
