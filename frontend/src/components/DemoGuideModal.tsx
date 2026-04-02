'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronRight, Upload, MessageSquare, CheckCircle, Search, CloudRain, FileText, Image as ImageIcon, ClipboardList, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

interface Step {
  icon: typeof Upload;
  title: string;
  titleEn: string;
  detail: string;
  detailEn: string;
  tip?: string;
  tipEn?: string;
}

interface Scenario {
  id: string;
  label: string;
  labelEn: string;
  icon: typeof CloudRain;
  color: string;
  summary: string;
  summaryEn: string;
  demoPdf: string;
  steps: Step[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'habitation',
    label: 'Sinistre Habitation',
    labelEn: 'Property Claim',
    icon: CloudRain,
    color: '#2563eb',
    summary: 'Olivier MERTENS LAFFITE (mlo@wine.com) — Tempête Gérard 27/03/2026 — Cave inondée, collection de vins détruite — 10 825 €',
    summaryEn: 'Olivier MERTENS LAFFITE (mlo@wine.com) — Storm Gérard 03/27/2026 — Flooded cellar, wine collection destroyed — €10,825',
    demoPdf: 'assets/demo/declaration-sinistre-habitation.pdf',
    steps: [
      {
        icon: CloudRain,
        title: '1. Sélectionner "Sinistres Habitation"',
        titleEn: '1. Select "Sinistres Habitation"',
        detail: 'Sélecteur de persona → groupe "Sinistres" → "Sinistres Habitation" (icône ☁️ bleue).',
        detailEn: 'Persona selector → "Sinistres" group → "Sinistres Habitation" (blue ☁️).',
        tip: 'Accepte PDF + images. Le RAG cherche dans les polices habitation Groupama.',
        tipEn: 'Accepts PDF + images. RAG searches Groupama habitation policies.',
      },
      {
        icon: Upload,
        title: '2. Uploader les documents',
        titleEn: '2. Upload documents',
        detail: '• declaration-sinistre-habitation.pdf (constat Groupama)\n• Photos de la cave inondée, murs endommagés, bouteilles détruites\n\nCliquer "Traiter maintenant".',
        detailEn: '• declaration-sinistre-habitation.pdf (Groupama claim form)\n• Photos of flooded cellar, damaged walls, broken bottles\n\nClick "Process Now".',
        tip: 'Le PDF est dans assets/demo/. Cherchez des photos libres de droits de caves/dégâts des eaux.',
        tipEn: 'PDF is in assets/demo/. Find free stock photos of flooded cellars/water damage.',
      },
      {
        icon: FileText,
        title: '3. Observer le traitement IA (2-3 min)',
        titleEn: '3. Watch AI processing (2-3 min)',
        detail: '① Document Intelligence → extrait nom, n° police, description\n② Prebuilt Image → analyse les photos de dégâts\n③ GPT-4.1 → évalue le sinistre + cherche polices RAG',
        detailEn: '① Document Intelligence → extracts name, policy #, description\n② Prebuilt Image → analyzes damage photos\n③ GPT-4.1 → evaluates claim + searches RAG policies',
      },
      {
        icon: Search,
        title: '4. Explorer les résultats',
        titleEn: '4. Explore results',
        detail: '• Aperçu → Résumé avec scores de confiance\n• Documents → Vue détaillée par fichier\n• Source Pages → Markdown extrait',
        detailEn: '• Overview → Summary with confidence scores\n• Documents → Per-file detail\n• Source Pages → Extracted markdown',
      },
      {
        icon: MessageSquare,
        title: '5. Ask IQ (Chat RAG)',
        titleEn: '5. Ask IQ (RAG Chat)',
        detail: 'Bouton Ask IQ en bas à droite. Questions suggérées :\n\n→ "Ce sinistre est-il couvert par les CG Habitation ?"\n→ "Quel est le montant de la franchise tempête ?"\n→ "Les vins en cave sont-ils des objets de valeur ?"',
        detailEn: 'Ask IQ button (bottom-right). Suggested questions:\n\n→ "Is this claim covered by the Housing policy?"\n→ "What is the storm deductible?"\n→ "Are wines in a cellar considered valuables?"',
        tip: 'Cliquer "X polices référencées" pour voir les articles cités.',
        tipEn: 'Click "X policies referenced" to see cited articles.',
      },
      {
        icon: CheckCircle,
        title: '6. Décision du gestionnaire',
        titleEn: '6. Adjuster decision',
        detail: 'Approuver / Ajuster / Refuser avec notes.\nEx: "Couvert Art. 3.2 CG Habitation, franchise 250€ déduite."',
        detailEn: 'Approve / Adjust / Deny with notes.\nEx: "Covered per Art. 3.2, €250 deductible applied."',
      },
    ],
  },
  {
    id: 'sante',
    label: 'Souscription Santé',
    labelEn: 'Health Underwriting',
    icon: HeartPulse,
    color: '#006838',
    summary: 'Antoine LEFEVRE, 48 ans, chef cuisinier — Complémentaire Santé Équilibre Plus — HTA contrôlée, ancien fumeur, père diabétique — 127 €/mois',
    summaryEn: 'Antoine LEFEVRE, 48 yo, chef — Complementary Health Equilibre Plus — Controlled hypertension, ex-smoker, father diabetic — €127/mo',
    demoPdf: 'assets/demo/souscription-sante-lefevre.pdf',
    steps: [
      {
        icon: ClipboardList,
        title: '1. Sélectionner "Souscription"',
        titleEn: '1. Select "Souscription"',
        detail: 'Sélecteur de persona → groupe "Souscription" → "Souscription" (icône 📋 verte).',
        detailEn: 'Persona selector → "Souscription" group → "Souscription" (green 📋).',
        tip: 'Le RAG cherche dans les polices de souscription + CG Santé Groupama.',
        tipEn: 'RAG searches underwriting policies + Groupama Health terms.',
      },
      {
        icon: Upload,
        title: '2. Uploader le dossier de souscription',
        titleEn: '2. Upload underwriting file',
        detail: '• souscription-sante-lefevre.pdf (email client + questionnaire de santé)\n• Photo pièce d\'identité (CNI recto/verso)\n• Photo ordonnance médicale (Amlodipine 5mg)\n• Photo résultats analyses sanguines\n\nCliquer "Traiter maintenant".',
        detailEn: '• souscription-sante-lefevre.pdf (client email + health questionnaire)\n• ID card photo (front/back)\n• Medical prescription photo (Amlodipine 5mg)\n• Blood test results photo\n\nClick "Process Now".',
        tip: 'Le PDF est dans assets/demo/. Les images d\'ordonnance et analyses peuvent être générées par IA.',
        tipEn: 'PDF is in assets/demo/. Prescription and lab result images can be AI-generated.',
      },
      {
        icon: FileText,
        title: '3. Observer le traitement IA (2-3 min)',
        titleEn: '3. Watch AI processing (2-3 min)',
        detail: '① Extraction → Champs du questionnaire santé extraits automatiquement\n② Analyse → GPT-4.1 identifie les facteurs de risque :\n   • HTA sous traitement (Amlodipine)\n   • Ancien fumeur (15 PA, arrêt 2021)\n   • IMC 27.2 (surpoids léger)\n   • ATCD paternel diabète type 2\n③ Recherche polices → Conditions Complémentaire Santé Groupama',
        detailEn: '① Extraction → Health questionnaire fields auto-extracted\n② Analysis → GPT-4.1 identifies risk factors:\n   • Hypertension on medication (Amlodipine)\n   • Ex-smoker (15 pack-years, quit 2021)\n   • BMI 27.2 (mild overweight)\n   • Paternal history of type 2 diabetes\n③ Policy search → Groupama Health Insurance terms',
      },
      {
        icon: Search,
        title: '4. Résultats de souscription',
        titleEn: '4. Underwriting results',
        detail: '• Résumé patient → Profil de risque complet\n• Chronologie → Historique médical structuré\n• Body System Map → Vue anatomique des pathologies\n• Source Pages → Questionnaire original avec citations',
        detailEn: '• Patient Summary → Full risk profile\n• Timeline → Structured medical history\n• Body System Map → Anatomical pathology view\n• Source Pages → Original questionnaire with citations',
        tip: 'Cliquer sur une carte Body System pour le deep dive avec sources.',
        tipEn: 'Click a Body System card for deep dive with sources.',
      },
      {
        icon: MessageSquare,
        title: '5. Ask IQ — Questions de souscription',
        titleEn: '5. Ask IQ — Underwriting questions',
        detail: 'Questions suggérées :\n\n→ "Quel est le niveau de risque cardiovasculaire de ce candidat ?"\n→ "L\'HTA sous traitement est-elle un motif de surprime ?"\n→ "Les ATCD familiaux de diabète impactent-ils la souscription ?"\n→ "Quelle formule recommanderiez-vous pour ce profil ?"',
        detailEn: 'Suggested questions:\n\n→ "What is this applicant\'s cardiovascular risk level?"\n→ "Is treated hypertension a surcharge factor?"\n→ "Does family history of diabetes impact underwriting?"\n→ "Which formula would you recommend for this profile?"',
      },
      {
        icon: CheckCircle,
        title: '6. Décision de souscription',
        titleEn: '6. Underwriting decision',
        detail: 'Le souscripteur peut :\n• Accepter en standard (aucune surprime)\n• Accepter avec surprime (ex: +15% pour HTA)\n• Demander examen complémentaire\n• Refuser (exclusion)\n\nNotes : "Accepté avec surprime 10% — HTA contrôlée, risque modéré."',
        detailEn: 'The underwriter can:\n• Accept at standard rate\n• Accept with surcharge (e.g., +15% for hypertension)\n• Request additional exam\n• Decline\n\nNotes: "Accepted with 10% surcharge — controlled hypertension, moderate risk."',
      },
    ],
  },
];

const ALL_STEPS_ICONS = [CloudRain, Upload, FileText, Search, MessageSquare, CheckCircle, ClipboardList, HeartPulse, ImageIcon];

export default function DemoGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
        title="Guide de démonstration"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Démo</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsOpen(false)} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img src="/microsoft-logo-gray.avif" alt="Microsoft" className="h-5 w-auto brightness-0 invert opacity-80" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                {lang === 'fr' ? 'Guide de Démonstration' : 'Demo Guide'}
              </h2>
              <p className="text-sm text-primary-100">
                {lang === 'fr' ? `Démo pour Groupama — ${scenario.label}` : `Demo for Groupama — ${scenario.labelEn}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="px-2 py-1 text-xs font-medium text-primary-100 hover:text-white bg-primary-500/30 rounded"
            >
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-primary-200 hover:text-white rounded-lg hover:bg-primary-500/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scenario Tabs */}
        <div className="flex border-b border-slate-200">
          {SCENARIOS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setScenarioIdx(i); setExpandedStep(0); }}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  scenarioIdx === i
                    ? 'border-b-2 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
                style={scenarioIdx === i ? { borderColor: s.color, color: s.color } : {}}
              >
                <Icon className="w-4 h-4" />
                {lang === 'fr' ? s.label : s.labelEn}
              </button>
            );
          })}
        </div>

        {/* Scenario summary */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 text-sm">
          <p className="font-medium text-amber-800">
            {lang === 'fr' ? 'Scénario :' : 'Scenario:'}
          </p>
          <p className="text-amber-700">
            {lang === 'fr' ? scenario.summary : scenario.summaryEn}
          </p>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {scenario.steps.map((step, i) => {
            const isExpanded = expandedStep === i;
            const Icon = step.icon;
            return (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    isExpanded ? 'bg-primary-50' : 'bg-white hover:bg-slate-50'
                  )}
                >
                  <Icon className={clsx('w-5 h-5 flex-shrink-0', isExpanded ? 'text-primary-600' : 'text-slate-400')} />
                  <span className={clsx('text-sm font-medium flex-1', isExpanded ? 'text-primary-700' : 'text-slate-700')}>
                    {lang === 'fr' ? step.title : step.titleEn}
                  </span>
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-primary-400" />
                    : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-primary-50/50">
                    <p className="text-sm text-slate-600 whitespace-pre-line">
                      {lang === 'fr' ? step.detail : step.detailEn}
                    </p>
                    {(lang === 'fr' ? step.tip : step.tipEn) && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        💡 {lang === 'fr' ? step.tip : step.tipEn}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/microsoft-logo-gray.avif" alt="Microsoft" className="h-3.5 w-auto opacity-50" />
            <span className="text-xs text-slate-400">×</span>
            <img src="/groupama-logo.png" alt="Groupama" className="h-4 w-auto opacity-50" />
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'fr'
              ? `PDF : ${scenario.demoPdf}`
              : `PDF: ${scenario.demoPdf}`}
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            {lang === 'fr' ? 'Compris' : 'Got it'}
          </button>
        </div>
      </div>
    </>
  );
}
