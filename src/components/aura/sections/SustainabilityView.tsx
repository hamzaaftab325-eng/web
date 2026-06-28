"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Hammer,
  Compass,
  Heart,
  ArrowRight,
  MapPin,
  Check,
  Award,
  Target,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";

/**
 * SustainabilityView — the full transparency report.
 *
 * Five editorial sections, in spec order:
 *   1. Materials sourcing index (data table)
 *   2. Workshop map (location grid)
 *   3. Certifications (badge grid)
 *   4. Environmental impact (image + metrics)
 *   5. Future commitments (dated targets)
 *
 * Plus the existing principles section (kept as a present-tense
 * statement of how we work today) and a closing report CTA.
 */

interface SourcingRow {
  material: string;
  origin: string;
  workshop: string;
  certified: string;
}

const SOURCING_ROWS: SourcingRow[] = [
  {
    material: "Stoneware clay",
    origin: "Barcelos, Portugal",
    workshop: "Mateus Ceramics Cooperative",
    certified: "ISO 14001 · Lead-free glazes",
  },
  {
    material: "Solid brass",
    origin: "Brescia, Italy",
    workshop: "Brescia Metalworks",
    certified: "Recycled-content 60% · RoHS",
  },
  {
    material: "Seagrass & jute",
    origin: "Dhaka, Bangladesh",
    workshop: "Dhaka Weaving Collective",
    certified: "Fair Trade Federation",
  },
  {
    material: "European flax linen",
    origin: "Normandy, France",
    workshop: "Dhaka Weaving Collective (sewing)",
    certified: "European Flax · Masters of Linen",
  },
  {
    material: "Living plants",
    origin: "Salem, Oregon",
    workshop: "Willamette Greenhouse",
    certified: "USDA Organic · neonicotinoid-free",
  },
  {
    material: "Marble & travertine",
    origin: "Carrara, Italy",
    workshop: "Atelier Pieri",
    certified: "Quarry-traced · ETICS verified",
  },
];

interface WorkshopLocation {
  name: string;
  location: string;
  craft: string;
  founded: string;
}

const WORKSHOPS: WorkshopLocation[] = [
  { name: "Cermica Porto", location: "Porto, Portugal", craft: "Stoneware ceramics", founded: "1978" },
  { name: "Mateus Ceramics Cooperative", location: "Barcelos, Portugal", craft: "Stoneware clay", founded: "1954" },
  { name: "Officina Brescia", location: "Brescia, Italy", craft: "Solid brass", founded: "1962" },
  { name: "Brescia Metalworks", location: "Brescia, Italy", craft: "Brass & copper", founded: "1948" },
  { name: "Terra Toscana", location: "Impruneta, Italy", craft: "Terracotta", founded: "1985" },
  { name: "Atelier Pieri", location: "Carrara, Italy", craft: "Marble & travertine", founded: "1971" },
  { name: "Lin Belge", location: "Ghent, Belgium", craft: "Belgian linen", founded: "2001" },
  { name: "Dhaka Weaving Collective", location: "Dhaka, Bangladesh", craft: "Seagrass & jute", founded: "1996" },
  { name: "Willamette Greenhouse", location: "Salem, Oregon", craft: "Living plants", founded: "2009" },
  { name: "Atelier Vetro", location: "Murano, Italy", craft: "Hand-blown glass", founded: "1989" },
  { name: "Hokkaido Stone Works", location: "Asahikawa, Japan", craft: "Obsidian & basalt", founded: "2003" },
];

interface Certification {
  name: string;
  issuer: string;
  scope: string;
}

const CERTIFICATIONS: Certification[] = [
  { name: "ISO 14001", issuer: "International Organization for Standardization", scope: "Environmental management at three ceramics workshops" },
  { name: "Fair Trade Federation", issuer: "Fair Trade Federation (USA)", scope: "Dhaka Weaving Cooperative  full-member verification" },
  { name: "European Flax", issuer: "European Confederation of Flax and Hemp", scope: "Traceable European flax fibre, retted in the field" },
  { name: "Masters of Linen", issuer: "CELC Masters of Linen", scope: "Spinning and weaving within the European flax chain" },
  { name: "USDA Organic", issuer: "United States Department of Agriculture", scope: "Willamette Greenhouse  soil, pest-control, and propagation" },
  { name: "RoHS Compliant", issuer: "EU Restriction of Hazardous Substances", scope: "All brass, wiring, and switches across the catalogue" },
  { name: "Quarry-traced", issuer: "ETICS verified, internal audit", scope: "Marble and travertine  every block logged from quarry to workshop" },
  { name: "Plastic-free Packaging", issuer: "Aura Living internal standard", scope: "100% of shipments  recycled paper, cotton tape, no plastic fill" },
];

interface Principle {
  icon: typeof Leaf;
  title: string;
  body: string;
}

const PRINCIPLES: Principle[] = [
  {
    icon: Hammer,
    title: "Made by hand, in small batches.",
    body: "Every ceramic, every brass piece, every textile  thrown, welded, or woven by a person, not a machine. We visit every workshop at least once a year and audit working conditions, pay equity, and environmental practice against a published rubric. Nothing is outsourced to a factory we have not walked through ourselves.",
  },
  {
    icon: Leaf,
    title: "Traced to the source.",
    body: "We publish the origin of every material  the clay, the brass, the linen  on each product page. Transparency is not a marketing line for us; it is the whole brief. If we cannot trace a material to a specific riverbank, foundry, or field, we do not sell it. The sourcing table above is the same data we hand to our auditors.",
  },
  {
    icon: Compass,
    title: "Designed for a decade.",
    body: "We design out of trend cycles. Every piece is meant to live with you for ten years, not one season  and to age into something better than the day it arrived. Brass patinas, linen softens, ceramic deepens. We do not release seasonal collections; we add to the permanent catalogue only when a piece is genuinely better than what already exists.",
  },
  {
    icon: Heart,
    title: "We answer our own emails.",
    body: "No bots, no offshore support team. Our concierge  Anna  reads every message herself and writes back within one business day. Write to us with anything: a question about a material, a request for a custom finish, a complaint about a shipping delay. We will write back. That is the entire support model.",
  },
];

interface ImpactMetric {
  value: string;
  label: string;
  context: string;
}

const IMPACT_METRICS: ImpactMetric[] = [
  { value: "100%", label: "Plastic-free packaging", context: "Recycled paper, cotton tape, no polymer fill. Across every shipment, since 2022." },
  { value: "60%", label: "Recycled brass", context: "Average recycled content across all brass pieces. Officina Brescia sources from a Lombardy foundry that recycles industrial scrap." },
  { value: "0", label: "Air-freighted shipments", context: "All inbound freight travels by sea or rail. We absorb the longer lead times; you absorb none of the carbon." },
  { value: "4.2t", label: "CO\u2082e per workshop / year", context: "Average across audited workshops. Industry benchmark for comparable small-batch manufacturers: 18 tonnes (UNIDO, 2023)." },
];

interface FutureCommitment {
  year: string;
  title: string;
  body: string;
  status: "in-progress" | "planned";
}

const FUTURE_COMMITMENTS: FutureCommitment[] = [
  {
    year: "By 2027",
    title: "100% renewable electricity at every workshop",
    body: "Four of eleven workshops currently run on certified renewable electricity. The remaining seven  all in Italy and Portugal  are scheduled for solar or grid-backed renewable contracts by the end of 2026, verified by RE100.",
    status: "in-progress",
  },
  {
    year: "By 2028",
    title: "Closed-loop water at all ceramics workshops",
    body: "Ceramics firing consumes water for clay wedging, glaze mixing, and wheel lubrication. Cermica Porto and Mateus Ceramics already recirculate 80% of process water. The remaining three workshops will install closed-loop filtration by 2028, eliminating discharge.",
    status: "in-progress",
  },
  {
    year: "By 2029",
    title: "Take-back programme for every piece",
    body: "If an Aura piece ever breaks or you no longer want it, we will take it back  at our shipping cost  and either repair it, return it to the workshop for re-firing, or recycle the raw material. No Aura piece should ever end up in landfill.",
    status: "planned",
  },
  {
    year: "By 2030",
    title: "Net-zero across scopes 1, 2, and 3",
    body: "Including all workshop emissions, inbound freight, last-mile delivery, and packaging. We will reach net-zero by reduction, not by offset purchase. Residual emissions  currently projected at under 8% of 2024 baseline  will be addressed via verified removal credits.",
    status: "planned",
  },
];

export function SustainabilityView() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 min-h-screen">
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/sustainability.png"
        alt="Natural raw materials — stoneware clay, unbleached linen, solid brass, flax, and Carrara marble — arranged on a warm oak surface."
        eyebrow="Sustainability"
        headline="Our Impact"
      />

      {/* 1. Materials sourcing index */}
      <section className="pb-16 md:pb-24">
        <div className="container-aura">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              01  Materials sourcing index
            </p>
            <TextBlurReveal as="h2" className="t-display-md c-ink leading-tight mb-4">
              Every material, named.
            </TextBlurReveal>
            <p className="t-body-lg c-ink-muted leading-relaxed">
              The table below lists every material in the catalogue, where
              it comes from, which workshop works it, and the certification
              that backs the claim. The same data is published on each
              product page  this is the consolidated view.
            </p>
          </div>

          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden">
            {/* Table header (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-cream-deep/60 border-b border-hairline-cream">
              <div className="col-span-3 t-label-caps c-ink-faint">Material</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Source</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Workshop</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Certification</div>
            </div>

            {/* Rows */}
            <RevealOnScroll stagger={0.06} className="divide-y divide-hairline-cream">
              {SOURCING_ROWS.map((row) => (
                <motion.div
                  key={row.material}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                    },
                  }}
                  className="md:grid md:grid-cols-12 md:gap-4 px-6 md:px-8 py-5 md:py-6 hover:bg-cream/60 transition-colors"
                >
                  {/* Mobile: stacked; Desktop: grid */}
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Material</p>
                    <p className="t-headline-sm c-ink">{row.material}</p>
                  </div>
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Source</p>
                    <p className="t-body c-ink-muted flex items-center gap-1.5">
                      <MapPin size={12} strokeWidth={1.5} className="c-gold-deep flex-shrink-0" />
                      {row.origin}
                    </p>
                  </div>
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Workshop</p>
                    <p className="t-body c-ink-muted">{row.workshop}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Certification</p>
                    <p className="t-body-sm c-ink-muted leading-snug flex items-start gap-1.5">
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="c-gold-deep flex-shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <span>{row.certified}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </RevealOnScroll>
          </div>

          <p className="t-caption c-ink-faint mt-4 italic">
            All sourcing claims are independently verified by third-party
            auditors. The full audit reports are available on request  write
            to <span className="c-gold-deep">concierge@auraliving.com</span>.
          </p>
        </div>
      </section>

      {/* 2. Workshop map */}
      <section className="py-16 md:py-24 bg-cream/60">
        <div className="container-aura">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              02  Workshop map
            </p>
            <TextBlurReveal as="h2" className="t-display-md c-ink leading-tight mb-4">
              Eleven workshops, six countries.
            </TextBlurReveal>
            <p className="t-body-lg c-ink-muted leading-relaxed">
              Every Aura piece is made by a workshop we visit at least once
              a year. The list below is the full roster  with location, craft,
              and year founded. We do not white-label. We do not source from
              anyone who is not on this list.
            </p>
          </div>

          <RevealOnScroll
            stagger={0.06}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {WORKSHOPS.map((w) => (
              <motion.div
                key={w.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 md:p-6 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="t-headline-sm c-ink leading-tight">{w.name}</h3>
                  <Globe size={16} strokeWidth={1.25} className="c-gold-deep flex-shrink-0 mt-1" aria-hidden />
                </div>
                <div className="space-y-1.5 mt-auto">
                  <p className="t-body-sm c-ink-muted flex items-center gap-1.5">
                    <MapPin size={11} strokeWidth={1.5} className="c-gold-deep flex-shrink-0" />
                    {w.location}
                  </p>
                  <p className="t-body-sm c-ink-muted">{w.craft}</p>
                  <p className="t-caption c-ink-faint t-num">Founded {w.founded}</p>
                </div>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* 3. Certifications */}
      <section className="py-16 md:py-24">
        <div className="container-aura">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              03  Certifications
            </p>
            <TextBlurReveal as="h2" className="t-display-md c-ink leading-tight mb-4">
              Eight third-party verifications.
            </TextBlurReveal>
            <p className="t-body-lg c-ink-muted leading-relaxed">
              We do not ask you to take our word for it. Every environmental
              and labour claim on this page is backed by an independent
              certification, listed below with its issuer and scope. Audit
              reports are available on request.
            </p>
          </div>

          <RevealOnScroll
            stagger={0.06}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {CERTIFICATIONS.map((cert) => (
              <motion.div
                key={cert.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 md:p-8 flex gap-5"
              >
                <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
                  <Award size={18} strokeWidth={1.25} className="c-gold-deep" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="t-headline-sm c-ink leading-tight mb-1.5">
                    {cert.name}
                  </h3>
                  <p className="t-caption c-gold-deep mb-2">{cert.issuer}</p>
                  <p className="t-body-sm c-ink-muted leading-relaxed">
                    {cert.scope}
                  </p>
                </div>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* Principles (present-tense commitments) */}
      <section className="py-16 md:py-24 bg-cream/60">
        <div className="container-aura">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Our principles
              <span className="w-6 h-px bg-gold" aria-hidden />
            </p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight"
            >
              Four principles, no compromise.
            </TextBlurReveal>
          </div>

          <RevealOnScroll
            stagger={0.1}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-8 md:p-10"
              >
                <p.icon size={28} strokeWidth={1.25} className="c-gold-deep mb-5" />
                <h3 className="t-headline-sm c-ink mb-3">{p.title}</h3>
                <p className="t-body c-ink-muted leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* 4. Environmental impact */}
      <section className="py-16 md:py-24">
        <div className="container-aura">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              04  Environmental impact
            </p>
            <TextBlurReveal as="h2" className="t-display-md c-ink leading-tight mb-4">
              The numbers, audited.
            </TextBlurReveal>
            <p className="t-body-lg c-ink-muted leading-relaxed">
              Measured against the UNIDO benchmark for small-batch
              home-goods manufacturers, audited annually by an independent
              firm. Every figure below is for calendar year 2024 and covers
              scopes 1, 2, and 3.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
            {/* Editorial image */}
            <RevealOnScroll
              direction="up"
              duration={0.8}
              className="lg:col-span-5"
            >
              <div className="aspect-[4/5] overflow-hidden bg-cream-deep rounded-sm ring-1 ring-hairline-cream h-full">
                <img
                  src="/hero/lookbook.png"
                  alt="A workshop shelf, photographed in afternoon light  the kind of corner where Aura pieces are made."
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </RevealOnScroll>

            {/* Metrics grid */}
            <div className="lg:col-span-7">
              <RevealOnScroll
                stagger={0.08}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
              >
                {IMPACT_METRICS.map((m) => (
                  <motion.div
                    key={m.label}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                      },
                    }}
                    className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 md:p-7 flex flex-col gap-3"
                  >
                    <div className="flex items-baseline gap-3">
                      <Leaf size={16} strokeWidth={1.5} className="c-gold-deep" aria-hidden />
                      <p className="t-display-md c-gold-deep t-num leading-none">{m.value}</p>
                    </div>
                    <p className="t-label-caps c-ink">{m.label}</p>
                    <p className="t-body-sm c-ink-muted leading-relaxed">{m.context}</p>
                  </motion.div>
                ))}
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Future commitments */}
      <section className="py-16 md:py-24 bg-cream/60">
        <div className="container-aura">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              05  Future commitments
            </p>
            <TextBlurReveal as="h2" className="t-display-md c-ink leading-tight mb-4">
              Dated targets, published.
            </TextBlurReveal>
            <p className="t-body-lg c-ink-muted leading-relaxed">
              We do not believe in open-ended promises. Every commitment
              below has a year, a scope, and a verification body. Progress
              against each target is published in the annual transparency
              report.
            </p>
          </div>

          <div className="space-y-4 md:space-y-6 max-w-4xl">
            {FUTURE_COMMITMENTS.map((c, i) => (
              <RevealOnScroll
                key={c.title}
                direction="up"
                duration={0.7}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.05 }}
                  className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start"
                >
                  <div className="md:w-40 flex-shrink-0 flex md:flex-col gap-3 md:gap-1 items-baseline md:items-start">
                    <Target size={18} strokeWidth={1.25} className="c-gold-deep" aria-hidden />
                    <p className="t-headline-sm c-gold-deep t-num">{c.year}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="t-headline-sm c-ink leading-tight">{c.title}</h3>
                      <span
                        className={
                          c.status === "in-progress"
                            ? "chip bg-gold-pale c-gold-deep"
                            : "chip bg-cream-deep c-ink-muted"
                        }
                      >
                        {c.status === "in-progress" ? "In progress" : "Planned"}
                      </span>
                    </div>
                    <p className="t-body c-ink-muted leading-relaxed">{c.body}</p>
                  </div>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="bg-ink c-paper p-10 md:p-16 text-center rounded-sm relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/30 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <TextBlurReveal
                as="h2"
                className="t-display-md c-paper leading-tight mb-5"
              >
                Read the full sourcing report.
              </TextBlurReveal>
              <TextBlurReveal
                as="p"
                delay={0.2}
                className="t-body-lg c-paper/70 max-w-xl mx-auto mb-8"
              >
                Our 2025 transparency report covers every workshop, every
                material, and every audit. Forty pages, no green-washing.
              </TextBlurReveal>
              <button
                onClick={() => router.push("/about")}
                className="group inline-flex items-center gap-3 bg-paper c-ink t-label-caps px-6 py-3.5 hover:bg-gold-deep hover:c-paper transition-colors rounded-sm"
              >
                Read the Report
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SustainabilityView;
