import { RouteHandler } from '@orbstation/route/RouteHandler'

const ApiPingHandler: RouteHandler = async(_req, res) => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 600))

    return res.send({result: 'pong', now: new Date().toISOString()})
}

export default ApiPingHandler
