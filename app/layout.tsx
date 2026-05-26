import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fredoka } from 'next/font/google';
import './globals.css';
import MainLayout from '@/src/components/layout/MainLayout';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Guinée Makiti — Votre marché en ligne',
    template: '%s — Guinée Makiti',
  },
  description: 'La boutique en ligne numéro 1 en Guinée. Commandez facilement via WhatsApp, livraison à Conakry.',
  keywords:    ['guinée', 'makiti', 'boutique en ligne', 'conakry', 'whatsapp', 'shopping'],
  authors:     [{ name: 'Guinée Makiti' }],
  creator:     'Guinée Makiti',
  openGraph: {
    type:        'website',
    locale:      'fr_GN',
    url:         SITE_URL,
    siteName:    'Guinée Makiti',
    title:       'Guinée Makiti — Votre marché en ligne',
    description: 'La boutique en ligne numéro 1 en Guinée. Commandez via WhatsApp.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Guinée Makiti' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Guinée Makiti',
    description: 'La boutique en ligne numéro 1 en Guinée.',
    images:      ['/opengraph-image'],
  },
  icons: {
    apple: [{ url: '/logo.jpeg' }],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${fredoka.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#E53935" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Makiti" />
      </head>
      <body className="min-h-full flex flex-col">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
