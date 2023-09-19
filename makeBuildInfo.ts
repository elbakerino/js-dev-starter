import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = __dirname
const GIT_BRANCH = process.env.GIT_BRANCH

if(
    process.env.GIT_URL_CI_RUN ||
    process.env.GIT_URL_COMMIT ||
    process.env.GIT_CI_RUN ||
    process.env.GIT_COMMIT
) {
    const buildInfo = {
        GIT_BRANCH: GIT_BRANCH,
        GIT_URL_CI_RUN: process.env.GIT_URL_CI_RUN,
        GIT_URL_COMMIT: process.env.GIT_URL_COMMIT,
        GIT_CI_RUN: process.env.GIT_CI_RUN,
        GIT_COMMIT: process.env.GIT_COMMIT,
    }
    fs.writeFileSync(path.join(rootDir, 'build/build_info.json'), JSON.stringify(buildInfo))
}
