import React from 'react'
import { ContentLeafProps } from '@content-ui/react/ContentLeaf'
import { useLeafFollower } from '@content-ui/react/useLeafFollower'

export const LeafCode: React.FC<ContentLeafProps> = ({child, selected}) => {
    const code = child.type === 'code' ? child : undefined
    const cRef = useLeafFollower<HTMLDivElement>(selected)

    return <div style={{marginTop: 8, marginBottom: 16}} ref={cRef}>
        <pre><code
            data-lang={code?.lang || undefined}
        >{child.type === 'code' ? child.value : ''}</code></pre>
    </div>
}

export const LeafCodeInline: React.FC<ContentLeafProps> = ({child}) => {
    return <code
        style={{
            padding: '2px 4px',
            // fontFamily: typography?.fontFamilyCode,
            // fontSize: typography?.fontSizeCode,
            border: 0,
            backgroundColor: 'background.default',
            borderRadius: '4px',
            opacity: 0.8,
        }}
    >
        {child.type === 'inlineCode' ? child.value : null}
    </code>
}
