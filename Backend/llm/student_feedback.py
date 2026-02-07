from typing import Any, Dict, List

from config import GROQ_API_KEY
from llm.groq_client import get_groq_client


def _build_resume_feedback_prompt(
    resume_text: str,
    job_description: str,
    job_requirements: str,
    skill_gap_output: Dict[str, Any],
) -> str:
    return (
        "You are an experienced technical recruiter and career coach. "
        "Given a student's resume and a specific job description, "
        "produce clear, constructive feedback to improve ATS performance and recruiter appeal.\n\n"
        "Respond with ONLY a JSON object with fields:\n"
        "- feedback: short paragraph overall assessment.\n"
        "- keyword_suggestions: list[str] of important keywords from the job that are missing or weak.\n"
        "- improvements: list[str] of concrete, actionable resume edits.\n"
        "- tone: one of ['encouraging', 'neutral', 'direct'].\n"
        "- risk_level: one of ['low', 'medium', 'high'] describing current fit.\n\n"
        f"Job description:\n{job_description}\n\n"
        f"Job requirements text:\n{job_requirements}\n\n"
        f'"""Skill gap analysis (JSON):\n{skill_gap_output}\n"""\n\n'
        f"Student resume:\n{resume_text[:6000]}\n"
    )


def generate_resume_feedback_llm(
    resume_text: str,
    job_description: str,
    job_requirements: str,
    skill_gap_output: Dict[str, Any],
) -> Dict[str, Any]:
    """
    LLM-based resume feedback for students.

    Returns a dict suitable for direct API responses or for StudentResponseGenerator.
    On error or missing API key, returns an empty dict so callers can fall back.
    """
    if not GROQ_API_KEY:
        return {}

    try:
        client = get_groq_client()
        system_prompt = (
            "You provide concise, student-friendly resume feedback for a specific job. "
            "Always return valid JSON only."
        )
        user_prompt = _build_resume_feedback_prompt(
            resume_text, job_description, job_requirements, skill_gap_output
        )
        result = client.chat_json(system_prompt=system_prompt, user_prompt=user_prompt)

        return {
            "feedback": result.get("feedback", ""),
            "keyword_suggestions": result.get("keyword_suggestions", []),
            "improvements": result.get("improvements", []),
            "tone": result.get("tone", "encouraging"),
            "risk_level": result.get("risk_level", "medium"),
        }
    except Exception as e:
        print(f"[LLM] Resume feedback failed: {e}")
        return {}


def _build_rejection_prompt(
    rejection_feedback: str,
    job_title: str,
    student_skills: List[str],
) -> str:
    return (
        "You are a compassionate career coach helping a student understand a job rejection. "
        "Given the company's rejection feedback and the target job title, "
        "explain the likely reasons in simple terms and suggest how to improve.\n\n"
        "Respond with ONLY a JSON object with fields:\n"
        "- rejection_category: short tag like 'skill_mismatch', 'test_performance', 'resume_issues', 'communication', 'general'.\n"
        "- student_friendly_explanation: 2-4 sentences, empathetic and specific.\n"
        "- improvement_suggestions: list[str] of concrete next steps.\n"
        "- motivational_message: 1-2 sentences motivating the student.\n"
        "- next_steps: list[str] of 3-5 specific actions.\n\n"
        f"Job title: {job_title}\n"
        f"Student skills: {student_skills}\n\n"
        f"Company rejection feedback:\n{rejection_feedback}\n"
    )


def interpret_rejection_llm(
    rejection_feedback: str,
    job_title: str,
    student_skills: List[str],
) -> Dict[str, Any]:
    """
    LLM-based interpretation of rejection feedback.

    Returns a dict compatible with RejectionInterpretResponse.
    On error or missing API key, returns an empty dict so callers can fall back.
    """
    if not GROQ_API_KEY:
        return {}

    try:
        client = get_groq_client()
        system_prompt = (
            "You explain job rejections to students in an honest but encouraging way. "
            "Always return valid JSON only."
        )
        user_prompt = _build_rejection_prompt(rejection_feedback, job_title, student_skills)
        result = client.chat_json(system_prompt=system_prompt, user_prompt=user_prompt)

        return {
            "rejection_category": result.get("rejection_category", "general"),
            "student_friendly_explanation": result.get("student_friendly_explanation", ""),
            "improvement_suggestions": result.get("improvement_suggestions", []),
            "motivational_message": result.get("motivational_message", ""),
            "next_steps": result.get("next_steps", []),
            "raw_feedback": rejection_feedback,
        }
    except Exception as e:
        print(f"[LLM] Rejection interpretation failed: {e}")
        return {}

