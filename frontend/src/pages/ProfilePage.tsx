import { Lock, Settings2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { PageLayout } from "@/components/page-layout";
import { TextField } from "@/components/text-field";
import { Text5 } from "@/components/text-5";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import { UserProfileHeader } from "@/components/user-profile-header";
import { useUser } from "@/contexts/UserContext";
import { ErrorTile } from "@/components/error-tile";
import { CustomSkeleton } from "@/components/custom-skeleton";

export default function ProfilePage() {
  // Loading state first
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Other state
  const { userData, refreshUserData } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update form fields when userData changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.first_name);
      setLastName(userData.last_name);
      setEmail(userData.email);
      setUsername(userData.username);
      setPageLoading(false);
    }
  }, [userData]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    // Reset form fields
    if (userData) {
      setFirstName(userData.first_name);
      setLastName(userData.last_name);
      setEmail(userData.email);
      setUsername(userData.username);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          username,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        refreshUserData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setError("");
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsLoading(true);
      setError("");
  
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Clear authentication and redirect
          localStorage.removeItem('access_token');
          window.location.href = '/';
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete account');
        }
      } catch (error) {
        console.error('Account deletion error:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!userData) {
    return (
      <PageLayout title="Profile">
        <div>Please log in to view your profile.</div>
      </PageLayout>
    );
  }

  // Loading check first
  if (pageLoading) {
    return (
      <PageLayout title="Profile">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile">
            {/* Error Messages */}
            {error && (
              <ErrorTile description={error} className="mt-4" />
            )}

            {/* User Profile Header */}
            <div className="mb-8">
              <UserProfileHeader 
                firstName={userData.first_name}
                lastName={userData.last_name}
                username={userData.username}
                joinedDate={userData.created_at || ''}
              />
            </div>

            {/* Personal Information */}
            <div>
              <Title2>Personal Information</Title2>
              
              {/* Edit Profile Button */}
              <div className="flex sm:flex-row items-start sm:items-center justify-start sm:justify-between mb-4">
                {!isEditing ? (
                  <Button2 onClick={handleEditProfile}>
                    <Settings2 />
                    Edit Profile
                  </Button2>
                ) : (
                  <div className="flex gap-2">
                    <Button1 onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button1>
                    <Button2 onClick={handleCancelEdit} disabled={isLoading}>
                      Cancel
                    </Button2>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                />
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Security */}
            <div>
              <Title2>Security</Title2>
              <div className="space-y-4">
                {!isChangingPassword ? (
                  <Button2 onClick={handleChangePassword}>
                    <Lock />
                    Change Password
                  </Button2>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                      />
                      <TextField
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button1 onClick={handleSavePassword} disabled={isLoading}>
                        {isLoading ? 'Changing...' : 'Change Password'}
                      </Button1>
                      <Button2 onClick={handleCancelPasswordChange} disabled={isLoading}>
                        Cancel
                      </Button2>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div>
              <Title2>Account Details</Title2>
              <div>
                <Title3>Joined</Title3>
                <Text5>
                  {userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric', 
                    year: 'numeric'
                  }) : 'Unknown'}
                </Text5>
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
    </PageLayout>
  );
}