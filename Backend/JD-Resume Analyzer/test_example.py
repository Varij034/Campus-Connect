"""
Example script to test the Resume-JD Skill Analyzer API
"""
import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_get_jds():
    """Test getting available job descriptions"""
    print("Testing: Get Available Job Descriptions")
    try:
        response = requests.get(f"{BASE_URL}/jds", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the server is running.")
        print("Start the server with: python main.py")
        print()

def test_analyze_resume(resume_path: str, jd_name: str = "software_engineer"):
    """Test analyzing a resume against a job description"""
    print(f"Testing: Analyze Resume ({resume_path}) against {jd_name}")
    
    if not os.path.exists(resume_path):
        print(f"Error: Resume file not found at {resume_path}")
        print("Please provide a valid path to a resume file.\n")
        return
    
    payload = {
        "resume_path": resume_path,
        "jd_name": jd_name
    }
    
    try:
        response = requests.post(f"{BASE_URL}/analyze", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            analysis = result["analysis"]
            
            print("\n=== Analysis Results ===")
            print(f"Match Percentage: {analysis['match_percentage']}%")
            print(f"\nMatching Skills ({len(analysis['matching_skills'])}):")
            for skill in analysis['matching_skills']:
                print(f"  ✓ {skill}")
            
            print(f"\nMissing Skills ({len(analysis['missing_skills'])}):")
            for skill in analysis['missing_skills']:
                print(f"  ✗ {skill}")
            
            if analysis['missing_skills_by_category']:
                print("\nMissing Skills by Category:")
                for category, skills in analysis['missing_skills_by_category'].items():
                    print(f"  {category}: {', '.join(skills)}")
            
            print(f"\nSummary:")
            print(f"  Total JD Skills: {analysis['summary']['total_jd_skills']}")
            print(f"  Resume Skills: {analysis['summary']['resume_skills_count']}")
            print(f"  Matching: {analysis['summary']['matching_skills_count']}")
            print(f"  Missing: {analysis['summary']['missing_skills_count']}")
        else:
            print(f"Error: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the server is running.")
        print("Start the server with: python main.py")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    print("\n")

def test_all_jds(resume_path: str):
    """Test resume against all available job descriptions"""
    jds = ["software_engineer", "finance_analyst", "data_scientist", 
           "product_manager", "devops_engineer"]
    
    for jd in jds:
        test_analyze_resume(resume_path, jd)
        print("-" * 50)

if __name__ == "__main__":
    print("=" * 50)
    print("Resume-JD Skill Analyzer - Test Script")
    print("=" * 50)
    print()
    
    # Test getting available JDs
    test_get_jds()
    
    # Example: Test with a resume file
    # Replace this path with your actual resume file path
    resume_path = input("Enter the path to your resume file (or press Enter to skip): ").strip()
    
    if resume_path:
        if os.path.exists(resume_path):
            print("\nChoose an option:")
            print("1. Test against Software Engineer JD")
            print("2. Test against Finance Analyst JD")
            print("3. Test against Data Scientist JD")
            print("4. Test against Product Manager JD")
            print("5. Test against DevOps Engineer JD")
            print("6. Test against all JDs")
            
            choice = input("\nEnter your choice (1-6): ").strip()
            
            jd_map = {
                "1": "software_engineer",
                "2": "finance_analyst",
                "3": "data_scientist",
                "4": "product_manager",
                "5": "devops_engineer"
            }
            
            if choice in jd_map:
                test_analyze_resume(resume_path, jd_map[choice])
            elif choice == "6":
                test_all_jds(resume_path)
            else:
                print("Invalid choice. Testing against Software Engineer JD by default.")
                test_analyze_resume(resume_path, "software_engineer")
        else:
            print(f"Error: File not found at {resume_path}")
    else:
        print("\nSkipping resume analysis. To test:")
        print("1. Start the server: python main.py")
        print("2. Run this script again with a resume file path")
        print("3. Or use the API directly at http://localhost:8000/docs")

