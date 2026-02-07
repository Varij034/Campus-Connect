'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { prepApi } from '@/lib/api';
import { PrepModule } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function PrepPage() {
  const [modules, setModules] = useState<PrepModule[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await prepApi.list(companyFilter || undefined);
        setModules(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, [companyFilter]);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-base-content mb-2">Company & JD Prep</h1>
          <p className="text-base-content/70">Prep content tailored by company or job.</p>
        </motion.div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Filter by company..."
              className="input input-bordered w-full pl-10"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
          </div>
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
        ) : modules.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No prep modules found. Check back later or try a different company filter.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {modules.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h2 className="card-title text-lg">{m.title}</h2>
                      {m.company && (
                        <p className="text-sm text-base-content/70">Company: {m.company}</p>
                      )}
                      {m.type && (
                        <span className="badge badge-ghost badge-sm mt-1">{m.type}</span>
                      )}
                    </div>
                    <Link href={`/student/prep/${m.id}`} className="btn btn-primary btn-sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Read
                    </Link>
                  </div>
                  <p className="text-sm text-base-content/70 line-clamp-2 mt-2">
                    {m.content.slice(0, 150)}
                    {m.content.length > 150 ? '...' : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
