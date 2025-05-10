import { Component } from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 2rem;
  background-color: var(--light-navy);
  border-radius: var(--border-radius);
  text-align: center;

  h2 {
    color: var(--green);
    margin-bottom: 1rem;
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background-color: var(--navy);
    border-radius: var(--border-radius);
    overflow-x: auto;
    color: var(--slate);
  }

  button {
    padding: 0.75rem 1rem;
    border: 1px solid var(--green);
    border-radius: var(--border-radius);
    background-color: transparent;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      background-color: var(--light-green);
    }
  }
`

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Something went wrong</h2>
          <p>An error occurred while rendering this component.</p>
          {this.state.error && (
            <pre>{this.state.error.toString()}</pre>
          )}
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary