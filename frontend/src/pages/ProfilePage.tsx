// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, Lock } from "lucide-react";
import { useUser } from '../contexts/UserContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  created_at: string;
}

export default function ProfilePage() {
  const { userData, refreshUserData } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  useEffect(() => {
    if (userData) {
      const userProfileData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        username: userData.username,
        created_at: userData.created_at
      };
      setProfile(userProfileData);
      setEditedProfile(userProfileData);
      setIsLoading(false);
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!editedProfile) return;
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: editedProfile.email,
          username: editedProfile.username,
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }
  
      setProfile(data);
      setEditedProfile(data);
      await refreshUserData();
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };
  
  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
  
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password');
      }
  
      setIsPasswordDialogOpen(false);
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordError(null);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="p-8 w-full mt-8">
                  <Card className={`
                    w-full shadow-lg hover:shadow-xl transition-shadow
                    ${baseCardClass}
                    ${isVisible ? visibleCardClass : hiddenCardClass}
                  `}>
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center text-red-500 mb-6 -mt-2">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            {!isEditing ? (
              <Button 
                variant="outline"
                className="text-base" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedProfile(profile);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base text-gray-500 mb-2">First Name</label>
                  <Input
                    value={editedProfile?.first_name || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev,
                      first_name: e.target.value
                    } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Last Name</label>
                  <Input
                    value={editedProfile?.last_name || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev,
                      last_name: e.target.value
                    } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Email</label>
                  <Input
                    value={editedProfile?.email || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev,
                      email: e.target.value
                    } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-500 mb-2">Username</label>
                  <Input
                    value={editedProfile?.username || ''}
                    onChange={(e) => setEditedProfile(prev => prev ? {
                      ...prev,
                      username: e.target.value
                    } : null)}
                    disabled={!isEditing}
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
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric', 
                      year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-xl font-medium mb-4">Security</h3>
              <Button
                variant="outline"
                className="text-base"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Change Password</DialogTitle>
            <DialogDescription className="text-base">
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>

          {passwordError && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{passwordError}</span>
            </div>
          )}

<div className="space-y-4">
  <div>
    <label className="block text-base text-gray-500 mb-2">Current Password</label>
    <div className="relative">
      <Input
        type={passwordVisibility.current ? "text" : "password"}
        value={passwords.current}
        onChange={(e) => setPasswords(prev => ({
          ...prev,
          current: e.target.value
        }))}
        className="w-full pr-10"
      />
      <span
        onClick={() => togglePasswordVisibility('current')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
        aria-label={passwordVisibility.current ? "Hide password" : "Show password"}
      >
        {passwordVisibility.current ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </span>
    </div>
  </div>
  <div>
    <label className="block text-base text-gray-500 mb-2">New Password</label>
    <div className="relative">
      <Input
        type={passwordVisibility.new ? "text" : "password"}
        value={passwords.new}
        onChange={(e) => setPasswords(prev => ({
          ...prev,
          new: e.target.value
        }))}
        className="w-full pr-10"
      />
      <span
        onClick={() => togglePasswordVisibility('new')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
        aria-label={passwordVisibility.new ? "Hide password" : "Show password"}
      >
        {passwordVisibility.new ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </span>
    </div>
  </div>
  <div>
    <label className="block text-base text-gray-500 mb-2">Confirm New Password</label>
    <div className="relative">
      <Input
        type={passwordVisibility.confirm ? "text" : "password"}
        value={passwords.confirm}
        onChange={(e) => setPasswords(prev => ({
          ...prev,
          confirm: e.target.value
        }))}
        className="w-full pr-10"
      />
      <span
        onClick={() => togglePasswordVisibility('confirm')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
        aria-label={passwordVisibility.confirm ? "Hide password" : "Show password"}
      >
        {passwordVisibility.confirm ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </span>
    </div>
  </div>
</div>

          <DialogFooter>
            <Button 
              variant="outline"
              className="text-base" 
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPasswords({ current: '', new: '', confirm: '' });
                setPasswordError(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="text-base"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}