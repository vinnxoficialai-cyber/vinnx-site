import React, { useEffect, useRef } from 'react';

interface SplineViewerProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SplineViewer({ url, className = '', style }: SplineViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the Spline Viewer Web Component script se ele não existir
    if (!document.querySelector('script[src*="@splinetool/viewer"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      // URL do unpkg para a build oficial do spline-viewer
      script.src = 'https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let observer: MutationObserver | undefined;
    let pollInterval: NodeJS.Timeout | undefined;

    // Função para buscar e remover o logo dentro do shadowRoot
    const hideWatermark = () => {
      const splineViewer = container.querySelector('spline-viewer');
      if (splineViewer && splineViewer.shadowRoot) {
        const logo = splineViewer.shadowRoot.querySelector('#logo');
        if (logo) {
          logo.remove();
          return true; // Sucesso
        }
      }
      return false; // Logo ainda não disponível
    };

    // Tenta esconder instantaneamente se já renderizou
    if (!hideWatermark()) {
      // Configura MutationObserver para vigiar a inserção no DOM (nem sempre pega alterações internas no shadow root)
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const success = hideWatermark();
            if (success) cleanup();
          }
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      // Polling de fallback (muitas vezes os elementos dentro do shadow root demoram a ser instanciados de forma assíncrona)
      pollInterval = setInterval(() => {
        const success = hideWatermark();
        if (success) cleanup();
      }, 100);
    }

    const cleanup = () => {
      if (observer) observer.disconnect();
      if (pollInterval) clearInterval(pollInterval);
    };

    return cleanup;
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={`spline-wrapper ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    >
      {/* @ts-ignore - 'spline-viewer' é um web component customizado, logo o TS pode reclamar das props */}
      <spline-viewer url={url} events-target="global" />
    </div>
  );
}

export default SplineViewer;
