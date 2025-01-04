import React from 'react';

interface ProfileProps {
  firstName: string;
  lastName: string;
  username: string;
  profileImageUrl?: string;
}

export default function Profile({ firstName, lastName, username, profileImageUrl }: ProfileProps) {
  return (
    <div className="absolute top-6 right-6">
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700">{firstName} {lastName}</span>
          <span className="text-xs text-gray-500">@{username}</span>
        </div>
        <img
          src={profileImageUrl || "/default-profile.png"}
          alt="Profile"
          className="h-10 w-10 rounded-full border border-gray-300"
        />
      </div>
    </div>
  );
}
