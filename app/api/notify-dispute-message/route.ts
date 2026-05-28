import { NextRequest, NextResponse } from 'next/server';

function emailHtml(params: {
  senderLabel: string;
  recipientName: string;
  orderRef: string;
  content?: string;
  fileName?: string;
  siteUrl: string;
  isAdmin: boolean;
}): string {
  const { senderLabel, orderRef, content, fileName, siteUrl, isAdmin } = params;
  const accentColor = '#C8860A';
  const link = isAdmin
    ? `${siteUrl}/admin/commandes`
    : `${siteUrl}/suivi-commande`;
  const linkLabel = isAdmin ? 'Voir dans l\'admin' : 'Voir ma commande';

  const messageHtml = content
    ? `<p style="margin:0;font-size:14px;color:#333;line-height:1.6;">${content}</p>`
    : `<p style="margin:0;font-size:14px;color:#888;font-style:italic;">📎 ${fileName ?? 'Fichier joint'}</p>`;

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:520px;width:100%;">
        <tr>
          <td style="background:#1C0A0A;padding:22px 28px;">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#fff;">
              Guinée <span style="color:${accentColor};">Makiti</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px 0;">
            <div style="background:${accentColor}18;border-left:4px solid ${accentColor};padding:12px 14px;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:15px;font-weight:bold;color:#1C0A0A;">
                💬 Nouveau message — litige #${orderRef}
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:#666;">${senderLabel} a envoyé un message.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;">
              ${messageHtml}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px;text-align:center;">
            <a href="${link}"
               style="display:inline-block;background:#1C0A0A;color:${accentColor};border-radius:12px;padding:13px 28px;font-size:14px;font-weight:bold;text-decoration:none;border:1px solid ${accentColor}44;">
              ${linkLabel}
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f5f5;padding:14px 28px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;">Guinée Makiti — Conakry, Guinée</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const {
      sender,
      orderRef,
      content,
      fileName,
      customerEmail,
      customerName,
    } = await req.json() as {
      sender: 'client' | 'admin';
      orderRef: string;
      content?: string;
      fileName?: string;
      customerEmail?: string;
      customerName?: string;
    };

    const apiKey     = process.env.RESEND_API_KEY;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'guineemakiti224@gmail.com';
    const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL    ?? 'https://guinee-makiti.shop';

    if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

    const sendEmail = async (to: string, subject: string, html: string) => {
      const res = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Guinée Makiti <noreply@guinee-makiti.shop>', to: [to], subject, html }),
      });
      if (!res.ok) console.error('[notify-dispute-message] Resend error:', await res.text());
    };

    if (sender === 'client') {
      // Client a écrit → notifier l'admin
      await sendEmail(
        adminEmail,
        `💬 Réponse client — litige #${orderRef}`,
        emailHtml({
          senderLabel: customerName ? `${customerName} (client)` : 'Le client',
          recipientName: 'Admin',
          orderRef,
          content,
          fileName,
          siteUrl,
          isAdmin: true,
        }),
      );
    } else if (sender === 'admin' && customerEmail) {
      // Admin a écrit → notifier le client
      await sendEmail(
        customerEmail,
        `💬 Réponse de Guinée Makiti — litige #${orderRef}`,
        emailHtml({
          senderLabel: 'Guinée Makiti',
          recipientName: customerName ?? 'Client',
          orderRef,
          content,
          fileName,
          siteUrl,
          isAdmin: false,
        }),
      );
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[notify-dispute-message] Exception:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
