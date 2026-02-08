# How to Use the Resume-JD Skill Analyzer

## Step 1: Start the Server

### Option A: Using the batch file (Windows)
Double-click `start_server.bat` or run:
```bash
start_server.bat
```

### Option B: Using Python directly
```bash
python main.py
```

The server will start at `http://localhost:8000`

## Step 2: Access in Browser

Once the server is running, open your web browser and go to:

### Interactive API Documentation (Swagger UI)
**http://localhost:8000/docs**

This is the easiest way to use the application! You can:
- See all available endpoints
- Test the API directly from the browser
- Upload files and see responses

### Alternative Documentation (ReDoc)
**http://localhost:8000/redoc**

## Step 3: Upload and Analyze Resume

### Method 1: Using the Web Interface (Recommended)

1. Open **http://localhost:8000/docs** in your browser
2. Find the **POST /analyze** endpoint
3. Click "Try it out"
4. Fill in the form:
   - **resume_path**: Enter the full path to your resume file
     - Example: `C:\Users\Varij\Documents\resume.pdf`
   - **jd_name**: Choose from dropdown or enter one of:
     - `software_engineer`
     - `finance_analyst`
     - `data_scientist`
     - `product_manager`
     - `devops_engineer`
   - **jd_text**: Leave empty if using jd_name, or paste custom JD text
5. Click "Execute"
6. View the results showing missing skills!

### Method 2: Using File Upload

1. In the Swagger UI, find **POST /upload-resume**
2. Click "Try it out"
3. Click "Choose File" and select your resume
4. Click "Execute" to extract text from resume
5. Then use **POST /analyze** with the resume path

### Method 3: Using Python Script

```python
import requests

# Analyze resume
payload = {
    "resume_path": r"C:\path\to\your\resume.pdf",
    "jd_name": "software_engineer"
}

response = requests.post("http://localhost:8000/analyze", json=payload)
result = response.json()
print(result)
```

### Method 4: Using cURL (Command Line)

```bash
curl -X POST "http://localhost:8000/analyze" ^
  -H "Content-Type: application/json" ^
  -d "{\"resume_path\": \"C:\\\\Users\\\\Varij\\\\Documents\\\\resume.pdf\", \"jd_name\": \"software_engineer\"}"
```

## Example: Complete Workflow

1. **Start Server**: Run `python main.py` or `start_server.bat`
2. **Open Browser**: Go to http://localhost:8000/docs
3. **Upload Resume**: 
   - Use POST /upload-resume to upload a file, OR
   - Use POST /analyze with resume_path pointing to your file
4. **Select JD**: Choose a job description name (e.g., "software_engineer")
5. **Get Results**: View missing skills, match percentage, and categorized skills

## Supported Resume Formats

- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

## Available Job Descriptions

- `software_engineer` - Full Stack Developer
- `finance_analyst` - Financial Analyst
- `data_scientist` - Data Scientist
- `product_manager` - Product Manager
- `devops_engineer` - DevOps Engineer

## Troubleshooting

### Server won't start
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8000 is already in use

### Can't connect to server
- Make sure the server is running (you should see "Uvicorn running on http://0.0.0.0:8000")
- Check the URL: http://localhost:8000

### File not found error
- Use absolute paths: `C:\Users\YourName\Documents\resume.pdf`
- Make sure the file exists at that path
- Check file permissions

### Import errors
- Reinstall dependencies: `pip install -r requirements.txt`

