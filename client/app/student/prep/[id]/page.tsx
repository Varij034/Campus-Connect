'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { prepApi } from '@/lib/api';
import { PrepModule } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function PrepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [module, setModule] = useState<PrepModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    prepApi.get(id).then(setModule).catch((e) => setError(handleApiError(e)));
  }, [id]);

  if (Number.isNaN(id)) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="alert alert-error">Invalid prep ID</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <Link href="/student/prep" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Prep
        </Link>
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        {module && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h1 className="card-title text-2xl">{module.title}</h1>
              {(module.company || module.type) && (
                <div className="flex gap-2 flex-wrap text-sm text-base-content/70">
                  {module.company && <span>Company: {module.company}</span>}
                  {module.type && <span className="badge badge-ghost">{module.type}</span>}
                </div>
              )}
              <div className="prose max-w-none mt-4 whitespace-pre-wrap text-base-content">
                {module.content}
              </div>
            </div>
          </div>
        )}
        {!module && !error && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
