// src/components/practice/StreakBanner.jsx
import { Trophy } from 'lucide-react';

const StreakBanner = ({ currentStreak, longestStreak }) => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">🔥 {currentStreak} Day Streak!</h2>
          <p className="text-orange-100">Keep it going! Practice daily to maintain your streak</p>
        </div>
        <div className="text-center bg-white/20 rounded-lg p-4">
          <Trophy className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Best: {longestStreak} days</p>
        </div>
      </div>
    </div>
  );
};

export default StreakBanner;