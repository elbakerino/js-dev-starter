import React from 'react'
import { ContentLeafProps } from '@content-ui/react/ContentLeaf'
import { BaseLeafContent } from './BaseLeafContent.js'
import { Typography } from './LeafTypo.js'

export const LeafList: React.FC<ContentLeafProps<'list'>> = ({child}) => {
    const Component = child.type === 'list' && child.ordered ? 'ol' : 'ul'
    const dense = 'dense' in child && child.dense
    const inList = 'inList' in child && child.inList
    return <Component
        style={{
            marginLeft: 4,
            marginTop: dense || inList ? 4 : 12,
            marginBottom: dense || inList ? 4 : 16,
            paddingLeft: inList ? 12 : 21,
            outline: 0, border: 0,
        }}
    >
        {child.type === 'list' ? <BaseLeafContent child={child}/> : null}
    </Component>
}

export const LeafListItem: React.FC<ContentLeafProps> = ({child}) => {
    const listItemContent = child.type === 'listItem' ?
        <BaseLeafContent child={{...child, children: child.children.filter(c => c.type !== 'list')}}/> : null
    return <Typography
        component={'li'}
        style={{
            padding: '0 4px',
            listStyleType: child.type === 'listItem' && typeof child.checked === 'boolean' ? 'none' : undefined,
        }}
    >
        {child.type === 'listItem' && typeof child.checked === 'boolean' ?
            <div style={{display: 'flex', alignItems: 'center', marginLeft: -28}}>
                {child.checked ?
                    <pre>[X]</pre> :
                    <pre>[ ]</pre>}
                <div style={{flexGrow: 1, marginLeft: 1}}>
                    {listItemContent}
                </div>
            </div> :
            listItemContent}

        {child.type === 'listItem' ?
            <BaseLeafContent<{ selected?: boolean }>
                child={{
                    ...child,
                    children: child.children
                        .filter(c => c.type === 'list')
                        .map(c => ({
                            ...c,
                            inList: true,
                        })),
                }}
            /> : null}
    </Typography>
}
