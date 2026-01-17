'use client';

import { motion } from 'framer-motion';
import StatCard from '@/components/ui/StatCard';
import JobCard from '@/components/ui/JobCard';
import ProfileSection from '@/components/student/ProfileSection';
import DailyPracticeSection from '@/components/student/DailyPracticeSection';
import SkillBar from '@/components/student/SkillBar';
import StudentJobCard from '@/components/student/StudentJobCard';
import { FileText, Calendar, Eye, TrendingUp, Briefcase, Search, Flame } from 'lucide-react';
import Link from 'next/link';

// Mock data
const profileData = {
  sid: 'STU2024001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  college: 'ABC University',
  branch: 'Computer Science',
  year: 'Final Year',
  graduationYear: '2024',
  location: 'Bangalore, India',
  cgpa: '8.5',
  resume: {
    name: 'John_Doe_Resume.pdf',
    url: '#',
  },
  isVerified: true,
  profileCompletion: 85,
};

const recommendedJobs = [
  {
    id: 1,
    company: 'Tech Corp',
    role: 'Software Engineer',
    match: '95%',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹8-12 LPA',
  },
  {
    id: 2,
    company: 'InnovateLabs',
    role: 'Frontend Developer',
    match: '88%',
    location: 'Remote',
    type: 'Full-time',
    salary: '₹6-10 LPA',
  },
  {
    id: 3,
    company: 'DataSystems',
    role: 'ML Engineer',
    match: '82%',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹10-15 LPA',
  },
];

export default function StudentDashboard() {
  const currentStreak = 5;
  const longestStreak = 12;
  const solvedToday = false;
  const jobMatchesCount = recommendedJobs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">Welcome back, Student!</h1>
        <p className="text-base-content/70">Here's your job hunting overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Profile Score"
          value="85%"
          icon={TrendingUp}
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Job Matches"
          value={jobMatchesCount}
          icon={Briefcase}
          color="primary"
          delay={0.2}
        />
        <StatCard
          title="Applications"
          value={5}
          icon={FileText}
          color="secondary"
          delay={0.3}
        />
        <StatCard
          title="Current Streak"
          value={`${currentStreak}🔥`}
          icon={Flame}
          color="warning"
          delay={0.4}
        />
      </div>

      {/* Profile Section and AI Recommended Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileSection 
          profileData={profileData}
        />

        {/* AI Recommended Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h3 className="card-title text-xl text-base-content mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              AI Recommended Jobs
            </h3>
            <div className="space-y-3">
              {recommendedJobs.map((job, index) => (
                <StudentJobCard 
                  key={job.id}
                  job={job}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Practice Section */}
      <DailyPracticeSection
        solvedToday={solvedToday}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      {/* Skill Insights and Application Status Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h3 className="card-title text-xl text-base-content mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Skills Overview
            </h3>
            <div className="space-y-3">
              <SkillBar skill="React.js" level={90} />
              <SkillBar skill="Node.js" level={75} />
              <SkillBar skill="System Design" level={60} recommended />
            </div>
            <p className="text-sm text-base-content/70 mt-4 italic">
              💡 View detailed skill gap analysis for each job in the job details page!
            </p>
          </div>
        </motion.div>

        {/* Application Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card bg-base-100 shadow-lg"
        >
          <div className="card-body">
            <h2 className="card-title text-xl text-base-content mb-4">Application Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div>
                  <p className="font-semibold text-base-content">Frontend Developer - Tech Innovations</p>
                  <p className="text-sm text-base-content/70">Applied 3 days ago</p>
                </div>
                <div className="badge badge-primary">Under Review</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div>
                  <p className="font-semibold text-base-content">Software Engineer - Cloud Solutions</p>
                  <p className="text-sm text-base-content/70">Applied 1 week ago</p>
                </div>
                <div className="badge badge-success">Interview Scheduled</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div>
                  <p className="font-semibold text-base-content">UI/UX Designer - Creative Studio</p>
                  <p className="text-sm text-base-content/70">Applied 2 weeks ago</p>
                </div>
                <div className="badge badge-warning">Pending</div>
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <Link href="/student/applications" className="btn btn-primary btn-sm">
                View All Applications
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Job Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-base-content">Recommended for You</h2>
          <Link href="/student/jobs" className="link link-primary">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCard
            title="Frontend Developer"
            company="Tech Innovations Inc."
            location="San Francisco, CA"
            type="Full-time"
            posted="2 days ago"
            description="We're looking for a talented frontend developer to join our team. Experience with React and TypeScript required."
            delay={0.1}
          />
          <JobCard
            title="Software Engineer"
            company="Cloud Solutions"
            location="Remote"
            type="Full-time"
            posted="5 days ago"
            description="Join our growing engineering team. Work on cutting-edge cloud technologies and scalable systems."
            delay={0.2}
          />
          <JobCard
            title="UI/UX Designer"
            company="Creative Studio"
            location="New York, NY"
            type="Contract"
            posted="1 week ago"
            description="Looking for a creative designer to help shape our product's user experience and visual design."
            delay={0.3}
          />
        </div>
      </motion.div>
    </div>
  );
}
