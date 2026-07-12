// src/app/(agent)/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, Clock, AlertCircle, Package, Phone, MapPin, Calendar } from "lucide-react";

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  sender_phone: string;
  transaction_id: string;
  status: string;
  submitted_at: string;
}

interface OrderItem {
  id: number;
  cake: number | null;
  cake_name: string;
  quantity: number;
  unit_price: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: string;
  total_amount: string;
  delivery_address: string;
  delivery_date: string;
  delivery_time_slot: string;
  payments: Payment[];
  items: OrderItem[];
}

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/orders/agent/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders. Are you logged in as an Agent?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: number) => {
    if (!confirm("Have you confirmed the MoMo SMS alert on your phone? Click OK to verify.")) return;

    setVerifyingId(paymentId);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://localhost:8000/api/orders/payments/${paymentId}/verify/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Payment verified! Order status updated to Confirmed.");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Verification failed.");
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awaiting_payment": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "in_production": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-2">Review orders and verify customer payments.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Package size={14} /> {order.customer_name}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {order.customer_phone}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{parseInt(order.total_amount).toLocaleString()} UGX</p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left: Items & Delivery */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Package size={16} /> Items Ordered
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                          <span className="font-medium text-gray-900">{item.cake_name || "Custom Cake"}</span>
                          <span className="text-gray-500 text-sm ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{parseInt(item.unit_price).toLocaleString()} UGX</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-800 uppercase mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Delivery Details
                  </h3>
                  <p className="text-sm text-gray-800 mb-2">{order.delivery_address}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {order.delivery_date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {order.delivery_time_slot}</span>
                  </div>
                </div>
              </div>

              {/* Right: Payment Verification */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                  <AlertCircle size={16} /> Payment Proof
                </h3>
                
                {order.payments.length > 0 ? order.payments.map((payment) => (
                  <div key={payment.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Method</p>
                        <p className="font-semibold text-gray-900 uppercase">{payment.payment_method.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sender Phone</p>
                        <p className="font-semibold text-gray-900">{payment.sender_phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Transaction ID</p>
                        <p className="font-mono font-bold text-gray-900 bg-white px-3 py-2 rounded border border-gray-200 text-lg">{payment.transaction_id}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Amount</p>
                        <p className="font-bold text-gray-900 text-lg">{parseInt(payment.amount).toLocaleString()} UGX</p>
                      </div>
                    </div>
                    
                    {payment.status === 'pending' ? (
                      <button
                        onClick={() => handleVerifyPayment(payment.id)}
                        disabled={verifyingId === payment.id}
                        className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        {verifyingId === payment.id ? (
                          <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Verifying...</>
                        ) : (
                          <><CheckCircle size={18} /> Verify Payment</>
                        )}
                      </button>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-100 border border-green-200 p-3 rounded-lg text-sm font-semibold">
                        <CheckCircle size={18} /> Verified on {new Date(payment.submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 italic">No payment submitted yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No orders yet</h3>
            <p className="text-gray-400">New orders will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}