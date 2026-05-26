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
        src:     '/logo.jpeg',
        sizes:   '192x192',
        type:    'image/jpeg',
        purpose: 'any',
      },
      {
        src:     '/logo.jpeg',
        sizes:   '512x512',
        type:    'image/jpeg',
        purpose: 'any',
      },
    ],
  };
}
