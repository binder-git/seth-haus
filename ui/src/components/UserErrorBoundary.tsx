import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UserErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('User Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="text-yellow-800 font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-yellow-600">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default UserErrorBoundary;
