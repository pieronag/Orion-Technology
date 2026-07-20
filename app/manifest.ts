import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orion Technology - Admin',
    short_name: 'Orion Admin',
    description: 'Sistema de Gestión de Propuestas',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    icons: [
      { src: '/logo_white.png', sizes: '192x192', type: 'image/png' },
    ],
  };
}
