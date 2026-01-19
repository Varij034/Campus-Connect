// TypeScript types matching backend schemas

export enum UserRole {
  STUDENT = "student",
  RECRUITER = "recruiter",
  ADMIN = "admin",
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  role: UserRole;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  description?: string;
  location?: string;
  salary?: string;
  requirements_json: Record<string, any>;
  created_by: number;
  created_at: string;
  updated_at?: string;
  application_count?: number;
}

export interface JobCreate {
  title: string;
  company: string;
  description?: string;
  location?: string;
  salary?: string;
  requirements_json: Record<string, any>;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  status: ApplicationStatus;
  applied_at: string;
  updated_at?: string;
}

export enum ApplicationStatus {
  PENDING = "pending",
  REVIEWING = "reviewing",
  SHORTLISTED = "shortlisted",
  REJECTED = "rejected",
  ACCEPTED = "accepted",
}

export interface Candidate {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  skills_json?: string[];
  resume_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiError {
  detail: string;
}

export interface JobSearchRequest {
  query: string;
  student_skills: string[];
  top_k?: number;
}

export interface JobSearchResponse {
  job_id: number;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  match_score: number;
  application_status: string;
  missing_skills: string[];
  matched_skills: string[];
  message: string;
  required_skills: string[];
}

// ATS Types
export interface JobRequirement {
  job_title: string;
  required_skills: string[];
  preferred_skills?: string[];
  education_level?: string;
  years_of_experience?: number;
  job_description?: string;
  keywords?: string[];
  minimum_ats_score?: number;
}

export interface ATSScoreRequest {
  resume_id?: string;
  resume_text?: string;
  job_requirement: JobRequirement;
}

export interface ATSScoreResponse {
  evaluation_id: number;
  ats_score: number;
  passed: boolean;
  skill_match_score: number;
  education_score: number;
  experience_score: number;
  keyword_match_score: number;
  format_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface EvaluationResponse {
  id: number;
  application_id: number;
  ats_score: number;
  passed: boolean;
  skill_match_score?: number;
  education_score?: number;
  experience_score?: number;
  keyword_match_score?: number;
  format_score?: number;
  matched_skills_json?: string[];
  missing_skills_json?: string[];
  feedback_id?: string;
  created_at: string;
}

export interface BatchScoreRequest {
  requests: ATSScoreRequest[];
}

export interface BatchScoreResponse {
  results: (ATSScoreResponse | { error: string })[];
  total: number;
}

// Chat Types
export interface ChatMessageRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatMessageResponse {
  response: string;
  data?: Record<string, any> | any[];
  conversation_id?: string;
}
