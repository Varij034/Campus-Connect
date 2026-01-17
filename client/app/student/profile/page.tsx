'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    bio: 'Passionate software developer with expertise in React and TypeScript. Looking for opportunities to grow and contribute to innovative projects.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    education: 'Bachelor of Science in Computer Science',
    experience: '2 years',
    resume: '',
  });

  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">My Profile</h1>
        <p className="text-base-content/70">Manage your profile information</p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl text-base-content mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Location</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl text-base-content mb-4">Bio</h2>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </motion.div>

            {/* Education & Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl text-base-content mb-4">Education & Experience</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Education</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Experience</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <h2 className="card-title text-xl text-base-content mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill) => (
                    <div key={skill} className="badge badge-primary gap-2">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-error"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add skill"
                    className="input input-bordered input-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn btn-primary btn-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Resume Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <h2 className="card-title text-xl text-base-content mb-4">Resume</h2>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="file-input file-input-bordered w-full"
                />
                {formData.resume && (
                  <p className="text-sm text-base-content/70 mt-2">Current: {formData.resume}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-end"
        >
          <button type="submit" className="btn btn-primary btn-lg">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </motion.div>
      </form>
    </div>
  );
}
