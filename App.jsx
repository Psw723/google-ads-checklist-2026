import { useState, useEffect, useRef } from "react";

// ─── BENCHMARK DATA ───
const INDUSTRY_DATA = {
  "ecommerce_retail": { label: "E-commerce / Retail", cpc: "$1.50–$4.00", cvr: "3.5–5%", cpl: "$24–$45", cpa_note: "Shopping Ads CPC 40–55% lower than Search" },
  "saas_tech": { label: "SaaS / Tech", cpc: "$4.00–$7.00", cvr: "3–5%", cpl: "$45–$90", cpa_note: "Long sales cycles; track micro-conversions" },
  "legal_finance": { label: "Legal / Finance / Insurance", cpc: "$6.50–$9.00+", cvr: "4–6%", cpl: "$80–$135", cpa_note: "Highest CPCs but highest LTV per client" },
  "health_wellness": { label: "Health & Wellness", cpc: "$3.00–$6.00", cvr: "4–7%", cpl: "$40–$75", cpa_note: "CPM inflation +25% YoY — watch costs" },
  "home_services": { label: "Home Services / Contractors", cpc: "$5.00–$8.00", cvr: "5–8%", cpl: "$60–$95", cpa_note: "Strong local intent; use location targeting" },
  "agency_services": { label: "Agency / Prof. Services", cpc: "$4.00–$7.00", cvr: "4–7%", cpl: "$50–$100", cpa_note: "Value-based bidding critical for pipeline quality" },
  "travel_hospitality": { label: "Travel / Hospitality", cpc: "$1.50–$2.50", cvr: "3–5%", cpl: "$30–$55", cpa_note: "Lower CPCs, high seasonality swings" },
  "education": { label: "Education", cpc: "$4.50–$7.00", cvr: "5–8%", cpl: "$50–$85", cpa_note: "CPC rose 40%+ YoY — tighten targeting" },
  "other": { label: "Other / General", cpc: "$3.00–$6.00", cvr: "4–8%", cpl: "$40–$75", cpa_note: "Cross-industry avg CPC is $5.26" }
};

// ─── ADAPTIVE CHECKLIST LOGIC ───
function getChecklist(config) {
  const { budget, model, goal, industry } = config;
  const isSmall = budget === "small";
  const isMed = budget === "medium";
  const isLarge = budget === "large";
  const isB2B = model === "b2b";
  const isEcomm = goal === "ecommerce";
  const isLead = goal === "leads";
  const ind = INDUSTRY_DATA[industry] || INDUSTRY_DATA.other;

  const sections = [];

  // 1. BIDDING STRATEGY
  const biddingItems = [];
  if (isSmall) {
    biddingItems.push({
      text: "Start with Manual CPC — set bids at keyword level",
      detail: `At <$1,500/mo, automated bidding has too little data to learn. Manual CPC gives you control over every dollar. Calculate your Max CPC: Target CPA × (Expected CVR / 100). For your industry (${ind.label}), expect CPCs of ${ind.cpc}.`,
      priority: "critical",
      tag: "SMALL BUDGET"
    });
    biddingItems.push({
      text: "Set a daily budget you can sustain for 90 days minimum",
      detail: "Google needs consistency to learn. A $500/mo budget that runs out in 2 weeks teaches nothing. Better to run $15/day steadily than $50/day for 10 days. Plan for at least 3 months before evaluating ROI.",
      priority: "critical",
      tag: "SMALL BUDGET"
    });
    biddingItems.push({
      text: "Focus on ONE campaign with your highest-intent keywords only",
      detail: "Don't spread a small budget across 3–5 campaigns. Pick your single most valuable service/product, target 10–20 exact + phrase match keywords, and prove ROI before expanding.",
      priority: "critical",
      tag: "SMALL BUDGET"
    });
  } else if (isMed) {
    biddingItems.push({
      text: "Start with Maximize Conversions (no tCPA target yet)",
      detail: `At $1,500–$5,000/mo, you have enough budget for Smart Bidding to learn — but not enough for constraints yet. Let it run uncapped for 2–4 weeks. Expected CPCs for ${ind.label}: ${ind.cpc}.`,
      priority: "critical",
      tag: "MED BUDGET"
    });
    biddingItems.push({
      text: "Switch to Target CPA only after 30+ conversions/month",
      detail: "Setting a tCPA too early throttles spend and extends the learning phase. Track your actual CPA for 4–6 weeks, then set a target 10–20% above your observed average to give the algorithm room.",
      priority: "critical",
      tag: "MED BUDGET"
    });
  } else {
    biddingItems.push({
      text: isEcomm
        ? "Use Maximize Conversion Value with tROAS once you have 50+ conversions/month"
        : "Use Maximize Conversions → Target CPA as data accumulates",
      detail: isEcomm
        ? "At $5K+/mo with e-commerce, Max Conversion Value outperforms Max Conversions by ~300% on ROAS (Optmyzr research). Feed Google product-level revenue data so it optimizes for profit, not just volume."
        : `At scale, layer in value-based bidding: assign tiered values (e.g., Form = $50, Call Booked = $150, SQL = $500). This teaches the algorithm which leads matter for ${ind.label}.`,
      priority: "critical",
      tag: "LARGE BUDGET"
    });
    biddingItems.push({
      text: "Use Portfolio Bid Strategies with Max CPC caps as guardrails",
      detail: "At higher budgets, Google will bid aggressively. Set a Max CPC cap via Portfolio Strategy (Tools → Bid Strategies) to prevent $50 clicks when your average is $5. ROAS-oriented strategies benefit most from caps.",
      priority: "high",
      tag: "LARGE BUDGET"
    });
  }
  biddingItems.push({
    text: "Never touch bids or budgets during the 7–14 day learning phase",
    detail: "Every major change resets learning. The temptation to \"fix\" a dip on day 3 is the #1 cause of perpetual learning phases. Set a calendar reminder for day 14 — that's when you evaluate.",
    priority: "critical"
  });
  if (isSmall) {
    biddingItems.push({
      text: "NOTE: eCPC was deprecated March 2025 — it no longer exists",
      detail: "Enhanced CPC (eCPC) was removed from Google Ads in March 2025. If you see old guides recommending it, they're outdated. Your options are Manual CPC or automated strategies (Maximize Conversions, tCPA, tROAS).",
      priority: "high",
      tag: "⚠️ IMPORTANT"
    });
  }
  sections.push({ id: "bidding", label: "01", title: "Bidding Strategy", subtitle: `Tailored for your ${budget === "small" ? "<$1.5K" : budget === "medium" ? "$1.5–5K" : "$5K+"}/mo budget`, items: biddingItems });

  // 2. ACCOUNT STRUCTURE
  const structItems = [];
  structItems.push({
    text: "Separate Brand vs. Non-Brand into different campaigns",
    detail: "Brand traffic inflates non-brand metrics. A 15% CVR on brand searches masks a 3% CVR on non-brand. Without separation, you can't measure true acquisition performance.",
    priority: "critical"
  });
  if (isSmall) {
    structItems.push({
      text: "Run 1–2 campaigns maximum — consolidate for data density",
      detail: "A $1,000/mo budget split across 4 campaigns = $250/campaign = ~50 clicks/month each at $5 CPC. That's not enough data for anything to optimize. One focused campaign beats four starving ones.",
      priority: "critical",
      tag: "SMALL BUDGET"
    });
  } else {
    structItems.push({
      text: "Use STAGs: 3–10 tightly themed keywords per ad group",
      detail: "Close variant matching killed SKAGs. RSAs need 3,000+ impressions/month to optimize. STAGs give Smart Bidding the data density it needs while maintaining message relevance.",
      priority: "critical"
    });
  }
  if (isEcomm) {
    structItems.push({
      text: "Prioritize Shopping campaigns — CPCs are 40–55% lower than Search",
      detail: "Shopping Ads average $0.50–$0.95 CPC vs. $3–5+ for Search. They show product images, prices, and reviews — pre-qualifying buyers before the click. Feed quality is everything.",
      priority: "critical",
      tag: "E-COMMERCE"
    });
    structItems.push({
      text: "Segment Shopping by product margin tiers, not just categories",
      detail: "Group high-margin products separately so you can bid more aggressively on them. A $10 margin product and a $100 margin product shouldn't share the same ROAS target.",
      priority: "high",
      tag: "E-COMMERCE"
    });
  }
  if (isB2B) {
    structItems.push({
      text: "Create campaigns by funnel stage, not just service category",
      detail: "Separate awareness keywords (\"what is X\") from decision keywords (\"X agency pricing\"). Different intent = different landing pages, different ad copy, different bid values.",
      priority: "high",
      tag: "B2B"
    });
  }
  structItems.push({
    text: "Set location targeting to \"Presence\" only — never \"Presence or Interest\"",
    detail: "The default shows ads to people merely researching your area. For service businesses, you want people physically there. For e-commerce, \"Presence or Interest\" may be fine if you ship nationwide.",
    priority: "critical"
  });
  structItems.push({
    text: "Turn off ALL auto-apply recommendations immediately",
    detail: "Google can auto-add broad match keywords, change bid strategies, and modify budgets without your consent. These settings have wrecked accounts. Disable every single one in Settings → Auto-applied recommendations.",
    priority: "critical"
  });
  sections.push({ id: "structure", label: "02", title: "Account Structure", subtitle: isEcomm ? "Optimized for e-commerce sales" : isB2B ? "Built for B2B lead generation" : "Organized for lead generation", items: structItems });

  // 3. CONVERSION TRACKING
  const convItems = [];
  convItems.push({
    text: "Use the Google Ads tag as your primary conversion source, not GA4",
    detail: "The native Google Ads tag provides more accurate, responsive data for Smart Bidding. GA4 has attribution delays and data sampling. Use GA4 as a complement for behavioral analysis only.",
    priority: "critical"
  });
  if (isLead) {
    convItems.push({
      text: "Set booked calls/form submissions as PRIMARY conversions only",
      detail: "Page views, time-on-site, and \"engaged sessions\" are secondary — don't include them in your conversion count. Smart Bidding optimizes toward primary conversions. Polluting this with soft signals = garbage leads.",
      priority: "critical",
      tag: "LEAD GEN"
    });
    convItems.push({
      text: "Assign tiered conversion values by lead quality",
      detail: `For ${ind.label}: assign values like Form Submit = $50, Discovery Call = $150, Proposal Sent = $500, Closed Deal = actual revenue. This teaches the algorithm which leads actually matter.`,
      priority: "high",
      tag: "LEAD GEN"
    });
    if (isB2B) {
      convItems.push({
        text: "Set up Enhanced Conversions for Leads — import CRM data back",
        detail: "Hash and send first-party data (email, phone) to Google. For B2B with long sales cycles, import offline conversions from your CRM (HubSpot, Salesforce) so Google sees which clicks became revenue.",
        priority: "high",
        tag: "B2B"
      });
    }
  }
  if (isEcomm) {
    convItems.push({
      text: "Enable Conversions with Cart Data for profit-level optimization",
      detail: "Feed actual product margins into Google. A $100 sale at 10% margin and a $100 sale at 50% margin look identical to Google without this. Cart data lets tROAS optimize for profit, not just revenue.",
      priority: "critical",
      tag: "E-COMMERCE"
    });
    convItems.push({
      text: "Track \"New Customer Acquisition\" as a separate conversion goal",
      detail: "Tell Google you'll pay more for first-time buyers vs. returning customers. This prevents the algorithm from just retargeting existing customers (the easiest conversions) with your prospecting budget.",
      priority: "high",
      tag: "E-COMMERCE"
    });
  }
  convItems.push({
    text: "Verify all tags fire correctly with Google Tag Assistant before launch",
    detail: "Test every conversion action on every device. A broken tag means weeks of wasted spend with zero optimization signal. Check monthly — site updates silently break tags.",
    priority: "critical"
  });
  if (!isSmall) {
    convItems.push({
      text: "Set up consent signals (ad_user_data, ad_personalization) via your CMP",
      detail: "Without proper consent signals, modeling and measurement degrade as users decline cookies. This is table stakes for accurate attribution in 2026.",
      priority: "medium"
    });
  }
  sections.push({ id: "conversion", label: "03", title: "Conversion Tracking", subtitle: "Without this, every optimization decision is a guess", items: convItems });

  // 4. KEYWORDS
  const kwItems = [];
  if (isSmall) {
    kwItems.push({
      text: "Use Exact Match only at launch — maximum precision on a small budget",
      detail: `At <$1.5K/mo, every click matters. Exact match ensures you only pay for the searches you specifically want. Your industry (${ind.label}) CPCs of ${ind.cpc} mean you're getting 200–600 clicks/month at best. Make each one count.`,
      priority: "critical",
      tag: "SMALL BUDGET"
    });
  } else {
    kwItems.push({
      text: "Launch with Exact + Phrase match — add Broad only after 30+ monthly conversions",
      detail: "Broad match on a new account with no conversion history drains budget on garbage queries. Start precise, build negative lists, prove the funnel converts, then cautiously test Broad in a separate campaign.",
      priority: "critical"
    });
  }
  kwItems.push({
    text: "Build account-level negative keyword lists BEFORE launch",
    detail: isEcomm
      ? "Block: free, DIY, how to, tutorial, review (unless you want review traffic), wholesale, bulk, used, refurbished, cheap. Add competitor names as negatives unless you run a competitor campaign."
      : "Block: free, DIY, jobs, salary, hiring, intern, tutorial, course, template, download, software, cheap. For agencies: also block \"freelance,\" \"tools,\" \"AI generator.\"",
    priority: "critical"
  });
  kwItems.push({
    text: "Review Search Terms Report every 3 days for the first month",
    detail: "This is the single highest-ROI 15 minutes in PPC. After 100 clicks, you'll find negatives you didn't anticipate and golden keywords you didn't think of. Move to weekly after month one.",
    priority: "critical"
  });
  kwItems.push({
    text: "Add cross-campaign negatives to prevent internal keyword competition",
    detail: "If \"startup design agency\" lives in Campaign A, negate it in Campaign B. Bidding against yourself wastes budget and confuses the algorithm's attribution.",
    priority: "high"
  });
  if (isEcomm) {
    kwItems.push({
      text: "Prioritize product-specific long-tail keywords over category terms",
      detail: "\"blue running shoes size 10\" converts at 3–5× the rate of \"running shoes.\" Long-tail keywords are cheaper and signal purchase intent. Layer in Shopping Ads for broad product discovery.",
      priority: "high",
      tag: "E-COMMERCE"
    });
  }
  sections.push({ id: "keywords", label: "04", title: "Keyword Strategy", subtitle: "The algorithm is only as good as what you feed it", items: kwItems });

  // 5. AD CREATIVE
  const adItems = [];
  adItems.push({
    text: "Write 10–15 diverse RSA headlines organized by theme buckets",
    detail: "Buckets: 2–3 on core outcome, 2–3 on differentiation, 2–3 on pain points, 2–3 with social proof, 2–3 with CTAs. This gives Google meaningful variation without redundancy.",
    priority: "critical"
  });
  adItems.push({
    text: "Don't chase \"Excellent\" Ad Strength — optimize for conversions",
    detail: "Adalysis research shows lower Ad Strength ads often have higher conversion rates. Ad Strength measures Google's control over your messaging, not ad quality. A \"Good\" ad that converts beats an \"Excellent\" one that doesn't.",
    priority: "high"
  });
  if (isB2B) {
    adItems.push({
      text: "Lead with outcomes and proof, not features or process",
      detail: "\"$300M+ Raised by Our Clients\" beats \"Full-Service Design Agency.\" B2B buyers are skeptical — specific numbers, named client results, and time-to-value claims outperform generic positioning every time.",
      priority: "high",
      tag: "B2B"
    });
  }
  if (isEcomm) {
    adItems.push({
      text: "Include price, shipping, and promotion info in headlines",
      detail: "E-commerce shoppers are comparison-shopping. \"Free Shipping Over $50\" and \"20% Off First Order\" in headlines pre-qualify buyers and improve CTR. Use promotion extensions for sale events.",
      priority: "high",
      tag: "E-COMMERCE"
    });
  }
  adItems.push({
    text: "Replace any \"Poor\" or \"Low\" rated RSA assets immediately",
    detail: "Check asset ratings bi-weekly. Low-rated headlines drag down the entire ad group. Swap them for fresh angles — test emotional vs. informational, question vs. statement, short vs. long.",
    priority: "high"
  });
  adItems.push({
    text: "Use ALL available ad extensions — they're free CTR boosters",
    detail: "Sitelinks, callouts, structured snippets, call extensions, image extensions. Advertisers using 3+ extensions see ~20% CTR lift. There's no reason not to use every one available.",
    priority: "high"
  });
  sections.push({ id: "ads", label: "05", title: "Ad Creative & RSAs", subtitle: "Quality and diversity of inputs determines output quality", items: adItems });

  // 6. LANDING PAGES
  const lpItems = [];
  lpItems.push({
    text: "Every ad group must point to an intent-matched landing page",
    detail: "Sending all traffic to the homepage is the #1 budget-wasting mistake. Someone searching \"pitch deck design\" needs a pitch deck page. Someone searching \"running shoes\" needs the running shoes category page.",
    priority: "critical"
  });
  lpItems.push({
    text: "Message match: ad headline ↔ landing page H1",
    detail: "The first thing a visitor sees after clicking should mirror what they just read. Mismatch = instant bounce. This directly impacts Quality Score, which directly impacts CPC.",
    priority: "critical"
  });
  lpItems.push({
    text: "Mobile-first: 62–68% of Google Ads clicks are mobile",
    detail: "Test every page on mobile before launch. Thumb-friendly CTAs, <3s load time, no horizontal scroll. Mobile isn't optional — it's the majority of your traffic and has slightly higher CPCs.",
    priority: "high"
  });
  if (isLead) {
    lpItems.push({
      text: "Place social proof within visual range of the CTA",
      detail: "Testimonials, client logos, and result metrics near the form/button reduce friction at the moment of decision. Don't bury proof at the bottom — it should be visible without scrolling past the CTA.",
      priority: "high",
      tag: "LEAD GEN"
    });
  }
  if (isEcomm) {
    lpItems.push({
      text: "Product pages need reviews, stock indicators, and trust badges",
      detail: "E-commerce landing pages convert when buyers feel safe. Star ratings, review counts, \"In Stock\" labels, secure checkout badges, and return policy all reduce purchase anxiety.",
      priority: "high",
      tag: "E-COMMERCE"
    });
  }
  sections.push({ id: "landing", label: "06", title: "Landing Pages", subtitle: "The best campaign can't fix a bad landing page", items: lpItems });

  // 7. ONGOING
  const ongoingItems = [];
  ongoingItems.push({
    text: "Weekly: Search Terms Report → add negatives + find expansion keywords",
    detail: "Non-negotiable. 15 minutes/week. This is where you find the garbage eating your budget and the gold keywords you didn't think of. The single highest-ROI activity in account management.",
    priority: "critical"
  });
  ongoingItems.push({
    text: "Weekly: Budget pacing check — are you under or over-spending?",
    detail: "Maximize Conversions will spend your entire daily budget, even on bad days. Manual CPC may under-spend. Check weekly and adjust if >20% off target. Google can spend 2× your daily budget on any given day.",
    priority: "high"
  });
  ongoingItems.push({
    text: "Bi-weekly: Replace underperforming RSA assets",
    detail: "Even good ads fatigue. Rotate in new headlines and descriptions. Test different angles: emotional vs. rational, question vs. statement, short vs. long. Check asset-level performance ratings.",
    priority: "high"
  });
  ongoingItems.push({
    text: "Monthly: Verify conversion tracking still fires correctly",
    detail: "Site updates, CMS changes, and plugin updates silently break tags. Monthly verification catches this before weeks of data go missing. Use Tag Assistant + real test conversions.",
    priority: "high"
  });
  if (!isSmall) {
    ongoingItems.push({
      text: "Monthly: Audit Auction Insights for competitive shifts",
      detail: "New competitors entering will spike CPCs. If someone suddenly appears with 30%+ impression share, adjust copy to differentiate or increase bids on your highest-converting terms.",
      priority: "medium"
    });
  }
  ongoingItems.push({
    text: "Quarterly: Full account structure review — is it still aligned?",
    detail: "Has your offer changed? Are there new keyword themes worth pursuing? Are any campaigns consistently above target CPA with no improvement trend? Restructure proactively, not reactively.",
    priority: "medium"
  });
  sections.push({ id: "ongoing", label: "07", title: "Ongoing Optimization", subtitle: "The weekly rituals that separate pros from amateurs", items: ongoingItems });

  // 8. WHAT TO IGNORE
  const ignoreItems = [];
  ignoreItems.push({
    text: "Ignore: \"Switch all keywords to Broad Match\" (until you have data)",
    detail: "Broad match without conversion history = budget fire. Google pushes it because it maximizes their revenue. Test it only after 30+ monthly conversions, strong negatives, and Smart Bidding in place.",
    priority: "critical"
  });
  ignoreItems.push({
    text: "Ignore: \"Apply automatically created assets\"",
    detail: "Google auto-generates headlines and descriptions that are often off-brand, generic, or misleading. Review every single suggestion manually. Never auto-apply creative changes.",
    priority: "critical"
  });
  if (isLead) {
    ignoreItems.push({
      text: "Ignore: \"Use Performance Max for lead gen\"",
      detail: "PMax pushes budget to Display and YouTube with terrible lead quality for service businesses. It's designed for e-commerce. Stick to Search campaigns for lead gen until you've maxed out Search volume.",
      priority: "high",
      tag: "LEAD GEN"
    });
  }
  ignoreItems.push({
    text: "Ignore: \"Optimization Score\" as a performance metric",
    detail: "This measures how many Google suggestions you've accepted — not how well you perform. An 80% score with strong ROAS beats 100% with bloated spend. Google literally rewards you for giving them more money.",
    priority: "high"
  });
  ignoreItems.push({
    text: "Ignore: \"Raise your budget\" without conversion data backing it",
    detail: "Google always recommends more spend. Budget increases only make sense when CPA is below target and you have clear headroom. Not before. Your budget should follow results, not Google's suggestions.",
    priority: "high"
  });
  if (isSmall) {
    ignoreItems.push({
      text: "Ignore: Old guides recommending eCPC — it was killed March 2025",
      detail: "Enhanced CPC (eCPC) was fully deprecated by Google in March 2025. Any guide still recommending it is outdated. Your options now: Manual CPC (you set bids) or Smart Bidding (Google sets bids).",
      priority: "high",
      tag: "⚠️ OUTDATED"
    });
  }
  sections.push({ id: "ignore", label: "08", title: "What to Ignore from Google", subtitle: "Google optimizes for Google's revenue — you optimize for yours", items: ignoreItems });

  return sections;
}

// ─── PRIORITY CONFIG ───
const priorityConfig = {
  critical: { label: "CRITICAL", color: "#FF4D6A" },
  high: { label: "HIGH", color: "#FFA726" },
  medium: { label: "MEDIUM", color: "#66BB6A" }
};

// ─── MAIN COMPONENT ───
export default function AdaptiveChecklist() {
  const [step, setStep] = useState(0); // 0=config, 1=checklist
  const [config, setConfig] = useState({ budget: null, model: null, goal: null, industry: null });
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const isConfigComplete = config.budget && config.model && config.goal && config.industry;
  const sections = isConfigComplete ? getChecklist(config) : [];
  const totalItems = sections.reduce((a, s) => a + s.items.length, 0);
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;
  const ind = INDUSTRY_DATA[config.industry] || INDUSTRY_DATA.other;

  useEffect(() => {
    if (step === 1 && sections.length && !activeSection) setActiveSection(sections[0].id);
  }, [step, sections]);

  const toggleCheck = (sid, idx) => {
    const k = `${sid}-${idx}`;
    setCheckedItems(p => ({ ...p, [k]: !p[k] }));
  };
  const toggleExpand = (sid, idx) => {
    const k = `${sid}-${idx}`;
    setExpandedItems(p => ({ ...p, [k]: !p[k] }));
  };
  const getSectionProgress = (sid) => {
    const s = sections.find(x => x.id === sid);
    if (!s) return 0;
    const c = s.items.filter((_, i) => checkedItems[`${sid}-${i}`]).length;
    return Math.round((c / s.items.length) * 100);
  };

  // ─── CONFIG SCREEN ───
  const ConfigOption = ({ label, value, current, onClick, description }) => (
    <button onClick={() => onClick(value)} style={{
      padding: "14px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
      border: current === value ? "1px solid rgba(233,69,96,0.5)" : "1px solid rgba(255,255,255,0.08)",
      background: current === value ? "rgba(233,69,96,0.1)" : "rgba(255,255,255,0.02)",
      transition: "all 0.25s ease", width: "100%"
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: current === value ? "#F0F0F5" : "#A0A0B0", marginBottom: description ? 4 : 0 }}>{label}</div>
      {description && <div style={{ fontSize: 12, color: "#6B6B80", lineHeight: 1.4 }}>{description}</div>}
    </button>
  );

  const ConfigGroup = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#E94560", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div>
    </div>
  );

  const activeSec = sections.find(s => s.id === activeSection);

  return (
    <div style={{
      fontFamily: "'Instrument Sans', 'DM Sans', -apple-system, sans-serif",
      background: "#06060B", color: "#F0F0F5", minHeight: "100vh", position: "relative", overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "-30%", right: "-20%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(233,69,96,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* HEADER — always visible */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.6s ease", marginBottom: step === 0 ? 32 : 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E94560" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#E94560" }}>Google Ads Playbook — 2026 Edition</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            {step === 0 ? <>Your Personalized<br /><span style={{ color: "#E94560" }}>Google Ads</span> Checklist</> : <><span style={{ color: "#E94560" }}>{totalItems}</span> Items Tailored to You</>}
          </h1>
          {step === 0 && <p style={{ fontSize: 14, color: "#8888A0", maxWidth: 480, lineHeight: 1.6, margin: 0 }}>
            Built from 2026 practitioner consensus. Answer 4 questions and get a checklist calibrated to your budget, business model, and goals — not Google's generic recommendations.
          </p>}
        </div>

        {/* ─── STEP 0: CONFIGURATION ─── */}
        {step === 0 && (
          <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }}>
            <ConfigGroup title="Monthly Google Ads Budget">
              <ConfigOption label="< $1,500/mo" description="Manual CPC, 1–2 campaigns max" value="small" current={config.budget} onClick={v => setConfig(p => ({ ...p, budget: v }))} />
              <ConfigOption label="$1,500 – $5,000/mo" description="Smart Bidding, 3–5 campaigns" value="medium" current={config.budget} onClick={v => setConfig(p => ({ ...p, budget: v }))} />
              <ConfigOption label="$5,000+/mo" description="Full automation + guardrails" value="large" current={config.budget} onClick={v => setConfig(p => ({ ...p, budget: v }))} />
            </ConfigGroup>

            <ConfigGroup title="Business Model">
              <ConfigOption label="B2B" description="Longer sales cycles, higher LTV" value="b2b" current={config.model} onClick={v => setConfig(p => ({ ...p, model: v }))} />
              <ConfigOption label="B2C" description="Shorter cycles, higher volume" value="b2c" current={config.model} onClick={v => setConfig(p => ({ ...p, model: v }))} />
            </ConfigGroup>

            <ConfigGroup title="Primary Goal">
              <ConfigOption label="Lead Generation" description="Calls, forms, demos, consultations" value="leads" current={config.goal} onClick={v => setConfig(p => ({ ...p, goal: v }))} />
              <ConfigOption label="E-commerce Sales" description="Online purchases, product revenue" value="ecommerce" current={config.goal} onClick={v => setConfig(p => ({ ...p, goal: v }))} />
            </ConfigGroup>

            <ConfigGroup title="Industry">
              {Object.entries(INDUSTRY_DATA).map(([k, v]) => (
                <ConfigOption key={k} label={v.label} value={k} current={config.industry} onClick={v2 => setConfig(p => ({ ...p, industry: v2 }))} />
              ))}
            </ConfigGroup>

            {/* Industry benchmarks preview */}
            {config.industry && (
              <div style={{
                padding: "16px 20px", borderRadius: 12, marginBottom: 24,
                background: "rgba(233,69,96,0.05)", border: "1px solid rgba(233,69,96,0.15)"
              }}>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#E94560", letterSpacing: "0.1em", marginBottom: 10 }}>
                  {ind.label.toUpperCase()} — 2025/2026 BENCHMARKS
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[["Avg CPC", ind.cpc], ["Avg CVR", ind.cvr], ["Avg CPL", ind.cpl]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: "#6B6B80", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#8888A0", marginTop: 10, fontStyle: "italic" }}>{ind.cpa_note}</div>
              </div>
            )}

            <button onClick={() => { if (isConfigComplete) { setStep(1); setActiveSection(null); }}} disabled={!isConfigComplete} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700,
              cursor: isConfigComplete ? "pointer" : "not-allowed", transition: "all 0.3s ease",
              background: isConfigComplete ? "#E94560" : "rgba(255,255,255,0.05)",
              color: isConfigComplete ? "#FFF" : "#4A4A5A"
            }}>
              {isConfigComplete ? `Generate My ${totalItems}-Item Checklist →` : "Select all options above to continue"}
            </button>
          </div>
        )}

        {/* ─── STEP 1: CHECKLIST ─── */}
        {step === 1 && (
          <div>
            {/* Summary bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "12px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap"
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 24, fontWeight: 700, color: pct === 100 ? "#66BB6A" : "#E94560" }}>{pct}%</div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 11, color: "#6B6B80", marginBottom: 4 }}>{totalChecked}/{totalItems} · {config.budget === "small" ? "<$1.5K" : config.budget === "medium" ? "$1.5–5K" : "$5K+"}/mo · {config.model?.toUpperCase()} · {config.goal === "ecommerce" ? "E-comm" : "Lead Gen"}</div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#66BB6A" : "linear-gradient(90deg,#E94560,#FF6B81)", transition: "width 0.5s ease", borderRadius: 2 }} />
                </div>
              </div>
              <button onClick={() => { setStep(0); setCheckedItems({}); setExpandedItems({}); setActiveSection(null); }} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#8888A0", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace"
              }}>↻ Reconfigure</button>
            </div>

            {/* Tabs */}
            <div ref={scrollRef} style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 6, marginBottom: 24, scrollbarWidth: "none" }}>
              {sections.map(s => {
                const active = activeSection === s.id;
                const prog = getSectionProgress(s.id);
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                    flex: "0 0 auto", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11,
                    fontFamily: "'Space Mono', monospace", fontWeight: 500, whiteSpace: "nowrap",
                    border: active ? "1px solid rgba(233,69,96,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    background: active ? "rgba(233,69,96,0.08)" : "rgba(255,255,255,0.02)",
                    color: active ? "#F0F0F5" : "#6B6B80", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <span style={{ color: active ? "#E94560" : "#4A4A5A", fontSize: 10 }}>{s.label}</span>
                    {s.title}
                    {prog === 100 && <span style={{ color: "#66BB6A" }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Active section */}
            {activeSec && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#E94560", letterSpacing: "0.1em" }}>( {activeSec.label} )</span>
                    <h2 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{activeSec.title}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: "#6B6B80", margin: 0, fontStyle: "italic" }}>{activeSec.subtitle}</p>
                  <div style={{ marginTop: 12, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${getSectionProgress(activeSec.id)}%`, background: getSectionProgress(activeSec.id) === 100 ? "#66BB6A" : "#E94560", transition: "width 0.4s ease" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {activeSec.items.map((item, idx) => {
                    const key = `${activeSec.id}-${idx}`;
                    const checked = !!checkedItems[key];
                    const expanded = !!expandedItems[key];
                    const pc = priorityConfig[item.priority];
                    return (
                      <div key={key} style={{
                        borderRadius: 10, overflow: "hidden", transition: "all 0.25s ease",
                        border: `1px solid ${checked ? "rgba(102,187,106,0.2)" : "rgba(255,255,255,0.06)"}`,
                        background: checked ? "rgba(102,187,106,0.03)" : "rgba(255,255,255,0.02)"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                          onClick={() => toggleExpand(activeSec.id, idx)}>
                          <div onClick={e => { e.stopPropagation(); toggleCheck(activeSec.id, idx); }} style={{
                            flex: "0 0 20px", height: 20, borderRadius: 5, marginTop: 1,
                            border: checked ? "2px solid #66BB6A" : "2px solid rgba(255,255,255,0.15)",
                            background: checked ? "rgba(102,187,106,0.15)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease"
                          }}>
                            {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                                color: checked ? "#66BB6A" : "#E8E8F0",
                                textDecoration: checked ? "line-through" : "none",
                                textDecorationColor: "rgba(102,187,106,0.3)", transition: "all 0.2s ease"
                              }}>{item.text}</span>
                              <span style={{
                                fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "2px 6px",
                                borderRadius: 4, fontWeight: 700, letterSpacing: "0.06em",
                                color: pc.color, background: `${pc.color}15`, border: `1px solid ${pc.color}30`
                              }}>{pc.label}</span>
                              {item.tag && <span style={{
                                fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "2px 6px",
                                borderRadius: 4, fontWeight: 600, letterSpacing: "0.04em",
                                color: "#8888A0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)"
                              }}>{item.tag}</span>}
                            </div>
                          </div>
                          <div style={{
                            flex: "0 0 18px", height: 18, display: "flex", alignItems: "center",
                            justifyContent: "center", color: "#4A4A5A", transition: "transform 0.2s ease",
                            transform: expanded ? "rotate(180deg)" : "rotate(0)"
                          }}>
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                        {expanded && (
                          <div style={{ padding: "0 16px 14px 48px", animation: "fadeIn 0.2s ease" }}>
                            <p style={{ fontSize: 12, lineHeight: 1.65, color: "#8888A0", margin: 0, borderLeft: "2px solid rgba(233,69,96,0.2)", paddingLeft: 12 }}>{item.detail}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Nav */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {(() => {
                    const ci = sections.findIndex(s => s.id === activeSection);
                    const prev = ci > 0 ? sections[ci - 1] : null;
                    const next = ci < sections.length - 1 ? sections[ci + 1] : null;
                    return (<>
                      {prev ? <button onClick={() => setActiveSection(prev.id)} style={{ background: "none", border: "none", color: "#6B6B80", cursor: "pointer", fontSize: 12, padding: 0 }}>← {prev.title}</button> : <div />}
                      {next ? <button onClick={() => setActiveSection(next.id)} style={{ background: "none", border: "none", color: "#E94560", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}>{next.title} →</button> : <div />}
                    </>);
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#4A4A5A", letterSpacing: "0.1em", textTransform: "uppercase" }}>Built by Rvysion · rvysion.co</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#4A4A5A" }}>Practitioner consensus · Not Google's recommendations</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { display:none; }
        * { box-sizing:border-box; }
        button:hover { opacity:0.88; }
      `}</style>
    </div>
  );
}
