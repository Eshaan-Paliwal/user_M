import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";
import { ServerStatus } from "./ServerStatus";
import { SystemTest } from "./SystemTest";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login({ email, password });
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", response.token!);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      
      toast.success("Login successful!");
      if (response.user.role === 'admin') {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message.includes("Unable to connect to server")) {
        toast.error("Backend is still starting up. Please wait 30 seconds and try again.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ServerStatus />
      <SystemTest />
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Default Admin Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Default Admin Account</p>
                <p className="text-blue-700 text-xs">
                  Email: <code className="bg-blue-100 px-1 py-0.5 rounded">admin@example.com</code>
                </p>
                <p className="text-blue-700 text-xs">
                  Password: <code className="bg-blue-100 px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}