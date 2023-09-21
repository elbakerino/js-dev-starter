import { Button } from '@app/design-system/Button'
import React from 'react'
import { Renderer } from '../components/content-ui/Renderer.js'
import { wrapPromise } from '../lib/wrapPromise.js'

const resource = wrapPromise(fetch('http://localhost:8080/api/demo-data').then(r => r.json()))

export const PageStream = () => {
    const data = resource.read()
    const [i, setI] = React.useState(0)
    return <>
        <div className={'container container-md container-fixed bg-paper px3 py1 o o-divider mb2'}>
            <div className={'pt2 pb4'}>
                <Renderer/>
            </div>
            <pre><code style={{fontSize: '0.725rem'}}>{JSON.stringify(data || null, undefined, 4)}</code></pre>
            <div>
                <Button onClick={() => setI(i => i + 1)}>
                    +1
                </Button>
                <code>{i}</code>
            </div>
        </div>
    </>
}
