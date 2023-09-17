const unitsSi = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

/**
 * Convert bytes to a human-readable format
 */
export function toHumanSize(
    bytes: number,
    precision: number = 1,
    si: boolean = false,
    // natural-precision removes floating-points for natural numbers (1, 2, 3)
    naturalPrecision: boolean = false,
) {
    const threshold = si ? 1000 : 1024
    const u = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(threshold))
    const f = (bytes / Math.pow(threshold, u)).toFixed(precision)
    return (naturalPrecision ? Number(f) : f) + ' ' + (si ? unitsSi : units)[u]
}
