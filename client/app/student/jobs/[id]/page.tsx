'use client';

import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Video
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SkillGapCard from '@/components/student/SkillGapCard';

// Mock job data - in production, this would come from an API
const mockJobs: Record<string, any> = {
  '1': {
    id: '1',
    role: 'Frontend Developer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '$80k - $120k',
    match: '85%',
    deadline: '2024-12-31',
    openings: '3',
    description: `We're looking for a talented Frontend Developer to join our dynamic team. You'll work on cutting-edge web applications using React, TypeScript, and modern frontend technologies.

Key Responsibilities:
• Develop and maintain responsive web applications
• Collaborate with design and backend teams
• Write clean, maintainable, and well-documented code
• Participate in code reviews and team meetings
• Stay up-to-date with the latest frontend technologies

This is an exciting opportunity to work on innovative projects and grow your career in a supportive environment.`,
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '2+ years of experience with React and TypeScript',
      'Strong understanding of HTML, CSS, and JavaScript',
      'Experience with state management libraries (Redux, Zustand)',
      'Familiarity with testing frameworks (Jest, React Testing Library)',
      'Good communication and teamwork skills'
    ],
    interviewProcess: [
      {
        stage: 1,
        name: 'Initial Screening',
        description: 'Phone call with HR to discuss your background and interest',
        duration: '30 minutes'
      },
      {
        stage: 2,
        name: 'Technical Assessment',
        description: 'Coding challenge to evaluate your problem-solving skills',
        duration: '1 hour'
      },
      {
        stage: 3,
        name: 'Technical Interview',
        description: 'Deep dive into your technical skills with the engineering team',
        duration: '1.5 hours'
      },
      {
        stage: 4,
        name: 'Final Round',
        description: 'Meet with the team lead and discuss culture fit',
        duration: '45 minutes'
      }
    ],
    requiredSkills: [
      {
        name: 'React',
        studentLevel: 75,
        requiredLevel: 80,
        gap: 5,
        priority: 'Must Have' as const
      },
      {
        name: 'TypeScript',
        studentLevel: 60,
        requiredLevel: 70,
        gap: 10,
        priority: 'Must Have' as const
      },
      {
        name: 'CSS/SCSS',
        studentLevel: 85,
        requiredLevel: 80,
        gap: 0,
        priority: 'Must Have' as const
      },
      {
        name: 'Redux',
        studentLevel: 50,
        requiredLevel: 65,
        gap: 15,
        priority: 'Nice to Have' as const
      },
      {
        name: 'Jest',
        studentLevel: 40,
        requiredLevel: 60,
        gap: 20,
        priority: 'Nice to Have' as const
      }
    ],
    scheduleDetails: {
      date: '2024-01-15',
      time: '10:00 AM PST',
      mode: 'Video Call',
      duration: '1.5 hours'
    },
    companyInfo: {
      name: 'Tech Innovations Inc.',
      industry: 'Technology',
      size: '50-200 employees',
      website: 'techinnovations.com',
      description: 'Tech Innovations Inc. is a leading technology company focused on creating innovative solutions for businesses worldwide. We value creativity, collaboration, and continuous learning.'
    }
  }
};

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [isApplied, setIsApplied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const jobId = params?.id as string;
  const job = mockJobs[jobId];

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content mb-4">Job not found</h2>
          <button
            onClick={() => router.push('/student/jobs')}
            className="btn btn-primary"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    setIsApplied(true);
    setToastMessage(`Application submitted successfully for ${job.role} at ${job.company}!`);
    setShowToast(true);

    // In production, make API call here
    setTimeout(() => {
      router.push('/student/jobs');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className="alert alert-success shadow-lg">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Application Submitted! 🎉</h3>
              <div className="text-xs">{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/student/jobs')}
          className="btn btn-ghost gap-2 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {/* Job Header Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-2xl mb-6">
          <div className="card-body p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-base-content/20 rounded-lg backdrop-blur-sm">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{job.role}</h1>
                    <p className="text-xl opacity-90">{job.company}</p>
                  </div>
                </div>
                
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-semibold">{job.salary}</span>
                  </div>
                </div>
              </div>

              {/* Match Badge */}
              <div className="flex flex-col items-center gap-2 bg-base-content/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                <Award className="w-8 h-8" />
                <span className="text-3xl font-bold">{job.match}</span>
                <span className="text-sm opacity-80">Match Score</span>
              </div>
            </div>

            {/* Deadline & Openings */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-base-content/20">
              <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Deadline: <strong>{job.deadline}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-base-content/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Openings: <strong>{job.openings}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Job Description
                </h2>
                <div className="text-base-content/80 whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-success" />
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 bg-base-200 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-base-content/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Process */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Interview Process
                </h2>
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
                  
                  <div className="space-y-6">
                    {job.interviewProcess.map((stage: any) => (
                      <div key={stage.stage} className="relative flex gap-4">
                        {/* Stage Number Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold shadow-lg">
                            {stage.stage}
                          </div>
                        </div>
                        
                        {/* Stage Content */}
                        <div className="flex-1 card bg-base-200 border border-base-300">
                          <div className="card-body p-4">
                            <h3 className="font-bold text-base-content mb-1 text-lg">{stage.name}</h3>
                            <p className="text-sm text-base-content/70 mb-2">{stage.description}</p>
                            <div className="badge badge-primary gap-2">
                              <Clock className="w-3 h-3" />
                              {stage.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Gap Analysis - Full Width */}
            <div className="card bg-gradient-to-br from-secondary/10 to-primary/10 border-2 border-secondary/30 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold text-base-content mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                  Skill Gap Analysis
                </h2>
                <p className="text-sm text-base-content/70 mb-6">
                  Compare your skills with this job's requirements. Focus on gaps to boost your chances!
                </p>
                <SkillGapCard skills={job.requiredSkills} />
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Schedule Card */}
            <div className="card bg-gradient-to-br from-warning/10 to-error/10 border-2 border-warning/30 shadow-lg ">
              <div className="card-body">
                <h2 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-warning" />
                  Interview Schedule
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 card bg-base-100 border border-base-300">
                    <div className="card-body p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Date</p>
                          <p className="font-bold text-base-content">{job.scheduleDetails.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 card bg-base-100 border border-base-300">
                    <div className="card-body p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-info/20 rounded-lg">
                          <Clock className="w-5 h-5 text-info" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Time</p>
                          <p className="font-bold text-base-content">{job.scheduleDetails.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 card bg-base-100 border border-base-300">
                    <div className="card-body p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                          <Video className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Mode</p>
                          <p className="font-bold text-base-content">{job.scheduleDetails.mode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 card bg-base-100 border border-base-300">
                    <div className="card-body p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/20 rounded-lg">
                          <Clock className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Duration</p>
                          <p className="font-bold text-base-content">{job.scheduleDetails.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h2 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  About Company
                </h2>
                <div className="space-y-4">
                  <div className="p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Company Name</p>
                    <p className="font-bold text-base-content">{job.companyInfo.name}</p>
                  </div>
                  <div className="p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Industry</p>
                    <p className="font-semibold text-base-content">{job.companyInfo.industry}</p>
                  </div>
                  <div className="p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Company Size</p>
                    <p className="font-semibold text-base-content">{job.companyInfo.size}</p>
                  </div>
                  <div className="p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">Website</p>
                    <a 
                      href={`https://${job.companyInfo.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary-focus font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      {job.companyInfo.website}
                    </a>
                  </div>
                  <div className="pt-3 border-t border-base-300">
                    <p className="text-sm text-base-content/80">{job.companyInfo.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button Card */}
            <div className="card bg-gradient-to-r from-primary to-secondary shadow-xl">
              <div className="card-body">
                <button
                  onClick={handleApply}
                  disabled={isApplied}
                  className={`btn w-full text-lg font-bold ${
                    isApplied
                      ? 'btn-success cursor-not-allowed'
                      : 'btn-base-100 text-primary hover:bg-base-200'
                  }`}
                >
                  {isApplied ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Applied Successfully
                    </span>
                  ) : (
                    'Apply Now →'
                  )}
                </button>

                {!isApplied && (
                  <p className="text-xs text-primary-content/80 text-center mt-3">
                    ✨ One click away from your dream job!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
