import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Guinée Makiti',
    short_name:       'Makiti',
    description:      'La boutique en ligne numéro 1 en Guinée. Commandez via WhatsApp, livraison à Conakry.',
    start_url:        '/',
    display:          'standalone',
    orientation:      'portrait',
    background_color: '#FFFFFF',
    theme_color:      '#E53935',
    categories:       ['shopping', 'lifestyle'],
    lang:             'fr',
    icons: [
      {
        src:     '/icons/icon-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-maskable-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icons/icon-maskable-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icons/icon.svg',
        sizes:   'any',
        type:    'image/svg+xml',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src:          '/screenshots/home.png',
        sizes:        '1080x1920',
        type:         'image/png',
        // @ts-expect-error — form_factor is valid in the spec but not yet in TS types
        form_factor:  'narrow',
        label:        'Page d\'accueil Guinée Makiti',
      },
    ],
  };
}
