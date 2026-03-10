'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
    
    // Automatically reload the page if we hit a ChunkLoadError or fetch error for chunks
    if (
      error?.name === 'ChunkLoadError' || 
      error?.message?.includes('Loading chunk') || 
      error?.message?.includes('fetch')
    ) {
      // Small timeout to prevent infinite reload loops if the server is permanently down
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: 400,
              textAlign: 'center',
              padding: 24,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ color: '#c62828', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>
              The app hit an error. Try refreshing the page.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 20px',
                fontSize: 16,
                cursor: 'pointer',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
