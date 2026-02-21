import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertTriangle, Save, RotateCcw, Clock, ChevronDown, Pencil, Trash2, Sparkles, RefreshCw, Settings2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useData } from '../DataContext';

const ThresholdManager = () => {
  const { thresholds: ctxThresh, threshLoading, allOptions: ctxOpts, fetchThresholds } = useData();

  const [items, setItems] = useState([]);
  const [, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState('');

  const [itemName, setItemName] = useState('');
  const [availableItemNames, setAvailableItemNames] = useState([]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [threshold, setThreshold] = useState('');

  const [history, setHistory] = useState([]);
  const [recalcAlerts, setRecalcAlerts] = useState(null);
  const [saving, setSaving] = useState(false);

  const allOptionsRef = useRef({});
  const [optionsReady, setOptionsReady] = useState(false);
  const [options, setOptions] = useState({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });

  useEffect(() => {
    if (!ctxThresh) { setLoading(threshLoading); return; }
    const data = ctxThresh.allThresholds;
    let list = [];
    if (Array.isArray(data?.custom_thresholds)) {
      list = data.custom_thresholds;
    } else if (data?.raw_thresholds && typeof data.raw_thresholds === 'object') {
      list = Object.entries(data.raw_thresholds).map(([key, threshold]) => {
        const [item_name, size, color] = key.split('|');
        return { key, item_name, size, color, threshold };
      });
    }
    setItems(list);
    setOverrides(ctxThresh.overrides || []);
    setLoading(false);
  }, [ctxThresh, threshLoading]);

  useEffect(() => {
    if (!ctxOpts) return;
    allOptionsRef.current = ctxOpts.items || {};
    const names = Object.keys(ctxOpts.items || {}).sort();
    setAvailableItemNames(names);
    setOptionsReady(true);
  }, [ctxOpts]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await fetchThresholds(false);
  }, [fetchThresholds]);

  useEffect(() => {
    const name = itemName.trim();
    if (!name) {
      setOptions({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });
      return;
    }
    const cached = allOptionsRef.current[name];
    if (cached) {
      setOptions(cached);
    } else {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/key-items/options/${encodeURIComponent(name)}`, { mode: 'cors', cache: 'no-store' });
          const data = await res.json();
          const opts = {
            colors: data.colors || [], sizes: data.sizes || [],
            color_to_sizes: data.color_to_sizes || {}, size_to_colors: data.size_to_colors || {},
          };
          setOptions(opts);
          allOptionsRef.current[name] = opts;
        } catch {
          setOptions({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });
        }
      })();
    }
    loadHistory(name);
    setRecalcAlerts(null);
  }, [itemName]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveThreshold = async (iName, sz, col, thresh) => {
    setSaving(true);
    setRecalcAlerts(null);
    try {
      const form = new FormData();
      form.append('item_name', iName);
      form.append('size', sz);
      form.append('color', col);
      form.append('threshold', String(thresh));
      const response = await fetch(`${API_BASE_URL}/thresholds/set`, { method: 'POST', body: form, mode: 'cors', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to save');
      const result = await response.json();
      if (result.recalculated_alerts) {
        setRecalcAlerts({
          alerts: result.recalculated_alerts,
          low: result.new_low_stock_count,
          item: iName,
        });
      }
      window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
      await loadAll();
      await loadHistory(iName);
    } finally {
      setSaving(false);
    }
  };

  const resetThreshold = async (iName, sz, col) => {
    const response = await fetch(`${API_BASE_URL}/thresholds/reset/${encodeURIComponent(iName)}/${encodeURIComponent(sz)}/${encodeURIComponent(col)}`, {
      method: 'DELETE', mode: 'cors', cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to reset');
    window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
    await loadAll();
    await loadHistory(iName);
  };

  const loadHistory = async (name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/thresholds/history?item_name=${encodeURIComponent(name)}&limit=50`, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) { setHistory([]); return; }
      const data = await res.json();
      setHistory(data.history || []);
    } catch { setHistory([]); }
  };

  const sizesForColor = color && options.color_to_sizes[color] ? options.color_to_sizes[color] : options.sizes;
  const colorsForSize = size && options.size_to_colors[size] ? options.size_to_colors[size] : options.colors;
  const canSave = itemName && size && color && threshold && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    const t = parseInt(threshold, 10);
    if (Number.isNaN(t) || t < 0) return;
    try { await saveThreshold(itemName.trim(), size, color, t); } catch {} // eslint-disable-line no-empty
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 60px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(201,168,76,0.28)' }}>
              <Settings2 style={{ width: 24, height: 24, color: '#000' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Threshold Manager</h1>
              <p style={{ color: '#b0b0c8', fontSize: '0.95rem', margin: '4px 0 0' }}>Configure stock alert thresholds for key items</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {optionsReady && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '6px 14px', borderRadius: 999, fontWeight: 700 }}>
                {availableItemNames.length} products loaded
              </span>
            )}
            <button
              onClick={loadAll}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: 48, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c', margin: '0 auto 16px' }} className="animate-spin" />
          <p style={{ color: '#c0c0d8', fontSize: '1rem' }}>Loading thresholds...</p>
        </div>
      )}
      {error && <div style={{ color: '#ff6b6b', fontSize: '0.95rem', padding: 16, background: 'rgba(255,61,61,0.1)', borderRadius: 14, border: '1px solid rgba(255,61,61,0.25)', marginBottom: 24 }}>{error}</div>}

      {/* Create / Update Form */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 16, height: 16, color: '#e8c96a' }} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Create or Update Threshold</h3>
        </div>

        {/* Product Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#e8c96a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Product Name</label>
          <select
            value={itemName}
            onChange={(e) => { setItemName(e.target.value); setSize(''); setColor(''); }}
            style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#ffffff', fontSize: '0.95rem', outline: 'none', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e8c96a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '14px' }}
          >
            <option value="" style={{ background: '#0d0d1a', color: '#999' }}>Select product...</option>
            {availableItemNames.map(n => <option key={n} value={n} style={{ background: '#0d0d1a', color: '#fff' }}>{n}</option>)}
          </select>
        </div>

        {/* Size / Color / Threshold Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#e8c96a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Size {sizesForColor.length > 0 && <span style={{ color: '#60a5fa' }}>({sizesForColor.length})</span>}
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={!itemName}
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#ffffff', fontSize: '0.95rem', outline: 'none', opacity: !itemName ? 0.4 : 1, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e8c96a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '14px' }}
            >
              <option value="" style={{ background: '#0d0d1a', color: '#999' }}>Select size</option>
              {sizesForColor.map((s) => <option key={s} value={s} style={{ background: '#0d0d1a', color: '#fff' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#e8c96a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Color {colorsForSize.length > 0 && <span style={{ color: '#60a5fa' }}>({colorsForSize.length})</span>}
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={!itemName}
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#ffffff', fontSize: '0.95rem', outline: 'none', opacity: !itemName ? 0.4 : 1, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e8c96a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '14px' }}
            >
              <option value="" style={{ background: '#0d0d1a', color: '#999' }}>Select color</option>
              {colorsForSize.map((c) => <option key={c} value={c} style={{ background: '#0d0d1a', color: '#fff' }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#e8c96a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Threshold</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 30"
              min="0"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* SAVE BUTTON - using div+onClick instead of disabled button */}
        <div
          onClick={handleSave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          style={{
            width: '100%',
            padding: '18px 24px',
            borderRadius: 14,
            fontSize: '1.1rem',
            fontWeight: 800,
            textAlign: 'center',
            cursor: canSave ? 'pointer' : 'not-allowed',
            background: canSave ? 'linear-gradient(135deg, #c9a84c, #e8c96a)' : 'rgba(201,168,76,0.3)',
            color: canSave ? '#000' : 'rgba(0,0,0,0.6)',
            boxShadow: canSave ? '0 8px 32px rgba(201,168,76,0.5)' : 'none',
            transition: 'all 0.3s',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            border: canSave ? '2px solid #e8c96a' : '2px solid rgba(201,168,76,0.3)',
            userSelect: 'none',
          }}
        >
          <Save style={{ width: 22, height: 22 }} />
          {saving ? 'SAVING...' : 'SAVE THRESHOLD'}
        </div>
        {!canSave && !saving && (
          <p style={{ textAlign: 'center', color: '#c9a84c', fontSize: '0.8rem', marginTop: 10, fontWeight: 500 }}>
            Fill in all fields above to save
          </p>
        )}
      </div>

      {/* Recalculated Alerts */}
      {recalcAlerts && (
        <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: '#f59e0b' }} />
            <h3 style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem', margin: 0 }}>
              Recalculated: {recalcAlerts.item}
              <span style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 400, color: '#b0b0c8' }}>
                ({recalcAlerts.low} low stock of {recalcAlerts.alerts.length} variants)
              </span>
            </h3>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                  {['Size', 'Color', 'Stock', 'Threshold', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Status' ? 'center' : 'left', fontSize: '0.75rem', fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recalcAlerts.alerts.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: a.is_low ? 'rgba(255,61,61,0.06)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', color: '#e8e8f4', fontSize: '0.9rem' }}>{a.size}</td>
                    <td style={{ padding: '10px 14px', color: '#e8e8f4', fontSize: '0.9rem' }}>{a.color}</td>
                    <td style={{ padding: '10px 14px', color: '#e8e8f4', fontSize: '0.9rem', fontFamily: 'monospace' }}>{a.stock}</td>
                    <td style={{ padding: '10px 14px', color: '#e8e8f4', fontSize: '0.9rem', fontFamily: 'monospace' }}>{a.threshold}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {a.is_low
                        ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,61,61,0.15)', color: '#ff4d4d', border: '1px solid rgba(255,61,61,0.3)' }}>LOW STOCK</span>
                        : <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing Overrides */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronDown style={{ width: 16, height: 16, color: '#a78bfa' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Existing Overrides</h3>
            <span style={{ fontSize: '0.8rem', color: '#b0b0c8', background: 'rgba(255,255,255,0.06)', padding: '3px 12px', borderRadius: 999, fontWeight: 600 }}>{items.length}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#8888a8' }}>
            <Settings2 style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem' }}>No custom thresholds set yet</p>
          </div>
        ) : (
          <div>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 10, transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem', marginBottom: 4 }}>{it.item_name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#b0b0c8' }}>
                      {it.size} &bull; {it.color} &bull; <span style={{ color: '#e8c96a', fontWeight: 700 }}>Threshold: {it.threshold}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      defaultValue={it.threshold}
                      min="0"
                      style={{ width: 80, padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#ffffff', fontSize: '0.9rem', textAlign: 'center', outline: 'none' }}
                      onBlur={async (e) => {
                        const newVal = parseInt(e.target.value, 10);
                        if (!Number.isNaN(newVal) && newVal >= 0 && newVal !== it.threshold) {
                          try { await saveThreshold(it.item_name, it.size, it.color, newVal); } catch {} // eslint-disable-line no-empty
                        }
                      }}
                    />
                    <div
                      onClick={() => { setItemName(it.item_name); setSize(it.size); setColor(it.color); setThreshold(String(it.threshold)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ padding: '8px 14px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, color: '#60a5fa', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Pencil style={{ width: 13, height: 13 }} /> Edit
                    </div>
                    <div
                      onClick={() => resetThreshold(it.item_name, it.size, it.color)}
                      style={{ padding: '8px 14px', background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.25)', borderRadius: 10, color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} /> Reset
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20, padding: '28px 32px', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock style={{ width: 16, height: 16, color: '#34d399' }} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Recent Changes {itemName && <span style={{ fontWeight: 400, color: '#b0b0c8' }}> for {itemName}</span>}
          </h3>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#8888a8' }}>
            <RotateCcw style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem' }}>No history yet</p>
          </div>
        ) : (
          <div>
            {history.map((h, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', marginBottom: 3 }}>
                  {h.item_name} &bull; {h.size} &bull; {h.color}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#b0b0c8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#ff6b6b', fontWeight: 600 }}>{h.old_threshold ?? 'default'}</span>
                  <span style={{ color: '#e8c96a' }}>&rarr;</span>
                  <span style={{ color: '#e8c96a', fontWeight: 700 }}>{h.new_threshold}</span>
                  <span style={{ marginLeft: 8, color: '#9090a8' }}>{h.changed_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThresholdManager;
