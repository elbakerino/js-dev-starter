import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({children, ...props}) => {
    return <button
        {...props}
        className={'btn ' + (props.className || '')}
    >{children}</button>
}
