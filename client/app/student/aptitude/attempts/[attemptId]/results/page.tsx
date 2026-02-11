'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { aptitudeApi, type DetailedTestResultsResponse } from '@/lib/api';
import { handleApiError } from '@/lib/errors';

const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const;
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function formatTimeTaken(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DetailedResultsPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string | undefined;
  const [data, setData] = useState<DetailedTestResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError('Invalid attempt ID');
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await aptitudeApi.getDetailedResults(Number(attemptId));
        setData(result);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [attemptId]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="p-6 flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="p-6 space-y-4">
          <div className="alert alert-error">
            <span>{error ?? 'Failed to load results'}</span>
          </div>
          <Link href="/student/aptitude" className="btn btn-primary">
            Back to Aptitude
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/student/aptitude" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Aptitude
          </Link>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h1 className="text-2xl font-bold">{data.test_title}</h1>
            <p className="text-base-content/70">Detailed results</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <span className="font-semibold">{data.score.toFixed(0)}%</span>
              <span>
                {data.correct_answers} correct / {data.incorrect_answers} incorrect
                {data.skipped_questions > 0 && ` / ${data.skipped_questions} skipped`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeTaken(data.time_taken)}
              </span>
              <span className="text-base-content/60">
                Submitted {formatSubmittedAt(data.submitted_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Questions</h2>
          {data.questions.map((q, idx) => {
            const options = OPTION_KEYS.map((key, i) => ({
              label: OPTION_LABELS[i],
              text: q[key],
            }));
            return (
              <div key={`question-${q.question_id}`} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {idx + 1}. {q.question_text}
                    </p>
                    <span
                      className={`badge ${
                        q.is_correct ? 'badge-success' : 'badge-error'
                      }`}
                    >
                      {q.is_correct ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}{' '}
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 capitalize mt-1">
                    Difficulty: {q.difficulty_level}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {options.map((opt) => {
                      const isCorrect = q.correct_option === opt.label;
                      const isSelected = q.selected_option === opt.label;
                      let style = '';
                      if (isCorrect) style = 'text-success font-medium';
                      else if (isSelected) style = 'text-error';
                      return (
                        <li key={opt.label} className={style}>
                          <span className="font-mono mr-2">{opt.label}.</span>
                          {opt.text}
                          {isCorrect && ' (correct)'}
                          {isSelected && !isCorrect && ' (your answer)'}
                        </li>
                      );
                    })}
                  </ul>
                  {!q.selected_option && (
                    <p className="text-sm text-base-content/60 mt-2">Skipped</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/student/aptitude" className="btn btn-primary">
          Back to Aptitude
        </Link>
      </div>
    </ProtectedRoute>
  );
}
