// src/components/Profile.tsx (example path)

import React from 'react';

export default function Profile() {
  return (
    <div className="absolute top-4 right-4">
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700">John Smith</span>
          <span className="text-xs text-gray-500">@johnsmith</span>
        </div>
        <img
          src="/api/placeholder/32/32"
          alt="Profile"
          className="h-10 w-10 rounded-full border border-gray-300"
        />
      </div>
    </div>
  );
}
