import { Button2 } from "@/components/button-2";
import { Button1 } from "@/components/button-1";
import { TextField } from "@/components/text-field";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import { PageLayout } from "@/components/page-layout";
import { Lock, Settings2, Trash2 } from "lucide-react";

export default function ProfilePage() {
  // Mock data
  const profile = {
    first_name: "Connor",
    last_name: "Morrison",
    email: "connor.morrison@example.com",
    username: "connormorrison",
    created_at: "2024-01-15T00:00:00Z"
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Account deletion requested");
    }
  };

  return (
    <PageLayout title="Profile">
      <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <Title2>Personal Information</Title2>
              
              {/* Edit Profile Button */}
              <div className="flex sm:flex-row items-start sm:items-center justify-start sm:justify-between mb-4">
                <Button2>
                  <Settings2 />
                  Edit Profile
                </Button2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Title3>First Name</Title3>
                  <TextField
                    value={profile.first_name}
                    disabled
                  />
                </div>
                <div>
                  <Title3>Last Name</Title3>
                  <TextField
                    value={profile.last_name}
                    disabled
                  />
                </div>
                <div>
                  <Title3>Email</Title3>
                  <TextField
                    value={profile.email}
                    disabled
                  />
                </div>
                <div>
                  <Title3>Username</Title3>
                  <TextField
                    value={profile.username}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <Title2>Security</Title2>
              <div className="space-y-4">
                <Button2>
                  <Lock />
                  Change Password
                </Button2>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <Title2>Account Details</Title2>
              <div>
                <Title3>Joined</Title3>
                <p className="text-lg">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric', 
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <Title2>Delete Account</Title2>
              <Button1 onClick={handleDeleteAccount} className="!bg-red-600 hover:!bg-red-700">
                <Trash2 />
                Delete Account
              </Button1>
            </div>
      </div>
    </PageLayout>
  );
}