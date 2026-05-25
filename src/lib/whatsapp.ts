import { CartItem } from '@/src/types';
import { formatPrice } from './formatters';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';

export function generateWhatsAppLink(items: CartItem[], customerName?: string): string {
  const lines = items.map(({ product, quantity }) => {
    const unitPrice = product.promo_price ?? product.price;
    return `• ${product.name} x${quantity} — ${formatPrice(unitPrice * quantity)}`;
  });

  const total = items.reduce((sum, { product, quantity }) => {
    const unitPrice = product.promo_price ?? product.price;
    return sum + unitPrice * quantity;
  }, 0);

  const header = customerName
    ? ['🛒 *Nouvelle commande — Guinée Makiti*', `👤 ${customerName}`, '']
    : ['🛒 *Nouvelle commande — Guinée Makiti*', ''];

  const message = [
    ...header,
    ...lines,
    '',
    `*Total : ${formatPrice(total)}*`,
    '',
    'Merci de confirmer ma commande.',
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
