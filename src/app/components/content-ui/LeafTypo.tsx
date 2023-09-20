import React from 'react'
import { Parent } from 'mdast'
import { useSettings } from '@content-ui/react/LeafSettings'
import { ContentLeafProps } from '@content-ui/react/ContentLeaf'
import { useLeafFollower } from '@content-ui/react/useLeafFollower'
import { copyToClipBoard } from '@content-ui/react/Utils/copyToClipboard'
import { flattenText } from '@content-ui/md/flattenText'
import { textToId } from '@content-ui/md/textToId'
import { WithMdAstChild } from '@content-ui/md/Ast'
import { BaseLeafContent } from './BaseLeafContent.js'

export const Typography = React.forwardRef(function Typography(
    {
        component, title,
        children,
        ...props
    }: React.PropsWithChildren<React.HTMLProps<typeof component | 'p'> & {
        component?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li'
        title?: string
        id?: string
        style?: React.CSSProperties
    }>,
    ref,
) {
    const Comp = component || 'p'
    // @ts-ignore
    return <Comp style={{margin: '0 0 0.125em 0'}} title={title} {...props} ref={ref}>
        {children}
    </Comp>
})

export const LeafP: React.FC<ContentLeafProps & WithMdAstChild & { selected?: boolean, dense?: boolean }> = ({child, selected, dense, isLast}) => {
    const pRef = useLeafFollower<HTMLParagraphElement>(selected)
    return <Typography
        className={dense ? 'body2' : 'body1'}
        component={'p'} ref={pRef}
        style={{
            backgroundColor: selected ? 'rgba(206, 230, 228, 0.31)' : undefined,
            boxShadow: selected ? '-8px 0px 0px 0px rgba(206, 230, 228, 0.31)' : undefined,
            marginBottom: isLast ? 0 : undefined,
        }}
    >
        {child.type === 'paragraph' ? <BaseLeafContent child={child}/> : null}
    </Typography>
}

export const LeafH: React.FC<ContentLeafProps & WithMdAstChild & { selected?: boolean }> = ({child, selected, isFirst, isLast}) => {
    const {
        headlineLinkable,
        headlineSelectable, headlineSelectableOnHover,
        headlineOffset,
        // todo: with the tui@0.0.3 it is injected in the renderer and thus should be moved to props
    } = useSettings()
    const hRef = useLeafFollower<HTMLHeadingElement>(selected)
    const [copied, setCopied] = React.useState(false)
    const [showCopy, setShowCopy] = React.useState(false)
    const timer = React.useRef<number | undefined>(undefined)
    const c = child.type === 'heading' ? child : undefined
    const id = c ? textToId(flattenText(c as Parent).join('')) : undefined

    React.useEffect(() => {
        return () => window.clearTimeout(timer.current)
    }, [timer, id])

    const handleCopy = () => {
        window.clearTimeout(timer.current)
        copyToClipBoard(window.location.toString().split('#')[0] + '#' + id)
            .then((hasCopied) => {
                setCopied(hasCopied)
                if(hasCopied) {
                    timer.current = window.setTimeout(() => {
                        setCopied(false)
                    }, 2400)
                }
            })
    }

    const depth = child.type === 'heading' ? child.depth : 1

    const btnCopy = headlineLinkable && headlineSelectable && typeof id === 'string' ?
        <span
            aria-hidden="true"
            tabIndex={0}
            onFocus={() => setShowCopy(true)}
            onBlur={() => setShowCopy(false)}
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.ctrlKey) {
                    handleCopy()
                }
            }}
            onClick={handleCopy}
            style={{
                cursor: 'pointer',
                display: 'inline-flex',
                opacity: copied ? 1 : showCopy ? 0.875 : headlineLinkable && headlineSelectable && headlineSelectableOnHover ? 0 : 0.425,
                transition: '0.46ms ease-out opacity',
                outline: 0,
                verticalAlign: 'top',
            }}
            // sx={{
            //     backgroundColor: 'background.paper',
            //     ml: '-19px',
            //     mr: 0,
            //     mt: 'auto',
            //     mb: 'auto',
            //     py: 0.5,
            //     px: 0,
            //     borderWidth: 1,
            //     borderStyle: 'solid',
            //     borderColor: 'divider',
            //     borderRadius: '6px',
            // }}
        >
            {/*<IcLink*/}
            {/*    fontSize={'inherit'} color={copied ? 'primary' : 'secondary'}*/}
            {/*    style={{*/}
            {/*        transform: 'rotate(-45deg)',*/}
            {/*        transition: '0.0865s ease-out color',*/}
            {/*        fontSize: '1rem',*/}
            {/*    }}*/}
            {/*/>*/}
        </span> : null
    return <Typography
        component={('h' + Math.max(depth + (headlineOffset || 0), 6)) as any}
        id={headlineLinkable ? id : undefined} ref={hRef}
        // gutterBottom
        onMouseEnter={headlineLinkable && headlineSelectable ? () => setShowCopy(true) : undefined}
        onMouseLeave={headlineLinkable && headlineSelectable ? () => setShowCopy(false) : undefined}
        style={{
            marginTop: isFirst ? undefined : '0.3625em',
            marginBottom: isLast ? undefined : '0.67215em',
            backgroundColor: selected ? 'rgba(206, 230, 228, 0.31)' : undefined,
            boxShadow: selected ? '-8px 0px 0px 0px rgba(206, 230, 228, 0.31)' : undefined,
        }}
    >
        {btnCopy}
        {c ? <span><BaseLeafContent child={c}/></span> : null}
    </Typography>
}
