import { toHumanSize } from '@app/helpers/SizeFormat'
import React from 'react'
import { Button } from '@app/design-system/Button'

export const App: React.FC<React.PropsWithChildren<{}>> = ({children}) => {
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

    return <div className={'flex flex-column flex-wrap my1 grow-1x'}>
        <div className={'container container-md container-fixed bg-paper px3 py1 o o-divider grow-1x'}>
            {children}
            <div className={'my2'}>
                <Button onClick={() => window.location.reload()}>reload</Button>

                {/* note: just a demo that `toHumanSize` works on client and server */}
                <code>{toHumanSize(80440)}</code>
            </div>
        </div>
        <code className={'mta'} suppressHydrationWarning>{now}</code>
    </div>
}
