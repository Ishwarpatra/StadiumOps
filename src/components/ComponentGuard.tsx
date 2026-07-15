import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ComponentGuard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    // Log diagnostics
    console.warn(`[ComponentGuard] Captured diagnostics in ${this.props.moduleName || 'Component'}:`, error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  toggleDetails = (): void => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentLabel = this.props.moduleName || 'this module';

      return (
        <div id="guard-container" className="p-6 bg-rose-50/50 border border-rose-100 rounded-3xl shadow-sm max-w-full my-4">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  Temporary issue detected in {componentLabel}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  An unexpected issue occurred during rendering. Other parts of the StadiumOps Pro console remain active and safe.
                </p>
              </div>

              {this.state.error && (
                <div className="space-y-2">
                  <button
                    id="guard-details-toggle"
                    type="button"
                    onClick={this.toggleDetails}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 cursor-pointer select-none"
                  >
                    {this.state.showDetails ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <span>Technical Details</span>
                  </button>

                  {this.state.showDetails && (
                    <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] overflow-auto max-h-48 shadow-inner leading-relaxed">
                      <p className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <pre className="text-slate-400 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-1">
                <button
                  id="guard-reset-button"
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Component</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
