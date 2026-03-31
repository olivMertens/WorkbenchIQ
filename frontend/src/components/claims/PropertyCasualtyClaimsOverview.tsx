'use client';

import { useState, useMemo } from 'react';
import {
  Scale,
  Activity,
  Users,
  TrendingUp,
  ListChecks,
  Flag,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Image,
  Film,
} from 'lucide-react';
import type { ApplicationMetadata } from '@/lib/types';
import { getMediaUrl } from '@/lib/api';
import clsx from 'clsx';

interface PropertyCasualtyClaimsOverviewProps {
  application: ApplicationMetadata | null;
}

// Extract a field value from extracted_fields, searching with multiple key patterns
function getFieldValue(extractedFields: Record<string, unknown>, keys: string[], defaultValue: string = ''): string {
  for (const key of keys) {
    if (extractedFields[key] && typeof extractedFields[key] === 'object' && 'value' in (extractedFields[key] as Record<string, unknown>)) {
      const val = (extractedFields[key] as { value: unknown }).value;
      if (val != null && val !== '') return String(val);
    }
    for (const [fk, fv] of Object.entries(extractedFields)) {
      if (fk.endsWith(`:${key}`) && fv && typeof fv === 'object' && 'value' in (fv as Record<string, unknown>)) {
        const val = (fv as { value: unknown }).value;
        if (val != null && val !== '') return String(val);
      }
    }
  }
  return defaultValue;
}

// Detect file type from filename
function getFileTypeInfo(filename: string): { label: string; icon: 'pdf' | 'image' | 'video' | 'document' } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'heic'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'm4v'];
  if (ext === 'pdf') return { label: 'PDF', icon: 'pdf' };
  if (imageExts.includes(ext)) return { label: 'Image', icon: 'image' };
  if (videoExts.includes(ext)) return { label: 'Vidéo', icon: 'video' };
  return { label: ext.toUpperCase() || 'Document', icon: 'document' };
}

// Classify document type based on filename
function classifyDocument(filename: string): { type: string; summary: string } {
  const lower = filename.toLowerCase();
  if (lower.includes('declaration') || lower.includes('sinistre')) {
    return { type: 'Couverture', summary: 'Déclaration de sinistre — document de couverture et circonstances' };
  }
  if (lower.includes('photo') || lower.includes('degat') || lower.includes('dégât') || lower.includes('damage')) {
    return { type: 'Dommages', summary: 'Preuves photographiques des dommages constatés' };
  }
  if (lower.includes('facture') || lower.includes('invoice') || lower.includes('devis')) {
    return { type: 'Réparation', summary: 'Facture ou devis de réparation' };
  }
  if (lower.includes('meteo') || lower.includes('météo') || lower.includes('weather')) {
    return { type: 'Tempête', summary: "Données météorologiques confirmant l'événement climatique" };
  }
  if (lower.includes('souscription') || lower.includes('sante') || lower.includes('santé') || lower.includes('health')) {
    return { type: 'Souscription', summary: 'Dossier de souscription santé — données médicales et risques' };
  }
  if (lower.includes('questionnaire') || lower.includes('medical')) {
    return { type: 'Médical', summary: 'Questionnaire médical — antécédents et déclarations' };
  }
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  if (imageExts.includes(ext)) {
    return { type: 'Dommages', summary: 'Image jointe au dossier — preuve visuelle' };
  }
  if (ext === 'pdf') {
    return { type: 'Document', summary: 'Document PDF joint au dossier' };
  }
  return { type: 'Pièce jointe', summary: 'Document ajouté au dossier' };
}

// Header Strip driven by extracted fields
function HeaderStrip({ application }: { application: ApplicationMetadata | null }) {
  const ef = application?.extracted_fields || {};
  const lineOfBusiness = getFieldValue(ef, ['LineOfBusiness', 'NatureContrat', 'BrancheAssurance'], 'Habitation MRH');
  const causeOfLoss = getFieldValue(ef, ['CauseOfLoss', 'NatureSinistre', 'CauseDuSinistre'], 'Dégâts des eaux / Tempête');
  const insuredName = getFieldValue(ef, ['InsuredName', 'NomAssure', 'NomSouscripteur'], '');
  const paidIndemnity = getFieldValue(ef, ['PaidIndemnity', 'IndemniteVersee'], '—');
  const paidExpense = getFieldValue(ef, ['PaidExpense', 'FraisExpert'], '—');
  const totalIncurred = getFieldValue(ef, ['TotalIncurred', 'MontantEstime', 'MontantTotal'], '—');
  const currentReserve = getFieldValue(ef, ['CurrentReserve', 'ReserveActuelle'], '—');

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div><span className="text-indigo-200 text-xs">Branche :</span> <span className="font-medium">{lineOfBusiness}</span></div>
          <div><span className="text-indigo-200 text-xs">Cause :</span> <span className="font-medium">{causeOfLoss}</span></div>
          {insuredName && <div><span className="text-indigo-200 text-xs">Assuré :</span> <span className="font-medium">{insuredName}</span></div>}
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center"><div className="text-xs text-indigo-200">Indemnisé</div><div className="font-semibold">{paidIndemnity}</div></div>
          <div className="text-center"><div className="text-xs text-indigo-200">Frais d&apos;expert</div><div className="font-semibold">{paidExpense}</div></div>
          <div className="text-center"><div className="text-xs text-indigo-200">Total estimé</div><div className="font-semibold text-amber-300">{totalIncurred}</div></div>
          <div className="text-center"><div className="text-xs text-indigo-200">Réserve</div><div className="font-semibold">{currentReserve}</div></div>
          <span className="px-2.5 py-1 bg-amber-600 rounded-full text-xs font-medium">Sinistre majeur</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded flex items-center gap-1"><Flag className="w-3 h-3" />Convention IRSI</span>
        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded">Cat-Nat possible</span>
        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded">Garantie DDE</span>
      </div>
    </div>
  );
}

// Main Component
export default function PropertyCasualtyClaimsOverview({ application }: PropertyCasualtyClaimsOverviewProps) {
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [expandedSection, setExpandedSection] = useState<string>('liability');

  const ef = application?.extracted_fields || {};
  const llmOutputs = (application?.llm_outputs || {}) as Record<string, unknown>;
  const files = application?.files || [];

  // Build AI summary from LLM outputs
  const aiSummary = useMemo(() => {
    const parts: string[] = [];
    for (const [, subsections] of Object.entries(llmOutputs)) {
      if (subsections && typeof subsections === 'object') {
        for (const [, val] of Object.entries(subsections as Record<string, unknown>)) {
          const sub = val as { parsed?: { summary?: string } } | undefined;
          if (sub?.parsed?.summary) parts.push(sub.parsed.summary);
        }
      }
    }
    return parts.join('\n\n');
  }, [llmOutputs]);

  // Build evidence items from actual uploaded files
  const evidenceItems = useMemo(() => {
    return files.map(f => {
      const classification = classifyDocument(f.filename);
      const fileType = getFileTypeInfo(f.filename);
      return {
        source: f.filename,
        type: classification.type,
        summary: classification.summary,
        supports: true,
        challenges: false,
        fileType,
      };
    });
  }, [files]);

  // Build timeline from files
  const liabilityEvents = useMemo(() => {
    if (files.length === 0) return [{ date: '—', type: 'Attente', desc: 'En attente de traitement des documents', impact: 'neutral' }];
    const createdDate = application?.created_at ? new Date(application.created_at) : new Date();
    const day = createdDate.getDate().toString().padStart(2, '0');
    const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
    return files.map(f => {
      const classification = classifyDocument(f.filename);
      return { date: `${day}/${month}`, type: classification.type, desc: `${f.filename}`, impact: 'supports' };
    });
  }, [files, application]);

  // Build damage items from extracted fields
  const injuries = useMemo(() => {
    const items: { diagnosis: string; related: string }[] = [];
    for (const [key, val] of Object.entries(ef)) {
      const fieldVal = val as { field_name?: string; value?: unknown } | undefined;
      if (!fieldVal || fieldVal.value == null || fieldVal.value === '') continue;
      const name = fieldVal.field_name || key.split(':').pop() || key;
      if (!name.toLowerCase().includes('nom') && !name.toLowerCase().includes('date') && !name.toLowerCase().includes('adresse')) {
        items.push({ diagnosis: `${name}: ${fieldVal.value}`, related: 'Oui' });
      }
    }
    return items.slice(0, 8);
  }, [ef]);

  const tasks = [
    { task: 'Vérifier couverture CG Habitation', due: 'Mar 29' },
    { task: 'Mandater expert si > 5 000€', due: 'Mar 30' },
    { task: 'Appliquer franchise DDE (250€)', due: 'Avr 01' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <HeaderStrip application={application} />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="h-full flex flex-col gap-4">
          
          {/* ROW 1: AI Notes | Extracted Data | Tasks */}
          <div className="grid grid-cols-12 gap-4 min-h-0" style={{ flex: '1 1 35%' }}>
            
            {/* AI Notes */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Notes de responsabilité</span>
                <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-sm">
                {aiSummary ? (
                  <div className="text-slate-600 text-xs whitespace-pre-wrap">{aiSummary}</div>
                ) : (
                  <div className="space-y-2">
                    <div className="border border-slate-200 rounded cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'liability' ? '' : 'liability')}>
                      <div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">Évaluation de responsabilité</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">Événement climatique</span>
                        </div>
                        {expandedSection === 'liability' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                      {expandedSection === 'liability' && (
                        <div className="px-3 pb-2 text-slate-600 text-xs">
                          {"En attente de l'analyse IA. Lancez l'extraction et l'analyse pour obtenir l'évaluation automatique."}
                        </div>
                      )}
                    </div>
                    <div className="border border-slate-200 rounded cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'redflags' ? '' : 'redflags')}>
                      <div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{"Signaux d'alerte"}</span>
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">—</span>
                        </div>
                        {expandedSection === 'redflags' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                      {expandedSection === 'redflags' && (
                        <div className="px-3 pb-2 text-slate-600 text-xs">Aucun signal détecté pour le moment.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Extracted Fields */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Données extraites</span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-xs">
                {Object.keys(ef).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(ef).slice(0, 10).map(([key, val]) => {
                      const fieldVal = val as { field_name?: string; value?: unknown; confidence?: number } | undefined;
                      if (!fieldVal || fieldVal.value == null || fieldVal.value === '') return null;
                      const name = fieldVal.field_name || key.split(':').pop() || key;
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-slate-600 truncate mr-2">{name}</span>
                          <span className="font-medium text-slate-900 text-right flex-shrink-0">{String(fieldVal.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <p>Aucun champ extrait</p>
                    <p className="text-xs mt-1">{"Lancez l'extraction pour analyser les documents"}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tasks */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <ListChecks className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Tâches</span>
                <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{tasks.length - checkedTasks.length} en attente</span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <div className="space-y-2">
                  {tasks.map((t, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={checkedTasks.includes(i)} onChange={() => setCheckedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                      <span className={clsx('flex-1', checkedTasks.includes(i) ? 'text-slate-400 line-through' : 'text-slate-900')}>{t.task}</span>
                      <span className="text-xs text-slate-400">{t.due}</span>
                    </label>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Générer note de règlement
                </button>
              </div>
            </div>
          </div>
          
          {/* ROW 2: Timeline | Damages */}
          <div className="grid grid-cols-12 gap-4 min-h-0" style={{ flex: '1 1 30%' }}>
            <div className="col-span-6 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Chronologie</span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <div className="space-y-2">
                  {liabilityEvents.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="w-10 text-slate-400 flex-shrink-0">{e.date}</div>
                      <div className={clsx('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0', e.impact === 'supports' ? 'bg-emerald-500' : e.impact === 'disputes' ? 'bg-rose-500' : 'bg-slate-300')} />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{e.type}</div>
                        <div className="text-slate-500 truncate">{e.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-span-6 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Dommages constatés</span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                {injuries.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead><tr className="text-slate-500 border-b"><th className="text-left py-1.5 font-normal">Zone / Bien</th><th className="text-left py-1.5 font-normal">Lié au sinistre ?</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {injuries.map((inj, i) => (
                        <tr key={i}>
                          <td className="py-2 text-slate-900">{inj.diagnosis}</td>
                          <td className="py-2"><span className={clsx('px-1.5 py-0.5 rounded text-xs', inj.related === 'Oui' ? 'bg-emerald-100 text-emerald-700' : inj.related === 'Possible' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}>{inj.related}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    <p>Aucun dommage détecté</p>
                    <p className="mt-1">{"Les données seront extraites après l'analyse"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* ROW 3: Evidence from actual files */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden" style={{ flex: '1 1 35%' }}>
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-sm">Pièces & Documents</span>
              <span className="ml-auto text-xs text-slate-500">{evidenceItems.length} pièces</span>
            </div>
            <div className="flex-1 overflow-auto">
              {evidenceItems.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-xs text-slate-500">
                      <th className="px-4 py-2 text-left w-1/4">Document source</th>
                      <th className="px-4 py-2 text-left w-1/6">Type</th>
                      <th className="px-4 py-2 text-center w-1/6">Confirme</th>
                      <th className="px-4 py-2 text-center w-1/6">Contredit</th>
                      <th className="px-4 py-2 text-left">Résumé</th>
                      <th className="px-4 py-2 text-center w-16">Voir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evidenceItems.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-900">
                          <div className="flex items-center gap-2">
                            {item.fileType.icon === 'image' ? <Image className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> :
                             item.fileType.icon === 'video' ? <Film className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" /> :
                             <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />}
                            <span className="truncate">{item.source}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">{item.type}</span></td>
                        <td className="px-4 py-2.5 text-center">{item.supports && <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />}</td>
                        <td className="px-4 py-2.5 text-center">{item.challenges && <CheckCircle className="w-4 h-4 text-rose-500 mx-auto" />}</td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs">{item.summary}</td>
                        <td className="px-4 py-2.5 text-center">
                          {application?.id && (
                            <a href={getMediaUrl(`/api/applications/${application.id}/files/${encodeURIComponent(item.source)}`)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700" title={`Ouvrir ${item.source}`}>
                              <ExternalLink className="w-4 h-4 mx-auto" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>Aucun document uploadé</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
