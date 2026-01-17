// src/components/student/JobCard.jsx

const JobCard = ({ company, role, match }) => {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold">{role}</h4>
          <p className="text-sm text-gray-600">{company}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
          {match} Match
        </span>
      </div>
    </div>
  );
};

export default JobCard;