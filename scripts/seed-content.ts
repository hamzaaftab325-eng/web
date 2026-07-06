import { db } from "../src/lib/db";

/**
 * Seed script — adds essential content to the database.
 * Run with: DATABASE_URL=... npx tsx scripts/seed-content.ts
 *
 * Adds:
 * - 4 hero slides (using existing /hero/slide-*.png images)
 * - First order offer (10% off with AURA10 code)
 * - Exit intent popup
 * - Promo code AURA10
 * - Default shipping method (Standard)
 * - FAQ items
 * - Testimonials
 * - Brand values
 */

async function main() {
  console.log("Seeding database...\n");

  // 1. Hero Slides
  const existingSlides = await db.heroSlide.count();
  if (existingSlides === 0) {
    console.log("Adding hero slides...");
    await db.heroSlide.createMany({
      data: [
        {
          imageUrl: "/hero/slide-1.webp",
          eyebrow: "New — The Plant Edit",
          headline: "Considered objects, considered home.",
          subtitle: "Warm minimalism, artisanal craft, lived-in elegance. A small atelier of lamps, mirrors, plants, and ceramics — sourced from workshops we know by name.",
          ctaLabel: "Shop the Collection",
          ctaLink: "/shop",
          altText: "A sun-warm living room with a brass arc lamp, an arched oak mirror, and ceramics arranged on a low shelf.",
          sortOrder: 0,
          isActive: true,
        },
        {
          imageUrl: "/hero/slide-2.webp",
          eyebrow: "The Lighting Edit",
          headline: "Light, layered like afternoon sun.",
          subtitle: "Sculptural table lamps, smoky glass sconces, and linen pendants — each one thrown, blown, or sewn by hand, each one casting its own warmth.",
          ctaLabel: "Explore Lighting",
          ctaLink: "/shop",
          altText: "A curated console table with a sculptural ceramic table lamp, art books, and a smoky glass wall sconce.",
          sortOrder: 1,
          isActive: true,
        },
        {
          imageUrl: "/hero/slide-3.webp",
          eyebrow: "Quiet Corners",
          headline: "A room breathes where light rests.",
          subtitle: "A reading nook, a fiddle leaf, a single linen cushion — the small notes that finish a room, sourced slowly and made to outlast a season.",
          ctaLabel: "Browse the Shop",
          ctaLink: "/shop",
          altText: "A quiet reading nook by a tall window with a desk lamp, a fiddle leaf fig, and a low oak bench.",
          sortOrder: 2,
          isActive: true,
        },
        {
          imageUrl: "/hero/slide-4.webp",
          eyebrow: "The Shelf Edit",
          headline: "Small notes that finish a room.",
          subtitle: "Obsidian bookends, hand-painted ceramics, pressed botanicals, and beeswax tapers — the considered objects that turn a shelf into a still life.",
          ctaLabel: "Shop Accessories",
          ctaLink: "/shop",
          altText: "A warm minimalist shelf vignette with a hand-painted ceramic pot, art books, and a pressed botanical frame.",
          sortOrder: 3,
          isActive: true,
        },
      ],
    });
    console.log("  ✓ Added 4 hero slides");
  } else {
    console.log(`  ○ Hero slides already exist (${existingSlides})`);
  }

  // 2. First Order Offer
  const existingOffer = await db.firstOrderOffer.count();
  if (existingOffer === 0) {
    console.log("Adding first order offer...");
    await db.firstOrderOffer.create({
      data: {
        isActive: true,
        discountPercent: 10,
        promoCode: "WELCOME10",
        popupTitle: "First order? 10% off",
        popupDescription: "Sign up to reveal your code and get 10% off your first order.",
        bannerText: "First order? Get 10% off with code WELCOME10",
        dismissDurationDays: 30,
        showDelayMs: 3000,
      },
    });
    console.log("  ✓ Added first order offer (WELCOME10, 10% off)");
  } else {
    console.log(`  ○ First order offer already exists`);
  }

  // 3. Exit Intent Popup
  const existingExit = await db.exitIntentPopup.count();
  if (existingExit === 0) {
    console.log("Adding exit intent popup...");
    await db.exitIntentPopup.create({
      data: {
        isActive: true,
        title: "Wait! 10% off your first order",
        description: "Enter your email for a one-time discount code.",
        discountPercent: 10,
        promoCode: "WELCOME10",
        imageUrl: "",
        triggerDelaySeconds: 30,
      },
    });
    console.log("  ✓ Added exit intent popup");
  } else {
    console.log(`  ○ Exit intent popup already exists`);
  }

  // 4. Promo Code
  const existingPromo = await db.promoCode.count();
  if (existingPromo === 0) {
    console.log("Adding promo code WELCOME10...");
    await db.promoCode.create({
      data: {
        code: "WELCOME10",
        type: "percent",
        value: 10,
        label: "10% off — first order welcome",
        minOrder: 0,
        maxUses: null,
        isActive: true,
      },
    });
    console.log("  ✓ Added promo code WELCOME10 (10% off, no minimum)");
  } else {
    console.log(`  ○ Promo codes already exist (${existingPromo})`);
  }

  // 5. Shipping Method
  const existingShipping = await db.shippingMethod.count();
  if (existingShipping === 0) {
    console.log("Adding default shipping method...");
    await db.shippingMethod.create({
      data: {
        code: "STANDARD",
        name: "Standard Delivery",
        description: "Insured ground delivery across Pakistan",
        baseCost: 150,
        freeThreshold: 10000,
        estimatedDays: "3-5 business days",
        isActive: true,
        sortOrder: 0,
      },
    });
    console.log("  ✓ Added Standard shipping (₨150, free over ₨10,000)");
  } else {
    console.log(`  ○ Shipping methods already exist (${existingShipping})`);
  }

  // 6. FAQ Items
  const existingFaq = await db.faqItem.count();
  if (existingFaq === 0) {
    console.log("Adding FAQ items...");
    await db.faqItem.createMany({
      data: [
        {
          category: "Shipping",
          question: "How long does shipping take?",
          answer: "Orders are typically delivered within 3-5 business days across Pakistan. You'll receive a tracking number once your order ships.",
          sortOrder: 0,
          isActive: true,
        },
        {
          category: "Shipping",
          question: "Do you offer free shipping?",
          answer: "Yes! Orders over ₨10,000 qualify for free standard shipping. The discount is applied automatically at checkout.",
          sortOrder: 1,
          isActive: true,
        },
        {
          category: "Payment",
          question: "What payment methods do you accept?",
          answer: "We currently accept Cash on Delivery (COD) across Pakistan. Online payment methods (JazzCash, EasyPaisa, Bank Transfer) are coming soon.",
          sortOrder: 2,
          isActive: true,
        },
        {
          category: "Returns",
          question: "What is your return policy?",
          answer: "We accept returns within 14 days of delivery. Items must be in original condition. Contact us to initiate a return.",
          sortOrder: 3,
          isActive: true,
        },
        {
          category: "Products",
          question: "Are your products handmade?",
          answer: "Yes, every piece in our collection is handcrafted by skilled artisans. Slight variations in color and texture are natural and make each piece unique.",
          sortOrder: 4,
          isActive: true,
        },
        {
          category: "Products",
          question: "How do I care for my purchase?",
          answer: "Each product comes with specific care instructions. You can also visit our Care Guides page for material-specific care tips.",
          sortOrder: 5,
          isActive: true,
        },
      ],
    });
    console.log("  ✓ Added 6 FAQ items");
  } else {
    console.log(`  ○ FAQ items already exist (${existingFaq})`);
  }

  // 7. Testimonials
  const existingTestimonials = await db.testimonial.count();
  if (existingTestimonials === 0) {
    console.log("Adding testimonials...");
    await db.testimonial.createMany({
      data: [
        {
          authorName: "Ayesha Khan",
          authorLocation: "Lahore",
          quote: "The ceramic lamp I ordered is even more beautiful in person. The quality is exceptional and it arrived perfectly packed.",
          rating: 5,
          sortOrder: 0,
          isActive: true,
        },
        {
          authorName: "Bilal Ahmed",
          authorLocation: "Karachi",
          quote: "Beautiful pieces that feel made, not manufactured. The brass finish on the mirror is exactly what I wanted for my entryway.",
          rating: 5,
          sortOrder: 1,
          isActive: true,
        },
        {
          authorName: "Fatima Riaz",
          authorLocation: "Islamabad",
          quote: "Fast shipping and gorgeous products. The terracotta planter has become the centerpiece of my living room.",
          rating: 5,
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
    console.log("  ✓ Added 3 testimonials");
  } else {
    console.log(`  ○ Testimonials already exist (${existingTestimonials})`);
  }

  // 8. Brand Values
  const existingBrand = await db.brandValue.count();
  if (existingBrand === 0) {
    console.log("Adding brand values...");
    await db.brandValue.createMany({
      data: [
        { title: "Artisan Crafted", description: "Every piece is handcrafted by skilled artisans in workshops we know by name.", icon: "Hand", sortOrder: 0, isActive: true },
        { title: "Slow Sourcing", description: "We source slowly and deliberately — no mass production, no compromises on quality.", icon: "Leaf", sortOrder: 1, isActive: true },
        { title: "Made to Last", description: "Built from natural materials to outlast trends and seasons, not just survive them.", icon: "Shield", sortOrder: 2, isActive: true },
        { title: "Considered Design", description: "Warm minimalism that breathes — objects that earn their place in your home.", icon: "Sparkles", sortOrder: 3, isActive: true },
      ],
    });
    console.log("  ✓ Added 4 brand values");
  } else {
    console.log(`  ○ Brand values already exist (${existingBrand})`);
  }

  // Summary
  console.log("\nSeed complete! Database counts:");
  console.log("  Hero slides:", await db.heroSlide.count());
  console.log("  First order offers:", await db.firstOrderOffer.count());
  console.log("  Exit intent popups:", await db.exitIntentPopup.count());
  console.log("  Promo codes:", await db.promoCode.count());
  console.log("  Shipping methods:", await db.shippingMethod.count());
  console.log("  FAQ items:", await db.faqItem.count());
  console.log("  Testimonials:", await db.testimonial.count());
  console.log("  Brand values:", await db.brandValue.count());
  console.log("  Products:", await db.product.count());
  console.log("  Categories:", await db.category.count());
  console.log("  Collections:", await db.collection.count());
}

main()
  .catch((e) => console.error("Seed failed:", e))
  .finally(() => db.$disconnect().then(() => process.exit(0)));
