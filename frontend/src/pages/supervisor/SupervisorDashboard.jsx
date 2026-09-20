import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, UserCheck,
  Building, MapPin, Eye, FileCheck, ArrowRight, X, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ActionMenu from '../../components/ActionMenu';

export const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [fieldOfficers, setFieldOfficers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalApp, setAssignModalApp] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('Please conduct on-site physical survey and verify boundary stones 1 to 4.');
  const [decisionModalApp, setDecisionModalApp] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVED'); // APPROVED or REJECTED
  const [decisionRemarks, setDecisionRemarks] = useState('Field verification report and cadastral coordinates verified compliant with revenue records.');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedStatus]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/api/supervisor/stats');
      setStats(statsRes.data);

      const statusParam = selectedStatus !== 'ALL' ? `?status=${selectedStatus}` : '';
      const appsRes = await api.get(`/api/applications/supervisor${statusParam}`);
      setApplications(appsRes.data || []);

      // Fetch department field officers with fallback to all field staff
      let officers = [];
      if (user?.departmentId) {
        try {
          const officersRes = await api.get(`/api/admin/departments/${user.departmentId}/officers`);
          officers = officersRes.data || [];
        } catch {
          // Handled silently
        }
      }
      if (officers.length === 0) {
        try {
          const allStaffRes = await api.get('/api/admin/staff');
          officers = (allStaffRes.data || []).filter(s => s.role === 'FIELD_OFFICER');
        } catch {
          // Handled silently
        }
      }
      setFieldOfficers(officers);
      if (officers.length > 0) {
        setSelectedOfficerId(officers[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    if (!assignModalApp || !selectedOfficerId) return;
    setActionLoading(true);
    try {
      await api.post(`/api/applications/${assignModalApp.id}/assign-officer`, {
        fieldOfficerId: parseInt(selectedOfficerId),
        supervisorRemarks: assignRemarks,
      });
      setAssignModalApp(null);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign officer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    if (!decisionModalApp) return;
    setActionLoading(true);
    try {
      await api.put(`/api/applications/${decisionModalApp.id}/status`, {
        status: decisionType,
        remarks: decisionRemarks,
        rejectionReason: decisionType === 'REJECTED' ? decisionRemarks : null,
      });
      setDecisionModalApp(null);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit decision');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Department Supervisor Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {stats?.departmentName || user?.departmentName || 'Revenue Department'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Scrutinize incoming land service requests, deploy cadastral field surveyors, and grant statutory approvals.
          </p>
        </div>

        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
          <p className="text-2xl font-bold font-mono text-purple-300">{stats?.totalDepartmentApplications || 0}</p>
          <p className="text-[11px] text-slate-300">Department Applications</p>
        </div>
      </div>

      {/* Status Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <button
          onClick={() => setSelectedStatus('SUBMITTED')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'SUBMITTED' ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">New Inbound</span>
          <span className="text-xl font-bold text-blue-700 font-mono mt-1 block">{stats?.submittedCount || 0}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('UNDER_REVIEW')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'UNDER_REVIEW' ? 'bg-amber-50 border-amber-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Under Scrutiny</span>
          <span className="text-xl font-bold text-amber-700 font-mono mt-1 block">{stats?.underReviewCount || 0}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('FIELD_VERIFICATION')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'FIELD_VERIFICATION' ? 'bg-purple-50 border-purple-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">In Field Survey</span>
          <span className="text-xl font-bold text-purple-700 font-mono mt-1 block">{stats?.fieldVerificationCount || 0}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('VERIFIED')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'VERIFIED' ? 'bg-teal-50 border-teal-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Site Verified</span>
          <span className="text-xl font-bold text-teal-700 font-mono mt-1 block">{stats?.verifiedCount || 0}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-medium block">Approved</span>
          <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block">{stats?.approvedCount || 0}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            selectedStatus === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] opacity-70 font-medium block">All Cases</span>
          <span className="text-xl font-bold font-mono mt-1 block">{applications.length}</span>
        </button>
      </div>

      {/* Applications Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department Application Pipeline ({selectedStatus === 'ALL' ? 'All' : selectedStatus})
            </h3>
            <p className="text-xs text-slate-500">
              Inspect submitted dossiers, assign officers, and render statutory decisions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading queue...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applications found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">App Number</th>
                  <th className="px-5 py-3">Citizen</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Parcel ULPIN</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned Officer</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{app.citizenName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{app.citizenMobile || app.citizenEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-semibold">
                      {app.service?.serviceName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-700">
                      <Link to={`/map?search=${app.parcel?.ulpin}`} className="hover:underline flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {app.parcel?.ulpin}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.fieldOfficerName ? (
                        <span className="font-medium text-teal-800">{app.fieldOfficerName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionMenu
                        items={[
                          ...((app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') ? [{
                            label: 'Assign',
                            icon: UserCheck,
                            iconColor: 'text-purple-600',
                            onClick: () => setAssignModalApp(app)
                          }] : []),
                          ...((app.status === 'VERIFIED' || app.status === 'SUPERVISOR_REVIEW') ? [{
                            label: 'Review',
                            icon: CheckCircle2,
                            iconColor: 'text-emerald-600',
                            onClick: () => setDecisionModalApp(app)
                          }] : []),
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

      {/* Assign Field Officer Modal */}
      {assignModalApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Assign Cadastral Field Officer</h3>
                <p className="text-[11px] text-purple-200">Application: {assignModalApp.applicationNumber}</p>
              </div>
              <button onClick={() => setAssignModalApp(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignOfficer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Field Inspection Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {fieldOfficers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.fullName} ({off.designation || 'Cadastral Surveyor'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Instructions / Inspection Order
                </label>
                <textarea
                  rows={3}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {actionLoading ? 'Assigning...' : 'Dispatch Field Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Approve / Reject Modal */}
      {decisionModalApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Supervisory Final Determination</h3>
                <p className="text-[11px] text-slate-300">Application: {decisionModalApp.applicationNumber}</p>
              </div>
              <button onClick={() => setDecisionModalApp(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDecision} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <p className="font-bold text-teal-900">Field Inspection Result:</p>
                <p className="text-teal-800 mt-0.5">
                  Result: <strong>{decisionModalApp.fieldVerification?.verificationResult || 'VERIFIED_COMPLIANT'}</strong>
                </p>
                <p className="text-slate-600 italic text-[11px] mt-1">
                  "{decisionModalApp.fieldVerification?.remarks || 'Physical coordinates match revenue records without encroachment.'}"
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Action Determination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${decisionType === 'APPROVED' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={decisionType === 'APPROVED'}
                      onChange={() => setDecisionType('APPROVED')}
                    />
                    Approve & Issue Certificate
                  </label>
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${decisionType === 'REJECTED' ? 'bg-red-50 border-red-500 font-bold text-red-800' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={decisionType === 'REJECTED'}
                      onChange={() => setDecisionType('REJECTED')}
                    />
                    Reject Application
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supervisory Order & Remarks
                </label>
                <textarea
                  rows={3}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-md transition ${
                    decisionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  }`}
                >
                  {actionLoading ? 'Processing...' : `Confirm ${decisionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupervisorDashboard;
