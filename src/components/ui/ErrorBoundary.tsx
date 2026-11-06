import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="recovery">
          <p className="eyebrow">LET’S TRY THAT AGAIN</p>
          <h1>Something went wrong.</h1>
          <p>Your table is still here. Reload to get back to it.</p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      );
    return this.props.children;
  }
}
