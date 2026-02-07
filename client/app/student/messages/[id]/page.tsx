'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { messagesApi } from '@/lib/api';
import { Message, Conversation } from '@/types/api';
import { handleApiError } from '@/lib/errors';
import { getUser } from '@/lib/api';

export default function StudentMessageThreadPage() {
  const params = useParams();
  const id = Number(params.id);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newBody, setNewBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = typeof window !== 'undefined' ? getUser() : null;
  const myId = currentUser?.id;

  useEffect(() => {
    if (!id || isNaN(id)) return;
    const fetchData = async () => {
      setError(null);
      try {
        const [convs, msgs] = await Promise.all([
          messagesApi.listConversations(),
          messagesApi.getMessages(id),
        ]);
        const conv = convs.find((c) => c.id === id);
        setConversation(conv || null);
        setMessages(msgs);
      } catch (e) {
        setError(handleApiError(e));
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await messagesApi.sendMessage(id, newBody.trim());
      setMessages((prev) => [...prev, msg]);
      setNewBody('');
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)]">
        <Link href="/student/messages" className="btn btn-ghost btn-sm gap-1 self-start">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {conversation && (
          <div className="font-medium text-base-content/80">
            {conversation.job_title ? conversation.job_title : 'Conversation'}
          </div>
        )}

        <div className="flex-1 overflow-y-auto rounded-lg bg-base-200 p-4 space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat ${m.sender_id === myId ? 'chat-end' : 'chat-start'}`}
            >
              <div className={`chat-bubble ${m.sender_id === myId ? 'chat-bubble-primary' : ''}`}>
                {m.body}
              </div>
              <div className="chat-footer opacity-70 text-xs">
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Type a message..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
          <button type="submit" className="btn btn-primary gap-1" disabled={sending || !newBody.trim()}>
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
