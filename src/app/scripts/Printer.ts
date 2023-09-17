export default class Printer {
    protected content: () => HTMLElement[]
    public title: string
    protected export_style: string

    constructor(content: () => HTMLElement[]) {
        this.content = content
        this.title = ''
        const typoHeading = '"Calibri Light",Helvetica Neue,sans-serif'
        const typo = 'Calibri,Roboto,Helvetica Neue,sans-serif'
        this.export_style = '* {background: none;}' +
            'html{font-size: 11pt;}' +
            'h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6 {font-family: ' + typoHeading + ';}' +
            'p,u,li,a {color: #333333;font-family: ' + typo + ';}' +
            'span,button {color: #333333;font-family: ' + typo + ';}' +
            'div {color: #333333;font-family: ' + typo + ';}' +
            'a, a * {color: #333333 !important; text-decoration: none !important;}' +
            'img {max-width: 150px !important; height: auto !important;}'
    }

    static getHead(): HTMLHeadElement {
        const head_txt = document.querySelector('head')?.innerHTML
        const head = document.createElement('head')
        // @ts-ignore
        head.innerHTML = head_txt
        head.querySelector('title')?.remove()
        return head
    }

    getContent(): string {
        let tmp_content = ''
        this.content().forEach((elem) => {
            if(elem) {
                tmp_content += elem.outerHTML
            }
        })
        return tmp_content
    }

    print(): void {
        const printWindow = window.open('', 'PRINT', 'height=500,width=800')

        printWindow?.document.write(
            '<html>' +
            ' <head>' +
            '  <title>' + this.title + '</title>' +
            Printer.getHead().innerHTML +
            ' </head>' +
            '<body>' +
            '<body class="body" lang="en"><div class="container--outer">',
        )

        printWindow?.document.write(this.getContent())
        printWindow?.document.write(
            '</div>' +
            '</body></html>')

        // IE >= 10
        printWindow?.document.close()
        printWindow?.focus()

        const print_n_close = () => {
            printWindow?.print()
            printWindow?.close()
        }
        // @ts-ignore
        if(printWindow?.readyState !== 'loading') {
            print_n_close()
        } else {
            printWindow?.addEventListener('DOMContentLoaded', print_n_close)
        }
    }

    /**
     * From: https://www.codexworld.com/export-html-to-word-doc-docx-using-javascript/
     */
    exportDoc(filename: string): void {
        /**
         * @type {HTMLElement}
         */
        const head = Printer.getHead()
        const styles = head.querySelector('link[rel="stylesheet"]')
        if(styles) {
            styles.remove()
        }

        const content = this.getContent()

        const html = '<html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:w=\'urn:schemas-microsoft-com:office:word\' xmlns=\'http://www.w3.org/TR/REC-html40\'><head>' +
            '<meta charset="utf-8">' +
            '<title>' + this.title + '</title>' +
            head.innerHTML +
            '<style>' + this.export_style + '</style>' +
            '</head><body>' +
            '<p style="margin-bottom: 4px"><a href="' + window.location.protocol + '//' + window.location.hostname + window.location.pathname + '">' +
            window.location.protocol + '//' + window.location.hostname + window.location.pathname +
            '</a></p>' +
            content +
            '</body></html>'

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword',
        })

        // Specify link url
        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html)

        // Specify file name
        filename = filename ? filename + '.doc' : 'document.doc'

        // Create download link element
        const downloadLink = document.createElement('a')

        document.body.appendChild(downloadLink)

        // @ts-ignore
        if(navigator.msSaveOrOpenBlob) {
            // @ts-ignore
            navigator.msSaveOrOpenBlob(blob, filename)
        } else {
            // Create a link to the file
            downloadLink.href = url

            // Setting the file name
            downloadLink.download = filename

            //triggering the function
            downloadLink.click()
        }

        document.body.removeChild(downloadLink)
    }
}
