// src/app/owner/admins/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, ShieldAlert, Loader2, UserPlus } from "lucide-react";

interface PendingUser {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  role: string;
  date_joined: string;
}

export default function DeveloperAdminDashboard() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Access Denied. Developer login required.");
      router.push("/login");
      return;
    }
    fetchPendingUsers(token);
  }, []);

  const fetchPendingUsers = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:8000/api/users/pending-admins/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, name: string) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(`http://localhost:8000/api/users/admins/${id}/approve/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`✅ ${name} is now an active Admin!`);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Failed to approve user.");
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to reject and delete ${name}?`)) return;
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`http://localhost:8000/api/users/admins/${id}/reject/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`🚫 ${name} has been rejected.`);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Failed to reject user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={32} />
              Developer Control Center
            </h1>
            <p className="text-gray-400 mt-2">Approve or reject new Administrator and Agent requests.</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500" size={40} /></div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <UserPlus size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300">All Clear!</h3>
            <p className="text-gray-500">No pending admin requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-pink-500 transition">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>📞 {user.phone_number}</p>
                    <p>✉️ {user.email}</p>
                    <p>📅 Requested: {new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleReject(user.id, user.full_name)}
                    className="flex-1 md:flex-none bg-red-900/30 text-red-400 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-900/50 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(user.id, user.full_name)}
                    className="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}