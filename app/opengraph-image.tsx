import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const alt         = 'Guinée Makiti — La boutique en ligne numéro 1 en Guinée';
export const size        = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        {/* ── Corps principal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>

          {/* ── Colonne gauche ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px 64px',
            }}
          >
            {/* Badge marque */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  backgroundColor: '#E53935',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                }}
              >
                GM
              </div>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#888888',
                  letterSpacing: '3px',
                }}
              >
                GUINÉE MAKITI
              </span>
            </div>

            {/* Titre principal */}
            <div
              style={{
                fontSize: '58px',
                fontWeight: '800',
                color: '#111111',
                lineHeight: '1.1',
                marginBottom: '22px',
              }}
            >
              La boutique{'\n'}
              <span style={{ color: '#E53935' }}>en ligne #1</span>{'\n'}
              en Guinée
            </div>

            {/* Sous-titre */}
            <div
              style={{
                fontSize: '22px',
                color: '#666666',
                marginBottom: '36px',
              }}
            >
              Commandez facilement via WhatsApp
            </div>

            {/* WhatsApp pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                borderRadius: '50px',
                padding: '14px 28px',
                fontSize: '20px',
                fontWeight: '700',
                alignSelf: 'flex-start',
              }}
            >
              📱  Commander via WhatsApp
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div
            style={{
              width: '420px',
              backgroundColor: '#E53935',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Cercle décoratif haut */}
            <div
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
            {/* Cercle décoratif bas */}
            <div
              style={{
                position: 'absolute',
                bottom: '-70px',
                left: '-70px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            />

            {/* Icône panier */}
            <div style={{ fontSize: '110px', zIndex: 1 }}>🛒</div>

            {/* Étoiles */}
            <div style={{ fontSize: '30px', color: '#FBC02D', zIndex: 1 }}>
              ★★★★★
            </div>

            {/* Mention livraison */}
            <div
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: '500',
                zIndex: 1,
              }}
            >
              Livraison à Conakry
            </div>

            {/* Paiement à la livraison */}
            <div
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.65)',
                zIndex: 1,
              }}
            >
              Paiement à la livraison
            </div>
          </div>
        </div>

        {/* ── Bande drapeau guinéen ── */}
        <div style={{ display: 'flex', height: '14px' }}>
          <div style={{ flex: 1, backgroundColor: '#E53935' }} />
          <div style={{ flex: 1, backgroundColor: '#FBC02D' }} />
          <div style={{ flex: 1, backgroundColor: '#009944' }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
