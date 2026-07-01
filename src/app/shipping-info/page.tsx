import type { Metadata } from "next";
import { PageHero } from "@/components/aura/layout/PageHero";

export const metadata: Metadata = {
  title: "Shipping Information — Aura Living",
  description:
    "How Aura Living ships your orders — delivery times, costs, and coverage across Pakistan. Cash on Delivery available nationwide.",
  robots: { index: true, follow: true },
};

export default function ShippingInfoPage() {
  return (
    <>
      <PageHero
        image="/hero/shop.png"
        alt="A curated home décor showroom with packages and considered objects."
        eyebrow="Service"
        headline="Shipping Information"
      />
      <article className="container-aura py-16 md:py-24 max-w-3xl">
        <p className="t-caption c-ink-faint mb-8">Last updated: June 30, 2026</p>

        <div className="prose-aura space-y-10">
          <section>
            <p className="t-body c-ink-muted leading-relaxed">
              We ship across Pakistan via trusted couriers. Every order is
              packed by hand — wrapped in recycled paper, cushioned with
              biodegradable fill, and sealed with paper tape. Our packaging is
              designed to protect the piece in transit and to be kind to the
              planet.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">1. Delivery Coverage</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We deliver to all major cities and most rural areas in Pakistan.
              If your address is in a remote area where our standard couriers do
              not deliver, we will contact you to arrange an alternative or
              refund your order in full. You can check delivery availability by
              entering your postal code at checkout.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">2. Delivery Times</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">
              Standard delivery times after order dispatch:
            </p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li><strong>Lahore, Karachi, Islamabad, Rawalpindi:</strong> 2–3 business days</li>
              <li><strong>Other major cities:</strong> 3–5 business days</li>
              <li><strong>Smaller towns and rural areas:</strong> 5–7 business days</li>
            </ul>
            <p className="t-body c-ink-muted leading-relaxed mt-4">
              Orders are typically dispatched within 1–2 business days of being
              placed. During sales, journal launches, or holiday periods,
              dispatch may take an extra business day. You will receive a
              tracking number by email and SMS once your order ships.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">3. Shipping Costs</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">
              Shipping is calculated at checkout based on your delivery address:
            </p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li><strong>Standard shipping (nationwide):</strong> ₨150</li>
              <li><strong>Free standard shipping on orders over ₨15,000</strong></li>
              <li><strong>Lahore local delivery:</strong> ₨100 (1–2 business days)</li>
            </ul>
            <p className="t-body c-ink-muted leading-relaxed mt-4">
              Shipping costs are non-refundable except in cases where we ship the
              wrong item or the item arrives damaged. See our Returns Policy for
              details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">4. Cash on Delivery (COD)</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              All orders are shipped Cash on Delivery. The courier will collect
              the exact order amount in cash upon delivery. Please have the
              correct amount ready — our couriers do not carry change. If you
              are not available to receive the order, the courier will attempt
              delivery two more times over the following 5 days. After three
              failed attempts, the order is returned to us and cancelled.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              We do not currently support online payment via credit/debit card,
              JazzCash, or EasyPaisa. We are working on adding these in the
              future.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">5. Order Tracking</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              Once your order ships, you will receive an email and SMS with a
              tracking number and a link to track your parcel in real time. You
              can also view your order status anytime in your account under
              Orders. If you have not received tracking information within 4
              business days of placing your order, please email
              concierge@auraliving.com.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">6. Packaging</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              Fragile items (ceramics, mirrors, glass) are double-boxed with
              extra cushioning. Live plants are shipped in secure nursery pots
              with a moisture barrier. Each package includes a small care card
              so you know how to settle your new piece into your home. If your
              package arrives visibly damaged, please refuse delivery or note
              the damage on the courier&apos;s slip before signing — this
              speeds up our claims process.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">7. International Shipping</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We currently ship only within Pakistan. For international
              enquiries, please contact concierge@auraliving.com — we are
              exploring international shipping options and will announce them
              in our newsletter when available.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">8. Contact</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              For shipping questions, delivery updates, or to change your
              delivery address after ordering, email
              concierge@auraliving.com or call us during business hours.
              Address changes are easiest to accommodate within 12 hours of
              placing your order.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
