import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sendEmailAlert } from '../services/api';
import {
  ChevronDown, ChevronUp, AlertTriangle, Package, Mail, RefreshCw,
  Search as SearchIcon, Download, TrendingUp, Sparkles, BarChart3,
  X, CheckCircle, Filter, ChevronsUpDown, Clock, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useData } from '../DataContext';

// ─── Toast Notification System ───────────────────────────────────────────────
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
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
  };

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto max-w-sm text-sm font-medium animate-slide-up ${colors[t.type]}`}>
            {icons[t.type]}
            <span className="flex-1">{t.msg}</span>
            <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => React.useContext(ToastContext);

// ─── Urgency helpers ──────────────────────────────────────────────────────────
const getItemUrgency = (item) => {
  if (!item.low_stock_count || item.low_stock_count === 0) return 0; // healthy
  // We'll determine from shortage data if we have it
  return item.low_stock_count;
};

const getAlertUrgency = (shortage) => {
  if (shortage >= 10) return { label: 'CRITICAL', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', dot: 'bg-red-500', sort: 3 };
  if (shortage >= 5)  return { label: 'HIGH',     color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', dot: 'bg-orange-500', sort: 2 };
  return               { label: 'MEDIUM',   color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', dot: 'bg-amber-400', sort: 1 };
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashboardInner = () => {
  const toast = useToast();
  const { batchAlerts, batchLoading, fetchBatch } = useData();

  const [keyItems, setKeyItems]               = useState([]);
  const [allAlertsByItem, setAllAlertsByItem] = useState({});
  const [alerts, setAlerts]                   = useState({});
  const [expandedItems, setExpandedItems]     = useState({});
  const [emailStatus, setEmailStatus]         = useState({});
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [searchTerm, setSearchTerm]           = useState('');
  const [searching, setSearching]             = useState(false);
  const [downloading, setDownloading]         = useState(false);
  const [filter, setFilter]                   = useState('all'); // all | critical | needs-order | healthy
  const [sortBy, setSortBy]                   = useState('urgency'); // urgency | name
  const [lastSynced, setLastSynced]           = useState(null);
  const [expandedOrderGroups, setExpandedOrderGroups] = useState({});
  const [expandedOrderItems,  setExpandedOrderItems]  = useState({});
  const [showOrderModal,   setShowOrderModal]   = useState(false);
  const [showHealthyModal, setShowHealthyModal] = useState(false);
  const itemRefs = useRef({});

  // ── Hydrate data from context ──
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

  // ── Sorted + filtered list ──
  const displayItems = useMemo(() => {
    let list = [...keyItems];

    // Filter
    if (filter === 'critical')    list = list.filter(i => i.max_shortage >= 10);
    if (filter === 'needs-order') list = list.filter(i => i.low_stock_count > 0);
    if (filter === 'healthy')     list = list.filter(i => i.low_stock_count === 0);

    // Sort
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

  // ── Stats ──
  const stats = useMemo(() => {
    const totalAlerts    = keyItems.reduce((s, i) => s + (i.low_stock_count || 0), 0);
    const criticalItems  = keyItems.filter(i => i.max_shortage >= 10).length;
    const orderPlaced    = Object.values(allAlertsByItem).filter(arr => (arr || []).some(a => (a.new_order ?? 0) > 0)).length;
    const healthyItems   = keyItems.filter(i => (i.low_stock_count || 0) === 0).length;
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

  // ── Search ──
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
      const res  = await fetch(`${API_BASE_URL}/search/article/${encodeURIComponent(raw)}`);
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

  // ── Download ──
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/download-all`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `danier_alerts_${new Date().toISOString().split('T')[0]}.xlsx`, style: 'display:none' });
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
      toast('✅ Excel downloaded & email sent to recipients!', 'success');
    } catch {
      toast('❌ Failed to generate report. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // ── Email ──
  const handleEmail = async (itemName) => {
    setEmailStatus(prev => ({ ...prev, [itemName]: 'sending' }));
    try {
      await sendEmailAlert(itemName);
      setEmailStatus(prev => ({ ...prev, [itemName]: 'sent' }));
      toast(`📧 Alert email sent for ${itemName}`, 'success');
      setTimeout(() => setEmailStatus(prev => ({ ...prev, [itemName]: null })), 3500);
    } catch {
      setEmailStatus(prev => ({ ...prev, [itemName]: 'error' }));
      toast(`Failed to send email for ${itemName}`, 'error');
      setTimeout(() => setEmailStatus(prev => ({ ...prev, [itemName]: null })), 4000);
    }
  };

  // ── Expand / collapse all ──
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

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* ── Top Header Card ── */}
      <div className="card-premium dark:card-premium-dark p-5 sm:p-7">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-gold rounded-2xl shadow-gold flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {stats.criticalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {stats.criticalItems}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient-gold leading-tight">Key Items Dashboard</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {lastSynced ? `Last synced ${lastSynced.toLocaleTimeString()}` : 'Loading…'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm shadow-lg transition-all"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-spin' : ''}`} />
              {downloading ? 'Generating…' : 'Download Report'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchBatch(false); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-gold disabled:opacity-60 text-white rounded-xl font-semibold text-sm shadow-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* ── Stats Grid (5 cards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Items',    value: stats.total,       icon: <Package className="w-5 h-5" />,       color: 'from-blue-500 to-blue-600',     onClick: null },
            { label: 'Active Alerts',  value: stats.totalAlerts, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-red-500 to-red-600',       onClick: null },
            { label: 'Critical',       value: stats.criticalItems,icon: <ShieldAlert className="w-5 h-5" />,  color: 'from-orange-500 to-orange-600', onClick: () => setFilter('critical') },
            { label: 'Order Placed',   value: stats.orderPlaced, icon: <TrendingUp className="w-5 h-5" />,    color: 'from-violet-500 to-violet-600', onClick: () => setShowOrderModal(true) },
            { label: 'Healthy Stock',  value: stats.healthyItems,icon: <ShieldCheck className="w-5 h-5" />,   color: 'from-emerald-500 to-emerald-600',onClick: () => setShowHealthyModal(true) },
          ].map(s => (
            <div
              key={s.label}
              onClick={s.onClick}
              className={`relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 p-4 transition-all duration-200 ${s.onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white mb-3 shadow`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-gradient-gold">{s.value}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              {s.onClick && <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">click to view →</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's Action Banner (only when there are critical items) ── */}
      {stats.criticalItems > 0 && !loading && (
        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">
                {stats.criticalItems} item{stats.criticalItems > 1 ? 's' : ''} need immediate attention today
              </div>
              <div className="text-sm text-white/80">
                {stats.totalAlerts} total low-stock alerts across {stats.total} tracked products
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { setFilter('critical'); setSortBy('urgency'); }}
              className="px-4 py-2 bg-white text-red-700 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              View Critical
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm border border-white/30 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* ── Filter & Sort Bar ── */}
      {!loading && !error && keyItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 flex-1 max-w-xs shadow-sm">
            <SearchIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search article…"
              className="bg-transparent outline-none flex-1 text-sm text-gray-800 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              className="px-2.5 py-1 bg-gradient-gold text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {searching ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Go'}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filter tabs */}
            {[
              { key: 'all',         label: `All (${keyItems.length})` },
              { key: 'critical',    label: `Critical (${stats.criticalItems})` },
              { key: 'needs-order', label: `Alerts (${keyItems.filter(i=>i.low_stock_count>0).length})` },
              { key: 'healthy',     label: `Healthy (${stats.healthyItems})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filter === f.key
                    ? 'bg-gradient-gold text-white border-transparent shadow'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-danier-gold'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* Sort */}
            <button
              onClick={() => setSortBy(s => s === 'urgency' ? 'name' : 'urgency')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-danier-gold transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              {sortBy === 'urgency' ? 'Sort: Urgency' : 'Sort: A–Z'}
            </button>

            {/* Expand/Collapse all */}
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-danier-gold transition-all"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="card-premium dark:card-premium-dark p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-danier-gold/30 border-t-danier-gold rounded-full animate-spin" />
            <div className="text-xl font-semibold text-danier-dark dark:text-white">Loading inventory alerts…</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Fetching latest data from warehouse</div>
          </div>
        </div>

      ) : error?.type === 'no-files' ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gradient-gold mb-3">No Inventory Data</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error.message}</p>
          {error.help && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-left max-w-md mx-auto">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-3">{error.help.title}</p>
              {error.help.steps.map((step, i) => (
                <div key={i} className="flex gap-3 mb-2">
                  <span className="w-6 h-6 bg-danier-gold text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>
                  <span className="text-sm text-amber-700 dark:text-amber-300">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : error ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <AlertTriangle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <button onClick={() => { setError(null); fetchBatch(false); }} className="px-6 py-3 bg-gradient-gold text-white rounded-xl font-semibold">Try Again</button>
        </div>

      ) : displayItems.length === 0 ? (
        <div className="card-premium dark:card-premium-dark p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gradient-gold mb-2">No items match this filter</h3>
          <p className="text-gray-500 text-sm mb-4">Try changing the filter or search above</p>
          <button onClick={() => setFilter('all')} className="px-4 py-2 bg-gradient-gold text-white rounded-xl text-sm font-semibold">Show All</button>
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
                className={`rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ${
                  isCritical    ? 'border-red-300 dark:border-red-800/60' :
                  hasAlerts     ? 'border-orange-200 dark:border-orange-800/40' :
                                  'border-emerald-200 dark:border-emerald-800/30'
                } bg-white dark:bg-slate-900 animate-slide-up`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* ── Item Header ── */}
                <div
                  className={`flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors ${
                    isCritical ? 'border-l-4 border-red-500' :
                    hasAlerts  ? 'border-l-4 border-orange-400' :
                                 'border-l-4 border-emerald-500'
                  }`}
                  onClick={() => toggleExpanded(item.name)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status dot */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isCritical ? 'bg-red-500 animate-pulse' :
                      hasAlerts  ? 'bg-orange-400' :
                                   'bg-emerald-500'
                    }`} />

                    <div className="min-w-0">
                      <h3 className="font-bold text-danier-dark dark:text-white text-base sm:text-lg leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {hasAlerts
                          ? `${item.low_stock_count} variant${item.low_stock_count > 1 ? 's' : ''} below threshold`
                          : 'All variants adequate'
                        }
                        {item.total_stock != null && ` · ${item.total_stock} total units`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {/* Priority badge */}
                    {isCritical && (
                      <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800">
                        <AlertTriangle className="w-3 h-3" /> CRITICAL
                      </span>
                    )}
                    {!isCritical && hasAlerts && (
                      <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded-lg border border-orange-200 dark:border-orange-800">
                        {item.low_stock_count} alerts
                      </span>
                    )}

                    {/* Quick email button (visible without expanding) */}
                    {hasAlerts && (
                      <button
                        onClick={e => { e.stopPropagation(); handleEmail(item.name); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          es === 'sending' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                          es === 'sent'    ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                          es === 'error'   ? 'bg-red-100 border-red-300 text-red-700' :
                          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                        }`}
                        title="Send email alert for this item"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {es === 'sending' ? 'Sending…' : es === 'sent' ? 'Sent ✓' : es === 'error' ? 'Failed' : 'Email'}
                        </span>
                      </button>
                    )}

                    {/* Expand toggle */}
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-danier-gold text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* ── Expanded Alert Table ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-slate-700">
                    {itemAlerts.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">All variants have adequate stock 🎉</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <tr>
                              <th className="px-4 py-3 text-left">Color</th>
                              <th className="px-4 py-3 text-left">Size</th>
                              <th className="px-4 py-3 text-left hidden sm:table-cell">Item #</th>
                              <th className="px-4 py-3 text-right">Stock</th>
                              <th className="px-4 py-3 text-right">Required</th>
                              <th className="px-4 py-3 text-right">Shortage</th>
                              <th className="px-4 py-3 text-right hidden md:table-cell">New Order</th>
                              <th className="px-4 py-3 text-left hidden md:table-cell">Order Date</th>
                              <th className="px-4 py-3 text-center">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                            {[...itemAlerts]
                              .sort((a, b) => (b.shortage || 0) - (a.shortage || 0))
                              .map((alert, i) => {
                                const isOrderPlaced = (alert.new_order ?? 0) > 0;
                                const urg = getAlertUrgency(alert.shortage || 0);
                                return (
                                  <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors ${isCritical && (alert.shortage||0) >= 10 ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{alert.color}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{alert.size}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{alert.item_number || '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{alert.current_stock}</td>
                                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{alert.required_threshold}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">−{alert.shortage}</td>
                                    <td className="px-4 py-3 text-right hidden md:table-cell text-gray-600 dark:text-gray-300">{(alert.new_order ?? '') === '' ? '—' : alert.new_order}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">{alert.order_date || '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                      {isOrderPlaced ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg">
                                          <TrendingUp className="w-3 h-3" /> ORDER PLACED
                                        </span>
                                      ) : (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 border text-[11px] font-bold rounded-lg ${urg.bg} ${urg.color}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
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

      {/* ── Orders Placed Modal ── */}
      {showOrderModal && (
        <Modal title="Items with Orders Placed" icon={<TrendingUp className="w-5 h-5 text-violet-500" />} onClose={() => setShowOrderModal(false)}>
          {orderPlacedItems.length === 0
            ? <p className="text-center text-gray-500 py-8">No items with orders placed yet.</p>
            : orderPlacedItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-3">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-left"
                  onClick={() => setExpandedOrderGroups(p => ({ ...p, [item.name]: !p[item.name] }))}
                >
                  <span>{item.name} <span className="text-sm font-normal text-gray-500">({item.alerts.length} variant{item.alerts.length>1?'s':''})</span></span>
                  {expandedOrderGroups[item.name] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedOrderGroups[item.name] && (
                  <div className="border-t border-gray-100 dark:border-slate-700">
                    {item.alerts.map((a, j) => {
                      const rk = `${item.name}__${j}`;
                      return (
                        <div key={j} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                          <button
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm text-left"
                            onClick={() => setExpandedOrderItems(p => ({ ...p, [rk]: !p[rk] }))}
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-300">{a.color} – {a.size}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{a.new_order} units ordered</span>
                          </button>
                          {expandedOrderItems[rk] && (
                            <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40">
                              <div><span className="text-gray-400">Item #</span><br/><strong>{a.item_number||'—'}</strong></div>
                              <div><span className="text-gray-400">Current Stock</span><br/><strong>{a.current_stock}</strong></div>
                              <div><span className="text-gray-400">Required</span><br/><strong>{a.required_threshold}</strong></div>
                              <div><span className="text-gray-400">Shortage</span><br/><strong className="text-red-500">−{a.shortage}</strong></div>
                              {a.order_date && <div className="col-span-2"><span className="text-gray-400">Order Date</span><br/><strong>{a.order_date}</strong></div>}
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
        </Modal>
      )}

      {/* ── Healthy Stock Modal ── */}
      {showHealthyModal && (
        <Modal title="Healthy Stock Items" icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />} onClose={() => setShowHealthyModal(false)}>
          {healthyStockItems.length === 0
            ? <p className="text-center text-gray-500 py-8">No items with healthy stock levels.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthyStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">{item.name}</span>
                  </div>
                  {item.total_stock != null && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">{item.total_stock} units</span>
                  )}
                </div>
              ))}
            </div>
          }
        </Modal>
      )}
    </div>
  );
};

// ── Reusable Modal wrapper ────────────────────────────────────────────────────
const Modal = ({ title, icon, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
        <h2 className="font-bold text-danier-dark dark:text-white flex items-center gap-2 text-lg">{icon}{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="p-5 overflow-y-auto max-h-[70vh]">{children}</div>
    </div>
  </div>
);

// ── Exported wrapper with toast provider ──────────────────────────────────────
const Dashboard = () => (
  <ToastProvider>
    <DashboardInner />
  </ToastProvider>
);

export default Dashboard;
