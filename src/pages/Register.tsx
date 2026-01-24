import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // referral code from URL
  const refCode = searchParams.get("ref");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-6 rounded-2xl shadow-card">
        <h1 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h1>

        {refCode && (
          <p className="text-sm text-center text-green-600 mb-4">
            Referred by: <strong>{refCode}</strong>
          </p>
        )}

        <div className="space-y-4">
          <Input placeholder="Full Name" />
          <Input placeholder="Mobile Number" />
          <Input type="password" placeholder="Password" />

          <Button className="w-full">
            Register
          </Button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
