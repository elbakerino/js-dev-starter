import React from 'react'

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{ fallback: React.ReactNode }>> {
    state: { hasError?: boolean }

    constructor(props) {
        super(props)
        this.state = {hasError: false}
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getDerivedStateFromError(_error) {
        return {hasError: true}
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo)
    }

    render() {
        if(this.state.hasError) {
            return this.props.fallback
        }

        return this.props.children
    }
}
