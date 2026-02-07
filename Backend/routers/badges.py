"""Badges and candidate badge awards"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database.postgres import get_db
from database.models import User, Badge, CandidateBadge, Candidate
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/v1/badges", tags=["Badges"])


class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str | None
    skill_key: str | None
    criteria_json: dict | None
    image_url: str | None

    class Config:
        from_attributes = True


class CandidateBadgeResponse(BaseModel):
    id: int
    candidate_id: int
    badge_id: int
    awarded_at: str
    source: str | None
    badge: BadgeResponse | None = None

    class Config:
        from_attributes = True


@router.get("/me", response_model=List[CandidateBadgeResponse])
async def get_my_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get badges for the current user (student's own badges)."""
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        return []
    rows = (
        db.query(CandidateBadge)
        .filter(CandidateBadge.candidate_id == candidate.id)
        .all()
    )
    out = []
    for row in rows:
        b = row.badge
        out.append(CandidateBadgeResponse(
            id=row.id,
            candidate_id=row.candidate_id,
            badge_id=row.badge_id,
            awarded_at=row.awarded_at.isoformat() if row.awarded_at else "",
            source=row.source,
            badge=BadgeResponse(
                id=b.id,
                name=b.name,
                description=b.description,
                skill_key=b.skill_key,
                criteria_json=b.criteria_json,
                image_url=b.image_url,
            ) if b else None,
        ))
    return out


@router.get("", response_model=List[BadgeResponse])
async def list_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all badges (any authenticated user)."""
    badges = db.query(Badge).all()
    return badges


@router.get("/candidates/{candidate_id}", response_model=List[CandidateBadgeResponse])
async def get_candidate_badges(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List badges awarded to a candidate."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if candidate.user_id != current_user.id and current_user.role.value not in ["recruiter", "admin", "tpo"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    rows = (
        db.query(CandidateBadge)
        .filter(CandidateBadge.candidate_id == candidate_id)
        .all()
    )
    out = []
    for row in rows:
        b = row.badge
        out.append(CandidateBadgeResponse(
            id=row.id,
            candidate_id=row.candidate_id,
            badge_id=row.badge_id,
            awarded_at=row.awarded_at.isoformat() if row.awarded_at else "",
            source=row.source,
            badge=BadgeResponse(
                id=b.id,
                name=b.name,
                description=b.description,
                skill_key=b.skill_key,
                criteria_json=b.criteria_json,
                image_url=b.image_url,
            ) if b else None,
        ))
    return out


class AwardBadgeBody(BaseModel):
    candidate_id: int
    badge_id: int
    source: str = "tpo"


@router.post("/award", response_model=CandidateBadgeResponse)
async def award_badge(
    body: AwardBadgeBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Award a badge to a candidate (recruiter, admin, or TPO)."""
    if current_user.role.value not in ["recruiter", "admin", "tpo"]:
        raise HTTPException(status_code=403, detail="Only recruiters, admins, or TPO can award badges")
    candidate = db.query(Candidate).filter(Candidate.id == body.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    badge = db.query(Badge).filter(Badge.id == body.badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    existing = (
        db.query(CandidateBadge)
        .filter(
            CandidateBadge.candidate_id == body.candidate_id,
            CandidateBadge.badge_id == body.badge_id,
        )
        .first()
    )
    if existing:
        return CandidateBadgeResponse(
            id=existing.id,
            candidate_id=existing.candidate_id,
            badge_id=existing.badge_id,
            awarded_at=existing.awarded_at.isoformat() if existing.awarded_at else "",
            source=existing.source or "",
            badge=BadgeResponse(
                id=badge.id,
                name=badge.name,
                description=badge.description,
                skill_key=badge.skill_key,
                criteria_json=badge.criteria_json,
                image_url=badge.image_url,
            ),
        )
    cb = CandidateBadge(
        candidate_id=body.candidate_id,
        badge_id=body.badge_id,
        source=body.source,
    )
    db.add(cb)
    db.commit()
    db.refresh(cb)
    return CandidateBadgeResponse(
        id=cb.id,
        candidate_id=cb.candidate_id,
        badge_id=cb.badge_id,
        awarded_at=cb.awarded_at.isoformat() if cb.awarded_at else "",
        source=cb.source or "",
        badge=BadgeResponse(
            id=badge.id,
            name=badge.name,
            description=badge.description,
            skill_key=badge.skill_key,
            criteria_json=badge.criteria_json,
            image_url=badge.image_url,
        ),
    )


def try_award_badges_for_passed_evaluation(
    db: Session,
    candidate_id: int,
    matched_skills: list,
    skill_match_score: float,
) -> None:
    """Called from ATS flow when a candidate passes; award badges whose skill_key is in matched_skills."""
    if not matched_skills:
        return
    badges = db.query(Badge).filter(Badge.skill_key != None).all()
    for badge in badges:
        sk = (badge.skill_key or "").lower()
        if not sk:
            continue
        if not any(sk in (s or "").lower() for s in matched_skills):
            continue
        existing = (
            db.query(CandidateBadge)
            .filter(
                CandidateBadge.candidate_id == candidate_id,
                CandidateBadge.badge_id == badge.id,
            )
            .first()
        )
        if existing:
            continue
        cb = CandidateBadge(
            candidate_id=candidate_id,
            badge_id=badge.id,
            source="ats",
        )
        db.add(cb)
    db.commit()
