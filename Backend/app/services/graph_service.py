"""
Neo4j graph service for recommendations and relationship analysis
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database.neo4j_client import get_neo4j
from app.models.postgres_models import User, Job, Application


def get_job_recommendations(db: Session, student_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Get job recommendations for a student using Neo4j graph"""
    try:
        driver = get_neo4j()
        
        with driver.session() as session:
            # Find similar students who applied to jobs
            query = """
            MATCH (s:Student {id: $student_id})-[:HAS_SKILL]->(skill:Skill)
            MATCH (similar:Student)-[:HAS_SKILL]->(skill)
            WHERE similar.id <> $student_id
            MATCH (similar)-[:APPLIED_TO]->(job:Job)
            WHERE NOT (s)-[:APPLIED_TO]->(job)
            WITH job, COUNT(DISTINCT similar) as similarity_score
            ORDER BY similarity_score DESC
            LIMIT $limit
            RETURN job.id as job_id, job.title as title, similarity_score
            """
            
            result = session.run(query, student_id=student_id, limit=limit)
            recommendations = []
            
            for record in result:
                job_id = record["job_id"]
                # Get job details from PostgreSQL
                job = db.query(Job).filter(Job.id == job_id).first()
                if job:
                    recommendations.append({
                        "job_id": job.id,
                        "title": job.title,
                        "company": job.company.name if job.company else "Unknown",
                        "location": job.location,
                        "salary": job.salary,
                        "match_score": float(record["similarity_score"]) * 10,  # Normalize
                        "reason": f"Similar students with matching skills applied to this job"
                    })
            
            return recommendations
    except Exception as e:
        print(f"Error getting job recommendations: {e}")
        return []


def get_career_path(db: Session, student_id: int, target_role: Optional[str] = None) -> Dict[str, Any]:
    """Get career path suggestions using Neo4j"""
    try:
        driver = get_neo4j()
        
        with driver.session() as session:
            # Get student's current skills
            user = db.query(User).filter(User.id == student_id).first()
            if not user:
                return {"error": "User not found"}
            
            # Query for skill progression path
            query = """
            MATCH (s:Student {id: $student_id})-[:HAS_SKILL]->(current:Skill)
            MATCH (target:Skill)-[:RELATED_TO*1..2]->(current)
            WHERE NOT (s)-[:HAS_SKILL]->(target)
            RETURN DISTINCT target.name as skill, target.category as category
            ORDER BY target.category
            LIMIT 20
            """
            
            result = session.run(query, student_id=student_id)
            target_skills = []
            for record in result:
                target_skills.append({
                    "skill": record["skill"],
                    "category": record.get("category", "general")
                })
            
            return {
                "current_skills": [],  # Would need to fetch from graph
                "target_skills": target_skills,
                "skill_gaps": target_skills,
                "recommended_path": [
                    {"step": 1, "action": "Learn foundational skills", "skills": target_skills[:5]},
                    {"step": 2, "action": "Build projects", "skills": target_skills[5:10]},
                    {"step": 3, "action": "Get certifications", "skills": target_skills[10:]}
                ],
                "estimated_time": "6-12 months",
                "milestones": [
                    "Complete foundational courses",
                    "Build 3 portfolio projects",
                    "Get industry certifications",
                    "Apply to entry-level positions"
                ]
            }
    except Exception as e:
        print(f"Error getting career path: {e}")
        return {
            "current_skills": [],
            "target_skills": [],
            "skill_gaps": [],
            "recommended_path": [],
            "estimated_time": "Unknown",
            "milestones": []
        }
