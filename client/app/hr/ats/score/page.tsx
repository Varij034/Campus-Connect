'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, XCircle, TrendingUp, Award, BookOpen, Briefcase, Hash, FileCheck } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { atsApi } from '@/lib/api';
import { ATSScoreRequest, ATSScoreResponse, JobRequirement } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function ScoreResumePage() {
  const [resumeInputType, setResumeInputType] = useState<'text' | 'id'>('text');
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [jobRequirement, setJobRequirement] = useState<JobRequirement>({
    job_title: '',
    required_skills: [],
    preferred_skills: [],
    education_level: '',
    years_of_experience: undefined,
    job_description: '',
    keywords: [],
    minimum_ats_score: 50.0,
  });
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [result, setResult] = useState<ATSScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSkill = (skill: string, type: 'required' | 'preferred') => {
    if (!skill.trim()) return;
    const trimmed = skill.trim();
    if (type === 'required') {
      if (!jobRequirement.required_skills.includes(trimmed)) {
        setJobRequirement({
          ...jobRequirement,
          required_skills: [...jobRequirement.required_skills, trimmed],
        });
        setSkillInput('');
      }
    } else {
      if (!jobRequirement.preferred_skills?.includes(trimmed)) {
        setJobRequirement({
          ...jobRequirement,
          preferred_skills: [...(jobRequirement.preferred_skills || []), trimmed],
        });
        setPreferredSkillInput('');
      }
    }
  };

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    if (type === 'required') {
      setJobRequirement({
        ...jobRequirement,
        required_skills: jobRequirement.required_skills.filter(s => s !== skill),
      });
    } else {
      setJobRequirement({
        ...jobRequirement,
        preferred_skills: jobRequirement.preferred_skills?.filter(s => s !== skill) || [],
      });
    }
  };

  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    const trimmed = keyword.trim();
    if (!jobRequirement.keywords?.includes(trimmed)) {
      setJobRequirement({
        ...jobRequirement,
        keywords: [...(jobRequirement.keywords || []), trimmed],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setJobRequirement({
      ...jobRequirement,
      keywords: jobRequirement.keywords?.filter(k => k !== keyword) || [],
    });
  };

  const handleSubmit = async () => {
    if (!jobRequirement.job_title || jobRequirement.required_skills.length === 0) {
      setError('Please provide job title and at least one required skill');
      return;
    }

    if (resumeInputType === 'text' && !resumeText.trim()) {
      setError('Please provide resume text');
      return;
    }

    if (resumeInputType === 'id' && !resumeId.trim()) {
      setError('Please provide resume ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: ATSScoreRequest = {
        job_requirement: jobRequirement,
        ...(resumeInputType === 'text' ? { resume_text: resumeText } : { resume_id: resumeId }),
      };

      const response = await atsApi.score(request);
      setResult(response);
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
          <h1 className="text-4xl font-bold text-base-content mb-2">Score Resume</h1>
          <p className="text-base-content/70">Evaluate a resume against job requirements using ATS</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Resume Input</h2>

              {/* Resume Input Type */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Resume Source</span>
                </label>
                <div className="flex gap-2">
                  <button
                    className={`btn flex-1 ${resumeInputType === 'text' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setResumeInputType('text')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Resume Text
                  </button>
                  <button
                    className={`btn flex-1 ${resumeInputType === 'id' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setResumeInputType('id')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Resume ID
                  </button>
                </div>
              </div>

              {/* Resume Text Input */}
              {resumeInputType === 'text' && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Resume Text</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-48 rounded-md"
                    placeholder="Paste resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              )}

              {/* Resume ID Input */}
              {resumeInputType === 'id' && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Resume ID</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered rounded-md"
                    placeholder="Enter resume ID..."
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                  />
                </div>
              )}

              <div className="divider">Job Requirements</div>

              {/* Job Title */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Job Title *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered rounded-md"
                  placeholder="e.g., Software Engineer"
                  value={jobRequirement.job_title}
                  onChange={(e) => setJobRequirement({ ...jobRequirement, job_title: e.target.value })}
                />
              </div>

              {/* Required Skills */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Required Skills *</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 rounded-md"
                    placeholder="Add required skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput, 'required');
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => addSkill(skillInput, 'required')}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobRequirement.required_skills.map((skill) => (
                    <div key={skill} className="badge badge-primary gap-2">
                      {skill}
                      <button
                        className="btn btn-xs btn-circle btn-ghost"
                        onClick={() => removeSkill(skill, 'required')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Preferred Skills</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 rounded-md"
                    placeholder="Add preferred skill..."
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(preferredSkillInput, 'preferred');
                      }
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => addSkill(preferredSkillInput, 'preferred')}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobRequirement.preferred_skills?.map((skill) => (
                    <div key={skill} className="badge badge-secondary gap-2">
                      {skill}
                      <button
                        className="btn btn-xs btn-circle btn-ghost"
                        onClick={() => removeSkill(skill, 'preferred')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Level */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Education Level</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered rounded-md"
                  placeholder="e.g., Bachelor's, Master's"
                  value={jobRequirement.education_level || ''}
                  onChange={(e) => setJobRequirement({ ...jobRequirement, education_level: e.target.value })}
                />
              </div>

              {/* Years of Experience */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Years of Experience</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered rounded-md"
                  placeholder="e.g., 3"
                  value={jobRequirement.years_of_experience || ''}
                  onChange={(e) => setJobRequirement({
                    ...jobRequirement,
                    years_of_experience: e.target.value ? parseInt(e.target.value) : undefined,
                  })}
                />
              </div>

              {/* Keywords */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Keywords</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 rounded-md"
                    placeholder="Add keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(keywordInput);
                      }
                    }}
                  />
                  <button
                    className="btn btn-ghost"
                    onClick={() => addKeyword(keywordInput)}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobRequirement.keywords?.map((keyword) => (
                    <div key={keyword} className="badge badge-outline gap-2">
                      {keyword}
                      <button
                        className="btn btn-xs btn-circle btn-ghost"
                        onClick={() => removeKeyword(keyword)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Job Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 rounded-md"
                  placeholder="Enter job description..."
                  value={jobRequirement.job_description || ''}
                  onChange={(e) => setJobRequirement({ ...jobRequirement, job_description: e.target.value })}
                />
              </div>

              {/* Minimum ATS Score */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Minimum ATS Score</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered rounded-md"
                  min="0"
                  max="100"
                  step="0.1"
                  value={jobRequirement.minimum_ats_score || 50.0}
                  onChange={(e) => setJobRequirement({
                    ...jobRequirement,
                    minimum_ats_score: parseFloat(e.target.value) || 50.0,
                  })}
                />
              </div>

              {/* Submit Button */}
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Scoring...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5 mr-2" />
                    Score Resume
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Results</h2>

              {!result ? (
                <div className="text-center py-12 text-base-content/50">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Submit a resume to see scoring results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 rounded-lg bg-base-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-6 h-6" />
                      <span className="text-sm font-semibold">Overall ATS Score</span>
                    </div>
                    <div className={`text-6xl font-bold ${getScoreColor(result.ats_score)}`}>
                      {result.ats_score.toFixed(1)}%
                    </div>
                    <div className="mt-2">
                      {result.passed ? (
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
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Score Breakdown</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Skill Match
                          </span>
                          <span className={`font-semibold ${getScoreColor(result.skill_match_score)}`}>
                            {result.skill_match_score.toFixed(1)}%
                          </span>
                        </div>
                        <progress
                          className={`progress ${getScoreBadge(result.skill_match_score)}`}
                          value={result.skill_match_score}
                          max="100"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Education
                          </span>
                          <span className={`font-semibold ${getScoreColor(result.education_score)}`}>
                            {result.education_score.toFixed(1)}%
                          </span>
                        </div>
                        <progress
                          className={`progress ${getScoreBadge(result.education_score)}`}
                          value={result.education_score}
                          max="100"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Experience
                          </span>
                          <span className={`font-semibold ${getScoreColor(result.experience_score)}`}>
                            {result.experience_score.toFixed(1)}%
                          </span>
                        </div>
                        <progress
                          className={`progress ${getScoreBadge(result.experience_score)}`}
                          value={result.experience_score}
                          max="100"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Keyword Match
                          </span>
                          <span className={`font-semibold ${getScoreColor(result.keyword_match_score)}`}>
                            {result.keyword_match_score.toFixed(1)}%
                          </span>
                        </div>
                        <progress
                          className={`progress ${getScoreBadge(result.keyword_match_score)}`}
                          value={result.keyword_match_score}
                          max="100"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            Format
                          </span>
                          <span className={`font-semibold ${getScoreColor(result.format_score)}`}>
                            {result.format_score.toFixed(1)}%
                          </span>
                        </div>
                        <progress
                          className={`progress ${getScoreBadge(result.format_score)}`}
                          value={result.format_score}
                          max="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  {result.matched_skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-2">Matched Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.matched_skills.map((skill) => (
                          <div key={skill} className="badge badge-success">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {result.missing_skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-2">Missing Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((skill) => (
                          <div key={skill} className="badge badge-error">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluation ID */}
                  {result.evaluation_id > 0 && (
                    <div className="text-sm text-base-content/60">
                      Evaluation ID: {result.evaluation_id}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
