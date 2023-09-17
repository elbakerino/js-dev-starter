/**
 * Executes the callback after the content has been loaded, e.g. after all scripts has been loaded
 *
 * - needed when execution is relying on all scripts loaded (e.g. from CDNs)
 * - especially with `async` loaded scripts
 * - not when scripts are loaded with `defer`
 */
export const onReady = (cb: () => void): void => {
    if(document.readyState !== 'loading') {
        cb()
    } else {
        document.addEventListener('DOMContentLoaded', cb)
    }
}
