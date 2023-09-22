import { Button } from '@app/design-system/Button'
import React from 'react'
import { useApi } from 'react-api-fetch/useApi'
import { extractHeaders } from 'react-api-fetch/extractHeaders'
import { headersJson } from 'react-api-fetch/headersJson'
import { ps, useProgress } from 'react-progress-state'
import { dataConverterJson } from 'react-api-fetch/fetcher'
import { Typography } from './content-ui/LeafTypo.js'

/**
 * Example component that only uses the API without SSR-data-loader.
 */
export const ApiPing: React.FC<{ apiHost?: string }> = ({apiHost}) => {
    const fetch = useApi({extractHeaders, dataConvert: dataConverterJson, headers: headersJson})
    const [p, setP, startP] = useProgress()
    const [fid, setFid] = React.useState<number | undefined>(undefined)
    const [result, setResult] = React.useState<any | undefined>(undefined)
    const [abort, setAbort] = React.useState<undefined | AbortController['abort']>(undefined)

    const load = React.useCallback(() => {
        const controller = new AbortController()
        const fid = startP()
        setFid(fid)
        fetch<{ uuid: string }>((apiHost || '') + '/api/ping', 'GET', undefined, undefined, controller.signal)
            .then(r => {
                setAbort(undefined)
                const isPid = setP(ps.done, undefined, fid)
                if(!isPid) return
                setResult(r.data)
            })
            .catch(r => {
                setAbort(undefined)
                if(controller.signal.aborted) {
                    // todo: maybe add new `aborted` state
                    setP(ps.none, undefined, fid)
                    return
                }
                const isPid = setP(ps.error, r, fid)
                console.error(r, isPid)
            })
        setAbort(() => controller.abort.bind(controller))
        return {abort: controller.abort.bind(controller)}
    }, [apiHost, fetch, setP, startP])

    React.useEffect(() => {
        const {abort} = load()
        return () => abort()
    }, [load])

    return <>
        <div className={'btn-group btn-group-round'}>
            <Button
                className={'bg-paper'}
                onClick={() => load()}
                color={'primary'}
                variant={'outlined'}
            >
                Send
            </Button>
            <Button
                className={'bg-paper'}
                disabled={!abort}
                onClick={() => {
                    abort?.()
                }}
            >
                Abort
            </Button>
        </div>
        <div className={'mt1'}>
            <Typography>
                fid: <code>{JSON.stringify(fid)}</code>
            </Typography>
            <Typography>
                progress: <code>{JSON.stringify(p)}</code>
            </Typography>
            <Typography>
                result: <code>{result ? JSON.stringify(result) : '-'}</code>
            </Typography>
        </div>
    </>
}
