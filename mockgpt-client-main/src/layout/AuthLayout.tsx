import { Users } from "lucide-react";
import icon from "../assets/patternIcon.svg";
import { Link } from "react-router-dom";
const AuthLayout = () => (WrappedComponent: React.FC) => {
  return (props: any) => {
    return (
      <div className="flex min-h-screen">
        {/* Left side - Dark section */}
        <div className="hidden w-1/3 bg-[#0A0A0A] lg:flex flex-col p-8">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="bg-purple-600 p-1.5 rounded">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MockGPT</span>
          </Link>
          <div className="flex-1 flex items-center justify-center gap-2">
            <img src={icon} alt="icon" className="w-24 h-24" />
            <h1 className="text-4xl font-bold text-white max-w-sm">
              Automate hiring with AI in few minutes
            </h1>
          </div>
        </div>

        {/* Right side - Light section */}
        <div className="w-2/3 flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <WrappedComponent {...props} />
          </div>
        </div>
      </div>
    );
  };
};
export default AuthLayout;
