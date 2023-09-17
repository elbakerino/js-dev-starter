const joinPath = (...segments: string[]) => {
    return segments.map((part, i) => {
        if(i === 0) {
            return part.trim().replace(/\/*$/g, '')
        } else {
            return part.trim().replace(/(^\/*|\/*$)/g, '')
        }
    }).filter(x => x.length).join('/')
}

export const routes = (basePath: string = '') => [
    {
        path: joinPath(basePath, 'about'),
        element: <div>About</div>,
    },
]
