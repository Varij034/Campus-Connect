// src/components/practice/QuestionCard.jsx
import { Zap } from 'lucide-react';

const QuestionCard = ({ 
  question, 
  currentIndex, 
  totalQuestions, 
  score, 
  selectedAnswer, 
  showExplanation, 
  onAnswer, 
  onNext 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <div className="text-sm font-bold text-purple-600">
          Score: {score}/{totalQuestions}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showExplanation && onAnswer(index)}
              disabled={showExplanation}
              className={`w-full p-4 text-left rounded-lg border-2 transition ${
                showExplanation
                  ? index === question.correct
                    ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  : selectedAnswer === index
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  showExplanation && index === question.correct
                    ? 'bg-green-500 text-white'
                    : showExplanation && index === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Explanation</h3>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={onNext}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
        >
          {currentIndex < totalQuestions - 1 ? 'Next Question →' : 'Complete Practice 🎉'}
        </button>
      )}
    </div>
  );
};

export default QuestionCard;