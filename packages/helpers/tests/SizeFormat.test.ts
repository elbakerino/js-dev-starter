import { it, expect, describe } from '@jest/globals'
import { toHumanSize } from '@app/helpers/SizeFormat'

describe('SizeFormat', () => {
    it('toHumanSize', () => {
        expect(toHumanSize(1024)).toBe('1.0 KiB')
    })
    it('toHumanSize.si', () => {
        expect(toHumanSize(1000, 1, true)).toBe('1.0 kB')
    })
    it('toHumanSize.si uneven', () => {
        expect(toHumanSize(1024, 3, true)).toBe('1.024 kB')
    })
})
