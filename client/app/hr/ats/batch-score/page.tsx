'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, TrendingUp, Download, Plus, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { atsApi } from '@/lib/api';
import { ATSScoreRequest, ATSScoreResponse, JobRequirement } from '@/types/api';
import { handleApiError } from '@/lib/errors';
import { useRouter } from 'next/navigation';

interface BatchRequestItem {
  id: string;
  resume_id?: string;
  resume_text?: string;
  job_requirement: JobRequirement;
}

export default function BatchScorePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BatchRequestItem[]>([
    {
      id: '1',
      resume_text: '',
      job_requirement: {
        job_title: '',
        required_skills: [],
        preferred_skills: [],
        education_level: '',
        years_of_experience: undefined,
        job_description: '',
        keywords: [],
        minimum_ats_score: 50.0,
      },
    },
  ]);
  const [results, setResults] = useState<(ATSScoreResponse | { error: string })[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRequest = () => {
    setRequests([
      ...requests,
      {
        id: Date.now().toString(),
        resume_text: '',
        job_requirement: {
          job_title: '',
          required_skills: [],
          preferred_skills: [],
          education_level: '',
          years_of_experience: undefined,
          job_description: '',
          keywords: [],
          minimum_ats_score: 50.0,
        },
      },
    ]);
  };

  const removeRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const updateRequest = (id: string, updates: Partial<BatchRequestItem>) => {
    setRequests(requests.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addSkill = (requestId: string, skill: string, type: 'required' | 'preferred') => {
    if (!skill.trim()) return;
    const trimmed = skill.trim();
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (type === 'required') {
      if (!request.job_requirement.required_skills.includes(trimmed)) {
        updateRequest(requestId, {
          job_requirement: {
            ...request.job_requirement,
            required_skills: [...request.job_requirement.required_skills, trimmed],
          },
        });
      }
    } else {
      if (!request.job_requirement.preferred_skills?.includes(trimmed)) {
        updateRequest(requestId, {
          job_requirement: {
            ...request.job_requirement,
            preferred_skills: [...(request.job_requirement.preferred_skills || []), trimmed],
          },
        });
      }
    }
  };

  const removeSkill = (requestId: string, skill: string, type: 'required' | 'preferred') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (type === 'required') {
      updateRequest(requestId, {
        job_requirement: {
          ...request.job_requirement,
          required_skills: request.job_requirement.required_skills.filter(s => s !== skill),
        },
      });
    } else {
      updateRequest(requestId, {
        job_requirement: {
          ...request.job_requirement,
          preferred_skills: request.job_requirement.preferred_skills?.filter(s => s !== skill) || [],
        },
      });
    }
  };

  const handleSubmit = async () => {
    // Validate all requests
    for (const request of requests) {
      if (!request.job_requirement.job_title || request.job_requirement.required_skills.length === 0) {
        setError('All requests must have a job title and at least one required skill');
        return;
      }
      if (!request.resume_text && !request.resume_id) {
        setError('Each request must have either resume text or resume ID');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const apiRequests: ATSScoreRequest[] = requests.map(r => ({
        job_requirement: r.job_requirement,
        ...(r.resume_id ? { resume_id: r.resume_id } : { resume_text: r.resume_text || '' }),
      }));

      const response = await atsApi.batchScore(apiRequests);
      setResults(response.results);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const csv = [
      ['Request #', 'ATS Score', 'Passed', 'Skill Match', 'Education', 'Experience', 'Keyword Match', 'Format', 'Matched Skills', 'Missing Skills', 'Error'].join(','),
      ...results.map((result, index) => {
        if ('error' in result) {
          return [index + 1, '', '', '', '', '', '', '', '', '', result.error].join(',');
        }
        return [
          index + 1,
          result.ats_score.toFixed(1),
          result.passed ? 'Yes' : 'No',
          result.skill_match_score.toFixed(1),
          result.education_score.toFixed(1),
          result.experience_score.toFixed(1),
          result.keyword_match_score.toFixed(1),
          result.format_score.toFixed(1),
          `"${result.matched_skills.join('; ')}"`,
          `"${result.missing_skills.join('; ')}"`,
          '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-ats-results-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-4xl font-bold text-base-content mb-2">Batch Score Resumes</h1>
          <p className="text-base-content/70">Score multiple resumes against job requirements</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">Dismiss</button>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">Request #{index + 1}</h3>
                  {requests.length > 1 && (
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => removeRequest(request.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Resume Text */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Resume Text</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32 rounded-md"
                      placeholder="Paste resume text here..."
                      value={request.resume_text || ''}
                      onChange={(e) => updateRequest(request.id, { resume_text: e.target.value })}
                    />
                  </div>

                  {/* Job Title */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Job Title *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered rounded-md"
                      placeholder="e.g., Software Engineer"
                      value={request.job_requirement.job_title}
                      onChange={(e) => updateRequest(request.id, {
                        job_requirement: {
                          ...request.job_requirement,
                          job_title: e.target.value,
                        },
                      })}
                    />
                  </div>

                  {/* Required Skills */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Required Skills *</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 rounded-md"
                        placeholder="Add required skill..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget as HTMLInputElement;
                            addSkill(request.id, input.value, 'required');
                            input.value = '';
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.job_requirement.required_skills.map((skill) => (
                        <div key={skill} className="badge badge-primary gap-2">
                          {skill}
                          <button
                            className="btn btn-xs btn-circle btn-ghost"
                            onClick={() => removeSkill(request.id, skill, 'required')}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Request Button */}
        <button
          className="btn btn-outline w-full"
          onClick={addRequest}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Request
        </button>

        {/* Submit Button */}
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Processing {requests.length} requests...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Score All Resumes
            </>
          )}
        </button>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-2xl">Results</h2>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={exportResults}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      'error' in result
                        ? 'border-error bg-error/10'
                        : result.passed
                        ? 'border-success bg-success/10'
                        : 'border-warning bg-warning/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">Request #{index + 1}</h3>
                      {'error' in result ? (
                        <div className="badge badge-error">Error</div>
                      ) : result.passed ? (
                        <div className="badge badge-success gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Passed
                        </div>
                      ) : (
                        <div className="badge badge-warning gap-2">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </div>
                      )}
                    </div>

                    {'error' in result ? (
                      <p className="text-error">{result.error}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">ATS Score:</span>
                          <span className={`font-bold ${getScoreColor(result.ats_score)}`}>
                            {result.ats_score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <div>
                            <span className="text-base-content/70">Skill:</span>
                            <span className="ml-1 font-semibold">{result.skill_match_score.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-base-content/70">Education:</span>
                            <span className="ml-1 font-semibold">{result.education_score.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-base-content/70">Experience:</span>
                            <span className="ml-1 font-semibold">{result.experience_score.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-base-content/70">Keyword:</span>
                            <span className="ml-1 font-semibold">{result.keyword_match_score.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-base-content/70">Format:</span>
                            <span className="ml-1 font-semibold">{result.format_score.toFixed(1)}%</span>
                          </div>
                        </div>
                        {result.matched_skills.length > 0 && (
                          <div>
                            <span className="text-sm text-base-content/70">Matched: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.matched_skills.slice(0, 5).map((skill) => (
                                <div key={skill} className="badge badge-success badge-sm">
                                  {skill}
                                </div>
                              ))}
                              {result.matched_skills.length > 5 && (
                                <div className="badge badge-ghost badge-sm">
                                  +{result.matched_skills.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {result.missing_skills.length > 0 && (
                          <div>
                            <span className="text-sm text-base-content/70">Missing: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.missing_skills.slice(0, 5).map((skill) => (
                                <div key={skill} className="badge badge-error badge-sm">
                                  {skill}
                                </div>
                              ))}
                              {result.missing_skills.length > 5 && (
                                <div className="badge badge-ghost badge-sm">
                                  +{result.missing_skills.length - 5} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {result.evaluation_id > 0 && (
                          <button
                            className="btn btn-sm btn-ghost mt-2"
                            onClick={() => router.push(`/hr/ats/evaluation/${result.evaluation_id}`)}
                          >
                            View Full Evaluation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-lg bg-base-200">
                <h3 className="font-bold mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{results.length}</div>
                    <div className="text-sm text-base-content/70">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {results.filter(r => !('error' in r) && r.passed).length}
                    </div>
                    <div className="text-sm text-base-content/70">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-error">
                      {results.filter(r => 'error' in r || !r.passed).length}
                    </div>
                    <div className="text-sm text-base-content/70">Failed/Error</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
