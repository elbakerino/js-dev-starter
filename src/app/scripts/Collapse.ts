export const collapse = (toggles: HTMLElement[]): () => void => {
    const unsub = toggles.map((node) => {
        const handleToggle = (target: HTMLElement) => {
            const nextSibling = target.nextElementSibling as HTMLElement | undefined
            if(!nextSibling) return
            if(nextSibling.classList.contains('closed')) {
                if(nextSibling.style.height !== '0') {
                    nextSibling.style.height = '0'
                }
                nextSibling.classList.remove('closed')
                nextSibling.style.height = nextSibling.scrollHeight + 'px'
            } else {
                nextSibling.classList.add('closed')
                nextSibling.style.height = '0'
            }
        }
        const onClick = (e: MouseEvent) => {
            handleToggle(e.target as HTMLElement)
        }
        const onKeyPress = (e: KeyboardEvent) => {
            if(e.key === 'Enter') {
                handleToggle(e.target as HTMLElement)
            }
        }
        node.addEventListener('click', onClick)
        node.addEventListener('keypress', onKeyPress)
        return () => {
            node.removeEventListener('click', onClick)
            node.removeEventListener('keypress', onKeyPress)
        }
    })
    const onResize = () => {
        toggles.forEach((toggle) => {
            const nextSibling = toggle.nextElementSibling as HTMLElement | undefined
            if(!nextSibling) return
            if(!nextSibling.classList.contains('closed')) {
                nextSibling.style.height = nextSibling.scrollHeight + 'px'
            }
        })
    }
    window.addEventListener('resize', onResize)
    return () => {
        unsub.forEach(u => u())
        window.removeEventListener('resize', onResize)
    }
}
