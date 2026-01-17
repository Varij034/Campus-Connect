// src/data/questions.js

export const questions = {
  easy: [
    {
      question: "If 2x + 5 = 15, what is the value of x?",
      options: ["3", "5", "7", "10"],
      correct: 1,
      explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5"
    },
    {
      question: "What is 15% of 200?",
      options: ["20", "25", "30", "35"],
      correct: 2,
      explanation: "15% of 200 = (15/100) × 200 = 30"
    }
  ],
  medium: [
    {
      question: "A train travels 120 km in 2 hours. What is its average speed?",
      options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
      correct: 1,
      explanation: "Speed = Distance/Time = 120/2 = 60 km/h"
    },
    {
      question: "If the ratio of boys to girls is 3:2 and there are 30 students, how many are boys?",
      options: ["12", "15", "18", "20"],
      correct: 2,
      explanation: "Total parts = 3+2 = 5. Boys = (3/5) × 30 = 18"
    }
  ],
  hard: [
    {
      question: "Find the next number in sequence: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correct: 1,
      explanation: "Differences: 4,6,8,10... Next difference is 12, so 30+12=42"
    },
    {
      question: "If A can do work in 10 days and B in 15 days, how many days together?",
      options: ["5 days", "6 days", "7 days", "8 days"],
      correct: 1,
      explanation: "A's rate = 1/10, B's rate = 1/15. Together = 1/10 + 1/15 = 5/30 = 1/6. So 6 days."
    }
  ]
};