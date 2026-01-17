// src/components/student/SkillBar.jsx

const SkillBar = ({ skill, level, recommended }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{skill}</span>
        <span className="text-sm text-gray-600">{level}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${recommended ? 'bg-orange-500' : 'bg-indigo-600'}`}
          style={{ width: `${level}%` }}
        />
      </div>
      {recommended && (
        <span className="text-xs text-orange-600 mt-1">⚡ Recommended to improve</span>
      )}
    </div>
  );
};

export default SkillBar;