import React, { ReactNode, ErrorInfo } from 'react'

type UserVariablesErrorBoundaryProps = {
  children?: ReactNode
  render: () => ReactNode
}

type UserVariablesErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

class UserVariablesErrorBoundary extends React.Component<
  UserVariablesErrorBoundaryProps,
  UserVariablesErrorBoundaryState
> {
  public state: UserVariablesErrorBoundaryState = {
    hasError: false,
  }

  constructor(props: UserVariablesErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  public static getDerivedStateFromError(error: Error): UserVariablesErrorBoundaryState {
    return { hasError: true, error }
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.render()
    }

    return this.props.children
  }
}

export default UserVariablesErrorBoundary
