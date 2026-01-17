'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle, Clock, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';

interface DailyPracticeSectionProps {
  solvedToday?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  onStartPractice?: () => void;
}

export default function DailyPracticeSection({
  solvedToday = false,
  currentStreak = 0,
  longestStreak = 0,
  onStartPractice,
}: DailyPracticeSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg border-2 border-primary/30"
    >
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-xl text-base-content flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Daily Practice Challenge
          </h3>
          <Link
            href="/student/practice"
            className="btn btn-primary"
            onClick={onStartPractice}
          >
            Start Practice →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <p className="text-sm text-base-content/70 mb-2">Today's Status</p>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${solvedToday ? 'bg-success/20' : 'bg-warning/20'}`}>
                  {solvedToday ? (
                    <CheckCircle className={`w-6 h-6 ${solvedToday ? 'text-success' : 'text-warning'}`} />
                  ) : (
                    <Clock className="w-6 h-6 text-warning" />
                  )}
                </div>
                <p className={`text-xl font-bold ${solvedToday ? 'text-success' : 'text-warning'}`}>
                  {solvedToday ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <p className="text-sm text-base-content/70 mb-2">Current Streak</p>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-warning/20">
                  <Flame className="w-6 h-6 text-warning" />
                </div>
                <p className="text-xl font-bold text-warning">{currentStreak} days</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <p className="text-sm text-base-content/70 mb-2">Longest Streak</p>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-info/20">
                  <Trophy className="w-6 h-6 text-info" />
                </div>
                <p className="text-xl font-bold text-info">{longestStreak} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
