'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { jobLlmApi, recruiterLlmApi, jobsApi, candidatesApi } from '@/lib/api';
import { Job, Candidate } from '@/types/api';
import { handleApiError } from '@/lib/errors';
import Link from 'next/link';

interface ExtractedRequirements {
  job_title: string;
  required_skills: string[];
  preferred_skills: string[];
  education_level: string;
  years_of_experience: number;
  job_description: string;
}

export default function JDMatchmakerPage() {
  const [jdText, setJdText] = useState('');
  const [extracted, setExtracted] = useState<ExtractedRequirements | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summaryCache, setSummaryCache] = useState<Record<string, { headline: string; overall_fit: string; summary_bullets: string[] }>>({});
  const [loadingSummaryFor, setLoadingSummaryFor] = useState<number | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setJobsLoading(true);
      try {
        const list = await jobsApi.list(0, 100);
        setJobs(list);
      } catch (e) {
        setExtractError(handleApiError(e));
      } finally {
        setJobsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedJobId == null) {
      setCandidates([]);
      return;
    }
    setCandidatesLoading(true);
    candidatesApi.list(0, 50)
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setCandidatesLoading(false));
  }, [selectedJobId]);

  const handleExtract = async () => {
    if (!jdText.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtracted(null);
    try {
      const result = await jobLlmApi.extractRequirements(jdText.trim());
      setExtracted(result);
    } catch (e) {
      setExtractError(handleApiError(e));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGetFit = async (candidateId: number) => {
    if (selectedJobId == null) return;
    setLoadingSummaryFor(candidateId);
    try {
      const result = await recruiterLlmApi.resumeSummary(candidateId, selectedJobId);
      setSummaryCache((prev) => ({
        ...prev,
        [candidateId]: {
          headline: result.headline,
          overall_fit: result.overall_fit,
          summary_bullets: result.summary_bullets || [],
        },
      }));
    } catch {
      setSummaryCache((prev) => ({ ...prev, [candidateId]: { headline: 'Error loading', overall_fit: 'weak', summary_bullets: [] } }));
    } finally {
      setLoadingSummaryFor(null);
    }
  };

  const createJobPrefillUrl = () => {
    if (!extracted) return '/hr/postings';
    const params = new URLSearchParams();
    params.set('title', extracted.job_title);
    params.set('required_skills', extracted.required_skills.join(','));
    params.set('preferred_skills', (extracted.preferred_skills || []).join(','));
    params.set('description', extracted.job_description);
    return `/hr/postings?${params.toString()}`;
  };

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">
            JD Analyzer & Matchmaker
          </h1>
          <p className="text-base-content/70">
            Paste a job description to extract requirements, or pick a job to see candidate fit.
          </p>
        </motion.div>

        {/* JD Analyzer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h2 className="card-title text-xl text-base-content flex items-center gap-2">
              <FileText className="w-5 h-5" />
              JD Analyzer
            </h2>
            <textarea
              className="textarea textarea-bordered w-full h-40 font-mono text-sm"
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-primary"
                disabled={!jdText.trim() || isExtracting}
                onClick={handleExtract}
              >
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isExtracting ? ' Extracting...' : ' Extract requirements'}
              </button>
            </div>
            {extractError && (
              <div className="alert alert-error">
                <span>{extractError}</span>
              </div>
            )}
            {extracted && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-base-content">Extracted requirements</h3>
                <p><span className="text-base-content/70">Job title:</span> {extracted.job_title}</p>
                <p><span className="text-base-content/70">Required skills:</span> {(extracted.required_skills || []).join(', ') || '—'}</p>
                <p><span className="text-base-content/70">Preferred skills:</span> {(extracted.preferred_skills || []).join(', ') || '—'}</p>
                <p><span className="text-base-content/70">Education:</span> {extracted.education_level || '—'}</p>
                <p><span className="text-base-content/70">Experience:</span> {extracted.years_of_experience ?? '—'} years</p>
                <p className="text-sm text-base-content/70">{extracted.job_description}</p>
                <Link href={createJobPrefillUrl()} className="btn btn-secondary btn-sm w-fit">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create job from this
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Matchmaker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h2 className="card-title text-xl text-base-content flex items-center gap-2">
              <Users className="w-5 h-5" />
              Matchmaker
            </h2>
            <p className="text-sm text-base-content/70">Select a job to see candidates and their AI fit summary.</p>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Job</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedJobId ?? ''}
                onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select a job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} – {j.company}</option>
                ))}
              </select>
            </div>
            {jobsLoading && <span className="loading loading-spinner loading-sm" />}
            {selectedJobId != null && (
              <div className="mt-4 space-y-3">
                {candidatesLoading ? (
                  <p className="text-base-content/70">Loading candidates...</p>
                ) : candidates.length === 0 ? (
                  <p className="text-base-content/70">No candidates found for this job.</p>
                ) : (
                  <ul className="space-y-2">
                    {candidates.map((c) => (
                      <li key={c.id} className="p-3 bg-base-200 rounded-lg">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-sm text-base-content/70">{c.email}</p>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={loadingSummaryFor === c.id}
                            onClick={() => handleGetFit(c.id)}
                          >
                            {loadingSummaryFor === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Get AI fit'
                            )}
                          </button>
                        </div>
                        {summaryCache[c.id] && (
                          <div className="mt-2 text-sm border-t border-base-300 pt-2">
                            <p className="font-medium">{summaryCache[c.id].headline}</p>
                            <p>Fit: <span className="badge badge-sm">{summaryCache[c.id].overall_fit}</span></p>
                            <ul className="list-disc list-inside mt-1">
                              {summaryCache[c.id].summary_bullets.slice(0, 3).map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
