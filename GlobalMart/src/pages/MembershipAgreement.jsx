import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "../styles/MembershipAgreement.css";

/* ─── Section definitions ─────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "acceptance-of-terms",   label: "Acceptance of Terms" },
  { id: "accounts-and-security", label: "Accounts & Security" },
  { id: "buyer-seller",          label: "Buyer-Seller Relationship" },
  { id: "fees-and-commissions",  label: "Fees & Commissions" },
  { id: "prohibited-conduct",    label: "Prohibited Conduct" },
  { id: "termination",           label: "Termination" },
];

/*
  ─── Winding snake path ───────────────────────────────────────────────────────
  ViewBox 0 0 60 1000.  Six chapters → six inflection sweeps.
  Path drifts right toward prose, then swings left near each section header,
  settling back to centre at the document foot.
*/
const SNAKE_D =
  "M 30 0 " +
  "C 34 48,  52 82,  48 155 " +
  "C 44 225,  6 258,  10 328 " +
  "C 14 390, 54 422,  50 495 " +
  "C 46 558,  8 592,  12 662 " +
  "C 16 722, 52 752,  48 820 " +
  "C 44 872,  8 905,  12 952 " +
  "C 16 974, 28 990,  30 1000";

/* ─── Animated snake thread + glowing node ────────────────────────────────── */
function MemberThread() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });

  /* node top expressed as % of fixed container height (100vh) */
  const nodeTopPct = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <div className="ma-thread" aria-hidden="true">
      <svg
        className="ma-thread__svg"
        viewBox="0 0 60 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ghost track */}
        <path
          d={SNAKE_D}
          stroke="#e6e6e6"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* orange fill — pathLength drives draw */}
        <motion.path
          d={SNAKE_D}
          stroke="#ff9900"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: smooth,
            filter: "drop-shadow(0 0 4px rgba(255,153,0,0.45))",
          }}
        />
      </svg>

      {/* glowing position node */}
      <motion.div className="ma-thread__node" style={{ top: nodeTopPct }} />
    </div>
  );
}

/* ─── TOC item with framer spring animate ─────────────────────────────────── */
function TocItem({ section, index, isActive, onClick }) {
  return (
    <motion.li
      className="ma-toc__li"
      animate={
        isActive
          ? { scale: 1.07, color: "#ff9900" }
          : { scale: 1.00, color: "#aaaaaa" }
      }
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
    >
      <button
        className={`ma-toc__item${isActive ? " ma-toc__item--active" : ""}`}
        onClick={onClick}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="ma-toc__num">0{index + 1}</span>
        <span className="ma-toc__text">{section.label}</span>
        {isActive && (
          <motion.span
            className="ma-toc__pip"
            layoutId="ma-toc-pip"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </motion.li>
  );
}

/* ─── Floating right TOC ──────────────────────────────────────────────────── */
function TableOfContents({ activeSection }) {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className="ma-toc" aria-label="Agreement sections">
      <p className="ma-toc__label">Agreement Sections</p>
      <ul className="ma-toc__list">
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

/* ─── Section with chapter label + fade-up entrance ─────────────────────── */
function Section({ id, title, chapter, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.section
      id={id}
      ref={ref}
      className="ma-section"
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ma-section__header">
        <span className="ma-section__chapter">{chapter}</span>
        <h2 className="ma-section__title">{title}</h2>
      </div>
      <div className="ma-section__body">{children}</div>
    </motion.section>
  );
}

/* ─── Root component ──────────────────────────────────────────────────────── */
export default function MembershipAgreement() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(id); },
        { rootMargin: "-28% 0px -58% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="ma-root">
      <MemberThread />

      {/* ── Hero ── */}
      <header className="ma-hero">
        <motion.div
          className="ma-hero__inner"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ma-hero__eyebrow">Legal · Membership</span>
          <h1 className="ma-hero__title">Free Membership Agreement</h1>
          <div className="ma-hero__badges">
            <span className="ma-hero__version">Version 2.1</span>
            <span className="ma-hero__divider-dot" />
            <span className="ma-hero__meta">
              Effective&nbsp;<time dateTime="2025-06-01">June 1, 2025</time>
            </span>
          </div>
          <p className="ma-hero__intro">
            This Free Membership Agreement ("Agreement") is a legally binding
            contract between you ("Member") and GlobalMart Operations Ltd
            ("GlobalMart", "we", "us", or "our"), governing your access to
            and use of the GlobalMart marketplace platform, including all
            associated services, tools, and communications. Please read this
            Agreement carefully before creating an account or using the
            platform.
          </p>
        </motion.div>
      </header>

      {/* ── Layout ── */}
      <div className="ma-layout">
        <main className="ma-main">

          {/* ── Chapter I: Acceptance of Terms ── */}
          <Section
            id="acceptance-of-terms"
            chapter="Chapter I"
            title="Acceptance of Terms"
          >
            <p>
              By creating a GlobalMart account, clicking "I Agree," or
              otherwise accessing or using the platform, you acknowledge that
              you have read, understood, and agree to be bound by this
              Agreement and all policies incorporated herein by reference,
              including the{" "}
              <a href="/privacy">Privacy Policy</a> and the{" "}
              <a href="/cookie-policy">Cookie Policy</a>.
            </p>

            <h3>Binding Nature</h3>
            <p>
              This Agreement constitutes a legally binding contract. If you do
              not agree to any provision, you must not create an account or
              access the platform. Continued use of the platform following any
              amendment to this Agreement constitutes acceptance of the revised
              terms.
            </p>

            <h3>Business Identity Verification</h3>
            <p>
              Members who register as sellers are required to complete
              GlobalMart's Business Identity Verification process prior to
              listing any product or service. This process may include
              submission of a government-issued identification document, proof
              of business registration where applicable, and a valid bank
              account or payment instrument in the member's legal name.
              Verification is a non-negotiable condition of accessing seller
              tools.
            </p>

            <h3>Capacity to Contract</h3>
            <p>
              By accepting this Agreement you represent and warrant that you
              are at least 18 years of age, are legally capable of entering
              into binding contracts in your jurisdiction, and are not
              prohibited from using the platform under any applicable law,
              regulation, or court order.
            </p>

            <h3>Amendments</h3>
            <p>
              GlobalMart reserves the right to modify this Agreement at any
              time. Where changes are material, we will provide at least{" "}
              <strong>14 days' notice</strong> via email to your registered
              address and an in-platform notification. Non-material corrections
              take effect immediately upon publication. The current version and
              effective date are always shown at the top of this document.
            </p>
          </Section>

          {/* ── Chapter II: Member Accounts & Security ── */}
          <Section
            id="accounts-and-security"
            chapter="Chapter II"
            title="Member Accounts & Security"
          >
            <p>
              Each GlobalMart account represents a single, verified individual
              or legal entity. The integrity of each account is the foundation
              of trust on the platform, and Members bear full responsibility
              for all activity conducted under their credentials.
            </p>

            <h3>Password Confidentiality</h3>
            <p>
              You are solely responsible for maintaining the confidentiality of
              your account password and all authentication credentials. You
              agree to notify GlobalMart immediately at{" "}
              <a href="mailto:security@globalmart.com">security@globalmart.com</a>{" "}
              upon becoming aware of any unauthorised access to or use of your
              account. GlobalMart will not be liable for any loss arising from
              your failure to comply with this obligation.
            </p>
            <p>
              GlobalMart will never request your password by email, phone, or
              in-platform message. Treat any such request as fraudulent and
              report it immediately.
            </p>

            <h3>Prohibition of Identity Shells</h3>
            <p>
              Each real person or legal entity may hold only one active
              GlobalMart account at any time. The creation of multiple accounts
              by a single individual or entity — whether under the same or
              different names, email addresses, or device profiles — constitutes
              an "Identity Shell" and is strictly prohibited. GlobalMart employs
              device fingerprinting, IP analysis, and behavioural signals to
              detect Identity Shells, and reserves the right to terminate all
              associated accounts without prior notice.
            </p>
            <p className="ma-note">
              Operating an Identity Shell to circumvent a prior suspension or
              to artificially inflate feedback ratings is treated as a material
              breach of this Agreement and may result in a permanent platform
              ban and referral to relevant authorities.
            </p>

            <h3>Account Accuracy</h3>
            <p>
              You agree to provide accurate, complete, and current information
              during registration and to update it promptly if it changes.
              Accounts registered with false or misleading information are
              subject to immediate suspension pending verification.
            </p>

            <h3>Non-Transferability</h3>
            <p>
              GlobalMart accounts are personal and non-transferable. You may
              not sell, assign, sublicense, or otherwise transfer your account
              or any rights associated with it to any third party.
            </p>
          </Section>

          {/* ── Chapter III: Buyer-Seller Relationship ── */}
          <Section
            id="buyer-seller"
            chapter="Chapter III"
            title="The Buyer-Seller Relationship"
          >
            <p>
              GlobalMart operates exclusively as a marketplace intermediary.
              Our role is to provide the technological venue through which
              independent buyers and sellers may discover each other, negotiate
              terms, and complete transactions. We are not a party to any
              transaction between Members.
            </p>

            <h3>Platform Role & Intermediary Status</h3>
            <p>
              GlobalMart is an intermediary — not a seller, buyer, agent,
              auctioneer, broker, or contracting party in any transaction formed
              between a buyer and a seller. GlobalMart does not take title to,
              inspect, handle, or store any goods or services listed on the
              platform. Accordingly, GlobalMart makes no representation and
              provides no warranty — express, implied, or statutory — regarding
              the quality, safety, legality, authenticity, or availability of
              any item listed, nor the truth or accuracy of any listing content,
              nor the ability of any seller to complete a sale or any buyer to
              complete a purchase.
            </p>

            <h3>No Guarantee of Transaction Completion</h3>
            <p>
              GlobalMart does not guarantee that a buyer will complete payment,
              that a seller will fulfil an order, or that any transaction will
              proceed to successful completion. While our escrow mechanism and
              dispute resolution tools are designed to facilitate fair outcomes,
              GlobalMart's liability in connection with any failed or disputed
              transaction is strictly limited to the extent set out in the
              applicable liability provisions of this Agreement.
            </p>

            <h3>Logistics Disclaimer</h3>
            <p>
              GlobalMart provides no shipping, logistics, delivery, freight,
              customs clearance, or fulfilment services of any kind. Once a
              seller marks an order as dispatched and provides a valid tracking
              reference, all physical delivery obligations rest exclusively
              between the seller, the buyer, and their chosen carrier. GlobalMart
              has no visibility into, responsibility for, or liability in respect
              of physical goods in transit.
            </p>
            <p className="ma-note">
              Buyers should review a seller's stated dispatch method and
              estimated delivery timeframe before completing a purchase. Disputes
              regarding delivery should be raised through the GlobalMart
              Resolution Centre within 30 days of the stated delivery date.
            </p>

            <h3>Seller Representations</h3>
            <p>
              By listing any item or service, a seller represents and warrants
              that they hold full legal title or authority to sell the item,
              that the item is accurately described, that it does not infringe
              any intellectual property rights, and that its sale and export
              are lawful under all applicable laws and regulations.
            </p>
          </Section>

          {/* ── Chapter IV: Fees & Commissions ── */}
          <Section
            id="fees-and-commissions"
            chapter="Chapter IV"
            title="Fees & Commissions"
          >
            <p>
              GlobalMart membership is free for buyers. Seller accounts are
              also free to open; however, sellers are subject to a platform
              service fee upon the successful completion of each transaction,
              as detailed below.
            </p>

            <h3>Buyer Membership — No Charge</h3>
            <p>
              Registering as a buyer on GlobalMart is free of charge. There
              are no subscription fees, listing fees, or access fees payable
              by buyers. Buyers pay only the purchase price agreed with the
              seller, plus any applicable taxes and any shipping costs set by
              the seller at the time of listing.
            </p>

            <h3>Seller Platform Service Fee</h3>
            <p>
              Upon the successful completion of a transaction — defined as the
              point at which the buyer confirms receipt, or the dispute window
              expires without an open case — GlobalMart deducts a{" "}
              <strong>platform service fee</strong> from the escrowed
              transaction value before releasing the remainder to the seller.
              The current fee schedule is published on the{" "}
              <a href="/seller-fees">Seller Fee Schedule</a> page, incorporated
              into this Agreement by reference. GlobalMart reserves the right
              to revise fee rates with <strong>30 days' notice</strong> to
              registered sellers.
            </p>

            <h3>Escrow Mechanics</h3>
            <p>
              All buyer payments are held in a segregated escrow account
              operated by GlobalMart's licensed payment partner. Funds are
              released to the seller only after the applicable release
              conditions are met. In the event of a confirmed dispute,
              GlobalMart's Resolution Centre may direct partial or full
              reimbursement to the buyer, deducted from escrowed funds, at
              GlobalMart's sole reasonable discretion.
            </p>

            <h3>Taxes & Withholding</h3>
            <p>
              Each Member is solely responsible for determining, collecting,
              reporting, and remitting any taxes applicable to their
              transactions, including income tax, VAT, GST, sales tax, and
              any applicable withholding obligations. GlobalMart may be required
              by law to report certain transaction data to tax authorities and
              will comply fully with all such obligations.
            </p>

            <h3>Chargebacks & Reversals</h3>
            <p>
              If a buyer initiates a chargeback or payment reversal through
              their card issuer, GlobalMart reserves the right to debit the
              corresponding amount — plus a chargeback handling fee — from the
              seller's account balance or future escrowed funds. Sellers may
              contest chargebacks by providing evidence through the Resolution
              Centre within the timeframe specified in the chargeback
              notification.
            </p>
          </Section>

          {/* ── Chapter V: Prohibited Conduct ── */}
          <Section
            id="prohibited-conduct"
            chapter="Chapter V"
            title="Prohibited Conduct"
          >
            <p>
              The integrity of the GlobalMart marketplace depends on honest
              participation by all Members. The following conduct is strictly
              prohibited and constitutes a material breach of this Agreement,
              subject to immediate account suspension, permanent termination,
              and where applicable, legal action.
            </p>

            <h3>Shill Bidding & Fake Reviews</h3>
            <p>
              Shill bidding — placing bids on one's own listings, or
              coordinating with a third party to do so, in order to artificially
              inflate perceived demand or price — is prohibited. It is equally
              prohibited to solicit, purchase, incentivise, or coerce reviews;
              to post false or compensated reviews; or to use multiple accounts
              to manipulate feedback scores. GlobalMart employs automated and
              manual review-integrity audits and will remove fraudulent reviews
              and sanction responsible accounts without warning.
            </p>

            <h3>Circumvention of Platform Fees</h3>
            <p>
              Members may not attempt to complete transactions initiated on
              GlobalMart through any external channel in order to avoid
              applicable platform service fees. This prohibition — the{" "}
              <strong>Circumvention Clause</strong> — applies to transactions
              conducted via private messaging, email, telephone, third-party
              payment applications, or any other off-platform means. Evidence
              of circumvention, including solicitation of off-platform contact
              in listing descriptions or messages, will result in immediate
              account suspension.
            </p>

            <h3>Prohibited Listings</h3>
            <p>
              Members may not list items or services that are counterfeit,
              stolen, hazardous, subject to export controls, or otherwise
              illegal in the seller's jurisdiction or the buyer's destination.
              GlobalMart maintains a Prohibited Items Policy that is
              incorporated by reference into this Agreement. Listing prohibited
              items may result in immediate removal and account termination
              without refund of any fees paid.
            </p>

            <h3>Misrepresentation & Fraud</h3>
            <p>
              It is prohibited to post false or deceptive listing content, to
              impersonate another person, brand, or entity, to submit fraudulent
              documents during verification, or to engage in phishing, spoofing,
              or social-engineering attacks targeting other Members or GlobalMart
              staff.
            </p>

            <h3>Platform Interference</h3>
            <p>
              Members may not use automated tools, bots, scrapers, or scripts
              to access, index, or extract platform data without GlobalMart's
              express written consent. Attempting to circumvent security
              measures, exploit platform vulnerabilities, or disrupt service
              availability is strictly prohibited and may constitute a criminal
              offence under applicable computer misuse legislation.
            </p>
          </Section>

          {/* ── Chapter VI: Termination ── */}
          <Section
            id="termination"
            chapter="Chapter VI"
            title="Termination"
          >
            <p>
              This Agreement remains in effect for as long as you maintain an
              active GlobalMart account. Either party may terminate the
              Agreement in accordance with the provisions set out in this
              chapter.
            </p>

            <h3>Member-Initiated Account Closure</h3>
            <p>
              You may close your GlobalMart account at any time by navigating
              to Account Settings → Privacy → Delete My Account, or by
              contacting our support team at{" "}
              <a href="mailto:support@globalmart.com">support@globalmart.com</a>.
              Closure requests are processed within{" "}
              <strong>7 business days</strong>. Active orders at the time of
              the request must reach resolution before the account is fully
              closed.
            </p>
            <p>
              Upon closure, your profile data and Wishlist are deleted in
              accordance with the Privacy Policy. Financial transaction records
              required by law are retained for the applicable statutory period.
            </p>

            <h3>GlobalMart-Initiated Suspension</h3>
            <p>
              GlobalMart may suspend or restrict access to a Member's account
              at any time, with or without prior notice, where GlobalMart has
              reasonable grounds to believe that the Member has breached this
              Agreement, engaged in fraudulent or illegal conduct, poses a risk
              to other Members or to platform integrity, or is the subject of a
              law enforcement request or legal process.
            </p>

            <h3>Suspension of Bad Actors</h3>
            <p>
              Where a Member is found to have engaged in conduct that GlobalMart
              determines, in its sole reasonable discretion, to constitute
              bad-faith participation — including shill bidding, Identity Shell
              operation, fee circumvention, or repeated policy violations —
              GlobalMart may impose an immediate permanent ban, forfeit any
              escrowed seller balances pending legitimate buyer refund claims,
              and report the matter to relevant law enforcement or regulatory
              authorities.
            </p>

            <h3>Reinstatement</h3>
            <p>
              Members who believe their account was suspended in error may
              submit a reinstatement request to{" "}
              <a href="mailto:appeals@globalmart.com">appeals@globalmart.com</a>{" "}
              within <strong>30 days</strong> of the suspension notice.
              GlobalMart will review the request and respond within 14 business
              days. Reinstatement is at GlobalMart's sole discretion and is
              not guaranteed.
            </p>

            <h3>Effect of Termination</h3>
            <p>
              Upon termination — whether initiated by you or by GlobalMart —
              your right to access and use the platform ceases immediately.
              Provisions of this Agreement that by their nature should survive
              termination shall do so, including obligations regarding
              Prohibited Conduct, Fee obligations for completed transactions,
              and all dispute resolution and governing law provisions.
            </p>
          </Section>

          {/* ── Document footer ── */}
          <footer className="ma-footer">
            <div className="ma-footer__rule" />
            <p>
              This Agreement is governed by the laws of England and Wales,
              without regard to conflict of law principles. Any dispute arising
              under this Agreement shall be subject to the exclusive jurisdiction
              of the courts of England and Wales, unless mandatory local
              consumer protection law provides otherwise.
            </p>
            <p>
              For questions regarding this Agreement, contact our Legal Team
              at{" "}
              <a href="mailto:legal@globalmart.com">legal@globalmart.com</a>.
            </p>
            <p className="ma-footer__copy">
              © {new Date().getFullYear()} GlobalMart Operations Ltd. All
              rights reserved. &nbsp;·&nbsp; Version 2.1
            </p>
          </footer>
        </main>

        <TableOfContents activeSection={activeSection} />
      </div>
    </div>
  );
}
