import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NyayaAI — Legal Clarity for Every Indian',
  description: 'AI-powered Indian legal document analysis in Tamil, Telugu, Kannada, Malayalam, Hindi & English. Free forever.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#e85d26',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@300;400;600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NyayaAI" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
