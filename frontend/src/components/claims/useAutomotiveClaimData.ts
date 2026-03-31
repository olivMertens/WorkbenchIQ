'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ClaimAssessmentResponse,
  MediaItem,
  Keyframe,
  AdjusterDecisionRequest,
  getClaimAssessment,
  getClaimMedia,
  getVideoKeyframes,
  updateAdjusterDecision,
  uploadClaimFiles,
  searchClaimsPolicies,
  ClaimsPolicySearchResult,
} from '@/lib/api';

export default function useAutomotiveClaimData(applicationId: string) {
  const [assessment, setAssessment] = useState<ClaimAssessmentResponse | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [policyResults, setPolicyResults] = useState<ClaimsPolicySearchResult[]>([]);
  const [policyQuery, setPolicyQuery] = useState('');
  const [isSearchingPolicies, setIsSearchingPolicies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [adjustedAmount, setAdjustedAmount] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const fetchClaimData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const [assessmentData, mediaData] = await Promise.all([
        getClaimAssessment(applicationId),
        getClaimMedia(applicationId),
      ]);
      setAssessment(assessmentData);
      setMediaItems(mediaData.media_items);

      const firstVideo = mediaData.media_items.find((m) => m.media_type === 'video');
      if (firstVideo) {
        setSelectedVideoId(firstVideo.media_id);
        const keyframeData = await getVideoKeyframes(applicationId, firstVideo.media_id);
        setKeyframes(keyframeData.keyframes);
        setVideoDuration(keyframeData.duration);
      }
    } catch (err) {
      console.error('Failed to fetch claim data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load claim data');
    } finally {
      setIsRefreshing(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchClaimData();
  }, [fetchClaimData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      await uploadClaimFiles(applicationId, Array.from(files));
      await fetchClaimData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePolicySearch = async () => {
    if (!policyQuery.trim()) return;
    setIsSearchingPolicies(true);
    try {
      const results = await searchClaimsPolicies({ query: policyQuery, limit: 10 });
      setPolicyResults(results.results);
    } catch (err) {
      console.error('Failed to search policies:', err);
    } finally {
      setIsSearchingPolicies(false);
    }
  };

  const handleDecision = async (
    decision: 'approve' | 'adjust' | 'deny' | 'investigate',
    callbacks?: { onApprove?: () => void; onAdjust?: () => void; onDeny?: () => void; onInvestigate?: () => void }
  ) => {
    try {
      const request: AdjusterDecisionRequest = {
        decision,
        notes: decisionNotes || undefined,
        adjusted_amount: decision === 'adjust' ? adjustedAmount : undefined,
      };
      await updateAdjusterDecision(applicationId, request);
      await fetchClaimData();
      switch (decision) {
        case 'approve': callbacks?.onApprove?.(); break;
        case 'adjust': callbacks?.onAdjust?.(); break;
        case 'deny': callbacks?.onDeny?.(); break;
        case 'investigate': callbacks?.onInvestigate?.(); break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    }
  };

  const images = mediaItems.filter((m) => m.media_type === 'image');
  const videos = mediaItems.filter((m) => m.media_type === 'video');
  const documents = mediaItems.filter((m) => m.media_type === 'document');
  const selectedVideo = mediaItems.find((m) => m.media_id === selectedVideoId);

  const getRiskLevel = (severity: string | undefined) => {
    const s = (severity || '').toLowerCase();
    if (s.includes('high') || s.includes('severe') || s.includes('heavy'))
      return { label: 'High', bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200' };
    if (s.includes('moderate') || s.includes('medium'))
      return { label: 'Moderate', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' };
    return { label: 'Low', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' };
  };

  return {
    assessment, mediaItems, keyframes, videoDuration, selectedVideoId, selectedVideo,
    policyResults, policyQuery, isSearchingPolicies, isRefreshing, isUploading,
    decisionNotes, adjustedAmount, error,
    images, videos, documents,
    severityInfo: getRiskLevel(assessment?.overall_severity),
    setPolicyQuery, setDecisionNotes, setAdjustedAmount, setError,
    fetchClaimData, handleFileUpload, handlePolicySearch, handleDecision,
    setPolicyResults,
  };
}
