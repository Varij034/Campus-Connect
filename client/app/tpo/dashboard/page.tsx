'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCard from '@/components/ui/StatCard';
import { Users, ShieldCheck, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';
import { tpoApi, jobsApi } from '@/lib/api';
import { handleApiError } from '@/lib/errors';
import { Candidate, Job } from '@/types/api';

interface TpoStats {
  total_candidates: number;
  verified_count: number;
  total_applications: number;
  placements: number;
  active_jobs: number;
}

export default function TPODashboard() {
  const [stats, setStats] = useState<TpoStats | null>(null);
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
    fetchPending();
    fetchJobs();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    setError(null);
    try {
      const data = await tpoApi.getStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchPending = async () => {
    setIsLoadingPending(true);
    try {
      const data = await tpoApi.listPendingVerification(0, 50);
      setPendingCandidates(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const data = await jobsApi.list(0, 20);
      setJobs(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleVerify = async (candidateId: number) => {
    setVerifyingId(candidateId);
    try {
      await tpoApi.verifyCandidate(candidateId);
      await fetchPending();
      await fetchStats();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">
          TPO Admin Dashboard
        </h1>
        <p className="text-base-content/70">Manage verification and placement overview</p>
      </motion.div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={isLoadingStats ? '—' : stats?.total_candidates ?? 0}
          icon={Users}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="Verified Profiles"
          value={isLoadingStats ? '—' : stats?.verified_count ?? 0}
          icon={ShieldCheck}
          color="success"
          delay={0.2}
        />
        <StatCard
          title="Active Jobs"
          value={isLoadingStats ? '—' : stats?.active_jobs ?? 0}
          icon={Briefcase}
          color="secondary"
          delay={0.3}
        />
        <StatCard
          title="Placements"
          value={isLoadingStats ? '—' : stats?.placements ?? 0}
          icon={TrendingUp}
          color="accent"
          delay={0.4}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h3 className="card-title text-xl text-base-content mb-4">Pending Verifications</h3>
            {isLoadingPending ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : pendingCandidates.length === 0 ? (
              <p className="text-base-content/70">No pending verifications.</p>
            ) : (
              <div className="space-y-3">
                {pendingCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-base-content">{c.name}</p>
                      <p className="text-sm text-base-content/70">{c.email}</p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={verifyingId === c.id}
                      onClick={() => handleVerify(c.id)}
                    >
                      {verifyingId === c.id ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h3 className="card-title text-xl text-base-content mb-4">Placement Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Total Applications</span>
                <span className="text-2xl font-bold text-base-content">
                  {stats?.total_applications ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Placements</span>
                <span className="text-2xl font-bold text-success">
                  {stats?.placements ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Verification Rate</span>
                <span className="text-2xl font-bold text-primary">
                  {stats && stats.total_candidates > 0
                    ? `${Math.round((stats.verified_count / stats.total_candidates) * 100)}%`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <h3 className="card-title text-xl text-base-content mb-4">Company Drives</h3>
          {isLoadingJobs ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Applicants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-base-content/70 py-4">
                        No active jobs
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="font-medium">{job.company}</td>
                        <td>{job.title}</td>
                        <td>{job.application_count ?? 0}</td>
                        <td>
                          <span className="badge badge-success badge-sm">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
