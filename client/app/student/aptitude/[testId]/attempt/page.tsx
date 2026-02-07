'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { aptitudeApi } from '@/lib/api';
import { handleApiError } from '@/lib/errors';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  category?: string;
  difficulty?: string;
}

const STORAGE_KEY = 'aptitude_attempt';

export default function AttemptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = Number(params.testId);
  const attemptId = searchParams.get('attempt_id');
  const durationMin = Number(searchParams.get('duration')) || 30;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answersRef = useRef<Record<string, number>>({});
  answersRef.current = answers;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correct_count: number; total_questions: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.attempt_id === Number(attemptId) && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch {
        setError('Invalid attempt data. Please start the test again.');
      }
    } else {
      setError('No attempt data. Please start the test from the Aptitude page.');
    }
  }, [attemptId]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || submitted) return;
    setSubmitted(true);
    const answersToSend = answersRef.current;
    try {
      const res = await aptitudeApi.submitAttempt(Number(attemptId), answersToSend);
      setResult({
        score: res.score,
        passed: res.passed,
        correct_count: res.correct_count,
        total_questions: res.total_questions,
      });
      if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      setError(handleApiError(e));
      setSubmitted(false);
    }
  }, [attemptId, submitted]);

  useEffect(() => {
    if (durationMin <= 0 || submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [durationMin, submitted, handleSubmit]);

  const setAnswer = (questionId: number, index: number) => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: index }));
  };

  if (error && !questions.length) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="p-6">
          <div className="alert alert-error">{error}</div>
          <Link href="/student/aptitude" className="btn btn-primary mt-4">Back to Aptitude</Link>
        </div>
      </ProtectedRoute>
    );
  }

  if (result) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="p-6 max-w-lg mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Test Result</h1>
          <div className={`card ${result.passed ? 'bg-success/10' : 'bg-base-200'}`}>
            <div className="card-body">
              <p className="text-3xl font-bold">{result.score.toFixed(0)}%</p>
              <p>{result.correct_count} / {result.total_questions} correct</p>
              <p className={result.passed ? 'text-success font-semibold' : 'text-base-content/70'}>
                {result.passed ? 'Passed' : 'Not passed'}
              </p>
            </div>
          </div>
          <Link href="/student/aptitude" className="btn btn-primary">Back to Aptitude</Link>
        </div>
      </ProtectedRoute>
    );
  }

  if (!questions.length) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </ProtectedRoute>
    );
  }

  const q = questions[currentIndex];
  const total = questions.length;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <ProtectedRoute requiredRole="student">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/student/aptitude" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" />
            Exit
          </Link>
          <div className="font-mono text-lg">
            Time: {m}:{s.toString().padStart(2, '0')}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${i === currentIndex ? 'btn-primary' : answers[questions[i].id] !== undefined ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <p className="text-sm text-base-content/60">
              Question {currentIndex + 1} of {total}
            </p>
            <h2 className="text-xl font-semibold mt-2">{q.question_text}</h2>
            <ul className="mt-4 space-y-2">
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-base-200">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[String(q.id)] === idx}
                      onChange={() => setAnswer(q.id, idx)}
                      className="radio radio-primary"
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            className="btn btn-ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </button>
          {currentIndex < total - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            >
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => handleSubmit()}>
              Submit
            </button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
