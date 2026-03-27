import { useState, useEffect } from "react";
import { Database, Server, Check, X, Settings } from "lucide-react";
import { toast } from "sonner";

export function DatabaseConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDb, setCurrentDb] = useState<"supabase" | "mongodb" | "unknown">("unknown");
  const [mongoUrl, setMongoUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkDatabaseType();
  }, []);

  const checkDatabaseType = async () => {
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
        const data = await response.json();
        setCurrentDb(data.database || "supabase");
        setIsConfigured(true);
        
        // Show success toast if MongoDB is connected
        if (data.database === "mongodb") {
          toast.success("Connected to MongoDB successfully!", {
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error checking database:", error);
    }
  };

  const handleConfigureMongoDB = () => {
    if (!mongoUrl.trim()) {
      toast.error("Please enter a MongoDB URL");
      return;
    }

    // In a real implementation, this would need to be set as an environment variable
    // For now, we'll show instructions
    toast.info(
      "To use MongoDB, set the MONGODB_URL environment variable in your Supabase project settings",
      { duration: 6000 }
    );
    
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all"
        title="Database Configuration"
      >
        <Database className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          {currentDb === "mongodb" ? "MongoDB" : currentDb === "supabase" ? "Supabase" : "Database"}
        </span>
        {isConfigured && (
          <Check className="w-4 h-4 text-green-600" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl">Database Configuration</h2>
                    <p className="text-sm text-gray-600">
                      Current: <span className="font-medium">{currentDb === "mongodb" ? "MongoDB" : "Supabase KV"}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Database Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Active Database</h3>
                    <p className="text-sm text-gray-600">
                      {currentDb === "mongodb" 
                        ? "Your application is using MongoDB for data storage."
                        : "Your application is using Supabase Key-Value store for data storage."}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isConfigured 
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {isConfigured ? "Connected" : "Checking"}
                  </div>
                </div>
              </div>

              {/* MongoDB Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-700" />
                  <h3 className="font-medium text-gray-900">Switch to MongoDB</h3>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    To use MongoDB instead of Supabase, you need to set the <code className="bg-blue-100 px-2 py-0.5 rounded">MONGODB_URL</code> environment variable.
                  </p>
                  <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to Settings → Edge Functions</li>
                    <li>Add a new secret: <code className="bg-blue-100 px-2 py-0.5 rounded">MONGODB_URL</code></li>
                    <li>Set the value to your MongoDB connection string</li>
                    <li>Redeploy the edge function</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MongoDB Connection String (for reference)
                  </label>
                  <input
                    type="text"
                    value={mongoUrl}
                    onChange={(e) => setMongoUrl(e.target.value)}
                    placeholder="mongodb+srv://username:password@cluster.mongodb.net/dbname"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Example: mongodb+srv://user:pass@cluster.mongodb.net/mydb
                  </p>
                </div>
              </div>

              {/* Feature Comparison */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Database Comparison</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Supabase KV</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ No configuration needed</li>
                      <li>✓ Built-in to Supabase</li>
                      <li>✓ Simple key-value storage</li>
                      <li>✓ Great for prototyping</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">MongoDB</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Production-ready</li>
                      <li>✓ Advanced querying</li>
                      <li>✓ Scalable</li>
                      <li>✓ Industry standard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={checkDatabaseType}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh Status
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleConfigureMongoDB}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Instructions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}