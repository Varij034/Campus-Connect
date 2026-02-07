'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { prepApi, jobsApi } from '@/lib/api';
import { PrepModule, Job } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function PrepForJobPage() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const [modules, setModules] = useState<PrepModule[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Number.isNaN(jobId)) return;
    setLoaded(false);
    Promise.all([
      prepApi.forJob(jobId),
      jobsApi.get(jobId).catch(() => null),
    ]).then(([mods, j]) => {
      setModules(mods);
      setJob(j);
      setLoaded(true);
    }).catch((e) => {
      setError(handleApiError(e));
      setLoaded(true);
    });
  }, [jobId]);

  if (Number.isNaN(jobId)) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="alert alert-error">Invalid job ID</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <Link href={`/student/jobs/${jobId}`} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Job
        </Link>
        {job && (
          <h1 className="text-2xl font-bold text-base-content">
            Prep for {job.title} at {job.company}
          </h1>
        )}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        {!loaded && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}
        {loaded && modules.length === 0 && !error && (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No prep modules for this job yet.</p>
              <Link href="/student/prep" className="btn btn-primary btn-sm w-fit mt-2">Browse all prep</Link>
            </div>
          </div>
        )}
        {modules.length > 0 && (
          <div className="grid gap-4">
            {modules.map((m) => (
              <div key={m.id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h2 className="card-title text-lg">{m.title}</h2>
                    <Link href={`/student/prep/${m.id}`} className="btn btn-primary btn-sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Read
                    </Link>
                  </div>
                  <p className="text-sm text-base-content/70 line-clamp-2">{m.content.slice(0, 150)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
