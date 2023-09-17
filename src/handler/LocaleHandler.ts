import { RouteHandler } from '@orbstation/route/RouteHandler'
import { ServiceService } from '../services.js'
import { TranslationService } from '../services/TranslationService.js'

const LocaleHandler: RouteHandler = async(req, res) => {
    const translations = ServiceService.use(TranslationService)
    const ns = await translations.namespaces(req.params.locale)
    if(!ns) {
        return res.status(404).send({error: `locale "${req.params.locale}" not found`})
    }
    if(!ns.includes(req.params.ns)) {
        return res.status(404).send({error: `namespace "${req.params.ns}" not found`})
    }
    return res.send(await translations.loadNamespace(req.params.locale, req.params.ns))
}

export default LocaleHandler
