/**
 * Aura Living — Legal & Compliance Document
 *
 * Generates a professional .docx containing all five legal pages,
 * GDPR compliance notes, and a document-control section so the
 * Aura Living team can review, edit, and re-publish policies later.
 *
 * Output: /home/z/my-project/download/Aura-Living-Legal-Compliance-Document.docx
 */

const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageNumber, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  TableOfContents, SectionType, NumberFormat, PageOrientation,
  LevelFormat, convertInchesToTwip, TabStopType, TabStopPosition,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ────────────────────────────────────────────────────────────────────────────
// 1. PALETTE — Legal Wood (Warm + Heavy + Calm)
// ────────────────────────────────────────────────────────────────────────────
const P = {
  primary: "28201C",
  body: "36302C",
  secondary: "6E6560",
  accent: "7A5C3A",
  surface: "FBF9F7",
  hairline: "D8CFC4",
  gold: "8C7340",
};

const FONT = { ascii: "Times New Roman", eastAsia: "Times New Roman" };
const FONT_SANS = { ascii: "Calibri", eastAsia: "Calibri" };

// ────────────────────────────────────────────────────────────────────────────
// 2. COMPONENT BUILDERS
// ────────────────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { before: 480, after: 240, line: 360 },
    children: [
      new TextRun({ text, bold: true, size: 32, color: P.primary, font: FONT }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160, line: 340 },
    children: [
      new TextRun({ text, bold: true, size: 28, color: P.primary, font: FONT }),
    ],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 320 },
    children: [
      new TextRun({ text, bold: true, size: 24, color: P.primary, font: FONT }),
    ],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120, ...(opts.spacing || {}) },
    indent: { firstLine: 0 },
    children: [
      new TextRun({ text, size: 22, color: P.body, font: FONT }),
    ],
  });
}

function bodyRich(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: runs.map((r) =>
      new TextRun({
        text: r.text,
        bold: r.bold || false,
        italics: r.italic || false,
        size: 22,
        color: r.color || P.body,
        font: FONT,
      })
    ),
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    indent: { left: 720 + level * 360, hanging: 360 },
    children: [
      new TextRun({ text: "• ", size: 22, color: P.accent, font: FONT, bold: true }),
      new TextRun({ text, size: 22, color: P.body, font: FONT }),
    ],
  });
}

function bulletRich(runs, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    indent: { left: 720 + level * 360, hanging: 360 },
    children: [
      new TextRun({ text: "• ", size: 22, color: P.accent, font: FONT, bold: true }),
      ...runs.map((r) =>
        new TextRun({
          text: r.text,
          bold: r.bold || false,
          italics: r.italic || false,
          size: 22,
          color: r.color || P.body,
          font: FONT,
        })
      ),
    ],
  });
}

function emptyP() {
  return new Paragraph({ children: [], spacing: { after: 0 } });
}

function divider() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: P.hairline },
    },
    children: [],
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 3. COVER PAGE — Editorial / Brand cover (manual, no recipe complexity)
// ────────────────────────────────────────────────────────────────────────────

function buildCover() {
  return [
    // Top spacing
    new Paragraph({ spacing: { before: 2400 }, children: [] }),

    // Brand mark
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "AURA",
          size: 84,
          bold: true,
          color: P.primary,
          font: FONT,
          characterSpacing: 60,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "LIVING",
          size: 24,
          color: P.gold,
          font: FONT,
          characterSpacing: 200,
        }),
      ],
    }),

    // Decorative rule
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 720, after: 720 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 4 },
      },
      indent: { left: 3600, right: 3600 },
      children: [],
    }),

    // Document title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240, line: 540, lineRule: "atLeast" },
      children: [
        new TextRun({
          text: "Legal & Compliance",
          size: 56,
          bold: true,
          color: P.primary,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480, line: 440, lineRule: "atLeast" },
      children: [
        new TextRun({
          text: "Document",
          size: 56,
          bold: true,
          color: P.primary,
          font: FONT,
        }),
      ],
    }),

    // Subtitle
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1600 },
      children: [
        new TextRun({
          text: "Terms · Privacy · Returns · Shipping · GDPR",
          size: 24,
          italics: true,
          color: P.secondary,
          font: FONT,
          characterSpacing: 40,
        }),
      ],
    }),

    // Meta block — bottom
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Prepared for Aura Living Atelier",
          size: 22,
          color: P.body,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Lahore, Pakistan",
          size: 22,
          color: P.body,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Effective Date: 30 June 2026",
          size: 22,
          color: P.body,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [
        new TextRun({
          text: "Version 1.0",
          size: 22,
          color: P.secondary,
          font: FONT,
          italics: true,
        }),
      ],
    }),
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// 4. TABLE OF CONTENTS
// ────────────────────────────────────────────────────────────────────────────

function buildTOC() {
  return [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 240, after: 360 },
      children: [
        new TextRun({
          text: "Table of Contents",
          size: 36,
          bold: true,
          color: P.primary,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.hairline } },
      children: [],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 240 },
      children: [
        new TextRun({
          text: "Right-click the table of contents and select “Update Field” to refresh page numbers.",
          size: 18,
          italics: true,
          color: P.secondary,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// 5. CONTENT SECTIONS
// ────────────────────────────────────────────────────────────────────────────

function buildIntroduction() {
  return [
    h1("Introduction"),
    body(
      "This document consolidates the complete set of public-facing legal, service, and compliance policies that govern the Aura Living online store and the relationship between Aura Living (“we”, “us”, or “our”) and our customers (“you”). It is intended as the authoritative reference for the policies currently published across the Aura Living website, and as a working document that the Aura Living team can review, amend, and re-publish as the business evolves."
    ),
    body(
      "The policies contained in this document apply to all visitors, registered account holders, and customers of the Aura Living website at auraliving.com. By accessing the website, creating an account, subscribing to our newsletter, or placing an order, you acknowledge that you have read, understood, and agreed to be bound by the policies set out herein."
    ),
    body(
      "Each section of this document corresponds to a page on the Aura Living website. The website reflects the current published version of each policy; this document is the editable master copy. When policies are amended, both the website and this document should be updated to remain consistent."
    ),
    h2("Document Purpose"),
    body(
      "The purpose of this document is threefold. First, to provide customers with clear, accessible information about their rights and obligations when shopping with Aura Living. Second, to ensure Aura Living operates in compliance with applicable Pakistani law and international best practice in e-commerce, data protection, and consumer rights. Third, to provide a single, versioned reference point for the Aura Living team when responding to customer enquiries, training new staff, or reviewing operational procedures."
    ),
    h2("Scope"),
    body(
      "This document covers: (1) the Terms of Service that govern use of the website; (2) the Privacy Policy explaining how customer data is collected, used, and protected; (3) the Returns & Exchanges Policy; (4) the Shipping Information policy; (5) the Contact process; and (6) the GDPR-style data subject rights implemented through the Aura Living account interface, including data export and account deletion."
    ),
    body(
      "Matters not covered by this document — including but not limited to employment terms, supplier agreements, wholesale terms, or internal operational procedures — are governed by separate documentation."
    ),
  ];
}

function buildTerms() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("1. Terms of Service"),
    body("Last updated: 30 June 2026"),
    h2("1.1 Acceptance of Terms"),
    body(
      "Welcome to Aura Living. By accessing or using our website at auraliving.com (the “Site”), browsing our products, creating an account, or placing an order, you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, please do not use the Site. These Terms form a legally binding agreement between you and Aura Living."
    ),
    body(
      "We may update these Terms from time to time. When we do, we will revise the “Last updated” date at the top of the Terms page on the Site. Your continued use of the Site after any change constitutes your acceptance of the new Terms. We encourage you to review the Terms page periodically."
    ),
    h2("1.2 Eligibility"),
    body(
      "You must be at least 18 years of age to create an account and place an order on the Site. By using the Site, you represent and warrant that you are at least 18 years old, that you have the legal capacity to enter into these Terms, and that the information you provide to us is accurate and complete."
    ),
    h2("1.3 Your Account"),
    body(
      "When you create an Aura Living account, you are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account or any other security breach. We are not liable for any loss or damage arising from your failure to protect your account credentials."
    ),
    body(
      "You agree to provide accurate, current, and complete information during registration and to update that information to keep it accurate. We reserve the right to suspend or terminate accounts that we believe violate these Terms or that engage in fraudulent, abusive, or unlawful activity."
    ),
    h2("1.4 Orders and Pricing"),
    body(
      "All orders placed through the Site are subject to acceptance and availability. We reserve the right to refuse or cancel any order at any time, including after the order has been confirmed, in cases of product unavailability, pricing errors, or suspected fraudulent activity. If we cancel an order after payment has been processed, we will issue a full refund via the original payment method."
    ),
    body(
      "All prices are listed in Pakistani Rupees (PKR) and include applicable taxes unless otherwise stated. Shipping costs are calculated at checkout based on your delivery address. Aura Living currently accepts Cash on Delivery (COD) as its primary payment method. By placing an order, you authorize us to deliver the products to the address you provide and to collect payment upon delivery."
    ),
    h2("1.5 Product Information"),
    body(
      "We make every effort to display our products and their colors accurately. However, we cannot guarantee that your device’s display will accurately reflect the actual color, texture, or scale of any product. Many of our pieces are handmade by artisans, meaning slight variations in finish, texture, and dimension are inherent to the craft and are not considered defects. These variations are the mark of a real person, not a machine."
    ),
    body(
      "Product descriptions, dimensions, and care instructions are provided in good faith. If you receive a product that does not match its description, please contact us within 7 days of delivery — see Section 3 (Returns & Exchanges) for details."
    ),
    h2("1.6 Intellectual Property"),
    body(
      "All content on the Site — including product photography, written copy, the Aura Living name and logo, journal articles, and the overall look and feel of the Site — is owned by Aura Living or used with permission. You may not reproduce, distribute, modify, or commercially exploit any content from the Site without our prior written consent."
    ),
    body(
      "You may share product links and images for personal, non-commercial purposes. If you wish to use our content for editorial or press purposes, please contact us at concierge@auraliving.com."
    ),
    h2("1.7 Prohibited Conduct"),
    body("You agree not to:"),
    bullet("Use the Site for any unlawful purpose."),
    bullet("Attempt to gain unauthorized access to any part of the Site, our systems, or another user’s account."),
    bullet("Interfere with the proper functioning of the Site, including by introducing viruses or other malicious code."),
    bullet("Scrape, crawl, or use automated means to collect data from the Site without our consent."),
    bullet("Use the Site to send unsolicited communications."),
    bullet("Impersonate any other person or entity."),
    h2("1.8 Limitation of Liability"),
    body(
      "The Site and all products are provided “as is” and “as available”. To the fullest extent permitted by law, Aura Living is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or any product purchased through it. Our total liability for any claim arising from your use of the Site is limited to the amount you paid for the product(s) in question."
    ),
    h2("1.9 Governing Law"),
    body(
      "These Terms are governed by the laws of Pakistan. Any dispute arising from these Terms or your use of the Site will be resolved in the courts of Lahore, Pakistan, without regard to conflict of law principles."
    ),
    h2("1.10 Contact"),
    body(
      "If you have any questions about these Terms, please contact us at concierge@auraliving.com or write to us at our registered address in Lahore, Pakistan. We aim to respond to all enquiries within two business days."
    ),
  ];
}

function buildPrivacy() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("2. Privacy Policy"),
    body("Last updated: 30 June 2026"),
    body(
      "At Aura Living, we treat your personal information with the same care we apply to sourcing our objects. This Privacy Policy explains what we collect, why we collect it, how we use it, and the choices you have. By using our website or placing an order, you consent to the practices described here."
    ),
    h2("2.1 Information We Collect"),
    body("We collect information in three ways:"),
    bulletRich([
      { text: "Information you provide: ", bold: true },
      { text: "your name, email address, phone number, delivery address, and any other details you share when creating an account, placing an order, subscribing to our newsletter, or contacting us." },
    ]),
    bulletRich([
      { text: "Information collected automatically: ", bold: true },
      { text: "your IP address, browser type, device information, pages visited, and referring URLs. We use cookies and similar technologies to gather this data — see Section 2.3 below." },
    ]),
    bulletRich([
      { text: "Order information: ", bold: true },
      { text: "the products you order, payment method (Cash on Delivery), delivery instructions, and order history." },
    ]),
    h2("2.2 How We Use Your Information"),
    body("We use your information to:"),
    bullet("Process and deliver your orders, including COD collection."),
    bullet("Communicate with you about your orders, returns, and enquiries."),
    bullet("Send you our newsletter and journal content, if you subscribe."),
    bullet("Improve our products, content, and the Site’s usability."),
    bullet("Detect and prevent fraud, abuse, and unauthorized access."),
    bullet("Comply with our legal and tax obligations in Pakistan."),
    h2("2.3 Cookies and Similar Technologies"),
    body(
      "We use cookies to remember your preferences (such as theme and language), to keep you signed in, to understand how the Site is used, and to improve your shopping experience. When you first visit the Site, we show a cookie consent banner that lets you accept or decline non-essential cookies. You can change your choice at any time by clearing your browser cookies."
    ),
    body(
      "Essential cookies (for cart, authentication, and security) are always active. Analytics and marketing cookies are only set after you consent."
    ),
    h2("2.4 Sharing Your Information"),
    body(
      "We do not sell your personal information. We share it only with trusted service providers who help us run our business — for example, delivery companies that fulfill your orders, email service providers that send our newsletter, and cloud hosting providers that store our data. These providers are bound by confidentiality obligations and may only use your information to provide services to us."
    ),
    body(
      "We may also disclose your information when required by law, court order, or to protect our rights, property, or safety."
    ),
    h2("2.5 Data Retention"),
    body(
      "We retain your personal information for as long as your account is active, or as long as needed to provide our services. Order records are retained for the period required by Pakistani tax law (typically 5 years). Newsletter subscriptions are retained until you unsubscribe — which you can do at any time via the unsubscribe link in any email or through your account settings."
    ),
    h2("2.6 Your Rights (GDPR-style)"),
    body("Depending on where you live, you may have the following rights over your personal data:"),
    bulletRich([
      { text: "Access: ", bold: true },
      { text: "request a copy of the personal data we hold about you. You can download your full data export from your account settings at /account/privacy." },
    ]),
    bulletRich([
      { text: "Correction: ", bold: true },
      { text: "request that we correct inaccurate or incomplete information." },
    ]),
    bulletRich([
      { text: "Deletion: ", bold: true },
      { text: "request that we delete your personal data, subject to legal retention requirements (such as tax records). You can initiate deletion from your account settings or by contacting us." },
    ]),
    bulletRich([
      { text: "Opt-out: ", bold: true },
      { text: "unsubscribe from marketing communications at any time." },
    ]),
    bulletRich([
      { text: "Withdraw consent: ", bold: true },
      { text: "withdraw your consent to non-essential cookies at any time." },
    ]),
    body(
      "To exercise any of these rights, email privacy@auraliving.com. We respond to all verified requests within 30 days."
    ),
    h2("2.7 Security"),
    body(
      "We use industry-standard measures to protect your information, including encrypted (HTTPS) connections, hashed passwords, and secure httpOnly cookies for authentication. No method of transmission over the internet is 100% secure, but we work hard to protect your data and never store full payment card details (we use Cash on Delivery exclusively, so no card data is collected)."
    ),
    h2("2.8 Children’s Privacy"),
    body(
      "The Site is not intended for anyone under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly."
    ),
    h2("2.9 Changes to This Policy"),
    body(
      "We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated” date at the top of the policy page. For significant changes, we will notify you via email or a prominent notice on the Site."
    ),
    h2("2.10 Contact"),
    body(
      "If you have any questions about this Privacy Policy or how we handle your data, please email privacy@auraliving.com or write to us at our registered address in Lahore, Pakistan."
    ),
  ];
}

function buildReturns() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("3. Returns & Exchanges Policy"),
    body("Last updated: 30 June 2026"),
    body(
      "Many of our pieces are made by hand in small workshops. Slight variations in finish, texture, and dimension are the mark of the maker and are not considered defects. That said, if a piece doesn’t feel right for your home, we want to make it easy to send it back."
    ),
    h2("3.1 Return Window"),
    body(
      "You may request a return within 7 days of delivery. To start a return, email concierge@auraliving.com with your order number and the item(s) you wish to return. We will reply with a return authorization and instructions within two business days."
    ),
    h2("3.2 Conditions for Return"),
    body("To be eligible for a return, your item must be:"),
    bullet("In its original, unused condition."),
    bullet("In its original packaging, including any dust bags or tags."),
    bullet("Accompanied by the original order confirmation or receipt."),
    bullet("Free from scratches, chips, or signs of wear."),
    body(
      "Certain items are final sale and cannot be returned: candles (for safety), live plants (perishable), and any item marked “Final Sale” on its product page. These are clearly marked before purchase."
    ),
    h2("3.3 Damaged or Defective Items"),
    body(
      "If your item arrives damaged or defective, please email us within 48 hours of delivery with photos of the item and its packaging. We will arrange a free replacement or a full refund, including the original shipping cost. We do not require damaged items to be returned — they are yours to keep or recycle."
    ),
    h2("3.4 Refunds"),
    body(
      "Once we receive and inspect your returned item, we will notify you by email. If approved, your refund will be processed within 5–7 business days. Because we operate on Cash on Delivery, refunds are issued via bank transfer to the account you provide at the time of return authorization. Original shipping costs are non-refundable unless the return is due to our error (damaged or wrong item shipped)."
    ),
    h2("3.5 Exchanges"),
    body(
      "To exchange an item for a different size, color, or variant, email us within 7 days of delivery. The fastest way is to return the original item for a refund and place a new order for the variant you want — this avoids waiting for the return to be processed before the new item ships. We are happy to help you coordinate this."
    ),
    h2("3.6 Return Shipping"),
    body(
      "The cost of return shipping is the customer’s responsibility, except in cases of damaged, defective, or wrongly shipped items. We recommend using a trackable courier service. We are not responsible for returns lost in transit. For customers in Lahore, we can arrange a pickup for a flat fee of ₨300 — mention this when requesting your return authorization."
    ),
    h2("3.7 Order Cancellations"),
    body(
      "Orders can be cancelled free of charge if you contact us within 12 hours of placing them. After that, the order enters our fulfillment process and may not be cancellable. If the order has already shipped, please follow the standard return process once it arrives."
    ),
    h2("3.8 Contact"),
    body(
      "For any return, exchange, or order cancellation, email concierge@auraliving.com. Please include your order number in the subject line — it speeds up our response considerably."
    ),
  ];
}

function buildShipping() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("4. Shipping Information"),
    body("Last updated: 30 June 2026"),
    body(
      "We ship across Pakistan via trusted couriers. Every order is packed by hand — wrapped in recycled paper, cushioned with biodegradable fill, and sealed with paper tape. Our packaging is designed to protect the piece in transit and to be kind to the planet."
    ),
    h2("4.1 Delivery Coverage"),
    body(
      "We deliver to all major cities and most rural areas in Pakistan. If your address is in a remote area where our standard couriers do not deliver, we will contact you to arrange an alternative or refund your order in full. You can check delivery availability by entering your postal code at checkout."
    ),
    h2("4.2 Delivery Times"),
    body("Standard delivery times after order dispatch:"),
    bulletRich([{ text: "Lahore, Karachi, Islamabad, Rawalpindi: ", bold: true }, { text: "2–3 business days" }]),
    bulletRich([{ text: "Other major cities: ", bold: true }, { text: "3–5 business days" }]),
    bulletRich([{ text: "Smaller towns and rural areas: ", bold: true }, { text: "5–7 business days" }]),
    body(
      "Orders are typically dispatched within 1–2 business days of being placed. During sales, journal launches, or holiday periods, dispatch may take an extra business day. You will receive a tracking number by email and SMS once your order ships."
    ),
    h2("4.3 Shipping Costs"),
    body("Shipping is calculated at checkout based on your delivery address:"),
    bulletRich([{ text: "Standard shipping (nationwide): ", bold: true }, { text: "₨150" }]),
    bulletRich([{ text: "Free standard shipping on orders over ", bold: true }, { text: "₨15,000" }]),
    bulletRich([{ text: "Lahore local delivery: ", bold: true }, { text: "₨100 (1–2 business days)" }]),
    body(
      "Shipping costs are non-refundable except in cases where we ship the wrong item or the item arrives damaged. See Section 3 (Returns & Exchanges) for details."
    ),
    h2("4.4 Cash on Delivery (COD)"),
    body(
      "All orders are shipped Cash on Delivery. The courier will collect the exact order amount in cash upon delivery. Please have the correct amount ready — our couriers do not carry change. If you are not available to receive the order, the courier will attempt delivery two more times over the following 5 days. After three failed attempts, the order is returned to us and cancelled."
    ),
    body(
      "Aura Living does not currently support online payment via credit/debit card, JazzCash, or EasyPaisa. We are working on adding these in the future."
    ),
    h2("4.5 Order Tracking"),
    body(
      "Once your order ships, you will receive an email and SMS with a tracking number and a link to track your parcel in real time. You can also view your order status anytime in your account under Orders. If you have not received tracking information within 4 business days of placing your order, please email concierge@auraliving.com."
    ),
    h2("4.6 Packaging"),
    body(
      "Fragile items (ceramics, mirrors, glass) are double-boxed with extra cushioning. Live plants are shipped in secure nursery pots with a moisture barrier. Each package includes a small care card so you know how to settle your new piece into your home. If your package arrives visibly damaged, please refuse delivery or note the damage on the courier’s slip before signing — this speeds up our claims process."
    ),
    h2("4.7 International Shipping"),
    body(
      "We currently ship only within Pakistan. For international enquiries, please contact concierge@auraliving.com — we are exploring international shipping options and will announce them in our newsletter when available."
    ),
    h2("4.8 Contact"),
    body(
      "For shipping questions, delivery updates, or to change your delivery address after ordering, email concierge@auraliving.com or call us during business hours. Address changes are easiest to accommodate within 12 hours of placing your order."
    ),
  ];
}

function buildContact() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("5. Contact Information & Process"),
    body(
      "Aura Living is reachable through several channels. We read every message and reply within two business days. For order-specific questions, please include your order number so we can find your details quickly."
    ),
    h2("5.1 Contact Channels"),
    bulletRich([{ text: "Email: ", bold: true }, { text: "concierge@auraliving.com — general enquiries, orders, returns, press." }]),
    bulletRich([{ text: "Privacy: ", bold: true }, { text: "privacy@auraliving.com — data export, deletion, and all privacy-related requests." }]),
    bulletRich([{ text: "Phone: ", bold: true }, { text: "available in Settings → Store; Monday to Saturday, 10:00am to 7:00pm Pakistan Time." }]),
    bulletRich([{ text: "Web form: ", bold: true }, { text: "the /contact page on auraliving.com collects your name, email, subject, and message." }]),
    bulletRich([{ text: "Atelier: ", bold: true }, { text: "Aura Living Atelier, Lahore, Pakistan." }]),
    h2("5.2 Contact Form Process"),
    body(
      "When you submit the contact form on the website, your message is delivered to all Aura Living admin users in two ways: as an in-app notification in the admin dashboard, and as an email via the Aura Living email service. We rate-limit submissions to 5 messages per hour per IP address to prevent spam and abuse."
    ),
    body(
      "Required fields are: name (at least 2 characters), a valid email address, and a message of at least 10 characters (maximum 5,000 characters). All fields are sanitized before storage. We never share contact form submissions with third parties."
    ),
    h2("5.3 Response Times"),
    body(
      "We aim to respond to all enquiries within two business days (Monday to Saturday, excluding public holidays). Order-status enquiries are typically answered the same day during business hours. Privacy and data-subject requests may take up to 30 days as permitted by law — we will acknowledge receipt within 5 business days."
    ),
    h2("5.4 Escalation"),
    body(
      "If you are not satisfied with the response to your enquiry, you may escalate by replying to the original email thread and requesting escalation to the Atelier Manager. For unresolved disputes, the courts of Lahore, Pakistan have jurisdiction as stated in the Terms of Service."
    ),
  ];
}

function buildGDPR() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("6. GDPR Compliance & Data Subject Rights"),
    body(
      "Although Pakistan is not within the European Union and therefore not strictly bound by the EU General Data Protection Regulation (GDPR), Aura Living voluntarily extends GDPR-style rights to all customers, regardless of location. This commitment reflects our belief that everyone should have control over their personal data."
    ),
    h2("6.1 Data Export (Right of Access)"),
    body(
      "Every registered Aura Living customer can download a complete copy of the personal data we hold about them. The export is generated on demand and delivered as a JSON file that downloads directly to your device — we do not email it and we do not store a copy beyond the time needed to serve your request."
    ),
    body("The export includes:"),
    bullet("Profile information (name, email, phone, account dates)."),
    bullet("All saved delivery addresses."),
    bullet("Complete order history, including items, totals, and tracking numbers."),
    bullet("All reviews you have submitted."),
    bullet("Your wishlist."),
    bullet("All in-app notifications sent to your account."),
    bullet("Your account preferences (newsletter opt-ins, style preferences, budget range)."),
    body(
      "To download your data, sign in to your account and visit /account/privacy. The export does not include your password hash or session tokens."
    ),
    h2("6.2 Account Deletion (Right to Erasure)"),
    body(
      "You can permanently delete your Aura Living account at any time from /account/privacy. The deletion process requires you to type your email address exactly as it appears on your account — this safety check prevents accidental deletion."
    ),
    body("When you confirm deletion, the following happens:"),
    bullet("Your user account record is permanently deleted."),
    bullet("All saved delivery addresses are deleted."),
    bullet("Your wishlist is deleted."),
    bullet("All reviews you have submitted are deleted."),
    bullet("All in-app notifications sent to your account are deleted."),
    bullet("All active sessions are revoked."),
    bullet("Your account preferences are deleted."),
    body(
      "Order records are not deleted. Pakistani tax law requires businesses to retain order records for 5 years. However, all personally identifying information in those records — name, address, phone, email — is anonymized (replaced with the string “[deleted]”) and the order is detached from your user account. This means the order continues to exist for tax and accounting purposes, but it can no longer be linked to you."
    ),
    body(
      "Account deletion is irreversible. If you wish to shop with Aura Living again after deletion, you will need to create a new account."
    ),
    h2("6.3 Cookie Consent"),
    body(
      "Aura Living uses a cookie consent banner that appears on your first visit. You may accept or decline non-essential cookies. Essential cookies — those required for the cart, authentication, and security — are always active and cannot be declined, because without them the website cannot function."
    ),
    body(
      "You can change your consent choice at any time by clearing your browser cookies for auraliving.com, which will cause the consent banner to reappear on your next visit."
    ),
    h2("6.4 PCI Compliance Note"),
    body(
      "Aura Living operates exclusively on Cash on Delivery (COD). We do not collect, store, or transmit any payment card data — credit cards, debit cards, or otherwise. Because no card data passes through our systems, the Payment Card Industry Data Security Standard (PCI DSS) requirements for card storage do not apply to Aura Living at this time."
    ),
    body(
      "When online payment methods (such as JazzCash, EasyPaisa, or card payments via a third-party gateway) are added in the future, they will be integrated through PCI-DSS-compliant third-party processors. Aura Living will never store full card numbers, CVVs, or PINs on its own systems."
    ),
    h2("6.5 Age Verification"),
    body(
      "Aura Living requires all account holders to be at least 18 years of age. By creating an account, you represent and warrant that you are at least 18. We do not knowingly collect personal information from anyone under 18. If you believe a minor has created an account or placed an order, please contact privacy@auraliving.com and we will investigate and delete the account and any associated data."
    ),
    body(
      "Age verification is performed through a check-the-box representation at signup rather than documentary verification. This is consistent with standard practice for e-commerce sites that do not sell age-restricted goods. If Aura Living begins selling age-restricted goods in the future, the age verification process will be reviewed and strengthened as needed."
    ),
    h2("6.6 Data Subject Request Process"),
    body(
      "If you wish to exercise any of the rights described in this section but do not have an active Aura Living account (for example, if you previously deleted your account), you can submit a request by emailing privacy@auraliving.com from the email address associated with your data."
    ),
    body(
      "We will verify your identity before responding. We respond to all verified requests within 30 days. If a request is complex or numerous, we may extend this period by a further 60 days, in which case we will inform you of the extension and the reasons for it within the first 30 days."
    ),
  ];
}

function buildDocumentControl() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    h1("7. Document Control"),
    h2("7.1 Version History"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [
            cellHeader("Version"),
            cellHeader("Date"),
            cellHeader("Summary of Changes"),
            cellHeader("Approved By"),
          ],
        }),
        new TableRow({
          cantSplit: true,
          children: [
            cellBody("1.0"),
            cellBody("30 June 2026"),
            cellBody("Initial publication. Includes Terms, Privacy, Returns, Shipping, Contact, and GDPR Compliance sections."),
            cellBody("【Atelier Manager】"),
          ],
        }),
        new TableRow({
          cantSplit: true,
          children: [
            cellBody("1.1"),
            cellBody("【____/____/____】"),
            cellBody("【Describe changes: e.g. updated shipping costs, added payment methods, revised return window】"),
            cellBody("【Approver】"),
          ],
        }),
        new TableRow({
          cantSplit: true,
          children: [
            cellBody("1.2"),
            cellBody("【____/____/____】"),
            cellBody("【Describe changes】"),
            cellBody("【Approver】"),
          ],
        }),
      ],
    }),
    h2("7.2 Ownership & Review"),
    body(
      "This document is owned by the Aura Living Atelier Manager. It must be reviewed at least once every 12 months, or sooner if there is a material change to: (a) Aura Living’s products, services, or operations; (b) applicable Pakistani law; (c) the technologies used to operate the website; or (d) the third-party service providers we work with."
    ),
    body(
      "When this document is updated, all changes must be reflected on the corresponding website pages within 5 business days. The “Last updated” date on each website page must be updated to match the date of the most recent change in this document."
    ),
    h2("7.3 Publication Locations"),
    body("This document corresponds to the following pages on the Aura Living website:"),
    bulletRich([{ text: "/terms", bold: true }, { text: " — Terms of Service" }]),
    bulletRich([{ text: "/privacy", bold: true }, { text: " — Privacy Policy" }]),
    bulletRich([{ text: "/returns", bold: true }, { text: " — Returns & Exchanges Policy" }]),
    bulletRich([{ text: "/shipping-info", bold: true }, { text: " — Shipping Information" }]),
    bulletRich([{ text: "/contact", bold: true }, { text: " — Contact page (web form + direct contact details)" }]),
    bulletRich([{ text: "/account/privacy", bold: true }, { text: " — Account privacy page (data export + account deletion UI)" }]),
    bulletRich([{ text: "Footer of every page", bold: true }, { text: " — links to Shipping, Returns, Privacy, Terms, and Contact" }]),
    h2("7.4 Approval"),
    body("This document is approved for publication by:"),
    new Paragraph({
      spacing: { before: 480, after: 120 },
      children: [
        new TextRun({ text: "Name: ", bold: true, size: 22, color: P.body, font: FONT }),
        new TextRun({ text: "【Atelier Manager — please fill in】", size: 22, color: P.body, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: "Signature: ", bold: true, size: 22, color: P.body, font: FONT }),
        new TextRun({ text: "____________________________", size: 22, color: P.body, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: "Date: ", bold: true, size: 22, color: P.body, font: FONT }),
        new TextRun({ text: "【____/____/____】", size: 22, color: P.body, font: FONT }),
      ],
    }),
  ];
}

function cellHeader(text) {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: P.surface, color: "auto" },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22, color: P.primary, font: FONT })],
      }),
    ],
  });
}

function cellBody(text) {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 21, color: P.body, font: FONT })],
      }),
    ],
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 6. ASSEMBLE DOCUMENT
// ────────────────────────────────────────────────────────────────────────────

const headerStandard = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: P.hairline, space: 4 } },
      children: [
        new TextRun({ text: "Aura Living", size: 18, color: P.secondary, font: FONT, italics: true }),
        new TextRun({ text: "  ·  Legal & Compliance Document", size: 18, color: P.secondary, font: FONT }),
      ],
    }),
  ],
});

const footerStandard = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: P.hairline, space: 4 } },
      children: [
        new TextRun({ text: "© 2026 Aura Living Atelier  ·  ", size: 18, color: P.secondary, font: FONT }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary, font: FONT }),
      ],
    }),
  ],
});

const footerTOC = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary, font: FONT }),
      ],
    }),
  ],
});

const doc = new Document({
  creator: "Aura Living",
  title: "Aura Living — Legal & Compliance Document",
  description: "Terms, Privacy, Returns, Shipping, Contact, and GDPR policies for Aura Living.",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 480, after: 240, line: 360 } },
      },
      heading2: {
        run: { font: FONT, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 340 } },
      },
      heading3: {
        run: { font: FONT, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 240, after: 120, line: 320 } },
      },
    },
  },
  sections: [
    // Section 1 — Cover (no header/footer, no page number)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: buildCover(),
    },
    // Section 2 — TOC (Roman numerals)
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      headers: { default: headerStandard },
      footers: { default: footerTOC },
      children: buildTOC(),
    },
    // Section 3 — Body (Arabic, reset to 1)
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: { default: headerStandard },
      footers: { default: footerStandard },
      children: [
        ...buildIntroduction(),
        ...buildTerms(),
        ...buildPrivacy(),
        ...buildReturns(),
        ...buildShipping(),
        ...buildContact(),
        ...buildGDPR(),
        ...buildDocumentControl(),
      ],
    },
  ],
});

// ────────────────────────────────────────────────────────────────────────────
// 7. WRITE FILE
// ────────────────────────────────────────────────────────────────────────────

const OUTPUT = "/home/z/my-project/download/Aura-Living-Legal-Compliance-Document.docx";

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("✓ Generated:", OUTPUT);
  console.log("  Size:", (buf.length / 1024).toFixed(1), "KB");
});
