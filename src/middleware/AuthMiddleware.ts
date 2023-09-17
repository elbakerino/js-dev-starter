import { RouteMiddleware } from '@orbstation/route/RouteHandler'
import { RequestCustomPayload, RequestCustomPayloadAuth } from '../lib/routing.js'
import { IdManager } from '@bemit/cloud-id/IdManager'
import { AuthRuleError } from '@bemit/auth-perms/AuthRuleError'
import jsonwebtoken from 'jsonwebtoken'
import { AuthCanDo, AuthGrantsGiven } from '@bemit/auth-perms/AuthCanDo'

export const AuthMiddleware: <ACD extends AuthCanDo>(authCanDo: ACD, idManager: IdManager) => RouteMiddleware<RequestCustomPayload<AuthGrantsGiven<ACD>>> = (authCanDo, idManager) => async(req, res, next) => {
    const header = req.header('Authorization')
    if(header) {
        if(header.startsWith('Basic ')) {
            return res.status(400).send({
                error: 'invalid-token-format: basic not supported',
            })
        }
        if(header.indexOf('Bearer ') !== 0) {
            return res.status(400).send({
                error: 'invalid-token-format',
            })
        }
        try {
            req.authId = await idManager.verify(header.slice('Bearer '.length)) as RequestCustomPayloadAuth
            req.authGrants = authCanDo.resolveGrants({
                scopes: req.authId.scope?.split(' ') || [],
            }) as AuthGrantsGiven<AuthCanDo>
        } catch(e) {
            if(!(e instanceof jsonwebtoken.JsonWebTokenError)) {
                console.error('System Error on JWT verification', e)
            }
            return res.status(401).send({
                error: 'invalid-token',
            })
        }
    }

    try {
        next()
    } catch(e) {
        if(e instanceof AuthRuleError) {
            return res.status(e.code || 401).send({
                error: e.message || 'not-allowed',
                errors: e.constraints.length ? e.constraints : undefined,
            })
        } else {
            throw e
        }
    }
}
