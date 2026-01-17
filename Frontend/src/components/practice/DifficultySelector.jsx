// src/components/practice/DifficultySelector.jsx
import { DIFFICULTY_LEVELS } from '../../data/constants';

const DifficultySelector = ({ selected, onSelect, onReset }) => {
  const difficulties = [
    { level: DIFFICULTY_LEVELS.EASY, emoji: '😊', label: 'Easy', desc: 'Perfect for beginners', color: 'green' },
    { level: DIFFICULTY_LEVELS.MEDIUM, emoji: '🎯', label: 'Medium', desc: 'Challenge yourself', color: 'blue' },
    { level: DIFFICULTY_LEVELS.HARD, emoji: '🔥', label: 'Hard', desc: 'Expert level', color: 'purple' }
  ];

  const handleSelect = (level) => {
    onSelect(level);
    onReset();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Select Difficulty</h3>
      <div className="grid grid-cols-3 gap-4">
        {difficulties.map(({ level, emoji, label, desc, color }) => (
          <button
            key={level}
            onClick={() => handleSelect(level)}
            className={`p-4 rounded-lg border-2 transition ${
              selected === level
                ? `border-${color}-500 bg-${color}-50`
                : 'border-gray-200 hover:border-' + color + '-300'
            }`}
          >
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="font-bold">{label}</div>
            <div className="text-sm text-gray-600">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;