// src/components/practice/ProgressTracker.jsx

const ProgressTracker = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold mb-4">This Week's Progress</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={day} className="text-center">
            <div className="text-xs text-gray-600 mb-1">{day}</div>
            <div className={`w-full h-16 rounded-lg flex items-center justify-center ${
              index < 5 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {index < 5 ? '✓' : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;