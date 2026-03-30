import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ─── ROUTER ─── */
const RouterCtx = createContext({ page: "home", go: () => {} });
const useRouter = () => useContext(RouterCtx);

/* ─── ANIMATIONS ─── */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
};

const FadeIn = ({ children, delay = 0, direction = "up", className = "", style = {} }) => {
  const [ref, v] = useInView(0.08);
  const t = { up: "translateY(44px)", down: "translateY(-44px)", left: "translateX(44px)", right: "translateX(-44px)", none: "none" };
  return (
    <div ref={ref} className={className} style={{
      ...style, opacity: v ? 1 : 0, transform: v ? "none" : t[direction],
      transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>{children}</div>
  );
};

/* ─── DATA ─── */
const DIAGNOSES = [
  { title: "Mood Disorders", items: ["Major Depression","Bipolar Disorder","Dysthymia","Cyclothymia","Disruptive Mood Dysregulation","Seasonal Depression","Atypical Depression","Premenstrual Dysphoria","Schizoaffective Disorder"], icon: "◐", color: "#4A6670" },
  { title: "Anxiety Disorders", items: ["Generalized Anxiety","Panic Attacks","OCD","Social Anxiety","Hypochondriasis","Separation Anxiety","PTSD"], icon: "◎", color: "#5B8C5A" },
  { title: "Cognitive Disorders", items: ["ADHD","Autism","Intellectual Disability","Dementia","Traumatic Brain Injury"], icon: "◈", color: "#7B6B8D" },
  { title: "Personality Disorders", items: ["Narcissistic","Borderline","Histrionic","Avoidant","OCPD","Paranoid","Dependent","Antisocial"], icon: "◇", color: "#C4887B" },
  { title: "Sleep Disorders", items: ["Insomnia","Circadian Rhythm Disorder","Excessive Daytime Sleepiness","Narcolepsy","Restless Leg Syndrome","Nightmares"], icon: "◑", color: "#5A7D9A" },
  { title: "Substance Use", items: ["Alcohol","Tobacco / Nicotine","Cannabis","Sedatives","Opioids","Prescription Drugs","Stimulants"], icon: "◉", color: "#8B7355" },
  { title: "Eating Disorders", items: ["Anorexia","Bulimia","Binge Eating","Orthorexia","ARFID"], icon: "◌", color: "#9B7B6B" },
  { title: "Impulse Control", items: ["Anger / Irritability","Intermittent Explosive Disorder","Kleptomania","ODD","Conduct Disorder"], icon: "◍", color: "#6B8E6B" },
  { title: "Addictive Behaviors", items: ["Gambling","Skin-picking","Hoarding","Pornography","Shopping","Social Media Use"], icon: "◔", color: "#B8860B" },
];

const SPECIALTIES = [
  { title: "Adult Psychiatry", desc: "Comprehensive care for general adults ages 18–65, addressing a wide spectrum of psychiatric conditions with individualized treatment plans.", ages: "18–65", icon: "👤" },
  { title: "Child & Adolescent Psychiatry", desc: "Specialized evaluation and treatment for younger patients navigating developmental, emotional, and behavioral challenges.", ages: "14–17", icon: "🧒" },
  { title: "Geriatric Psychiatry", desc: "Tailored support for seniors managing cognitive changes, late-life mood disorders, and the psychological impacts of aging.", ages: "65+", icon: "👴" },
  { title: "Military Psychiatry", desc: "Dedicated care for active duty service members, reservists, veterans, and military retirees with service-connected and civilian concerns.", ages: "All ages", icon: "🎖️" },
  { title: "Reproductive Psychiatry", desc: "Expert management of mood dysregulation driven by hormonal changes across the reproductive lifespan.", ages: "Varies", icon: "🌸" },
  { title: "Addiction Psychiatry", desc: "Evidence-based treatment for substance use disorders and compulsive behavioral patterns interfering with daily functioning.", ages: "All ages", icon: "🔗" },
  { title: "Aviation Psychiatry", desc: "FAA-aligned evaluations and ongoing psychiatric care for pilots, air traffic controllers, and aviation professionals seeking medical certification.", ages: "All ages", icon: "✈️" },
  { title: "Occupational Psychiatry", desc: "Workplace-focused wellness support including employee mental health, fitness-for-duty evaluations, and return-to-work planning.", ages: "Adults", icon: "💼" },
  { title: "Psychiatry for Special Needs", desc: "Compassionate care for individuals with intellectual disabilities, developmental conditions, and their caregivers.", ages: "All ages", icon: "💙" },
  { title: "Telepsychiatry", desc: "Convenient virtual visits available across Texas and California, allowing patients to receive expert care from any private setting.", ages: "All ages", icon: "🖥️" },
];

const SERVICES = [
  { title: "Medication Management", desc: "Same-day prescriptions with a 98% transmission accuracy rate. Treatment plans integrate both traditional and progressive pharmacological options, collaboratively designed around each patient's unique needs and goals.", icon: "💊", highlight: "98% same-day accuracy" },
  { title: "Therapy & Counseling", desc: "Insight-oriented therapy offered exclusively to established patients. 12 evidence-based modalities including CBT, DBT, EMDR, IFS, ACT, Prolonged Exposure, CPT, ERP, SFBT, Person-Centered, and Couples Therapy. Group Therapy coming soon.", icon: "🧠", highlight: "12 modalities" },
  { title: "ADHD Diagnostic Evaluation", desc: "Proprietary clinical assessment that goes beyond standard screening. Includes neurophysiology education, co-occurring condition analysis, and a clear framework to distinguish ADHD from overlapping presentations. $300 out-of-pocket, FSA-eligible.", icon: "🔬", highlight: "$300 · FSA eligible" },
  { title: "FAA Mental Health Evaluations", desc: "General aviation psychiatry services for pilots, ATCs, and aviation professionals. 100% approval rate for all completed cases. Standard reports in 14 days with expedited 5-day turnaround available. $1,500–$3,500.", icon: "✈️", highlight: "100% approval rate" },
  { title: "Forms, Letters & Reports", desc: "Supportive clinical documentation including short-term disability evaluations, FMLA applications, VA Disability Nexus Letters, and other professional correspondence.", icon: "📋", highlight: "Multiple types" },
  { title: "Neuropsychological Assessments", desc: "Comprehensive cognitive and behavioral testing for complex diagnostic questions requiring in-depth psychological evaluation.", icon: "🧩", highlight: "Full testing" },
  { title: "Behavioral Assessments", desc: "One-time consultations designed for focused diagnostic clarification and treatment guidance without ongoing care commitment.", icon: "📊", highlight: "One-time consults" },
  { title: "Professional Consultations", desc: "Collaborative case discussions with external providers, along with professional seminar and lecture request capabilities for organizations.", icon: "🤝", highlight: "Collaborative care" },
];

const THERAPIES = ["Cognitive-Behavioral Therapy (CBT)","Dialectical Behavioral Therapy (DBT)","Internal Family Systems (IFS)","Eye Movement Desensitization (EMDR)","Acceptance & Commitment Therapy (ACT)","Prolonged Exposure (PE)","Cognitive Processing Therapy (CPT)","Person-Centered / Talk Therapy","Exposure & Response Prevention (ERP)","Solution-Focused Brief Therapy (SFBT)","Couples Therapy","Group Therapy (coming soon)"];

const INSURANCES = [
  { name: "Aetna", type: "Commercial" },
  { name: "BCBS Texas", type: "Commercial" },
  { name: "Humana", type: "Commercial" },
  { name: "UHC / Optum", type: "Commercial" },
  { name: "Cigna", type: "Commercial" },
  { name: "Magellan Health", type: "Commercial" },
  { name: "MultiPlan", type: "Commercial" },
  { name: "Optum Care", type: "Commercial" },
  { name: "Medicare", type: "Government" },
  { name: "TRICARE", type: "Government" },
  { name: "ChampVA", type: "Government (paused)" },
];

const STATS = [
  { num: "100+", label: "New consultations monthly", icon: "📅" },
  { num: "95%", label: "Patient retention after first visit", sub: "vs. 67% industry avg", icon: "🤝" },
  { num: "92%", label: "Would recommend to loved ones", icon: "💬" },
  { num: "98%", label: "Same-day Rx accuracy", icon: "💊" },
  { num: "87%", label: "Appointments start on time", sub: "vs. 64% industry avg", icon: "⏱️" },
];

/* ═══════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════ */

const PageHero = ({ label, title, titleAccent, subtitle }) => (
  <section className="hero-grain resp-hero" style={{
    position: "relative", padding: "160px 60px 80px",
    background: "linear-gradient(165deg, #0D3B3B 0%, #0f4545 40%, #164e4e 70%, #1a5c5c 100%)",
    overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: -120, right: -120, width: 450, height: 450, borderRadius: "50%", border: "1px solid rgba(232,220,200,0.05)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(232,220,200,0.03)", pointerEvents: "none" }} />
    <div style={{ maxWidth: 760, position: "relative", zIndex: 2 }}>
      <FadeIn delay={0.05}><div className="sec-label" style={{ color: "rgba(184,134,11,0.85)" }}>{label}</div></FadeIn>
      <FadeIn delay={0.15}>
        <h1 className="pf page-hero-title" style={{ fontSize: 54, fontWeight: 500, color: "#E8DCC8", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
          {title}{titleAccent && <><br /><em style={{ color: "#B8860B" }}>{titleAccent}</em></>}
        </h1>
      </FadeIn>
      {subtitle && <FadeIn delay={0.3}><p className="dm" style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(232,220,200,0.65)", maxWidth: 560 }}>{subtitle}</p></FadeIn>}
    </div>
  </section>
);

const SectionLabel = ({ children }) => <div className="sec-label">{children}</div>;

const CTABar = () => {
  const { go } = useRouter();
  return (
    <section style={{ padding: "80px 60px", textAlign: "center", background: "linear-gradient(165deg, #0D3B3B, #0f4545)", position: "relative" }}>
      <div className="grain-overlay" />
      <FadeIn>
        <h2 className="pf" style={{ fontSize: 40, fontWeight: 500, color: "#E8DCC8", marginBottom: 14, letterSpacing: "-0.02em" }}>
          Ready to <em style={{ color: "#B8860B" }}>evolve</em>?
        </h2>
        <p className="dm" style={{ fontSize: 15, color: "rgba(232,220,200,0.55)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Now serving the entire states of California and Texas. Begin your journey today.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <a href="https://www.evolve-psychiatry.com/paq" target="_blank" rel="noopener noreferrer" className="cta-btn cta-gold">Become a New Patient →</a>
          <button className="cta-btn" style={{ background: "transparent", color: "#E8DCC8", border: "1.5px solid rgba(232,220,200,0.2)" }} onClick={() => go("contact")}>Contact Us</button>
        </div>
      </FadeIn>
    </section>
  );
};

const Footer = () => {
  const { go } = useRouter();
  return (
    <footer style={{ padding: "40px 60px", background: "#0a2e2e", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }} onClick={() => go("home")}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(232,220,200,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B8860B", fontSize: 12, fontWeight: 700 }}>E</div>
          <span className="pf" style={{ fontSize: 15, color: "#E8DCC8" }}>Evolve Psychiatry</span>
        </div>
        <p className="dm" style={{ fontSize: 11, color: "rgba(232,220,200,0.3)" }}>© 2026 Evolve Psychiatry. All rights reserved.</p>
      </div>
      <div style={{ display: "flex", gap: 20, fontSize: 11, color: "rgba(232,220,200,0.35)" }}>
        <a href="https://www.evolve-psychiatry.com/sms-privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</a>
        <a href="https://www.evolve-psychiatry.com/terms-conditions" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Terms & Conditions</a>
      </div>
    </footer>
  );
};

/* ═══════════════════════════════════════════════
   PAGE: HOME
   ═══════════════════════════════════════════════ */
const HomePage = () => {
  const { go } = useRouter();
  const cards = [
    { label: "What We Treat", title: "Diagnoses", desc: "Mood, anxiety, cognitive, personality, sleep, substance use, eating, impulse control, and addictive behavior disorders.", page: "diagnoses" },
    { label: "Who We Treat", title: "Specialties", desc: "Adults, adolescents, seniors, military, reproductive, addiction, aviation, occupational, and special needs populations.", page: "specialties" },
    { label: "How We Treat", title: "Services", desc: "Medication management, therapy, ADHD evaluations, FAA clearances, neuropsych testing, forms and letters.", page: "services" },
    { label: "Therapy", title: "Counseling", desc: "12 evidence-based modalities exclusively for established patients. CBT, DBT, EMDR, IFS, ACT, and more.", page: "therapy" },
  ];

  return (
    <div>
      <section className="hero-grain resp-hero-home" style={{
        position: "relative", minHeight: "100vh",
        background: "linear-gradient(165deg, #0D3B3B 0%, #0f4545 40%, #164e4e 70%, #1a5c5c 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "140px 60px 100px", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -140, right: -140, width: 550, height: 550, borderRadius: "50%", border: "1px solid rgba(232,220,200,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -90, left: -90, width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(232,220,200,0.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "35%", right: "12%", width: 8, height: 8, borderRadius: "50%", background: "#B8860B", opacity: 0.5 }} />
        <div style={{ maxWidth: 800, position: "relative", zIndex: 2 }}>
          <FadeIn delay={0.1}><div className="sec-label" style={{ color: "rgba(184,134,11,0.85)", marginBottom: 20 }}>Texas &nbsp;·&nbsp; California &nbsp;·&nbsp; Telemedicine</div></FadeIn>
          <FadeIn delay={0.25}>
            <h1 className="pf hero-title" style={{ fontSize: 76, fontWeight: 500, color: "#E8DCC8", lineHeight: 1.04, letterSpacing: "-0.03em", marginBottom: 24 }}>
              See the<br /><span style={{ fontStyle: "italic", color: "#B8860B" }}>bigger</span> picture
            </h1>
          </FadeIn>
          <FadeIn delay={0.45}>
            <p className="dm" style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(232,220,200,0.7)", maxWidth: 520, marginBottom: 36, fontWeight: 300 }}>
              Mental health care focused on empathy, education, and empowerment — helping individuals discover the best version of themselves.
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="https://www.evolve-psychiatry.com/paq" target="_blank" rel="noopener noreferrer" className="cta-btn cta-gold">Become a New Patient →</a>
              <button className="cta-btn" style={{ background: "rgba(232,220,200,0.08)", color: "#E8DCC8", border: "1px solid rgba(232,220,200,0.15)" }} onClick={() => go("services")}>Explore Services</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STATS */}
      <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
        <FadeIn><div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>2025 Performance</SectionLabel>
          <h2 className="pf" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>Numbers that <em style={{ color: "#B8860B" }}>speak</em></h2>
        </div></FadeIn>
        <div className="grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, maxWidth: 1000, margin: "0 auto" }}>
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", textAlign: "center", border: "1px solid rgba(26,42,42,0.05)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div className="pf" style={{ fontSize: 32, fontWeight: 600, color: "#0D3B3B", marginBottom: 4 }}>{s.num}</div>
                <div className="dm" style={{ fontSize: 12, color: "#6b7a7a", lineHeight: 1.4, marginBottom: 2 }}>{s.label}</div>
                {s.sub && <div className="dm" style={{ fontSize: 10, color: "#B8860B", fontWeight: 600 }}>{s.sub}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* EXPLORE */}
      <section className="resp-section" style={{ padding: "80px 60px", background: "#fff" }}>
        <FadeIn><div style={{ marginBottom: 48 }}>
          <SectionLabel>Explore</SectionLabel>
          <h2 className="pf" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>What makes Evolve <em style={{ color: "#B8860B" }}>different</em></h2>
        </div></FadeIn>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {cards.map((c, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="home-card" onClick={() => go(c.page)} style={{ cursor: "pointer" }}>
                <div className="dm" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B8860B", marginBottom: 10 }}>{c.label}</div>
                <h3 className="pf" style={{ fontSize: 26, fontWeight: 600, marginBottom: 10 }}>{c.title}</h3>
                <p className="dm" style={{ fontSize: 13, color: "#6b7a7a", lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</p>
                <span className="dm" style={{ fontSize: 13, fontWeight: 600, color: "#0D3B3B" }}>Learn more →</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
        <FadeIn><div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
          <SectionLabel>Core Values</SectionLabel>
          <h2 className="pf" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>Empathy, education, <em style={{ color: "#B8860B" }}>empowerment</em></h2>
        </div></FadeIn>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {[["Empathy","Understanding each patient's unique story with compassion and without judgment."],["Education","Providing in-depth knowledge so patients make informed decisions about their care."],["Empowerment","Equipping individuals with tools and confidence to own their mental health journey."]].map(([t,d],i)=>(
            <FadeIn key={i} delay={i*0.1}><div style={{textAlign:"center",padding:"28px 16px"}}>
              <div className="pf" style={{fontSize:44,color:"#B8860B",marginBottom:14,opacity:0.35}}>{["01","02","03"][i]}</div>
              <h3 className="pf" style={{fontSize:22,fontWeight:600,marginBottom:8}}>{t}</h3>
              <p className="dm" style={{fontSize:13,color:"#6b7a7a",lineHeight:1.65}}>{d}</p>
            </div></FadeIn>
          ))}
        </div>
      </section>
      <CTABar /><Footer />
    </div>
  );
};

/* ═══════════════════════════════════════════════
   PAGE: DIAGNOSES
   ═══════════════════════════════════════════════ */
const DiagnosesPage = () => (
  <div>
    <PageHero label="What We Treat" title="Empower yourself to address your challenges —" titleAccent="whatever they may be." subtitle="Our breadth of medical, cultural, and professional expertise allows us to treat individuals in a manner as unique as they truly are." />
    <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {DIAGNOSES.map((d, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <div className="diag-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: d.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DCC8", fontSize: 20, flexShrink: 0 }}>{d.icon}</div>
                <h3 className="pf" style={{ fontSize: 20, fontWeight: 600 }}>{d.title}</h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {d.items.map((item, j) => <span key={j} className="dm tag-pill">{item}</span>)}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
    <CTABar /><Footer />
  </div>
);

/* ═══════════════════════════════════════════════
   PAGE: SPECIALTIES
   ═══════════════════════════════════════════════ */
const SpecialtiesPage = () => (
  <div>
    <PageHero label="Who We Treat" title="Serving diverse populations across" titleAccent="every stage of life." subtitle="Providers are assigned to new patients specifically based on age, medical complexity, and behavioral health needs. We refer to a wide collaborative network for concurrent and higher-level care." />
    <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {SPECIALTIES.map((s, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <div className="spec-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{s.icon}</div>
                <span className="dm" style={{ fontSize: 11, fontWeight: 600, color: "#B8860B", background: "rgba(184,134,11,0.08)", padding: "4px 10px", borderRadius: 6 }}>{s.ages}</span>
              </div>
              <h3 className="pf" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
              <p className="dm" style={{ fontSize: 13, color: "#6b7a7a", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
    <section className="resp-section" style={{ padding: "20px 60px 80px", background: "#FAF7F2" }}>
      <FadeIn>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {["Texas","California","Telemedicine"].map((loc,i) => (
            <div key={i} style={{ padding: "20px 40px", borderRadius: 14, background: "#fff", border: "1px solid rgba(26,42,42,0.06)", textAlign: "center" }}>
              <div className="pf" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{loc}</div>
              <div className="dm" style={{ fontSize: 12, color: "#6b7a7a" }}>{i<2?"Statewide coverage":"Virtual visits available"}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
    <CTABar /><Footer />
  </div>
);

/* ═══════════════════════════════════════════════
   PAGE: SERVICES
   ═══════════════════════════════════════════════ */
const ServicesPage = () => (
  <div>
    <PageHero label="How We Treat" title="A refreshing approach to" titleAccent="your care." subtitle="Each person represents a unique set of needs, concerns, and goals — integrated into a collaborative treatment plan incorporating both traditional and progressive options." />
    <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        {SERVICES.map((s, i) => (
          <FadeIn key={i} delay={i * 0.06}>
            <div className="svc-wide-card">
              <div className="svc-inner" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ fontSize: 36, flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: "rgba(13,59,59,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                    <h3 className="pf" style={{ fontSize: 22, fontWeight: 600 }}>{s.title}</h3>
                    <span className="dm" style={{ fontSize: 11, fontWeight: 700, color: "#B8860B", background: "rgba(184,134,11,0.08)", padding: "4px 12px", borderRadius: 6, letterSpacing: "0.04em" }}>{s.highlight}</span>
                  </div>
                  <p className="dm" style={{ fontSize: 14, color: "#6b7a7a", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
    <CTABar /><Footer />
  </div>
);

/* ═══════════════════════════════════════════════
   PAGE: THERAPY
   ═══════════════════════════════════════════════ */
const TherapyPage = () => {
  const steps = [
    { n: "01", title: "Complete Your PAQ", desc: "All new patients begin by filling out the Pre-Assessment Questionnaire to establish care with the medical team." },
    { n: "02", title: "Initial Psychiatric Evaluation", desc: "Meet with one of Evolve's psychiatrists for a comprehensive initial medical evaluation." },
    { n: "03", title: "Submit Therapy Interest Form", desc: "Established patients complete the Therapy Interest Form to express interest in counseling services." },
    { n: "04", title: "Therapist Match", desc: "Our team conducts a clinical assessment and connects you with the best-fit therapist within 48 hours." },
    { n: "05", title: "Therapy Evaluation", desc: "45–60 minute initial session: review concerns, counseling history, preferences, and establish goals of care." },
    { n: "06", title: "Ongoing Treatment", desc: "Collaborative therapy plan with your chosen modality and session frequency. Reassignment available if needed." },
  ];
  return (
    <div>
      <PageHero label="Therapy Services" title="12 evidence-based modalities, one" titleAccent="personalized plan." subtitle="Our expanded therapy team offers counseling exclusively to established patients. 45–60 minute sessions designed around your goals — no external referral required." />
      <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
        <FadeIn><div style={{ marginBottom: 40 }}>
          <SectionLabel>Available Modalities</SectionLabel>
          <h2 className="pf" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>Therapeutic approaches we <em style={{ color: "#B8860B" }}>offer</em></h2>
        </div></FadeIn>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {THERAPIES.map((t, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="therapy-card">{t}</div>
            </FadeIn>
          ))}
        </div>
      </section>
      <section className="resp-section" style={{ padding: "0 60px 80px", background: "#FAF7F2" }}>
        <FadeIn><div style={{ marginBottom: 40 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="pf" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>Your path to <em style={{ color: "#B8860B" }}>therapy</em></h2>
        </div></FadeIn>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{ padding: "24px", borderRadius: 14, background: "#fff", border: "1px solid rgba(26,42,42,0.05)", height: "100%" }}>
                <div className="pf" style={{ fontSize: 28, fontWeight: 600, color: "#B8860B", opacity: 0.4, marginBottom: 8 }}>{s.n}</div>
                <h4 className="pf" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{s.title}</h4>
                <p className="dm" style={{ fontSize: 13, color: "#6b7a7a", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <section className="resp-section" style={{ padding: "0 60px 80px", background: "#FAF7F2" }}>
        <FadeIn>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 28px", borderRadius: 14, background: "rgba(184,134,11,0.05)", border: "1px solid rgba(184,134,11,0.1)" }}>
            <p className="dm" style={{ fontSize: 13, color: "#6b5a3a", lineHeight: 1.65 }}>
              <strong>Availability Note:</strong> All currently available therapists' caseloads are expected to be filled by mid-April. After that, patients will be placed on a clinically prioritized waitlist. The next significant expansion is expected in August 2026. We strongly encourage interested patients to submit their Therapy Interest Form as soon as possible.
            </p>
          </div>
        </FadeIn>
      </section>
      <CTABar /><Footer />
    </div>
  );
};

/* ═══════════════════════════════════════════════
   PAGE: INSURANCE
   ═══════════════════════════════════════════════ */
const InsurancePage = () => (
  <div>
    <PageHero label="Feel Included" title="Expanding access to" titleAccent="quality care." subtitle="We are in-network with the largest selection of mental health insurance plans across all of Texas and California. We also work with out-of-network benefits and private pay." />
    <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
      <FadeIn><div style={{ marginBottom: 40 }}>
        <SectionLabel>Accepted Plans</SectionLabel>
        <h2 className="pf" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>Our <em style={{ color: "#B8860B" }}>insurance</em> partners</h2>
      </div></FadeIn>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {INSURANCES.map((ins, i) => (
          <FadeIn key={i} delay={i * 0.04}>
            <div className="ins-card">
              <span className="dm" style={{ fontSize: 16, fontWeight: 600 }}>{ins.name}</span>
              <span className="dm" style={{ fontSize: 11, color: ins.type.includes("paused") ? "#c44" : "#6b7a7a", fontWeight: 500 }}>{ins.type}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
    <section className="resp-section" style={{ padding: "0 60px 80px", background: "#FAF7F2" }}>
      <FadeIn>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[["Out-of-Network","We work with patients who wish to use out-of-network benefits for coverage."],["Private Pay","Cash pay and self-pay options available for all services."],["FSA / HSA","ADHD evaluations and certain services are FSA-eligible."]].map(([t,d],i)=>(
            <div key={i} style={{padding:"24px",borderRadius:14,background:"#fff",border:"1px solid rgba(184,134,11,0.1)"}}>
              <h4 className="pf" style={{fontSize:17,fontWeight:600,marginBottom:6}}>{t}</h4>
              <p className="dm" style={{fontSize:13,color:"#6b7a7a",lineHeight:1.6}}>{d}</p>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.15}>
        <div style={{ maxWidth: 600, margin: "24px auto 0", padding: "20px 24px", borderRadius: 12, background: "rgba(184,134,11,0.05)", border: "1px solid rgba(184,134,11,0.1)", textAlign: "center" }}>
          <p className="dm" style={{ fontSize: 13, color: "#6b5a3a", lineHeight: 1.6 }}>
            Medicaid and MediCal are not accepted at this time. Due to ongoing claim processing delays, new ChampVA patients are temporarily suspended.
          </p>
        </div>
      </FadeIn>
    </section>
    <CTABar /><Footer />
  </div>
);

/* ═══════════════════════════════════════════════
   PAGE: CONTACT
   ═══════════════════════════════════════════════ */
const ContactPage = () => (
  <div>
    <PageHero label="Get in Touch" title="Let's start a" titleAccent="conversation." subtitle="Whether you're a new patient, an existing patient, or a referring provider — we're here to help." />
    <section className="resp-section" style={{ padding: "80px 60px", background: "#FAF7F2" }}>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          { title: "New Patients", desc: "Complete our Pre-Assessment Questionnaire to begin the intake process and get matched with the right provider.", link: "https://www.evolve-psychiatry.com/paq", cta: "Start Your PAQ" },
          { title: "Existing Patients", desc: "Log in to On Patient to message your provider, request refills, upload documents, or manage your appointments.", link: "https://www.evolve-psychiatry.com/onpatient", cta: "Open On Patient" },
          { title: "Referring Providers", desc: "Submit a referral for your patient. We collaborate closely with external providers for coordinated care.", link: "https://www.evolve-psychiatry.com/referrals", cta: "Submit Referral" },
        ].map((c,i)=>(
          <FadeIn key={i} delay={i*0.08}>
            <div style={{padding:"32px 24px",borderRadius:16,background:"#fff",border:"1px solid rgba(26,42,42,0.06)",height:"100%",display:"flex",flexDirection:"column"}}>
              <h3 className="pf" style={{fontSize:22,fontWeight:600,marginBottom:10}}>{c.title}</h3>
              <p className="dm" style={{fontSize:13,color:"#6b7a7a",lineHeight:1.65,flex:1,marginBottom:20}}>{c.desc}</p>
              <a href={c.link} target="_blank" rel="noopener noreferrer" className="cta-btn cta-primary" style={{alignSelf:"flex-start",padding:"10px 22px",fontSize:13}}>{c.cta}</a>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
    <section className="resp-section" style={{ padding: "0 60px 80px", background: "#FAF7F2" }}>
      <FadeIn><div style={{ marginBottom: 24 }}><SectionLabel>Quick Links</SectionLabel></div></FadeIn>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Forms & Letters Request", desc: "Request disability evaluations, FMLA letters, VA Nexus letters, and more.", link: "https://www.evolve-psychiatry.com/forms-letters-reports-request" },
          { title: "Case Discussion Request", desc: "External providers can request collaborative case discussion.", link: "https://www.evolve-psychiatry.com/casediscussionrequests" },
          { title: "Therapy Interest Form", desc: "Established patients: add therapy services to your treatment plan.", link: "https://form.jotform.com/250724795062056" },
          { title: "Pre-Visit Checklist", desc: "Prepare for your upcoming appointment to maximize your time.", link: "https://www.evolve-psychiatry.com/previsitchecklist" },
          { title: "New Patient Forms", desc: "Download and complete required intake forms before your first visit.", link: "https://www.evolve-psychiatry.com/new-patient-forms" },
          { title: "Meeting Instructions", desc: "How to join your telemedicine or in-office appointment.", link: "https://www.evolve-psychiatry.com/meetinginstructions" },
        ].map((c,i)=>(
          <FadeIn key={i} delay={i*0.04}>
            <a href={c.link} target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4 className="pf" style={{fontSize:17,fontWeight:600,marginBottom:4}}>{c.title}</h4>
              <p className="dm" style={{fontSize:13,color:"#6b7a7a",lineHeight:1.5}}>{c.desc}</p>
              <span className="dm" style={{fontSize:12,fontWeight:600,color:"#B8860B",marginTop:8,display:"inline-block"}}>Open →</span>
            </a>
          </FadeIn>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

/* ═══════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════ */
const PAGES = { home: HomePage, diagnoses: DiagnosesPage, specialties: SpecialtiesPage, services: ServicesPage, therapy: TherapyPage, insurance: InsurancePage, contact: ContactPage };
const NAV_ITEMS = [
  ["Home","home"],["Diagnoses","diagnoses"],["Specialties","specialties"],
  ["Services","services"],["Therapy","therapy"],["Insurance","insurance"],["Contact","contact"],
];

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const go = useCallback((p) => { setPage(p); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    const m = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", m);
    m();
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", m); };
  }, []);

  const Page = PAGES[page] || HomePage;

  return (
    <RouterCtx.Provider value={{ page, go }}>
      <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#1a2a2a", background: "#FAF7F2", overflowX: "hidden", minHeight: "100vh" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
          *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
          html{scroll-behavior:smooth} body{background:#FAF7F2}
          .pf{font-family:'Playfair Display',Georgia,serif}
          .dm{font-family:'DM Sans',sans-serif}
          .sec-label{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#B8860B;margin-bottom:10px}
          .hero-grain::after{content:'';position:absolute;inset:0;opacity:.07;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}
          .grain-overlay{position:absolute;inset:0;opacity:.05;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px}

          .nav-link{position:relative;cursor:pointer;font-weight:500;letter-spacing:.02em;transition:color .3s;user-select:none}
          .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1.5px;background:#B8860B;transition:width .3s}
          .nav-link:hover::after{width:100%} .nav-link:hover{color:#B8860B}
          .nav-active{color:#B8860B!important} .nav-active::after{width:100%!important}

          .cta-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:100px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;letter-spacing:.02em;border:none;cursor:pointer;transition:all .35s cubic-bezier(.16,1,.3,1);text-decoration:none}
          .cta-primary{background:#0D3B3B;color:#FAF7F2} .cta-primary:hover{background:#164e4e;transform:translateY(-2px);box-shadow:0 10px 36px rgba(13,59,59,.25)}
          .cta-gold{background:#B8860B;color:#fff} .cta-gold:hover{background:#9A7209;transform:translateY(-2px);box-shadow:0 10px 36px rgba(184,134,11,.3)}

          .diag-card{border:1px solid rgba(26,42,42,.06);border-radius:16px;padding:24px;background:#fff;transition:all .4s cubic-bezier(.16,1,.3,1)}
          .diag-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(26,42,42,.07);border-color:rgba(184,134,11,.2)}
          .tag-pill{font-size:12px;padding:4px 10px;border-radius:6px;background:rgba(13,59,59,.04);color:#3a5a5a;font-weight:400;display:inline-block}

          .spec-card{padding:28px;border-radius:16px;background:#fff;border:1px solid rgba(26,42,42,.06);transition:all .4s cubic-bezier(.16,1,.3,1);height:100%}
          .spec-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(26,42,42,.07)}

          .svc-wide-card{padding:28px;border-radius:16px;background:#fff;border:1px solid rgba(26,42,42,.06);transition:all .35s;position:relative;overflow:hidden}
          .svc-wide-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;background:linear-gradient(180deg,#0D3B3B,#B8860B);transform:scaleY(0);transform-origin:top;transition:transform .4s}
          .svc-wide-card:hover::before{transform:scaleY(1)} .svc-wide-card:hover{transform:translateX(4px);box-shadow:0 12px 40px rgba(26,42,42,.06)}

          .home-card{padding:32px 28px;border-radius:18px;background:#fff;border:1px solid rgba(26,42,42,.06);transition:all .4s cubic-bezier(.16,1,.3,1)}
          .home-card:hover{transform:translateY(-4px);box-shadow:0 20px 56px rgba(26,42,42,.08);border-color:rgba(184,134,11,.2)}

          .therapy-card{padding:18px 20px;border-radius:12px;background:#fff;border:1px solid rgba(26,42,42,.06);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;transition:all .3s}
          .therapy-card:hover{border-color:rgba(184,134,11,.25);transform:translateY(-2px)}

          .ins-card{padding:24px;border-radius:14px;background:#fff;border:1px solid rgba(26,42,42,.06);display:flex;justify-content:space-between;align-items:center;transition:all .3s}
          .ins-card:hover{border-color:rgba(184,134,11,.2);transform:translateY(-2px)}

          .resource-link-card{display:block;padding:20px 24px;border-radius:14px;background:#fff;border:1px solid rgba(26,42,42,.06);text-decoration:none;color:inherit;transition:all .35s}
          .resource-link-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(26,42,42,.06);border-color:rgba(184,134,11,.15)}

          .mobile-overlay{position:fixed;inset:0;background:rgba(13,59,59,.96);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;backdrop-filter:blur(20px)}
          .mobile-overlay span{font-family:'Playfair Display',serif;font-size:26px;color:#E8DCC8;cursor:pointer;transition:color .3s} .mobile-overlay span:hover{color:#B8860B}

          ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#FAF7F2} ::-webkit-scrollbar-thumb{background:#0D3B3B;border-radius:3px}

          @media(max-width:768px){
            .hero-title,.page-hero-title{font-size:36px!important;line-height:1.1!important}
            .grid-2,.grid-3{grid-template-columns:1fr!important}
            .grid-stats{grid-template-columns:repeat(2,1fr)!important}
            .resp-section{padding-left:20px!important;padding-right:20px!important}
            .resp-hero{padding:120px 20px 60px!important}
            .resp-hero-home{padding:120px 20px 80px!important}
            .svc-inner{flex-direction:column!important}
            footer{padding:32px 20px!important}
          }
        `}</style>

        {/* NAV */}
        <nav style={{
          position:"fixed",top:0,left:0,right:0,zIndex:100,
          background:scrollY>50?"rgba(250,247,242,.93)":"transparent",
          backdropFilter:scrollY>50?"blur(20px)":"none",
          borderBottom:scrollY>50?"1px solid rgba(26,42,42,.06)":"1px solid transparent",
          transition:"all .4s",padding:"0 40px",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>go("home")}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#0D3B3B,#1a5c5c)",display:"flex",alignItems:"center",justifyContent:"center",color:"#E8DCC8",fontSize:15,fontWeight:700}}>E</div>
            <span className="pf" style={{fontSize:18,fontWeight:600,color:"#0D3B3B",letterSpacing:"-0.01em"}}>Evolve Psychiatry</span>
          </div>
          {!isMobile && (
            <div style={{display:"flex",gap:28,fontSize:13,color:"#1a2a2a"}}>
              {NAV_ITEMS.map(([l,id])=><span key={id} className={`nav-link dm ${page===id?"nav-active":""}`} onClick={()=>go(id)}>{l}</span>)}
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {!isMobile && <a href="https://www.evolve-psychiatry.com/paq" target="_blank" rel="noopener noreferrer" className="cta-btn cta-primary" style={{padding:"8px 20px",fontSize:12}}>New Patient</a>}
            {isMobile && (
              <div onClick={()=>setMenuOpen(!menuOpen)} style={{cursor:"pointer",display:"flex",flexDirection:"column",gap:5,padding:4}}>
                <div style={{width:20,height:2,background:"#0D3B3B",borderRadius:1,transition:".3s",transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
                <div style={{width:20,height:2,background:"#0D3B3B",borderRadius:1,transition:".3s",opacity:menuOpen?0:1}}/>
                <div style={{width:20,height:2,background:"#0D3B3B",borderRadius:1,transition:".3s",transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
              </div>
            )}
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-overlay">
            <div onClick={()=>setMenuOpen(false)} style={{position:"absolute",top:18,right:22,color:"#E8DCC8",fontSize:30,cursor:"pointer"}}>×</div>
            {NAV_ITEMS.map(([l,id])=><span key={id} onClick={()=>go(id)} style={{color:page===id?"#B8860B":"#E8DCC8"}}>{l}</span>)}
          </div>
        )}

        <Page />
      </div>
    </RouterCtx.Provider>
  );
}
