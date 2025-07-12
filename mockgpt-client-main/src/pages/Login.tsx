import { LoadingSpinner } from "@/components/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"
import AuthLayout from "@/layout/AuthLayout"
import { useState } from "react"
import { Link } from "react-router-dom"

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { handleLogin, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        let success = await handleLogin(email, password)

        if (success) {
            setEmail("")
            setPassword("")
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Log in</h2>
                <p className="text-gray-500">
                    New to interview gpt?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign up for an account
                    </Link>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    {loading ? <LoadingSpinner /> : "Sign in →"}
                </Button>
            </form>


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
        </div>
    )
}

export default AuthLayout()(LoginPage)