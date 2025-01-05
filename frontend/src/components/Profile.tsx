import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  firstName: string;
  lastName: string;
  username: string;
  profileImageUrl?: string;
}

export default function Profile({ firstName, lastName, username, profileImageUrl }: ProfileProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('../pages/PortfolioPage.tsx');
  };

  return (
    <div 
      className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
      onClick={handleProfileClick}
    >
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          <span className="text-base font-medium text-gray-700">{firstName} {lastName}</span>
          <span className="text-sm text-gray-500">@{username}</span>
        </div>
        <img
          src={profileImageUrl || "/default-profile.png"}
          alt="Profile"
          className="h-12 w-12 rounded-full border border-gray-300"
        />
      </div>
    </div>
  );
}