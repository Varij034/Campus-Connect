from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
from pathlib import Path

from resume_parser import extract_text_from_resume
from skill_analyzer import analyze_missing_skills
from job_descriptions import get_job_description

app = FastAPI(title="Resume-JD Skill Analyzer", version="1.0.0")

# Serve static files (HTML interface)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumePathRequest(BaseModel):
    resume_path: str

class JDAnalysisRequest(BaseModel):
    resume_path: str
    jd_name: Optional[str] = None
    jd_text: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint - serves HTML interface if available"""
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {
        "message": "Resume-JD Skill Analyzer API",
        "endpoints": {
            "GET /": "This page (or HTML interface)",
            "GET /docs": "Interactive API documentation",
            "GET /jds": "Get list of available job descriptions",
            "POST /analyze": "Analyze resume against JD",
            "POST /upload-resume": "Upload resume file",
            "POST /analyze-from-path": "Analyze resume from file path"
        },
        "web_interface": "Visit http://localhost:8000/static/index.html for web interface"
    }

@app.get("/jds")
async def get_available_jds():
    """Get list of available job descriptions"""
    jds = get_job_description(None)  # Get all JDs
    return {
        "available_jds": list(jds.keys()),
        "message": "Use jd_name parameter in /analyze endpoint to select a JD"
    }

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume file and extract text"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Extract text from resume
        resume_text = extract_text_from_resume(tmp_path)
        
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "filename": file.filename,
            "extracted_text": resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
            "text_length": len(resume_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/analyze-from-path")
async def analyze_from_path(request: ResumePathRequest):
    """Analyze resume from file path"""
    if not os.path.exists(request.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    try:
        resume_text = extract_text_from_resume(request.resume_path)
        return {
            "resume_path": request.resume_path,
            "extracted_text": resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
            "text_length": len(resume_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/analyze")
async def analyze_resume(request: JDAnalysisRequest):
    """
    Analyze resume against job description and return missing skills
    
    Either provide jd_name (for predefined JDs) or jd_text (for custom JD)
    """
    # Validate input
    if not request.jd_name and not request.jd_text:
        raise HTTPException(
            status_code=400, 
            detail="Either jd_name or jd_text must be provided"
        )
    
    # Check if file exists with better error message
    if not os.path.exists(request.resume_path):
        # Provide more helpful error message
        error_msg = f"Resume file not found at: {request.resume_path}"
        if os.path.dirname(request.resume_path):
            error_msg += f"\nDirectory exists: {os.path.exists(os.path.dirname(request.resume_path))}"
        raise HTTPException(status_code=404, detail=error_msg)
    
    try:
        # Extract text from resume
        resume_text = extract_text_from_resume(request.resume_path)
        
        if not resume_text or len(resume_text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract text from resume. Possible reasons:\n"
                    "- PDF is image-based (scanned) - requires OCR software\n"
                    "- PDF is password protected\n"
                    "- File is corrupted or empty\n"
                    "- Try converting to DOCX or TXT format"
                )
            )
        
        # Get job description
        if request.jd_name:
            jd_text = get_job_description(request.jd_name)
            if not jd_text:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Job description '{request.jd_name}' not found. Available JDs: software_engineer, finance_analyst, data_scientist, product_manager, devops_engineer"
                )
        else:
            jd_text = request.jd_text
        
        # Analyze missing skills
        analysis_result = analyze_missing_skills(resume_text, jd_text)
        
        return {
            "resume_path": request.resume_path,
            "jd_name": request.jd_name or "Custom JD",
            "analysis": analysis_result
        }
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=f"Permission denied: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

