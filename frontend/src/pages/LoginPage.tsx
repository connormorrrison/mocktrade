import { AuthPageLayout } from "@/components/auth-page-layout";
import { Text1 } from "@/components/text-1";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Button1 } from "@/components/button-1";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Text1 className="!text-3xl">Login</Text1>
          <Text5>Login to your MockTrade account</Text5>
        </div>
        
        <div className="space-y-4">
          <TextField label="Email" placeholder="Email" />
          <TextField label="Password" placeholder="Password" type="password" />
        </div>
        
        <Button1 className="w-full">Sign In</Button1>
        
        <div className="text-center">
          <Text4>
            Don't have an account?{" "}
            <Link to="/signup" className="!text-blue-600 hover:!text-blue-700">
              Sign up
            </Link>
          </Text4>
        </div>
      </div>
    </AuthPageLayout>
  );
}