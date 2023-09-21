import { Writable } from 'stream'

export class HtmlWritable extends Writable {
    chunks: any[] = []
    html = ''

    getHtml() {
        return this.html
    }

    _write(chunk, _encoding, callback) {
        this.chunks.push(chunk)
        callback()
    }

    _final(callback) {
        this.html = Buffer.concat(this.chunks).toString()
        callback()
    }
}


