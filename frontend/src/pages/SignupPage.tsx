import { AuthLayout } from "@/components/auth-layout";
import { Tile } from "@/components/tile";
import { Title1 } from "@/components/title-1";

export default function SignupPage() {
  return (
    <AuthLayout>
      <Tile className="text-center">
        <Title1>Sign Up</Title1>
      </Tile>
    </AuthLayout>
  );
}