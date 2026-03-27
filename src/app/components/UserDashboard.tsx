import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { LogOut, User as UserIcon, Layout, Calendar, Shield, Activity, ArrowRight, Settings, Bell, Star } from "lucide-react";
import { toast } from "sonner";

export function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/");
      return;
    }

    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const stats = [
    { label: "Account Status", value: "Verified", icon: Shield, color: "text-green-600", bg: "bg-green-100" },
    { label: "Member Since", value: currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : "...", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Activity Level", value: "High", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Reward Points", value: "1,250", icon: Star, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const recentActivity = [
    { id: 1, action: "Profile updated", time: "2 hours ago", icon: UserIcon },
    { id: 2, action: "Password changed", time: "3 days ago", icon: Shield },
    { id: 3, action: "Logged in from new device", time: "1 week ago", icon: Activity },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                My Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                      {currentUser?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser?.role || "Regular User"}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center group-hover:border-blue-200 transition">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-indigo-100">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">{greeting}, {currentUser?.name?.split(' ')[0] || "there"}! 👋</h2>
            <p className="text-indigo-100 max-w-lg mb-6">
              Welcome back to your personalized workspace. Here's a quick overview of your account and recent activities.
            </p>
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition shadow-lg"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
              </div>
              
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition group">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition shadow-sm group-hover:shadow">
                      <activity.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Settings */}
          <div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition group text-left">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="font-medium">Account Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition group text-left">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="font-medium">Security & Privacy</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition group text-left">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Need help?</p>
                <p className="text-xs text-indigo-700 mb-4">Check our documentation or contact support if you have any questions.</p>
                <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  Contact Support <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
