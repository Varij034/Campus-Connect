// src/pages/StudentDashboard.jsx
import { Search, TrendingUp } from 'lucide-react';
import DashboardHeader from '../components/common/DashboardHeader';
import StatCard from '../components/common/StatCard';
import ProfileSection from '../components/student/ProfileSection';
import JobCard from '../components/student/JobCard';
import SkillBar from '../components/student/SkillBar';
import DailyPracticeSection from '../components/student/DailyPracticeSection';
import { PAGES } from '../data/constants';
import { jobsData } from '../data/jobsData';

const StudentDashboard = ({ 
  currentStreak, 
  longestStreak, 
  solvedToday,
  profileData,
  onNavigate,
  onJobClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Student Dashboard" 
        onBackToHome={() => onNavigate(PAGES.LANDING)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Profile Score" value="85%" color="green" />
          <StatCard title="Job Matches" value={jobsData.length} color="blue" />
          <StatCard title="Applications" value="5" color="purple" />
          <StatCard title="Current Streak" value={`${currentStreak}🔥`} color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileSection 
            profileData={profileData}
            onEditProfile={() => onNavigate(PAGES.EDIT_PROFILE)}
          />

          {/* Recommended Jobs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              AI Recommended Jobs
            </h3>
            <div className="space-y-3">
              {jobsData.map((job) => (
                <JobCard 
                  key={job.id}
                  job={job}
                  onApplyClick={onJobClick}
                />
              ))}
            </div>
          </div>
        </div>

        <DailyPracticeSection
          solvedToday={solvedToday}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          onStartPractice={() => onNavigate(PAGES.PRACTICE)}
        />

        {/* Skill Insights */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Skills Overview
          </h3>
          <div className="space-y-3">
            <SkillBar skill="React.js" level={90} />
            <SkillBar skill="Node.js" level={75} />
            <SkillBar skill="System Design" level={60} recommended />
          </div>
          <p className="text-sm text-gray-600 mt-4 italic">
            💡 View detailed skill gap analysis for each job in the job details page!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
