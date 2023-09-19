import { ContentLeafComponents, ContentLeafsNodeMapping } from '@content-ui/react/ContentLeaf'
import { LeafsRenderMapping } from '@tactic-ui/react/LeafsEngine'
import { LeafBr, LeafDelete, LeafEmphasis, LeafInsert, LeafMark, LeafStrong, LeafSub, LeafSuper, LeafText, LeafThematicBreak, LeafUnderline } from './HTMLLeafs.js'
import { LeafH, LeafP } from './LeafTypo.js'
import { LeafList, LeafListItem } from './LeafList.js'
import { LeafCode, LeafCodeInline } from './LeafCode.js'

const leafs: ContentLeafsNodeMapping = {
    break: LeafBr,
    thematicBreak: LeafThematicBreak,
    text: LeafText,
    emphasis: LeafEmphasis,
    strong: LeafStrong,
    underline: LeafUnderline,
    delete: LeafDelete,
    insert: LeafInsert,
    mark: LeafMark,
    sub: LeafSub,
    super: LeafSuper,
    heading: LeafH,
    paragraph: LeafP,
    // @ts-ignore
    html: null,
    // @ts-ignore
    image: null,
    // @ts-ignore
    link: null,
    code: LeafCode,
    yaml: LeafCode,
    inlineCode: LeafCodeInline,
    list: LeafList,
    listItem: LeafListItem,
    // @ts-ignore
    blockquote: null,
    // @ts-ignore
    footnote: null,
    // @ts-ignore
    footnoteDefinition: null,
    // @ts-ignore
    footnoteReference: null,
    // @ts-ignore
    table: null,
    // @ts-ignore
    tableRow: null,
    // @ts-ignore
    tableCell: null,
    // @ts-ignore
    tocListItem: null,
    // @ts-ignore
    defList: null,
    // @ts-ignore
    defListTerm: null,
    // @ts-ignore
    defListDescription: null,
    // @ts-ignore
    definition: null,
    // @ts-ignore
    imageReference: null,
    // @ts-ignore
    linkReference: null,
}

export const contentUIMapping: LeafsRenderMapping<ContentLeafsNodeMapping, ContentLeafComponents> = {
    leafs: leafs,
    // @ts-ignore
    components: {},
}

