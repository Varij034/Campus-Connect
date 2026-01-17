'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Briefcase, MapPin, Clock } from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  location: string;
  type: string;
  status: 'active' | 'draft' | 'closed';
  applications: number;
  postedDate: string;
}

export default function PostingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [postings] = useState<JobPosting[]>([
    {
      id: 1,
      title: 'Frontend Developer',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'active',
      applications: 24,
      postedDate: '2024-01-10',
    },
    {
      id: 2,
      title: 'Software Engineer',
      location: 'Remote',
      type: 'Full-time',
      status: 'active',
      applications: 18,
      postedDate: '2024-01-08',
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      location: 'New York, NY',
      type: 'Contract',
      status: 'draft',
      applications: 0,
      postedDate: '2024-01-12',
    },
    {
      id: 4,
      title: 'Backend Developer',
      location: 'Austin, TX',
      type: 'Full-time',
      status: 'closed',
      applications: 45,
      postedDate: '2024-01-05',
    },
  ]);

  const getStatusBadge = (status: JobPosting['status']) => {
    const badges = {
      active: 'badge-success',
      draft: 'badge-warning',
      closed: 'badge-error',
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-base-content mb-2">Job Postings</h1>
          <p className="text-base-content/70">Manage your job openings</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Posting
        </motion.button>
      </div>

      {/* Postings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postings.map((posting, index) => (
          <motion.div
            key={posting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex justify-between items-start mb-2">
                <h3 className="card-title text-xl text-base-content">{posting.title}</h3>
                <div className={`badge ${getStatusBadge(posting.status)}`}>
                  {posting.status}
                </div>
              </div>
              <div className="space-y-2 text-sm text-base-content/70 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{posting.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{posting.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted: {new Date(posting.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-base-content/70">Applications</p>
                  <p className="text-2xl font-bold text-primary">{posting.applications}</p>
                </div>
              </div>
              <div className="card-actions justify-end">
                <button className="btn btn-ghost btn-sm">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm text-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Posting Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Job Posting</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Job Title</span>
                </label>
                <input type="text" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input type="text" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Job Type</span>
                </label>
                <select className="select select-bordered w-full">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea className="textarea textarea-bordered w-full h-32" />
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-primary">
                Create Posting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
