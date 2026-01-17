// src/components/common/StatCard.jsx
import { COLOR_CLASSES } from '../../data/constants';

const StatCard = ({ title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-gray-600 text-sm mb-2">{title}</h4>
      <p className={`text-3xl font-bold ${COLOR_CLASSES[color]}`}>{value}</p>
    </div>
  );
};

export default StatCard;