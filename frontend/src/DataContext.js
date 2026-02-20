import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { getAllKeyItemsWithAlerts } from './services/api';
import { API_BASE_URL } from './config';

const BATCH_CACHE_KEY = 'danier_batch_cache';
const BATCH_TS_KEY = 'danier_batch_ts';
const THRESH_CACHE_KEY = 'danier_thresh_cache';
const THRESH_TS_KEY = 'danier_thresh_ts';
const OPTS_CACHE_KEY = 'danier_opts_cache';
const OPTS_TS_KEY = 'danier_opts_ts';
const MAX_AGE = 30 * 60 * 1000;

function lsGet(key, tsKey) {
  try {
    const raw = localStorage.getItem(key);
    const ts = Number(localStorage.getItem(tsKey) || 0);
    if (raw && Date.now() - ts < MAX_AGE) return JSON.parse(raw);
  } catch {}
  return null;
}
function lsSet(key, tsKey, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    localStorage.setItem(tsKey, String(Date.now()));
  } catch {}
}

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const [batchAlerts, setBatchAlerts] = useState(() => lsGet(BATCH_CACHE_KEY, BATCH_TS_KEY));
  const [thresholds, setThresholds] = useState(() => lsGet(THRESH_CACHE_KEY, THRESH_TS_KEY));
  const [allOptions, setAllOptions] = useState(() => lsGet(OPTS_CACHE_KEY, OPTS_TS_KEY));

  const [batchLoading, setBatchLoading] = useState(!lsGet(BATCH_CACHE_KEY, BATCH_TS_KEY));
  const [threshLoading, setThreshLoading] = useState(!lsGet(THRESH_CACHE_KEY, THRESH_TS_KEY));
  const [optsLoading, setOptsLoading] = useState(!lsGet(OPTS_CACHE_KEY, OPTS_TS_KEY));

  const fetchIdRef = useRef(0);

  const fetchBatch = useCallback(async (bg = false) => {
    const id = ++fetchIdRef.current;
    if (!bg) setBatchLoading(true);
    try {
      const res = await getAllKeyItemsWithAlerts();
      if (id !== fetchIdRef.current) return;
      setBatchAlerts(res);
      lsSet(BATCH_CACHE_KEY, BATCH_TS_KEY, res);
    } catch {}
    if (id === fetchIdRef.current) setBatchLoading(false);
  }, []);

  const fetchThresholds = useCallback(async (bg = false) => {
    if (!bg) setThreshLoading(true);
    try {
      const [allRes, overRes] = await Promise.all([
        fetch(`${API_BASE_URL}/thresholds/all`, { mode: 'cors', cache: 'no-store' }).then(r => r.json()),
        fetch(`${API_BASE_URL}/thresholds/overrides`, { mode: 'cors', cache: 'no-store' }).then(r => r.ok ? r.json() : { overrides: [] }),
      ]);
      const data = { allThresholds: allRes, overrides: overRes.overrides || [] };
      setThresholds(data);
      lsSet(THRESH_CACHE_KEY, THRESH_TS_KEY, data);
    } catch {}
    setThreshLoading(false);
  }, []);

  const fetchOptions = useCallback(async (bg = false) => {
    if (!bg) setOptsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/key-items/all-options`, { mode: 'cors', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAllOptions(data);
        lsSet(OPTS_CACHE_KEY, OPTS_TS_KEY, data);
      }
    } catch {}
    setOptsLoading(false);
  }, []);

  const refreshAll = useCallback(async (bg = false) => {
    await Promise.all([fetchBatch(bg), fetchThresholds(bg), fetchOptions(bg)]);
  }, [fetchBatch, fetchThresholds, fetchOptions]);

  useEffect(() => {
    const hasCached = !!(lsGet(BATCH_CACHE_KEY, BATCH_TS_KEY));
    refreshAll(hasCached);
  }, [refreshAll]);

  const value = {
    batchAlerts,
    batchLoading,
    thresholds,
    threshLoading,
    allOptions,
    optsLoading,
    refreshAll,
    fetchBatch,
    fetchThresholds,
    fetchOptions,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
