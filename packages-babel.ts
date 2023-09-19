import rimraf from 'rimraf'
import {spawn} from 'cross-spawn'
import {packages} from './packages.js'

const args = process.argv.slice(2)
const doWatch = args.includes('--watch') || args.includes('-w')
const doClean = args.includes('--clean')

const babels = packages.map(async (pkg) => {
    if(doClean) {
        await new Promise<void>((resolve, reject) =>
            rimraf(pkg.out, {}, (err) => {
                if(err) {
                    reject(err)
                    return
                }
                // eslint-disable-next-line no-undef
                console.log(`[${pkg.name} | clean] Deleted ${pkg.out}`)
                resolve()
            }),
        )
        return
    }
    const pkgArgs = [
        pkg.src,
        '-d', pkg.out,
        '--extensions', pkg.extensions,
        ...pkg.copyFiles ? ['--copy-files'] : [],
        ...doWatch ? ['-w'] : [],
    ]
    return new Promise<void>((resolve, reject) => {
        const babel = spawn('node_modules/.bin/babel', pkgArgs)
        babel.stdout.on('data', (data) => {
            process.stdout.write(`[${pkg.name} | babel] ${data}`)
        })
        babel.stderr.on('data', (data) => {
            process.stderr.write(`[${pkg.name} | babel] ERROR: ${data}`)
        })
        babel.on('exit', code => {
            if(doWatch) {
                if(code !== 0) {
                    // eslint-disable-next-line no-undef
                    console.error(`[${pkg.name} | babel] transpilation failure: ${code}`)
                    return
                }
                return
            }
            if(code !== 0) {
                reject(`[${pkg.name} | babel] transpilation failed: ${code}`)
            } else {
                resolve()
            }
        })
    })
})

Promise.all(babels)
    .then(() => process.exit(0))
