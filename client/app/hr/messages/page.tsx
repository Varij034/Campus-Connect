'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { messagesApi } from '@/lib/api';
import { Conversation } from '@/types/api';
import { handleApiError } from '@/lib/errors';

export default function HRMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const data = await messagesApi.listConversations();
        setConversations(data);
      } catch (e) {
        setError(handleApiError(e));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-base-content mb-2">Messages</h1>
          <p className="text-base-content/70">Conversations with candidates.</p>
        </motion.div>
        {error && <div className="alert alert-error"><span>{error}</span></div>}
        {isLoading && <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>}
        {!isLoading && conversations.length === 0 && (
          <div className="card bg-base-200"><div className="card-body"><p className="text-base-content/70">No conversations yet.</p></div></div>
        )}
        {!isLoading && conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((c) => (
              <Link key={c.id} href={`/hr/messages/${c.id}`} className="block">
                <div className="card bg-base-200 shadow hover:shadow-md">
                  <div className="card-body flex-row items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{c.candidate_name || `Candidate #${c.candidate_id}`}</p>
                      {c.job_title && <p className="text-sm text-base-content/70">{c.job_title}</p>}
                      {c.last_message_preview && <p className="text-sm truncate">{c.last_message_preview}</p>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
