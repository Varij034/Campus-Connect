// src/components/company/PipelineStage.jsx

const PipelineStage = ({ title, count }) => {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm text-gray-600 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-indigo-600">{count}</p>
    </div>
  );
};

export default PipelineStage;