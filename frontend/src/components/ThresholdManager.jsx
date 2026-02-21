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

  const saveThreshold = async (itemName, size, color, threshold) => {
    setSaving(true);
    setRecalcAlerts(null);
    try {
      const form = new FormData();
      form.append('item_name', itemName);
      form.append('size', size);
      form.append('color', color);
      form.append('threshold', String(threshold));
      const response = await fetch(`${API_BASE_URL}/thresholds/set`, { method: 'POST', body: form, mode: 'cors', cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to save');
      const result = await response.json();
      if (result.recalculated_alerts) {
        setRecalcAlerts({
          alerts: result.recalculated_alerts,
          low: result.new_low_stock_count,
          item: itemName,
        });
      }
      window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
      await loadAll();
      await loadHistory(itemName);
    } finally {
      setSaving(false);
    }
  };

  const resetThreshold = async (itemName, size, color) => {
    const response = await fetch(`${API_BASE_URL}/thresholds/reset/${encodeURIComponent(itemName)}/${encodeURIComponent(size)}/${encodeURIComponent(color)}`, {
      method: 'DELETE', mode: 'cors', cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to reset');
    window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
    await loadAll();
    await loadHistory(itemName);
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

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0f0f8',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c9a84c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '12px',
  };

  const inputStyle = {
    ...selectStyle,
    backgroundImage: 'none',
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-gold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)' }}>
              <Settings2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-gold leading-tight font-elegant">Threshold Manager</h1>
              <p style={{ color: 'rgba(200,200,220,0.75)', fontSize: '0.9rem', marginTop: 2 }}>
                Configure stock alert thresholds for key items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {optionsReady && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 12px', borderRadius: '999px', fontWeight: 600 }}>
                {availableItemNames.length} products loaded
              </span>
            )}
            <button
              onClick={loadAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card-premium p-12 text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }} />
          <p style={{ color: 'rgba(200,200,220,0.85)' }}>Loading thresholds...</p>
        </div>
      )}
      {error && <div style={{ color: '#ff6b6b', fontSize: '0.875rem', padding: '12px', background: 'rgba(255,61,61,0.08)', borderRadius: '12px', border: '1px solid rgba(255,61,61,0.2)' }}>{error}</div>}

      {/* Create / Update Form */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#c9a84c' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#f0f0f8' }}>Create or Update Threshold</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Product Name</label>
            <select
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setSize(''); setColor(''); }}
              style={selectStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="" style={{ background: '#0d0d1a', color: '#888' }}>Select product...</option>
              {availableItemNames.map(n => <option key={n} value={n} style={{ background: '#0d0d1a', color: '#f0f0f8' }}>{n}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Size {sizesForColor.length > 0 && <span style={{ color: '#3b82f6' }}>({sizesForColor.length})</span>}
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ ...selectStyle, opacity: !itemName ? 0.4 : 1 }}
                disabled={!itemName}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="" style={{ background: '#0d0d1a' }}>Select size</option>
                {sizesForColor.map((s) => <option key={s} value={s} style={{ background: '#0d0d1a', color: '#f0f0f8' }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Color {colorsForSize.length > 0 && <span style={{ color: '#3b82f6' }}>({colorsForSize.length})</span>}
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...selectStyle, opacity: !itemName ? 0.4 : 1 }}
                disabled={!itemName}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="" style={{ background: '#0d0d1a' }}>Select color</option>
                {colorsForSize.map((c) => <option key={c} value={c} style={{ background: '#0d0d1a', color: '#f0f0f8' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Threshold</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 30"
                min="0"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Save Button - always visible */}
          <button
            className="w-full flex items-center justify-center gap-3"
            style={{
              padding: '16px',
              borderRadius: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              border: 'none',
              marginTop: 8,
              cursor: (!itemName || !size || !color || !threshold || saving) ? 'not-allowed' : 'pointer',
              opacity: (!itemName || !size || !color || !threshold || saving) ? 0.55 : 1,
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#000',
              boxShadow: '0 6px 24px rgba(201,168,76,0.4)',
              transition: 'all 0.3s',
              letterSpacing: '0.02em',
            }}
            disabled={!itemName || !size || !color || !threshold || saving}
            onClick={async () => {
              const t = parseInt(threshold, 10);
              if (Number.isNaN(t) || t < 0) return;
              try { await saveThreshold(itemName.trim(), size, color, t); } catch {} // eslint-disable-line no-empty
            }}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'SAVE THRESHOLD'}
          </button>
        </div>
      </div>

      {/* Recalculated Alerts */}
      {recalcAlerts && (
        <div className="card-premium p-6" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <h3 style={{ fontWeight: 700, color: '#f0f0f8' }}>
              Recalculated: {recalcAlerts.item}
              <span style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: 400, color: 'rgba(200,200,220,0.75)' }}>
                ({recalcAlerts.low} low stock of {recalcAlerts.alerts.length} variants)
              </span>
            </h3>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            <table className="table-luxury" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Color</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Stock</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Threshold</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recalcAlerts.alerts.map((a, i) => (
                  <tr key={i} style={{ background: a.is_low ? 'rgba(255,61,61,0.05)' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', color: '#d0d0e8', fontSize: '0.85rem' }}>{a.size}</td>
                    <td style={{ padding: '8px 12px', color: '#d0d0e8', fontSize: '0.85rem' }}>{a.color}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#d0d0e8', fontSize: '0.85rem' }}>{a.stock}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#d0d0e8', fontSize: '0.85rem' }}>{a.threshold}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {a.is_low
                        ? <span className="badge-critical">LOW STOCK</span>
                        : <span className="badge-good">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing Overrides */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <ChevronDown className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#f0f0f8' }}>Existing Overrides</h3>
            <span style={{ fontSize: '0.75rem', color: 'rgba(200,200,220,0.7)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>{items.length}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(200,200,220,0.65)' }}>
            <Settings2 className="w-10 h-10 mx-auto mb-3" style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem' }}>No custom thresholds set yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  transition: 'all 0.2s',
                }}
                className="hover-lift"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div style={{ fontWeight: 700, color: '#f0f0f8', fontSize: '0.95rem', marginBottom: 2 }}>{it.item_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.75)' }}>
                      {it.size} &bull; {it.color} &bull; <span style={{ color: '#e8c96a', fontWeight: 700 }}>Threshold: {it.threshold}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={it.threshold}
                      min="0"
                      style={{ ...inputStyle, width: '80px', padding: '8px 10px', fontSize: '0.8rem', textAlign: 'center' }}
                      onBlur={async (e) => {
                        const newVal = parseInt(e.target.value, 10);
                        if (!Number.isNaN(newVal) && newVal >= 0 && newVal !== it.threshold) {
                          try { await saveThreshold(it.item_name, it.size, it.color, newVal); } catch {} // eslint-disable-line no-empty
                        }
                      }}
                    />
                    <button
                      onClick={() => { setItemName(it.item_name); setSize(it.size); setColor(it.color); setThreshold(String(it.threshold)); }}
                      style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => resetThreshold(it.item_name, it.size, it.color)}
                      style={{ padding: '8px 12px', background: 'rgba(255,61,61,0.08)', border: '1px solid rgba(255,61,61,0.2)', borderRadius: '10px', color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
                    >
                      <Trash2 className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Clock className="w-4 h-4" style={{ color: '#10b981' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#f0f0f8' }}>
            Recent Changes {itemName ? <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'rgba(200,200,220,0.75)' }}> for {itemName}</span> : ''}
          </h3>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(200,200,220,0.6)' }}>
            <RotateCcw className="w-8 h-8 mx-auto mb-2" style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '0.85rem' }}>No history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ fontWeight: 700, color: '#f0f0f8', fontSize: '0.9rem' }}>
                  {h.item_name} &bull; {h.size} &bull; {h.color}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(200,200,220,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#ff6b6b' }}>{h.old_threshold ?? 'default'}</span>
                  <span>&rarr;</span>
                  <span style={{ color: '#c9a84c', fontWeight: 600 }}>{h.new_threshold}</span>
                  <span style={{ marginLeft: 8 }}>{h.changed_at}</span>
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
