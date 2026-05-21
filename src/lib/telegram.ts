// ─── Telegram Bot Helper ──────────────────────────────────────────

interface TelegramMessageOptions {
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const setting = await prisma.setting.findUnique({ where: { key } });
    await prisma.$disconnect();
    return setting?.value || null;
  } catch {
    return null;
  }
}

export async function sendTelegramMessage(text: string, options?: TelegramMessageOptions): Promise<boolean> {
  const [botToken, chatId] = await Promise.all([
    getSetting('TELEGRAM_BOT_TOKEN'),
    getSetting('TELEGRAM_CHAT_ID'),
  ]);

  if (!botToken || !chatId) {
    console.warn('Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'HTML',
        disable_web_page_preview: options?.disable_web_page_preview ?? true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Telegram API error:', err);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

// ─── Pre-built Notification Templates ──────────────────────────────

export function notifyNewOrder(order: { orderNumber: string; total: number; customerName?: string; items: number }) {
  return sendTelegramMessage(
    `🛒 <b>Comandă Nouă!</b>\n\n` +
    `📦 Comanda: <code>${order.orderNumber}</code>\n` +
    `💰 Total: <b>${order.total.toFixed(2)} MDL</b>\n` +
    `👤 Client: ${order.customerName || 'N/A'}\n` +
    `📋 Produse: ${order.items} articol(e)`
  );
}

export function notifyNewUser(user: { name?: string; email: string }) {
  return sendTelegramMessage(
    `👤 <b>Utilizator Nou!</b>\n\n` +
    `📧 Email: ${user.email}\n` +
    `🏷️ Nume: ${user.name || 'N/A'}`
  );
}

export function notifyLowStock(product: { name: string; stock: number; sku?: string }) {
  return sendTelegramMessage(
    `⚠️ <b>Stoc Critic!</b>\n\n` +
    `📦 Produs: ${product.name}\n` +
    `📊 Stoc rămas: <b>${product.stock}</b>\n` +
    `${product.sku ? `🏷️ SKU: ${product.sku}` : ''}`
  );
}

export function notifyNewReview(review: { productName: string; rating: number; userName: string; comment?: string }) {
  return sendTelegramMessage(
    `⭐ <b>Review Nou!</b>\n\n` +
    `📦 Produs: ${review.productName}\n` +
    `⭐ Rating: ${'⭐'.repeat(review.rating)} (${review.rating}/5)\n` +
    `👤 De la: ${review.userName}\n` +
    `${review.comment ? `💬 "${review.comment.substring(0, 200)}"` : ''}`
  );
}
