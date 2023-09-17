import Printer from './Printer.js'

const getContent = (print?: boolean): HTMLElement[] => {
    const printContent = document.querySelector('[data-e2e="content"]')?.cloneNode(true) as HTMLElement
    Array.from(printContent?.querySelectorAll('.collapse.closed') || [])
        // @ts-ignore
        .forEach((collapsed: HTMLElement) => {
            collapsed.classList.remove('closed')
            collapsed.style.height = 'auto'
        })
    Array.from(printContent?.querySelectorAll(['.panel', '.skills--list--lvl'].join(', ')) || [])
        // @ts-ignore
        .forEach((withBg: HTMLElement) => {
            withBg.style.background = 'none'
            withBg.style.backgroundColor = 'transparent'
        })
    Array.from(printContent?.querySelectorAll('.sr-only') || [])
        // @ts-ignore
        .forEach((srOnly: HTMLElement) => {
            srOnly.classList.remove('sr-only')
        })
    if(!print) {
        Array.from(printContent?.querySelectorAll(['.skills--list--lvl'].join(', ')) || [])
            // @ts-ignore
            .forEach((withWhiteText: HTMLElement) => {
                withWhiteText.style.color = '#333333'
            })
    }
    return Array.from(printContent?.querySelectorAll('[data-export-crawl="on"]') || [])
}

export const bindPrint = (): void => {
    document.querySelector('[data-print="min"]')?.addEventListener('click', () => {
        const print = new Printer(() => getContent(true))

        print.title = 'Michael Becker - Lebenslauf'
        print.print()
        window.gtag('event', 'click_print', {
            'document': print.title,
        })
    })
}

export const bindExport = (): void => {
    document.querySelector('[data-export="min"]')?.addEventListener('click', () => {
        const print = new Printer(getContent)
        print.title = 'Michael Becker - Lebenslauf'
        print.exportDoc('Michael-Becker_Lebenslauf')
        window.gtag('event', 'click_export', {
            'document': print.title,
        })
    })
}
