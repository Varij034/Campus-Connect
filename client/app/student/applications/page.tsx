'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { studentApi } from '@/lib/api';
import { StudentApplication, ApplicationStatus } from '@/types/api';
import { useNotifications } from '@/hooks/useNotifications';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'review' | 'interview' | 'accepted' | 'rejected';
  interviewDate?: string;
  atsScore?: number | null;
  passed?: boolean | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map backend status to frontend status
  const mapStatus = (status: string): Application['status'] => {
    const statusMap: Record<string, Application['status']> = {
      'pending': 'pending',
      'reviewing': 'review',
      'shortlisted': 'interview',
      'accepted': 'accepted',
      'rejected': 'rejected',
    };
    return statusMap[status.toLowerCase()] || 'pending';
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentApi.getApplications();
      
      // Transform API data to component format
      const transformedApplications: Application[] = data.map((app) => ({
        id: app.id,
        jobTitle: app.job_title,
        company: app.company,
        appliedDate: app.applied_at || new Date().toISOString(),
        status: mapStatus(app.status),
        atsScore: app.ats_score,
        passed: app.passed,
      }));
      
      setApplications(transformedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useNotifications((event) => {
    if (event.type === 'evaluation_ready') fetchApplications();
  });

  const getStatusBadge = (status: Application['status']) => {
    const badges = {
      pending: { icon: Clock, color: 'badge-warning', text: 'Pending' },
      review: { icon: FileText, color: 'badge-info', text: 'Under Review' },
      interview: { icon: Calendar, color: 'badge-primary', text: 'Interview Scheduled' },
      accepted: { icon: CheckCircle, color: 'badge-success', text: 'Accepted' },
      rejected: { icon: XCircle, color: 'badge-error', text: 'Rejected' },
    };
    return badges[status];
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">My Applications</h1>
        <p className="text-base-content/70">Track your job application status</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={fetchApplications}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body text-center">
            <p className="text-3xl font-bold text-base-content">{applications.length}</p>
            <p className="text-sm text-base-content/70">Total Applications</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body text-center">
            <p className="text-3xl font-bold text-primary">
              {applications.filter((a) => a.status === 'review').length}
            </p>
            <p className="text-sm text-base-content/70">Under Review</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body text-center">
            <p className="text-3xl font-bold text-secondary">
              {applications.filter((a) => a.status === 'interview').length}
            </p>
            <p className="text-sm text-base-content/70">Interviews</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body text-center">
            <p className="text-3xl font-bold text-success">
              {applications.filter((a) => a.status === 'accepted').length}
            </p>
            <p className="text-sm text-base-content/70">Accepted</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body text-center">
            <p className="text-3xl font-bold text-error">
              {applications.filter((a) => a.status === 'rejected').length}
            </p>
            <p className="text-sm text-base-content/70">Rejected</p>
          </div>
        </motion.div>
      </div>

      {/* Applications List */}
      {!isLoading && (
        <>
          {applications.length === 0 ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center py-12">
                <p className="text-base-content/70 text-lg">No applications found</p>
                <p className="text-base-content/50 text-sm mt-2">
                  Start applying to jobs to see your applications here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => {
                const statusBadge = getStatusBadge(application.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-base-content mb-1">
                            {application.jobTitle}
                          </h3>
                          <p className="text-primary font-semibold mb-2">{application.company}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                            <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                            {application.atsScore !== null && application.atsScore !== undefined && (
                              <span className="flex items-center gap-1">
                                ATS Score: {application.atsScore.toFixed(1)}%
                                {application.passed !== null && (
                                  <span className={application.passed ? 'text-success' : 'text-error'}>
                                    {application.passed ? ' ✓' : ' ✗'}
                                  </span>
                                )}
                              </span>
                            )}
                            {application.status === 'interview' && application.interviewDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Interview: {new Date(application.interviewDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`badge ${statusBadge.color} gap-2`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusBadge.text}
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-ghost btn-sm">View Details</button>
                        {application.status === 'interview' && (
                          <button className="btn btn-primary btn-sm">View Interview Details</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
      </div>
    </ProtectedRoute>
  );
}
