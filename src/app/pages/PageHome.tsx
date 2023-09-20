import { Renderer } from '../components/content-ui/Renderer.js'
import { useContentData } from '../lib/ContentDataProvider.js'

export const PageHome = () => {
    const contentData = useContentData()
    return <>
        <div className={'pt2 pb4'}>
            <Renderer/>
        </div>
        <pre><code style={{fontSize: '0.725rem'}}>{JSON.stringify(contentData || null, undefined, 4)}</code></pre>
    </>
}
