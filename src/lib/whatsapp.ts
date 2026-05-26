import { CartItem } from '@/src/types';
import { formatPrice } from './formatters';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224XXXXXXXXX';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.com').replace(/\/$/, '');

function resolveImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return url;
}

export function generateWhatsAppLink(items: CartItem[], customerName?: string): string {
  const total = items.reduce((sum, { product, quantity }) => {
    return sum + (product.promo_price ?? product.price) * quantity;
  }, 0);

  const header = customerName
    ? ['Bonjour Guinée Makiti 👋', '', `👤 ${customerName}`, '', 'Je souhaite commander :']
    : ['Bonjour Guinée Makiti 👋', '', 'Je souhaite commander :'];

  const lines: string[] = [];
  for (const { product, quantity } of items) {
    const unitPrice = product.promo_price ?? product.price;
    const imageUrl  = resolveImageUrl(product.images?.[0] ?? product.image_url ?? undefined);
    lines.push(`🛍️ *${product.name}* x${quantity}`);
    lines.push(`💰 Prix : ${formatPrice(unitPrice * quantity)} GNF`);
    if (imageUrl) {
      lines.push('');
      lines.push(`🖼️ ${imageUrl}`);
    }
    lines.push('');
  }

  const message = [
    ...header,
    '',
    ...lines,
    `💳 *Total : ${formatPrice(total)} GNF*`,
    '',
    'Merci de confirmer ma commande.',
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
