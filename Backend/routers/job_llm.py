"""Job authoring helper endpoints powered by LLM."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.dependencies import get_current_active_user
from config import GROQ_API_KEY
from database.models import User
from database.postgres import get_db
from llm.groq_client import get_groq_client


router = APIRouter(prefix="/api/v1/llm/jobs", tags=["LLM - Jobs"])


def _require_recruiter_or_admin(user: User) -> None:
    if user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can use job authoring helpers.",
        )
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured; LLM job tools are unavailable.",
        )


@router.post("/generate-description")
async def generate_description(
    title: str,
    company: str,
    responsibilities: str,
    required_skills: list[str],
    preferred_skills: list[str] | None = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate a full job description from structured fields."""
    _require_recruiter_or_admin(current_user)

    client = get_groq_client()
    system_prompt = (
        "You write clear, inclusive job descriptions for campus hiring. "
        "Always return valid JSON only."
    )
    user_prompt = (
        f"Title: {title}\n"
        f"Company: {company}\n"
        f"Responsibilities (notes): {responsibilities}\n"
        f"Required skills: {required_skills}\n"
        f"Preferred skills: {preferred_skills or []}\n\n"
        "Write a concise, student-friendly job description.\n"
        "Respond with JSON: {\"description\": string}"
    )

    result = client.chat_json(system_prompt=system_prompt, user_prompt=user_prompt)
    return {"description": result.get("description", "")}


@router.post("/rewrite-description")
async def rewrite_description(
    description: str,
    style: str = "campus_friendly",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Rewrite an existing description.

    style options (soft): 'campus_friendly', 'formal', 'short'.
    """
    _require_recruiter_or_admin(current_user)

    client = get_groq_client()
    system_prompt = (
        "You rewrite job descriptions in different tones while keeping content accurate. "
        "Always return valid JSON only."
    )
    user_prompt = (
        f"Style: {style}\n\n"
        f"Original description:\n{description}\n\n"
        "Respond with JSON: {\"description\": string}"
    )

    result = client.chat_json(system_prompt=system_prompt, user_prompt=user_prompt)
    return {"description": result.get("description", "")}


class ExtractRequirementsBody(BaseModel):
    description: str


@router.post("/extract-requirements")
async def extract_requirements(
    body: ExtractRequirementsBody,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Extract structured requirements from free-text description.

    Shape is aligned with existing Job.requirements_json usage.
    """
    _require_recruiter_or_admin(current_user)
    description = body.description

    client = get_groq_client()
    system_prompt = (
        "You convert job descriptions into structured requirements suitable for an ATS. "
        "Always return valid JSON only."
    )
    user_prompt = (
        "From the following job description, extract a requirements object with keys:\n"
        "- job_title: string\n"
        "- required_skills: list[str]\n"
        "- preferred_skills: list[str]\n"
        "- education_level: string\n"
        "- years_of_experience: int\n"
        "- job_description: string (cleaned, concise)\n\n"
        f"Description:\n{description}\n\n"
        "Respond with a JSON object with exactly those keys."
    )

    result = client.chat_json(system_prompt=system_prompt, user_prompt=user_prompt)
    return result

