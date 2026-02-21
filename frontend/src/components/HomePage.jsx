import React, { useEffect, useRef, useCallback } from 'react';
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

const THRESHOLDS = [
  { item: 'Leather Bomber Jacket', size: 'M', color: 'Black', threshold: 30, stock: 12, status: 'CRITICAL' },
  { item: 'Suede Crossbody Bag', size: 'OS', color: 'Tan', threshold: 25, stock: 8, status: 'CRITICAL' },
  { item: 'Leather Moto Jacket', size: 'S', color: 'Cognac', threshold: 30, stock: 3, status: 'CRITICAL' },
  { item: 'Nappa Leather Gloves', size: 'M', color: 'Black', threshold: 20, stock: 67, status: 'HEALTHY' },
  { item: 'Suede A-Line Skirt', size: 'XS', color: 'Camel', threshold: 30, stock: 15, status: 'HIGH' },
];

const KEY_ITEMS = [
  { item: 'Leather Bomber Jacket', variants: 4, alerts: 2, totalStock: 109, status: 'WARNING' },
  { item: 'Suede Crossbody Bag', variants: 2, alerts: 1, totalStock: 18, status: 'CRITICAL' },
  { item: 'Leather Moto Jacket', variants: 3, alerts: 1, totalStock: 67, status: 'WARNING' },
  { item: 'Suede A-Line Skirt', variants: 2, alerts: 1, totalStock: 31, status: 'WARNING' },
  { item: 'Leather Weekender Bag', variants: 1, alerts: 1, totalStock: 6, status: 'CRITICAL' },
  { item: 'Nappa Leather Gloves', variants: 3, alerts: 0, totalStock: 142, status: 'HEALTHY' },
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
    }, { threshold: 0.1 });
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
      cx += (x - cx) * 0.06;
      cy += (y - cy) * 0.06;
      el.style.transform = `translate(${cx - 250}px, ${cy - 250}px)`;
      raf = requestAnimationFrame(loop);
    })();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }} />;
}

function FloatingParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = document.documentElement.scrollHeight;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.2 + 0.03,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.a})`; ctx.fill();
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

function InteractiveCard({ children }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.01)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (el) el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)';
  }, []);
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: 'transform .25s ease' }}>{children}</div>;
}

function TextBlock({ label, title, desc }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      {label && <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>{label}</div>}
      <div className="hp-stitle">{title}</div>
      <div className="hp-sdesc">{desc}</div>
    </div>
  );
}

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background = '#050508';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div className="hp-root">
      <style>{`
        .hp-root{--gold:#c9a84c;--gold2:#e8c96a;--bg:#050508;--surf:rgba(10,10,20,0.92);--stroke:rgba(255,255,255,0.05);--txt:#f0f0f8;--muted:rgba(200,200,220,0.8);--red:#ff4d4d;--green:#10b981;--blue:#3b82f6;font-family:'Inter',sans-serif;color:var(--txt);position:relative;overflow:hidden;background:#050508;}
        .hp-section{min-height:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 24px;position:relative;z-index:1;}
        .hp-hero-section{min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px;position:relative;z-index:1;}
        .hp-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
        .hp-visible{opacity:1;transform:translateY(0);}
        .hp-brand{font-family:'Space Grotesk',sans-serif;font-size:clamp(56px,10vw,96px);font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-sub{font-size:clamp(13px,1.4vw,17px);color:var(--muted);letter-spacing:.14em;text-transform:uppercase;margin-top:14px;}
        .hp-line{width:180px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:18px auto;}
        .hp-scroll-hint{margin-top:56px;display:flex;flex-direction:column;align-items:center;gap:8px;animation:hp-bob 2.5s ease-in-out infinite;}
        .hp-scroll-hint span{font-size:10px;color:rgba(200,200,220,0.4);letter-spacing:.14em;text-transform:uppercase;}
        @keyframes hp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
        .hp-stitle{font-family:'Space Grotesk',sans-serif;font-size:clamp(24px,3.2vw,34px);font-weight:700;letter-spacing:-.02em;text-align:center;margin-bottom:12px;line-height:1.25;}
        .hp-stitle em{font-style:normal;color:var(--gold);}
        .hp-sdesc{font-size:15px;color:var(--muted);text-align:center;max-width:560px;margin:0 auto 36px;line-height:1.7;}
        .hp-win{width:min(780px,94vw);background:var(--surf);border:1px solid var(--stroke);border-radius:14px;overflow:hidden;backdrop-filter:blur(12px);}
        .hp-tbar{display:flex;align-items:center;padding:10px 14px;background:rgba(16,16,28,0.9);border-bottom:1px solid var(--stroke);gap:7px;}
        .hp-dot{width:9px;height:9px;border-radius:50%;}.hp-dr{background:#FF5F56;}.hp-dy{background:#FFBD2E;}.hp-dg{background:#27CA3F;}
        .hp-tbar span{flex:1;text-align:center;font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;}
        .hp-hdr{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr 1fr;background:rgba(16,185,129,.1);border-bottom:1px solid rgba(16,185,129,.12);}
        .hp-hdr div{padding:9px 12px;font-size:10px;font-weight:700;color:var(--green);font-family:'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;}
        .hp-row{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr 1fr;border-bottom:1px solid rgba(255,255,255,.025);opacity:0;transform:translateX(-16px);transition:all .35s ease;cursor:default;}
        .hp-row:hover{background:rgba(201,168,76,.02);}
        .hp-visible .hp-row{opacity:1;transform:translateX(0);}
        .hp-row div{padding:9px 12px;font-size:11.5px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-row div:first-child{color:var(--txt);font-weight:500;}
        .hp-ki{color:var(--gold)!important;font-weight:600!important;}
        .hp-low{color:var(--red)!important;font-weight:600!important;}
        .hp-ok{color:var(--green)!important;}
        .hp-pipeline{display:flex;align-items:center;gap:0;flex-wrap:wrap;justify-content:center;margin-top:16px;}
        .hp-pnode{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 24px;background:var(--surf);border:1px solid var(--stroke);border-radius:14px;min-width:110px;transition:all .4s;cursor:default;}
        .hp-pnode:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(201,168,76,.08);}
        .hp-pnode.hp-lit{border-color:rgba(201,168,76,.35);box-shadow:0 0 20px rgba(201,168,76,.08);}
        .hp-picon{font-size:22px;}.hp-plbl{font-size:11px;font-weight:600;color:var(--txt);font-family:'Space Grotesk',sans-serif;}
        .hp-psub{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
        .hp-parr{width:32px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.1);transition:color .4s;}
        .hp-parr.hp-lit{color:var(--gold);}
        .hp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
        .hp-stat{background:rgba(5,5,12,.6);border:1px solid var(--stroke);border-radius:10px;padding:12px;text-align:center;opacity:0;transform:translateY(12px);transition:all .4s ease;cursor:default;}
        .hp-stat:hover{border-color:rgba(201,168,76,.2);transform:translateY(-2px);}
        .hp-visible .hp-stat{opacity:1;transform:translateY(0);}
        .hp-sval{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:800;margin-bottom:2px;}
        .hp-slbl{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;}
        .hp-drow{display:grid;align-items:center;padding:8px 11px;background:rgba(5,5,12,.4);border:1px solid var(--stroke);border-radius:9px;margin-bottom:5px;opacity:0;transform:translateX(-12px);transition:all .3s ease;cursor:default;}
        .hp-drow:hover{border-color:rgba(201,168,76,.15);background:rgba(201,168,76,.02);}
        .hp-visible .hp-drow{opacity:1;transform:translateX(0);}
        .hp-drow div{font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--muted);}
        .hp-drow div:first-child{color:var(--txt);font-weight:600;font-family:'Inter',sans-serif;font-size:11px;}
        .hp-badge{display:inline-flex;padding:2px 8px;border-radius:5px;font-size:8px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
        .hp-bcrit{background:rgba(255,77,77,.08);color:#ff4d4d;border:1px solid rgba(255,77,77,.18);}
        .hp-bhigh{background:rgba(251,146,60,.08);color:#fb923c;border:1px solid rgba(251,146,60,.18);}
        .hp-bok{background:rgba(16,185,129,.08);color:#10b981;border:1px solid rgba(16,185,129,.18);}
        .hp-bwarn{background:rgba(234,179,8,.08);color:#eab308;border:1px solid rgba(234,179,8,.18);}
        .hp-email-item{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;margin-bottom:4px;background:rgba(255,77,77,.03);border:1px solid rgba(255,77,77,.1);border-radius:7px;opacity:0;transform:translateX(-8px);transition:all .3s ease;cursor:default;}
        .hp-email-item:hover{background:rgba(255,77,77,.06);border-color:rgba(255,77,77,.2);}
        .hp-visible .hp-email-item{opacity:1;transform:translateX(0);}
        .hp-ename{font-size:11px;font-weight:600;color:var(--txt);}
        .hp-edetail{font-size:9px;color:var(--muted);font-family:'JetBrains Mono',monospace;}
        .hp-eshort{font-size:11px;font-weight:700;color:var(--red);}
        .hp-sent{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--green);margin-top:16px;opacity:0;transition:opacity .5s;}.hp-visible .hp-sent{opacity:1;}
        .hp-check{width:24px;height:24px;border-radius:50%;background:rgba(16,185,129,.1);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:12px;}
        .hp-bar-track{height:5px;background:rgba(255,255,255,.03);border-radius:3px;overflow:hidden;margin-top:4px;}
        .hp-bar-fill{height:100%;border-radius:3px;transition:width 1.2s ease;}
        .hp-feat-section{max-width:860px;margin:0 auto;padding:20px 24px 0;}
        .hp-feat-header{text-align:center;margin-bottom:56px;}
        .hp-feat-header h2{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,4vw,40px);font-weight:800;letter-spacing:-.03em;margin-bottom:14px;}
        .hp-feat-header h2 em{font-style:normal;color:var(--gold);}
        .hp-feat-header p{font-size:15px;color:var(--muted);max-width:480px;margin:0 auto;line-height:1.7;}
        .hp-feat-timeline{position:relative;padding-left:0;}
        .hp-feat-timeline::before{content:'';position:absolute;left:47px;top:28px;bottom:28px;width:1px;background:linear-gradient(180deg,var(--gold),rgba(201,168,76,.1));z-index:0;}
        .hp-feat-item{display:flex;gap:32px;margin-bottom:8px;position:relative;z-index:1;}
        .hp-feat-left{flex-shrink:0;width:96px;display:flex;flex-direction:column;align-items:center;padding-top:24px;}
        .hp-feat-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--gold);background:#050508;position:relative;z-index:2;}
        .hp-feat-dot-inner{position:absolute;top:3px;left:3px;width:4px;height:4px;border-radius:50%;background:var(--gold);}
        .hp-feat-step{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.08em;margin-top:8px;text-transform:uppercase;}
        .hp-feat-card{flex:1;padding:24px 28px;background:var(--surf);border:1px solid var(--stroke);border-radius:14px;transition:all .4s;cursor:default;}
        .hp-feat-card:hover{border-color:rgba(201,168,76,.2);transform:translateX(4px);box-shadow:0 8px 32px rgba(0,0,0,.3);}
        .hp-feat-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .hp-feat-card h4{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:var(--txt);margin:0;}
        .hp-feat-card-num{font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:800;line-height:1;background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.05));-webkit-background-clip:text;-webkit-text-fill-color:transparent;user-select:none;}
        .hp-feat-card p{font-size:14px;color:var(--muted);line-height:1.75;margin:0;}
        .hp-feat-tags{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap;}
        .hp-feat-tag{font-size:10px;padding:3px 10px;border-radius:6px;font-weight:600;letter-spacing:.03em;border:1px solid;background:transparent;}
        @media(max-width:768px){.hp-feat-timeline::before{left:23px;}.hp-feat-left{width:48px;}.hp-feat-item{gap:16px;}.hp-feat-card-num{display:none;}}
        .hp-cta-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(34px,5.5vw,52px);font-weight:800;letter-spacing:-.04em;text-align:center;margin-bottom:14px;}
        .hp-cta-title em{font-style:normal;background:linear-gradient(135deg,var(--gold),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .hp-cta-sub{font-size:15px;color:var(--muted);text-align:center;margin-bottom:32px;line-height:1.7;}
        .hp-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#050508;font-weight:700;font-size:15px;border:none;cursor:pointer;text-decoration:none;transition:all .3s;font-family:'Space Grotesk',sans-serif;}
        .hp-btn:hover{box-shadow:0 0 36px rgba(201,168,76,.4);transform:translateY(-2px);}
        .hp-btn2{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;border-radius:999px;border:1px solid var(--stroke);background:transparent;color:var(--muted);font-size:13px;cursor:pointer;text-decoration:none;transition:all .3s;}
        .hp-btn2:hover{border-color:var(--gold);color:var(--gold);}
        .hp-divider{width:min(500px,70vw);height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.12),transparent);margin:0 auto;}
        @media(max-width:768px){.hp-pipeline{flex-direction:column;}.hp-parr{transform:rotate(90deg);}.hp-stats{grid-template-columns:repeat(2,1fr);}.hp-text-grid{grid-template-columns:1fr;}}
      `}</style>

      <FloatingParticles />
      <MouseGlow />

      {/* HERO — full screen */}
      <section className="hp-hero-section">
        <div className="hp-brand" style={{ opacity: 0, animation: 'hp-fade-in 1s ease forwards .3s' }}>DANIER</div>
        <div className="hp-line" style={{ opacity: 0, animation: 'hp-fade-in .8s ease forwards .8s' }} />
        <div className="hp-sub" style={{ opacity: 0, animation: 'hp-fade-in .8s ease forwards 1.1s' }}>Inventory Intelligence</div>
        <div className="hp-scroll-hint" style={{ opacity: 0, animation: 'hp-fade-in .8s ease forwards 1.6s' }}>
          <span>Scroll to explore</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
        <style>{`@keyframes hp-fade-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </section>

      {/* WHAT IT DOES */}
      <Section>
        <div className="hp-feat-section">
          <div className="hp-feat-header">
            <h2>What <em>Danier Intelligence</em> automates</h2>
            <p>From a raw Excel file to prioritized stock alerts delivered to your inbox — every step handled, nothing manual.</p>
          </div>

          <div className="hp-feat-timeline">
            {[
              { num: '01', step: 'Upload', title: 'Excel Processing', desc: 'Drop any inventory spreadsheet into the system. It parses every row instantly — identifies Key Items by their KI00 season code, extracts all product variants, sizes, and colors, and structures everything into a searchable database.', tags: [{ label: '.xlsx', color: '#10b981' }, { label: 'Auto-Parse', color: '#3b82f6' }, { label: 'KI00 Detection', color: '#c9a84c' }] },
              { num: '02', step: 'Detect', title: 'Low Stock Detection', desc: 'Every item is checked against its configured threshold the moment data is ingested. Items below minimum stock are flagged with priority badges — Critical, High, or Warning — ranked by severity. Zero manual review needed.', tags: [{ label: 'Critical', color: '#ff4d4d' }, { label: 'High', color: '#fb923c' }, { label: 'Warning', color: '#eab308' }] },
              { num: '03', step: 'Configure', title: 'Threshold Control', desc: 'Set unique minimum stock levels per item, per size, per color. A Black Medium Bomber can have a threshold of 30 while a Cognac Small has 15 — each independently configurable. Override defaults for any variant.', tags: [{ label: 'Per-Item', color: '#c9a84c' }, { label: 'Per-Size', color: '#8b5cf6' }, { label: 'Per-Color', color: '#3b82f6' }] },
              { num: '04', step: 'Alert', title: 'Email Notifications', desc: 'When low stock triggers, the system composes a detailed email — every item below threshold, current stock vs required, and exact shortage. Sent via Gmail SMTP to all configured recipients automatically.', tags: [{ label: 'Gmail SMTP', color: '#ff4d4d' }, { label: 'Auto-Send', color: '#10b981' }, { label: 'Multi-Recipient', color: '#3b82f6' }] },
              { num: '05', step: 'Monitor', title: 'Live Dashboard', desc: 'A real-time command center — every Key Item, every alert, every stock level. Filter by priority, sort by shortage severity, drill into any item\'s color and size breakdown. Updates the moment you upload.', tags: [{ label: 'Real-Time', color: '#10b981' }, { label: 'Filterable', color: '#c9a84c' }, { label: 'Key Items', color: '#8b5cf6' }] },
              { num: '06', step: 'Secure', title: 'Protected Access', desc: 'Password-protected login with session management. Only authorized team members can access the portal, upload reports, configure thresholds, or manage recipients. Enterprise-grade security by default.', tags: [{ label: 'Auth', color: '#3b82f6' }, { label: 'Sessions', color: '#10b981' }, { label: 'Role-Based', color: '#c9a84c' }] },
            ].map((f, i) => (
              <div key={i} className="hp-feat-item">
                <div className="hp-feat-left">
                  <div className="hp-feat-dot"><div className="hp-feat-dot-inner" /></div>
                  <div className="hp-feat-step">{f.step}</div>
                </div>
                <div className="hp-feat-card">
                  <div className="hp-feat-card-top">
                    <h4>{f.title}</h4>
                    <div className="hp-feat-card-num">{f.num}</div>
                  </div>
                  <p>{f.desc}</p>
                  <div className="hp-feat-tags">
                    {f.tags.map((t, j) => (
                      <span key={j} className="hp-feat-tag" style={{ color: t.color, borderColor: `${t.color}30` }}>{t.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="hp-divider" />

      {/* 1. EXCEL */}
      <Section>
        <TextBlock title={<>Your Excel becomes a <em>living database</em></>} desc="Upload any inventory report and watch it transform into structured, searchable, alertable data — every row parsed, every Key Item identified." />
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
        <TextBlock title={<>From upload to alert in <em>seconds</em></>} desc="The entire pipeline runs automatically — parse, structure, detect, alert, deliver." />
        <PipelineAnim />
      </Section>

      <div className="hp-divider" />

      {/* 2. DASHBOARD */}
      <Section>
        <TextBlock label="Live Dashboard" title={<>Every alert, <em>every item</em>, at a glance</>} desc="Real-time stock levels, priority badges, and alert counts — updated the moment you upload a new report." />
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
                <div key={i} className="hp-drow" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr', transitionDelay: `${500 + i * 100}ms` }}>
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

      <div className="hp-divider" />

      {/* 3. THRESHOLD */}
      <Section>
        <TextBlock label="Threshold Manager" title={<>Set the <em>rules</em>, the system enforces them</>} desc="Configure per-item, per-size, per-color stock thresholds. When inventory drops below your limit — alerts fire instantly." />
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(860px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventoryreport.ca/thresholds</span></div>
            <div style={{ padding: 16 }}>
              <div className="hp-stats">
                <div className="hp-stat" style={{ transitionDelay: '0ms' }}><div className="hp-sval" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp to={5} /></div><div className="hp-slbl">Thresholds Set</div></div>
                <div className="hp-stat" style={{ transitionDelay: '120ms' }}><div className="hp-sval" style={{ color: '#ff4d4d' }}><CountUp to={3} /></div><div className="hp-slbl">Breached</div></div>
                <div className="hp-stat" style={{ transitionDelay: '240ms' }}><div className="hp-sval" style={{ color: '#fb923c' }}><CountUp to={1} /></div><div className="hp-slbl">Warning</div></div>
                <div className="hp-stat" style={{ transitionDelay: '360ms' }}><div className="hp-sval" style={{ color: '#10b981' }}><CountUp to={1} /></div><div className="hp-slbl">Healthy</div></div>
              </div>
              {THRESHOLDS.map((t, i) => (
                <div key={i} className="hp-drow" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr', transitionDelay: `${500 + i * 100}ms` }}>
                  <div>{t.item}</div><div>{t.size}</div><div>{t.color}</div>
                  <div style={{ color: '#c9a84c', fontWeight: 600 }}>{t.threshold}</div>
                  <div style={{ color: t.stock < t.threshold ? '#ff4d4d' : '#10b981', fontWeight: 600 }}>{t.stock}</div>
                  <div><span className={`hp-badge ${t.status === 'CRITICAL' ? 'hp-bcrit' : t.status === 'HEALTHY' ? 'hp-bok' : 'hp-bhigh'}`}>● {t.status}</span></div>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {THRESHOLDS.filter(t => t.status !== 'HEALTHY').map((t, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(5,5,12,.5)', border: '1px solid var(--stroke)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: 'var(--txt)', fontWeight: 600 }}>{t.item}</span>
                      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: t.stock < t.threshold * 0.3 ? '#ff4d4d' : '#fb923c' }}>{t.stock}/{t.threshold}</span>
                    </div>
                    <div className="hp-bar-track"><div className="hp-bar-fill" style={{ width: `${Math.min((t.stock / t.threshold) * 100, 100)}%`, background: t.stock < t.threshold * 0.3 ? '#ff4d4d' : '#fb923c' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InteractiveCard>
      </Section>

      <div className="hp-divider" />

      {/* 4. KEY ITEMS */}
      <Section>
        <TextBlock label="Key Items" title={<>Track every <em>KI00</em> product</>} desc="All items with the Key Item season code are surfaced automatically — with variant counts, alert status, and total stock across all sizes and colors." />
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(860px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>inventoryreport.ca/key-items</span></div>
            <div style={{ padding: 16 }}>
              <div className="hp-stats">
                <div className="hp-stat" style={{ transitionDelay: '0ms' }}><div className="hp-sval" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><CountUp to={6} /></div><div className="hp-slbl">Key Items</div></div>
                <div className="hp-stat" style={{ transitionDelay: '120ms' }}><div className="hp-sval" style={{ color: '#ff4d4d' }}><CountUp to={6} /></div><div className="hp-slbl">With Alerts</div></div>
                <div className="hp-stat" style={{ transitionDelay: '240ms' }}><div className="hp-sval" style={{ color: '#3b82f6' }}><CountUp to={15} /></div><div className="hp-slbl">Variants</div></div>
                <div className="hp-stat" style={{ transitionDelay: '360ms' }}><div className="hp-sval" style={{ color: '#10b981' }}><CountUp to={373} /></div><div className="hp-slbl">Total Stock</div></div>
              </div>
              {KEY_ITEMS.map((k, i) => (
                <div key={i} className="hp-drow" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.2fr', transitionDelay: `${500 + i * 100}ms` }}>
                  <div>{k.item}</div>
                  <div>{k.variants} variants</div>
                  <div style={{ color: k.alerts > 0 ? '#ff4d4d' : '#10b981', fontWeight: 600 }}>{k.alerts} alerts</div>
                  <div>{k.totalStock} units</div>
                  <div><span className={`hp-badge ${k.status === 'CRITICAL' ? 'hp-bcrit' : k.status === 'HEALTHY' ? 'hp-bok' : 'hp-bwarn'}`}>● {k.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </InteractiveCard>
      </Section>

      <div className="hp-divider" />

      {/* 5. EMAIL */}
      <Section>
        <TextBlock title={<>Alerts <em>delivered</em> to your team</>} desc="Detailed low-stock emails with shortage breakdowns — sent automatically via Gmail SMTP to every configured recipient." />
        <InteractiveCard>
          <div className="hp-win" style={{ width: 'min(620px,94vw)' }}>
            <div className="hp-tbar"><div className="hp-dot hp-dr"/><div className="hp-dot hp-dy"/><div className="hp-dot hp-dg"/><span>Gmail — Danier Stock Alerts</span></div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>From: <b style={{ color: 'var(--gold)' }}>Danier Stock Alerts</b></div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>To: danieralertsystem@gmail.com, sarthaksethi2803@gmail.com</div>
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
        <div className="hp-cta-sub">Upload your inventory report. The system detects low stock,<br/>applies your thresholds, and alerts your team — automatically.</div>
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
        nodes.forEach((n, i) => setTimeout(() => n.classList.add('hp-lit'), i * 300));
        arrows.forEach((a, i) => setTimeout(() => a.classList.add('hp-lit'), i * 300 + 180));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = [
    { icon: '📄', label: 'Upload', sub: 'xlsx parsed' },
    { icon: '🗄️', label: 'Database', sub: 'structured' },
    { icon: '⚡', label: 'Engine', sub: 'thresholds' },
    { icon: '📊', label: 'Dashboard', sub: 'live view' },
    { icon: '📧', label: 'Email', sub: 'delivered' },
  ];

  return (
    <div ref={ref} className="hp-pipeline">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="hp-pnode"><div className="hp-picon">{s.icon}</div><div className="hp-plbl">{s.label}</div><div className="hp-psub">{s.sub}</div></div>
          {i < steps.length - 1 && (
            <div className="hp-parr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default HomePage;
