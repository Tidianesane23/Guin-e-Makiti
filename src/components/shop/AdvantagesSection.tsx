import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTruck, faHeadphones, faFacebook, faTiktok, faWhatsapp } from '@/src/lib/icons';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

export default function AdvantagesSection() {
  return (
    <div className="flex flex-col sm:flex-row">
      <div className="flex-1 flex items-center justify-center gap-2 bg-rouge px-4 py-4 sm:h-[60px]">
        <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: 18, color: '#fff', flexShrink: 0 }} />
        <span className="text-white font-bold uppercase text-xs sm:text-sm tracking-wide text-center">
          ACHETEZ FACILEMENT EN LIGNE
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 bg-jaune px-4 py-4 sm:h-[60px]">
        <FontAwesomeIcon icon={faTruck} style={{ fontSize: 18, color: '#fff', flexShrink: 0 }} />
        <span className="text-white font-bold uppercase text-xs sm:text-sm tracking-wide text-center">
          NOUS LIVRONS POUR VOUS
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 bg-vert px-4 py-4 sm:h-[60px]">
        <FontAwesomeIcon icon={faHeadphones} style={{ fontSize: 18, color: '#fff', flexShrink: 0 }} />
        <span className="text-white font-bold uppercase text-xs sm:text-sm tracking-wide text-center">
          SUPPORT CLIENT À VOTRE ÉCOUTE
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-5 bg-noir px-4 py-4 sm:h-[60px]">
        <a href="https://facebook.com/guineemakiti" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
          <FontAwesomeIcon icon={faFacebook} style={{ fontSize: 20 }} />
        </a>
        <a href="https://tiktok.com/@guineemakiti" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/70 hover:text-white transition-colors">
          <FontAwesomeIcon icon={faTiktok} style={{ fontSize: 20 }} />
        </a>
        <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/70 hover:text-white transition-colors">
          <FontAwesomeIcon icon={faWhatsapp} style={{ fontSize: 20 }} />
        </a>
      </div>
    </div>
  );
}
