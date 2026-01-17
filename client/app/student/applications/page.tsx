'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'review' | 'interview' | 'accepted' | 'rejected';
  interviewDate?: string;
}

export default function ApplicationsPage() {
  const applications: Application[] = [
    {
      id: 1,
      jobTitle: 'Frontend Developer',
      company: 'Tech Innovations Inc.',
      appliedDate: '2024-01-15',
      status: 'review',
    },
    {
      id: 2,
      jobTitle: 'Software Engineer',
      company: 'Cloud Solutions',
      appliedDate: '2024-01-10',
      status: 'interview',
      interviewDate: '2024-01-25',
    },
    {
      id: 3,
      jobTitle: 'UI/UX Designer',
      company: 'Creative Studio',
      appliedDate: '2024-01-08',
      status: 'pending',
    },
    {
      id: 4,
      jobTitle: 'Backend Developer',
      company: 'Data Systems',
      appliedDate: '2024-01-05',
      status: 'accepted',
    },
    {
      id: 5,
      jobTitle: 'Product Manager',
      company: 'StartupXYZ',
      appliedDate: '2024-01-01',
      status: 'rejected',
    },
  ];

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
                      {application.interviewDate && (
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
    </div>
  );
}
