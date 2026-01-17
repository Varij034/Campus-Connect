'use client';

import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface Skill {
  name: string;
  studentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'Must Have' | 'Nice to Have';
}

interface SkillGapCardProps {
  skills: Skill[];
}

export default function SkillGapCard({ skills }: SkillGapCardProps) {
  const getSkillStatus = (skill: Skill) => {
    if (skill.gap === 0 && skill.studentLevel >= skill.requiredLevel) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-success" />,
        bgColor: 'bg-success/10',
        borderColor: 'border-success',
        textColor: 'text-success',
        statusText: '✓ You meet the requirement!',
        badgeColor: 'bg-success'
      };
    } else if (skill.gap > 0 && skill.gap <= 20) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-warning" />,
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning',
        textColor: 'text-warning',
        statusText: 'Close! Small improvement needed',
        badgeColor: 'bg-warning'
      };
    } else {
      return {
        icon: <AlertCircle className="w-5 h-5 text-error" />,
        bgColor: 'bg-error/10',
        borderColor: 'border-error',
        textColor: 'text-error',
        statusText: '⚠️ Priority - Focus on this!',
        badgeColor: 'bg-error'
      };
    }
  };

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => {
        const status = getSkillStatus(skill);
        
        return (
          <div 
            key={index} 
            className={`card bg-base-100 border-2 ${status.borderColor} shadow-md hover:shadow-lg transition p-5`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {status.icon}
                <div>
                  <h4 className="font-bold text-base-content text-lg">{skill.name}</h4>
                  <span className={`badge badge-sm ${
                    skill.priority === 'Must Have' ? 'badge-primary' : 'badge-info'
                  }`}>
                    {skill.priority}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {skill.gap > 0 ? (
                  <div className={`badge ${status.badgeColor} text-white font-bold`}>
                    Gap: {skill.gap}%
                  </div>
                ) : (
                  <div className="badge badge-success text-white font-bold">
                    ✓ Match
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Your Level */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-base-content/70">Your Skill Level</span>
                  <span className="font-bold text-primary">{skill.studentLevel}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={skill.studentLevel} 
                  max={100}
                />
              </div>

              {/* Required Level */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-base-content/70">Required Level</span>
                  <span className="font-bold text-secondary">{skill.requiredLevel}%</span>
                </div>
                <progress 
                  className="progress progress-secondary w-full" 
                  value={skill.requiredLevel} 
                  max={100}
                />
              </div>
            </div>

            <div className={`mt-3 pt-3 border-t ${status.borderColor}`}>
              <p className={`text-sm font-semibold ${status.textColor}`}>
                {status.statusText}
              </p>
            </div>
          </div>
        );
      })}

      <div className="mt-6 card bg-info/10 border-2 border-info/30">
        <div className="card-body p-4">
          <p className="text-sm text-info">
            <strong>💡 Pro Tip:</strong> Focus on "Must Have" skills with large gaps first. Complete practice challenges and online courses to boost your match score and increase interview chances!
          </p>
        </div>
      </div>
    </div>
  );
}
