# Resume-JD Skill Analyzer

A FastAPI-based application that analyzes resumes against job descriptions to identify missing skills and requirements.

## Features

- Upload resumes in multiple formats (PDF, DOCX, TXT)
- Compare resumes against predefined or custom job descriptions
- Identify missing skills categorized by type
- Calculate skill match percentage
- Predefined job descriptions for:
  - Software Engineer
  - Finance Analyst
  - Data Scientist
  - Product Manager
  - DevOps Engineer

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Start the Server

**Option 1: Using the batch file (Windows - Recommended)**
```bash
start_server.bat
```
Or double-click `start_server.bat`

**Option 2: Using Python directly**
```bash
python main.py
```

**Option 3: Using uvicorn directly**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Stop the Server

**Option 1: Using the batch file**
```bash
stop_server.bat
```

**Option 2: Press Ctrl+C** in the terminal where the server is running

**Option 3: Restart the server**
```bash
restart_server.bat
```

### Port Already in Use?

If you get an error that port 8000 is already in use:
1. Run `stop_server.bat` to stop any existing server
2. Or manually kill the process: `taskkill /F /PID <process_id>`
3. Then start the server again

### API Endpoints

#### 1. Get Available Job Descriptions
```bash
GET http://localhost:8000/jds
```

#### 2. Analyze Resume from File Path
```bash
POST http://localhost:8000/analyze
Content-Type: application/json

{
  "resume_path": "path/to/resume.pdf",
  "jd_name": "software_engineer"
}
```

Or with custom JD:
```bash
POST http://localhost:8000/analyze
Content-Type: application/json

{
  "resume_path": "path/to/resume.pdf",
  "jd_text": "Your custom job description text here..."
}
```

#### 3. Upload Resume File
```bash
POST http://localhost:8000/upload-resume
Content-Type: multipart/form-data

file: [your resume file]
```

#### 4. Analyze from Path (Extract Text Only)
```bash
POST http://localhost:8000/analyze-from-path
Content-Type: application/json

{
  "resume_path": "path/to/resume.pdf"
}
```

### Available Job Descriptions

- `software_engineer` - Full Stack Developer position
- `finance_analyst` - Financial Analyst position
- `data_scientist` - Data Scientist position
- `product_manager` - Product Manager position
- `devops_engineer` - DevOps Engineer position

### Example Response

```json
{
  "resume_path": "resume.pdf",
  "jd_name": "software_engineer",
  "analysis": {
    "resume_skills": ["python", "javascript", "react"],
    "jd_required_skills": ["python", "javascript", "react", "docker", "kubernetes"],
    "matching_skills": ["python", "javascript", "react"],
    "missing_skills": ["docker", "kubernetes"],
    "missing_skills_by_category": {
      "Cloud Platforms": ["docker", "kubernetes"]
    },
    "match_percentage": 60.0,
    "summary": {
      "total_jd_skills": 5,
      "resume_skills_count": 3,
      "matching_skills_count": 3,
      "missing_skills_count": 2
    }
  }
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
.
├── main.py                 # FastAPI application and endpoints
├── resume_parser.py        # Text extraction from resumes
├── skill_analyzer.py       # Skill extraction and comparison logic
├── job_descriptions.py     # Predefined job descriptions
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Supported File Formats

- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

## Notes

- The application uses keyword matching to identify skills
- Skills are matched case-insensitively
- The analysis includes categorized missing skills for better understanding
- Match percentage is calculated based on required skills found in the resume

