// src/pages/TPODashboard.jsx
import DashboardHeader from '../components/common/DashboardHeader';
import StatCard from '../components/common/StatCard';
import VerificationItem from '../components/tpo/VerificationItem';
import { PAGES } from '../data/constants';

const TPODashboard = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="TPO Admin Dashboard" 
        onBackToHome={() => onNavigate(PAGES.LANDING)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value="2,450" color="blue" />
          <StatCard title="Verified Profiles" value="2,201" color="green" />
          <StatCard title="Active Companies" value="45" color="purple" />
          <StatCard title="Placements" value="312" color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Verification Queue */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Pending Verifications</h3>
            <div className="space-y-3">
              <VerificationItem name="Alice Johnson" branch="CSE" status="pending" />
              <VerificationItem name="Bob Smith" branch="ECE" status="pending" />
              <VerificationItem name="Carol White" branch="ME" status="pending" />
            </div>
          </div>

          {/* Placement Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Placement Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Placement Rate</span>
                <span className="text-2xl font-bold text-green-600">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Package</span>
                <span className="text-2xl font-bold text-blue-600">₹8.5L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Package</span>
                <span className="text-2xl font-bold text-purple-600">₹42L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Coordination */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Company Drives</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Applicants</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">Tech Corp</td>
                  <td className="px-4 py-2">SDE</td>
                  <td className="px-4 py-2">156</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">InnovateLabs</td>
                  <td className="px-4 py-2">Frontend Dev</td>
                  <td className="px-4 py-2">89</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Upcoming</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPODashboard;