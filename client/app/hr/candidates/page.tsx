'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Briefcase, MapPin, Star, Download } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  title: string;
  location: string;
  experience: string;
  matchScore: number;
  skills: string[];
  appliedFor: string;
  appliedDate: string;
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates] = useState<Candidate[]>([
    {
      id: 1,
      name: 'John Doe',
      title: 'Frontend Developer',
      location: 'San Francisco, CA',
      experience: '3 years',
      matchScore: 95,
      skills: ['React', 'TypeScript', 'Node.js'],
      appliedFor: 'Frontend Developer',
      appliedDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      title: 'Software Engineer',
      location: 'Remote',
      experience: '5 years',
      matchScore: 88,
      skills: ['Python', 'Django', 'PostgreSQL'],
      appliedFor: 'Software Engineer',
      appliedDate: '2024-01-14',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      title: 'UI/UX Designer',
      location: 'New York, NY',
      experience: '2 years',
      matchScore: 92,
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      appliedFor: 'UI/UX Designer',
      appliedDate: '2024-01-13',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      title: 'Backend Developer',
      location: 'Austin, TX',
      experience: '4 years',
      matchScore: 90,
      skills: ['Java', 'Spring Boot', 'MongoDB'],
      appliedFor: 'Backend Developer',
      appliedDate: '2024-01-12',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">Candidates</h1>
        <p className="text-base-content/70">Browse and filter candidate profiles</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
            <button className="btn btn-outline">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-16">
                    <span className="text-xl">{candidate.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-base-content">{candidate.name}</h3>
                      <div className="badge badge-primary gap-1">
                        <Star className="w-3 h-3" />
                        {candidate.matchScore}% Match
                      </div>
                    </div>
                    <p className="text-primary font-semibold mb-2">{candidate.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-base-content/70 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{candidate.experience}</span>
                      </div>
                      <div>
                        <span className="text-base-content/60">Applied for: </span>
                        <span className="font-semibold">{candidate.appliedFor}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.map((skill) => (
                        <div key={skill} className="badge badge-outline">
                          {skill}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-base-content/60">
                      Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn btn-primary btn-sm">View Profile</button>
                  <button className="btn btn-secondary btn-sm">Shortlist</button>
                  <button className="btn btn-ghost btn-sm">
                    <Download className="w-4 h-4" />
                    Resume
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
