// src/components/student/SkillGapCard.jsx
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const SkillGapCard = ({ skills }) => {
  const getSkillStatus = (skill) => {
    if (skill.gap === 0 && skill.studentLevel >= skill.requiredLevel) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-800',
        statusText: '✓ You meet the requirement!',
        badgeColor: 'bg-green-500'
      };
    } else if (skill.gap > 0 && skill.gap <= 20) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        statusText: 'Close! Small improvement needed',
        badgeColor: 'bg-orange-500'
      };
    } else {
      return {
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        statusText: '⚠️ Priority - Focus on this!',
        badgeColor: 'bg-red-500'
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
            className={`bg-white rounded-xl border-2 ${status.borderColor} shadow-md hover:shadow-lg transition p-5`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {status.icon}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{skill.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    skill.priority === 'Must Have' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {skill.priority}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {skill.gap > 0 ? (
                  <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${status.badgeColor}`}>
                    Gap: {skill.gap}%
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-green-500 text-white font-bold text-sm">
                    ✓ Match
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Your Level */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-gray-600">Your Skill Level</span>
                  <span className="font-bold text-blue-600">{skill.studentLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${skill.studentLevel}%` }}
                  />
                </div>
              </div>

              {/* Required Level */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-gray-600">Required Level</span>
                  <span className="font-bold text-indigo-600">{skill.requiredLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${skill.requiredLevel}%` }}
                  />
                </div>
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

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900">
          <strong>💡 Pro Tip:</strong> Focus on "Must Have" skills with large gaps first. Complete practice challenges and online courses to boost your match score and increase interview chances!
        </p>
      </div>
    </div>
  );
};

export default SkillGapCard;