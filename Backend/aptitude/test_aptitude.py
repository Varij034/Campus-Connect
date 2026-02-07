"""
Test script for Aptitude Engine API
Tests all endpoints to verify the module is working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_start_test():
    """Test starting a test"""
    print_section("Test 1: Start Test")
    try:
        response = requests.post(f"{BASE_URL}/aptitude/tests/1/start")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Test started successfully!")
            print(f"  Attempt ID: {data['attempt_id']}")
            print(f"  Test: {data['test']['title']}")
            print(f"  Questions received: {len(data['questions'])}")
            print(f"  Duration: {data['duration_minutes']} minutes")
            return data
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to server")
        print("  Make sure the server is running: python start_server.py")
        return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_submit_test(questions):
    """Test submitting a test"""
    print_section("Test 2: Submit Test")
    if not questions:
        print("⚠ Skipping - no questions available")
        return None
    
    # Create sample answers (all "A" for testing)
    answers = [
        {"question_id": q["id"], "selected_option": "A"}
        for q in questions
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/aptitude/tests/1/submit",
            json={"answers": answers},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Test submitted successfully!")
            print(f"  Attempt ID: {result['attempt_id']}")
            print(f"  Score: {result['score']}%")
            print(f"  Correct: {result['correct_answers']}/{result['total_questions']}")
            print(f"  Time taken: {result['time_taken']} seconds")
            return result
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_leaderboard():
    """Test getting leaderboard"""
    print_section("Test 3: Get Leaderboard")
    try:
        response = requests.get(f"{BASE_URL}/aptitude/tests/1/leaderboard")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Leaderboard retrieved!")
            print(f"  Test: {data['test_title']}")
            print(f"  Total participants: {data['total_participants']}")
            if data['entries']:
                print(f"\n  Top 3 scorers:")
                for entry in data['entries'][:3]:
                    print(f"    Rank #{entry['rank']}: Score {entry['score']}% (Time: {entry['time_taken']}s)")
            else:
                print("  No entries yet")
            return data
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_my_rank():
    """Test getting my rank"""
    print_section("Test 4: Get My Rank")
    try:
        response = requests.get(f"{BASE_URL}/aptitude/tests/1/my-rank")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Rank retrieved!")
            print(f"  Test: {data['test_title']}")
            if data['rank']:
                print(f"  Your rank: #{data['rank']}")
                print(f"  Your score: {data['score']}%")
                print(f"  Percentile: {data['percentile']}%")
                print(f"  Time taken: {data['time_taken']} seconds")
            else:
                print("  You haven't taken this test yet")
            return data
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  Aptitude Engine - API Test Suite")
    print("=" * 60)
    print("\nMake sure the server is running: python start_server.py")
    print("Press Enter to continue or Ctrl+C to cancel...")
    try:
        input()
    except KeyboardInterrupt:
        print("\nCancelled.")
        return
    
    # Run tests
    test_data = test_start_test()
    questions = test_data['questions'] if test_data else None
    
    test_submit_test(questions)
    test_leaderboard()
    test_my_rank()
    
    print_section("Test Summary")
    print("✓ All tests completed!")
    print("\nYou can also test the API using:")
    print("  - Swagger UI: http://localhost:8000/docs")
    print("  - ReDoc: http://localhost:8000/redoc")

if __name__ == "__main__":
    main()
