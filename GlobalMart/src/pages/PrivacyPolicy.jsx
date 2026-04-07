import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "../styles/PrivacyPolicy.css";

/* ─── Section definitions ─────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "data-collection", label: "Data Collection" },
  { id: "payment-security", label: "Payment Security" },
  { id: "platform-connectivity", label: "Platform Connectivity" },
  { id: "cookies-tracking", label: "Cookies & Tracking" },
  { id: "user-rights", label: "User Rights" },
];

/*
  ─── Winding snake path ───────────────────────────────────────────────────────
  ViewBox: 0 0 60 1000
  The path starts centred (x=30), drifts right toward the prose, then sweeps
  left near each section header, creating a natural guiding thread.
  We use preserveAspectRatio="none" and stretch height to 100% of the doc.
*/
const SNAKE_D =
  "M 30 0 " +
  "C 32 60,  50 100, 46 190 " +
  "C 42 270,  6 310, 10 400 " +
  "C 14 470, 52 510, 50 590 " +
  "C 48 660,  8 700, 12 780 " +
  "C 16 840, 50 870, 48 940 " +
  "C 46 970, 30 990, 30 1000";

/* ─── GlobalThread ────────────────────────────────────────────────────────── */
function GlobalThread() {
  const pathRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });

  /*
    The node must sit at the precise point on the SVG that corresponds to
    the current scroll progress. We express position as a percentage of the
    SVG element's rendered height so it aligns with the drawn orange line.
  */
  const nodeTopPct = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <div className="pp-thread" aria-hidden="true">
      <svg
        className="pp-thread__svg"
        viewBox="0 0 60 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ghost track */}
        <path
          d={SNAKE_D}
          stroke="#e6e6e6"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Animated orange fill using pathLength */}
        <motion.path
          ref={pathRef}
          d={SNAKE_D}
          stroke="#f0c14b"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: smooth,
            filter: "drop-shadow(0 0 4px rgba(255,153,0,0.45))",
          }}
        />
      </svg>

      {/* Glowing node — rides the drawn line via percentage of SVG height */}
      <motion.div className="pp-thread__node" style={{ top: nodeTopPct }} />
    </div>
  );
}

/* ─── Single TOC item with framer animate ─────────────────────────────────── */
function TocItem({ section, index, isActive, onClick }) {
  return (
    <motion.li
      className="pp-toc__li"
      animate={
        isActive
          ? { scale: 1.07, color: "#f0c14b" }
          : { scale: 1.0, color: "#aaaaaa" }
      }
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
    >
      <button
        className={`pp-toc__item${isActive ? " pp-toc__item--active" : ""}`}
        onClick={onClick}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="pp-toc__num">0{index + 1}</span>
        <span className="pp-toc__text">{section.label}</span>
        {isActive && (
          <motion.span
            className="pp-toc__pip"
            layoutId="toc-pip"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </motion.li>
  );
}

/* ─── Floating TOC ────────────────────────────────────────────────────────── */
function TableOfContents({ activeSection }) {
  const scrollTo = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className="pp-toc" aria-label="Table of contents">
      <p className="pp-toc__label">On This Page</p>
      <ul className="pp-toc__list">
        {SECTIONS.map((s, i) => (
          <TocItem
            key={s.id}
            section={s}
            index={i}
            isActive={activeSection === s.id}
            onClick={() => scrollTo(s.id)}
          />
        ))}
      </ul>
    </nav>
  );
}

/* ─── Section wrapper with fade-up entrance ──────────────────────────────── */
function Section({ id, title, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.06 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.section
      id={id}
      ref={ref}
      className="pp-section"
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="pp-section__title">{title}</h2>
      <div className="pp-section__body">{children}</div>
    </motion.section>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-28% 0px -58% 0px", threshold: 0 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="pp-root">
      <GlobalThread />

      {/* ── Hero ── */}
      <header className="pp-hero">
        <motion.div
          className="pp-hero__inner"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="pp-hero__eyebrow">Legal · Privacy</span>
          <h1 className="pp-hero__title">Privacy Policy</h1>
          <p className="pp-hero__meta">
            GlobalMart Marketplace &nbsp;·&nbsp; Last updated&nbsp;
            <time dateTime="2025-06-01">June 1, 2025</time>
          </p>
          <p className="pp-hero__intro">
            At GlobalMart, your privacy is foundational — not an afterthought.
            This policy explains exactly what data we collect, why we collect
            it, how it is protected, and the rights you hold over it. We have
            written this document in plain language so every member of our
            global community can understand it.
          </p>
        </motion.div>
      </header>

      {/* ── Layout: main content + right TOC ── */}
      <div className="pp-layout">
        <main className="pp-main">
          {/* 1 ─ Data Collection */}
          <Section id="data-collection" title="Data Collection">
            <p>
              When you create a GlobalMart account we collect the minimum
              information necessary to deliver a safe, personalised marketplace
              experience. This includes your name, email address, phone number,
              and shipping country. We never ask for data we do not need.
            </p>

            <h3>Account & Identity Data</h3>
            <p>
              Profile information you provide at sign-up — including display
              name, profile photo, and preferred language — is stored securely
              and used solely to identify you within the platform and to
              personalise your dashboard.
            </p>

            <h3>Cyber-Wishlist Preferences</h3>
            <p>
              Every item you save to your Wishlist, every product category you
              browse, and every search query you submit helps our recommendation
              engine surface relevant listings. This behavioural data is
              processed on-platform and is never sold to third-party
              advertisers. You may clear your Wishlist history at any time from
              Account Settings → Privacy → Clear Browse History.
            </p>

            <h3>Buyer–Seller Communication Logs</h3>
            <p>
              Messages exchanged through GlobalMart's built-in messaging system
              are stored for up to <strong>24 months</strong> from the date of
              the last message. These logs serve three purposes: dispute
              resolution, fraud prevention, and quality assurance. Messages are
              encrypted in transit (TLS 1.3) and at rest (AES-256).
            </p>
            <p className="pp-note">
              We do not collect passport numbers, national ID numbers, or
              biometric data at any stage of registration or trading on
              GlobalMart.
            </p>
          </Section>

          {/* 2 ─ Payment Security */}
          <Section id="payment-security" title="Payment Security">
            <p>
              GlobalMart processes payments through PCI-DSS Level 1 certified
              payment processors. We operate a strict zero raw-card-data policy:
              your full card number, CVV, and expiry date are never transmitted
              to or stored on GlobalMart servers.
            </p>

            <h3>Tokenisation Architecture</h3>
            <p>
              When you add a payment method, your card details are sent directly
              from your browser to our payment processor via an encrypted
              channel. The processor returns a <strong>secure token</strong> — a
              randomly generated alphanumeric string — which GlobalMart stores
              in place of your card data. This token can only be used by
              GlobalMart and is worthless to any external party.
            </p>

            <h3>Secure Escrow for Transactions</h3>
            <p>
              GlobalMart holds buyer funds in a segregated escrow account from
              the moment of purchase until the buyer confirms satisfactory
              receipt, or 14 days elapse without dispute. Sellers receive funds
              only after this release window, protecting both parties from undue
              financial risk.
            </p>

            <h3>Fraud Detection</h3>
            <p>
              Our system analyses transaction metadata — order value, device
              fingerprint, IP geolocation, and velocity signals — to detect
              anomalous patterns in real time. Suspected fraudulent transactions
              are flagged for human review before funds are released. This
              analysis uses only anonymised metadata, never card numbers.
            </p>
            <p className="pp-note">
              GlobalMart will never ask you to share your card number, PIN, OTP,
              or banking credentials via chat, email, or phone. Report any such
              request immediately to{" "}
              <a href="mailto:security@globalmart.com">
                security@globalmart.com
              </a>
              .
            </p>
          </Section>

          {/* 3 ─ Platform Connectivity */}
          <Section id="platform-connectivity" title="Platform Connectivity">
            <p>
              GlobalMart is a <strong>pure marketplace platform</strong>. We
              connect buyers and sellers across the globe but we do not own
              inventory, fulfil orders, or provide logistics, shipping, or
              delivery services. Understanding this distinction is critical to
              understanding how your data flows.
            </p>

            <h3>What We Share — and Why</h3>
            <p>
              To facilitate a transaction, we share a limited set of contact
              details between the buyer and the confirmed seller. To the seller
              we provide the buyer's delivery name, shipping address, and
              country — only after payment is confirmed and only to the specific
              seller fulfilling that order. To the buyer we provide the seller's
              public store name, contact email or in-platform messaging ID, and
              country of dispatch. Phone numbers are shared only when both
              parties have explicitly opted into SMS updates in their account
              settings.
            </p>

            <h3>What We Do Not Do</h3>
            <p>
              GlobalMart does not provide, coordinate, or track physical
              logistics. Once a seller marks an order as dispatched and provides
              a tracking number, all shipping arrangements are between the
              buyer, the seller, and their chosen carrier. We do not receive
              shipment data from carriers and do not store parcel-tracking
              information.
            </p>

            <h3>Third-Party Service Providers</h3>
            <p>
              We engage a small number of carefully vetted third-party providers
              — cloud infrastructure, transactional email delivery, and payment
              processors — each bound by a Data Processing Agreement that
              prohibits use of your data beyond the contracted service.
            </p>
            <p className="pp-note">
              For disputes about physical goods, please use our Resolution
              Centre. GlobalMart mediates using communication logs and
              seller-provided dispatch evidence.
            </p>
          </Section>

          {/* 4 ─ Cookies & Tracking */}
          <Section id="cookies-tracking" title="Cookies & Tracking">
            <p>
              GlobalMart uses cookies and similar technologies to keep you
              securely logged in, remember your preferences, and provide a
              coherent shopping experience across sessions. We do not use
              third-party advertising cookies.
            </p>

            <h3>Persistent Session Cookies</h3>
            <p>
              When you sign into your GlobalMart dashboard, we set a
              cryptographically signed <strong>persistent cookie</strong> with a
              30-day expiry. This cookie keeps you authenticated so you do not
              need to log in on every visit. It is HTTP-only and Secure,
              transmitted only over HTTPS.
            </p>

            <h3>Recently Viewed Items</h3>
            <p>
              A local-storage token stores the last 20 product IDs you viewed,
              powering the "Recently Viewed" widget on your dashboard. When you
              are logged in, this data syncs to your account to persist across
              devices.
            </p>

            <h3>Analytics & Performance</h3>
            <p>
              We use first-party analytics to understand aggregate usage
              patterns — most-browsed categories, average session length, and
              page-load metrics. All data is fully anonymised before storage. We
              do not use Google Analytics or Facebook Pixel.
            </p>

            <h3>Cookie Reference</h3>
            <div className="pp-cookie-table">
              <div className="pp-cookie-table__head">
                <span>Name</span>
                <span>Type</span>
                <span>Expiry</span>
                <span>Purpose</span>
              </div>
              {[
                [
                  "gm_session",
                  "Essential",
                  "30 days",
                  "Keeps you authenticated",
                ],
                ["gm_pref", "Functional", "1 year", "Language & currency"],
                ["gm_recent", "Functional", "Session", "Recently viewed items"],
                ["gm_csrf", "Essential", "Session", "CSRF protection"],
              ].map(([name, type, expiry, purpose]) => (
                <div key={name} className="pp-cookie-table__row">
                  <span className="pp-cookie-table__code">{name}</span>
                  <span>{type}</span>
                  <span>{expiry}</span>
                  <span>{purpose}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 5 ─ User Rights */}
          <Section id="user-rights" title="User Rights">
            <p>
              Depending on your country of residence, you are entitled to a
              range of rights under the{" "}
              <strong>General Data Protection Regulation (GDPR)</strong>, the{" "}
              <strong>California Consumer Privacy Act (CCPA)</strong>, and
              equivalent local legislation. GlobalMart honours these rights for
              all users globally, regardless of jurisdiction.
            </p>

            <h3>The Right to Be Forgotten</h3>
            <p>
              You may request the permanent deletion of your GlobalMart account
              and all associated personal data. Upon receiving a verified
              deletion request, we will anonymise or delete your profile data
              within <strong>7 business days</strong>, purge Wishlist data,
              communication logs, and browsing history within{" "}
              <strong>30 days</strong>, and retain only the minimum financial
              records required by applicable tax law — typically 7 years — in
              isolated, access-controlled archives.
            </p>
            <p>
              To submit a deletion request, navigate to Account Settings →
              Privacy → Delete My Account, or email{" "}
              <a href="mailto:privacy@globalmart.com">privacy@globalmart.com</a>{" "}
              with the subject line <em>Right to Erasure Request</em>.
            </p>

            <h3>Right to Data Portability</h3>
            <p>
              You have the right to receive a structured, machine-readable copy
              of your personal data. Navigate to Account Settings → Privacy →
              Download My Data. We will prepare a JSON export containing your
              profile, order history, Wishlist, and communication metadata and
              deliver it within <strong>14 business days</strong>.
            </p>

            <h3>Additional Rights</h3>
            <ul className="pp-list">
              <li>
                <strong>Right of Access</strong> — Request a summary of what
                data we hold about you.
              </li>
              <li>
                <strong>Right to Rectification</strong> — Correct inaccurate
                data in Account Settings or via our support team.
              </li>
              <li>
                <strong>Right to Restriction</strong> — Ask us to pause
                processing your data while a complaint is under review.
              </li>
              <li>
                <strong>Right to Object</strong> — Opt out of any profiling or
                automated decision-making that affects you.
              </li>
              <li>
                <strong>CCPA — Do Not Sell</strong> — GlobalMart does not sell
                personal data. This option is provided as a matter of
                transparency.
              </li>
            </ul>
            <p className="pp-note">
              All privacy requests are handled by our dedicated Privacy Team.
              Acknowledgement within 72 hours; fulfilment within the statutory
              period. Contact:{" "}
              <a href="mailto:privacy@globalmart.com">privacy@globalmart.com</a>
              .
            </p>
          </Section>

          {/* ── Footer ── */}
          <footer className="pp-footer">
            <p>
              This policy may be updated periodically. We will notify registered
              users of material changes via email and an in-platform banner at
              least <strong>14 days</strong> before changes take effect.
            </p>
            <p className="pp-footer__copy">
              © {new Date().getFullYear()} GlobalMart. All rights reserved.
            </p>
          </footer>
        </main>

        <TableOfContents activeSection={activeSection} />
      </div>
    </div>
  );
}
