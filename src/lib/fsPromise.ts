import util from 'util'
import fsCb from 'fs'

export const stat = util.promisify(fsCb.stat)
export const readdir = util.promisify(fsCb.readdir)
export const mkdir = util.promisify(fsCb.mkdir)
export const unlink = util.promisify(fsCb.unlink)
export const copyFile = util.promisify(fsCb.copyFile)
export const readFile = util.promisify(fsCb.readFile)
export const writeFile = util.promisify(fsCb.writeFile)
export const lstat = util.promisify(fsCb.lstat)
export const readlink = util.promisify(fsCb.readlink)
export const symlink = util.promisify(fsCb.symlink)

export const fs = {
    stat,
    readdir, mkdir,
    readFile, copyFile, writeFile,
    unlink,
    lstat, readlink, symlink,
}
