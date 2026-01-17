// src/components/common/DashboardHeader.jsx
import { GraduationCap } from 'lucide-react';

const DashboardHeader = ({ title, onBackToHome }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Back to Home
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;