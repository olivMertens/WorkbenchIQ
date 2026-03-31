'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import type { ApplicationMetadata } from '@/lib/types';
import clsx from 'clsx';

interface PropertyCasualtyClaimsOverviewProps {
  application: ApplicationMetadata | null;
}

function getFieldValue(field: unknown, defaultValue: string = ''): string {
  if (field && typeof field === 'object' && 'value' in field) {
    const val = (field as { value: unknown }).value;
    return val != null && val !== '' ? String(val) : defaultValue;
  }
  return defaultValue;
}

// Compact Header Strip
function HeaderStrip({ application }: { application: ApplicationMetadata | null }) {
  const extractedFields = application?.extracted_fields || {};
  const lineOfBusiness = getFieldValue(extractedFields.LineOfBusiness, 'Habitation MRH');
  const causeOfLoss = getFieldValue(extractedFields.CauseOfLoss, 'Dégâts des eaux / Tempête');
  const insuredName = getFieldValue(extractedFields.InsuredName, 'MERTENS LAFFITE Olivier');
  const paidIndemnity = getFieldValue(extractedFields.PaidIndemnity, '—');
  const paidExpense = getFieldValue(extractedFields.PaidExpense, '—');
  const totalIncurred = getFieldValue(extractedFields.TotalIncurred, '10 825 €');
  const currentReserve = getFieldValue(extractedFields.CurrentReserve, '11 000 €');

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div><span className="text-indigo-200 text-xs">Branche :</span> <span className="font-medium">{lineOfBusiness}</span></div>
          <div><span className="text-indigo-200 text-xs">Cause :</span> <span className="font-medium">{causeOfLoss}</span></div>
          <div><span className="text-indigo-200 text-xs">Assuré :</span> <span className="font-medium">{insuredName}</span></div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center"><div className="text-xs text-indigo-200">Indemnisé</div><div className="font-semibold">{paidIndemnity}</div></div>
          <div className="text-center"><div className="text-xs text-indigo-200">Frais d'expert</div><div className="font-semibold">{paidExpense}</div></div>
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

// Main Component - Horizontal 2-Row Layout
export default function PropertyCasualtyClaimsOverview({ application }: PropertyCasualtyClaimsOverviewProps) {
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [expandedSection, setExpandedSection] = useState<string>('liability');

  const liabilityEvents = [
    { date: '27/03', type: 'Tempête', desc: 'Tempête Gérard — vents 115 km/h (Météo France Bordeaux)', impact: 'supports' },
    { date: '28/03', type: 'Constat', desc: 'Découverte de la cave inondée le matin — 15 cm d\'eau', impact: 'supports' },
    { date: '28/03', type: 'Déclaration', desc: 'Déclaration de sinistre MERTENS LAFFITE — mlo@wine.com', impact: 'supports' },
    { date: '29/03', type: 'Plombier', desc: 'SOS Plomberie Bordeaux — canalisation obstruée dégagée', impact: 'neutral' },
    { date: '29/03', type: 'Photos', desc: 'Photos des dégâts transmises (cave, murs, bouteilles)', impact: 'supports' },
  ];

  const injuries = [
    { diagnosis: 'Cave inondée (15 cm)', noted: '28/03/2026', related: 'Oui', status: 'Constaté' },
    { diagnosis: 'Bouteilles de vin détruites', noted: '28/03/2026', related: 'Oui', status: 'À chiffrer' },
    { diagnosis: 'Moisissures murales', noted: '29/03/2026', related: 'Possible', status: 'En cours' },
    { diagnosis: 'Compteur électrique HS', noted: '28/03/2026', related: 'Oui', status: 'Réparé' },
  ];

  const evidenceItems = [
    { source: 'Déclaration sinistre PDF', type: 'Couverture', supports: true, challenges: false },
    { source: 'Photos dégâts cave', type: 'Dommages', supports: true, challenges: false },
    { source: 'Facture plombier', type: 'Réparation', supports: true, challenges: false },
    { source: 'Données Météo France', type: 'Tempête', supports: true, challenges: false },
  ];

  const tasks = [
    { task: 'Vérifier couverture CG Habitation', due: 'Mar 29' },
    { task: 'Mandater expert si > 5 000€', due: 'Mar 30' },
    { task: 'Appliquer franchise DDE (250€)', due: 'Avr 01' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <HeaderStrip application={application} />
      
      {/* Main Content - 3 Horizontal Rows */}
      <div className="flex-1 overflow-auto p-4">
        <div className="h-full flex flex-col gap-4">
          
          {/* ROW 1: Liability Notes | Damages | Tasks */}
          <div className="grid grid-cols-12 gap-4 min-h-0" style={{ flex: '1 1 35%' }}>
            
            {/* Liability Notes - 4 cols */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Notes de responsabilité</span>
                <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-sm">
                <div className="space-y-2">
                  <div 
                    className="border border-slate-200 rounded cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === 'liability' ? '' : 'liability')}
                  >
                    <div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">Évaluation de responsabilité</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">Événement climatique</span>
                      </div>
                      {expandedSection === 'liability' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                    {expandedSection === 'liability' && (
                      <div className="px-3 pb-2 text-slate-600 text-xs">
                        Tempête Gérard confirmée par Météo France (115 km/h). Infiltration par soupirail ouest. Responsabilité : événement climatique couvert par garantie TGN.
                      </div>
                    )}
                  </div>
                  <div 
                    className="border border-slate-200 rounded cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === 'causation' ? '' : 'causation')}
                  >
                    <div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                      <span className="font-medium text-slate-900">État des lieux & Vétusté</span>
                      {expandedSection === 'causation' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                    {expandedSection === 'causation' && (
                      <div className="px-3 pb-2 text-slate-600 text-xs">
                        Cave en bon état d'entretien avant sinistre. Vétusté des casiers bois : 20%. Bouteilles : valeur d'achat avec justificatifs.
                      </div>
                    )}
                  </div>
                  <div 
                    className="border border-slate-200 rounded cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === 'redflags' ? '' : 'redflags')}
                  >
                    <div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">Signaux d'alerte</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">2</span>
                      </div>
                      {expandedSection === 'redflags' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                    {expandedSection === 'redflags' && (
                      <div className="px-3 pb-2 text-slate-600 text-xs">
                        • Montant des vins élevé (4 880€) — demander factures originales<br/>• Vérifier plafond objets de valeur du contrat
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Damages - 4 cols */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Dommages</span>
              </div>
              <div className="flex-1 overflow-auto p-3 text-xs">
                <div className="space-y-2">
                  <div>
                    <div className="text-slate-500 mb-1">Biens endommagés</div>
                    <div className="flex justify-between"><span className="text-slate-600">Collection de vins</span><span className="font-medium">5 880 €</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Mobilier & équipements</span><span className="font-medium">4 945 €</span></div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-slate-500 mb-1">Estimation IA</div>
                    <div className="flex justify-between"><span className="text-slate-600">Montant total</span><span className="font-semibold text-indigo-600">10 575€ – 11 075€</span></div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-emerald-700 font-medium">Points forts</div>
                    <p className="text-slate-600">Événement Météo France confirmé, photos fournies</p>
                  </div>
                  <div className="pt-1">
                    <div className="text-rose-700 font-medium">Points d'attention</div>
                    <p className="text-slate-600">Montant vins élevé, vérifier plafond OV</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tasks - 4 cols */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <ListChecks className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Tâches</span>
                <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{tasks.length - checkedTasks.length} pending</span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <div className="space-y-2">
                  {tasks.map((t, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={checkedTasks.includes(i)} 
                        onChange={() => setCheckedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" 
                      />
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
          
          {/* ROW 2: Timeline | Injuries */}
          <div className="grid grid-cols-12 gap-4 min-h-0" style={{ flex: '1 1 30%' }}>
            
            {/* Timeline - 6 cols */}
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
                      <div className={clsx('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0',
                        e.impact === 'supports' ? 'bg-emerald-500' :
                        e.impact === 'disputes' ? 'bg-rose-500' : 'bg-slate-300'
                      )} />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{e.type}</div>
                        <div className="text-slate-500">{e.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Injuries - 6 cols */}
            <div className="col-span-6 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-sm">Dommages constatés</span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="text-left py-1.5 font-normal">Zone / Bien</th>
                      <th className="text-left py-1.5 font-normal">Lié au sinistre ?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {injuries.map((inj, i) => (
                      <tr key={i}>
                        <td className="py-2 text-slate-900">{inj.diagnosis}</td>
                        <td className="py-2">
                          <span className={clsx('px-1.5 py-0.5 rounded text-xs',
                            inj.related === 'Oui' ? 'bg-emerald-100 text-emerald-700' :
                            inj.related === 'Possible' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          )}>{inj.related}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* ROW 3: Evidence Matrix - Full Width */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden" style={{ flex: '1 1 35%' }}>
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50 flex-shrink-0">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-900 text-sm">Pièces & Documents</span>
              <span className="ml-auto text-xs text-slate-500">{evidenceItems.length} items</span>
            </div>
            <div className="flex-1 overflow-auto">
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
                      <td className="px-4 py-2.5 text-slate-900">{item.source}</td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('px-2 py-0.5 rounded text-xs',
                          item.type === 'Liability' ? 'bg-indigo-100 text-indigo-700' :
                          item.type === 'Injury' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        )}>{item.type}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {item.supports && <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {item.challenges && <CheckCircle className="w-4 h-4 text-rose-500 mx-auto" />}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs">
                        {item.source === 'Police Report' ? 'Our insured cited for following too closely' :
                         item.source === 'Medical Records' ? 'Pre-existing lumbar condition documented' :
                         item.source === 'Witness Statement' ? 'Confirms claimant sudden lane change' :
                         'Vehicle damage consistent with rear-end collision'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button className="text-indigo-600 hover:text-indigo-700">
                          <ExternalLink className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
