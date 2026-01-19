'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Briefcase, MapPin, Clock } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import { Job } from '@/types/api';
import { handleApiError } from '@/lib/errors';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface JobPosting {
  id: number;
  title: string;
  location: string;
  type: string;
  status: 'active' | 'draft' | 'closed';
  applications: number;
  postedDate: string;
  company: string;
  salary?: string;
}

export default function PostingsPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    educationLevel: '',
    yearsOfExperience: '',
    minimumAtsScore: '',
    keywords: [] as string[],
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchJobs();
      // Get user info to pre-fill company if available
      if (user) {
        // Try to get company from existing jobs or use email domain
        const fetchedJobs = await jobsApi.list(0, 100);
        if (fetchedJobs.length > 0) {
          setNewJob(prev => ({ 
            ...prev, 
            company: fetchedJobs[0].company,
            requiredSkills: [],
            preferredSkills: [],
            educationLevel: '',
            yearsOfExperience: '',
            minimumAtsScore: '',
            keywords: [],
          }));
        } else if (user.email) {
          // Extract domain from email as default company
          const emailDomain = user.email.split('@')[1];
          if (emailDomain) {
            const companyName = emailDomain.split('.')[0];
            setNewJob(prev => ({ 
              ...prev, 
              company: companyName.charAt(0).toUpperCase() + companyName.slice(1),
              requiredSkills: [],
              preferredSkills: [],
              educationLevel: '',
              yearsOfExperience: '',
              minimumAtsScore: '',
              keywords: [],
            }));
          }
        }
      }
    };
    loadData();
  }, [user]);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedJobs = await jobsApi.list(0, 100);
      setJobs(fetchedJobs);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Convert jobs to postings format
  const postings: JobPosting[] = jobs.map((job) => {
    // Extract job type from requirements_json if available, otherwise use salary field
    const jobType = job.requirements_json?.job_type || 
                    job.requirements_json?.type || 
                    (job.salary && !job.salary.match(/^\$|₹|€|£/) ? job.salary : 'Full-time');
    
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location || 'Not specified',
      type: jobType,
      salary: job.salary,
      status: 'active' as const,
      applications: job.application_count || 0,
      postedDate: job.created_at,
    };
  });

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.company) {
      alert('Please fill in all required fields (Title, Company, Description)');
      return;
    }
    try {
      const requirementsJson: any = {
        job_type: newJob.type,
        ...(newJob.requiredSkills.length > 0 && { required_skills: newJob.requiredSkills }),
        ...(newJob.preferredSkills.length > 0 && { preferred_skills: newJob.preferredSkills }),
        ...(newJob.educationLevel && { education_level: newJob.educationLevel }),
        ...(newJob.yearsOfExperience && { years_of_experience: parseInt(newJob.yearsOfExperience) || undefined }),
        ...(newJob.minimumAtsScore && { minimum_ats_score: parseInt(newJob.minimumAtsScore) || undefined }),
        ...(newJob.keywords.length > 0 && { keywords: newJob.keywords }),
        ...(newJob.salary && { salary_range: newJob.salary }),
      };
      
      await jobsApi.create({
        title: newJob.title,
        company: newJob.company,
        location: newJob.location || undefined,
        description: newJob.description,
        salary: newJob.salary || undefined,
        requirements_json: requirementsJson,
      });
      setShowModal(false);
      setNewJob({ 
        title: '', 
        company: '', 
        location: '', 
        type: 'Full-time', 
        salary: '', 
        description: '',
        requiredSkills: [],
        preferredSkills: [],
        educationLevel: '',
        yearsOfExperience: '',
        minimumAtsScore: '',
        keywords: [],
      });
      setSkillInput('');
      setPreferredSkillInput('');
      setKeywordInput('');
      fetchJobs();
    } catch (err) {
      alert('Failed to create job: ' + handleApiError(err));
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    const reqJson = job.requirements_json as any || {};
    setNewJob({
      title: job.title,
      company: job.company,
      location: job.location || '',
      type: reqJson.job_type || 'Full-time',
      salary: job.salary || reqJson.salary_range || '',
      description: job.description || '',
      requiredSkills: Array.isArray(reqJson.required_skills) ? reqJson.required_skills : [],
      preferredSkills: Array.isArray(reqJson.preferred_skills) ? reqJson.preferred_skills : [],
      educationLevel: reqJson.education_level || '',
      yearsOfExperience: reqJson.years_of_experience?.toString() || '',
      minimumAtsScore: reqJson.minimum_ats_score?.toString() || '',
      keywords: Array.isArray(reqJson.keywords) ? reqJson.keywords : [],
    });
    setSkillInput('');
    setPreferredSkillInput('');
    setKeywordInput('');
    setShowModal(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob || !newJob.title || !newJob.description || !newJob.company) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      // Preserve existing requirements_json and merge with new data
      const existingReqJson = editingJob.requirements_json as any || {};
      const requirementsJson: any = {
        ...existingReqJson, // Preserve any existing fields
        job_type: newJob.type,
        required_skills: newJob.requiredSkills.length > 0 ? newJob.requiredSkills : existingReqJson.required_skills || [],
        preferred_skills: newJob.preferredSkills.length > 0 ? newJob.preferredSkills : existingReqJson.preferred_skills || [],
        ...(newJob.educationLevel && { education_level: newJob.educationLevel }),
        ...(newJob.yearsOfExperience && { years_of_experience: parseInt(newJob.yearsOfExperience) || undefined }),
        ...(newJob.minimumAtsScore && { minimum_ats_score: parseInt(newJob.minimumAtsScore) || undefined }),
        ...(newJob.keywords.length > 0 && { keywords: newJob.keywords }),
        ...(newJob.salary && { salary_range: newJob.salary }),
      };
      
      await jobsApi.update(editingJob.id, {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location || undefined,
        description: newJob.description,
        salary: newJob.salary || undefined,
        requirements_json: requirementsJson,
      });
      setShowModal(false);
      setEditingJob(null);
      setNewJob({ 
        title: '', 
        company: '', 
        location: '', 
        type: 'Full-time', 
        salary: '', 
        description: '',
        requiredSkills: [],
        preferredSkills: [],
        educationLevel: '',
        yearsOfExperience: '',
        minimumAtsScore: '',
        keywords: [],
      });
      setSkillInput('');
      setPreferredSkillInput('');
      setKeywordInput('');
      fetchJobs();
    } catch (err) {
      alert('Failed to update job: ' + handleApiError(err));
    }
  };

  const handleViewJob = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setViewingJob(job);
      setShowViewModal(true);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      try {
        await jobsApi.delete(jobId);
        fetchJobs();
      } catch (err) {
        alert('Failed to delete job: ' + handleApiError(err));
      }
    }
  };

  const getStatusBadge = (status: JobPosting['status']) => {
    const badges = {
      active: 'badge-success',
      draft: 'badge-warning',
      closed: 'badge-error',
    };
    return badges[status];
  };

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-base-content mb-2">Job Postings</h1>
          <p className="text-base-content/70">Manage your job openings</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Posting
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchJobs} className="btn btn-sm btn-ghost">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Postings Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-base-content/70">No job postings yet. Create your first one!</p>
            </div>
          ) : (
            postings.map((posting, index) => (
          <motion.div
            key={posting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="card-title text-xl text-base-content">{posting.title}</h3>
                  <p className="text-sm text-base-content/60 mt-1">{posting.company}</p>
                </div>
                <div className={`badge ${getStatusBadge(posting.status)}`}>
                  {posting.status}
                </div>
              </div>
              <div className="space-y-2 text-sm text-base-content/70 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{posting.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{posting.type}</span>
                </div>
                {posting.salary && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{posting.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted: {new Date(posting.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-base-content/70">Applications</p>
                  <p className="text-2xl font-bold text-primary">{posting.applications}</p>
                </div>
              </div>
              <div className="card-actions justify-end">
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleViewJob(posting.id)}
                  title="View Job Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const job = jobs.find(j => j.id === posting.id);
                    if (job) handleEditJob(job);
                  }}
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => handleDeleteJob(posting.id)}
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Posting Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Job Title <span className="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Company <span className="text-error">*</span></span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Job Type</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Salary</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Description <span className="text-error">*</span></span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full h-32"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Job description, requirements, responsibilities..."
                />
              </div>
              
              {/* Requirements Section - Show expanded form when editing */}
              {editingJob && (
                <div className="divider">Requirements</div>
              )}
              
              {editingJob && (
                <>
                  <div>
                    <label className="label">
                      <span className="label-text">Required Skills</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="input input-bordered flex-1"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && skillInput.trim()) {
                            e.preventDefault();
                            setNewJob({ ...newJob, requiredSkills: [...newJob.requiredSkills, skillInput.trim()] });
                            setSkillInput('');
                          }
                        }}
                        placeholder="Type skill and press Enter"
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          if (skillInput.trim()) {
                            setNewJob({ ...newJob, requiredSkills: [...newJob.requiredSkills, skillInput.trim()] });
                            setSkillInput('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newJob.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="badge badge-primary badge-lg gap-2">
                          {skill}
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setNewJob({ 
                                ...newJob, 
                                requiredSkills: newJob.requiredSkills.filter((_, i) => i !== idx) 
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text">Preferred Skills</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="input input-bordered flex-1"
                        value={preferredSkillInput}
                        onChange={(e) => setPreferredSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && preferredSkillInput.trim()) {
                            e.preventDefault();
                            setNewJob({ ...newJob, preferredSkills: [...newJob.preferredSkills, preferredSkillInput.trim()] });
                            setPreferredSkillInput('');
                          }
                        }}
                        placeholder="Type skill and press Enter"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          if (preferredSkillInput.trim()) {
                            setNewJob({ ...newJob, preferredSkills: [...newJob.preferredSkills, preferredSkillInput.trim()] });
                            setPreferredSkillInput('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newJob.preferredSkills.map((skill, idx) => (
                        <span key={idx} className="badge badge-secondary badge-lg gap-2">
                          {skill}
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setNewJob({ 
                                ...newJob, 
                                preferredSkills: newJob.preferredSkills.filter((_, i) => i !== idx) 
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Education Level</span>
                      </label>
                      <select 
                        className="select select-bordered w-full"
                        value={newJob.educationLevel}
                        onChange={(e) => setNewJob({ ...newJob, educationLevel: e.target.value })}
                      >
                        <option value="">Select education level</option>
                        <option>High School</option>
                        <option>Associate's</option>
                        <option>Bachelor's</option>
                        <option>Master's</option>
                        <option>PhD</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Years of Experience</span>
                      </label>
                      <input 
                        type="number" 
                        className="input input-bordered w-full"
                        value={newJob.yearsOfExperience}
                        onChange={(e) => setNewJob({ ...newJob, yearsOfExperience: e.target.value })}
                        placeholder="e.g., 2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Minimum ATS Score (%)</span>
                      </label>
                      <input 
                        type="number" 
                        className="input input-bordered w-full"
                        value={newJob.minimumAtsScore}
                        onChange={(e) => setNewJob({ ...newJob, minimumAtsScore: e.target.value })}
                        placeholder="e.g., 60"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text">Keywords</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="input input-bordered flex-1"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && keywordInput.trim()) {
                            e.preventDefault();
                            setNewJob({ ...newJob, keywords: [...newJob.keywords, keywordInput.trim()] });
                            setKeywordInput('');
                          }
                        }}
                        placeholder="Type keyword and press Enter"
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          if (keywordInput.trim()) {
                            setNewJob({ ...newJob, keywords: [...newJob.keywords, keywordInput.trim()] });
                            setKeywordInput('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newJob.keywords.map((keyword, idx) => (
                        <span key={idx} className="badge badge-outline badge-lg gap-2">
                          {keyword}
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setNewJob({ 
                                ...newJob, 
                                keywords: newJob.keywords.filter((_, i) => i !== idx) 
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingJob(null);
                  setNewJob({ 
                    title: '', 
                    company: '', 
                    location: '', 
                    type: 'Full-time', 
                    salary: '', 
                    description: '',
                    requiredSkills: [],
                    preferredSkills: [],
                    educationLevel: '',
                    yearsOfExperience: '',
                    minimumAtsScore: '',
                    keywords: [],
                  });
                  setSkillInput('');
                  setPreferredSkillInput('');
                  setKeywordInput('');
                }} 
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={editingJob ? handleUpdateJob : handleCreateJob}
                className="btn btn-primary"
              >
                {editingJob ? 'Update Posting' : 'Create Posting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {showViewModal && viewingJob && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-bold text-3xl mb-2">{viewingJob.title}</h3>
              <p className="text-lg text-primary font-semibold">{viewingJob.company}</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-xs text-base-content/60 mb-1">Location</p>
                  <p className="font-semibold text-sm">{viewingJob.location || 'Not specified'}</p>
                </div>
                {viewingJob.salary && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Salary</p>
                    <p className="font-semibold text-sm">{viewingJob.salary}</p>
                  </div>
                )}
                {viewingJob.requirements_json?.job_type && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Job Type</p>
                    <p className="font-semibold text-sm">{viewingJob.requirements_json.job_type}</p>
                  </div>
                )}
                <div className="bg-base-200 p-3 rounded-lg">
                  <p className="text-xs text-base-content/60 mb-1">Posted</p>
                  <p className="font-semibold text-sm">
                    {new Date(viewingJob.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {viewingJob.description && (
                <div>
                  <p className="text-sm font-semibold text-base-content mb-2">Job Description</p>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingJob.description}</p>
                  </div>
                </div>
              )}
              {viewingJob.requirements_json && Object.keys(viewingJob.requirements_json).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-base-content mb-3">Requirements</p>
                  <div className="bg-base-200 p-4 rounded-lg space-y-4">
                    {viewingJob.requirements_json.job_title && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">Job Title</p>
                        <p className="font-medium">{viewingJob.requirements_json.job_title}</p>
                      </div>
                    )}
                    
                    {viewingJob.requirements_json.required_skills && 
                     Array.isArray(viewingJob.requirements_json.required_skills) &&
                     viewingJob.requirements_json.required_skills.length > 0 && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {viewingJob.requirements_json.required_skills.map((skill: string, idx: number) => (
                            <span key={idx} className="badge badge-primary badge-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewingJob.requirements_json.preferred_skills && 
                     Array.isArray(viewingJob.requirements_json.preferred_skills) &&
                     viewingJob.requirements_json.preferred_skills.length > 0 && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-2">Preferred Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {viewingJob.requirements_json.preferred_skills.map((skill: string, idx: number) => (
                            <span key={idx} className="badge badge-secondary badge-lg">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {viewingJob.requirements_json.education_level && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">Education Level</p>
                          <p className="font-medium">{viewingJob.requirements_json.education_level}</p>
                        </div>
                      )}
                      
                      {viewingJob.requirements_json.years_of_experience !== undefined && 
                       viewingJob.requirements_json.years_of_experience !== null && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">Years of Experience</p>
                          <p className="font-medium">
                            {viewingJob.requirements_json.years_of_experience} {viewingJob.requirements_json.years_of_experience === 1 ? 'year' : 'years'}
                          </p>
                        </div>
                      )}
                      
                      {viewingJob.requirements_json.minimum_ats_score !== undefined && 
                       viewingJob.requirements_json.minimum_ats_score !== null && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">Minimum ATS Score</p>
                          <p className="font-medium">{viewingJob.requirements_json.minimum_ats_score}%</p>
                        </div>
                      )}
                      
                      {viewingJob.requirements_json.job_type && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">Job Type</p>
                          <p className="font-medium">{viewingJob.requirements_json.job_type}</p>
                        </div>
                      )}
                    </div>
                    
                    {viewingJob.requirements_json.keywords && 
                     Array.isArray(viewingJob.requirements_json.keywords) &&
                     viewingJob.requirements_json.keywords.length > 0 && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-2">Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {viewingJob.requirements_json.keywords.map((keyword: string, idx: number) => (
                            <span key={idx} className="badge badge-outline badge-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewingJob.requirements_json.job_description && 
                     viewingJob.requirements_json.job_description !== viewingJob.description && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">Job Description (from requirements)</p>
                        <p className="text-sm whitespace-pre-wrap">{viewingJob.requirements_json.job_description}</p>
                      </div>
                    )}
                    
                    {viewingJob.requirements_json.salary_range && (
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">Salary Range</p>
                        <p className="font-medium">{viewingJob.requirements_json.salary_range}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setViewingJob(null);
                }} 
                className="btn btn-ghost"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  handleEditJob(viewingJob);
                }} 
                className="btn btn-primary"
              >
                Edit Job
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
