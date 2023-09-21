import React from 'react'
import { Button } from '@app/design-system/Button'
import { toHumanSize } from '@app/helpers/SizeFormat'
import { ApiPing } from '../components/ApiPing.js'
import { Renderer } from '../components/content-ui/Renderer.js'
import { useContentData } from '../lib/ContentDataProvider.js'

export const PageHome = () => {
    const contentData = useContentData()

    // note: setting "now" here will set it on server-side to server-time,
    //       and then once loaded, it gets the client time, which WILL DIFFER in production, elements like these need to handled extra
    //       see: https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors
    const [now, setNow] = React.useState<string | null>(new Date().toUTCString())

    React.useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date().toUTCString())
        }, 200)
        return () => window.clearInterval(timer)
    }, [setNow])

    return <>
        <div className={'container container-md container-fixed bg-paper px3 py1 o o-divider mb2'}>
            <div className={'pt2 pb4'}>
                <Renderer/>
            </div>
            <pre><code style={{fontSize: '0.725rem'}}>{JSON.stringify(contentData || null, undefined, 4)}</code></pre>
        </div>
        <div className={'container container-md container-fixed bg-paper px3 py1 o o-divider mb2'}>
            <ApiPing/>
        </div>
        <div className={'container container-md container-fixed bg-paper px3 py1 o o-divider mb2'}>
            <div className={'my2'}>
                <Button onClick={() => window.location.reload()}>reload</Button>

                {/* note: just a demo that `toHumanSize` works on client and server */}
                <code>{toHumanSize(80440)}</code>
            </div>
            <code className={'mta'} suppressHydrationWarning>{now}</code>
        </div>
    </>
}
