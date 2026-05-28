import { NextRequest, NextResponse } from 'next/server';

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emailHtml(order: any): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemsHtml = (order.items ?? []).map((i: any) =>
    `<li style="margin:4px 0;">${i.product?.name ?? 'Produit'} × ${i.quantity}${i.variant ? ` (${i.variant})` : ''}</li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#1C0A0A;padding:24px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#fff;">
              Guinée <span style="color:#C8860A;">Makiti</span>
              <span style="float:right;font-size:13px;color:rgba(255,255,255,0.5);font-weight:normal;margin-top:4px;">Admin</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 0;">
            <div style="background:#C8860A22;border-left:4px solid #C8860A;padding:12px 16px;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:16px;font-weight:bold;color:#1C0A0A;">
                🛒 Nouvelle commande #${shortId}
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:12px;padding:16px;">
              <tr><td>
                <p style="margin:0 0 8px;font-size:14px;color:#333;"><strong>Client :</strong> ${order.customer_name}</p>
                <p style="margin:0 0 8px;font-size:14px;color:#333;"><strong>Téléphone :</strong> ${order.customer_phone}</p>
                ${order.notes ? `<p style="margin:0 0 8px;font-size:14px;color:#333;"><strong>Note :</strong> ${order.notes}</p>` : ''}
                <p style="margin:12px 0 8px;font-size:13px;font-weight:bold;color:#888;text-transform:uppercase;">Articles</p>
                <ul style="margin:0;padding-left:18px;font-size:14px;color:#333;">${itemsHtml}</ul>
                <p style="margin:16px 0 0;font-size:18px;font-weight:bold;color:#C8860A;">${fmtPrice(order.total)}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guinee-makiti.shop'}/admin/commandes"
               style="display:inline-block;background:#1C0A0A;color:#C8860A;border-radius:12px;padding:14px 32px;font-size:14px;font-weight:bold;text-decoration:none;border:1px solid #C8860A44;">
              Gérer les commandes
            </a>
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
    const order = await req.json();

    const apiKey    = process.env.RESEND_API_KEY;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'guineemakiti224@gmail.com';

    if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'Guinée Makiti <noreply@guinee-makiti.shop>',
        to:      [adminEmail],
        subject: `🛒 Nouvelle commande #${order.id.slice(0, 8).toUpperCase()} — ${order.customer_name}`,
        html:    emailHtml(order),
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
