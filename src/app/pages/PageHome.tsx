import { useContentData } from '../lib/ContentDataProvider.js'

export const PageHome = () => {
    const contentData = useContentData()
    return <pre><code>{JSON.stringify(contentData || null, undefined, 4)}</code></pre>
}
