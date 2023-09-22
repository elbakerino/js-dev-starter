import React from 'react'

export interface ButtonProps {
    variant?: 'text' | 'outlined' | 'standard'
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

export function Button(
    {
        children,
        variant, color, size,
        ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps,
) {
    return <button
        {...props}
        className={[
            'btn',
            props.className,
            color ? `btn-${color}` + (variant === 'outlined' ? '-o' : '') + (variant === 'text' ? '-text' : '') : undefined,
            !color ? `btn` + (variant === 'outlined' ? '-o' : '') + (variant === 'text' ? '-text' : '') : undefined,
            size ? `btn-${size}` : undefined,
        ].filter(c => typeof c === 'string').join(' ')}
    >{children}</button>
}
