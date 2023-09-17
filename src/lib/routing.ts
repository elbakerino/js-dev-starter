import { RouteHandler } from '@orbstation/route/RouteHandler'
import express from 'express'
import { AuthValidatorTokenBase, AuthValidatorTokenScoped } from '@bemit/auth-perms/AuthValidator'
import { AuthCanDo, AuthGrantsGiven } from '@bemit/auth-perms/AuthCanDo'
import { authCanDo } from '../config/authGrants.js'

export interface RequestCustomPayloadAuth extends Partial<AuthValidatorTokenBase & AuthValidatorTokenScoped> {
    exp?: number
    lang?: string
}

export interface RequestCustomPayload<AG extends AuthGrantsGiven<AuthCanDo> = AuthGrantsGiven<typeof authCanDo>> extends express.Request {
    authId?: RequestCustomPayloadAuth
    authGrants?: AG
    trace?: string
    traceSpan?: string
}

export const handlerErrorWrapper = (id: string, fn: RouteHandler) => (req: express.Request, res: express.Response, next: express.NextFunction): void | express.Response | Promise<express.Response | void> => {
    res.locals.api_id = id
    const r = fn(req, res)
    if(r && 'catch' in r) {
        r.catch(next)
    }
    return r
}
