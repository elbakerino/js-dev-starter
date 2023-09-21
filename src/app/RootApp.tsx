import React from 'react'

export interface RootAppProps {
    meta?: { lang?: string, title?: string }
    styles: { href: string }[]
}

export default function RootApp({children, ...props}: React.PropsWithChildren<RootAppProps>) {
    const {styles, meta: metaData} = props
    return (
        /* @formatter:off */
        <html lang={metaData?.lang || 'en'}>
            <head>
                {/* @formatter:on */}
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>{metaData?.title}</title>
                {styles.map((styleSheet, i) =>
                    <link key={i} href={styleSheet.href} rel="stylesheet" type="text/css"/>,
                )}
                {/* @formatter:off */}
            </head>
            <body className={'bg-body'}>
                {children}
            </body>
        </html>
        /* @formatter:on */
    )
}
