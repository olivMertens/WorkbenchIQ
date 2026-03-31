'use client';

import {
  FileText,
  Loader2,
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Calendar,
  Hash,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { ApplicationListItem } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface ApplicationsListProps {
  applications: ApplicationListItem[];
  loading: boolean;
  personaPrimaryColor: string;
  getAppDisplayTitle: (app: ApplicationListItem) => string;
  onSelectApp: (appId: string) => void;
}

export default function ApplicationsList({
  applications,
  loading,
  personaPrimaryColor,
  getAppDisplayTitle,
  onSelectApp,
}: ApplicationsListProps) {
  const t = useTranslations('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredApps = applications.filter(app => {
    const search = searchQuery.toLowerCase();
    return (
      app.id.toLowerCase().includes(search) ||
      app.external_reference?.toLowerCase().includes(search) ||
      app.summary_title?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {t('recentApplications')}
          <span className="ml-2 text-sm font-normal text-slate-500">({filteredApps.length})</span>
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder={t('searchCases')} value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
            <button onClick={() => setViewMode('grid')}
              className={clsx("p-1.5 rounded transition-colors", viewMode === 'grid' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={clsx("p-1.5 rounded transition-colors", viewMode === 'list' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">{t('noApplications')}</h3>
          <p className="text-slate-500 mt-1">{t('noApplicationsHint')}</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Dossier</th>
                <th className="px-6 py-3 font-medium text-slate-600">Statut</th>
                <th className="px-6 py-3 font-medium text-slate-600">Créé</th>
                <th className="px-6 py-3 font-medium text-slate-600">Référence</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} onClick={() => onSelectApp(app.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${personaPrimaryColor}10` }}>
                        <FileText className="w-4 h-4" style={{ color: personaPrimaryColor }} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{getAppDisplayTitle(app)}</div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Hash className="w-3 h-3" />{app.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={app.status} processingStatus={app.processing_status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /><span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs">
                    {app.external_reference ? (
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{app.external_reference}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: personaPrimaryColor }}>
                      Open<ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <button key={app.id} onClick={() => onSelectApp(app.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-3 w-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${personaPrimaryColor}10` }}>
                  <FileText className="w-5 h-5" style={{ color: personaPrimaryColor }} />
                </div>
                <StatusBadge status={app.status} processingStatus={app.processing_status} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{getAppDisplayTitle(app)}</h3>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mb-3">
                <Hash className="w-3 h-3" />{app.id.substring(0, 8)}
                {app.external_reference && <><span className="mx-1">•</span><span className="truncate">{app.external_reference}</span></>}
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500 w-full">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{new Date(app.created_at).toLocaleDateString()}</span></div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:text-indigo-500 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
