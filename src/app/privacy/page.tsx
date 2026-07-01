import type { Metadata } from "next";
import { PageHero } from "@/components/aura/layout/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy — Aura Living",
  description:
    "How Aura Living collects, uses, and protects your personal information when you browse our site, place an order, or subscribe to our newsletter.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        image="/hero/about.webp"
        alt="A quiet interior with considered objects arranged on warm wood shelves."
        eyebrow="Legal"
        headline="Privacy Policy"
      />
      <article className="container-aura py-16 md:py-24 max-w-3xl">
        <p className="t-caption c-ink-faint mb-8">Last updated: June 30, 2026</p>

        <div className="prose-aura space-y-10">
          <section>
            <p className="t-body c-ink-muted leading-relaxed">
              At Aura Living, we treat your personal information with the same
              care we apply to sourcing our objects. This Privacy Policy explains
              what we collect, why we collect it, how we use it, and the choices
              you have. By using our website or placing an order, you consent to
              the practices described here.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">1. Information We Collect</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">
              We collect information in three ways:
            </p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li>
                <strong>Information you provide:</strong> your name, email
                address, phone number, delivery address, and any other details
                you share when creating an account, placing an order, subscribing
                to our newsletter, or contacting us.
              </li>
              <li>
                <strong>Information collected automatically:</strong> your IP
                address, browser type, device information, pages visited, and
                referring URLs. We use cookies and similar technologies to gather
                this data — see our cookie section below.
              </li>
              <li>
                <strong>Order information:</strong> the products you order,
                payment method (Cash on Delivery), delivery instructions, and
                order history.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">2. How We Use Your Information</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">We use your information to:</p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li>Process and deliver your orders, including COD collection.</li>
              <li>Communicate with you about your orders, returns, and enquiries.</li>
              <li>Send you our newsletter and journal content, if you subscribe.</li>
              <li>Improve our products, content, and the Site&apos;s usability.</li>
              <li>Detect and prevent fraud, abuse, and unauthorized access.</li>
              <li>Comply with our legal and tax obligations in Pakistan.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">3. Cookies and Similar Technologies</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We use cookies to remember your preferences (such as theme and
              language), to keep you signed in, to understand how the Site is
              used, and to improve your shopping experience. When you first visit
              the Site, we show a cookie consent banner that lets you accept or
              decline non-essential cookies. You can change your choice at any
              time by clearing your browser cookies.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              Essential cookies (for cart, authentication, and security) are
              always active. Analytics and marketing cookies are only set after
              you consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">4. Sharing Your Information</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We do not sell your personal information. We share it only with
              trusted service providers who help us run our business — for
              example, delivery companies that fulfill your orders, email service
              providers that send our newsletter, and cloud hosting providers
              that store our data. These providers are bound by confidentiality
              obligations and may only use your information to provide services
              to us.
            </p>
            <p className="t-body c-ink-muted leading-relaxed">
              We may also disclose your information when required by law, court
              order, or to protect our rights, property, or safety.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">5. Data Retention</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We retain your personal information for as long as your account is
              active, or as long as needed to provide our services. Order records
              are retained for the period required by Pakistani tax law
              (typically 5 years). Newsletter subscriptions are retained until
              you unsubscribe — which you can do at any time via the unsubscribe
              link in any email or through your account settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">6. Your Rights (GDPR-style)</h2>
            <p className="t-body c-ink-muted leading-relaxed mb-4">
              Depending on where you live, you may have the following rights over
              your personal data:
            </p>
            <ul className="t-body c-ink-muted leading-relaxed space-y-2 list-disc pl-6">
              <li>
                <strong>Access:</strong> request a copy of the personal data we
                hold about you. You can download your full data export from your
                account settings.
              </li>
              <li>
                <strong>Correction:</strong> request that we correct inaccurate
                or incomplete information.
              </li>
              <li>
                <strong>Deletion:</strong> request that we delete your personal
                data, subject to legal retention requirements (such as tax
                records). You can initiate deletion from your account settings or
                by contacting us.
              </li>
              <li>
                <strong>Opt-out:</strong> unsubscribe from marketing
                communications at any time.
              </li>
              <li>
                <strong>Withdraw consent:</strong> withdraw your consent to
                non-essential cookies at any time.
              </li>
            </ul>
            <p className="t-body c-ink-muted leading-relaxed">
              To exercise any of these rights, email
              privacy@auraliving.com. We respond to all verified requests within
              30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">7. Security</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We use industry-standard measures to protect your information,
              including encrypted (HTTPS) connections, hashed passwords, and
              secure httpOnly cookies for authentication. No method of
              transmission over the internet is 100% secure, but we work hard to
              protect your data and never store full payment card details (we
              use Cash on Delivery exclusively, so no card data is collected).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">8. Children&apos;s Privacy</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              The Site is not intended for anyone under 18. We do not knowingly
              collect personal information from children. If you believe a child
              has provided us with personal information, please contact us and we
              will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">9. Changes to This Policy</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we
              will revise the &quot;Last updated&quot; date at the top of this
              page. For significant changes, we will notify you via email or a
              prominent notice on the Site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl c-ink mb-4">10. Contact</h2>
            <p className="t-body c-ink-muted leading-relaxed">
              If you have any questions about this Privacy Policy or how we
              handle your data, please email privacy@auraliving.com or write to
              us at our registered address in Lahore, Pakistan.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
