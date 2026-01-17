'use client';

import { motion } from 'framer-motion';
import StatCard from '@/components/ui/StatCard';
import { FileText, Users, Briefcase, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: number;
  candidateName: string;
  jobTitle: string;
  appliedDate: string;
  matchScore: number;
}

export default function HRDashboard() {
  const recentApplications: Application[] = [
    {
      id: 1,
      candidateName: 'John Doe',
      jobTitle: 'Frontend Developer',
      appliedDate: '2024-01-15',
      matchScore: 95,
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobTitle: 'Software Engineer',
      appliedDate: '2024-01-14',
      matchScore: 88,
    },
    {
      id: 3,
      candidateName: 'Mike Johnson',
      jobTitle: 'UI/UX Designer',
      appliedDate: '2024-01-13',
      matchScore: 92,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">HR Dashboard</h1>
        <p className="text-base-content/70">Manage your recruitment process</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Postings"
          value={12}
          icon={Briefcase}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="Applications Received"
          value={156}
          icon={FileText}
          color="secondary"
          delay={0.2}
        />
        <StatCard
          title="Candidates Shortlisted"
          value={24}
          icon={Users}
          color="accent"
          delay={0.3}
        />
        <StatCard
          title="Avg. Match Score"
          value="87%"
          icon={TrendingUp}
          color="success"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <h2 className="card-title text-2xl text-base-content mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/hr/postings" className="btn btn-primary btn-outline">
              <Plus className="w-5 h-5 mr-2" />
              Create Job Posting
            </Link>
            <Link href="/hr/candidates" className="btn btn-secondary btn-outline">
              <Users className="w-5 h-5 mr-2" />
              Browse Candidates
            </Link>
            <Link href="/hr/chat" className="btn btn-accent btn-outline">
              <TrendingUp className="w-5 h-5 mr-2" />
              AI Recruitment Chat
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-2xl text-base-content">Recent Applications</h2>
            <Link href="/hr/candidates" className="link link-primary">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-base-content">{application.candidateName}</h3>
                  <p className="text-sm text-base-content/70">{application.jobTitle}</p>
                  <p className="text-xs text-base-content/60 mt-1">
                    Applied: {new Date(application.appliedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-base-content/70">Match Score</p>
                    <p className="text-lg font-bold text-primary">{application.matchScore}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm">View Profile</button>
                    <button className="btn btn-ghost btn-sm">Shortlist</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
