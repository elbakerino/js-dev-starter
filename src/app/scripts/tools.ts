import { collapse } from './Collapse.js'
import { bindExport, bindPrint } from './PrintAndExport.js'
import { onReady } from './onReady.js'

declare global {
    interface Window {
        dataLayer: any[]
        gtag: (...args: [string, string, object]) => void
    }
}

onReady(() => {
    collapse(
        Array.from(document.querySelectorAll('[data-toggle]')),
    )
    bindPrint()
    bindExport()
})
