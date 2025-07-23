import { PublicLayout } from "@/components/public-layout";
import { AuthTile } from "@/components/auth-tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <PublicLayout showAuthButtons={false}>
      <AuthTile>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Text2>Sign Up</Text2>
          <Text5>Sign up for a MockTrade account</Text5>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="First Name" placeholder="First Name" />
            <TextField label="Last Name" placeholder="Last Name" />
          </div>
          <TextField label="Email" placeholder="Email" />
          <TextField label="Username" placeholder="Username" />
          <TextField label="Password" placeholder="Password" type="password" />
          <TextField label="Confirm Password" placeholder="Confirm Password" type="password" />
        </div>
        
        <Button1 className="w-full">Sign Up</Button1>
        
        <div className="text-center">
          <Text4>
            Already have an account?{" "}
            <Link to="/login" className="!text-blue-600 hover:!text-blue-700">
              Login
            </Link>
          </Text4>
        </div>
      </div>
        </AuthTile>
    </PublicLayout>
  );
}