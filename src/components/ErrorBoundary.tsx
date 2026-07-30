import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  // compact: tam ekran çökme kartı yerine, sayfa içine gömülü küçük bir hata kartı gösterir
  // (ör. tek bir sekme çökse bile Header/Sidebar ve diğer sekmelere geçiş çalışmaya devam eder).
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// React hataları yalnızca sınıf (class) bileşenleriyle yakalanabilir; bir hook karşılığı yoktur.
// Herhangi bir sekmede beklenmedik bir render hatası olursa tüm uygulamanın boş bir ekrana
// düşmesini engeller ve kullanıcıya sayfayı yenileme imkânı sunar.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('DermIQ beklenmedik bir hata yakaladı:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.compact) {
      return (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-rose-500/25 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-white">Bu sekme yüklenirken bir sorun oluştu</p>
          <p className="text-xs text-neutral-500">Verilerin cihazında güvende. Başka bir modüle geçmeyi veya sayfayı yenilemeyi deneyebilirsin.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Bir şeyler ters gitti</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Beklenmedik bir hata oluştu. Verilerin cihazında güvende — sayfayı yenilemeyi dener misin?
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
}
