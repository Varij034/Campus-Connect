// src/components/tpo/VerificationItem.jsx
import { CheckCircle, XCircle } from 'lucide-react';

const VerificationItem = ({ name, branch, status }) => {
  return (
    <div className="flex justify-between items-center p-3 border rounded-lg">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-gray-600">{branch}</p>
      </div>
      <div className="flex gap-2">
        <button className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200">
          <CheckCircle className="w-5 h-5" />
        </button>
        <button className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VerificationItem;