import { ContentParser } from '@content-ui/md/parser/ContentParser'
import { parseTo } from '@content-ui/md/parser/ParseTo'
import { ContentFileProvider } from '@content-ui/react/ContentFileProvider'
import { ContentFileContextType } from '@content-ui/react/useContent'
import React from 'react'


const ContentDataContext = React.createContext<any>(undefined)

export const useContentData = (): any => React.useContext(ContentDataContext)

export interface ContentDataProviderProps {
    route?: string
    initialContentData?: StaticContentDataProviderProps['contentData']
    initialAst?: ContentFileContextType
}

export const ContentDataProvider: React.ComponentType<React.PropsWithChildren<ContentDataProviderProps>> = (
    {children, route, initialContentData, initialAst},
) => {
    const [contentData, setContentData] = React.useState<any>(initialContentData)
    const [ast, setAst] = React.useState<any>(initialAst)

    React.useEffect(() => {
        if(!route) return
        fetch(route + '.json', {method: 'get'})
            .then((value) => {
                return value.json()
                    .then((data) => ({
                        data: data,
                        status: value.status,
                    }))
                    .then(result => {
                        result.status !== 200 ? Promise.reject(result) : result
                    })
            })
            .then(result => {
                setContentData(result)
            })
    })
    React.useEffect(() => {
        if(!contentData?.content) return
        parseTo(contentData.content, ContentParser)
            .then((nextAst) => {
                setAst(nextAst)
            })
    }, [])

    return <ContentDataContext.Provider value={contentData}>
        <ContentFileProvider
            root={ast?.root}
            file={ast?.file}
        >
            {children}
        </ContentFileProvider>
        {/* todo: to not have rehydration errors, this must be rendered in both environments, find better ways */}
        <script type={'application/json'} data-bind="content-data" dangerouslySetInnerHTML={{__html: JSON.stringify(contentData)}}/>
        <script type={'application/json'} data-bind="content-ast" dangerouslySetInnerHTML={{__html: JSON.stringify(initialAst)}}/>
    </ContentDataContext.Provider>
}


export interface StaticContentDataProviderProps {
    contentData: { content: string, content_type: string }
}

export const StaticContentDataProvider: React.ComponentType<React.PropsWithChildren<StaticContentDataProviderProps & ContentFileContextType>> = (
    {children, contentData, file, root},
) => {
    return <ContentDataContext.Provider value={contentData}>
        <ContentFileProvider
            root={root}
            file={file}
        >
            {children}
        </ContentFileProvider>
        <script type={'application/json'} data-bind="content-data" dangerouslySetInnerHTML={{__html: JSON.stringify(contentData)}}/>
        <script type={'application/json'} data-bind="content-ast" dangerouslySetInnerHTML={{__html: JSON.stringify({file, root})}}/>
    </ContentDataContext.Provider>
}
