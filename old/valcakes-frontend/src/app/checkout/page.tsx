// src/app/checkout/page.tsx
"use client";

import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Check, ChevronRight, MapPin, Truck, CreditCard, Edit2, Loader2, Shield, Package } from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    delivery_address: "",
    landmark: "",
    delivery_date: "",
    delivery_time_slot: "Morning (9AM-12PM)",
    payment_method: "mtn_momo",
    sender_phone: "",
    transaction_id: "",
  });

  const deliveryFee = 10000;
  const totalAmount = getTotal() + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/customer");
    }
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || "",
        phone_number: userData.phone_number || "",
      }));
    }
  }, [items, router]);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      toast.error("Please log in to complete your order.");
      router.push("/login");
      return;
    }

    try {
      const payload = {
        items: items.map(i => ({ cake_id: i.id, quantity: i.quantity })),
        delivery_address: `${formData.delivery_address}, ${formData.landmark}`,
        delivery_date: formData.delivery_date,
        delivery_time_slot: formData.delivery_time_slot,
        customer_notes: "",
        payment_method: formData.payment_method,
        sender_phone: formData.sender_phone,
        transaction_id: formData.transaction_id,
        total_amount: totalAmount,
      };

      await axios.post("http://localhost:8000/api/orders/create/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearCart();
      toast.success("🎉 Order placed successfully! We'll verify your payment shortly.");
      router.push("/customer/orders");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to place order.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your order in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6">
            {[
              { num: 1, label: "Customer Address", icon: MapPin },
              { num: 2, label: "Delivery Details", icon: Truck },
              { num: 3, label: "Payment", icon: CreditCard },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  currentStep >= step.num 
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-110" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {currentStep > step.num ? <Check size={24} /> : <step.icon size={20} />}
                </div>
                <span className={`ml-3 text-sm font-semibold hidden sm:block transition-colors duration-300 ${
                  currentStep >= step.num ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                    currentStep > step.num ? "bg-gradient-to-r from-orange-500 to-pink-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    CUSTOMER ADDRESS
                  </h2>
                  {formData.full_name && (
                    <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline transition">
                      <Edit2 size={14} /> Change
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Ahumuza John Baptist"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400"
                      value={formData.phone_number}
                      onChange={e => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="+256 7XX XXX XXX"
                    />
                  </div>
                </div>

                <button onClick={nextStep} className="mt-8 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                  Continue to Delivery <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Step 2: Delivery Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    DELIVERY DETAILS
                  </h2>
                  <button onClick={prevStep} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline transition">
                    <Edit2 size={14} /> Change
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 resize-none text-gray-900 bg-white placeholder:text-gray-400"
                      value={formData.delivery_address}
                      onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                      placeholder="Street, Building, Area"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400"
                      value={formData.landmark}
                      onChange={e => setFormData({...formData, landmark: e.target.value})}
                      placeholder="Near supermarket, opposite church..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400"
                        value={formData.delivery_date}
                        onChange={e => setFormData({...formData, delivery_date: e.target.value})}
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot *</label>
                      <select
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 bg-white text-gray-900"
                        value={formData.delivery_time_slot}
                        onChange={e => setFormData({...formData, delivery_time_slot: e.target.value})}
                      >
                        <option>Morning (9AM-12PM)</option>
                        <option>Afternoon (12PM-4PM)</option>
                        <option>Evening (4PM-7PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={prevStep} className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                    Back
                  </button>
                  <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                    Continue to Payment <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    PAYMENT METHOD
                  </h2>
                  <button onClick={prevStep} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline transition">
                    <Edit2 size={14} /> Change
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-orange-50 border-2 border-orange-300 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="text-orange-600" size={20} />
                      <p className="text-sm font-semibold text-gray-800">Send <span className="text-2xl font-bold text-orange-600">{totalAmount.toLocaleString()} UGX</span> to:</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">MTN MoMo: 077X XXX XXX</p>
                    <p className="text-sm text-gray-600 mb-4">(ValCakes Business Account)</p>
                    <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <Package className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-yellow-800 font-medium">Wait for the SMS confirmation before entering your Transaction ID below.</p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 bg-white text-gray-900"
                      value={formData.payment_method}
                      onChange={e => setFormData({...formData, payment_method: e.target.value})}
                    >
                      <option value="mtn_momo">MTN Mobile Money</option>
                      <option value="airtel_money">Airtel Money</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your MoMo Number *</label>
                    <input
                      type="tel"
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400"
                      value={formData.sender_phone}
                      onChange={e => setFormData({...formData, sender_phone: e.target.value})}
                      placeholder="078X XXX XXX"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID / Reference *</label>
                    <input
                      type="text"
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-gray-900 bg-white placeholder:text-gray-400 font-mono"
                      value={formData.transaction_id}
                      onChange={e => setFormData({...formData, transaction_id: e.target.value})}
                      placeholder="MP12345678"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={prevStep} className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : "Confirm Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-gray-900 flex items-center gap-2">
                <Package className="text-orange-500" size={24} />
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length})</span>
                  <span className="font-semibold text-gray-900">UGX {getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery fees</span>
                  <span className="font-semibold text-gray-900">UGX {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">UGX {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Cart Items Preview */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items ({items.length})</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">
                        {(item.price * item.quantity).toLocaleString()} UGX
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Shield className="text-green-500" size={20} />
                  <span className="font-medium">Secure Checkout</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Your information is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}