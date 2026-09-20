import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, AlertCircle, Map,
  Search, ArrowRight, ShieldCheck, PlusCircle, Sparkles,
  Building2, Calendar, FileCheck, Eye, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ActionMenu from '../../components/ActionMenu';
import DepartmentParcelCardView from '../../components/DepartmentParcelCardView';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('33TNCHN0000123456');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [inspectedParcel, setInspectedParcel] = useState(null);
  const [allParcels, setAllParcels] = useState([]);

  useEffect(() => {
    fetchApplications();
    loadAllParcels();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/api/applications/citizen');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllParcels = async () => {
    try {
      const res = await api.get('/api/parcels');
      setAllParcels(res.data || []);
      // Default to citizen's own parcel
      if (res.data?.length > 0) {
        setInspectedParcel(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUniversalLookup = async (q = searchQuery) => {
    const term = (q || '').trim();
    if (!term) {
      setSearchError('Please enter a valid ULPIN, Survey Number, or Aadhaar Number');
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      // 1. Try local list search first
      const lower = term.toLowerCase();
      const localMatch = allParcels.find(p =>
        p.ulpin?.toLowerCase().includes(lower) ||
        p.surveyNumber?.toLowerCase().includes(lower) ||
        (p.ownerAadhaarMasked && p.ownerAadhaarMasked.replace(/-/g, '').toLowerCase().includes(lower.replace(/-/g, ''))) ||
        p.ownerName?.toLowerCase().includes(lower)
      );

      if (localMatch) {
        setInspectedParcel(localMatch);
        setSearching(false);
        return;
      }

      // 2. Query backend search
      const res = await api.get(`/api/parcels/search?q=${encodeURIComponent(term)}`);
      if (res.data && res.data.length > 0) {
        setInspectedParcel(res.data[0]);
      } else {
        setSearchError(`No cadastral parcel found matching "${term}". Try ULPIN: 33TNCHN0000123456, Survey: 124/3B, or Aadhaar: 4819`);
      }
    } catch (err) {
      console.error(err);
      setSearchError('Search request failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const pendingCount = applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW', 'FIELD_VERIFICATION'].includes(a.status)).length;
  const approvedCount = applications.filter(a => ['APPROVED', 'COMPLETED'].includes(a.status)).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {t('verified_portal')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('greeting')}, {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('welcome_msg')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/services"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            {t('apply_for_service')}
          </Link>
          <Link
            to="/map"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm flex items-center gap-2 transition active:scale-95"
          >
            <Map className="w-4 h-4 text-blue-300" />
            {t('cadastral_map')}
          </Link>
        </div>
      </div>

      {/* Universal 10-Department Cadastral Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {t('all_10_departments')}
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-2">
              {t('universal_search_title')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('universal_search_desc')}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUniversalLookup();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto"
          >
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('enter_search_placeholder')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {searching ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>{t('search_cadastre')}</span>
            </button>
          </form>
        </div>

        {/* Quick Sample Search Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('quick_search')}</span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('33TNCHN0000123456');
              handleUniversalLookup('33TNCHN0000123456');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-mono transition border border-slate-200"
          >
            {t('ulpin_label')}: 33TNCHN0000123456
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('124/3B');
              handleUniversalLookup('124/3B');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-mono transition border border-slate-200"
          >
            {t('survey_label')}: 124/3B
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('4819');
              handleUniversalLookup('4819');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-mono transition border border-slate-200"
          >
            {t('aadhaar_label')}: XXXX-XXXX-4819
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('89/2A');
              handleUniversalLookup('89/2A');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-mono transition border border-slate-200"
          >
            {t('survey_label')}: 89/2A (Chromepet)
          </button>
        </div>

        {searchError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* 10-Department Card View Result Container */}
      {inspectedParcel && (
        <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-base font-black text-slate-900">
                {t('unified_records_title')}
              </h2>
            </div>
            <button
              onClick={() => setInspectedParcel(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {t('hide_records')}
            </button>
          </div>

          <DepartmentParcelCardView
            parcel={inspectedParcel}
            onClose={() => setInspectedParcel(null)}
            onOpenMap={(p) => navigate(`/map?search=${encodeURIComponent(p.ulpin)}`)}
          />
        </div>
      )}

      {/* My Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('my_applications_title')}</h3>
            <p className="text-xs text-slate-500">{t('my_applications_desc')}</p>
          </div>
          <Link
            to="/applications"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {t('view_all')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading application records...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p>You have not submitted any service applications yet.</p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Browse Government Services Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">{t('col_app_number')}</th>
                  <th className="px-5 py-3">{t('col_service')}</th>
                  <th className="px-5 py-3">{t('col_ulpin')}</th>
                  <th className="px-5 py-3">{t('col_dept')}</th>
                  <th className="px-5 py-3">{t('col_status')}</th>
                  <th className="px-5 py-3">{t('col_applied_date')}</th>
                  <th className="px-5 py-3 text-right">{t('col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-semibold">
                      {app.service?.serviceName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-700">
                      {app.parcel?.ulpin}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.departmentName}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono">
                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionMenu
                        items={[
                          {
                            label: 'View',
                            icon: Eye,
                            iconColor: 'text-blue-600',
                            to: `/applications/${app.id}`
                          },
                          {
                            label: 'Map',
                            icon: MapPin,
                            iconColor: 'text-indigo-600',
                            to: `/map?search=${encodeURIComponent(app.parcel?.ulpin || '')}`
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CitizenDashboard;
