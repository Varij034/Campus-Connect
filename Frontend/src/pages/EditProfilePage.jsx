// src/pages/EditProfilePage.jsx
import { ArrowLeft, FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardHeader from '../components/common/DashboardHeader';
import { PAGES } from '../data/constants';

const EditProfilePage = ({ profileData, onSave, onNavigate }) => {
  const [formData, setFormData] = useState({
    college: profileData.college,
    branch: profileData.branch,
    cgpa: profileData.cgpa,
    email: profileData.email || '',
    phone: profileData.phone || '',
    skills: profileData.skills || '',
    resume: profileData.resume
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload only PDF files', {
          icon: '📄',
        });
        setErrors(prev => ({ ...prev, resume: 'Please upload only PDF files' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB', {
          icon: '⚠️',
        });
        setErrors(prev => ({ ...prev, resume: 'File size should be less than 5MB' }));
        return;
      }
      
      setResumeFile(file);
      // Create a temporary URL for the PDF (in real app, this would be uploaded to server)
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        resume: {
          name: file.name,
          url: url,
          uploadDate: new Date().toISOString()
        }
      }));
      setErrors(prev => ({ ...prev, resume: '' }));
      
      toast.success('Resume uploaded successfully!', {
        icon: '📎',
      });
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setFormData(prev => ({
      ...prev,
      resume: null
    }));
    toast.success('Resume removed', {
      icon: '🗑️',
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.college.trim()) {
      newErrors.college = 'College name is required';
    }
    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    }
    if (!formData.cgpa || formData.cgpa < 0 || formData.cgpa > 10) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Show loading toast
      const loadingToast = toast.loading('Updating profile...');
      
      // Simulate API call delay (remove this in production)
      setTimeout(() => {
        // In real app, this would send data to backend
        onSave(formData);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Show success toast
        toast.success('Profile updated successfully!', {
          icon: '✅',
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          onNavigate(PAGES.DASHBOARD);
        }, 500);
      }, 1000);
    } else {
      // Show error toast if validation fails
      toast.error('Please fix the errors in the form', {
        icon: '❌',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Edit Profile" 
        onBackToHome={() => onNavigate(PAGES.LANDING)}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate(PAGES.DASHBOARD)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Update Your Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Non-editable fields */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={profileData.sid}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 italic">
                * These fields cannot be edited
              </p>
            </div>

            {/* Editable fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.college ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.college && (
                  <p className="text-red-500 text-xs mt-1">{errors.college}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.branch ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.branch && (
                  <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.cgpa ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cgpa && (
                  <p className="text-red-500 text-xs mt-1">{errors.cgpa}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Node.js, Python..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF only, max 5MB)
              </label>
              
              {formData.resume ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{formData.resume.name}</p>
                      <p className="text-xs text-green-600">
                        {resumeFile ? 'New file selected' : 'Current resume'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Upload a file
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF only, up to 5MB</p>
                </div>
              )}
              
              {errors.resume && (
                <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => onNavigate(PAGES.DASHBOARD)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Note for developers */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note for Backend Integration:</strong> This form is ready for API integration. 
            The resume file will need to be uploaded to your file storage service (AWS S3, Cloudinary, etc.), 
            and the form data can be sent to your backend endpoint.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;