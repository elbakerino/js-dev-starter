import { appStarter } from './function.js'
import spdy from 'spdy'
import process from 'process'

const now = () => {
    const date = new Date()
    return date.getUTCHours().toFixed(0).padStart(2, '0') + ':' +
        date.getUTCMinutes().toFixed(0).padStart(2, '0') + ':' +
        date.getUTCSeconds().toFixed(0).padStart(2, '0')
}

appStarter()
    .then((p) => {
        const {app, ServiceService} = p
        // todo: maybe add the `runId`, which is used in `cli`, globally, as maybe also good for general signals logging
        const server = spdy
            .createServer(
                {
                    spdy: {
                        // @ts-ignore
                        protocols: ['h2c'],
                        plain: true,
                        ssl: false,
                    },
                    /*key: fs.readFileSync('./server.key'),
                    cert: fs.readFileSync('./server.crt'),*/
                },
                app,
            )
            .on('error', (err: any) => {
                if(err) {
                    throw new Error(err)
                }
            })
            .listen((process.env.PORT ? parseInt(process.env.PORT) : 3000) as number, () => {
                console.debug(now() + ' [BOOT] server: started on ' + ServiceService.config('host'))
            })
        return {server, ...p}
    })
    .then((p) => {
        const {onHalt, server} = p
        // HTTP Server won't close when WS is still open
        onHalt.server.push(function closeServer() {
            return new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if(err) {
                        reject(err)
                        return
                    }
                    resolve()
                })
            })
        })
        return p
    })
    .catch(e => {
        if(e instanceof Error) {
            console.error('AppStarter failed', e.name, e.message, e.stack)
            process.exit(1)
        } else {
            console.error('AppStarter failed strangely', e)
            process.exit(1)
        }
    })
