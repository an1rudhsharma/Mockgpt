import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/data/data";

function SignUpPage() {
  const [role, setRole] = useState<"recruiter" | "jobseeker" | "">("");
  const [signup, setSignup] = useState<boolean>(true);
  return (
    <>
      {!signup ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign up</h2>
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <RadioGroup
            value={role}
            onValueChange={(value: "recruiter" | "jobseeker" | "") =>
              setRole(value)
            }
            className="space-y-3"
          >
            {/* <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="recruiter" id="recruiter" />
                        <Label htmlFor="recruiter">I'm Recruiter</Label>
                    </div> */}
            <div className="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="jobseeker" id="jobseeker" />
              <Label htmlFor="jobseeker">I'm Job Seeker</Label>
            </div>
          </RadioGroup>

          <Button
            className="w-full bg-black text-white hover:bg-gray-800"
            onClick={() => setSignup(true)}
            disabled={!role}
          >
            Continue →
          </Button>
        </div>
      ) : (
        <SignupForm setSignup={setSignup} />
      )}
    </>
  );
}

export default AuthLayout()(SignUpPage);

function SignupForm({
  setSignup,
}: {
  setSignup: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [mobile, setMobile] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { handleRegister, loading, error } = useAuth();

  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !mobile
    ) {
      return "All fields are required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (mobile.length !== 10) {
      return "Invalid Mobile Number.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const success = await handleRegister({
      name: `${firstName} ${lastName}`,
      email: email!,
      password: password!,
      mobile: `${countryCode}${mobile!}`,
    });

    if (success) {
      setFormError(null);
      navigate("/login");
    } else {
      setFormError(error || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    setFormError(error);
  }, [error]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Sign up</h2>
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="firstName"
          placeholder="First Name"
          value={firstName || ""}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          name="lastName"
          placeholder="Last Name"
          value={lastName || ""}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <Input
        name="email"
        type="email"
        placeholder="Email Address"
        value={email || ""}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={(e) => setCountryCode(e)}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="code">{countryCode}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.code} ({country.country})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="mobile"
          type="tel"
          placeholder="Mobile Number"
          value={mobile || ""}
          onChange={(e) =>
            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
        />
      </div>

      <Input
        name="password"
        type="password"
        placeholder="Password"
        value={password || ""}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        name="confirmPassword"
        type="password"
        placeholder="Re Enter Password"
        value={confirmPassword || ""}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {formError && <p className="text-red-500">{formError}</p>}

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSignup(false)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-black text-white hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Continue →"}
        </Button>
      </div>

      {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
            </div> */}

      {/* <Button variant="outline" className="w-full">
                <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Continue with Google
            </Button> */}
    </form>
  );
}
