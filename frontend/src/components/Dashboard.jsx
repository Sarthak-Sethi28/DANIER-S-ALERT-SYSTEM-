import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sendEmailAlert } from '../services/api';
import {
  ChevronDown, ChevronUp, AlertTriangle, Package, Mail, RefreshCw,
  Search as SearchIcon, Download, TrendingUp, Sparkles, BarChart3,
  X, CheckCircle, Filter, ChevronsUpDown, Clock, ShieldAlert, ShieldCheck, Zap
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useData } from '../DataContext';

const ToastContext = React.createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const remove = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const icons = { success: <CheckCircle className="w-5 h-5" />, error: <X className="w-5 h-5" />, info: <Zap className="w-5 h-5" /> };
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    error:   { bg: 'rgba(255,61,61,0.15)',   border: 'rgba(255,61,61,0.3)',   color: '#ff6b6b' },
    info:    { bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.25)', color: '#c9a84c' },
  };

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14, pointerEvents: 'auto', maxWidth: 360, fontSize: '0.85rem', fontWeight: 600, background: c.bg, border: `1px solid ${c.border}`, color: c.color, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {icons[t.type]}
              <span style={{ flex: 1 }}>{t.msg}</span>
              <button onClick={() => remove(t.id)} style={{ opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}><X className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => React.useContext(ToastContext);

const getAlertUrgency = (shortage) => {
  if (shortage >= 10) return { label: 'CRITICAL', color: '#ff4d4d', bg: 'rgba(255,61,61,0.1)', border: 'rgba(255,61,61,0.2)', dot: '#ff4d4d', sort: 3 };
  if (shortage >= 5)  return { label: 'HIGH', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', dot: '#fb923c', sort: 2 };
  return { label: 'MEDIUM', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', dot: '#fbbf24', sort: 1 };
};

const DashboardInner = () => {
  const toast = useToast();
  const { batchAlerts, batchLoading, fetchBatch } = useData();

  const [keyItems, setKeyItems] = useState([]);
  const [allAlertsByItem, setAllAlertsByItem] = useState({});
  const [alerts, setAlerts] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [emailStatus, setEmailStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [lastSynced, setLastSynced] = useState(null);
  const [expandedOrderGroups, setExpandedOrderGroups] = useState({});
  const [expandedOrderItems, setExpandedOrderItems] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showHealthyModal, setShowHealthyModal] = useState(false);
  const itemRefs = useRef({});

  const hydrateBatch = useCallback((batch) => {
    if (!batch) return;
    const arr = (batch.key_items || []).map(k => ({
      name: k.name,
      total_stock: k.total_stock,
      low_stock_count: k.alert_count || 0,
      max_shortage: Math.max(0, ...((k.alerts || []).map(a => a.shortage || 0))),
    }));
    const alertsMap = {};
    (batch.key_items || []).forEach(k => {
      alertsMap[k.name] = (k.alerts || []).map(a => ({ ...a, current_stock: a.stock_level }));
    });
    setAllAlertsByItem(alertsMap);
    if (arr.length > 0) {
      setKeyItems(arr);
      setError(null);
    } else {
      setKeyItems([]);
      if (batch.message?.includes('No inventory files found')) {
        setError({ type: 'no-files', message: batch.message, help: batch.help });
      }
    }
    setLastSynced(new Date());
  }, []);

  useEffect(() => {
    if (batchAlerts) { hydrateBatch(batchAlerts); setLoading(false); }
    else setLoading(batchLoading);
  }, [batchAlerts, batchLoading, hydrateBatch]);

  const loadAlertsForItem = useCallback((name) => {
    if (alerts[name]) return;
    const list = allAlertsByItem[name] || (batchAlerts?.key_items || []).find(x => x.name === name)?.alerts?.map(a => ({ ...a, current_stock: a.stock_level })) || [];
    setAlerts(prev => ({ ...prev, [name]: list }));
  }, [alerts, allAlertsByItem, batchAlerts]);

  const toggleExpanded = (name) => {
    const opening = !expandedItems[name];
    setExpandedItems(prev => ({ ...prev, [name]: opening }));
    if (opening) { loadAlertsForItem(name); setTimeout(() => itemRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }
  };

  const displayItems = useMemo(() => {
    let list = [...keyItems];
    if (filter === 'critical') list = list.filter(i => i.max_shortage >= 10);
    if (filter === 'needs-order') list = list.filter(i => i.low_stock_count > 0);
    if (filter === 'healthy') list = list.filter(i => i.low_stock_count === 0);
    if (sortBy === 'urgency') {
      list.sort((a, b) => {
        if (b.low_stock_count !== a.low_stock_count) return b.low_stock_count - a.low_stock_count;
        return b.max_shortage - a.max_shortage;
      });
    } else {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [keyItems, filter, sortBy]);

  const stats = useMemo(() => {
    const totalAlerts = keyItems.reduce((s, i) => s + (i.low_stock_count || 0), 0);
    const criticalItems = keyItems.filter(i => i.max_shortage >= 10).length;
    const orderPlaced = Object.values(allAlertsByItem).filter(arr => (arr || []).some(a => (a.new_order ?? 0) > 0)).length;
    const healthyItems = keyItems.filter(i => (i.low_stock_count || 0) === 0).length;
    return { total: keyItems.length, totalAlerts, criticalItems, orderPlaced, healthyItems };
  }, [keyItems, allAlertsByItem]);

  const orderPlacedItems = useMemo(() =>
    Object.entries(allAlertsByItem)
      .filter(([, arr]) => (arr || []).some(a => (a.new_order ?? 0) > 0))
      .map(([name, arr]) => ({ name, alerts: arr.filter(a => (a.new_order ?? 0) > 0) })),
    [allAlertsByItem]);

  const healthyStockItems = useMemo(() =>
    keyItems.filter(i => (i.low_stock_count || 0) === 0),
    [keyItems]);

  const handleSearch = async () => {
    const raw = searchTerm.trim();
    if (!raw) return;
    const term = raw.toUpperCase();
    setSearching(true);
    try {
      const list = batchAlerts?.key_items || [];
      let found = list.find(x => (x.name || '').toUpperCase() === term)
               || list.find(x => (x.name || '').toUpperCase().includes(term));
      if (found) {
        setExpandedItems({ [found.name]: true });
        loadAlertsForItem(found.name);
        setTimeout(() => itemRefs.current[found.name]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/search/article/${encodeURIComponent(raw)}`);
      const data = await res.json();
      if ((data.results || []).length > 0) {
        const name = data.results[0].item_name;
        setExpandedItems({ [name]: true });
        const mapped = data.results.filter(r => r.item_name === name).map(r => ({ ...r, current_stock: r.current_stock }));
        setAlerts(prev => ({ ...prev, [name]: mapped }));
        if (!keyItems.find(k => k.name === name)) setKeyItems(prev => [{ name, total_stock: undefined, low_stock_count: mapped.length, max_shortage: 0 }, ...prev]);
        setTimeout(() => itemRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        toast('No results found for that article.', 'error');
      }
    } catch {
      toast('Search failed. Please try again.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/download-all`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `danier_alerts_${new Date().toISOString().split('T')[0]}.xlsx`, style: 'display:none' });
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
      toast('Excel downloaded & email sent to recipients!', 'success');
    } catch {
      toast('Failed to generate report. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async (itemName) => {
    setEmailStatus(prev => ({ ...prev, [itemName]: 'sending' }));
    try {
      await sendEmailAlert(itemName);
      setEmailStatus(prev => ({ ...prev, [itemName]: 'sent' }));
      toast(`Alert email sent for ${itemName}`, 'success');
      setTimeout(() => setEmailStatus(prev => ({ ...prev, [itemName]: null })), 3500);
    } catch {
      setEmailStatus(prev => ({ ...prev, [itemName]: 'error' }));
      toast(`Failed to send email for ${itemName}`, 'error');
      setTimeout(() => setEmailStatus(prev => ({ ...prev, [itemName]: null })), 4000);
    }
  };

  const toggleAll = () => {
    const allOpen = displayItems.every(i => expandedItems[i.name]);
    if (allOpen) {
      setExpandedItems({});
    } else {
      const next = {};
      displayItems.forEach(i => { next[i.name] = true; loadAlertsForItem(i.name); });
      setExpandedItems(next);
    }
  };

  const allExpanded = displayItems.length > 0 && displayItems.every(i => expandedItems[i.name]);

  const filterBtnStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...(active ? {
      background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
      color: '#000',
      borderColor: 'transparent',
      boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
    } : {
      background: 'rgba(255,255,255,0.03)',
      color: 'rgba(200,200,220,0.85)',
      borderColor: 'rgba(255,255,255,0.08)',
    }),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header Card */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div style={{ position: 'relative' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-gold" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)' }}>
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              {stats.criticalItems > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, background: '#ef4444', borderRadius: '50%', color: '#fff', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse">
                  {stats.criticalItems}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-gold leading-tight font-elegant">Key Items Dashboard</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(200,200,220,0.7)' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(200,200,220,0.7)' }}>
                  {lastSynced ? `Last synced ${lastSynced.toLocaleTimeString()}` : 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', opacity: downloading ? 0.6 : 1, cursor: downloading ? 'not-allowed' : 'pointer' }}
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-spin' : ''}`} />
              {downloading ? 'Generating...' : 'Download Report'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchBatch(false); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', boxShadow: '0 4px 16px rgba(201,168,76,0.3)', opacity: loading ? 0.6 : 1 }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Items', value: stats.total, icon: <Package className="w-5 h-5" />, color: '#3b82f6', onClick: null },
            { label: 'Active Alerts', value: stats.totalAlerts, icon: <AlertTriangle className="w-5 h-5" />, color: '#ff4d4d', onClick: null },
            { label: 'Critical', value: stats.criticalItems, icon: <ShieldAlert className="w-5 h-5" />, color: '#fb923c', onClick: () => setFilter('critical') },
            { label: 'Order Placed', value: stats.orderPlaced, icon: <TrendingUp className="w-5 h-5" />, color: '#8b5cf6', onClick: () => setShowOrderModal(true) },
            { label: 'Healthy Stock', value: stats.healthyItems, icon: <ShieldCheck className="w-5 h-5" />, color: '#10b981', onClick: () => setShowHealthyModal(true) },
          ].map(s => (
            <div
              key={s.label}
              onClick={s.onClick}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 16,
                background: 'rgba(5,8,14,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: 16,
                transition: 'all 0.2s',
                cursor: s.onClick ? 'pointer' : 'default',
              }}
              onMouseEnter={e => { if (s.onClick) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}}
              onMouseLeave={e => { if (s.onClick) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}}
            >
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                {s.icon}
              </div>
              <div className="text-gradient-gold" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(200,200,220,0.85)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              {s.onClick && <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '0.65rem', color: 'rgba(200,200,220,0.7)', fontWeight: 600 }}>click to view</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Critical Banner */}
      {stats.criticalItems > 0 && !loading && (
        <div style={{ borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,61,61,0.12), rgba(255,120,61,0.08))', border: '1px solid rgba(255,61,61,0.2)', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,61,61,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#ff4d4d' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#ff8080', fontSize: '0.95rem' }}>
                {stats.criticalItems} item{stats.criticalItems > 1 ? 's' : ''} need immediate attention
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,150,150,0.6)' }}>
                {stats.totalAlerts} total low-stock alerts across {stats.total} tracked products
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => { setFilter('critical'); setSortBy('urgency'); }}
              style={{ padding: '8px 16px', background: 'rgba(255,61,61,0.15)', border: '1px solid rgba(255,61,61,0.3)', borderRadius: 12, color: '#ff8080', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View Critical
            </button>
            <button
              onClick={handleDownload}
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(200,200,220,0.85)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* Filter & Sort Bar */}
      {!loading && !error && keyItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '8px 14px', flex: '1 1 auto', maxWidth: 300 }}>
            <SearchIcon className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.7)', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search article..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f8', fontSize: '0.85rem' }}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: (searching || !searchTerm.trim()) ? 0.4 : 1 }}
            >
              {searching ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Go'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: `All (${keyItems.length})` },
              { key: 'critical', label: `Critical (${stats.criticalItems})` },
              { key: 'needs-order', label: `Alerts (${keyItems.filter(i => i.low_stock_count > 0).length})` },
              { key: 'healthy', label: `Healthy (${stats.healthyItems})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={filterBtnStyle(filter === f.key)}>{f.label}</button>
            ))}
            <button
              onClick={() => setSortBy(s => s === 'urgency' ? 'name' : 'urgency')}
              style={{ ...filterBtnStyle(false), display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Filter className="w-3.5 h-3.5" />
              {sortBy === 'urgency' ? 'Sort: Urgency' : 'Sort: A-Z'}
            </button>
            <button
              onClick={toggleAll}
              style={{ ...filterBtnStyle(false), display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              {allExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card-premium" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c', margin: '0 auto 16px' }} className="animate-spin" />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f0f8' }}>Loading inventory alerts...</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.75)', marginTop: 4 }}>Fetching latest data from warehouse</div>
        </div>

      ) : error?.type === 'no-files' ? (
        <div className="card-premium" style={{ padding: '3rem', textAlign: 'center' }}>
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(200,200,220,0.2)' }} />
          <h2 className="text-gradient-gold" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>No Inventory Data</h2>
          <p style={{ color: 'rgba(200,200,220,0.8)', marginBottom: 24 }}>{error.message}</p>
          {error.help && (
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 16, padding: 24, textAlign: 'left', maxWidth: 420, margin: '0 auto 20px' }}>
              <p style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>{error.help.title}</p>
              {error.help.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(200,200,220,0.85)' }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : error ? (
        <div className="card-premium" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ff6b6b', opacity: 0.6 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff8080', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: 'rgba(200,200,220,0.8)', marginBottom: 24 }}>{error.message}</p>
          <button onClick={() => { setError(null); fetchBatch(false); }} className="btn-premium" style={{ padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>Try Again</button>
        </div>

      ) : displayItems.length === 0 ? (
        <div className="card-premium" style={{ padding: '3rem', textAlign: 'center' }}>
          <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(200,200,220,0.2)' }} />
          <h3 className="text-gradient-gold" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No items match this filter</h3>
          <p style={{ color: 'rgba(200,200,220,0.75)', fontSize: '0.85rem', marginBottom: 16 }}>Try changing the filter or search above</p>
          <button onClick={() => setFilter('all')} className="btn-premium" style={{ padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: '0.85rem', cursor: 'pointer' }}>Show All</button>
        </div>

      ) : (
        <div className="space-y-3">
          {displayItems.map((item, index) => {
            const hasAlerts = item.low_stock_count > 0;
            const isCritical = item.max_shortage >= 10;
            const isExpanded = !!expandedItems[item.name];
            const es = emailStatus[item.name];
            const itemAlerts = alerts[item.name] || [];

            return (
              <div
                key={item.name}
                ref={el => { itemRefs.current[item.name] = el; }}
                className="animate-slide-up"
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${isCritical ? 'rgba(255,61,61,0.15)' : hasAlerts ? 'rgba(251,146,60,0.12)' : 'rgba(16,185,129,0.1)'}`,
                  background: 'rgba(13,13,26,0.9)',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.04}s`,
                }}
              >
                {/* Item Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${isCritical ? '#ff4d4d' : hasAlerts ? '#fb923c' : 'rgba(16,185,129,0.4)'}`,
                    transition: 'background 0.2s',
                  }}
                  onClick={() => toggleExpanded(item.name)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: isCritical ? '#ff4d4d' : hasAlerts ? '#fb923c' : '#10b981' }} className={isCritical ? 'animate-pulse' : ''} />
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, color: '#f0f0f8', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(200,200,220,0.75)', marginTop: 1 }}>
                        {hasAlerts
                          ? `${item.low_stock_count} variant${item.low_stock_count > 1 ? 's' : ''} below threshold`
                          : 'All variants adequate'
                        }
                        {item.total_stock != null && ` · ${item.total_stock} total units`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    {isCritical && (
                      <span className="badge-critical" style={{ display: 'none' }}><AlertTriangle className="w-3 h-3" /> CRITICAL</span>
                    )}
                    {isCritical && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,61,61,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,61,61,0.2)' }}>
                        <AlertTriangle className="w-3 h-3" /> CRITICAL
                      </span>
                    )}
                    {!isCritical && hasAlerts && (
                      <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>
                        {item.low_stock_count} alerts
                      </span>
                    )}

                    {hasAlerts && (
                      <button
                        onClick={e => { e.stopPropagation(); handleEmail(item.name); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                          ...(es === 'sending' ? { background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#3b82f6' } :
                            es === 'sent' ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: '#10b981' } :
                            es === 'error' ? { background: 'rgba(255,61,61,0.1)', borderColor: 'rgba(255,61,61,0.25)', color: '#ff6b6b' } :
                            { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }),
                        }}
                        title="Send email alert for this item"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span style={{ display: 'none' }} className="sm:!inline">
                          {es === 'sending' ? 'Sending...' : es === 'sent' ? 'Sent' : es === 'error' ? 'Failed' : 'Email'}
                        </span>
                      </button>
                    )}

                    <div style={{ padding: 6, borderRadius: 8, background: isExpanded ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: '#c9a84c' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.75)' }} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Alert Table */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {itemAlerts.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <CheckCircle className="w-10 h-10 mx-auto mb-2" style={{ color: '#10b981' }} />
                        <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>All variants have adequate stock</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="table-luxury" style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Color</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Size</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Item #</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Stock</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Required</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Shortage</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right' }}>New Order</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Order Date</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...itemAlerts]
                              .sort((a, b) => (b.shortage || 0) - (a.shortage || 0))
                              .map((alert, i) => {
                                const isOrderPlaced = (alert.new_order ?? 0) > 0;
                                const urg = getAlertUrgency(alert.shortage || 0);
                                return (
                                  <tr key={i} style={{ background: isCritical && (alert.shortage || 0) >= 10 ? 'rgba(255,61,61,0.03)' : 'transparent', transition: 'background 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isCritical && (alert.shortage || 0) >= 10 ? 'rgba(255,61,61,0.03)' : 'transparent'; }}
                                  >
                                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#d0d0e8', fontSize: '0.85rem' }}>{alert.color}</td>
                                    <td style={{ padding: '10px 14px', color: 'rgba(200,200,220,0.85)', fontSize: '0.85rem' }}>{alert.size}</td>
                                    <td style={{ padding: '10px 14px', color: 'rgba(200,200,220,0.75)', fontSize: '0.8rem' }}>{alert.item_number || '—'}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 500, color: '#d0d0e8', fontSize: '0.85rem' }}>{alert.current_stock}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: 'rgba(200,200,220,0.8)', fontSize: '0.85rem' }}>{alert.required_threshold}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#ff4d4d', fontSize: '0.85rem' }}>-{alert.shortage}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: 'rgba(200,200,220,0.8)', fontSize: '0.85rem' }}>{(alert.new_order ?? '') === '' ? '—' : alert.new_order}</td>
                                    <td style={{ padding: '10px 14px', color: 'rgba(200,200,220,0.75)', fontSize: '0.78rem' }}>{alert.order_date || '—'}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                      {isOrderPlaced ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.65rem', fontWeight: 700, borderRadius: 8 }}>
                                          <TrendingUp className="w-3 h-3" /> ORDER PLACED
                                        </span>
                                      ) : (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: urg.bg, border: `1px solid ${urg.border}`, color: urg.color, fontSize: '0.65rem', fontWeight: 700, borderRadius: 8 }}>
                                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: urg.dot }} />
                                          {urg.label}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Orders Placed Modal */}
      {showOrderModal && (
        <DarkModal title="Items with Orders Placed" icon={<TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />} onClose={() => setShowOrderModal(false)}>
          {orderPlacedItems.length === 0
            ? <p style={{ textAlign: 'center', color: 'rgba(200,200,220,0.75)', padding: '2rem' }}>No items with orders placed yet.</p>
            : orderPlacedItems.map((item, i) => (
              <div key={i} style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10, background: 'rgba(5,8,14,0.5)' }}>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textAlign: 'left', color: '#f0f0f8' }}
                  onClick={() => setExpandedOrderGroups(p => ({ ...p, [item.name]: !p[item.name] }))}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <span>{item.name} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'rgba(200,200,220,0.75)' }}>({item.alerts.length} variant{item.alerts.length > 1 ? 's' : ''})</span></span>
                  {expandedOrderGroups[item.name] ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.75)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(200,200,220,0.75)' }} />}
                </button>
                {expandedOrderGroups[item.name] && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.alerts.map((a, j) => {
                      const rk = `${item.name}__${j}`;
                      return (
                        <div key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <button
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', color: '#d0d0e8' }}
                            onClick={() => setExpandedOrderItems(p => ({ ...p, [rk]: !p[rk] }))}
                          >
                            <span>{a.color} – {a.size}</span>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>{a.new_order} units ordered</span>
                          </button>
                          {expandedOrderItems[rk] && (
                            <div style={{ padding: '8px 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem', color: 'rgba(200,200,220,0.8)', background: 'rgba(5,8,14,0.3)' }}>
                              <div><span style={{ color: 'rgba(200,200,220,0.3)' }}>Item #</span><br/><strong style={{ color: '#d0d0e8' }}>{a.item_number || '—'}</strong></div>
                              <div><span style={{ color: 'rgba(200,200,220,0.3)' }}>Current Stock</span><br/><strong style={{ color: '#d0d0e8' }}>{a.current_stock}</strong></div>
                              <div><span style={{ color: 'rgba(200,200,220,0.3)' }}>Required</span><br/><strong style={{ color: '#d0d0e8' }}>{a.required_threshold}</strong></div>
                              <div><span style={{ color: 'rgba(200,200,220,0.3)' }}>Shortage</span><br/><strong style={{ color: '#ff4d4d' }}>-{a.shortage}</strong></div>
                              {a.order_date && <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'rgba(200,200,220,0.3)' }}>Order Date</span><br/><strong style={{ color: '#d0d0e8' }}>{a.order_date}</strong></div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          }
        </DarkModal>
      )}

      {/* Healthy Stock Modal */}
      {showHealthyModal && (
        <DarkModal title="Healthy Stock Items" icon={<ShieldCheck className="w-5 h-5" style={{ color: '#10b981' }} />} onClose={() => setShowHealthyModal(false)}>
          {healthyStockItems.length === 0
            ? <p style={{ textAlign: 'center', color: 'rgba(200,200,220,0.75)', padding: '2rem' }}>No items with healthy stock levels.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthyStockItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontWeight: 600, color: '#10b981', fontSize: '0.85rem' }}>{item.name}</span>
                  </div>
                  {item.total_stock != null && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(16,185,129,0.6)' }}>{item.total_stock} units</span>
                  )}
                </div>
              ))}
            </div>
          }
        </DarkModal>
      )}
    </div>
  );
};

const DarkModal = ({ title, icon, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
    <div style={{ background: 'rgba(13,13,26,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontWeight: 700, color: '#f0f0f8', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>{icon}{title}</h2>
        <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(200,200,220,0.8)', transition: 'all 0.2s' }}><X className="w-4 h-4" /></button>
      </div>
      <div style={{ padding: 20, overflowY: 'auto', maxHeight: '70vh' }}>{children}</div>
    </div>
  </div>
);

const Dashboard = () => (
  <ToastProvider>
    <DashboardInner />
  </ToastProvider>
);

export default Dashboard;
