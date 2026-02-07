'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Briefcase, MapPin, Star, Download, Mail, Phone, X, FileText, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { candidatesApi, resumeApi, jobsApi, atsApi, badgesApi, messagesApi } from '@/lib/api';
import { Candidate, EvaluationResponse, Job, CandidateBadge } from '@/types/api';
import BadgeList from '@/components/student/BadgeList';
import { ApiException } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CandidatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [prescreenedOnly, setPrescreenedOnly] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEvaluationsModal, setShowEvaluationsModal] = useState(false);
  const [showCreateEvaluationModal, setShowCreateEvaluationModal] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isCreatingEvaluation, setIsCreatingEvaluation] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);
  const [createEvaluationError, setCreateEvaluationError] = useState<string | null>(null);
  const [candidateBadges, setCandidateBadges] = useState<CandidateBadge[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await candidatesApi.list(0, 100, prescreenedOnly ? true : undefined);
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError('Failed to fetch candidates. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [prescreenedOnly]);

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true);
      setCreateEvaluationError(null);
      const data = await jobsApi.list();
      setJobs(data);
      if (data.length === 0) {
        setCreateEvaluationError('No jobs available. Please create a job posting first.');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err instanceof ApiException) {
        setCreateEvaluationError(`Failed to fetch jobs: ${err.message}`);
      } else {
        setCreateEvaluationError('Failed to fetch jobs. Please try again.');
      }
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter((candidate) => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      (candidate.skills_json || []).some((skill) =>
        skill.toLowerCase().includes(query)
      )
    );
  });

  // Handle View Profile
  const handleViewProfile = async (candidate: Candidate) => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      setSelectedCandidate(candidate);
      const [profile, badges] = await Promise.all([
        candidatesApi.get(candidate.id),
        badgesApi.getCandidateBadges(candidate.id).catch(() => []),
      ]);
      setSelectedCandidate(profile);
      setCandidateBadges(badges);
      setShowProfileModal(true);
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err instanceof ApiException) {
        setProfileError(err.message);
      } else {
        setProfileError('Failed to fetch profile. Please try again.');
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle View Evaluations
  const handleViewEvaluations = async (candidate: Candidate) => {
    try {
      setIsLoadingEvaluations(true);
      setEvaluationsError(null);
      setSelectedCandidate(candidate);
      const evals = await candidatesApi.getEvaluations(candidate.id);
      setEvaluations(evals);
      setShowEvaluationsModal(true);
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      if (err instanceof ApiException) {
        setEvaluationsError(err.message);
      } else {
        setEvaluationsError('Failed to fetch evaluations. Please try again.');
      }
    } finally {
      setIsLoadingEvaluations(false);
    }
  };

  // Handle Download Resume
  const handleDownloadResume = async (candidate: Candidate) => {
    if (!candidate.resume_id) {
      setError('Resume not available for this candidate.');
      return;
    }

    try {
      const filename = `${candidate.name.replace(/\s+/g, '_')}_resume.txt`;
      await resumeApi.download(candidate.resume_id, filename);
    } catch (err) {
      console.error('Error downloading resume:', err);
      if (err instanceof ApiException) {
        setError(`Failed to download resume: ${err.message}`);
      } else {
        setError('Failed to download resume. Please try again.');
      }
    }
  };

  // Handle Create Evaluation
  const handleCreateEvaluation = async (candidate: Candidate) => {
    if (!candidate.resume_id) {
      setError('Candidate does not have a resume uploaded.');
      return;
    }
    setSelectedCandidate(candidate);
    setSelectedJobId(null);
    setCreateEvaluationError(null);
    setShowCreateEvaluationModal(true);
    // Fetch jobs when modal opens to ensure fresh data
    await fetchJobs();
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedCandidate || !selectedJobId) {
      setCreateEvaluationError('Please select a job');
      return;
    }

    try {
      setIsCreatingEvaluation(true);
      setCreateEvaluationError(null);
      const evaluation = await atsApi.createEvaluation(selectedCandidate.id, selectedJobId);
      
      // Refresh evaluations list
      if (showEvaluationsModal) {
        const evals = await candidatesApi.getEvaluations(selectedCandidate.id);
        setEvaluations(evals);
      }
      
      // Close modal and show success
      setShowCreateEvaluationModal(false);
      setSelectedJobId(null);
      setError(null);
      
      // Optionally refresh candidates to show updated evaluation count
      fetchCandidates();
      
      // Show success message
      alert(`Evaluation created successfully! Score: ${evaluation.ats_score.toFixed(1)}%`);
    } catch (err) {
      console.error('Error creating evaluation:', err);
      if (err instanceof ApiException) {
        setCreateEvaluationError(err.message);
      } else {
        setCreateEvaluationError('Failed to create evaluation. Please try again.');
      }
    } finally {
      setIsCreatingEvaluation(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">Candidates</h1>
        <p className="text-base-content/70">Browse and filter candidate profiles</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
            <label className="label cursor-pointer gap-2 border border-base-300 rounded-lg px-4 py-2 bg-base-200/50">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={prescreenedOnly}
                onChange={(e) => setPrescreenedOnly(e.target.checked)}
              />
              <span className="label-text">Pre-screened only</span>
            </label>
            <button className="btn btn-outline">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error"
        >
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchCandidates}>
            Retry
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Candidates List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body text-center py-12">
                <p className="text-base-content/70">
                  {searchQuery
                    ? 'No candidates found matching your search.'
                    : 'No candidates available.'}
                </p>
              </div>
            </motion.div>
          ) : (
            filteredCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-16">
                          <span className="text-xl">{candidate.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-base-content">
                            {candidate.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/70 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.email}</span>
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{candidate.phone}</span>
                            </div>
                          )}
                        </div>
                        {candidate.skills_json && candidate.skills_json.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {candidate.skills_json.map((skill) => (
                              <div key={skill} className="badge badge-outline">
                                {skill}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-base-content/60">
                          <span>
                            Created: {new Date(candidate.created_at).toLocaleDateString()}
                          </span>
                          {candidate.resume_id && (
                            <span className="badge badge-success badge-sm">Resume Available</span>
                          )}
                          {candidate.is_verified && (
                            <span className="badge badge-info badge-sm">TPO Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewProfile(candidate)}
                        disabled={isLoadingProfile}
                      >
                        {isLoadingProfile ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'View Profile'
                        )}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewEvaluations(candidate)}
                        disabled={isLoadingEvaluations}
                      >
                        {isLoadingEvaluations ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'View Evaluations'
                        )}
                      </button>
                      <button 
                        className="btn btn-accent btn-sm"
                        onClick={() => handleCreateEvaluation(candidate)}
                        disabled={!candidate.resume_id}
                        title={!candidate.resume_id ? 'Candidate needs a resume to create evaluation' : ''}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Create Evaluation
                      </button>
                      {candidate.resume_id && (
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDownloadResume(candidate)}
                        >
                          <Download className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedCandidate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Candidate Profile</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedCandidate(null);
                  setProfileError(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileError ? (
              <div className="alert alert-error mb-4">
                <span>{profileError}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-20">
                      <span className="text-2xl">{selectedCandidate.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xl font-bold">{selectedCandidate.name}</h4>
                      {selectedCandidate.is_verified && (
                        <span className="badge badge-info badge-sm">TPO Verified</span>
                      )}
                    </div>
                    <p className="text-base-content/70">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <p className="text-base-content/70">{selectedCandidate.email}</p>
                  </div>
                  {selectedCandidate.phone && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Phone</span>
                      </label>
                      <p className="text-base-content/70">{selectedCandidate.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Candidate ID</span>
                    </label>
                    <p className="text-base-content/70">{selectedCandidate.id}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">User ID</span>
                    </label>
                    <p className="text-base-content/70">{selectedCandidate.user_id}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Created At</span>
                    </label>
                    <p className="text-base-content/70">
                      {new Date(selectedCandidate.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedCandidate.resume_id && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Resume ID</span>
                      </label>
                      <p className="text-base-content/70">{selectedCandidate.resume_id}</p>
                    </div>
                  )}
                </div>

                {candidateBadges.length > 0 && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Skill Badges</span>
                    </label>
                    <BadgeList badges={candidateBadges} />
                  </div>
                )}

                {selectedCandidate.skills_json && selectedCandidate.skills_json.length > 0 && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Skills</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills_json.map((skill) => (
                        <div key={skill} className="badge badge-outline badge-lg">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-primary gap-2"
                disabled={messageLoading}
                onClick={async () => {
                  if (!selectedCandidate) return;
                  setMessageLoading(true);
                  try {
                    const conv = await messagesApi.createConversation({ candidate_id: selectedCandidate.id });
                    setShowProfileModal(false);
                    setSelectedCandidate(null);
                    router.push(`/hr/messages/${conv.id}`);
                  } catch (err) {
                    setProfileError(err instanceof ApiException ? err.message : 'Failed to start conversation');
                  } finally {
                    setMessageLoading(false);
                  }
                }}
              >
                {messageLoading ? <span className="loading loading-spinner loading-sm" /> : <Mail className="w-4 h-4" />}
                Message
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedCandidate(null);
                  setProfileError(null);
                  setCandidateBadges([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowProfileModal(false);
            setSelectedCandidate(null);
            setProfileError(null);
            setCandidateBadges([]);
          }}></div>
        </div>
      )}

      {/* Evaluations Modal */}
      {showEvaluationsModal && selectedCandidate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Evaluations for {selectedCandidate.name}</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowEvaluationsModal(false);
                  setSelectedCandidate(null);
                  setEvaluations([]);
                  setEvaluationsError(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evaluationsError ? (
              <div className="alert alert-error mb-4">
                <span>{evaluationsError}</span>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base-content/70">No evaluations found for this candidate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="card bg-base-200 shadow-md">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold">Evaluation #{evaluation.id}</h4>
                          <p className="text-sm text-base-content/70">
                            Application ID: {evaluation.application_id}
                          </p>
                          <p className="text-sm text-base-content/70">
                            {new Date(evaluation.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(evaluation.ats_score)}`}>
                            {evaluation.ats_score.toFixed(1)}%
                          </div>
                          {evaluation.passed ? (
                            <div className="badge badge-success gap-1 mt-1">
                              <CheckCircle className="w-3 h-3" />
                              Passed
                            </div>
                          ) : (
                            <div className="badge badge-error gap-1 mt-1">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {evaluation.skill_match_score !== undefined && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Skill Match</span>
                              <span className={`text-sm font-semibold ${getScoreColor(evaluation.skill_match_score)}`}>
                                {evaluation.skill_match_score.toFixed(1)}%
                              </span>
                            </div>
                            <progress
                              className="progress progress-primary w-full"
                              value={evaluation.skill_match_score}
                              max="100"
                            />
                          </div>
                        )}
                        {evaluation.education_score !== undefined && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Education</span>
                              <span className={`text-sm font-semibold ${getScoreColor(evaluation.education_score)}`}>
                                {evaluation.education_score.toFixed(1)}%
                              </span>
                            </div>
                            <progress
                              className="progress progress-primary w-full"
                              value={evaluation.education_score}
                              max="100"
                            />
                          </div>
                        )}
                        {evaluation.experience_score !== undefined && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Experience</span>
                              <span className={`text-sm font-semibold ${getScoreColor(evaluation.experience_score)}`}>
                                {evaluation.experience_score.toFixed(1)}%
                              </span>
                            </div>
                            <progress
                              className="progress progress-primary w-full"
                              value={evaluation.experience_score}
                              max="100"
                            />
                          </div>
                        )}
                        {evaluation.keyword_match_score !== undefined && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Keyword Match</span>
                              <span className={`text-sm font-semibold ${getScoreColor(evaluation.keyword_match_score)}`}>
                                {evaluation.keyword_match_score.toFixed(1)}%
                              </span>
                            </div>
                            <progress
                              className="progress progress-primary w-full"
                              value={evaluation.keyword_match_score}
                              max="100"
                            />
                          </div>
                        )}
                      </div>

                      {evaluation.matched_skills_json && evaluation.matched_skills_json.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-semibold">Matched Skills: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evaluation.matched_skills_json.map((skill) => (
                              <div key={skill} className="badge badge-success badge-sm">
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {evaluation.missing_skills_json && evaluation.missing_skills_json.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-semibold">Missing Skills: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {evaluation.missing_skills_json.map((skill) => (
                              <div key={skill} className="badge badge-error badge-sm">
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setShowEvaluationsModal(false);
                            router.push(`/hr/ats/evaluation/${evaluation.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowEvaluationsModal(false);
                  setSelectedCandidate(null);
                  setEvaluations([]);
                  setEvaluationsError(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowEvaluationsModal(false);
            setSelectedCandidate(null);
            setEvaluations([]);
            setEvaluationsError(null);
          }}></div>
        </div>
      )}

      {/* Create Evaluation Modal */}
      {showCreateEvaluationModal && selectedCandidate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Create Evaluation</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowCreateEvaluationModal(false);
                  setSelectedCandidate(null);
                  setSelectedJobId(null);
                  setCreateEvaluationError(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Candidate</span>
                </label>
                <div className="card bg-base-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="text-lg">{selectedCandidate.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{selectedCandidate.name}</p>
                      <p className="text-sm text-base-content/70">{selectedCandidate.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Select Job *</span>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={fetchJobs}
                    disabled={isLoadingJobs}
                    title="Refresh jobs list"
                  >
                    {isLoadingJobs ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Refresh'
                    )}
                  </button>
                </label>
                {isLoadingJobs ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner"></span>
                    <span className="ml-2 text-sm text-base-content/70">Loading jobs...</span>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="alert alert-warning">
                    <span>No jobs available. Please create a job posting first.</span>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={fetchJobs}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <select
                    className="select select-bordered w-full"
                    value={selectedJobId || ''}
                    onChange={(e) => setSelectedJobId(parseInt(e.target.value) || null)}
                  >
                    <option value="">Select a job...</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.company}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {createEvaluationError && (
                <div className="alert alert-error">
                  <XCircle className="w-5 h-5" />
                  <span>{createEvaluationError}</span>
                </div>
              )}

              {!selectedCandidate.resume_id && (
                <div className="alert alert-warning">
                  <span>This candidate does not have a resume uploaded. Please upload a resume first.</span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowCreateEvaluationModal(false);
                  setSelectedCandidate(null);
                  setSelectedJobId(null);
                  setCreateEvaluationError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitEvaluation}
                disabled={!selectedJobId || !selectedCandidate.resume_id || isCreatingEvaluation}
              >
                {isCreatingEvaluation ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Create Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowCreateEvaluationModal(false);
            setSelectedCandidate(null);
            setSelectedJobId(null);
            setCreateEvaluationError(null);
          }}></div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
