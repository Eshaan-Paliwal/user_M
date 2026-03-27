import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { User, Mail, Shield, Calendar, ArrowLeft, Edit2, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  const [editData, setEditData] = useState({ ...userData });

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/");
    }

    // Load user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setEditData(user);
    }
  }, [navigate]);

  const handleSave = async () => {
    try {
      await api.updateUser(userData.id, {
        name: editData.name,
        email: editData.email,
      });
      
      setUserData(editData);
      localStorage.setItem("currentUser", JSON.stringify(editData));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          
          {/* Profile Content */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <div className="mb-2">
                  <h2 className="text-2xl text-white mb-1">{userData.name}</h2>
                  <p className="text-blue-100">{userData.email}</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditData(userData);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="grid gap-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg">{userData.name}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg">{userData.email}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm ${
                        userData.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {userData.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-lg">
                    {new Date(userData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Logins</p>
                  <p className="text-2xl text-blue-600">127</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Login</p>
                  <p className="text-2xl text-green-600">Today</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Users Managed</p>
                  <p className="text-2xl text-purple-600">42</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}