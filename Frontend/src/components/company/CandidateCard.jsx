// src/components/company/CandidateCard.jsx
import { CheckCircle } from 'lucide-react';

const CandidateCard = ({ name, match, skills, verified }) => {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold">{name}</h4>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
          {match}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{skills}</p>
      {verified && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>TPO Verified</span>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;