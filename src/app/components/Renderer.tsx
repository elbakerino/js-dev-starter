import React from 'react'
import { useContentContext, EditorSelection } from '@content-ui/react/useContent'
import { isLeafSelected } from '@content-ui/react/isLeafSelected'
import { ContentLeaf } from '@content-ui/react/ContentLeaf'

export interface RendererProps {
    editorSelection?: EditorSelection
    // handleTocClick?: LeafTocContextType['onClick']
}

export const Renderer = ({editorSelection}: RendererProps): React.ReactNode => {
    const {root} = useContentContext()
    const bodyNodes = root?.children?.filter(c => c.type !== 'footnoteDefinition')

    const startLine = editorSelection?.startLine
    const endLine = editorSelection?.endLine
    const length = bodyNodes?.length || 0
    return <>
        {length > 0 ?
            <>
                {bodyNodes?.map((child, i) =>
                    <ContentLeaf
                        key={i}
                        elem={child.type}
                        child={child}
                        selected={isLeafSelected(child.position, startLine, endLine)}
                        isFirst={i === 0}
                        isLast={i === length - 1}
                    />,
                )}
            </> :
            <p>{'-'}</p>}
    </>
}
