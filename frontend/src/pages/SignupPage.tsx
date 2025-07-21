import { AuthPageLayout } from "@/components/auth-page-layout";
import { Text1 } from "@/components/text-1";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Text1 className="!text-3xl">Sign Up</Text1>
          <Text5>Sign up for a MockTrade account</Text5>
        </div>
        
        <div className="space-y-4">
          <TextField label="Full Name" placeholder="Full Name" />
          <TextField label="Email" placeholder="Email" />
          <TextField label="Username" placeholder="Username" />
          <TextField label="Password" placeholder="Password" type="password" />
          <TextField label="Confirm Password" placeholder="Confirm Password" type="password" />
        </div>
        
        <Button1 className="w-full">Create Account</Button1>
        
        <div className="text-center">
          <Text4>
            Already have an account?{" "}
            <Link to="/login" className="!text-blue-600 hover:!text-blue-700">
              Sign in
            </Link>
          </Text4>
        </div>
      </div>
    </AuthPageLayout>
  );
}