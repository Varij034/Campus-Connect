'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await eventsApi.list({
          type: typeFilter || undefined,
          is_active: true,
        });
        setEvents(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [typeFilter]);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-base-content mb-2">Events</h1>
          <p className="text-base-content/70">Hackathons, startup events, and workshops.</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="select select-bordered"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="hackathon">Hackathon</option>
            <option value="startup">Startup</option>
            <option value="workshop">Workshop</option>
          </select>
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
        ) : events.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No events found. Check back later.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-200 shadow hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="card-title">{ev.title}</h2>
                    <span className="badge badge-primary badge-sm">{ev.type}</span>
                  </div>
                  {ev.description && <p className="text-sm line-clamp-2">{ev.description}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ev.start_date).toLocaleDateString()}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {ev.location}
                      </span>
                    )}
                    {ev.max_participants != null && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {(ev.registration_count ?? 0)}/{ev.max_participants}
                      </span>
                    )}
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <Link href={`/student/events/${ev.id}`} className="btn btn-primary btn-sm">
                      View and Register
                    </Link>
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
