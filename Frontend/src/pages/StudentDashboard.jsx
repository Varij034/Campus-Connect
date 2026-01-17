// src/pages/StudentDashboard.jsx
import { Search, TrendingUp } from 'lucide-react';
import DashboardHeader from '../components/common/DashboardHeader';
import StatCard from '../components/common/StatCard';
import DailyPracticeSection from '../components/student/DailyPracticeSection';
import JobCard from '../components/student/JobCard';
import ProfileSection from '../components/student/ProfileSection';
import SkillBar from '../components/student/SkillBar';
import { PAGES } from '../data/constants';

const StudentDashboard = ({ 
  currentStreak, 
  longestStreak, 
  solvedToday,
  profileData,
  onNavigate 
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
          <StatCard title="Job Matches" value="12" color="blue" />
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
              <JobCard company="Tech Corp" role="Software Engineer" match="95%" />
              <JobCard company="InnovateLabs" role="Frontend Developer" match="88%" />
              <JobCard company="DataSystems" role="ML Engineer" match="82%" />
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
            Skill Gap Insights
          </h3>
          <div className="space-y-3">
            <SkillBar skill="React.js" level={90} />
            <SkillBar skill="Node.js" level={75} />
            <SkillBar skill="System Design" level={60} recommended />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;