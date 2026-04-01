'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ApplicationListItem, ProcessingState } from './types';

interface DocumentsTabProps {
  applications: ApplicationListItem[];
  loading: boolean;
  error: string | null;
  processing: ProcessingState;
  isProcessing: boolean;
  currentPersona: string;
  onUploadAndProcess: (files: File[], externalRef: string, largeDocMode: 'auto' | 'on' | 'off') => Promise<void>;
  onReprocess: (appId: string, step: 'extract' | 'analyze' | 'prompts-only', sections?: string[]) => Promise<void>;
  onDeleteApp: (appId: string) => Promise<void>;
  onRefresh: () => void;
  onPollResume: (appId: string) => void;
  onDismissProcessing: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function DocumentsTab({
  applications,
  loading,
  error,
  processing,
  isProcessing,
  currentPersona,
  onUploadAndProcess,
  onReprocess,
  onDeleteApp,
  onRefresh,
  onPollResume,
  onDismissProcessing,
  addToast,
}: DocumentsTabProps) {
  const t = useTranslations('adminPanel');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalRef, setExternalRef] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [useLargeDocMode, setUseLargeDocMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [reanalyzeMenuOpen, setReanalyzeMenuOpen] = useState<string | null>(null);

  const isAutomotiveClaimsPersona = currentPersona === 'automotive_claims';
  const isUnderwritingPersona = currentPersona === 'underwriting';
  const isHabitationClaimsPersona = currentPersona === 'habitation_claims';
  const isMultimodalPersona = isAutomotiveClaimsPersona || isHabitationClaimsPersona;

  // Per-persona reanalysis sections
  const getReanalyzeSections = (): string[] => {
    switch (currentPersona) {
      case 'underwriting':
        return ['application_summary', 'medical_summary'];
      case 'habitation_claims':
        return ['damage_assessment', 'liability_assessment', 'payout_recommendation'];
      case 'automotive_claims':
        return ['damage_assessment', 'liability_assessment'];
      case 'life_health_claims':
        return ['clinical_case_notes', 'clinical_timeline', 'benefits_policy'];
      case 'mortgage_underwriting':
        return ['application_summary', 'risk_assessment'];
      default:
        return ['application_summary', 'medical_summary'];
    }
  };

  // Section key → i18n key mapping
  const sectionI18nKey = (section: string): string => {
    return section.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  };

  const getAcceptedFileTypes = () => {
    if (isAutomotiveClaimsPersona) return '.pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.webm';
    if (isHabitationClaimsPersona) return '.pdf,.png,.jpg,.jpeg,.gif,.webp';
    return '.pdf';
  };

  const getAcceptedMimeTypes = () => {
    if (isAutomotiveClaimsPersona) {
      return ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    }
    if (isHabitationClaimsPersona) {
      return ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    }
    return ['application/pdf'];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const acceptedTypes = getAcceptedMimeTypes();
    const files = Array.from(e.dataTransfer.files).filter(f => acceptedTypes.includes(f.type));
    if (files.length > 0) setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const acceptedTypes = getAcceptedMimeTypes();
      const files = Array.from(e.target.files).filter(f => acceptedTypes.includes(f.type));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await onUploadAndProcess(selectedFiles, externalRef, useLargeDocMode);
      setSelectedFiles([]);
      setExternalRef('');
    } catch (err) {
      addToast('error', `Erreur de traitement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      extracted: 'bg-sky-100 text-sky-800',
      completed: 'bg-emerald-100 text-emerald-800',
      error: 'bg-rose-100 text-rose-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('uploadNewApplication')}</h2>
        </div>

        {/* Processing Status */}
        {processing.step !== 'idle' && (
          <div className={`mb-4 p-4 rounded-lg ${
            processing.step === 'error' ? 'bg-rose-50 border border-rose-200' :
            processing.step === 'complete' ? 'bg-emerald-50 border border-emerald-200' :
            'bg-indigo-50 border border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  processing.step === 'uploading' ? 'bg-indigo-500 text-white' :
                  processing.step === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>1</div>
                <div className={`w-12 h-1 rounded ${['extracting', 'analyzing', 'complete'].includes(processing.step) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  processing.step === 'extracting' ? 'bg-indigo-500 text-white' :
                  ['analyzing', 'complete'].includes(processing.step) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>2</div>
                <div className={`w-12 h-1 rounded ${['analyzing', 'complete'].includes(processing.step) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  processing.step === 'analyzing' ? 'bg-indigo-500 text-white' :
                  processing.step === 'complete' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>3</div>
                <div className={`w-12 h-1 rounded ${processing.step === 'complete' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  processing.step === 'complete' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>✓</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <span className={`font-medium ${
                processing.step === 'error' ? 'text-rose-700' :
                processing.step === 'complete' ? 'text-emerald-700' : 'text-indigo-700'
              }`}>{processing.message}</span>
            </div>
            {processing.appId && processing.step === 'complete' && (
              <Link href={`/?id=${processing.appId}`} className="mt-2 inline-block text-sm text-emerald-700 underline hover:text-emerald-800">
                View Application →
              </Link>
            )}
            {processing.step === 'error' && (
              <button onClick={onDismissProcessing} className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline">
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-slate-600">
              <label className="cursor-pointer text-indigo-600 hover:text-indigo-500">
                <span>{isMultimodalPersona ? t('evidenceFiles') : t('uploadFiles')}</span>
                <input type="file" className="sr-only" accept={getAcceptedFileTypes()} multiple onChange={handleFileInput} disabled={isProcessing} />
              </label>
              <span> {t('orDragAndDrop')}</span>
            </div>
            <p className="text-xs text-slate-500">
              {isMultimodalPersona ? t('evidenceFilesDesc') : t('pdfOnly')}
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Selected Files ({selectedFiles.length})</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="text-rose-500 hover:text-rose-700" disabled={isProcessing}>✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* External Reference */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('externalReference')}</label>
          <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder="e.g., Policy number, Case ID" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={isProcessing} />
        </div>

        {/* Condense Context Mode */}
        {isUnderwritingPersona && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <label className="text-sm font-medium text-slate-700">{t('condenseContext')}</label>
            </div>
            <div className="flex gap-2">
              {(['auto', 'on', 'off'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setUseLargeDocMode(mode)} disabled={isProcessing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    useLargeDocMode === mode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {mode === 'auto' ? t('auto') : mode === 'on' ? t('always') : t('never')}
                  {useLargeDocMode === mode && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{t('condenseHelp')}</p>
          </div>
        )}

        {/* Submit Button */}
        <button onClick={handleSubmit} disabled={selectedFiles.length === 0 || isProcessing}
          className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
            selectedFiles.length === 0 || isProcessing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
          {isProcessing ? t('uploadAndProcess') + '...' : t('uploadAndProcess')}
        </button>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('applications')}</h2>
          <button onClick={onRefresh} className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50" disabled={loading}>{t('refresh')}</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">{t('loadingApplications')}</div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500">{error}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">{t('noApplications')}</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {applications.map((app) => (
              <li key={app.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-slate-900">{app.id}</span>
                      {app.processing_status ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          {app.processing_status === 'extracting' ? t('dataAgent') : app.processing_status === 'analyzing' ? t('riskAgent') : app.processing_status}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(app.status)}`}>{app.status}</span>
                      )}
                    </div>
                    {app.external_reference && <p className="text-sm text-slate-500">{t('ref')} {app.external_reference}</p>}
                    {app.created_at && <p className="text-xs text-slate-400">{t('created')} {new Date(app.created_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Resume tracking */}
                    {app.processing_status && (app.processing_status === 'extracting' || app.processing_status === 'analyzing') && (
                      <button onClick={() => onPollResume(app.id)} disabled={processing.appId === app.id}
                        className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors flex items-center gap-1" title="Resume tracking progress">
                        {processing.appId === app.id ? (
                          <><span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>{t('tracking')}</>
                        ) : (
                          <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>{t('resume')}</>
                        )}
                      </button>
                    )}
                    {app.status === 'pending' && !app.processing_status && (
                      <button onClick={() => onReprocess(app.id, 'extract')} disabled={isProcessing} className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 disabled:opacity-50 transition-colors">{t('extract')}</button>
                    )}
                    {app.status === 'extracted' && !app.processing_status && (
                      <button onClick={() => onReprocess(app.id, 'analyze')} disabled={isProcessing} className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 disabled:opacity-50 transition-colors">{t('analyze')}</button>
                    )}
                    {app.status === 'completed' && (
                      <Link href={`/?id=${app.id}`} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">{t('view')}</Link>
                    )}
                    {/* Reanalyze Dropdown */}
                    <div className="relative">
                      <button onClick={() => setReanalyzeMenuOpen(reanalyzeMenuOpen === app.id ? null : app.id)} disabled={isProcessing}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1" title="Reanalyze options">
                        ↻ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {reanalyzeMenuOpen === app.id && (
                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <div className="p-2">
                            <div className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">{t('reanalyzeOptions')}</div>
                            <button onClick={() => { setReanalyzeMenuOpen(null); onReprocess(app.id, 'extract'); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">
                              <div className="font-medium">{t('fullExtraction')}</div>
                              <div className="text-xs text-slate-500">{t('fullExtractionDesc')}</div>
                            </button>
                            <button onClick={() => { setReanalyzeMenuOpen(null); onReprocess(app.id, 'prompts-only'); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">
                              <div className="font-medium">{t('allPromptsOnly')}</div>
                              <div className="text-xs text-slate-500">{t('allPromptsOnlyDesc')}</div>
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <div className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">{t('specificSections')}</div>
                            {getReanalyzeSections().map((section) => (
                              <button key={section} onClick={() => { setReanalyzeMenuOpen(null); onReprocess(app.id, 'prompts-only', [section]); }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md">
                                {t(sectionI18nKey(section))}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Delete */}
                    <button onClick={async () => {
                      if (confirm(`Supprimer le dossier ${app.id} ?`)) {
                        try {
                          await onDeleteApp(app.id);
                          addToast('success', `Dossier ${app.id} supprimé avec succès`);
                        } catch (e) {
                          addToast('error', `Échec de la suppression du dossier ${app.id}: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
                        }
                      }
                    }} className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
