# 🚀 Quick Start Guide

## Step 1: Start the Server

**Option 1: Double-click the batch file**
- Double-click `start_server.bat`

**Option 2: Command line**
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 2: Open in Browser

### 🌐 Web Interface (Easiest Way!)
Open your browser and go to:
```
http://localhost:8000
```
or
```
http://localhost:8000/static/index.html
```

This gives you a beautiful web interface where you can:
- Enter your resume file path
- Select a job description
- Click "Analyze Resume"
- See results instantly!

### 📚 API Documentation
For advanced users, visit:
```
http://localhost:8000/docs
```

## Step 3: Upload and Analyze Resume

### Using the Web Interface:

1. **Start the server** (see Step 1)
2. **Open browser** → `http://localhost:8000`
3. **Enter resume path**:
   - Example: `C:\Users\Varij\Documents\resume.pdf`
   - Or: `C:\Users\Varij\Desktop\my_resume.docx`
4. **Select job description** from dropdown:
   - Software Engineer
   - Finance Analyst
   - Data Scientist
   - Product Manager
   - DevOps Engineer
5. **Click "Analyze Resume"**
6. **View results**:
   - Match percentage
   - Matching skills (green)
   - Missing skills (red)
   - Skills by category

### Using the API Documentation (Swagger UI):

1. Go to `http://localhost:8000/docs`
2. Find **POST /analyze**
3. Click "Try it out"
4. Enter:
   ```json
   {
     "resume_path": "C:\\Users\\Varij\\Documents\\resume.pdf",
     "jd_name": "software_engineer"
   }
   ```
5. Click "Execute"
6. See the JSON response with all analysis results

## Example Resume Paths

Windows format:
```
C:\Users\YourName\Documents\resume.pdf
C:\Users\YourName\Desktop\resume.docx
D:\Resumes\my_resume.txt
```

## Supported File Formats

- ✅ PDF (.pdf)
- ✅ Microsoft Word (.docx, .doc)
- ✅ Plain Text (.txt)

## Troubleshooting

### "Connection refused" error
- **Solution**: Make sure the server is running!
- Check: Do you see "Uvicorn running on http://0.0.0.0:8000"?
- If not, start it with `python main.py`

### "File not found" error
- **Solution**: Use the full absolute path
- Example: `C:\Users\Varij\Documents\resume.pdf` ✅
- Not: `resume.pdf` ❌

### Port 8000 already in use
- **Solution**: Stop other applications using port 8000
- Or modify `main.py` to use a different port (change `port=8000`)

### Can't see the web interface
- Make sure you're going to: `http://localhost:8000`
- Or try: `http://127.0.0.1:8000`
- Check that `static/index.html` exists

## Need Help?

- Check `USAGE_GUIDE.md` for detailed instructions
- Visit `http://localhost:8000/docs` for API documentation
- All endpoints are documented there!

