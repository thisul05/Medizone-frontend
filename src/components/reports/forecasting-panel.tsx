"use client";

import { useState } from "react";
import { FORECAST_GROUPS } from "@/data/forecasting";
import { TrendingUp, RefreshCw } from "./report-icons";

export default function ForecastingPanel({ branch, dateRange }: { branch: string; dateRange: string }) {
  const [groupId, setGroupId] = useState<string>('inventory');
  const [featureId, setFeatureId] = useState<string>('seasonal');
  const [horizon, setHorizon] = useState('30 days');
  const [result, setResult] = useState<{ text: string; source: string; context: string; warning?: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const group = FORECAST_GROUPS.find(item => item.id === groupId)!;
  const feature = group.features.find(item => item.id === featureId)!;
  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#0a2540]';

  async function generate() {
    setError('');
    setResult(null);
    const context = `${feature.title} | ${branch} | History: ${dateRange} | Horizon: ${horizon}`;
    setLoading(true);
    try {
      const response = await fetch('/reports/api/forecast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, featureId, horizon, branch, dateRange }),
        signal: AbortSignal.timeout(105000),
      });
      const body = await response.json().catch(() => null);
      if (!body) throw new Error(`The forecasting server returned an unexpected response (HTTP ${response.status}). Restart the development server and try again.`);
      if (!response.ok) throw new Error(body.error || 'Unable to generate analysis.');
      if (typeof body.text !== 'string' || !body.text.trim()) throw new Error('Gemini returned an empty analysis. Please try again.');
      setResult({ source: 'Gemini forecast', context, text: body.text, warning: body.warning });
    } catch (error) {
      setError(error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
        ? 'Gemini took too long to respond. Please try again shortly.'
        : error instanceof Error ? error.message : 'The request failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <section aria-labelledby="forecast-heading" className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a2540] p-5 text-white">
        <div><h2 id="forecast-heading" className="flex items-center gap-2 text-xl font-bold"><TrendingUp className="size-5 text-emerald-300" />AI Forecasting</h2><p className="mt-1 text-sm text-slate-300">Forecast inventory, revenue and staffing with Google Gemini.</p></div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Google Gemini</span>
      </div>
      <div className="p-5">
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Forecast areas">
          {FORECAST_GROUPS.map(item => <button key={item.id} disabled={loading} aria-pressed={groupId === item.id} onClick={() => { setGroupId(item.id); setFeatureId(item.features[0].id); setResult(null); setError(''); }} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${groupId === item.id ? 'border-[#0a2540] bg-[#0a2540] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{item.title}</button>)}
        </div>
        <p className="mb-4 text-sm text-slate-500">{group.description}</p>
        <fieldset disabled={loading} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-600">Forecast type<select className={fieldClass} value={featureId} onChange={e => setFeatureId(e.target.value)}>{group.features.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Future horizon<select className={fieldClass} value={horizon} onChange={e => setHorizon(e.target.value)}>{['7 days', '30 days', '90 days', '6 months', '12 months'].map(item => <option key={item}>{item}</option>)}</select></label>
        </fieldset>
        <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
        <p className="mt-2 text-xs text-slate-500">Branch: {branch} | Historical window: {dateRange}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3"><button disabled={loading} onClick={generate} className="flex items-center gap-2 rounded-xl bg-[#0a2540] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f385d] disabled:opacity-60">{loading && <RefreshCw className="size-4 animate-spin" />}{loading ? 'Generating...' : 'Generate forecast'}</button></div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {result && <article aria-live="polite" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5"><h3 className="font-bold text-[#0a2540]">{result.source}</h3><p className="mt-1 text-xs text-slate-500">{result.context}</p>{result.warning && <p role="status" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{result.warning}</p>}<div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{result.text}</div></article>}
      </div>
    </section>
  );
}
