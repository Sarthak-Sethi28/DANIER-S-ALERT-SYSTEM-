import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ROWS = [
  { item: 'Leather Bomber Jacket', season: 'KI00', size: 'M', color: 'Black', stock: 12, low: true },
  { item: 'Leather Bomber Jacket', season: 'KI00', size: 'L', color: 'Black', stock: 45, low: false },
  { item: 'Suede Crossbody Bag', season: 'KI00', size: 'OS', color: 'Tan', stock: 8, low: true },
  { item: 'Leather Moto Jacket', season: 'KI00', size: 'S', color: 'Cognac', stock: 3, low: true },
  { item: 'Leather Moto Jacket', season: 'KI00', size: 'M', color: 'Cognac', stock: 52, low: false },
  { item: 'Suede A-Line Skirt', season: 'KI00', size: 'XS', color: 'Camel', stock: 15, low: true },
  { item: 'Leather Weekender Bag', season: 'KI00', size: 'OS', color: 'Brown', stock: 6, low: true },
  { item: 'Nappa Leather Gloves', season: 'KI00', size: 'M', color: 'Black', stock: 67, low: false },
];

const ALERTS = [
  { name: 'Leather Bomber Jacket', color: 'Black', size: 'M', stock: 12, req: 30, badge: 'CRITICAL' },
  { name: 'Suede Crossbody Bag', color: 'Tan', size: 'OS', stock: 8, req: 30, badge: 'CRITICAL' },
  { name: 'Leather Moto Jacket', color: 'Cognac', size: 'S', stock: 3, req: 30, badge: 'CRITICAL' },
  { name: 'Suede A-Line Skirt', color: 'Camel', size: 'XS', stock: 15, req: 30, badge: 'HIGH' },
  { name: 'Leather Weekender Bag', color: 'Brown', size: 'OS', stock: 6, req: 30, badge: 'CRITICAL' },
];

const EMAILS = [
  { name: 'Leather Bomber Jacket', detail: 'Black · M', shortage: -18 },
  { name: 'Suede Crossbody Bag', detail: 'Tan · OS', shortage: -22 },
  { name: 'Leather Moto Jacket', detail: 'Cognac · S', shortage: -27 },
  { name: 'Suede A-Line Skirt', detail: 'Camel · XS', shortage: -15 },
  { name: 'Leather Weekender Bag', detail: 'Brown · OS', shortage: -24 },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('hp-visible'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function CountUp({ to, duration = 800 }) {
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / duration, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>0</span>;
}

function Section({ children, className = '' }) {
  const ref = useReveal();
  return <section ref={ref} className={`hp-section hp-reveal ${className}`}>{children}</section>;
}

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="hp-root">
      <style>{`
        .hp-root{--gold:#c9a84c;--gold2:#e8c96a;--bg:#07070e;--surf:rgba(13,13,26,0.9);--stroke:rgba(255,255,255,0.06);--txt:#f0f0f8;--muted:rgba(200,200,220,0.85);--red:#ff4d4d;--green:#10b981;--blue:#3b82f6;font-family:'Inter',sans-serif;color:var(--txt);}
        .hp-section{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;position:relative;}
        .hp-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
        .hp-visible{opacity:1;transform:translateY(0);}
        .hp-brand{font-family:'Space Grotesk',sans-serif;font-size:clamp(52px,9vw,88px);font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-sub{font-size:clamp(13px,1.4vw,17px);color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-top:12px;}
        .hp-line{width:160px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:16px auto;}
        .hp-stitle{font-family:'Space Grotesk',sans-serif;font-size:clamp(22px,3vw,30px);font-weight:700;letter-spacing:-.02em;text-align:center;margin-bottom:28px;}
        .hp-stitle em{font-style:normal;color:var(--gold);}
        .hp-win{width:min(740px,94vw);background:var(--surf);border:1px solid var(--stroke);border-radius:14px;overflow:hidden;}
        .hp-tbar{display:flex;align-items:center;padding:10px 14px;background:rgba(20,20,36,0.8);border-bottom:1px solid var(--stroke);gap:7px;}
        .hp-dot{width:9px;height:9px;border-radius:50%;}.hp-dr{background:#FF5F56;}.hp-dy{background:#FFBD2E;}.hp-dg{background:#27CA3F;}
        .hp-tbar span{flex:1;text-align:center;font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;}
        .hp-hdr{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr 1fr;background:rgba(16,185,129,.12);border-bottom:1px solid rgba(16,185,129,.15);}
        .hp-hdr div{padding:9px 12px;font-size:10px;font-weight:700;color:var(--green);font-family:'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;}
        .hp-row{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr 1fr;border-bottom:1px solid rgba(255,255,255,.03);opacity:0;transform:translateX(-16px);transition:all .35s ease;}
        .hp-visible .hp-row{opacity:1;transform:translateX(0);}
        .hp-row div{padding:9px 12px;font-size:11.5px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-row div:first-child{color:var(--txt);font-weight:500;}
        .hp-ki{color:var(--gold)!important;font-weight:600!important;}
        .hp-low{color:var(--red)!important;font-weight:600!important;}
        .hp-ok{color:var(--green)!important;}
        .hp-pipeline{display:flex;align-items:center;gap:0;flex-wrap:wrap;justify-content:center;margin-top:32px;}
        .hp-pnode{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 24px;background:var(--surf);border:1px solid var(--stroke);border-radius:14px;min-width:120px;transition:all .4s;}
        .hp-pnode.hp-lit{border-color:rgba(201,168,76,.45);box-shadow:0 0 24px rgba(201,168,76,.1);}
        .hp-picon{font-size:24px;}.hp-plbl{font-size:11px;font-weight:600;color:var(--txt);font-family:'Space Grotesk',sans-serif;}
        .hp-psub{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
        .hp-parr{width:36px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.12);transition:color .4s;}
        .hp-parr.hp-lit{color:var(--gold);}
        .hp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
        .hp-stat{background:rgba(5,8,14,.5);border:1px solid var(--stroke);border-radius:10px;padding:12px;text-align:center;opacity:0;transform:translateY(12px);transition:all .4s ease;}
        .hp-visible .hp-stat{opacity:1;transform:translateY(0);}
        .hp-sval{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin-bottom:2px;}
        .hp-slbl{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;}
        .hp-arow{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;align-items:center;padding:8px 11px;background:rgba(5,8,14,.35);border:1px solid var(--stroke);border-radius:9px;margin-bottom:5px;opacity:0;transform:translateX(-12px);transition:all .3s ease;}
        .hp-visible .hp-arow{opacity:1;transform:translateX(0);}
        .hp-arow div{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-arow div:first-child{color:var(--txt);font-weight:600;font-family:'Inter',sans-serif;font-size:11px;}
        .hp-badge{display:inline-flex;padding:2px 8px;border-radius:5px;font-size:8px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
        .hp-bcrit{background:rgba(255,77,77,.1);color:#ff4d4d;border:1px solid rgba(255,77,77,.2);}
        .hp-bhigh{background:rgba(251,146,60,.1);color:#fb923c;border:1px solid rgba(251,146,60,.2);}
        .hp-email-item{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;margin-bottom:4px;background:rgba(255,77,77,.04);border:1px solid rgba(255,77,77,.12);border-radius:7px;opacity:0;transform:translateX(-8px);transition:all .3s ease;}
        .hp-visible .hp-email-item{opacity:1;transform:translateX(0);}
        .hp-ename{font-size:11px;font-weight:600;color:var(--txt);}
        .hp-edetail{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;}
        .hp-eshort{font-size:11px;font-weight:700;color:var(--red);}
        .hp-sent{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--green);margin-top:16px;opacity:0;transition:opacity .5s;}.hp-visible .hp-sent{opacity:1;}
        .hp-check{width:24px;height:24px;border-radius:50%;background:rgba(16,185,129,.12);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:12px;}
        .hp-cta-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(34px,5.5vw,56px);font-weight:800;letter-spacing:-.04em;text-align:center;margin-bottom:16px;}
        .hp-cta-title em{font-style:normal;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-cta-sub{font-size:14px;color:var(--muted);text-align:center;margin-bottom:28px;}
        .hp-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#070A0F;font-weight:700;font-size:15px;border:none;cursor:pointer;text-decoration:none;transition:all .3s;font-family:'Space Grotesk',sans-serif;}
        .hp-btn:hover{box-shadow:0 0 36px rgba(201,168,76,.45);transform:translateY(-2px);}
        .hp-btn2{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;border-radius:999px;border:1px solid var(--stroke);background:transparent;color:var(--muted);font-size:13px;cursor:pointer;text-decoration:none;transition:all .3s;}
        .hp-btn2:hover{border-color:var(--gold);color:var(--gold);}
        .hp-glow{position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(100px);pointer-events:none;opacity:.05;}
        @media(max-width:768px){.hp-pipeline{flex-direction:column;}.hp-parr{transform:rotate(90deg);}.hp-stats{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      {/* HERO */}
      <Section className="" style={{ minHeight: '80vh' }}>
        <div className="hp-brand">DANIER</div>
        <div className="hp-line" />
        <div className="hp-sub">Inventory Intelligence</div>
      </Section>

      {/* EXCEL */}
      <Section>
        <div className="hp-stitle">Your Excel becomes a <em>living database</em></div>
        <div className="hp-win">
          <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventory_20260220.xlsx</span></div>
          <div className="hp-hdr"><div>Item Description</div><div>Season</div><div>Size</div><div>Color</div><div>Stock</div></div>
          {ROWS.map((r,i) => (
            <div key={i} className="hp-row" style={{ transitionDelay: `${i * 80}ms` }}>
              <div>{r.item}</div><div className="hp-ki">{r.season}</div><div>{r.size}</div><div>{r.color}</div>
              <div className={r.low ? 'hp-low' : 'hp-ok'}>{r.stock}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* PIPELINE */}
      <Section>
        <div className="hp-stitle">The system <em>processes</em> everything</div>
        <PipelineAnim />
      </Section>

      {/* DASHBOARD */}
      <Section>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Live Dashboard</div>
        <div className="hp-win" style={{ width: 'min(860px,94vw)' }}>
          <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventoryreport.ca/dashboard</span></div>
          <div style={{ padding: 16 }}>
            <div className="hp-stats">
              <div className="hp-stat" style={{ transitionDelay: '0ms' }}><div className="hp-sval" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp to={81} /></div><div className="hp-slbl">Key Items</div></div>
              <div className="hp-stat" style={{ transitionDelay: '120ms' }}><div className="hp-sval" style={{ color: '#ff4d4d' }}><CountUp to={247} /></div><div className="hp-slbl">Active Alerts</div></div>
              <div className="hp-stat" style={{ transitionDelay: '240ms' }}><div className="hp-sval" style={{ color: '#3b82f6' }}><CountUp to={38} /></div><div className="hp-slbl">Critical</div></div>
              <div className="hp-stat" style={{ transitionDelay: '360ms' }}><div className="hp-sval" style={{ color: '#10b981' }}><CountUp to={43} /></div><div className="hp-slbl">Healthy Stock</div></div>
            </div>
            {ALERTS.map((a,i) => (
              <div key={i} className="hp-arow" style={{ transitionDelay: `${500 + i * 100}ms` }}>
                <div>{a.name}</div><div>{a.color}</div><div>{a.size}</div>
                <div style={{ color: a.badge === 'CRITICAL' ? '#ff4d4d' : '#fb923c', fontWeight: 600 }}>{a.stock}</div>
                <div>{a.req}</div>
                <div><span className={`hp-badge ${a.badge === 'CRITICAL' ? 'hp-bcrit' : 'hp-bhigh'}`}>● {a.badge}</span></div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* EMAIL */}
      <Section>
        <div className="hp-win" style={{ width: 'min(600px,94vw)' }}>
          <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>Gmail — Danier Stock Alerts</span></div>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>From: <b style={{ color: 'var(--gold)' }}>Danier Stock Alerts</b></div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>To: team@danier.com, manager@danier.com, buyer@danier.com</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--stroke)' }}>🔴 Low Stock Alert — 5 Critical Items</div>
            {EMAILS.map((e,i) => (
              <div key={i} className="hp-email-item" style={{ transitionDelay: `${i * 100}ms` }}>
                <div><span className="hp-ename">{e.name}</span><br/><span className="hp-edetail">{e.detail}</span></div>
                <div className="hp-eshort">{e.shortage} units</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hp-sent"><div className="hp-check">✓</div><span>Delivered to 3 recipients</span></div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="hp-cta-title">Stop guessing.<br/><em>Start knowing.</em></div>
        <div className="hp-line" />
        <div className="hp-cta-sub">Upload. Detect. Alert. — Automatically.</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="hp-btn" onClick={() => navigate('/upload')}>Upload Report →</button>
          <button className="hp-btn2" onClick={() => navigate('/dashboard')}>View Dashboard</button>
        </div>
      </Section>
    </div>
  );
};

function PipelineAnim() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const nodes = el.querySelectorAll('.hp-pnode');
        const arrows = el.querySelectorAll('.hp-parr');
        nodes.forEach((n, i) => setTimeout(() => n.classList.add('hp-lit'), i * 350));
        arrows.forEach((a, i) => setTimeout(() => a.classList.add('hp-lit'), i * 350 + 200));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = [
    { icon: '📄', label: 'Excel Upload', sub: 'xlsx parsed' },
    { icon: '🗄️', label: 'Database', sub: 'structured' },
    { icon: '⚡', label: 'Alert Engine', sub: 'thresholds' },
    { icon: '📊', label: 'Dashboard', sub: 'live alerts' },
  ];

  return (
    <div ref={ref} className="hp-pipeline">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="hp-pnode"><div className="hp-picon">{s.icon}</div><div className="hp-plbl">{s.label}</div><div className="hp-psub">{s.sub}</div></div>
          {i < steps.length - 1 && (
            <div className="hp-parr"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default HomePage;
