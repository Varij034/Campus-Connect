// src/pages/PracticePage.jsx
import { Brain } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DifficultySelector from '../components/practice/DifficultySelector';
import ProgressTracker from '../components/practice/ProgressTracker';
import QuestionCard from '../components/practice/QuestionCard';
import StreakBanner from '../components/practice/StreakBanner';
import { DIFFICULTY_LEVELS, PAGES } from '../data/constants';
import { questions } from '../data/questions';

const PracticePage = ({ 
  currentStreak, 
  longestStreak, 
  onNavigate, 
  onComplete 
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestions = questions[selectedDifficulty];
  const question = currentQuestions[currentQuestion];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === question.correct) {
      setScore(score + 1);
      // Show correct answer toast
      toast.success('Correct! Great job! 🎉', {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
        duration: 2000,
      });
    } else {
      // Show wrong answer toast
      toast.error('Incorrect! Check the explanation', {
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
        duration: 2000,
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = score + (selectedAnswer === question.correct ? 1 : 0);
      const passed = finalScore >= currentQuestions.length * 0.7;
      const percentage = ((finalScore / currentQuestions.length) * 100).toFixed(0);
      
      onComplete(passed);
      
      // Show completion toast with results
      if (passed) {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg">Practice Complete! 🎉</div>
              <div>Score: {finalScore}/{currentQuestions.length} ({percentage}%)</div>
              <div className="text-sm">Streak maintained! 🔥</div>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: '#10b981',
              color: '#fff',
              minWidth: '300px',
            },
          }
        );
      } else {
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg">Practice Complete</div>
              <div>Score: {finalScore}/{currentQuestions.length} ({percentage}%)</div>
              <div className="text-sm">Keep practicing to improve! 💪</div>
            </div>
          ),
          {
            duration: 5000,
            icon: '📊',
            style: {
              background: '#f59e0b',
              color: '#fff',
              minWidth: '300px',
            },
          }
        );
      }
      
      // Navigate back after showing toast
      setTimeout(() => {
        onNavigate(PAGES.DASHBOARD);
      }, 1500);
    }
  };

  const resetPractice = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    toast.success('Practice reset! Good luck! 🚀', {
      icon: '🔄',
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Daily Practice Arena</h1>
          </div>
          <button
            onClick={() => {
              toast.success('Returning to dashboard...', {
                icon: '🏠',
                duration: 1500,
              });
              setTimeout(() => onNavigate(PAGES.DASHBOARD), 500);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <StreakBanner currentStreak={currentStreak} longestStreak={longestStreak} />

        <DifficultySelector
          selected={selectedDifficulty}
          onSelect={setSelectedDifficulty}
          onReset={resetPractice}
        />

        <QuestionCard
          question={question}
          currentIndex={currentQuestion}
          totalQuestions={currentQuestions.length}
          score={score}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          onAnswer={handleAnswer}
          onNext={nextQuestion}
        />

        <ProgressTracker />
      </div>
    </div>
  );
};

export default PracticePage;