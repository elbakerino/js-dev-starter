import React from 'react'


const ContentDataContext = React.createContext<any>(undefined)

export const useContentData = (): any => React.useContext(ContentDataContext)

export interface ContentDataProviderProps {
    route?: string
    initialContentData?: any
}

export const ContentDataProvider: React.ComponentType<React.PropsWithChildren<ContentDataProviderProps>> = (
    {children, route, initialContentData},
) => {
    const [contentData, setContentData] = React.useState<any>(initialContentData)

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

    return <ContentDataContext.Provider value={contentData}>
        {children}
        {/* todo: to not have rehydration errors, this must be rendered in both environments, find better ways */}
        <script type={'application/json'} data-bind="content-data" dangerouslySetInnerHTML={{__html: JSON.stringify(contentData)}}/>
    </ContentDataContext.Provider>
}


export interface StaticContentDataProviderProps {
    contentData: any
}

export const StaticContentDataProvider: React.ComponentType<React.PropsWithChildren<StaticContentDataProviderProps>> = (
    {children, contentData},
) => {
    return <ContentDataContext.Provider value={contentData}>
        {children}
        <script type={'application/json'} data-bind="content-data" dangerouslySetInnerHTML={{__html: JSON.stringify(contentData)}}/>
    </ContentDataContext.Provider>
}
