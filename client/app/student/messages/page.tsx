'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { messagesApi } from '@/lib/api';
import { Conversation } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function StudentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setError(null);
      try {
        const data = await messagesApi.listConversations();
        setConversations(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-base-content mb-2">Messages</h1>
          <p className="text-base-content/70">Conversations with companies.</p>
        </motion.div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/70">No conversations yet. Contact a company from a job posting.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Link href={`/student/messages/${c.id}`} className="block">
                  <div className="card bg-base-200 shadow hover:shadow-md transition-shadow">
                    <div className="card-body flex-row items-center gap-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{c.job_title ? c.job_title : 'Conversation'}</p>
                        {c.last_message_preview && (
                          <p className="text-sm text-base-content/70 truncate">{c.last_message_preview}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
