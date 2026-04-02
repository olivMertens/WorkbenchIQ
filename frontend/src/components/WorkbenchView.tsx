'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, ChevronLeft, Loader2, Activity } from 'lucide-react';
import TopNav from '@/components/TopNav';
import PatientHeader from '@/components/PatientHeader';
import PatientSummary from '@/components/PatientSummary';
import LabResultsPanel from '@/components/LabResultsPanel';
import SubstanceUsePanel from '@/components/SubstanceUsePanel';
import FamilyHistoryPanel from '@/components/FamilyHistoryPanel';
import AllergiesPanel from '@/components/AllergiesPanel';
import OccupationPanel from '@/components/OccupationPanel';
import ChronologicalOverview from '@/components/ChronologicalOverview';
import DocumentsPanel from '@/components/DocumentsPanel';
import SourcePagesPanel from '@/components/SourcePagesPanel';
import BatchSummariesPanel from '@/components/BatchSummariesPanel';
import SourceReviewView from '@/components/SourceReviewView';
import LoadingSpinner from '@/components/LoadingSpinner';
import PolicySummaryPanel from '@/components/PolicySummaryPanel';
import PolicyReportModal from '@/components/PolicyReportModal';
import ChatDrawer from '@/components/ChatDrawer';
import BodySystemDeepDiveModal from '@/components/BodySystemDeepDiveModal';
import LifeHealthClaimsOverview from '@/components/claims/LifeHealthClaimsOverview';
import PropertyCasualtyClaimsOverview from '@/components/claims/PropertyCasualtyClaimsOverview';
import AutomotiveClaimsOverview from '@/components/claims/AutomotiveClaimsOverview';
import { MortgageWorkbench } from '@/components/mortgage';
import { usePersona } from '@/lib/PersonaContext';
import { useToast } from '@/lib/ToastProvider';
import { useTranslations } from 'next-intl';
import { getApplication } from '@/lib/api';
import type { ApplicationMetadata, ApplicationListItem } from '@/lib/types';

type ViewType = 'overview' | 'timeline' | 'documents' | 'source';

interface WorkbenchViewProps {
  applicationId: string;
  applications: ApplicationListItem[];
  onBack: () => void;
  onSelectApp: (appId: string) => void;
}

export default function WorkbenchView({ 
  applicationId, 
  applications, 
  onBack,
  onSelectApp 
}: WorkbenchViewProps) {
  const [selectedApp, setSelectedApp] = useState<ApplicationMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isPolicyReportOpen, setIsPolicyReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [sourcePageNumber, setSourcePageNumber] = useState<number | undefined>(undefined);
  const { currentPersona, personaConfig } = usePersona();
  const tw = useTranslations('workbench');
  const { addToast } = useToast();

  // Load application details
  useEffect(() => {
    async function loadApp() {
      if (!applicationId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading application:', applicationId);
        const app = await getApplication(applicationId);
        setSelectedApp(app);
        // Reset view when app changes
        setActiveView('overview');
      } catch (err) {
        console.error('Failed to load application:', err);
        setError('Failed to load application details');
        addToast('error', 'Impossible de charger le dossier');
      } finally {
        setLoading(false);
      }
    }
    
    loadApp();
  }, [applicationId]);

  // Poll for status updates if application is processing
  const lastProcessingTime = useRef(0);
  useEffect(() => {
    if (!selectedApp) return;

    if (selectedApp.processing_status) {
      lastProcessingTime.current = Date.now();
    }

    // Continue polling during processing OR for 8s after it ends (grace period
    // to catch brief null gaps between extraction→analysis transitions)
    const shouldPoll = selectedApp.processing_status ||
                       (lastProcessingTime.current > 0 && Date.now() - lastProcessingTime.current < 8000);
    if (!shouldPoll) return;
    
    const appId = selectedApp.id;
    const interval = setInterval(async () => {
      try {
        const updatedApp = await getApplication(appId);
        if (updatedApp.id !== appId) return;

        // End grace polling after timeout
        if (!updatedApp.processing_status && Date.now() - lastProcessingTime.current >= 8000) {
          clearInterval(interval);
        }

        if (updatedApp.status !== selectedApp.status || updatedApp.processing_status !== selectedApp.processing_status) {
            setSelectedApp(updatedApp);
        }
      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedApp]);

  const renderContent = () => {
    if (!selectedApp) return null;

    switch (activeView) {
      case 'timeline':
        return (
          <div className="flex-1 overflow-auto p-6">
            <ChronologicalOverview application={selectedApp} fullWidth persona={currentPersona} />
          </div>
        );
      case 'documents':
        return (
          <div className="flex-1 overflow-auto p-6">
            <DocumentsPanel files={selectedApp.files || []} applicationId={selectedApp.id} />
          </div>
        );
      case 'source':
        return <SourceReviewView application={selectedApp} initialPage={sourcePageNumber} />;
      case 'overview':
      default:
        if (currentPersona === 'automotive_claims') {
          return (
            <AutomotiveClaimsOverview 
                applicationId={selectedApp.id}
            />
          );
        }
        if (currentPersona === 'life_health_claims') {
          return <LifeHealthClaimsOverview application={selectedApp} />;
        }
        if (currentPersona === 'property_casualty_claims') {
          return <PropertyCasualtyClaimsOverview application={selectedApp} />;
        }
        if (currentPersona === 'habitation_claims') {
          return <PropertyCasualtyClaimsOverview application={selectedApp} />;
        }
        if (currentPersona === 'mortgage') {
          return <MortgageWorkbench applicationId={selectedApp.id} />;
        }
        // Default: Underwriting overview
        return renderUnderwritingOverview();
    }
  };

  const renderUnderwritingOverview = () => {
    if (!selectedApp) return null;
    
    const handleRerunAnalysis = async () => {
      if (!selectedApp) return;
      try {
        const response = await fetch(`/api/applications/${selectedApp.id}/risk-analysis`, {
          method: 'POST',
        });
        if (response.ok) {
           // Reload to get new analysis
           const app = await getApplication(selectedApp.id);
           setSelectedApp(app);
        }
      } catch (err) {
        console.error('Failed to re-run risk analysis:', err);
        addToast('error', tw('riskAnalysisError'));
      }
    };
    
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="relative">
            <div className="pr-[340px]">
              <div className="flex flex-col gap-6">
                <PatientSummary 
                  application={selectedApp} 
                  onPolicyClick={(policyId) => {
                    setIsPolicyReportOpen(true);
                  }}
                  onDeepDive={() => setIsDeepDiveOpen(true)}
                />
                <PolicySummaryPanel
                  application={selectedApp}
                  onViewFullReport={() => setIsPolicyReportOpen(true)}
                  onRiskAnalysisComplete={async () => {
                     const app = await getApplication(selectedApp.id);
                     setSelectedApp(app);
                  }}
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-80">
              <ChronologicalOverview application={selectedApp} persona={currentPersona} />
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-slate-200" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>{tw('evidenceFromDocuments')}</span>
            </div>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <LabResultsPanel application={selectedApp} />
            <SubstanceUsePanel application={selectedApp} />
            <FamilyHistoryPanel application={selectedApp} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <AllergiesPanel application={selectedApp} />
            <OccupationPanel application={selectedApp} />
          </div>
        </div>
        
        <PolicyReportModal
          isOpen={isPolicyReportOpen}
          onClose={() => setIsPolicyReportOpen(false)}
          application={selectedApp}
          onRerunAnalysis={handleRerunAnalysis}
        />
        
        <BodySystemDeepDiveModal
          isOpen={isDeepDiveOpen}
          onClose={() => setIsDeepDiveOpen(false)}
          application={selectedApp}
          onNavigateToPage={(page) => {
            setIsDeepDiveOpen(false);
            setSourcePageNumber(page);
            setActiveView('source');
          }}
          onApplicationUpdate={(app) => {
            setSelectedApp(app);
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-white">
        <TopNav 
          applications={applications}
          selectedAppId={selectedApp?.id}
          selectedApp={selectedApp || undefined}
          activeView={activeView}
          onSelectApp={onSelectApp}
          onChangeView={setActiveView}
          showWorkbenchControls={true}
        />
        
        {/* Back Button / Breadcrumb */}
        <div className="border-b border-slate-200 px-6 py-2 flex items-center bg-white/95 backdrop-blur-sm">
            <button 
                onClick={onBack}
                className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour au tableau de bord
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-700 truncate max-w-md">
                {selectedApp?.external_reference || selectedApp?.id || 'Détails du dossier'}
            </span>
             {loading && <span className="ml-3 text-xs text-slate-400 animate-pulse">Chargement...</span>}
        </div>
      </div>

      <main className="flex flex-col flex-1 relative" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
                 <div className="text-center text-rose-600 bg-white p-6 rounded-xl shadow-sm border border-rose-100">
                    <p>{error}</p>
                    <button onClick={onBack} className="mt-4 text-sm text-slate-500 hover:text-indigo-600 underline">{tw('returnToList')}</button>
                 </div>
            </div>
          ) : selectedApp ? (
            <>
               {/* Processing progress banner — always mounted, hidden via CSS transition */}
               <div className={`border-b px-6 flex items-center gap-3 transition-all duration-300 overflow-hidden ${
                 selectedApp.processing_status
                   ? selectedApp.processing_status === 'analyzing'
                     ? 'max-h-14 py-3 opacity-100 bg-violet-50 border-violet-200'
                     : 'max-h-14 py-3 opacity-100 bg-sky-50 border-sky-200'
                   : 'max-h-0 py-0 opacity-0 border-transparent'
               }`}>
                   {selectedApp.processing_status === 'analyzing' ? (
                     <Activity className="w-4 h-4 text-violet-600 animate-pulse flex-shrink-0" />
                   ) : (
                     <Loader2 className="w-4 h-4 text-sky-600 animate-spin flex-shrink-0" />
                   )}
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                     <span className={`text-sm font-medium ${
                       selectedApp.processing_status === 'analyzing' ? 'text-violet-700' : 'text-sky-700'
                     }`}>
                       {selectedApp.processing_status === 'extracting'
                         ? "Agent d'extraction en cours"
                         : "Agent d'analyse en cours"}
                     </span>
                     <span className="flex gap-1 ml-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                     </span>
                   </div>
                   <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{tw('live')}</span>
               </div>
               {currentPersona === 'underwriting' && <PatientHeader application={selectedApp} />}
               {renderContent()}
            </>
          ) : null}
      </main>

      {selectedApp && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onOpen={() => setIsChatOpen(true)}
          applicationId={selectedApp.id}
          persona={currentPersona}
        />
      )}
    </div>
  );
}
