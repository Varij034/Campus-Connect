// src/components/student/DailyPracticeSection.jsx
import { Award } from 'lucide-react';

const DailyPracticeSection = ({ solvedToday, currentStreak, longestStreak, onStartPractice }) => {
  return (
    <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow p-6 border-2 border-purple-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Daily Practice Challenge
        </h3>
        <button
          onClick={onStartPractice}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          Start Practice →
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Today's Status</p>
          <p className="text-2xl font-bold text-purple-600">
            {solvedToday ? '✅ Completed' : '⏳ Pending'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold text-orange-600">{currentStreak} days 🔥</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-2xl font-bold text-blue-600">{longestStreak} days 🏆</p>
        </div>
      </div>
    </div>
  );
};

export default DailyPracticeSection;