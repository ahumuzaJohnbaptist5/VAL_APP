// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export default function LoginPage() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:8000/api/users/login/", {
      phone_number: formData.phone_number,
      password: formData.password,
    });

    console.log("✅ Login response:", res.data); // Debug log
    
    // CRITICAL: Store the token correctly
    if (res.data.tokens && res.data.tokens.access) {
      localStorage.setItem("access_token", res.data.tokens.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("✅ Token saved to localStorage");
    } else {
      console.error("❌ No token in response:", res.data);
      toast.error("Login failed: No token received");
      return;
    }

    toast.success("Welcome back!");

    // Redirect based on role
    if (res.data.user.role === 'admin' || res.data.user.role === 'agent') {
      router.push("/owner/shop");
    } else {
      router.push("/customer");
    }
  } catch (error: any) {
    console.error("❌ Login error:", error.response?.data);
    const errorMsg = error.response?.data?.detail || "Invalid credentials";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Chocolate Background */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2889&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="mb-8">
            <img src="/logo.png" alt="Val Cakes" className="h-20 w-auto mx-auto mb-6" />
          </div>
          <h1 className="font-serif text-5xl font-bold mb-4 leading-tight">
            Welcome<br />
            <span className="text-pink-400">Back!</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8">
            Sign in to access your cart, track orders, and discover more delicious creations.
          </p>
          
          {/* Features */}
          <div className="space-y-4 text-left bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">Quick & easy checkout</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">Track your orders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm">Exclusive offers & discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to browsing
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <img src="/logo.png" alt="Val Cakes" className="h-16 w-auto" />
            </div>
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your details to access your account.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
                placeholder="+256 7XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900 bg-white pr-12 placeholder:text-gray-400"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-pink-600 focus:ring-pink-500" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-pink-600 font-semibold hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-stone-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login (Optional - placeholder) */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-stone-300 rounded-xl hover:bg-stone-100 transition text-gray-700 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-stone-300 rounded-xl hover:bg-stone-100 transition text-gray-700 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{" "}
            <button onClick={() => router.push("/register")} className="text-pink-600 font-bold hover:underline">
              Create one now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}