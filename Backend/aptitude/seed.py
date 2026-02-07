"""
Seed function to create sample aptitude test data
For testing and development purposes
"""

from sqlalchemy.orm import Session
from .models import AptitudeTest, AptitudeQuestion, DifficultyLevel
from datetime import datetime


def seed_sample_test(db: Session) -> AptitudeTest:
    """
    Create a sample aptitude test with 10 questions
    
    Args:
        db: Database session
        
    Returns:
        Created AptitudeTest object
    """
    # Create test
    test = AptitudeTest(
        title="General Aptitude Test - Sample",
        description="A sample aptitude test covering logical reasoning, quantitative aptitude, and verbal ability.",
        duration_minutes=30,
        total_questions=10,
        created_at=datetime.utcnow()
    )
    db.add(test)
    db.flush()  # Get test ID
    
    # Sample questions
    questions_data = [
        {
            "question_text": "If a train travels 120 km in 2 hours, what is its average speed?",
            "option_a": "50 km/h",
            "option_b": "60 km/h",
            "option_c": "70 km/h",
            "option_d": "80 km/h",
            "correct_option": "B",
            "difficulty_level": DifficultyLevel.EASY
        },
        {
            "question_text": "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
            "option_a": "40",
            "option_b": "42",
            "option_c": "44",
            "option_d": "46",
            "correct_option": "B",
            "difficulty_level": DifficultyLevel.MEDIUM
        },
        {
            "question_text": "If all roses are flowers and some flowers are red, which statement is definitely true?",
            "option_a": "All roses are red",
            "option_b": "Some roses are red",
            "option_c": "No roses are red",
            "option_d": "Cannot be determined",
            "correct_option": "D",
            "difficulty_level": DifficultyLevel.MEDIUM
        },
        {
            "question_text": "A shopkeeper sells an item for $120 and makes a profit of 20%. What was the cost price?",
            "option_a": "$90",
            "option_b": "$100",
            "option_c": "$110",
            "option_d": "$115",
            "correct_option": "B",
            "difficulty_level": DifficultyLevel.MEDIUM
        },
        {
            "question_text": "Choose the word that is most similar in meaning to 'ABUNDANT':",
            "option_a": "Scarce",
            "option_b": "Plentiful",
            "option_c": "Limited",
            "option_d": "Rare",
            "correct_option": "B",
            "difficulty_level": DifficultyLevel.EASY
        },
        {
            "question_text": "If 3x + 5 = 20, what is the value of x?",
            "option_a": "3",
            "option_b": "4",
            "option_c": "5",
            "option_d": "6",
            "correct_option": "C",
            "difficulty_level": DifficultyLevel.EASY
        },
        {
            "question_text": "In a code language, 'CAT' is written as 'DBU'. How is 'DOG' written?",
            "option_a": "EPH",
            "option_b": "EPI",
            "option_c": "EQH",
            "option_d": "ERH",
            "correct_option": "A",
            "difficulty_level": DifficultyLevel.HARD
        },
        {
            "question_text": "A rectangle has length 8 cm and width 5 cm. What is its area?",
            "option_a": "13 cm²",
            "option_b": "26 cm²",
            "option_c": "40 cm²",
            "option_d": "45 cm²",
            "correct_option": "C",
            "difficulty_level": DifficultyLevel.EASY
        },
        {
            "question_text": "If the day after tomorrow is Sunday, what day was yesterday?",
            "option_a": "Wednesday",
            "option_b": "Thursday",
            "option_c": "Friday",
            "option_d": "Saturday",
            "correct_option": "B",
            "difficulty_level": DifficultyLevel.MEDIUM
        },
        {
            "question_text": "A number when divided by 7 gives a remainder of 3. What will be the remainder when the same number is divided by 5?",
            "option_a": "Cannot be determined",
            "option_b": "1",
            "option_c": "2",
            "option_d": "3",
            "correct_option": "A",
            "difficulty_level": DifficultyLevel.HARD
        }
    ]
    
    # Create questions
    for q_data in questions_data:
        question = AptitudeQuestion(
            test_id=test.id,
            question_text=q_data["question_text"],
            option_a=q_data["option_a"],
            option_b=q_data["option_b"],
            option_c=q_data["option_c"],
            option_d=q_data["option_d"],
            correct_option=q_data["correct_option"],
            difficulty_level=q_data["difficulty_level"]
        )
        db.add(question)
    
    db.commit()
    db.refresh(test)
    
    return test


def seed_data(db: Session):
    """
    Main seed function - creates sample test data
    
    Args:
        db: Database session
    """
    # Check if test already exists
    existing_test = db.query(AptitudeTest).filter(
        AptitudeTest.title == "General Aptitude Test - Sample"
    ).first()
    
    if existing_test:
        print(f"Sample test already exists with ID: {existing_test.id}")
        return existing_test
    
    test = seed_sample_test(db)
    print(f"✓ Created sample test with ID: {test.id}")
    print(f"✓ Created {len(test.questions)} questions")
    return test


if __name__ == "__main__":
    # This can be run standalone for testing
    # Make sure to set up database connection first
    print("Aptitude Engine - Seed Data")
    print("=" * 50)
    print("Note: This requires a database connection to be set up.")
    print("Please ensure database module is configured before running this script.")
    print("=" * 50)
