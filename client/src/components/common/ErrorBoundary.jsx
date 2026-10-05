import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import EmptyState from './EmptyState';
import Button from './Button';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        message="An unexpected error occurred. Reloading the page usually fixes it."
        action={<Button onClick={() => window.location.reload()}>Reload page</Button>}
      />
    );
  }
}
