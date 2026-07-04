import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import TabaskiBanner from './TabaskiBanner';
import AdminFloatingBar from './AdminFloatingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCreditCard, faShieldAlt } from '@/src/lib/icons';

const BAR_ITEMS = [
  { icon: faTruck,      text: 'Livraison Conakry' },
  { icon: faCreditCard, text: 'Paiement livraison' },
  { icon: faShieldAlt,  text: 'Qualité garantie'  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      {/* Zone sous le header fixe (pt compense h-14 md:h-16) */}
      <div className="pt-14 md:pt-16">
        <TabaskiBanner />
      </div>

      {/* Barre info statique */}
      <div
        className="flex items-center justify-center flex-wrap w-full overflow-hidden"
        style={{
          background:   'rgba(200,134,10,0.06)',
          borderBottom: '1px solid rgba(200,134,10,0.1)',
          padding:      '8px 16px',
        }}
      >
        {BAR_ITEMS.map(({ icon, text }, i) => (
          <span key={text} className="flex items-center">
            <span className="flex items-center gap-1.5 px-3">
              <FontAwesomeIcon icon={icon} style={{ fontSize: 11, color: '#C8860A' }} />
              <span style={{ fontSize: 11, color: '#7A4A3A', fontWeight: 500 }}>{text}</span>
            </span>
            {i < BAR_ITEMS.length - 1 && (
              <span
                style={{
                  width:      1,
                  height:     12,
                  background: 'rgba(200,134,10,0.3)',
                  display:    'inline-block',
                }}
              />
            )}
          </span>
        ))}
      </div>

      <main className="flex-1 w-full overflow-hidden">{children}</main>
      <WhatsAppButton />
      <AdminFloatingBar />
      <Footer />
    </>
  );
}
