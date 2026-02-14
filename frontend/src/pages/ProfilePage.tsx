import { PageLayout } from "@/components/PageLayout";
import { UserProfileHeader } from "@/components/UserProfileHeader";
import { useUser } from "@/contexts/UserContext";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { PopInOutEffect } from "@/components/PopInOutEffect";

// import the new presentational components
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { AccountDetails } from "@/components/profile/AccountDetails";
import { DeleteAccount } from "@/components/profile/DeleteAccount";

export default function ProfilePage() {
  // get user data from the global context
  const { userData } = useUser();

  // main page loading state (waiting for user context)
  if (!userData) {
    return (
      <PageLayout title="Profile">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  // --- derive data for components ---
  let firstName: string;
  if (userData.first_name) {
    firstName = userData.first_name;
  } else {
    firstName = "";
  }

  let lastName: string;
  if (userData.last_name) {
    lastName = userData.last_name;
  } else {
    lastName = "";
  }
  
  let username: string;
  if (userData.username) {
    username = userData.username;
  } else {
    username = "";
  }
  
  let joinedDate: string;
  if (userData.created_at) {
    joinedDate = userData.created_at;
  } else {
    joinedDate = "";
  }

  // --- render success state ---
  return (
    <PageLayout title="Profile">

        {/* section 1: header */}
        <PopInOutEffect isVisible={true} delay={50}>
          <div className="mb-8">
            <UserProfileHeader 
              firstName={firstName}
              lastName={lastName}
              username={username}
              joinedDate={joinedDate}
            />
          </div>
        </PopInOutEffect>

        {/* section 2: personal info form */}
        {/* this component now manages its own state and logic */}
        <ProfileForm />

        {/* section 3: security form — hidden for Google-only users */}
        {userData.auth_provider !== "google" && <PasswordForm />}

        {/* section 4: account details */}
        <AccountDetails joinedDate={joinedDate} />

        {/* section 5: delete account button */}
        {/* this component also manages its own state and logic */}
        <DeleteAccount />

    </PageLayout>
  );
}
