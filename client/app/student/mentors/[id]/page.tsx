'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Send } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mentorshipApi } from '@/lib/api';
import { MentorProfile } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    const fetchMentor = async () => {
      setError(null);
      try {
        const data = await mentorshipApi.getMentor(id);
        setMentor(data);
      } catch (e) {
        setError(handleApiError(e));
      }
    };
    fetchMentor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !mentor) return;
    setSubmitting(true);
    setError(null);
    try {
      await mentorshipApi.createRequest(id, message || undefined);
      router.push('/student/mentorship/requests');
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <Link href="/student/mentors" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to mentors
        </Link>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {!mentor && !error && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {mentor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card bg-base-200 shadow"
            >
              <div className="card-body">
                <h1 className="text-2xl font-bold">{mentor.headline || 'Mentor'}</h1>
                {mentor.company && (
                  <p className="flex items-center gap-2 text-base-content/70">
                    <Briefcase className="w-5 h-5" />
                    {mentor.company}
                    {mentor.years_experience != null && ` · ${mentor.years_experience} years experience`}
                  </p>
                )}
                {mentor.bio && <p className="mt-2">{mentor.bio}</p>}
                {mentor.skills_json && mentor.skills_json.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mentor.skills_json.map((s) => (
                      <span key={s} className="badge badge-primary badge-outline">{s}</span>
                    ))}
                  </div>
                )}
                {mentor.linkedin_url && (
                  <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="link link-primary mt-2">
                    LinkedIn profile
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-200 shadow"
            >
              <div className="card-body">
                <h2 className="card-title">Request mentorship</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Introduce yourself and what you would like help with..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary gap-2" disabled={submitting}>
                    {submitting ? <span className="loading loading-spinner loading-sm" /> : <Send className="w-4 h-4" />}
                    Send request
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
