/**
 * Email templates — branded HTML emails for Aura Living.
 *
 * All templates use inline CSS (required for email clients).
 * Colors match the site's design system: cream canvas, gold accents, ink text.
 */

const BASEStyles = `
  body { margin: 0; padding: 0; background: #FAF7F0; font-family: Georgia, serif; color: #1a1714; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .header { text-align: center; padding: 32px 0 24px; border-bottom: 1px solid #E8E0D5; }
  .brand { font-size: 28px; font-weight: 400; letter-spacing: -0.02em; color: #1a1714; }
  .brand-accent { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; display: block; margin-top: 4px; }
  .content { padding: 32px 0; }
  h1 { font-size: 24px; font-weight: 400; margin: 0 0 16px; color: #1a1714; }
  h2 { font-size: 18px; font-weight: 400; margin: 0 0 12px; color: #1a1714; }
  p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: #4A4A4A; }
  .order-number { font-size: 20px; font-weight: 600; color: #D4AF37; margin: 8px 0; }
  .button { display: inline-block; padding: 14px 32px; background: #1a1714; color: #FAF7F0; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2px; margin: 16px 0; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  .footer { padding: 24px 0; border-top: 1px solid #E8E0D5; text-align: center; font-size: 12px; color: #718096; }
  .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .items-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; padding: 8px 0; border-bottom: 2px solid #E8E0D5; }
  .items-table td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #F0EBE0; }
  .totals { margin-left: auto; width: 100%; max-width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .total { font-size: 18px; font-weight: 600; padding-top: 12px; border-top: 2px solid #E8E0D5; margin-top: 8px; }
  .unsubscribe { color: #718096; font-size: 12px; text-decoration: underline; }
`;

function wrapper(content: string, unsubscribeUrl?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Aura Living</title><style>${BASEStyles}</style></head><body><div class="container"><div class="header"><div class="brand">Aura<span class="brand-accent">Living</span></div></div><div class="content">${content}</div><div class="footer"><p>Aura Living · Considered home, sourced slowly<br>This email was sent to you because you have an account or subscribed to our newsletter.</p>${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe</a></p>` : ""}</div></div></body></html>`;
}

export function orderConfirmationEmail(orderNumber: string, total: string, items: Array<{ name: string; qty: number; price: string }>, customerName: string): { subject: string; html: string } {
  const itemsHtml = items.map(i => `<tr><td>${i.name}</td><td style="text-align:center;">${i.qty}</td><td style="text-align:right;">${i.price}</td></tr>`).join("");
  return {
    subject: `Order Confirmed — ${orderNumber}`,
    html: wrapper(`
      <h1>Thank you for your order, ${customerName}.</h1>
      <p>Your order has been received and is now being processed. We'll send you another email when it ships.</p>
      <p class="order-number">${orderNumber}</p>
      <table class="items-table"><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <div class="totals"><div class="row"><span>Total</span><span style="color:#D4AF37;font-weight:600;">${total}</span></div></div>
      <p>Payment: Cash on Delivery — please have the exact amount ready for our courier.</p>
      <a href="https://aura-living-1.vercel.app/account/orders" class="button">Track Your Order</a>
    `),
  };
}

export function orderStatusEmail(orderNumber: string, status: string, customerName: string, trackingNumber?: string, carrier?: string): { subject: string; html: string } {
  const statusMessages: Record<string, { title: string; desc: string; color: string }> = {
    processing: { title: "Your order is being processed", desc: "We're preparing your items with care.", color: "#3B82F6" },
    packed: { title: "Your order has been packed", desc: "Your items are packed and ready for shipment.", color: "#3B82F6" },
    shipped: { title: "Your order has been shipped", desc: trackingNumber ? `Tracking: ${trackingNumber}${carrier ? ` via ${carrier}` : ""}` : "Your order is on its way.", color: "#D4AF37" },
    delivered: { title: "Your order has been delivered", desc: "Enjoy your new pieces! We'd love to hear your feedback.", color: "#10B981" },
    cancelled: { title: "Your order has been cancelled", desc: "If you have questions, please contact us.", color: "#EF4444" },
  };
  const msg = statusMessages[status] ?? statusMessages.processing;
  return {
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — ${orderNumber}`,
    html: wrapper(`
      <h1>${msg.title}</h1>
      <p>Hi ${customerName},</p>
      <p><span class="status-badge" style="background:${msg.color}20;color:${msg.color};">${status.toUpperCase()}</span></p>
      <p>${msg.desc}</p>
      <p class="order-number">${orderNumber}</p>
      ${status === "delivered" ? `<a href="https://aura-living-1.vercel.app/account/orders" class="button">Leave a Review</a>` : `<a href="https://aura-living-1.vercel.app/account/orders" class="button">View Order</a>`}
    `),
  };
}

export function welcomeEmail(customerName: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Aura Living",
    html: wrapper(`
      <h1>Welcome, ${customerName}.</h1>
      <p>Your Aura Living account is ready. Browse our collection of considered objects — each one handcrafted, each one made to last.</p>
      <p>As a welcome gift, use code <strong style="color:#D4AF37;">WELCOME10</strong> at checkout for 10% off your first order.</p>
      <a href="https://aura-living-1.vercel.app/shop" class="button">Shop the Collection</a>
      <p style="margin-top:24px;">Warm regards,<br>The Aura Living Atelier</p>
    `),
  };
}

export function passwordResetEmail(resetUrl: string, customerName: string): { subject: string; html: string } {
  return {
    subject: "Reset Your Password — Aura Living",
    html: wrapper(`
      <h1>Reset your password</h1>
      <p>Hi ${customerName},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p style="font-size:13px;color:#718096;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

export function reviewApprovedEmail(productName: string, productSlug: string, customerName: string): { subject: string; html: string } {
  return {
    subject: "Your review is now live — Aura Living",
    html: wrapper(`
      <h1>Your review is live!</h1>
      <p>Hi ${customerName},</p>
      <p>Your review for <strong>${productName}</strong> has been approved and is now visible on the product page.</p>
      <a href="https://aura-living-1.vercel.app/product/${productSlug}" class="button">View Your Review</a>
    `),
  };
}

export function newsletterEmail(subject: string, bodyHtml: string, unsubscribeUrl: string): { subject: string; html: string } {
  return {
    subject,
    html: wrapper(`
      <h1>${subject}</h1>
      ${bodyHtml}
      <a href="https://aura-living-1.vercel.app/shop" class="button">Shop Now</a>
    `, unsubscribeUrl),
  };
}

export function abandonedCartEmail(items: Array<{ name: string; image: string; price: string }>, cartUrl: string, customerName?: string): { subject: string; html: string } {
  const itemsHtml = items.map(i => `<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #F0EBE0;"><img src="${i.image}" alt="${i.name}" style="width:60px;height:60px;object-fit:cover;border-radius:2px;"><div><p style="margin:0;font-size:14px;color:#1a1714;">${i.name}</p><p style="margin:4px 0 0;font-size:14px;color:#D4AF37;">${i.price}</p></div></div>`).join("");
  return {
    subject: "You left something beautiful behind",
    html: wrapper(`
      <h1>${customerName ? `${customerName}, your` : "Your"} cart is waiting.</h1>
      <p>These pieces caught your eye — they're still available, but they don't stay for long.</p>
      ${itemsHtml}
      <a href="${cartUrl}" class="button">Complete Your Order</a>
    `),
  };
}

export function sendContactNotificationEmail(params: { name: string; email: string; subject: string; message: string }): { subject: string; html: string } {
  return {
    subject: `[Contact] ${params.subject}`,
    html: wrapper(`
      <h1>New contact form submission</h1>
      <p><strong>From:</strong> ${params.name} &lt;${params.email}&gt;</p>
      <p><strong>Subject:</strong> ${params.subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;background:#F8F4EC;padding:16px;border-radius:4px;font-family:Georgia,serif;">${params.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <p><a href="mailto:${params.email}" class="button">Reply by Email</a></p>
    `),
  };
}
