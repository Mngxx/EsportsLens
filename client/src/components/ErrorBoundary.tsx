import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

// Catches render-time exceptions — distinct from each page's loading/error
// hook state, which only covers fetch failures, not render bugs.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Uncaught render error:", error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
                    <p className="text-sm font-medium text-zinc-100">
                        Something went wrong rendering this page.
                    </p>
                    <p className="text-xs text-zinc-500">
                        {this.state.error.message}
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ error: null })}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
