import { SecondaryButton } from "@/components/secondary-button";
import { PrimaryButton } from "@/components/primary-button";
import { TextField } from "@/components/text-field";
import { SecondaryTitle } from "@/components/secondary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
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
              <SecondaryTitle>Personal Information</SecondaryTitle>
              
              {/* Edit Profile Button */}
              <div className="flex sm:flex-row items-start sm:items-center justify-start sm:justify-between mb-4">
                <SecondaryButton>
                  <Settings2 />
                  Edit Profile
                </SecondaryButton>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <TertiaryTitle>First Name</TertiaryTitle>
                  <TextField
                    value={profile.first_name}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle>Last Name</TertiaryTitle>
                  <TextField
                    value={profile.last_name}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle>Email</TertiaryTitle>
                  <TextField
                    value={profile.email}
                    disabled
                  />
                </div>
                <div>
                  <TertiaryTitle>Username</TertiaryTitle>
                  <TextField
                    value={profile.username}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <SecondaryTitle>Security</SecondaryTitle>
              <div className="space-y-4">
                <SecondaryButton>
                  <Lock />
                  Change Password
                </SecondaryButton>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <SecondaryTitle>Account Details</SecondaryTitle>
              <div>
                <TertiaryTitle>Joined</TertiaryTitle>
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
              <SecondaryTitle>Delete Account</SecondaryTitle>
              <PrimaryButton onClick={handleDeleteAccount} className="!bg-red-600 hover:!bg-red-700">
                <Trash2 />
                Delete Account
              </PrimaryButton>
            </div>
      </div>
    </PageLayout>
  );
}