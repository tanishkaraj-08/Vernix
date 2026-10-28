import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  RotateCcw,
  Save,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { getSettings, saveSettings, resetFactoryDemoData, subscribeToStore } from '../lib/storage';
import { SystemSettings } from '../lib/storage';
import { useRole } from '../lib/roleContext';

export const SettingsPage: React.FC = () => {
  const { isAuditor } = useRole();
  const [settings, setSettings] = useState<SystemSettings>(getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo complaints, coordinations, remarks, and audit trails back to initial factory demo seed records?')) {
      resetFactoryDemoData();
      setSettings(getSettings());
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  const handleExportJson = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      institutions: localStorage.getItem('verinex_aicte_institutions_v1'),
      complaints: localStorage.getItem('verinex_aicte_complaints_v1'),
      coordinations: localStorage.getItem('verinex_aicte_coordinations_v1'),
      settings: localStorage.getItem('verinex_aicte_settings_v1'),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `VERINEX_AICTE_Demo_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              System Parameters
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Settings & Algorithm Tuning
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Configure statutory resolution SLAs, calibrate AI overlap matching weights, and manage demo database persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Backup Database (JSON)
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings successfully committed to local configuration store.
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          Factory demo dataset restored. All test scenarios (A, B, C) and initial officer assignments reloaded.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SLA Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Statutory Turnaround SLA Deadlines
          </h3>
          <p className="text-slate-500">
            Define target resolution timeframes in calendar days for regular and high-priority grievances.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Standard Case SLA Limit (Days)</label>
              <input
                type="number"
                min={5}
                max={90}
                value={settings.defaultSlaDays}
                onChange={(e) => setSettings({ ...settings, defaultSlaDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
              <div className="text-[11px] text-slate-400">Default: 15 Days for normal grievances</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Critical / Urgent Case SLA Limit (Days)</label>
              <input
                type="number"
                min={2}
                max={30}
                value={settings.urgentSlaDays}
                onChange={(e) => setSettings({ ...settings, urgentSlaDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
              <div className="text-[11px] text-slate-400">Default: 7 Days for anti-ragging & critical non-compliance</div>
            </div>
          </div>
        </div>

        {/* AI Overlap Engine Weights (Slide 3) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              AI Overlap Engine Weight Calibration (Slide 3 Architecture)
            </h3>
            <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Total Weight: {settings.weightInstitution + settings.weightCategory + settings.weightText + settings.weightBureau}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="font-semibold text-blue-900">Institution Match Weight</label>
              <input
                type="number"
                value={settings.weightInstitution}
                onChange={(e) => setSettings({ ...settings, weightInstitution: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
              />
              <div className="text-[10px] text-slate-500">Benchmark: 40%</div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="font-semibold text-purple-900">Category Match Weight</label>
              <input
                type="number"
                value={settings.weightCategory}
                onChange={(e) => setSettings({ ...settings, weightCategory: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
              />
              <div className="text-[10px] text-slate-500">Benchmark: 20%</div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="font-semibold text-indigo-900">Text NLP Match Weight</label>
              <input
                type="number"
                value={settings.weightText}
                onChange={(e) => setSettings({ ...settings, weightText: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
              />
              <div className="text-[10px] text-slate-500">Benchmark: 30%</div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="font-semibold text-teal-900">Cross-Bureau Active Weight</label>
              <input
                type="number"
                value={settings.weightBureau}
                onChange={(e) => setSettings({ ...settings, weightBureau: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
              />
              <div className="text-[10px] text-slate-500">Benchmark: 10%</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Minimum Overlap Alert Threshold (%): {settings.overlapThreshold}%</label>
            </div>
            <input
              type="range"
              min={40}
              max={90}
              step={5}
              value={settings.overlapThreshold}
              onChange={(e) => setSettings({ ...settings, overlapThreshold: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>40% (Permissive)</span>
              <span>60% (Recommended AICTE Baseline)</span>
              <span>90% (Strict Near-Duplicate)</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="w-full sm:w-auto px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Factory Demo Seed Data
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
