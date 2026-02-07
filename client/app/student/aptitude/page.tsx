'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileQuestion, Play } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { aptitudeApi } from '@/lib/api';
import { handleApiError } from '@/lib/errors';

interface TestItem {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  question_count: number;
}

export default function AptitudePage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [attempts, setAttempts] = useState<{ id: number; test_title?: string; score?: number; passed?: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [t, a] = await Promise.all([
          aptitudeApi.listTests(),
          aptitudeApi.myAttempts().catch(() => []),
        ]);
        setTests(t);
        setAttempts(a);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleStart = async (testId: number) => {
    setStartingId(testId);
    try {
      const result = await aptitudeApi.startAttempt(testId);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aptitude_attempt', JSON.stringify({
          attempt_id: result.attempt_id,
          questions: result.questions,
        }));
      }
      window.location.href = `/student/aptitude/${testId}/attempt?attempt_id=${result.attempt_id}&duration=${result.duration_minutes}`;
    } catch (e) {
      setError(handleApiError(e));
      setStartingId(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-base-content mb-2">Aptitude Tests</h1>
          <p className="text-base-content/70">Take timed tests to practice and demonstrate skills.</p>
        </motion.div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {attempts.length > 0 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg">My Attempts</h2>
              <ul className="space-y-2">
                {attempts.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex justify-between items-center">
                    <span>{a.test_title ?? `Test #${a.id}`}</span>
                    {a.score != null && (
                      <span className={a.passed ? 'text-success' : 'text-base-content/70'}>
                        {a.score.toFixed(0)}% {a.passed ? 'Passed' : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : tests.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No aptitude tests available yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-lg"
              >
                <div className="card-body">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h2 className="card-title">{t.title}</h2>
                      {t.description && (
                        <p className="text-sm text-base-content/70 mt-1">{t.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-base-content/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {t.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileQuestion className="w-4 h-4" />
                          {t.question_count} questions
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary gap-2"
                      disabled={startingId !== null}
                      onClick={() => handleStart(t.id)}
                    >
                      {startingId === t.id ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Start
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
