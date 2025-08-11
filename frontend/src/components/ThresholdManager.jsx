import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const ThresholdManager = () => {
  const [items, setItems] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [options, setOptions] = useState({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form state
  const [itemName, setItemName] = useState('');
  const [availableItemNames, setAvailableItemNames] = useState([]);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [threshold, setThreshold] = useState('');

  // History
  const [history, setHistory] = useState([]);

  const loadAll = async () => {
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
      // Try to fetch overrides directly (if backend deployed)
      try {
        const o = await fetch(`${API_BASE_URL}/thresholds/overrides`);
        if (o.ok) {
          const oj = await o.json();
          setOverrides(oj.overrides || []);
        }
      } catch {}
    } catch (e) {
      setError('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const loadItemNames = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/key-items/summary`);
      const data = await res.json();
      const names = (data.key_items || []).map(k => k.name).filter(Boolean).sort();
      setAvailableItemNames(names);
    } catch {}
  };

  const fetchOptions = async (name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/key-items/options/${encodeURIComponent(name)}`);
      const data = await res.json();
      setOptions({
        colors: data.colors || [],
        sizes: data.sizes || [],
        color_to_sizes: data.color_to_sizes || {},
        size_to_colors: data.size_to_colors || {}
      });
    } catch (e) {
      setOptions({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} });
    }
  };

  // Auto-load size/color options as user types a valid item name (debounced)
  useEffect(() => {
    const name = itemName.trim();
    if (!name) { setOptions({ colors: [], sizes: [], color_to_sizes: {}, size_to_colors: {} }); return; }
    const t = setTimeout(() => { fetchOptions(name); loadHistory(name); }, 300);
    return () => clearTimeout(t);
  }, [itemName]);

  const saveThreshold = async (itemName, size, color, threshold) => {
    const form = new FormData();
    form.append('item_name', itemName);
    form.append('size', size);
    form.append('color', color);
    form.append('threshold', String(threshold));
    const response = await fetch(`${API_BASE_URL}/thresholds/set`, { method: 'POST', body: form });
    if (!response.ok) throw new Error('Failed to save');
    window.dispatchEvent(new CustomEvent('thresholdsUpdated'));
    await loadAll();
    await loadHistory(itemName);
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

  // Derived filtered options for UX
  const sizesForColor = color && options.color_to_sizes[color] ? options.color_to_sizes[color] : options.sizes;
  const colorsForSize = size && options.size_to_colors[size] ? options.size_to_colors[size] : options.colors;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Threshold Manager</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Create / Update Form */}
      <div className="bg-white rounded border p-4 mb-6">
        <h3 className="font-semibold mb-3">Create or Update Threshold</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
          <div className="col-span-2 flex gap-2">
            <input
              type="text"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setSize(''); setColor(''); }}
              placeholder="Item name (e.g., RONAN)"
              className="flex-1 border rounded px-3 py-2"
              onFocus={loadItemNames}
              list="itemNames"
            />
            <datalist id="itemNames">
              {availableItemNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
          <select value={size} onChange={(e)=> setSize(e.target.value)} className="border rounded px-2 py-2">
            <option value="">Size</option>
            {sizesForColor.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select value={color} onChange={(e)=> setColor(e.target.value)} className="border rounded px-2 py-2">
            <option value="">Color</option>
            {colorsForSize.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input type="number" value={threshold} onChange={(e)=> setThreshold(e.target.value)} placeholder="Threshold" className="border rounded px-2 py-2" />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={async ()=>{
              const t = parseInt(threshold, 10);
              if (!itemName || !size || !color || Number.isNaN(t) || t < 0) return;
              try { await saveThreshold(itemName.trim(), size, color, t); } catch {}
            }}
          >Save</button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Options: colors {options.colors.length}, sizes {options.sizes.length}</div>
      </div>

      {/* Existing Overrides */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Existing Overrides</h3>
          <button onClick={loadAll} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
        {items.length === 0 ? (
          <div className="text-gray-600 text-sm">No custom thresholds set yet.</div>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="border rounded p-3">
                <div className="font-semibold">{it.item_name}</div>
                <div className="text-sm text-gray-600">{it.size} • {it.color}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={it.threshold}
                    min="0"
                    className="w-24 border rounded px-2 py-1 text-sm"
                    onBlur={async (e) => {
                      const newVal = parseInt(e.target.value, 10);
                      if (!Number.isNaN(newVal) && newVal >= 0 && newVal !== it.threshold) {
                        try { await saveThreshold(it.item_name, it.size, it.color, newVal); } catch {}
                      }
                    }}
                  />
                  <button className="px-2 py-1 border rounded" onClick={() => fetchOptions(it.item_name)}>Options</button>
                  <button className="px-2 py-1 border rounded" onClick={() => resetThreshold(it.item_name, it.size, it.color)}>Reset</button>
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
              <li key={i} className="border rounded p-2">
                <div className="font-medium">{h.item_name} • {h.size} • {h.color}</div>
                <div className="text-gray-700">{h.old_threshold ?? 'default'} → {h.new_threshold} at {h.changed_at}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ThresholdManager; 