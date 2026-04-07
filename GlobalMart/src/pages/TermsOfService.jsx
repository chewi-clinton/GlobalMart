import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "../styles/TermsOfService.css";

/* ─── Section definitions ─────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "platform-scope",        label: "Platform Scope" },
  { id: "prohibited-items",      label: "Prohibited Items" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "dispute-resolution",    label: "Dispute Resolution" },
  { id: "limitation-liability",  label: "Limitation of Liability" },
  { id: "governing-law",         label: "Governing Law" },
];

/*
  ─── Winding snake path ───────────────────────────────────────────────────────
  ViewBox: 0 0 60 1000
  Six sections → six rhythmic inflection sweeps along the left margin.
  Path starts centred (x=30), drifts right toward the prose, then sweeps
  left near each section header, creating a natural guiding thread.
*/
const SNAKE_D =
  "M 30 0 " +
  "C 34 52,  54 88,  50 162 " +
  "C 46 232,  6 265,  10 338 " +
  "C 14 402, 56 434,  52 508 " +
  "C 48 572,  8 605,  12 678 " +
  "C 16 738, 54 770,  50 838 " +
  "C 46 884,  8 918,  12 960 " +
  "C 16 978, 28 992,  30 1000";

/* ─── Animated snake thread + glowing node ────────────────────────────────── */
function TosThread() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });

  const nodeTopPct = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <div className="tos-thread" aria-hidden="true">
      <svg
        className="tos-thread__svg"
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
      <motion.div
        className="tos-thread__node"
        style={{ top: nodeTopPct }}
      />
    </div>
  );
}

/* ─── Single TOC item ─────────────────────────────────────────────────────── */
function TocItem({ section, index, isActive, onClick }) {
  return (
    <motion.li
      className="tos-toc__li"
      animate={
        isActive
          ? { scale: 1.07, color: "#f0c14b" }
          : { scale: 1.0,  color: "#aaaaaa" }
      }
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
    >
      <button
        className={`tos-toc__item${isActive ? " tos-toc__item--active" : ""}`}
        onClick={onClick}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="tos-toc__num">0{index + 1}</span>
        <span className="tos-toc__text">{section.label}</span>
        {isActive && (
          <motion.span
            className="tos-toc__pip"
            layoutId="tos-toc-pip"
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className="tos-toc" aria-label="Table of contents">
      <p className="tos-toc__label">On This Page</p>
      <ul className="tos-toc__list">
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
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.section
      id={id}
      ref={ref}
      className="tos-section"
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="tos-section__title">{title}</h2>
      <div className="tos-section__body">{children}</div>
    </motion.section>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function TermsOfService() {
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
    <div className="tos-root">
      <TosThread />

      {/* ── Hero ── */}
      <header className="tos-hero">
        <motion.div
          className="tos-hero__inner"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="tos-hero__eyebrow">Legal · Terms</span>
          <h1 className="tos-hero__title">Terms of Service</h1>
          <p className="tos-hero__meta">
            GlobalMart Marketplace &nbsp;·&nbsp; Effective Date&nbsp;
            <time dateTime="2026-03-01">March 2026</time>
          </p>
          <p className="tos-hero__intro">
            These Terms of Service govern your access to and use of the
            GlobalMart platform, including all marketplace features, seller
            tools, and buyer services. By creating an account or completing a
            transaction on GlobalMart, you agree to be bound by these terms in
            full. Please read them carefully.
          </p>
        </motion.div>
      </header>

      {/* ── Layout: main content + right TOC ── */}
      <div className="tos-layout">
        <main className="tos-main">

          {/* 1 ─ Platform Scope */}
          <Section id="platform-scope" title="The Platform Scope">
            <p>
              GlobalMart is an independent online marketplace that provides a
              venue for registered buyers and sellers to discover, list, and
              transact in goods. GlobalMart is not itself a buyer or seller in
              any transaction conducted on the platform. We do not take title to
              any item listed for sale, and we do not act as an agent for any
              seller or buyer.
            </p>

            <h3>Venue — Not a Party</h3>
            <p>
              Each sale constitutes a direct contract between the buyer and the
              seller. GlobalMart is expressly not a party to that contract.
              Our role is limited to providing the technology infrastructure,
              payment escrow, and dispute mediation services described in these
              Terms. Any obligation related to the quality, legality, or
              delivery of goods rests solely with the transacting parties.
            </p>

            <h3>The Logistics Shield</h3>
            <p>
              GlobalMart is not a party to any shipping or logistics contract
              arising from a marketplace transaction. We do not own, warehouse,
              store, pack, or physically ship any item listed on the platform.
              Once a seller dispatches goods using their chosen carrier, all
              risks associated with delivery — including loss, damage, delay, or
              misdelivery — are governed solely by the terms of the contract
              between the buyer, the seller, and the selected carrier.
              GlobalMart bears no liability for the acts or omissions of any
              logistics provider, customs authority, or postal service.
            </p>
            <p>
              For disputes concerning non-delivery or damaged goods, users
              should first contact the seller through the Resolution Centre.
              GlobalMart may, at its discretion, assist with mediation using
              available dispatch records.
            </p>
          </Section>

          {/* 2 ─ Prohibited Items */}
          <Section id="prohibited-items" title="Prohibited Items &amp; Listings">
            <p>
              The integrity and safety of the GlobalMart marketplace depends on
              every participant listing only lawful, accurately described goods.
              The following categories of items are strictly prohibited from
              being listed, offered, sold, or delivered through the platform
              under any circumstances.
            </p>

            <h3>Prohibited Categories</h3>
            <p>
              Users may not list, sell, or attempt to transact in: illegal
              substances or controlled drugs of any classification; prescription
              pharmaceuticals sold without a valid licensed dispensation;
              counterfeit goods or items that infringe on the registered
              trademark or intellectual property of any third party; weapons,
              firearms, or ammunition where prohibited by the laws of the
              seller's or buyer's jurisdiction; hazardous materials, chemicals,
              or biological agents classified as dangerous for transport or
              civilian possession; items obtained through theft, fraud, or any
              other unlawful means; and any content, material, or service that
              violates applicable laws in the seller's or buyer's country of
              residence.
            </p>

            <h3>GlobalMart's Right of Removal</h3>
            <p>
              GlobalMart reserves the absolute right to remove, suspend, or
              permanently delist any listing at any time and without prior
              notice, for any reason, including but not limited to suspected
              policy violations, safety concerns, intellectual property
              complaints, or legal obligations. GlobalMart further reserves the
              right to suspend or terminate the accounts of any users associated
              with prohibited listings. Removal of a listing does not
              automatically entitle the seller to a refund of any fees already
              paid, except where required by applicable law.
            </p>
            <p>
              To report a prohibited listing, contact our Trust &amp; Safety team
              at{" "}
              <a href="mailto:safety@globalmart.com">safety@globalmart.com</a>.
            </p>
          </Section>

          {/* 3 ─ Intellectual Property */}
          <Section id="intellectual-property" title="Intellectual Property">
            <p>
              GlobalMart's platform, including all software, design systems,
              user interface elements, typography, iconography, logos, and
              branding, is the exclusive intellectual property of GlobalMart
              and its licensors. Nothing in these Terms or your use of the
              platform transfers any ownership of GlobalMart's intellectual
              property to you.
            </p>

            <h3>GlobalMart's Ownership</h3>
            <p>
              All platform branding, including the GlobalMart name, wordmark,
              logo, and any associated trade dress, is owned by or exclusively
              licensed to GlobalMart. The underlying code, architecture, and
              design of the platform are protected by copyright, trademark, and
              trade secret law. You may not reproduce, modify, distribute, or
              create derivative works from any GlobalMart proprietary materials
              without express written permission.
            </p>

            <h3>License Grant by Users</h3>
            <p>
              By uploading product photographs, images, or other visual content
              to the GlobalMart platform, you grant GlobalMart a worldwide,
              non-exclusive, royalty-free, sublicensable, and transferable
              license to use, reproduce, modify, adapt, publish, and display
              such content for the purposes of operating the platform and for
              GlobalMart's marketing and promotional activities, including
              digital advertising, social media, and printed materials. This
              license continues for the duration of your account and survives
              account deletion solely with respect to content already used in
              marketing materials.
            </p>
            <p>
              You represent and warrant that you own all rights in any content
              you upload, or that you have obtained all necessary permissions to
              grant the license described above. For intellectual property
              concerns, contact{" "}
              <a href="mailto:ip@globalmart.com">ip@globalmart.com</a>.
            </p>
          </Section>

          {/* 4 ─ Dispute Resolution */}
          <Section id="dispute-resolution" title="Dispute Resolution &amp; Escrow">
            <p>
              GlobalMart provides a structured mediation framework — the
              Resolution Centre — to assist buyers and sellers in resolving
              disagreements arising from marketplace transactions. Use of the
              Resolution Centre is a prerequisite to escalating any claim
              against GlobalMart or the counterparty.
            </p>

            <h3>The Resolution Centre Process</h3>
            <p>
              In the event of a transaction dispute, the affected party must
              open a case in the Resolution Centre within 30 calendar days of
              the confirmed delivery date or, in the case of non-delivery,
              within 30 days of the estimated delivery date. Upon opening a
              case, the following process applies: GlobalMart notifies both
              parties and provides a structured channel for the exchange of
              evidence, including order records, communication logs, photographs,
              and courier tracking data. Both parties are given a response window
              of 5 business days each. A GlobalMart case reviewer evaluates
              the submitted evidence against our Seller Standards and Buyer
              Protection policies and issues a written determination.
            </p>

            <h3>Escrow Release &amp; Finality</h3>
            <p>
              Buyer funds are held in a segregated escrow account from the
              moment of purchase. Funds are released to the seller automatically
              upon the earlier of: buyer confirmation of receipt, or the expiry
              of a 14-day review window without a dispute being raised. Where a
              Resolution Centre case is opened, all escrowed funds are frozen
              pending a determination. GlobalMart's decision regarding the
              release or refund of escrowed funds is final and binding for the
              sole purpose of processing the escrow transaction. This
              determination does not constitute legal adjudication and does not
              prejudice either party's right to pursue independent legal action.
            </p>
            <p>
              For Resolution Centre assistance, contact our mediation team at{" "}
              <a href="mailto:disputes@globalmart.com">disputes@globalmart.com</a>.
            </p>
          </Section>

          {/* 5 ─ Limitation of Liability */}
          <Section id="limitation-liability" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, GlobalMart,
              its officers, directors, employees, agents, licensors, and service
              providers shall not be liable for any indirect, incidental,
              special, consequential, punitive, or exemplary damages arising
              from or in connection with your use of the platform, whether based
              on warranty, contract, tort, statute, or any other legal theory.
            </p>

            <h3>Scope of Exclusion</h3>
            <p>
              This limitation applies specifically, but not exclusively, to:
              loss of revenue or anticipated profits; loss of business
              opportunity or goodwill; loss, corruption, or unauthorised access
              to data; costs of procuring substitute goods or services; and any
              damages resulting from the conduct, products, or services of any
              third party, including sellers, buyers, carriers, or payment
              processors operating through or in connection with the GlobalMart
              platform.
            </p>

            <h3>Aggregate Cap</h3>
            <p>
              Where the exclusion of liability is not fully permitted by
              applicable law, GlobalMart's aggregate liability to you for all
              claims arising from your use of the platform in any 12-month
              period shall not exceed the greater of: the total fees paid by you
              to GlobalMart during that period, or one hundred United States
              dollars (USD 100).
            </p>
            <p>
              Some jurisdictions do not permit the exclusion or limitation of
              incidental or consequential damages. If you reside in such a
              jurisdiction, some or all of the above limitations may not apply
              to you. Nothing in this section limits GlobalMart's liability for
              fraud, gross negligence, or any other liability that cannot be
              excluded by law.
            </p>
          </Section>

          {/* 6 ─ Governing Law */}
          <Section id="governing-law" title="Governing Law">
            <p>
              These Terms of Service and any dispute or claim arising from or in
              connection with them — including non-contractual disputes — shall
              be governed by and construed in accordance with the laws of the
              State of Delaware, United States of America, without regard to its
              conflict of law principles.
            </p>

            <h3>Jurisdiction</h3>
            <p>
              Both parties irrevocably submit to the exclusive jurisdiction of
              the state and federal courts located in Wilmington, Delaware, for
              the resolution of any disputes not resolved through the Resolution
              Centre process or binding arbitration. If you are a consumer
              resident in a jurisdiction where mandatory consumer protection laws
              provide you with rights that cannot be waived by contract, those
              rights are not affected by this clause.
            </p>

            <h3>Arbitration</h3>
            <p>
              Before initiating any court proceedings, both parties agree to
              attempt resolution through good-faith negotiation. If negotiation
              fails within 30 days of written notice, disputes shall be resolved
              by binding arbitration administered under the Commercial
              Arbitration Rules of the American Arbitration Association, with
              proceedings conducted in English. Each party shall bear its own
              legal fees unless the arbitrator determines that a claim was
              frivolous or brought in bad faith.
            </p>
            <p>
              Questions about these Terms may be directed to our Legal team at{" "}
              <a href="mailto:legal@globalmart.com">legal@globalmart.com</a>.
            </p>
          </Section>

          {/* ── Footer ── */}
          <footer className="tos-footer">
            <p>
              GlobalMart reserves the right to modify these Terms of Service at
              any time. Registered users will be notified of material changes
              via email and an in-platform banner at least{" "}
              <strong>14 days</strong> before such changes take effect.
              Continued use of the platform after the effective date constitutes
              acceptance of the revised Terms.
            </p>
            <p className="tos-footer__copy">
              © {new Date().getFullYear()} GlobalMart. All rights reserved.
            </p>
          </footer>
        </main>

        <TableOfContents activeSection={activeSection} />
      </div>
    </div>
  );
}
