import React from 'react'

export const Button: React.FC<React.HTMLAttributes<HTMLButtonElement>> = ({children, ...props}) => {
    return <button
        {...props}
        className={'button ' + (props.className || '')}
    >{children}</button>
}
