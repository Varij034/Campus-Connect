'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mentorshipApi } from '@/lib/api';
import { MentorshipRequest } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function MyMentorshipRequestsPage() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setError(null);
      try {
        const data = await mentorshipApi.listMyRequests();
        setRequests(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const statusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle className="w-5 h-5 text-success" />;
    if (status === 'declined') return <XCircle className="w-5 h-5 text-error" />;
    return <Clock className="w-5 h-5 text-warning" />;
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-base-content mb-2">My Mentorship Requests</h1>
          <p className="text-base-content/70">Track your requests to alumni mentors.</p>
        </motion.div>

        <Link href="/student/mentors" className="btn btn-ghost btn-sm gap-1">
          Browse mentors
        </Link>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">You haven&apos;t sent any mentorship requests yet.</p>
              <Link href="/student/mentors" className="btn btn-primary mt-2">
                Find mentors
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-200 shadow"
              >
                <div className="card-body flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {statusIcon(r.status)}
                    <div>
                      <p className="font-medium">Request #{r.id} · Mentor ID {r.mentor_id}</p>
                      <p className="text-sm text-base-content/70">
                        {new Date(r.created_at).toLocaleDateString()}
                        {r.responded_at && ` · Responded ${new Date(r.responded_at).toLocaleDateString()}`}
                      </p>
                      {r.message && <p className="text-sm mt-1 line-clamp-2">{r.message}</p>}
                    </div>
                  </div>
                  <span className={`badge ${r.status === 'accepted' ? 'badge-success' : r.status === 'declined' ? 'badge-error' : 'badge-warning'}`}>
                    {r.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
