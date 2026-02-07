"""
Quick example showing how to use the Resume-JD Skill Analyzer API
"""
import requests
import json

# Base URL of the API
BASE_URL = "http://localhost:8000"

# Example: Analyze a resume against Software Engineer JD
def example_analyze():
    # Replace with your actual resume file path
    resume_path = r"C:\path\to\your\resume.pdf"
    
    # Prepare the request
    payload = {
        "resume_path": resume_path,
        "jd_name": "software_engineer"  # or "finance_analyst", "data_scientist", etc.
    }
    
    # Make the API call
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        analysis = result["analysis"]
        
        print("=" * 60)
        print("RESUME ANALYSIS RESULTS")
        print("=" * 60)
        print(f"\nResume: {result['resume_path']}")
        print(f"Job Description: {result['jd_name']}")
        print(f"\nMatch Percentage: {analysis['match_percentage']}%")
        
        print(f"\n✓ Matching Skills ({len(analysis['matching_skills'])}):")
        for skill in analysis['matching_skills']:
            print(f"  • {skill}")
        
        print(f"\n✗ Missing Skills ({len(analysis['missing_skills'])}):")
        for skill in analysis['missing_skills']:
            print(f"  • {skill}")
        
        if analysis['missing_skills_by_category']:
            print("\nMissing Skills by Category:")
            for category, skills in analysis['missing_skills_by_category'].items():
                print(f"  {category}:")
                for skill in skills:
                    print(f"    - {skill}")
        
        print("\n" + "=" * 60)
    else:
        print(f"Error: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    print("Make sure the API server is running:")
    print("  python main.py")
    print("\nThen update the resume_path in this script and run it.")
    print("\nOr use the interactive test script:")
    print("  python test_example.py")

