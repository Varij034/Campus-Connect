// src/components/student/ProfileSection.jsx
import { CheckCircle, Eye, FileText, User } from 'lucide-react';

const ProfileField = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="ml-2 font-medium">{value}</span>
  </div>
);

const ProfileSection = ({ profileData, onEditProfile }) => {
  const { sid, name, college, branch, cgpa, resume, isVerified } = profileData;

  const handleViewResume = () => {
    if (resume) {
      // Open PDF in new tab
      window.open(resume.url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Your Profile
      </h3>
      <div className="space-y-3">
        <ProfileField label="Student ID" value={sid} />
        <ProfileField label="Name" value={name} />
        <ProfileField label="College" value={college} />
        <ProfileField label="Branch" value={branch} />
        <ProfileField label="CGPA" value={cgpa} />
        
        {/* Resume Section */}
        <div className="pt-2 border-t">
          <span className="text-sm text-gray-600 block mb-2">Resume:</span>
          {resume ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">{resume.name}</span>
              </div>
              <button
                onClick={handleViewResume}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="text-sm text-gray-500">No resume uploaded</span>
            </div>
          )}
        </div>

        {isVerified && (
          <div className="flex items-center gap-2 text-sm pt-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">TPO Verified</span>
          </div>
        )}
      </div>
      <button 
        onClick={onEditProfile}
        className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Update Profile
      </button>
    </div>
  );
};

export default ProfileSection;