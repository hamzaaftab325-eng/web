import type { Metadata } from "next";
import { PageHero } from "@/components/aura/layout/PageHero";

export const metadata: Metadata = {
  title: "Aura Living - Terms of Service",
  description:
    "The terms that govern your use of Aura Living's website and your purchase of considered objects for the considered home.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        image="/hero/sustainability.webp"
        alt="A quiet workspace with considered objects arranged on warm wood shelves."
        eyebrow="Legal"
        headline="Terms of Service"
      />
      <article className="container-aura py-16 md:py-24 max-w-3xl">
        <p className="t-caption c-ink-faint mb-8">
          Last updated: June 30, 2026
        </p>

        <div className="prose-aura space-y-10">
          <section>
            <h2 className="font-display text-2xl c-ink mb-4">1. Acceptance of Terms</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              Welcome to Aura Living. By accessing or using our website at
              auraliving.com (the &quot;Site&quot;), browsing our products, creating
              an account, or placing an order, you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these
              Terms, please do not use the Site. These Terms form a legally
              binding agreement between you and Aura Living (&quot;we&quot;,
              &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              We may update these Terms from time to time. When we do, we will
              revise the &quot;Last updated&quot; date at the top of this page.
              Your continued use of the Site after any change constitutes your
              acceptance of the new Terms. We encourage you to review this page
              periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">2. Eligibility</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              You must be at least 18 years of age to create an account and place
              an order on the Site. By using the Site, you represent and warrant
              that you are at least 18, that you have the legal capacity to enter
              into these Terms, and that the information you provide to us is
              accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">3. Your Account</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              When you create an Aura Living account, you are responsible for
              maintaining the confidentiality of your password and for all
              activity that occurs under your account. You agree to notify us
              immediately of any unauthorized use of your account or any other
              security breach. We are not liable for any loss or damage arising
              from your failure to protect your account credentials.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              You agree to provide accurate, current, and complete information
              during registration and to update that information to keep it
              accurate. We reserve the right to suspend or terminate accounts that
              we believe violate these Terms or that engage in fraudulent,
              abusive, or unlawful activity.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">4. Orders and Pricing</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              All orders placed through the Site are subject to acceptance and
              availability. We reserve the right to refuse or cancel any order at
              any time, including after the order has been confirmed, in cases of
              product unavailability, pricing errors, or suspected fraudulent
              activity. If we cancel an order after payment has been processed,
              we will issue a full refund to your original payment method.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              All prices are listed in Pakistani Rupees (PKR) and include
              applicable taxes unless otherwise stated. Shipping costs are
              calculated at checkout based on your delivery address. We currently
              accept Cash on Delivery (COD) as our primary payment method. By
              placing an order, you authorize us to deliver the products to the
              address you provide and to collect payment upon delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">5. Product Information</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We make every effort to display our products and their colors
              accurately. However, we cannot guarantee that your device&apos;s
              display will accurately reflect the actual color, texture, or scale
              of any product. Many of our pieces are handmade by artisans, meaning
              slight variations in finish, texture, and dimension are inherent to
              the craft and are not considered defects. These variations are the
              mark of a real person, not a machine.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              Product descriptions, dimensions, and care instructions are provided
              in good faith. If you receive a product that does not match its
              description, please contact us within 7 days of delivery — see our
              Returns Policy for details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">6. Intellectual Property</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              All content on the Site — including product photography, written
              copy, the Aura Living name and logo, journal articles, and the
              overall look and feel of the Site — is owned by Aura Living or used
              with permission. You may not reproduce, distribute, modify, or
              commercially exploit any content from the Site without our prior
              written consent.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              You may share product links and images for personal, non-commercial
              purposes. If you wish to use our content for editorial or press
              purposes, please contact us at concierge@auraliving.com.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">7. Prohibited Conduct</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              You agree not to: (a) use the Site for any unlawful purpose;
              (b) attempt to gain unauthorized access to any part of the Site, our
              systems, or another user&apos;s account; (c) interfere with the
              proper functioning of the Site, including by introducing viruses or
              other malicious code; (d) scrape, crawl, or use automated means to
              collect data from the Site without our consent; (e) use the Site to
              send unsolicited communications; or (f) impersonate any other person
              or entity.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">8. Limitation of Liability</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              The Site and all products are provided &quot;as is&quot; and
              &quot;as available&quot;. To the fullest extent permitted by law,
              Aura Living is not liable for any indirect, incidental, special, or
              consequential damages arising from your use of the Site or any
              product purchased through it. Our total liability for any claim
              arising from your use of the Site is limited to the amount you paid
              for the product(s) in question.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">9. Governing Law</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              These Terms are governed by the laws of Pakistan. Any dispute
              arising from these Terms or your use of the Site will be resolved in
              the courts of Lahore, Pakistan, without regard to conflict of law
              principles.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">10. Contact</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              If you have any questions about these Terms, please contact us at
              concierge@auraliving.com or write to us at our registered address in
              Lahore, Pakistan. We aim to respond to all enquiries within two
              business days.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
