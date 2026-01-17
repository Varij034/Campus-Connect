// src/pages/LandingPage.jsx
import { Briefcase, Building2, GraduationCap, User } from 'lucide-react';
import FeatureCard from '../components/landing/FeatureCard';
import UserTypeCard from '../components/landing/UserTypeCard';
import { PAGES, USER_TYPES } from '../data/constants';

const LandingPage = ({ onNavigate }) => {
  const handleUserTypeSelect = (userType) => {
    onNavigate(PAGES.DASHBOARD, userType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">CampusConnect</h1>
          </div>
          <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Intelligent Campus Recruitment
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Bridging the gap between talent and opportunity with AI-powered matching
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <UserTypeCard
            icon={<User className="w-12 h-12" />}
            title="Students"
            description="Get AI-based job recommendations and build verified profiles"
            onClick={() => handleUserTypeSelect(USER_TYPES.STUDENT)}
          />
          <UserTypeCard
            icon={<Building2 className="w-12 h-12" />}
            title="TPO Admin"
            description="Centralize placement management with analytics-driven insights"
            onClick={() => handleUserTypeSelect(USER_TYPES.TPO)}
          />
          <UserTypeCard
            icon={<Briefcase className="w-12 h-12" />}
            title="Companies"
            description="Interview only qualified, skill-proven applicants"
            onClick={() => handleUserTypeSelect(USER_TYPES.COMPANY)}
          />
        </div>

        {/* Key Features */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">Why CampusConnect?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="TPO-Verified Profiles"
              description="Institution-backed verification ensures authentic talent"
            />
            <FeatureCard
              title="AI-Powered Matching"
              description="Deep-learning algorithms match skills to opportunities"
            />
            <FeatureCard
              title="Skill-First Hiring"
              description="Automated assessments validate candidate abilities"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;