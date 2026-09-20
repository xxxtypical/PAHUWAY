import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback; receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches render errors in a route subtree and offers a recovery path. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        data-ocid="error_state"
        role="alert"
        className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-subtle"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-lg font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this section. Try again, or head back to the
          home feed.
        </p>
        <Button
          type="button"
          onClick={this.reset}
          data-ocid="error_state.retry_button"
          className="rounded-full"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }
}
