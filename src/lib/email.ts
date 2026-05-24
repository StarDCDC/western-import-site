import nodemailer from 'nodemailer';

// ─── Email Transport ───────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Western Import';
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@westernimport.md';

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      replyTo,
    });
    console.log(`[EMAIL] ✅ Sent successfully → ${to} | Subject: "${subject}"`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send to ${to}:`, error);
    return false;
  }
}

// ─── Common Styles ─────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #8B4513, #A0522D); padding: 24px 32px; }
  .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
  .content { padding: 24px 32px; }
  .footer { padding: 16px 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #eee; font-size: 13px; color: #666; }
  td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .total-row { font-weight: bold; font-size: 16px; background: #fafafa; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  .btn { display: inline-block; padding: 12px 24px; background: #8B4513; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: bold; }
`;

// ─── Order Confirmation (Customer) ────────────────────────────────

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  subtotal: number;
  discount?: number;
  shippingCost: number;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress: string;
}

export function orderConfirmationHtml(
  orderNumber: string,
  items: OrderItem[],
  total: number,
  details?: OrderDetails
): string {
  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">${item.price.toLocaleString('ro-MD')} MDL</td>
    </tr>
  `).join('');

  const detailsHtml = details ? `
    <tr><td style="border:none;color:#666;">Subtotal:</td><td style="border:none;text-align:right;">${details.subtotal.toLocaleString('ro-MD')} MDL</td></tr>
    ${details.discount ? `<tr><td style="border:none;color:#22c55e;">Reducere:</td><td style="border:none;text-align:right;color:#22c55e;">-${details.discount.toLocaleString('ro-MD')} MDL</td></tr>` : ''}
    <tr><td style="border:none;color:#666;">Transport:</td><td style="border:none;text-align:right;">${details.shippingCost === 0 ? '<span style="color:#22c55e;">Gratuit</span>' : details.shippingCost.toLocaleString('ro-MD') + ' MDL'}</td></tr>
    <tr><td style="border:none;color:#666;">Plata:</td><td style="border:none;text-align:right;">${details.paymentMethod === 'CASH' ? 'Cash la livrare' : details.paymentMethod === 'CARD' ? 'Card online' : 'Credit IuteCredit'}</td></tr>
    <tr><td style="border:none;color:#666;">Livrare:</td><td style="border:none;text-align:right;">${details.deliveryMethod === 'PICKUP' ? 'Ridicare magazin' : details.deliveryMethod === 'COURIER_CHISINAU' ? 'Curier Chișinău' : 'Curier național'}</td></tr>
  ` : '';

  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header">
          <h1>✅ Comandă confirmată!</h1>
        </div>
        <div class="content">
          <p style="font-size:16px;">Comanda ta <strong>#${orderNumber}</strong> a fost primită cu succes.</p>

          <h3 style="margin-top:24px;margin-bottom:12px;font-size:16px;">Produse comandate:</h3>
          <table>
            <thead>
              <tr><th>Produs</th><th style="text-align:center;">Cant.</th><th style="text-align:right;">Preț</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <table style="margin-top:16px;width:60%;margin-left:auto;">
            ${detailsHtml}
            <tr class="total-row">
              <td style="border:none;font-size:18px;">Total:</td>
              <td style="border:none;text-align:right;font-size:18px;color:#8B4513;">${total.toLocaleString('ro-MD')} MDL</td>
            </tr>
          </table>

          <div style="margin-top:24px;padding:16px;background:#f8f9fa;border-radius:8px;">
            <p style="margin:0;font-size:13px;color:#666;">
              📍 ${details?.shippingAddress || 'Adresa de livrare'}<br>
              📧 Vei primi notificări pe email la fiecare pas al comenzii.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău, Moldova</p>
          <p>Acest email a fost trimis automat. Nu răspundeți la acest email.</p>
        </div>
      </div>
    </div>
  `;
}

// ─── New Order Admin Notification ─────────────────────────────────

interface AdminOrderDetails {
  customerName: string;
  email: string;
  phone: string;
  subtotal: number;
  discount?: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}

export function newOrderAdminHtml(orderNumber: string, details: AdminOrderDetails): string {
  const rows = details.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">${item.price.toLocaleString('ro-MD')} MDL</td>
    </tr>
  `).join('');

  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header" style="background:linear-gradient(135deg,#1e40af,#3b82f6);">
          <h1>🛒 Comandă nouă!</h1>
        </div>
        <div class="content">
          <p style="font-size:18px;">Comanda <strong>#${orderNumber}</strong></p>

          <div style="padding:16px;background:#f0f9ff;border-radius:8px;margin-bottom:16px;">
            <h3 style="margin:0 0 8px;font-size:14px;color:#1e40af;">Detalii client:</h3>
            <p style="margin:4px 0;font-size:14px;"><strong>Nume:</strong> ${details.customerName}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Email:</strong> ${details.email}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Telefon:</strong> ${details.phone}</p>
          </div>

          <table>
            <thead>
              <tr><th>Produs</th><th style="text-align:center;">Cant.</th><th style="text-align:right;">Preț</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <table style="margin-top:16px;width:60%;margin-left:auto;">
            <tr><td style="border:none;color:#666;">Subtotal:</td><td style="border:none;text-align:right;">${details.subtotal.toLocaleString('ro-MD')} MDL</td></tr>
            ${details.discount ? `<tr><td style="border:none;color:#22c55e;">Reducere:</td><td style="border:none;text-align:right;color:#22c55e;">-${details.discount.toLocaleString('ro-MD')} MDL</td></tr>` : ''}
            <tr><td style="border:none;color:#666;">Transport:</td><td style="border:none;text-align:right;">${details.shippingCost === 0 ? 'Gratuit' : details.shippingCost.toLocaleString('ro-MD') + ' MDL'}</td></tr>
            <tr><td style="border:none;color:#666;">Plata:</td><td style="border:none;text-align:right;">${details.paymentMethod === 'CASH' ? 'Cash' : details.paymentMethod === 'CARD' ? 'Card' : 'Credit'}</td></tr>
            <tr class="total-row">
              <td style="border:none;font-size:18px;">Total:</td>
              <td style="border:none;text-align:right;font-size:18px;color:#1e40af;">${details.total.toLocaleString('ro-MD')} MDL</td>
            </tr>
          </table>

          <div style="margin-top:16px;padding:16px;background:#f8f9fa;border-radius:8px;">
            <p style="margin:0;font-size:13px;"><strong>Livrare:</strong> ${details.deliveryMethod === 'PICKUP' ? 'Ridicare magazin' : details.deliveryMethod === 'COURIER_CHISINAU' ? 'Curier Chișinău' : 'Curier național'}</p>
            <p style="margin:4px 0 0;font-size:13px;"><strong>Adresa:</strong> ${details.shippingAddress}</p>
          </div>
        </div>
        <div class="footer">
          <p>Western Import Admin — Notificare comandă nouă</p>
        </div>
      </div>
    </div>
  `;
}

// ─── Order Shipped ────────────────────────────────────────────────

export function orderShippedHtml(orderNumber: string, trackingInfo?: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header" style="background:linear-gradient(135deg,#059669,#10b981);">
          <h1>📦 Comandă expediată!</h1>
        </div>
        <div class="content">
          <p style="font-size:16px;">Comanda ta <strong>#${orderNumber}</strong> a fost expediată!</p>
          ${trackingInfo ? `
            <div style="padding:16px;background:#ecfdf5;border-radius:8px;margin:16px 0;">
              <p style="margin:0;font-size:14px;"><strong>Informații tracking:</strong> ${trackingInfo}</p>
            </div>
          ` : ''}
          <p style="font-size:14px;color:#666;">Vei primi un email când comanda este livrată.</p>
        </div>
        <div class="footer">
          <p>Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău, Moldova</p>
        </div>
      </div>
    </div>
  `;
}

// ─── Order Delivered ───────────────────────────────────────────────

export function orderDeliveredHtml(orderNumber: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header" style="background:linear-gradient(135deg,#7c3aed,#8b5cf6);">
          <h1>🎉 Comandă livrată!</h1>
        </div>
        <div class="content">
          <p style="font-size:16px;">Comanda ta <strong>#${orderNumber}</strong> a fost livrată cu succes!</p>
          <p style="font-size:14px;color:#666;margin-top:16px;">Îți mulțumim pentru achiziție! Dacă ești mulțumit(ă), ne-ar face plăcere să primești un review.</p>
          <div style="text-align:center;margin-top:24px;">
            <a href="https://westernimport.md/account" class="btn">Lasă un review</a>
          </div>
        </div>
        <div class="footer">
          <p>Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău, Moldova</p>
        </div>
      </div>
    </div>
  `;
}

// ─── Welcome / Account Created ────────────────────────────────────

export function welcomeEmailHtml(name: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header">
          <h1>👋 Bun venit la Western Import!</h1>
        </div>
        <div class="content">
          <p style="font-size:16px;">Salut <strong>${name}</strong>,</p>
          <p style="font-size:14px;color:#666;">Contul tău a fost creat cu succes! Acum poți:</p>
          <ul style="font-size:14px;color:#666;">
            <li>Să plasezi comenzi rapid</li>
            <li>Să urmărești statusul comenzilor</li>
            <li>Să adaugi produse la favorite</li>
            <li>Să lași review-uri</li>
          </ul>
          <div style="text-align:center;margin-top:24px;">
            <a href="https://westernimport.md/catalog" class="btn">Descoperă produsele</a>
          </div>
        </div>
        <div class="footer">
          <p>Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău, Moldova</p>
        </div>
      </div>
    </div>
  `;
}

// ─── Password Reset ───────────────────────────────────────────────

export function passwordResetHtml(name: string, resetUrl: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header" style="background:linear-gradient(135deg,#dc2626,#ef4444);">
          <h1>🔐 Resetare parolă</h1>
        </div>
        <div class="content">
          <p style="font-size:16px;">Salut <strong>${name}</strong>,</p>
          <p style="font-size:14px;color:#666;">Ai solicitat resetarea parolei. Apasă butonul de mai jos pentru a-ți seta o parolă nouă:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" class="btn" style="background:#dc2626;">Resetează parola</a>
          </div>
          <p style="font-size:13px;color:#999;">Acest link expiră în 1 oră. Dacă nu ai solicitat resetarea, ignoră acest email.</p>
        </div>
        <div class="footer">
          <p>Western Import — Laptopuri, Telefoane, PC & Monitoare | Chișinău, Moldova</p>
        </div>
      </div>
    </div>
  `;
}

// ─── Contact Form (existing) ──────────────────────────────────────

export function contactFormHtml(name: string, email: string, message: string): string {
  return `
    <div style="${BASE_STYLES}">
      <div class="container">
        <div class="header" style="background:linear-gradient(135deg,#8B4513,#A0522D);">
          <h2>💬 Mesaj nou de contact</h2>
        </div>
        <div class="content">
          <p><strong>Nume:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mesaj:</strong></p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div class="footer">
          <p>Western Import — Formular de contact</p>
        </div>
      </div>
    </div>
  `;
}
