import { useState } from "react";
import { CheckCircle, XCircle, Loader, Play } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
  details?: any;
}

export function SystemTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1304f273`;

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Health Check
    try {
      const response = await fetch(`${BASE_URL}/health`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      testResults.push({
        name: "Health Check",
        status: response.ok ? "success" : "error",
        message: response.ok ? `Database: ${data.database}` : "Health check failed",
        details: data,
      });
    } catch (error) {
      testResults.push({
        name: "Health Check",
        status: "error",
        message: String(error),
      });
    }

    // Test 2: Bcrypt Test
    try {
      const response = await fetch(`${BASE_URL}/test-bcrypt`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      testResults.push({
        name: "Password Hashing (bcryptjs)",
        status: response.ok && data.password_match ? "success" : "error",
        message: response.ok ? "bcryptjs working correctly" : "bcryptjs failed",
        details: data,
      });
    } catch (error) {
      testResults.push({
        name: "Password Hashing (bcryptjs)",
        status: "error",
        message: String(error),
      });
    }

    // Test 3: Debug Endpoint
    try {
      const response = await fetch(`${BASE_URL}/debug`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      testResults.push({
        name: "Database Operations",
        status: response.ok ? "success" : "error",
        message: response.ok
          ? `${data.user_count} users in database`
          : "Database test failed",
        details: data,
      });
    } catch (error) {
      testResults.push({
        name: "Database Operations",
        status: "error",
        message: String(error),
      });
    }

    // Test 4: Registration
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: "Test User",
          email: testEmail,
          password: "test123456",
        }),
      });
      const data = await response.json();
      testResults.push({
        name: "User Registration",
        status: response.ok ? "success" : "error",
        message: response.ok
          ? "Registration successful"
          : data.message || "Registration failed",
        details: data,
      });
    } catch (error) {
      testResults.push({
        name: "User Registration",
        status: "error",
        message: String(error),
      });
    }

    // Test 5: Login with Default Admin
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin123",
        }),
      });
      const data = await response.json();
      testResults.push({
        name: "Admin Login",
        status: response.ok ? "success" : "error",
        message: response.ok
          ? `Logged in as ${data.user?.name}`
          : data.message || "Login failed",
        details: data,
      });
    } catch (error) {
      testResults.push({
        name: "Admin Login",
        status: "error",
        message: String(error),
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm z-50"
      >
        <Play className="w-4 h-4" />
        System Test
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[600px] flex flex-col z-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">System Tests</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                {result.status === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                {result.status === "error" && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                {result.status === "pending" && (
                  <Loader className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{result.name}</p>
                  {result.message && (
                    <p className="text-xs text-gray-600 mt-1">
                      {result.message}
                    </p>
                  )}
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            Click "Run All Tests" to start system diagnostics
          </p>
        )}
      </div>
    </div>
  );
}
