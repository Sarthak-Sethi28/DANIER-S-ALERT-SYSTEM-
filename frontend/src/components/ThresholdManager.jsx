import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const ThresholdManager = () => {
  const [items, setItems] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [itemName, setItemName] = useState('');
  const [availableItemNames, setAvailableItemNames] = useState([]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [threshold, setThreshold] = useState('');

  const [history, setHistory] = useState([]);
  const [recalcAlerts, setRecalcAlerts] = useState(null);
  const [saving, setSaving] = useState(false);

  // Preloaded options: { ITEM_NAME: { colors, sizes, color_to_sizes, size_to_colors } }
  const allOptionsRef = useRef({});
  const [optionsReady, setOptionsReady] = useState(false);

  // Current item's options (derived from preloaded data)
  const [options, setOptions] = useState({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });

  const preloadAllOptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/key-items/all-options`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      allOptionsRef.current = data.items || {};
      const names = Object.keys(data.items || {}).sort();
      setAvailableItemNames(names);
      setOptionsReady(true);
    } catch {
      try {
        const res = await fetch(`${API_BASE_URL}/key-items/summary`);
        const data = await res.json();
        const names = (data.key_items || []).map(k => k.name).filter(Boolean).sort();
        setAvailableItemNames(names);
      } catch {}
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/thresholds/all`);
      const data = await response.json();
      let list = [];
      if (Array.isArray(data.custom_thresholds)) {
        list = data.custom_thresholds;
      } else if (data.raw_thresholds && typeof data.raw_thresholds === 'object') {
        list = Object.entries(data.raw_thresholds).map(([key, threshold]) => {
          const [item_name, size, color] = key.split('|');
          return { key, item_name, size, color, threshold };
        });
      }
      setItems(list);
      try {
        const o = await fetch(`${API_BASE_URL}/thresholds/overrides`);
        if (o.ok) {
          const oj = await o.json();
          setOverrides(oj.overrides || []);
        }
      } catch {}
    } catch {
      setError('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    preloadAllOptions();
  }, [loadAll, preloadAllOptions]);

  // Instant: set options from preloaded data when item name changes
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
      // Fallback: fetch from server if not preloaded
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/key-items/options/${encodeURIComponent(name)}`);
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
  }, [itemName]);

  const saveThreshold = async (itemName, size, color, threshold) => {
    setSaving(true);
    setRecalcAlerts(null);
    try {
      const form = new FormData();
      form.append('item_name', itemName);
      form.append('size', size);
      form.append('color', color);
      form.append('threshold', String(threshold));
      const response = await fetch(`${API_BASE_URL}/thresholds/set`, { method: 'POST', body: form });
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
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to reset');
    window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
    await loadAll();
    await loadHistory(itemName);
  };

  const loadHistory = async (name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/thresholds/history?item_name=${encodeURIComponent(name)}&limit=50`);
      if (!res.ok) { setHistory([]); return; }
      const data = await res.json();
      setHistory(data.history || []);
    } catch { setHistory([]); }
  };

  const sizesForColor = color && options.color_to_sizes[color] ? options.color_to_sizes[color] : options.sizes;
  const colorsForSize = size && options.size_to_colors[size] ? options.size_to_colors[size] : options.colors;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Threshold Manager</h2>
        {optionsReady && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            {availableItemNames.length} products loaded
          </span>
        )}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Create / Update Form */}
      <div className="bg-white dark:bg-neutral-800 rounded border dark:border-neutral-700 p-4 mb-6">
        <h3 className="font-semibold mb-3">Create or Update Threshold</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          {/* Product name - select for instant pick */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Product Name</label>
            <select
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setSize(''); setColor(''); }}
              className="w-full border dark:border-neutral-600 rounded px-3 py-2 bg-white dark:bg-neutral-700"
            >
              <option value="">Select product...</option>
              {availableItemNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Size ({sizesForColor.length})</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border dark:border-neutral-600 rounded px-2 py-2 bg-white dark:bg-neutral-700"
              disabled={!itemName}
            >
              <option value="">Size</option>
              {sizesForColor.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color ({colorsForSize.length})</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border dark:border-neutral-600 rounded px-2 py-2 bg-white dark:bg-neutral-700"
              disabled={!itemName}
            >
              <option value="">Color</option>
              {colorsForSize.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Threshold</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. 5"
                className="flex-1 border dark:border-neutral-600 rounded px-2 py-2 bg-white dark:bg-neutral-700"
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={!itemName || !size || !color || !threshold || saving}
                onClick={async () => {
                  const t = parseInt(threshold, 10);
                  if (Number.isNaN(t) || t < 0) return;
                  try { await saveThreshold(itemName.trim(), size, color, t); } catch {}
                }}
              >{saving ? '...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Recalculated Alerts after threshold change */}
      {recalcAlerts && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Recalculated Alerts for {recalcAlerts.item}
            <span className="ml-2 text-sm font-normal">
              ({recalcAlerts.low} low stock out of {recalcAlerts.alerts.length} variants)
            </span>
          </h3>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-1">Size</th>
                  <th className="py-1">Color</th>
                  <th className="py-1">Stock</th>
                  <th className="py-1">Threshold</th>
                  <th className="py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {recalcAlerts.alerts.map((a, i) => (
                  <tr key={i} className={a.is_low ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <td className="py-1">{a.size}</td>
                    <td className="py-1">{a.color}</td>
                    <td className="py-1 font-mono">{a.stock}</td>
                    <td className="py-1 font-mono">{a.threshold}</td>
                    <td className="py-1">
                      {a.is_low
                        ? <span className="text-red-600 font-semibold">LOW STOCK</span>
                        : <span className="text-green-600">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing Overrides */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Existing Overrides</h3>
          <button onClick={loadAll} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Refresh</button>
        </div>
        {items.length === 0 ? (
          <div className="text-gray-600 text-sm">No custom thresholds set yet.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="border dark:border-neutral-700 rounded p-3 bg-white dark:bg-neutral-800">
                <div className="font-semibold">{it.item_name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{it.size} &bull; {it.color}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={it.threshold}
                    min="0"
                    className="w-24 border dark:border-neutral-600 rounded px-2 py-1 text-sm bg-white dark:bg-neutral-700"
                    onBlur={async (e) => {
                      const newVal = parseInt(e.target.value, 10);
                      if (!Number.isNaN(newVal) && newVal >= 0 && newVal !== it.threshold) {
                        try { await saveThreshold(it.item_name, it.size, it.color, newVal); } catch {}
                      }
                    }}
                  />
                  <button className="px-2 py-1 border rounded text-sm" onClick={() => { setItemName(it.item_name); setSize(it.size); setColor(it.color); }}>Edit</button>
                  <button className="px-2 py-1 border rounded text-sm text-red-600" onClick={() => resetThreshold(it.item_name, it.size, it.color)}>Reset</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="font-semibold mb-2">Recent Changes {itemName ? `(for ${itemName})` : ''}</h3>
        {history.length === 0 ? (
          <div className="text-gray-600 text-sm">No history yet.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {history.map((h, i) => (
              <li key={i} className="border dark:border-neutral-700 rounded p-2">
                <div className="font-medium">{h.item_name} &bull; {h.size} &bull; {h.color}</div>
                <div className="text-gray-700 dark:text-gray-400">{h.old_threshold ?? 'default'} &rarr; {h.new_threshold} at {h.changed_at}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ThresholdManager;
