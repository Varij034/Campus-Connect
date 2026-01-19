"""
Chat Engine for HR AI Assistant
Handles intent classification, data retrieval, and response generation
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from database.models import Job, Candidate, Application, Evaluation, ApplicationStatus
from database.schemas import JobResponse, CandidateResponse, EvaluationResponse


class IntentClassifier:
    """Classifies user queries into specific intents"""
    
    # Intent patterns
    JOB_PATTERNS = [
        r'\b(jobs?|postings?|openings?|positions?|vacancies?|roles?)\b',
        r'\bshow.*jobs?\b',
        r'\blist.*jobs?\b',
        r'\bget.*jobs?\b',
        r'\bfind.*jobs?\b',
    ]
    
    CANDIDATE_PATTERNS = [
        r'\b(candidates?|applicants?|people|profiles?)\b',
        r'\bshow.*candidates?\b',
        r'\blist.*candidates?\b',
        r'\bget.*candidates?\b',
        r'\bfind.*candidates?\b',
    ]
    
    EVALUATION_PATTERNS = [
        r'\b(ats.*score|evaluation|score|rating|assessment)\b',
        r'\bhow.*score\b',
        r'\bwhat.*score\b',
        r'\bget.*score\b',
        r'\bshow.*score\b',
    ]
    
    STATISTICS_PATTERNS = [
        r'\b(statistics?|stats?|summary|overview|dashboard|count|total|how many)\b',
        r'\bshow.*statistics?\b',
        r'\bget.*statistics?\b',
    ]
    
    JOB_DETAIL_PATTERNS = [
        r'\bjob\s+(\d+)\b',
        r'\bjob\s+#(\d+)\b',
        r'\bposition\s+(\d+)\b',
        r'\bdetails?\s+for\s+job\s+(\d+)\b',
    ]
    
    CANDIDATE_DETAIL_PATTERNS = [
        r'\bcandidate\s+(\d+)\b',
        r'\bcandidate\s+#(\d+)\b',
        r'\bapplicant\s+(\d+)\b',
        r'\bdetails?\s+for\s+candidate\s+(\d+)\b',
    ]
    
    SKILL_SEARCH_PATTERNS = [
        r'\bwith\s+(\w+(?:\s+\w+)*)\s+skills?\b',
        r'\b(\w+(?:\s+\w+)*)\s+skills?\b',
        r'\bwho\s+knows?\s+(\w+(?:\s+\w+)*)\b',
    ]
    
    APPLICATION_COUNT_PATTERNS = [
        r'\bhow\s+many\s+(applications?|candidates?|applicants?)\b',
        r'\bcount\s+of\s+(applications?|candidates?)\b',
        r'\bnumber\s+of\s+(applications?|candidates?)\b',
    ]
    
    # Pattern to extract candidate name (after "candidate" or "of candidate")
    CANDIDATE_NAME_PATTERNS = [
        r'\b(?:of|for|show|get|evaluations?\s+of|evaluations?\s+for)\s+(?:candidate|applicant)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)',
        r'\bcandidate\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)',
        r'\bapplicant\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)',
        # Pattern for "show evaluations of varij" or "evaluations of varij"
        r'\b(?:evaluations?\s+of|evaluation\s+of|show\s+evaluations?\s+of)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)',
    ]
    
    def extract_candidate_name(self, message: str) -> Optional[str]:
        """Extract candidate name from message"""
        message_lower = message.lower()
        
        # First, try patterns that explicitly mention "candidate" or "applicant"
        for pattern in self.CANDIDATE_NAME_PATTERNS[:3]:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Don't return if it's a number (ID)
                if not name.isdigit():
                    return name
        
        # Then try evaluation-specific patterns
        for pattern in self.CANDIDATE_NAME_PATTERNS[3:]:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if not name.isdigit():
                    return name
        
        return None
    
    def classify(self, message: str) -> Tuple[str, Dict[str, Any]]:
        """
        Classify user message into intent and extract parameters
        
        Returns:
            Tuple of (intent, parameters)
        """
        message_lower = message.lower().strip()
        
        # Check for specific ID queries first
        job_id_match = re.search(self.JOB_DETAIL_PATTERNS[0], message_lower)
        if job_id_match:
            return ("get_job", {"job_id": int(job_id_match.group(1))})
        
        # Check for candidate name before ID
        candidate_name = self.extract_candidate_name(message)
        if candidate_name and not any(re.search(pattern, message_lower) for pattern in self.EVALUATION_PATTERNS):
            return ("get_candidate_by_name", {"candidate_name": candidate_name})
        
        candidate_id_match = re.search(self.CANDIDATE_DETAIL_PATTERNS[0], message_lower)
        if candidate_id_match:
            return ("get_candidate", {"candidate_id": int(candidate_id_match.group(1))})
        
        # Check for skill-based searches
        skill_match = re.search(self.SKILL_SEARCH_PATTERNS[0], message_lower)
        if skill_match:
            skill = skill_match.group(1)
            if any(re.search(pattern, message_lower) for pattern in self.CANDIDATE_PATTERNS):
                return ("search_candidates_by_skill", {"skill": skill})
        
        # Check for application counts
        if any(re.search(pattern, message_lower) for pattern in self.APPLICATION_COUNT_PATTERNS):
            # Try to extract job ID
            job_id_match = re.search(r'\b(job|position)\s+(\d+)\b', message_lower)
            if job_id_match:
                return ("get_application_count", {"job_id": int(job_id_match.group(2))})
            return ("get_statistics", {})
        
        # Check for evaluation queries
        if any(re.search(pattern, message_lower) for pattern in self.EVALUATION_PATTERNS):
            # Try to extract candidate name first
            candidate_name = self.extract_candidate_name(message)
            if candidate_name:
                return ("get_candidate_evaluations_by_name", {"candidate_name": candidate_name})
            # Try to extract candidate ID
            candidate_id_match = re.search(r'\bcandidate\s+(\d+)\b', message_lower)
            if candidate_id_match:
                return ("get_candidate_evaluations", {"candidate_id": int(candidate_id_match.group(1))})
            job_id_match = re.search(r'\bjob\s+(\d+)\b', message_lower)
            if job_id_match:
                return ("get_job_evaluations", {"job_id": int(job_id_match.group(1))})
            return ("get_evaluations", {})
        
        # Check for statistics
        if any(re.search(pattern, message_lower) for pattern in self.STATISTICS_PATTERNS):
            return ("get_statistics", {})
        
        # Check for job queries
        if any(re.search(pattern, message_lower) for pattern in self.JOB_PATTERNS):
            # Check for company filter
            company_match = re.search(r'\b(?:at|from|company)\s+([A-Za-z][A-Za-z0-9\s]+?)(?:\s|$)', message_lower)
            if company_match:
                return ("list_jobs", {"company": company_match.group(1).strip()})
            return ("list_jobs", {})
        
        # Check for candidate queries
        if any(re.search(pattern, message_lower) for pattern in self.CANDIDATE_PATTERNS):
            return ("list_candidates", {})
        
        # Default to general help
        return ("help", {})


class DataRetriever:
    """Retrieves data from database based on intent"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_jobs(self, company: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """List all jobs with optional company filter"""
        query = self.db.query(Job)
        
        if company:
            query = query.filter(Job.company.ilike(f"%{company}%"))
        
        jobs = query.order_by(Job.created_at.desc()).limit(limit).all()
        
        result = []
        for job in jobs:
            application_count = self.db.query(Application).filter(
                Application.job_id == job.id
            ).count()
            
            result.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "salary": job.salary,
                "application_count": application_count,
                "created_at": job.created_at.isoformat() if job.created_at else None,
            })
        
        return result
    
    def get_job(self, job_id: int) -> Optional[Dict[str, Any]]:
        """Get specific job details"""
        job = self.db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            return None
        
        application_count = self.db.query(Application).filter(
            Application.job_id == job.id
        ).count()
        
        applications = self.db.query(Application).filter(
            Application.job_id == job.id
        ).all()
        
        status_counts = {}
        for app in applications:
            status_counts[app.status.value] = status_counts.get(app.status.value, 0) + 1
        
        return {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "location": job.location,
            "salary": job.salary,
            "requirements": job.requirements_json,
            "application_count": application_count,
            "status_counts": status_counts,
            "created_at": job.created_at.isoformat() if job.created_at else None,
        }
    
    def list_candidates(self, limit: int = 20) -> List[Dict[str, Any]]:
        """List all candidates"""
        candidates = self.db.query(Candidate).order_by(
            Candidate.created_at.desc()
        ).limit(limit).all()
        
        result = []
        for candidate in candidates:
            application_count = self.db.query(Application).filter(
                Application.candidate_id == candidate.id
            ).count()
            
            result.append({
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "skills": candidate.skills_json or [],
                "application_count": application_count,
                "has_resume": candidate.resume_id is not None,
                "created_at": candidate.created_at.isoformat() if candidate.created_at else None,
            })
        
        return result
    
    def get_candidate_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get candidate by name (case-insensitive partial match)"""
        # Try exact match first
        candidate = self.db.query(Candidate).filter(
            Candidate.name.ilike(name)
        ).first()
        
        # If not found, try partial match
        if not candidate:
            candidate = self.db.query(Candidate).filter(
                Candidate.name.ilike(f"%{name}%")
            ).first()
        
        if not candidate:
            return None
        
        applications = self.db.query(Application).filter(
            Application.candidate_id == candidate.id
        ).all()
        
        application_list = []
        for app in applications:
            job = self.db.query(Job).filter(Job.id == app.job_id).first()
            application_list.append({
                "id": app.id,
                "job_id": app.job_id,
                "job_title": job.title if job else "Unknown",
                "status": app.status.value,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            })
        
        return {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills_json or [],
            "resume_id": candidate.resume_id,
            "applications": application_list,
            "created_at": candidate.created_at.isoformat() if candidate.created_at else None,
        }
    
    def get_candidate(self, candidate_id: int) -> Optional[Dict[str, Any]]:
        """Get specific candidate details"""
        candidate = self.db.query(Candidate).filter(Candidate.id == candidate_id).first()
        
        if not candidate:
            return None
        
        applications = self.db.query(Application).filter(
            Application.candidate_id == candidate.id
        ).all()
        
        application_list = []
        for app in applications:
            job = self.db.query(Job).filter(Job.id == app.job_id).first()
            application_list.append({
                "id": app.id,
                "job_id": app.job_id,
                "job_title": job.title if job else "Unknown",
                "status": app.status.value,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            })
        
        return {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills_json or [],
            "resume_id": candidate.resume_id,
            "applications": application_list,
            "created_at": candidate.created_at.isoformat() if candidate.created_at else None,
        }
    
    def search_candidates_by_skill(self, skill: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search candidates by skill"""
        candidates = self.db.query(Candidate).filter(
            Candidate.skills_json.contains([skill])
        ).limit(limit).all()
        
        result = []
        for candidate in candidates:
            result.append({
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "skills": candidate.skills_json or [],
            })
        
        return result
    
    def get_candidate_evaluations_by_name(self, name: str) -> List[Dict[str, Any]]:
        """Get evaluations for a candidate by name"""
        # Find candidate by name
        candidate = self.db.query(Candidate).filter(
            Candidate.name.ilike(f"%{name}%")
        ).first()
        
        if not candidate:
            return []
        
        return self.get_candidate_evaluations(candidate.id)
    
    def get_candidate_evaluations(self, candidate_id: int) -> List[Dict[str, Any]]:
        """Get evaluations for a candidate"""
        applications = self.db.query(Application).filter(
            Application.candidate_id == candidate_id
        ).all()
        
        application_ids = [app.id for app in applications]
        
        if not application_ids:
            return []
        
        evaluations = self.db.query(Evaluation).filter(
            Evaluation.application_id.in_(application_ids)
        ).all()
        
        result = []
        for eval in evaluations:
            app = self.db.query(Application).filter(Application.id == eval.application_id).first()
            job = self.db.query(Job).filter(Job.id == app.job_id).first() if app else None
            
            result.append({
                "id": eval.id,
                "application_id": eval.application_id,
                "job_title": job.title if job else "Unknown",
                "ats_score": eval.ats_score,
                "passed": eval.passed,
                "skill_match_score": eval.skill_match_score,
                "education_score": eval.education_score,
                "experience_score": eval.experience_score,
                "matched_skills": eval.matched_skills_json or [],
                "missing_skills": eval.missing_skills_json or [],
                "created_at": eval.created_at.isoformat() if eval.created_at else None,
            })
        
        return result
    
    def get_job_evaluations(self, job_id: int) -> List[Dict[str, Any]]:
        """Get evaluations for a job"""
        applications = self.db.query(Application).filter(
            Application.job_id == job_id
        ).all()
        
        application_ids = [app.id for app in applications]
        
        if not application_ids:
            return []
        
        evaluations = self.db.query(Evaluation).filter(
            Evaluation.application_id.in_(application_ids)
        ).all()
        
        result = []
        for eval in evaluations:
            app = self.db.query(Application).filter(Application.id == eval.application_id).first()
            candidate = self.db.query(Candidate).filter(
                Candidate.id == app.candidate_id
            ).first() if app else None
            
            result.append({
                "id": eval.id,
                "application_id": eval.application_id,
                "candidate_name": candidate.name if candidate else "Unknown",
                "ats_score": eval.ats_score,
                "passed": eval.passed,
                "skill_match_score": eval.skill_match_score,
                "matched_skills": eval.matched_skills_json or [],
                "missing_skills": eval.missing_skills_json or [],
            })
        
        return result
    
    def get_application_count(self, job_id: int) -> Dict[str, Any]:
        """Get application count for a job"""
        job = self.db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        total = self.db.query(Application).filter(Application.job_id == job_id).count()
        
        status_counts = {}
        for status in ApplicationStatus:
            count = self.db.query(Application).filter(
                and_(Application.job_id == job_id, Application.status == status)
            ).count()
            if count > 0:
                status_counts[status.value] = count
        
        return {
            "job_id": job_id,
            "job_title": job.title,
            "total_applications": total,
            "status_counts": status_counts,
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get overall statistics"""
        total_jobs = self.db.query(Job).count()
        total_candidates = self.db.query(Candidate).count()
        total_applications = self.db.query(Application).count()
        total_evaluations = self.db.query(Evaluation).count()
        
        # Status breakdown
        status_counts = {}
        for status in ApplicationStatus:
            count = self.db.query(Application).filter(Application.status == status).count()
            status_counts[status.value] = count
        
        # Evaluation stats
        passed_count = self.db.query(Evaluation).filter(Evaluation.passed == True).count()
        failed_count = self.db.query(Evaluation).filter(Evaluation.passed == False).count()
        
        avg_score = self.db.query(func.avg(Evaluation.ats_score)).scalar()
        avg_score = float(avg_score) if avg_score else 0.0
        
        return {
            "total_jobs": total_jobs,
            "total_candidates": total_candidates,
            "total_applications": total_applications,
            "total_evaluations": total_evaluations,
            "application_status_counts": status_counts,
            "evaluation_stats": {
                "passed": passed_count,
                "failed": failed_count,
                "average_score": round(avg_score, 2),
            },
        }


class ResponseGenerator:
    """Generates natural language responses from data"""
    
    def generate(self, intent: str, data: Any, params: Dict[str, Any] = None) -> str:
        """Generate response based on intent and data"""
        params = params or {}
        
        if intent == "list_jobs":
            if not data:
                return "I couldn't find any job postings in the system."
            
            if len(data) == 1:
                job = data[0]
                return f"I found 1 job posting:\n\n**{job['title']}** at {job['company']}\n" \
                       f"Location: {job.get('location', 'Not specified')}\n" \
                       f"Applications: {job.get('application_count', 0)}"
            
            response = f"I found {len(data)} job postings:\n\n"
            for job in data[:10]:  # Limit to 10 for readability
                response += f"• **{job['title']}** at {job['company']} " \
                           f"(ID: {job['id']}, {job.get('application_count', 0)} applications)\n"
            
            if len(data) > 10:
                response += f"\n... and {len(data) - 10} more jobs."
            
            return response
        
        elif intent == "get_job":
            if not data:
                return f"I couldn't find job {params.get('job_id', '')} in the system."
            
            job = data
            response = f"**Job Details (ID: {job['id']}):**\n\n"
            response += f"Title: {job['title']}\n"
            response += f"Company: {job['company']}\n"
            if job.get('location'):
                response += f"Location: {job['location']}\n"
            if job.get('salary'):
                response += f"Salary: {job['salary']}\n"
            response += f"\nTotal Applications: {job.get('application_count', 0)}\n"
            
            if job.get('status_counts'):
                response += "\nApplication Status Breakdown:\n"
                for status, count in job['status_counts'].items():
                    response += f"  • {status.capitalize()}: {count}\n"
            
            return response
        
        elif intent == "list_candidates":
            if not data:
                return "I couldn't find any candidates in the system."
            
            if len(data) == 1:
                candidate = data[0]
                return f"I found 1 candidate:\n\n**{candidate['name']}** ({candidate['email']})\n" \
                       f"Skills: {', '.join(candidate.get('skills', [])[:5]) or 'None'}\n" \
                       f"Applications: {candidate.get('application_count', 0)}"
            
            response = f"I found {len(data)} candidates:\n\n"
            for candidate in data[:10]:
                skills = ', '.join(candidate.get('skills', [])[:3]) or 'No skills listed'
                response += f"• **{candidate['name']}** (ID: {candidate['id']}, {candidate.get('application_count', 0)} applications)\n"
                response += f"  Skills: {skills}\n"
            
            if len(data) > 10:
                response += f"\n... and {len(data) - 10} more candidates."
            
            return response
        
        elif intent == "get_candidate" or intent == "get_candidate_by_name":
            if not data:
                candidate_ref = params.get('candidate_name') or params.get('candidate_id', '')
                return f"I couldn't find candidate {candidate_ref} in the system."
            
            candidate = data
            response = f"**Candidate Details (ID: {candidate['id']}):**\n\n"
            response += f"Name: **{candidate['name']}**\n"
            response += f"Email: {candidate['email']}\n"
            if candidate.get('phone'):
                response += f"Phone: {candidate['phone']}\n"
            
            skills = candidate.get('skills', [])
            if skills:
                response += f"\nSkills: {', '.join(skills)}\n"
            
            response += f"\nTotal Applications: {len(candidate.get('applications', []))}\n"
            
            if candidate.get('applications'):
                response += "\nApplications:\n"
                for app in candidate['applications'][:5]:
                    response += f"  • {app['job_title']} (Status: {app['status']})\n"
            
            return response
        
        elif intent == "search_candidates_by_skill":
            if not data:
                return f"I couldn't find any candidates with the skill '{params.get('skill', '')}'."
            
            response = f"I found {len(data)} candidate(s) with '{params.get('skill', '')}' skill:\n\n"
            for candidate in data:
                response += f"• **{candidate['name']}** (ID: {candidate['id']})\n"
            
            return response
        
        elif intent == "get_candidate_evaluations" or intent == "get_candidate_evaluations_by_name":
            if not data:
                candidate_ref = params.get('candidate_name') or params.get('candidate_id', '')
                return f"I couldn't find any evaluations for candidate {candidate_ref}."
            
            candidate_name = params.get('candidate_name', 'this candidate')
            response = f"I found {len(data)} evaluation(s) for **{candidate_name}**:\n\n"
            for eval in data:
                status = "✅ Passed" if eval['passed'] else "❌ Failed"
                response += f"• **{eval['job_title']}** - {status}\n"
                response += f"  ATS Score: {eval['ats_score']:.1f}%\n"
                if eval.get('matched_skills'):
                    response += f"  Matched Skills: {', '.join(eval['matched_skills'][:5])}\n"
                if eval.get('missing_skills'):
                    response += f"  Missing Skills: {', '.join(eval['missing_skills'][:5])}\n"
            
            return response
        
        elif intent == "get_job_evaluations":
            if not data:
                return f"I couldn't find any evaluations for job {params.get('job_id', '')}."
            
            response = f"I found {len(data)} evaluation(s) for this job:\n\n"
            for eval in data:
                status = "✅ Passed" if eval['passed'] else "❌ Failed"
                response += f"• **{eval['candidate_name']}** - {status}\n"
                response += f"  ATS Score: {eval['ats_score']:.1f}%\n"
            
            return response
        
        elif intent == "get_application_count":
            if not data:
                return f"I couldn't find job {params.get('job_id', '')} in the system."
            
            response = f"**Application Statistics for {data['job_title']} (Job ID: {data['job_id']}):**\n\n"
            response += f"Total Applications: {data['total_applications']}\n\n"
            
            if data.get('status_counts'):
                response += "Status Breakdown:\n"
                for status, count in data['status_counts'].items():
                    response += f"  • {status.capitalize()}: {count}\n"
            
            return response
        
        elif intent == "get_statistics":
            if not data:
                return "I couldn't retrieve statistics at this time."
            
            stats = data
            response = "**Recruitment Dashboard Statistics:**\n\n"
            response += f"📊 **Overview:**\n"
            response += f"  • Total Jobs: {stats['total_jobs']}\n"
            response += f"  • Total Candidates: {stats['total_candidates']}\n"
            response += f"  • Total Applications: {stats['total_applications']}\n"
            response += f"  • Total Evaluations: {stats['total_evaluations']}\n\n"
            
            if stats.get('application_status_counts'):
                response += f"📋 **Application Status:**\n"
                for status, count in stats['application_status_counts'].items():
                    response += f"  • {status.capitalize()}: {count}\n"
                response += "\n"
            
            if stats.get('evaluation_stats'):
                eval_stats = stats['evaluation_stats']
                response += f"🎯 **Evaluation Results:**\n"
                response += f"  • Passed: {eval_stats['passed']}\n"
                response += f"  • Failed: {eval_stats['failed']}\n"
                response += f"  • Average ATS Score: {eval_stats['average_score']}%\n"
            
            return response
        
        elif intent == "help":
            return """I'm your AI recruitment assistant! I can help you with:

• **Jobs**: "Show me all jobs", "List jobs from Google", "Get details for job 5"
• **Candidates**: "List all candidates", "Show candidate 3", "Show candidate John", "Find candidates with Python skills"
• **Evaluations**: "Show evaluations for candidate 2", "Show evaluations of candidate varij", "What's the ATS score for job 1?"
• **Statistics**: "Show statistics", "How many applications for job 5?"

You can use candidate names or IDs. Just ask me in natural language and I'll help you find the information you need!"""
        
        else:
            return "I'm not sure how to help with that. Try asking about jobs, candidates, evaluations, or statistics."


class ChatOrchestrator:
    """Main orchestrator that coordinates intent classification, data retrieval, and response generation"""
    
    def __init__(self, db: Session):
        self.intent_classifier = IntentClassifier()
        self.data_retriever = DataRetriever(db)
        self.response_generator = ResponseGenerator()
    
    def process_message(self, message: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Process a user message and return response with optional data
        
        Returns:
            Tuple of (response_text, data_dict)
        """
        # Classify intent
        intent, params = self.intent_classifier.classify(message)
        
        # Retrieve data based on intent
        data = None
        if intent == "list_jobs":
            data = self.data_retriever.list_jobs(company=params.get("company"))
        elif intent == "get_job":
            data = self.data_retriever.get_job(params.get("job_id"))
        elif intent == "list_candidates":
            data = self.data_retriever.list_candidates()
        elif intent == "get_candidate":
            data = self.data_retriever.get_candidate(params.get("candidate_id"))
        elif intent == "get_candidate_by_name":
            data = self.data_retriever.get_candidate_by_name(params.get("candidate_name"))
        elif intent == "search_candidates_by_skill":
            data = self.data_retriever.search_candidates_by_skill(params.get("skill"))
        elif intent == "get_candidate_evaluations":
            data = self.data_retriever.get_candidate_evaluations(params.get("candidate_id"))
        elif intent == "get_candidate_evaluations_by_name":
            data = self.data_retriever.get_candidate_evaluations_by_name(params.get("candidate_name"))
        elif intent == "get_job_evaluations":
            data = self.data_retriever.get_job_evaluations(params.get("job_id"))
        elif intent == "get_application_count":
            data = self.data_retriever.get_application_count(params.get("job_id"))
        elif intent == "get_statistics":
            data = self.data_retriever.get_statistics()
        
        # Generate response
        response = self.response_generator.generate(intent, data, params)
        
        # Return response and data (for frontend to render structured views if needed)
        return response, data
