'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { eventsApi } from '@/lib/api';
import { Event, EventRegistration } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [event, setEvent] = useState<Event | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myRegistration = myRegistrations.find((r) => r.event_id === id);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    const fetchEvent = async () => {
      setError(null);
      try {
        const [ev, regs] = await Promise.all([
          eventsApi.get(id),
          eventsApi.myRegistrations(),
        ]);
        setEvent(ev);
        setMyRegistrations(regs);
      } catch (e) {
        setError(handleApiError(e));
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    setError(null);
    try {
      await eventsApi.register(id);
      const regs = await eventsApi.myRegistrations();
      setMyRegistrations(regs);
      if (event) setEvent({ ...event, registration_count: (event.registration_count ?? 0) + 1 });
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <Link href="/student/events" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to events
        </Link>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {!event && !error && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {event && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-base-200 shadow"
          >
            <div className="card-body">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <span className="badge badge-primary">{event.type}</span>
              </div>
              {event.description && <p className="mt-2">{event.description}</p>}
              <div className="flex flex-wrap gap-4 mt-2 text-base-content/70">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(event.start_date).toLocaleString()} – {new Date(event.end_date).toLocaleString()}
                </span>
                {event.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> {event.location}
                  </span>
                )}
                {event.max_participants != null && (
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> {event.registration_count ?? 0} / {event.max_participants} registered
                  </span>
                )}
              </div>
              {event.registration_deadline && (
                <p className="text-sm text-base-content/70">
                  Registration deadline: {new Date(event.registration_deadline).toLocaleString()}
                </p>
              )}
              <div className="card-actions mt-4">
                {myRegistration ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    You are {myRegistration.status === 'waitlist' ? 'on the waitlist' : 'registered'}.
                  </div>
                ) : event.is_active ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? <span className="loading loading-spinner loading-sm" /> : null}
                    Register
                  </button>
                ) : (
                  <span className="text-base-content/70">Registration closed.</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
