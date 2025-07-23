import { PublicLayout } from "@/components/public-layout";
import { AuthTile } from "@/components/auth-tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <PublicLayout showAuthButtons={false}>
      <AuthTile>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Text2>Login</Text2>
          <Text5>Log in to your MockTrade account</Text5>
        </div>
        
        <div className="space-y-4">
          <TextField label="Email" placeholder="Email" />
          <TextField label="Password" placeholder="Password" type="password" />
        </div>
        
        <Button1 className="w-full">Log In</Button1>
        
        <div className="text-center">
          <Text4>
            Don't have an account?{" "}
            <Link to="/signup" className="!text-blue-600 hover:!text-blue-700">
              Sign Up
            </Link>
          </Text4>
        </div>
      </div>
      </AuthTile>
    </PublicLayout>
  );
}