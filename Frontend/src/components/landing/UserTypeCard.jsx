// src/components/landing/UserTypeCard.jsx

const UserTypeCard = ({ icon, title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-indigo-500"
    >
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default UserTypeCard;