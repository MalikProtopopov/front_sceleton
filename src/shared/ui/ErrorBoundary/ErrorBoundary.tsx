"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center p-8">
          <div className="max-w-md text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[var(--color-warning)]" />
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Что-то пошло не так
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mb-4 max-h-32 overflow-auto rounded bg-[var(--color-bg-tertiary)] p-3 text-left text-xs text-[var(--color-error)]">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-primary-hover)]"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
