'use client';

import { motion } from 'framer-motion';
import AIChat from '@/components/shared/AIChat';

export default function StudentChatPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">AI Career Assistant</h1>
        <p className="text-base-content/70">Get personalized job recommendations and career guidance</p>
      </motion.div>

      {/* Chat Interface - Full Height */}
      <div className="flex-1 min-h-0">
        <AIChat role="student" />
      </div>
    </div>
  );
}
