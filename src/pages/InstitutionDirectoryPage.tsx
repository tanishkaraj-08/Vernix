import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Download,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getInstitutions, subscribeToStore } from '../lib/storage';
import { Institution } from '../types';
import { exportInstitutionsToCSV } from '../lib/exportUtils';

export const InstitutionDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const loadData = () => {
    setInstitutions(getInstitutions());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  const regions = ['ALL', 'Southern', 'Western', 'Northern', 'Eastern', 'Central'];

  const filtered = institutions.filter(inst => {
    const matchesQuery = 
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'ALL' || inst.region === selectedRegion;
    const matchesRisk = selectedRisk === 'ALL' || inst.riskRating === selectedRisk;

    return matchesQuery && matchesRegion && matchesRisk;
  });

  const getRiskBadge = (rating: string) => {
    switch (rating) {
      case 'Severe':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Central Institutional Master
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AICTE Approved Institutions Directory
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Unified institutional profiles combining regulatory records from Approval Bureau (RB) and complaint histories from Public Grievance Redressal Cell (PGRC).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportInstitutionsToCSV(filtered)}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Directory (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Institution Name, Permanent ID, State..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold uppercase">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'ALL' ? 'All Regions' : `${r} Region`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold uppercase">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
            >
              <option value="ALL">All Risk Ratings</option>
              <option value="Severe">Severe Risk</option>
              <option value="High">High Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {(searchQuery || selectedRegion !== 'ALL' || selectedRisk !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedRegion('ALL'); setSelectedRisk('ALL'); }}
              className="text-xs text-blue-600 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">AICTE Permanent ID</th>
                <th className="py-3.5 px-4 font-semibold">Institution Name & City</th>
                <th className="py-3.5 px-4 font-semibold">Type & Region</th>
                <th className="py-3.5 px-4 font-semibold text-center">Total Complaints</th>
                <th className="py-3.5 px-4 font-semibold text-center">RB Cases</th>
                <th className="py-3.5 px-4 font-semibold text-center">PGRC Cases</th>
                <th className="py-3.5 px-4 font-semibold text-center">Active Overlaps</th>
                <th className="py-3.5 px-4 font-semibold">Compliance Risk</th>
                <th className="py-3.5 px-4 font-semibold text-right">Unified Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{inst.id}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => navigate(`/institutions/${inst.id}`)}
                      className="font-bold text-slate-900 hover:text-blue-700 text-left block"
                    >
                      {inst.name}
                    </button>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{inst.city}, {inst.state}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{inst.type}</div>
                    <div className="text-[11px] text-slate-400">{inst.region} Region</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-slate-900 font-mono text-sm">{inst.totalComplaints}</span>
                    <div className="text-[10px] text-slate-400">{inst.openComplaints} Open</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {inst.rbComplaintsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {inst.pgrcComplaintsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {inst.activeOverlapCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        {inst.activeOverlapCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskBadge(inst.riskRating)}`}>
                      {inst.riskRating}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/institutions/${inst.id}`)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-semibold transition-colors shadow-2xs"
                    >
                      View Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

