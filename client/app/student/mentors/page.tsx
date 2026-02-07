'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Briefcase } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mentorshipApi } from '@/lib/api';
import { MentorProfile } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await mentorshipApi.listMentors({
          skill: skillFilter || undefined,
          company: companyFilter || undefined,
          is_available: availableOnly ? true : undefined,
        });
        setMentors(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, [skillFilter, companyFilter, availableOnly]);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-base-content mb-2">Alumni Mentors</h1>
          <p className="text-base-content/70">Connect with alumni for career guidance and mentorship.</p>
        </motion.div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Skill..."
              className="input input-bordered w-full pl-10"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Company..."
              className="input input-bordered w-full pl-10"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
          </div>
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span className="label-text">Available only</span>
          </label>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No mentors found. Try adjusting filters or check back later.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mentors.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-200 shadow hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <h2 className="card-title">{m.headline || 'Mentor'}</h2>
                  {m.company && (
                    <p className="text-sm text-base-content/70 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {m.company}
                      {m.years_experience != null && ` · ${m.years_experience} yrs`}
                    </p>
                  )}
                  {m.bio && <p className="text-sm line-clamp-2">{m.bio}</p>}
                  {m.skills_json && m.skills_json.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.skills_json.slice(0, 5).map((s) => (
                        <span key={s} className="badge badge-ghost badge-sm">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="card-actions justify-end mt-2">
                    <Link href={`/student/mentors/${m.id}`} className="btn btn-primary btn-sm">
                      Request mentorship
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Link href="/student/mentorship/requests" className="btn btn-ghost">
            My requests
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
