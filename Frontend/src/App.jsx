// src/App.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { PAGES, USER_TYPES } from './data/constants';
import CompanyDashboard from './pages/CompanyDashboard';
import EditProfilePage from './pages/EditProfilePage';
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
    resume: null, // Will store { name: 'resume.pdf', url: 'blob:...', uploadDate: '...' }
    isVerified: true
  });

  const handleNavigation = (page, type = null) => {
    setCurrentPage(page);
    if (type) setUserType(type);
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
    // Update profile data in state
    setProfileData(prev => ({
      ...prev,
      ...updatedData
    }));
    
    // In real app, this is where you would make API call to backend:
    // await api.updateProfile(profileData.sid, updatedData);
    console.log('Profile data ready for backend:', updatedData);
  };

  return (
    <div>
      {/* Toast Container - Add this at the top level */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '16px',
          },
          // Success toast style
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          // Error toast style
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
        <LandingPage onNavigate={handleNavigation} />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.STUDENT && (
        <StudentDashboard
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          solvedToday={solvedToday}
          profileData={profileData}
          onNavigate={handleNavigation}
        />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.TPO && (
        <TPODashboard onNavigate={handleNavigation} />
      )}
      
      {currentPage === PAGES.DASHBOARD && userType === USER_TYPES.COMPANY && (
        <CompanyDashboard onNavigate={handleNavigation} />
      )}
      
      {currentPage === PAGES.PRACTICE && (
        <PracticePage
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          onNavigate={handleNavigation}
          onComplete={handlePracticeComplete}
        />
      )}

      {currentPage === PAGES.EDIT_PROFILE && (
        <EditProfilePage
          profileData={profileData}
          onSave={handleSaveProfile}
          onNavigate={handleNavigation}
        />
      )}
    </div>
  );
}

export default App;