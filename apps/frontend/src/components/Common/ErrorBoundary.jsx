/**
 * ErrorBoundary
 * Catches React errors and displays friendly fallback UI
 */
import { Component } from "react";
import PropTypes from "prop-types";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === "development") {
            console.error("ErrorBoundary caught:", error, errorInfo);
        }

        // Could send to error tracking service here
        // reportError(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--error-light)] flex items-center justify-center">
                            <FiAlertTriangle className="w-10 h-10 text-[var(--error)]" />
                        </div>

                        {/* Error Message */}
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            {this.props.message ||
                                "We encountered an unexpected error. Please try again."}
                        </p>

                        {/* Error Details (development only) */}
                        {process.env.NODE_ENV === "development" &&
                            this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="text-sm text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-secondary)]">
                                        View error details
                                    </summary>
                                    <pre className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg text-xs text-[var(--error)] overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <FiHome className="w-4 h-4" />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    message: PropTypes.string,
};

export default ErrorBoundary;
