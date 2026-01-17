'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock } from 'lucide-react';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  description: string;
  delay?: number;
}

export default function JobCard({
  title,
  company,
  location,
  type,
  posted,
  description,
  delay = 0,
}: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="card-body">
        <h3 className="card-title text-xl text-base-content">{title}</h3>
        <p className="text-primary font-semibold">{company}</p>
        <p className="text-base-content/70 text-sm mt-2 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-base-content/70">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            <span>{type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{posted}</span>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary btn-sm">Apply Now</button>
          <button className="btn btn-ghost btn-sm">View Details</button>
        </div>
      </div>
    </motion.div>
  );
}
