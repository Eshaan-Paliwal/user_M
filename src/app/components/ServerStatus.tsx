import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ServerStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export function ServerStatus({ onStatusChange }: ServerStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const projectId = "xgiakaagltvidtvwzopr";
      const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaWFrYWFnbHR2aWR0dnd6b3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDg0MzgsImV4cCI6MjA4OTgyNDQzOH0.AUwQ5NUKugGfIJcntGp6FUIg6armiXYFjZGkpYOReZA";
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1304f273/health`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        setStatus("online");
        onStatusChange?.(true);
      } else {
        setStatus("offline");
        onStatusChange?.(false);
      }
    } catch (error) {
      setStatus("offline");
      onStatusChange?.(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 ${
        status === "online"
          ? "bg-green-50 border border-green-200"
          : status === "offline"
          ? "bg-yellow-50 border border-yellow-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {status === "online" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : status === "offline" ? (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium mb-1 ${
            status === "online"
              ? "text-green-800"
              : status === "offline"
              ? "text-yellow-800"
              : "text-blue-800"
          }`}>
            {status === "online"
              ? "Backend Online"
              : status === "offline"
              ? "Backend Starting"
              : "Checking Backend"}
          </h3>
          <p className={`text-xs ${
            status === "online"
              ? "text-green-700"
              : status === "offline"
              ? "text-yellow-700"
              : "text-blue-700"
          }`}>
            {status === "online"
              ? "All systems operational. You can register and login."
              : status === "offline"
              ? "The backend is starting up. This may take 30-60 seconds on first load. Please wait and try again."
              : "Checking server status..."}
          </p>
          {status === "offline" && (
            <button
              onClick={checkServerStatus}
              className="mt-2 text-xs font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Check again
            </button>
          )}
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
