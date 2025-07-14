import { Tile } from "@/components/tile";

export default function ProfilePage() {
  // Mock data
  const profile = {
    first_name: "Connor",
    last_name: "Morrison",
    email: "connor.morrison@example.com",
    username: "connormorrison",
    created_at: "2024-01-15T00:00:00Z"
  };

  return (
    <div className="w-full" style={{ marginTop: '32px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <h1 className="text-3xl font-normal mb-6">Profile</h1>
          
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Edit Profile
              </button>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base text-gray-500 mb-2">First Name</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    value={profile.first_name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Last Name</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    value={profile.last_name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Email</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    value={profile.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Username</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    value={profile.username}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <h3 className="text-xl font-medium mb-4">Account Details</h3>
              <div>
                <label className="block text-base text-gray-500 mb-2">Joined</label>
                <p className="text-base">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric', 
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-xl font-medium mb-4">Security</h3>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  );
}