'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, Award, BookOpen, Briefcase, Hash, FileCheck, Calendar } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { atsApi } from '@/lib/api';
import { EvaluationResponse } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = parseInt(params.id as string);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluation();
    }
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await atsApi.getEvaluation(evaluationId);
      setEvaluation(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-error';
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
          <button
            className="btn btn-ghost btn-sm mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-base-content mb-2">Evaluation Details</h1>
          <p className="text-base-content/70">View detailed ATS evaluation results</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={fetchEvaluation} className="btn btn-sm btn-ghost">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Evaluation Details */}
        {!isLoading && evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              {/* Evaluation Info */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Evaluation #{evaluation.id}</h2>
                  <div className="flex items-center gap-4 text-sm text-base-content/70">
                    <div className="flex items-center gap-1">
                      <span>Application ID:</span>
                      <span className="font-semibold">{evaluation.application_id}</span>
                    </div>
                    {evaluation.feedback_id && (
                      <div className="flex items-center gap-1">
                        <span>Feedback ID:</span>
                        <span className="font-semibold">{evaluation.feedback_id}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(evaluation.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="text-center p-6 rounded-lg bg-base-200 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm font-semibold">Overall ATS Score</span>
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(evaluation.ats_score)}`}>
                  {evaluation.ats_score.toFixed(1)}%
                </div>
                <div className="mt-2">
                  {evaluation.passed ? (
                    <div className="badge badge-success badge-lg gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Passed
                    </div>
                  ) : (
                    <div className="badge badge-error badge-lg gap-2">
                      <XCircle className="w-4 h-4" />
                      Failed
                    </div>
                  )}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-lg">Score Breakdown</h3>
                
                <div className="space-y-3">
                  {evaluation.skill_match_score !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Skill Match
                        </span>
                        <span className={`font-semibold ${getScoreColor(evaluation.skill_match_score)}`}>
                          {evaluation.skill_match_score.toFixed(1)}%
                        </span>
                      </div>
                      <progress
                        className={`progress ${getScoreBadge(evaluation.skill_match_score)}`}
                        value={evaluation.skill_match_score}
                        max="100"
                      />
                    </div>
                  )}

                  {evaluation.education_score !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Education
                        </span>
                        <span className={`font-semibold ${getScoreColor(evaluation.education_score)}`}>
                          {evaluation.education_score.toFixed(1)}%
                        </span>
                      </div>
                      <progress
                        className={`progress ${getScoreBadge(evaluation.education_score)}`}
                        value={evaluation.education_score}
                        max="100"
                      />
                    </div>
                  )}

                  {evaluation.experience_score !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Experience
                        </span>
                        <span className={`font-semibold ${getScoreColor(evaluation.experience_score)}`}>
                          {evaluation.experience_score.toFixed(1)}%
                        </span>
                      </div>
                      <progress
                        className={`progress ${getScoreBadge(evaluation.experience_score)}`}
                        value={evaluation.experience_score}
                        max="100"
                      />
                    </div>
                  )}

                  {evaluation.keyword_match_score !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Keyword Match
                        </span>
                        <span className={`font-semibold ${getScoreColor(evaluation.keyword_match_score)}`}>
                          {evaluation.keyword_match_score.toFixed(1)}%
                        </span>
                      </div>
                      <progress
                        className={`progress ${getScoreBadge(evaluation.keyword_match_score)}`}
                        value={evaluation.keyword_match_score}
                        max="100"
                      />
                    </div>
                  )}

                  {evaluation.format_score !== undefined && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4" />
                          Format
                        </span>
                        <span className={`font-semibold ${getScoreColor(evaluation.format_score)}`}>
                          {evaluation.format_score.toFixed(1)}%
                        </span>
                      </div>
                      <progress
                        className={`progress ${getScoreBadge(evaluation.format_score)}`}
                        value={evaluation.format_score}
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Matched Skills */}
              {evaluation.matched_skills_json && evaluation.matched_skills_json.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.matched_skills_json.map((skill) => (
                      <div key={skill} className="badge badge-success">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {evaluation.missing_skills_json && evaluation.missing_skills_json.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.missing_skills_json.map((skill) => (
                      <div key={skill} className="badge badge-error">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  className="btn btn-primary"
                  onClick={() => router.push(`/hr/candidates`)}
                >
                  View Application
                </button>
                {evaluation.feedback_id && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => router.push(`/hr/feedback/${evaluation.feedback_id}`)}
                  >
                    View Feedback
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
