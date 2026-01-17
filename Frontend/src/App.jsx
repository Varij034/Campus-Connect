// src/App.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { PAGES, USER_TYPES } from './data/constants';
import CompanyDashboard from './pages/CompanyDashboard';
import EditProfilePage from './pages/EditProfilePage';
import JobDetailsPage from './pages/JobDetailsPage';
import LandingPage from './pages/LandingPage';
import PracticePage from './pages/PracticePage';
import StudentDashboard from './pages/StudentDashboard';
import TPODashboard from './pages/TPODashboard';

function App() {
  const [userType, setUserType] = useState(USER_TYPES.STUDENT);
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [longestStreak, setLongestStreak] = useState(15);
  const [solvedToday, setSolvedToday] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  
  // Student profile data (in real app, this would come from backend/API)
  const [profileData, setProfileData] = useState({
    sid: 'STU2024001',
    name: 'John Doe',
    college: 'ABC University',
    branch: 'Computer Science',
    cgpa: '8.5',
    email: 'john.doe@example.com',
    phone: '9876543210',
    skills: 'React.js, Node.js, Python',
    resume: null,
    isVerified: true
  });

  const handleNavigation = (page, type = null) => {
    setCurrentPage(page);
    if (type) setUserType(type);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setCurrentPage(PAGES.JOB_DETAILS);
  };

  const handleApplyJob = (jobId) => {
    setAppliedJobs([...appliedJobs, jobId]);
    // In real app, make API call here to submit application
    console.log('Job application submitted for job ID:', jobId);
  };

  const handlePracticeComplete = (passed) => {
    setSolvedToday(true);
    if (passed) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
      }
    }
  };

  const handleSaveProfile = (updatedData) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedData
    }));
    console.log('Profile data ready for backend:', updatedData);
  };

  // Scroll to top whenever page changes
  const handleNavigationWithScroll = (page, type = null) => {
    handleNavigation(page, type);
    window.scrollTo(0, 0); // Scroll to top
  };

  const handleJobClickWithScroll = (job) => {
    handleJobClick(job);
    window.scrollTo(0, 0); // Scroll to top
  };

  return (
    <div>
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {currentPage === PAGES.LANDING && (
        <LandingPage onNavigate={handleNavigationWithScroll} />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.STUDENT && (
        <StudentDashboard
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          solvedToday={solvedToday}
          profileData={profileData}
          onNavigate={handleNavigationWithScroll}
          onJobClick={handleJobClickWithScroll}
        />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.TPO && (
        <TPODashboard onNavigate={handleNavigationWithScroll} />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.COMPANY && (
        <CompanyDashboard onNavigate={handleNavigationWithScroll} />
      )}
      
      {currentPage === PAGES.PRACTICE && (
        <PracticePage
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          onNavigate={handleNavigationWithScroll}
          onComplete={handlePracticeComplete}
        />
      )}

      {currentPage === PAGES.EDIT_PROFILE && (
        <EditProfilePage
          profileData={profileData}
          onSave={handleSaveProfile}
          onNavigate={handleNavigationWithScroll}
        />
      )}

      {currentPage === PAGES.JOB_DETAILS && (
        <JobDetailsPage
          job={selectedJob}
          onNavigate={handleNavigationWithScroll}
          onApply={handleApplyJob}
        />
      )}
    </div>
  );
}

export default App;
