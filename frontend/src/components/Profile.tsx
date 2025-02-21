// src/components/Profile.tsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import mocktradeIcon from "../../../assets/mocktrade-icon-v1.png";

export default function Profile() {
  const navigate = useNavigate();
  const { userData } = useUser();

  const handleProfileClick = () => {
    navigate('/profile'); // Changed to use the route path instead of file path
  };

  if (!userData) return null;

  return (
    <div
      className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
      onClick={handleProfileClick}
    >
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          <span className="text-base font-medium text-gray-700">
            {userData.first_name} {userData.last_name}
          </span>
          <span className="text-sm text-gray-500">@{userData.username}</span>
        </div>
        <img
          src={mocktradeIcon}
          alt="Profile"
          className="h-12 w-12 rounded-full border border-gray-300"
        />
      </div>
    </div>
  );
}