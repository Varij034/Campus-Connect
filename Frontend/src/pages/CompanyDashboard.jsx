// src/pages/CompanyDashboard.jsx
import DashboardHeader from '../components/common/DashboardHeader';
import StatCard from '../components/common/StatCard';
import CandidateCard from '../components/company/CandidateCard';
import PipelineStage from '../components/company/PipelineStage';
import { PAGES } from '../data/constants';

const CompanyDashboard = ({ onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Company Portal" 
        onBackToHome={() => onNavigate(PAGES.LANDING)}
        onLogout={onLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Jobs" value="3" color="blue" />
          <StatCard title="Total Applicants" value="245" color="purple" />
          <StatCard title="Qualified" value="87" color="green" />
          <StatCard title="Hired" value="12" color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Post New Job */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Post New Position</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Required Skills"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Experience Level</option>
                <option>Fresher</option>
                <option>1-2 years</option>
                <option>3+ years</option>
              </select>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Post Job & Auto-Match
              </button>
            </div>
          </div>

          {/* Top Candidates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">AI-Matched Candidates</h3>
            <div className="space-y-3">
              <CandidateCard name="Alice Johnson" match="96%" skills="React, Node.js" verified />
              <CandidateCard name="Bob Smith" match="92%" skills="Python, ML" verified />
              <CandidateCard name="Carol White" match="88%" skills="Java, Spring" verified />
            </div>
          </div>
        </div>

        {/* Application Pipeline */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Hiring Pipeline</h3>
          <div className="grid grid-cols-4 gap-4">
            <PipelineStage title="Applied" count="245" />
            <PipelineStage title="Test Qualified" count="87" />
            <PipelineStage title="Interview" count="34" />
            <PipelineStage title="Offered" count="12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;