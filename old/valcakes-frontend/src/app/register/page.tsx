// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: "",
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    role: "customer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending request to backend...");
      const response = await axios.post("http://localhost:8000/api/users/register/", {
        phone_number: formData.phone_number,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
      });

      console.log("Response:", response.data);
      toast.success("Account created successfully! Please log in.");
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.response) {
        // Backend returned an error
        const errorMsg = error.response.data?.detail || 
                        error.response.data?.phone_number?.[0] || 
                        error.response.data?.email?.[0] ||
                        "Registration failed. Please try again.";
        toast.error(errorMsg);
      } else if (error.request) {
        // No response from backend
        toast.error("Cannot connect to server. Make sure Django is running on port 8000.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md py-10">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft size={20} /> Back
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 mb-8">Enter your details to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Register as:</label>
              <select
                className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent (Requires Approval)</option>
                <option value="admin">Admin (Requires Approval)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Baptist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
                placeholder="077523720"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="jbrocodes@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800 pr-10"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 8 characters"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-white bg-gray-800"
                value={formData.confirm_password}
                onChange={e => setFormData({...formData, confirm_password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Creating Account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <button onClick={() => router.push("/login")} className="text-pink-500 font-semibold hover:underline">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}