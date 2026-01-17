'use client';

interface SkillBarProps {
  skill: string;
  level: number;
  recommended?: boolean;
}

export default function SkillBar({ skill, level, recommended = false }: SkillBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-base-content">{skill}</span>
        <span className="text-sm text-base-content/70">{level}%</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            recommended ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${level}%` }}
        />
      </div>
      {recommended && (
        <span className="text-xs text-warning mt-1">⚡ Recommended to improve</span>
      )}
    </div>
  );
}
