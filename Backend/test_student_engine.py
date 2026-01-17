"""
Test Suite for CampusConnect Student AI Engine
Run with: python test_student_engine.py

This file demonstrates all capabilities of the student-facing AI engine
with mock data and sample prompts.
"""

import json
from student_engine import (
    CampusConnectStudentEngine,
    StudentJobMatchingEngine,
    SkillGapAnalyzer,
    ResumeFeedbackEngine,
    RejectionFeedbackInterpreter
)

# ============ MOCK DATA ============

MOCK_JOBS = [
    {
        "id": 1,
        "title": "Backend Developer Intern",
        "company": "TechCorp Solutions",
        "location": "Bangalore",
        "salary": "₹30,000/month",
        "description": "We are looking for a talented backend developer to join our team. You will work on building scalable APIs and microservices.",
        "requirements": "Strong knowledge of Python and Django framework, experience with REST APIs, PostgreSQL database, Docker, Git version control"
    },
    {
        "id": 2,
        "title": "Full Stack Developer",
        "company": "StartupXYZ",
        "location": "Mumbai",
        "salary": "₹40,000/month",
        "description": "Build modern web applications using React and Node.js. Work on both frontend and backend components.",
        "requirements": "Proficiency in React, JavaScript, Node.js, MongoDB, experience with REST APIs, Git"
    },
    {
        "id": 3,
        "title": "DevOps Engineer Intern",
        "company": "CloudTech Inc",
        "location": "Hyderabad",
        "salary": "₹35,000/month",
        "description": "Work with containerization and microservices deployment. Manage CI/CD pipelines and cloud infrastructure.",
        "requirements": "Knowledge of Docker, Kubernetes, Java Spring Boot, CI/CD pipelines, Linux administration, AWS"
    },
    {
        "id": 4,
        "title": "Machine Learning Intern",
        "company": "AI Labs",
        "location": "Pune",
        "salary": "₹45,000/month",
        "description": "Apply ML techniques to real-world problems in agriculture and healthcare. Build and deploy ML models.",
        "requirements": "Strong Python skills, TensorFlow or PyTorch, experience with CNNs, data preprocessing, Pandas, NumPy"
    },
    {
        "id": 5,
        "title": "Data Analyst",
        "company": "DataWorks",
        "location": "Delhi",
        "salary": "₹35,000/month",
        "description": "Analyze business data and generate insights. Create dashboards and reports for stakeholders.",
        "requirements": "Python, SQL, Pandas, Excel, Data Analysis, experience with data visualization tools"
    },
    {
        "id": 6,
        "title": "Software Development Engineer",
        "company": "CodeMasters",
        "location": "Delhi",
        "salary": "₹50,000/month",
        "description": "Solve complex algorithmic problems and optimize systems. Work on high-performance applications.",
        "requirements": "Expert in C++ or Java, strong DSA fundamentals, competitive programming experience, system design knowledge"
    }
]

MOCK_STUDENTS = [
    {
        "id": 101,
        "name": "Rahul Sharma",
        "skills": ["Python", "Django", "REST API", "PostgreSQL", "Git"],
        "resume": """
        EDUCATION:
        B.Tech Computer Science, IIT Delhi (2021-2025)
        CGPA: 8.5/10
        
        SKILLS:
        Python, Django, REST API, PostgreSQL, Git
        
        PROJECTS:
        - E-commerce Backend API: Built RESTful API with Django, handled 1000+ daily requests
        - Social Media API: Implemented user authentication and post management
        
        EXPERIENCE:
        Backend Developer Intern at TechStart (3 months)
        """
    },
    {
        "id": 102,
        "name": "Priya Singh",
        "skills": ["React", "JavaScript", "Node.js", "MongoDB"],
        "resume": """
        EDUCATION:
        B.Tech Computer Science, NIT Trichy (2021-2025)
        CGPA: 8.8/10
        
        SKILLS:
        React, JavaScript, TypeScript, Node.js, MongoDB
        
        PROJECTS:
        - Real-time Chat Application: Built using React and Node.js
        - Portfolio Website Generator: Dynamic portfolio builder
        
        EXPERIENCE:
        Frontend Developer Intern at StartupXYZ (6 months)
        """
    },
    {
        "id": 103,
        "name": "Arjun Patel",
        "skills": ["Python", "SQL", "Pandas"],
        "resume": """
        EDUCATION:
        B.Tech Computer Science, BITS Pilani (2021-2025)
        CGPA: 8.2/10
        
        SKILLS:
        Python, SQL, Pandas, Excel
        
        PROJECTS:
        - Sales Analysis Dashboard: Analyzed sales data and created visualizations
        - Customer Segmentation: ML-based customer grouping
        
        EXPERIENCE:
        Data Analysis Intern at RetailCorp (2 months)
        """
    }
]

# ============ SAMPLE PROMPTS ============

SAMPLE_QUERIES = [
    "I want a backend role using Python and APIs",
    "Looking for a full stack developer position",
    "I'm interested in machine learning internships",
    "Find me data analyst jobs",
    "Backend developer role with Django experience"
]

# ============ TEST FUNCTIONS ============

def test_job_search():
    """Test 1: Natural Language Job Search"""
    print("\n" + "="*70)
    print("TEST 1: AI Job Search (Natural Language)")
    print("="*70)
    
    engine = CampusConnectStudentEngine()
    student_skills = ["Python", "SQL", "Docker"]
    
    for query in SAMPLE_QUERIES[:2]:  # Test first 2 queries
        print(f"\n🔍 Student Query: '{query}'")
        print(f"📋 Student Skills: {', '.join(student_skills)}")
        print("\n" + "-"*70)
        
        results = engine.search_jobs(query, MOCK_JOBS, student_skills, top_k=3)
        
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['title']} at {result['company']}")
            print(f"   Match Score: {result['match_score']}%")
            print(f"   Status: {result['application_status']}")
            print(f"   Message: {result['message']}")
            if result['missing_skills']:
                print(f"   Missing Skills: {', '.join(result['missing_skills'][:5])}")
            print(f"   Location: {result['location']} | Salary: {result['salary']}")


def test_skill_gap_analysis():
    """Test 2: Skill Gap Detection"""
    print("\n" + "="*70)
    print("TEST 2: Skill Gap Analysis")
    print("="*70)
    
    analyzer = SkillGapAnalyzer()
    
    test_cases = [
        {
            "student_skills": ["Python", "SQL"],
            "job_skills": ["Python", "SQL", "Docker", "REST API"],
            "job_role": "backend"
        },
        {
            "student_skills": ["Python", "Pandas"],
            "job_skills": ["Python", "TensorFlow", "PyTorch", "CNNs", "Pandas", "NumPy"],
            "job_role": "ml engineer"
        },
        {
            "student_skills": ["React", "JavaScript"],
            "job_skills": ["React", "JavaScript", "Node.js", "MongoDB", "REST API"],
            "job_role": "fullstack"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Student Skills: {', '.join(case['student_skills'])}")
        print(f"Job Required Skills: {', '.join(case['job_skills'])}")
        print(f"Job Role: {case['job_role']}")
        print("\n" + "-"*70)
        
        result = analyzer.analyze_skill_gap(
            case['student_skills'],
            case['job_skills'],
            case['job_role']
        )
        
        print(f"\n📊 Analysis Results:")
        print(f"   Match Percentage: {result['match_percentage']}%")
        print(f"   Matched Skills: {', '.join(result['matched_skills'])}")
        print(f"   Missing Skills: {', '.join(result['missing_skills'])}")
        print(f"\n💡 Explanation: {result['explanation']}")
        
        if result['learning_path']:
            print(f"\n📚 Learning Path: {', '.join(result['learning_path'])}")
        
        print(f"\n🎓 Recommendations:")
        for rec in result['recommendations'][:3]:
            print(f"   • {rec['skill']}: {rec['recommended_certifications'][0]}")


def test_resume_feedback():
    """Test 3: Resume Feedback & ATS Optimization"""
    print("\n" + "="*70)
    print("TEST 3: Resume Feedback & ATS Optimization")
    print("="*70)
    
    engine = CampusConnectStudentEngine()
    
    # Use first student and first job
    student = MOCK_STUDENTS[0]
    job = MOCK_JOBS[0]
    
    print(f"\n👤 Student: {student['name']}")
    print(f"💼 Job: {job['title']} at {job['company']}")
    print("\n" + "-"*70)
    
    # First, analyze skill gap
    job_skills = engine.job_matcher._extract_skills(job['requirements'])
    skill_gap = engine.analyze_skill_gap(student['skills'], job_skills)
    
    # Then get resume feedback
    feedback = engine.get_resume_feedback(
        resume_text=student['resume'],
        job_description=job['description'],
        job_requirements=job['requirements'],
        skill_gap_output=skill_gap
    )
    
    print(f"\n📝 Resume Feedback:")
    print(f"   ATS Score: {feedback['ats_score']}/100")
    print(f"   ATS Interpretation: {feedback['ats_interpretation']}")
    print(f"\n   Overall Feedback: {feedback['overall_feedback']}")
    
    print(f"\n✅ Strengths:")
    for strength in feedback['strengths']:
        print(f"   • {strength}")
    
    print(f"\n⚠️  Weaknesses:")
    for weakness in feedback['weaknesses']:
        print(f"   • {weakness}")
    
    print(f"\n🔑 Missing Keywords (Top 5):")
    for keyword in feedback['keyword_suggestions'][:5]:
        print(f"   • {keyword}")
    
    print(f"\n💪 Actionable Improvements:")
    for improvement in feedback['actionable_improvements'][:5]:
        print(f"   • {improvement}")


def test_rejection_interpretation():
    """Test 4: Rejection Feedback Interpretation"""
    print("\n" + "="*70)
    print("TEST 4: Rejection Feedback Interpretation")
    print("="*70)
    
    engine = CampusConnectStudentEngine()
    
    rejection_cases = [
        {
            "feedback": "Candidate lacks required skills in Docker and Kubernetes. Technical assessment score was below threshold.",
            "job_title": "DevOps Engineer Intern",
            "student_skills": ["Python", "Linux", "Git"]
        },
        {
            "feedback": "Resume did not clearly demonstrate experience with REST API development. ATS compatibility was low.",
            "job_title": "Backend Developer Intern",
            "student_skills": ["Python", "Django", "PostgreSQL"]
        },
        {
            "feedback": "Technical test performance was below expectations. Candidate needs more practice with data structures.",
            "job_title": "Software Development Engineer",
            "student_skills": ["Java", "C++", "Algorithms"]
        },
        {
            "feedback": "Communication skills during interview were not at the expected level for this role.",
            "job_title": "Full Stack Developer",
            "student_skills": ["React", "Node.js", "MongoDB"]
        }
    ]
    
    for i, case in enumerate(rejection_cases, 1):
        print(f"\n--- Rejection Case {i} ---")
        print(f"Job: {case['job_title']}")
        print(f"Raw Feedback: {case['feedback']}")
        print(f"Student Skills: {', '.join(case['student_skills'])}")
        print("\n" + "-"*70)
        
        interpretation = engine.interpret_rejection(
            rejection_feedback=case['feedback'],
            job_title=case['job_title'],
            student_skills=case['student_skills']
        )
        
        print(f"\n📋 Category: {interpretation['rejection_category'].replace('_', ' ').title()}")
        print(f"\n💬 Student-Friendly Explanation:")
        print(f"   {interpretation['student_friendly_explanation']}")
        
        print(f"\n💡 Improvement Suggestions:")
        for suggestion in interpretation['improvement_suggestions'][:3]:
            print(f"   • {suggestion}")
        
        print(f"\n🌟 Motivational Message:")
        print(f"   {interpretation['motivational_message']}")
        
        print(f"\n🎯 Next Steps:")
        for step in interpretation['next_steps']:
            print(f"   • {step}")


def test_end_to_end_scenario():
    """Test 5: End-to-End Student Journey"""
    print("\n" + "="*70)
    print("TEST 5: End-to-End Student Journey")
    print("="*70)
    
    engine = CampusConnectStudentEngine()
    
    # Scenario: Student searches for jobs, finds one, analyzes skill gap,
    # gets resume feedback, applies, gets rejected, receives feedback
    
    print("\n👤 Student Profile:")
    student = MOCK_STUDENTS[0]
    print(f"   Name: {student['name']}")
    print(f"   Skills: {', '.join(student['skills'])}")
    
    # Step 1: Search for jobs
    print("\n" + "-"*70)
    print("STEP 1: Student searches for jobs")
    print("-"*70)
    query = "I want a backend role using Python and APIs"
    print(f"   Query: '{query}'")
    
    results = engine.search_jobs(query, MOCK_JOBS, student['skills'], top_k=2)
    
    if results:
        selected_job = results[0]
        print(f"\n   ✅ Found: {selected_job['title']} at {selected_job['company']}")
        print(f"   Match Score: {selected_job['match_score']}%")
        print(f"   Status: {selected_job['application_status']}")
        
        # Step 2: Analyze skill gap
        print("\n" + "-"*70)
        print("STEP 2: Analyze skill gap for selected job")
        print("-"*70)
        
        job = next(j for j in MOCK_JOBS if j['id'] == selected_job['job_id'])
        job_skills = engine.job_matcher._extract_skills(job['requirements'])
        skill_gap = engine.analyze_skill_gap(student['skills'], job_skills, "backend")
        
        print(f"   Match: {skill_gap['match_percentage']}%")
        print(f"   Missing Skills: {', '.join(skill_gap['missing_skills'][:3])}")
        
        # Step 3: Get resume feedback
        print("\n" + "-"*70)
        print("STEP 3: Get resume feedback")
        print("-"*70)
        
        resume_feedback = engine.get_resume_feedback(
            student['resume'],
            job['description'],
            job['requirements'],
            skill_gap
        )
        
        print(f"   ATS Score: {resume_feedback['ats_score']}/100")
        print(f"   Key Improvement: {resume_feedback['actionable_improvements'][0]}")
        
        # Step 4: Simulate rejection and get feedback
        print("\n" + "-"*70)
        print("STEP 4: Student applies but gets rejected")
        print("-"*70)
        
        rejection_feedback = "Candidate lacks experience with Docker. Technical assessment showed gaps in containerization concepts."
        
        rejection_interpretation = engine.interpret_rejection(
            rejection_feedback,
            job['title'],
            student['skills']
        )
        
        print(f"   Category: {rejection_interpretation['rejection_category']}")
        print(f"   Explanation: {rejection_interpretation['student_friendly_explanation']}")
        print(f"   Next Step: {rejection_interpretation['next_steps'][0]}")
        
        print("\n" + "="*70)
        print("✅ End-to-End Journey Complete!")
        print("="*70)


def print_summary():
    """Print summary of all capabilities."""
    print("\n" + "="*70)
    print("📚 CAMPUSCONNECT STUDENT AI ENGINE - CAPABILITIES SUMMARY")
    print("="*70)
    print("""
    ✅ 1. AI Job Search (Natural Language)
       - Students can search using natural language prompts
       - Semantic matching using sentence transformers
       - Automatic Direct Apply vs Recommended classification
       
    ✅ 2. Skill Gap Analysis
       - Deterministic skill comparison
       - Missing skills identification
       - Learning path and certification recommendations
       - Explainable results
       
    ✅ 3. Resume Feedback & ATS Optimization
       - ATS compatibility scoring
       - Keyword suggestions
       - Actionable improvement recommendations
       - Strengths and weaknesses analysis
       
    ✅ 4. Rejection Feedback Interpretation
       - Translates company feedback into student-friendly explanations
       - Categorizes rejection reasons
       - Provides improvement suggestions
       - Motivational messaging
       
    ✅ 5. Modular Architecture
       - StudentJobMatchingEngine
       - SkillGapAnalyzer
       - ResumeFeedbackEngine
       - RejectionFeedbackInterpreter
       - CampusConnectStudentEngine (Orchestrator)
    """)


# ============ MAIN EXECUTION ============

if __name__ == "__main__":
    print("\n" + "🚀"*35)
    print("CAMPUSCONNECT STUDENT AI ENGINE - TEST SUITE")
    print("🚀"*35)
    
    try:
        # Run all tests
        test_job_search()
        test_skill_gap_analysis()
        test_resume_feedback()
        test_rejection_interpretation()
        test_end_to_end_scenario()
        print_summary()
        
        print("\n" + "✅"*35)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("✅"*35 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
