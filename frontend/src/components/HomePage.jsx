import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const THRESHOLDS = [
  { item: 'Leather Bomber Jacket', size: 'M', color: 'Black', threshold: 30, stock: 12, status: 'CRITICAL' },
  { item: 'Suede Crossbody Bag', size: 'OS', color: 'Tan', threshold: 25, stock: 8, status: 'CRITICAL' },
  { item: 'Leather Moto Jacket', size: 'S', color: 'Cognac', threshold: 30, stock: 3, status: 'CRITICAL' },
  { item: 'Nappa Leather Gloves', size: 'M', color: 'Black', threshold: 20, stock: 67, status: 'HEALTHY' },
  { item: 'Suede A-Line Skirt', size: 'XS', color: 'Camel', threshold: 30, stock: 15, status: 'HIGH' },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('hp-visible'); io.disconnect(); }
    }, { threshold: 0.12 });
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

function MouseGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0, y = 0, cx = 0, cy = 0;
    const onMove = (e) => { x = e.clientX; y = e.clientY + window.scrollY; };
    window.addEventListener('mousemove', onMove);
    let raf;
    (function loop() {
      cx += (x - cx) * 0.08;
      cy += (y - cy) * 0.08;
      el.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      raf = requestAnimationFrame(loop);
    })();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }} />;
}

function FloatingParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = document.documentElement.scrollHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.3 + 0.05,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = document.documentElement.scrollHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

function LiveTicker() {
  const [items, setItems] = useState([]);
  const idx = useRef(0);
  const tickers = [
    { text: 'Leather Bomber Jacket — Stock: 12 ▼', type: 'alert' },
    { text: 'Suede Crossbody Bag — Stock: 8 ▼', type: 'alert' },
    { text: 'Nappa Leather Gloves — Stock: 67 ▲', type: 'ok' },
    { text: 'Threshold updated: Bomber Jacket → 30', type: 'info' },
    { text: 'Alert sent to 2 recipients', type: 'sent' },
    { text: 'Leather Moto Jacket — Stock: 3 ▼▼', type: 'alert' },
    { text: 'Weekly report generated', type: 'info' },
    { text: 'Suede A-Line Skirt — Stock: 15 ▼', type: 'alert' },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      const t = tickers[idx.current % tickers.length];
      idx.current++;
      setItems(prev => [...prev.slice(-4), { ...t, id: Date.now() }]);
    }, 2200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const colors = { alert: '#ff4d4d', ok: '#10b981', info: '#c9a84c', sent: '#3b82f6' };
  return (
    <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
      {items.map(it => (
        <div key={it.id} style={{ padding: '8px 14px', background: 'rgba(7,7,14,0.92)', border: `1px solid ${colors[it.type]}30`, borderRadius: 10, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: colors[it.type], backdropFilter: 'blur(12px)', animation: 'hp-ticker-in .4s ease', whiteSpace: 'nowrap', opacity: 0.85 }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: colors[it.type], marginRight: 8 }} />
          {it.text}
        </div>
      ))}
    </div>
  );
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div style={{ position: 'fixed', top: 0, left: 0, width: `${pct}%`, height: 2, background: 'linear-gradient(90deg, #c9a84c, #e8c96a)', zIndex: 100, transition: 'width .1s linear' }} />;
}

function InteractiveCard({ children, delay = 0 }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: 'transform .2s ease', transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = '#07070e';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div className="hp-root">
      <style>{`
        .hp-root{--gold:#c9a84c;--gold2:#e8c96a;--bg:#07070e;--surf:rgba(13,13,26,0.9);--stroke:rgba(255,255,255,0.06);--txt:#f0f0f8;--muted:rgba(200,200,220,0.85);--red:#ff4d4d;--green:#10b981;--blue:#3b82f6;font-family:'Inter',sans-serif;color:var(--txt);position:relative;overflow:hidden;background:#07070e;}
        .hp-section{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;position:relative;z-index:1;}
        .hp-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
        .hp-visible{opacity:1;transform:translateY(0);}
        .hp-brand{font-family:'Space Grotesk',sans-serif;font-size:clamp(52px,9vw,88px);font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-sub{font-size:clamp(13px,1.4vw,17px);color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-top:12px;}
        .hp-line{width:160px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:16px auto;}
        .hp-scroll-hint{margin-top:48px;display:flex;flex-direction:column;align-items:center;gap:8px;animation:hp-bob 2s ease-in-out infinite;}
        .hp-scroll-hint span{font-size:10px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase;}
        @keyframes hp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .hp-stitle{font-family:'Space Grotesk',sans-serif;font-size:clamp(22px,3vw,30px);font-weight:700;letter-spacing:-.02em;text-align:center;margin-bottom:28px;}
        .hp-stitle em{font-style:normal;color:var(--gold);}
        .hp-sdesc{font-size:14px;color:var(--muted);text-align:center;max-width:520px;margin:-12px auto 32px;line-height:1.6;}
        .hp-win{width:min(740px,94vw);background:var(--surf);border:1px solid var(--stroke);border-radius:14px;overflow:hidden;backdrop-filter:blur(12px);}
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
        .hp-pnode{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 24px;background:var(--surf);border:1px solid var(--stroke);border-radius:14px;min-width:120px;transition:all .4s;cursor:default;}
        .hp-pnode:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(201,168,76,.12);}
        .hp-pnode.hp-lit{border-color:rgba(201,168,76,.45);box-shadow:0 0 24px rgba(201,168,76,.1);}
        .hp-picon{font-size:24px;}.hp-plbl{font-size:11px;font-weight:600;color:var(--txt);font-family:'Space Grotesk',sans-serif;}
        .hp-psub{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
        .hp-parr{width:36px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.12);transition:color .4s;}
        .hp-parr.hp-lit{color:var(--gold);}
        .hp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
        .hp-stat{background:rgba(5,8,14,.5);border:1px solid var(--stroke);border-radius:10px;padding:12px;text-align:center;opacity:0;transform:translateY(12px);transition:all .4s ease;cursor:default;}
        .hp-stat:hover{border-color:rgba(201,168,76,.25);transform:translateY(-2px) scale(1.03);}
        .hp-visible .hp-stat{opacity:1;transform:translateY(0);}
        .hp-sval{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin-bottom:2px;}
        .hp-slbl{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;}
        .hp-arow{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;align-items:center;padding:8px 11px;background:rgba(5,8,14,.35);border:1px solid var(--stroke);border-radius:9px;margin-bottom:5px;opacity:0;transform:translateX(-12px);transition:all .3s ease;cursor:default;}
        .hp-arow:hover{border-color:rgba(201,168,76,.2);background:rgba(201,168,76,.03);}
        .hp-visible .hp-arow{opacity:1;transform:translateX(0);}
        .hp-arow div{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-arow div:first-child{color:var(--txt);font-weight:600;font-family:'Inter',sans-serif;font-size:11px;}
        .hp-badge{display:inline-flex;padding:2px 8px;border-radius:5px;font-size:8px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
        .hp-bcrit{background:rgba(255,77,77,.1);color:#ff4d4d;border:1px solid rgba(255,77,77,.2);}
        .hp-bhigh{background:rgba(251,146,60,.1);color:#fb923c;border:1px solid rgba(251,146,60,.2);}
        .hp-bok{background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2);}
        .hp-email-item{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;margin-bottom:4px;background:rgba(255,77,77,.04);border:1px solid rgba(255,77,77,.12);border-radius:7px;opacity:0;transform:translateX(-8px);transition:all .3s ease;cursor:default;}
        .hp-email-item:hover{background:rgba(255,77,77,.08);border-color:rgba(255,77,77,.25);}
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
        .hp-trow{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1.2fr;align-items:center;padding:8px 11px;background:rgba(5,8,14,.35);border:1px solid var(--stroke);border-radius:9px;margin-bottom:5px;opacity:0;transform:translateX(-12px);transition:all .3s ease;cursor:default;}
        .hp-trow:hover{border-color:rgba(201,168,76,.2);background:rgba(201,168,76,.03);}
        .hp-visible .hp-trow{opacity:1;transform:translateX(0);}
        .hp-trow div{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-trow div:first-child{color:var(--txt);font-weight:600;font-family:'Inter',sans-serif;font-size:11px;}
        .hp-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:min(860px,94vw);}
        .hp-fcard{background:var(--surf);border:1px solid var(--stroke);border-radius:14px;padding:28px 24px;text-align:center;transition:all .3s;cursor:default;}
        .hp-fcard:hover{border-color:rgba(201,168,76,.3);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.3);}
        .hp-fcard-icon{font-size:32px;margin-bottom:12px;display:block;}
        .hp-fcard-title{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:var(--txt);margin-bottom:6px;}
        .hp-fcard-desc{font-size:12px;color:var(--muted);line-height:1.5;}
        .hp-num-strip{display:flex;gap:28px;justify-content:center;padding:40px 0;flex-wrap:wrap;}
        .hp-num-item{text-align:center;min-width:110px;}
        .hp-num-val{font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:800;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-num-lbl{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:4px;}
        .hp-divider{width:min(600px,80vw);height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent);margin:0 auto;}
        @keyframes hp-ticker-in{from{opacity:0;transform:translateX(20px)}to{opacity:.85;transform:translateX(0)}}
        .hp-bar-track{height:6px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden;margin-top:4px;}
        .hp-bar-fill{height:100%;border-radius:3px;transition:width 1s ease;}
        @media(max-width:768px){.hp-pipeline{flex-direction:column;}.hp-parr{transform:rotate(90deg);}.hp-stats{grid-template-columns:repeat(2,1fr);}.hp-feature-grid{grid-template-columns:1fr;}}
      `}</style>

      <FloatingParticles />
      <MouseGlow />
      <ScrollProgress />
      <LiveTicker />

      {/* HERO */}
      <Section>
        <div className="hp-brand">DANIER</div>
        <div className="hp-line" />
        <div className="hp-sub">Inventory Intelligence</div>
        <div className="hp-scroll-hint">
          <span>Scroll to explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </Section>

      {/* NUMBERS STRIP */}
      <Section>
        <div className="hp-num-strip">
          {[
            { val: 81, label: 'Key Items Tracked' },
            { val: 247, label: 'Active Alerts' },
            { val: 3, label: 'Email Recipients' },
            { val: 99, suffix: '%', label: 'Uptime' },
          ].map((n, i) => (
            <InteractiveCard key={i} delay={i * 100}>
              <div className="hp-num-item">
                <div className="hp-num-val"><CountUp to={n.val} />{n.suffix || ''}</div>
                <div className="hp-num-lbl">{n.label}</div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </Section>

      <div className="hp-divider" />

      {/* EXCEL */}
      <Section>
        <div className="hp-stitle">Your Excel becomes a <em>living database</em></div>
        <div className="hp-sdesc">Upload any inventory report and watch it transform into structured, searchable, alertable data — instantly.</div>
        <InteractiveCard>
          <div className="hp-win">
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventory_20260220.xlsx</span></div>
            <div className="hp-hdr"><div>Item Description</div><div>Season</div><div>Size</div><div>Color</div><div>Stock</div></div>
            {ROWS.map((r, i) => (
              <div key={i} className="hp-row" style={{ transitionDelay: `${i * 80}ms` }}>
                <div>{r.item}</div><div className="hp-ki">{r.season}</div><div>{r.size}</div><div>{r.color}</div>
                <div className={r.low ? 'hp-low' : 'hp-ok'}>{r.stock}</div>
              </div>
            ))}
          </div>
        </InteractiveCard>
      </Section>

      {/* PIPELINE */}
      <Section>
        <div className="hp-stitle">The system <em>processes</em> everything</div>
        <div className="hp-sdesc">From raw spreadsheet to real-time alerts in seconds — fully automated.</div>
        <PipelineAnim />
      </Section>

      <div className="hp-divider" />

      {/* FEATURES */}
      <Section>
        <div className="hp-stitle">Built for <em>luxury operations</em></div>
        <div className="hp-feature-grid">
          {[
            { icon: '📊', title: 'Real-Time Dashboard', desc: 'Live stock levels, alert counts, and priority breakdowns — always up to date.' },
            { icon: '⚡', title: 'Instant Detection', desc: 'Automatic low stock detection the moment you upload. No manual checking.' },
            { icon: '📧', title: 'Smart Alerts', desc: 'Email alerts with priority badges sent to your team automatically.' },
            { icon: '🎯', title: 'Custom Thresholds', desc: 'Set per-item, per-size, per-color thresholds. Full granular control.' },
            { icon: '🔐', title: 'Secure Access', desc: 'Password-protected portal with session management and audit trails.' },
            { icon: '📱', title: 'Responsive Design', desc: 'Works beautifully on desktop, tablet, and mobile — anywhere you are.' },
          ].map((f, i) => (
            <InteractiveCard key={i} delay={i * 80}>
              <div className="hp-fcard">
                <span className="hp-fcard-icon">{f.icon}</span>
                <div className="hp-fcard-title">{f.title}</div>
                <div className="hp-fcard-desc">{f.desc}</div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </Section>

      <div className="hp-divider" />

      {/* THRESHOLD */}
      <Section>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Threshold Manager</div>
        <div className="hp-stitle">Set the <em>rules</em>, we enforce them</div>
        <div className="hp-sdesc">Configure stock thresholds per item, size, and color. When inventory drops below your limit — alerts fire instantly.</div>
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(860px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventoryreport.ca/thresholds</span></div>
            <div style={{ padding: 16 }}>
              <div className="hp-stats">
                <div className="hp-stat" style={{ transitionDelay: '0ms' }}><div className="hp-sval" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp to={5} /></div><div className="hp-slbl">Custom Thresholds</div></div>
                <div className="hp-stat" style={{ transitionDelay: '120ms' }}><div className="hp-sval" style={{ color: '#ff4d4d' }}><CountUp to={3} /></div><div className="hp-slbl">Breached</div></div>
                <div className="hp-stat" style={{ transitionDelay: '240ms' }}><div className="hp-sval" style={{ color: '#fb923c' }}><CountUp to={1} /></div><div className="hp-slbl">Warning</div></div>
                <div className="hp-stat" style={{ transitionDelay: '360ms' }}><div className="hp-sval" style={{ color: '#10b981' }}><CountUp to={1} /></div><div className="hp-slbl">Healthy</div></div>
              </div>
              {THRESHOLDS.map((t, i) => (
                <div key={i} className="hp-trow" style={{ transitionDelay: `${500 + i * 100}ms` }}>
                  <div>{t.item}</div>
                  <div>{t.size}</div>
                  <div>{t.color}</div>
                  <div style={{ color: '#c9a84c', fontWeight: 600 }}>{t.threshold}</div>
                  <div style={{ color: t.stock < t.threshold ? '#ff4d4d' : '#10b981', fontWeight: 600 }}>{t.stock}</div>
                  <div><span className={`hp-badge ${t.status === 'CRITICAL' ? 'hp-bcrit' : t.status === 'HEALTHY' ? 'hp-bok' : 'hp-bhigh'}`}>● {t.status}</span></div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                {THRESHOLDS.filter(t => t.status !== 'HEALTHY').map((t, i) => (
                  <div key={i} style={{ padding: '6px 10px', background: 'rgba(5,8,14,.5)', border: '1px solid var(--stroke)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: 'var(--txt)', fontWeight: 600 }}>{t.item}</span>
                      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: t.stock < t.threshold * 0.3 ? '#ff4d4d' : '#fb923c' }}>{t.stock}/{t.threshold}</span>
                    </div>
                    <div className="hp-bar-track">
                      <div className="hp-bar-fill" style={{ width: `${Math.min((t.stock / t.threshold) * 100, 100)}%`, background: t.stock < t.threshold * 0.3 ? '#ff4d4d' : '#fb923c' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InteractiveCard>
      </Section>

      <div className="hp-divider" />

      {/* DASHBOARD */}
      <Section>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Live Dashboard</div>
        <div className="hp-stitle">Everything at a <em>glance</em></div>
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(860px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventoryreport.ca/dashboard</span></div>
            <div style={{ padding: 16 }}>
              <div className="hp-stats">
                <div className="hp-stat" style={{ transitionDelay: '0ms' }}><div className="hp-sval" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp to={81} /></div><div className="hp-slbl">Key Items</div></div>
                <div className="hp-stat" style={{ transitionDelay: '120ms' }}><div className="hp-sval" style={{ color: '#ff4d4d' }}><CountUp to={247} /></div><div className="hp-slbl">Active Alerts</div></div>
                <div className="hp-stat" style={{ transitionDelay: '240ms' }}><div className="hp-sval" style={{ color: '#3b82f6' }}><CountUp to={38} /></div><div className="hp-slbl">Critical</div></div>
                <div className="hp-stat" style={{ transitionDelay: '360ms' }}><div className="hp-sval" style={{ color: '#10b981' }}><CountUp to={43} /></div><div className="hp-slbl">Healthy Stock</div></div>
              </div>
              {ALERTS.map((a, i) => (
                <div key={i} className="hp-arow" style={{ transitionDelay: `${500 + i * 100}ms` }}>
                  <div>{a.name}</div><div>{a.color}</div><div>{a.size}</div>
                  <div style={{ color: a.badge === 'CRITICAL' ? '#ff4d4d' : '#fb923c', fontWeight: 600 }}>{a.stock}</div>
                  <div>{a.req}</div>
                  <div><span className={`hp-badge ${a.badge === 'CRITICAL' ? 'hp-bcrit' : 'hp-bhigh'}`}>● {a.badge}</span></div>
                </div>
              ))}
            </div>
          </div>
        </InteractiveCard>
      </Section>

      {/* EMAIL */}
      <Section>
        <div className="hp-stitle">Alerts <em>delivered</em> to your team</div>
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(600px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>Gmail — Danier Stock Alerts</span></div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>From: <b style={{ color: 'var(--gold)' }}>Danier Stock Alerts</b></div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>To: team@danier.com, manager@danier.com</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--stroke)' }}>🔴 Low Stock Alert — 5 Critical Items</div>
              {EMAILS.map((e, i) => (
                <div key={i} className="hp-email-item" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div><span className="hp-ename">{e.name}</span><br/><span className="hp-edetail">{e.detail}</span></div>
                  <div className="hp-eshort">{e.shortage} units</div>
                </div>
              ))}
            </div>
          </div>
        </InteractiveCard>
        <div className="hp-sent"><div className="hp-check">✓</div><span>Delivered to 2 recipients</span></div>
      </Section>

      <div className="hp-divider" />

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
    { icon: '📧', label: 'Email', sub: 'delivered' },
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
