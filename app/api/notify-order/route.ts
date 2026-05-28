import { NextRequest, NextResponse } from 'next/server';
import type { OrderStatus } from '@/src/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente:   'Reçue',
  confirme:     'Confirmée',
  en_livraison: 'En cours de livraison',
  livre:        'Livrée',
  annule:       'Annulée',
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  en_attente:   'Votre commande a bien été reçue. Nous allons la confirmer très prochainement.',
  confirme:     'Bonne nouvelle ! Votre commande a été confirmée et est en cours de préparation.',
  en_livraison: 'Votre commande est en route ! Notre livreur se dirige vers vous.',
  livre:        'Votre commande a été livrée. Nous espérons que vous êtes satisfait(e) de votre achat.',
  annule:       'Votre commande a été annulée. Contactez-nous sur WhatsApp pour plus d\'informations.',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente:   '#FBC02D',
  confirme:     '#1565C0',
  en_livraison: '#E65100',
  livre:        '#009944',
  annule:       '#757575',
};

function emailHtml(order: {
  id: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  items: { product?: { name?: string }; quantity: number }[];
}): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const label   = STATUS_LABELS[order.status];
  const message = STATUS_MESSAGES[order.status];
  const color   = STATUS_COLORS[order.status];
  const itemsHtml = order.items
    .map((i) => `<li style="margin:4px 0;">${i.product?.name ?? 'Produit'} × ${i.quantity}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1C0A0A;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#fff;">
              Guinée <span style="color:#C8860A;">Makiti</span>
            </p>
          </td>
        </tr>
        <!-- Status badge -->
        <tr>
          <td style="padding:32px 32px 0;text-align:center;">
            <span style="display:inline-block;background:${color}22;color:${color};border-radius:100px;padding:8px 20px;font-size:14px;font-weight:bold;">
              Commande ${label}
            </span>
            <h1 style="margin:16px 0 8px;font-size:20px;color:#1C0A0A;">Commande #${shortId}</h1>
            <p style="margin:0;font-size:15px;color:#555;line-height:1.5;">${message}</p>
          </td>
        </tr>
        <!-- Order details -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:12px;padding:16px;">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Détail de la commande
                  </p>
                  <p style="margin:0 0 4px;font-size:14px;color:#333;">
                    <strong>Client :</strong> ${order.customer_name}
                  </p>
                  <ul style="margin:8px 0;padding-left:18px;font-size:14px;color:#333;">
                    ${itemsHtml}
                  </ul>
                  <p style="margin:12px 0 0;font-size:16px;font-weight:bold;color:#C8860A;">
                    Total : ${new Intl.NumberFormat('fr-GN').format(order.total)} GNF
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.shop'}/suivi-commande"
               style="display:inline-block;background:#C8860A;color:#fff;border-radius:12px;padding:14px 32px;font-size:14px;font-weight:bold;text-decoration:none;">
              Suivre ma commande
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              Guinée Makiti — Conakry, Guinée<br>
              Des questions ? Contactez-nous sur WhatsApp.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order, status } = body as {
      order: {
        id: string;
        customer_name: string;
        customer_email?: string;
        total: number;
        items: { product?: { name?: string }; quantity: number }[];
      };
      status: OrderStatus;
    };

    if (!order?.customer_email) {
      return NextResponse.json({ skipped: true, reason: 'no_email' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    `Guinée Makiti <noreply@guinee-makiti.shop>`,
        to:      [order.customer_email],
        subject: `Commande #${order.id.slice(0, 8).toUpperCase()} — ${STATUS_LABELS[status]}`,
        html:    emailHtml({ ...order, status }),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
