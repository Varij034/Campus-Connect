'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import JobCard from '@/components/ui/JobCard';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const jobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'We\'re looking for a talented frontend developer to join our team. Experience with React and TypeScript required.',
    },
    {
      id: 2,
      title: 'Software Engineer',
      company: 'Cloud Solutions',
      location: 'Remote',
      type: 'Full-time',
      posted: '5 days ago',
      description: 'Join our growing engineering team. Work on cutting-edge cloud technologies and scalable systems.',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'New York, NY',
      type: 'Contract',
      posted: '1 week ago',
      description: 'Looking for a creative designer to help shape our product\'s user experience and visual design.',
    },
    {
      id: 4,
      title: 'Backend Developer',
      company: 'Data Systems',
      location: 'Austin, TX',
      type: 'Full-time',
      posted: '3 days ago',
      description: 'Seeking an experienced backend developer with expertise in Node.js, Python, and database design.',
    },
    {
      id: 5,
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Seattle, WA',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Lead product development initiatives and work closely with engineering and design teams.',
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      company: 'Infrastructure Co.',
      location: 'Remote',
      type: 'Full-time',
      posted: '4 days ago',
      description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure system reliability and scalability.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">Job Listings</h1>
        <p className="text-base-content/70">Find your perfect opportunity</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="select select-bordered w-full pl-10"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="san-francisco">San Francisco</option>
                <option value="new-york">New York</option>
                <option value="austin">Austin</option>
              </select>
            </div>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="select select-bordered w-full pl-10"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            type={job.type}
            posted={job.posted}
            description={job.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
