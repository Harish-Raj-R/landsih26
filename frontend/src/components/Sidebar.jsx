import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building, FileText, ClipboardList,
  Map, ShieldCheck, History, CheckSquare, Bell, UserCircle,
  FileCheck, Sparkles, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const role = user.role;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">

        {/* User Identity Snippet */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{t('active_workspace')}</p>
          <p className="text-xs font-bold text-slate-900 mt-1 truncate">{user.fullName}</p>
          <p className="text-[11px] text-blue-700 font-medium truncate">
            {t('role_' + role.toLowerCase())} {user.departmentName ? `• ${user.departmentName}` : ''}
          </p>
        </div>

        {/* Dynamic Navigation according to Role */}
        <nav className="space-y-1">

          {/* ADMIN NAV */}
          {role === 'ADMIN' && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <NavLink to="/admin" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Executive Analytics
              </NavLink>
              <NavLink to="/admin/staff" className={linkClass}>
                <Users className="w-4 h-4" />
                Staff Management
              </NavLink>
              <NavLink to="/admin/departments" className={linkClass}>
                <Building className="w-4 h-4" />
                Departments
              </NavLink>
              <NavLink to="/admin/services" className={linkClass}>
                <FileText className="w-4 h-4" />
                Service Catalog
              </NavLink>
              <NavLink to="/admin/audit-logs" className={linkClass}>
                <History className="w-4 h-4" />
                System Audit Logs
              </NavLink>
            </>
          )}

          {/* SUPERVISOR NAV */}
          {role === 'DEPARTMENT_SUPERVISOR' && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Department Operations
              </div>
              <NavLink to="/supervisor" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/supervisor/applications" className={linkClass}>
                <ClipboardList className="w-4 h-4" />
                All Applications
              </NavLink>
            </>
          )}

          {/* FIELD OFFICER NAV */}
          {role === 'FIELD_OFFICER' && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cadastral Inspections
              </div>
              <NavLink to="/field" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/field/assignments" className={linkClass}>
                <CheckSquare className="w-4 h-4" />
                Assigned Inspections
              </NavLink>
            </>
          )}

          {/* CITIZEN NAV */}
          {role === 'CITIZEN' && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('citizen_portal')}
              </div>
              <NavLink to="/dashboard" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                {t('dashboard')}
              </NavLink>
              <NavLink to="/applications" className={linkClass}>
                <ClipboardList className="w-4 h-4" />
                {t('my_applications')}
              </NavLink>
              <NavLink to="/services" className={linkClass}>
                <FileCheck className="w-4 h-4" />
                {t('apply_services')}
              </NavLink>
            </>
          )}

          {/* Cadastral Tools */}
          <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('cadastral_tools')}
          </div>
          <NavLink to="/map" className={linkClass}>
            <Map className="w-4 h-4" />
            {t('cadastral_map')}
          </NavLink>
        </nav>
      </div>

      {/* Footer info pill */}
      <div className="pt-4 border-t border-slate-200">
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-blue-900">Digital Public Infrastructure</p>
            <p className="text-[10px] text-blue-700 mt-0.5">ULPIN-Centric Land Stack</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
