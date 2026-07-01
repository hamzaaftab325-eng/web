import type { Metadata } from "next";
import { PageHero } from "@/components/aura/layout/PageHero";

export const metadata: Metadata = {
  title: "Returns & Exchanges — Aura Living",
  description:
    "Our returns and exchanges policy for Aura Living. Handmade pieces, considered returns — request a return within 7 days of delivery.",
  robots: { index: true, follow: true },
};

export default function ReturnsPage() {
  return (
    <>
      <PageHero
        image="/hero/care.png"
        alt="A considered workspace with ceramics and care guides arranged on warm wood."
        eyebrow="Service"
        headline="Returns & Exchanges"
      />
      <article className="container-aura py-16 md:py-24 max-w-3xl">
        <p className="t-caption c-ink-faint mb-8">Last updated: June 30, 2026</p>

        <div className="prose-aura space-y-10">
          <section>
            <p className="t-body c-ink-muted leading-relaxed">
              Many of our pieces are made by hand in small workshops. Slight
              variations in finish, texture, and dimension are the mark of the
              maker and are not considered defects. That said, if a piece
              doesn&apos;t feel right for your home, we want to make it easy to
              send it back.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">1. Return Window</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              You may request a return within <strong>7 days of delivery</strong>.
              To start a return, email concierge@auraliving.com with your order
              number and the item(s) you wish to return. We will reply with a
              return authorization and instructions within two business days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">2. Conditions for Return</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">
              To be eligible for a return, your item must be:
            </p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li>In its original, unused condition.</li>
              <li>In its original packaging, including any dust bags or tags.</li>
              <li>Accompanied by the original order confirmation or receipt.</li>
              <li>Free from scratches, chips, or signs of wear.</li>
            </ul>
            <p className="t-body c-ink-muted leading-relaxed mt-4">
              Certain items are <strong>final sale</strong> and cannot be
              returned: candles (for safety), live plants (perishable), and any
              item marked &quot;Final Sale&quot; on its product page. These are
              clearly marked before purchase.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">3. Damaged or Defective Items</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              If your item arrives damaged or defective, please email us within
              <strong> 48 hours of delivery</strong> with photos of the item and
              its packaging. We will arrange a free replacement or a full refund,
              including the original shipping cost. We do not require damaged
              items to be returned — they are yours to keep or recycle.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">4. Refunds</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              Once we receive and inspect your returned item, we will notify you
              by email. If approved, your refund will be processed within
              <strong> 5–7 business days</strong>. Because we operate on Cash on
              Delivery, refunds are issued via bank transfer to the account you
              provide at the time of return authorization. Original shipping
              costs are non-refundable unless the return is due to our error
              (damaged or wrong item shipped).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">5. Exchanges</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              To exchange an item for a different size, color, or variant,
              email us within 7 days of delivery. The fastest way is to return
              the original item for a refund and place a new order for the
              variant you want — this avoids waiting for the return to be
              processed before the new item ships. We are happy to help you
              coordinate this.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">6. Return Shipping</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              The cost of return shipping is the customer&apos;s responsibility,
              except in cases of damaged, defective, or wrongly shipped items.
              We recommend using a trackable courier service. We are not
              responsible for returns lost in transit. For customers in Lahore,
              we can arrange a pickup for a flat fee of ₨300 — mention this when
              requesting your return authorization.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">7. Order Cancellations</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              Orders can be cancelled free of charge if you contact us within
              <strong> 12 hours</strong> of placing them. After that, the order
              enters our fulfillment process and may not be cancellable. If the
              order has already shipped, please follow the standard return
              process once it arrives.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">8. Contact</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              For any return, exchange, or order cancellation, email
              concierge@auraliving.com. Please include your order number in the
              subject line — it speeds up our response considerably.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
