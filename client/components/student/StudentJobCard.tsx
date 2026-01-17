'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Job {
  id: number;
  role: string;
  company: string;
  match: string;
  location: string;
  type: string;
  salary: string;
}

interface StudentJobCardProps {
  job: Job;
  onApplyClick?: (job: Job) => void;
  delay?: number;
}

export default function StudentJobCard({ job, onApplyClick, delay = 0 }: StudentJobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border-2 border-base-300 hover:border-primary/50"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-lg text-base-content">{job.role}</h4>
            <p className="text-sm text-base-content/70">{job.company}</p>
            <p className="text-xs text-base-content/50 mt-1">{job.location} • {job.type}</p>
          </div>
          <span className="badge badge-success badge-lg">
            {job.match} Match
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
          <span className="text-sm font-medium text-base-content">{job.salary}</span>
          <Link
            href={`/student/jobs/${job.id}`}
            className="btn btn-primary btn-sm"
            onClick={() => onApplyClick?.(job)}
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
