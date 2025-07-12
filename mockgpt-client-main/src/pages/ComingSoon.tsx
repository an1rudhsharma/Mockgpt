import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Launch date to 30 days from 22 Dec
    const launchDate = new Date(1734318031320 + 30 * 24 * 60 * 60 * 1000);

    console.log(Date.now());
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.8),rgba(10,10,10,0.8))]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h98v98H1V1z' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-purple-600 p-1.5 rounded">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">MockGPT</span>
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
          <div className="max-w-3xl space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#1C1C1C] rounded-full p-3">
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
              <span className="text-sm text-gray-300 pr-2">
                We're working on something amazing
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              The Future of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700">
                Technical Interviews
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              We're building a revolutionary platform that will transform how
              companies conduct technical interviews. Be the first to know when
              we launch.
            </p>

            {/* Countdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-lg p-4"
                >
                  <div
                    className={`text-3xl md:text-4xl font-bold ${
                      item.label == "Seconds" ? "text-purple-500" : "text-white"
                    }`}
                  >
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Email Signup */}
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto w-full space-y-4"
            >
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1C1C1C] border-[#2D2D2D] text-white"
                  required
                />
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Notify Me
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                We'll notify you when we launch. No spam, we promise!
              </p>
            </form>

            {/* Social Links */}
            {/* <div className="flex justify-center gap-6 pt-8">
              <Button variant="ghost" size="icon" asChild>
                <Link to="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
}
