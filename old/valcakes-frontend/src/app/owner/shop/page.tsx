// src/app/owner/shop/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // 👈 Make sure Toaster is imported
import { Plus, Edit2, Trash2, X, Package, Save, Loader2, Tag } from "lucide-react";

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: number;
  category_name: string;
  in_stock: boolean;
  stock_quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function OwnerShopDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    in_stock: true,
    stock_quantity: "0",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in as Admin/Owner");
      router.push("/login");
      return;
    }
    fetchData();
  }, []);

    const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      toast.error("Please log in as Admin/Owner");
      router.push("/login");
      return;
    }

    try {
      // 👇 1. CREATE THE HEADERS WITH YOUR TOKEN 👇
      const headers = { Authorization: `Bearer ${token}` }; 
      
      // 👇 2. PASS THE HEADERS TO BOTH GET REQUESTS 👇
      const [itemRes, catRes] = await Promise.all([
        axios.get("http://localhost:8000/api/shopping/items/", { headers }),
        axios.get("http://localhost:8000/api/shopping/categories/", { headers }),
      ]);
      
      setItems(itemRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to load data. Your session might have expired.");
    } finally {
      setLoading(false);
    }
  };
  const openItemModal = (item: ShopItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category.toString(),
        in_stock: item.in_stock,
        stock_quantity: item.stock_quantity.toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", description: "", price: "", category: "", in_stock: true, stock_quantity: "0" });
    }
    setIsItemModalOpen(true);
  };

  const openCategoryModal = () => {
    setCategoryFormData({ name: "", description: "" });
    setIsCategoryModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const payload = { ...formData, category: parseInt(formData.category) };
      
      if (editingItem) {
        await axios.put(`http://localhost:8000/api/shopping/items/${editingItem.id}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item updated successfully!");
      } else {
        await axios.post("http://localhost:8000/api/shopping/items/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("New item added to shop!");
      }
      
      setIsItemModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Item save error:", error.response?.data);
      toast.error(error.response?.data?.detail || "Failed to save item.");
    }
  };

  // 👇 UPDATED CATEGORY SAVE FUNCTION WITH DEBUGGING 👇
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    console.log("Attempting to save category:", categoryFormData); // Debug log

    try {
      const response = await axios.post("http://localhost:8000/api/shopping/categories/", categoryFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Category saved successfully:", response.data);
      toast.success("Category added successfully!");
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Category save error:", error.response?.data || error); // This will show the real error in F12
      toast.error(error.response?.data?.detail || "Failed to add category. Check console (F12).");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`http://localhost:8000/api/shopping/items/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item deleted.");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete item.");
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`http://localhost:8000/api/shopping/categories/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted.");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* 👇 ADD THE TOASTER HERE SO POPUPS APPEAR 👇 */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wholesale Shop Manager</h1>
            <p className="text-gray-600">Manage your inventory, prices, and stock.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={openCategoryModal} 
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 shadow-md"
            >
              <Tag size={20} /> Add Category
            </button>
            <button 
              onClick={() => openItemModal()} 
              className="bg-pink-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-pink-700 transition flex items-center gap-2 shadow-md"
            >
              <Plus size={20} /> Add New Item
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag size={20} className="text-purple-600" />
            Shop Categories ({categories.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">No categories yet. Click "Add Category" to create one.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg">
                  <span className="font-semibold text-purple-900">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-purple-400 hover:text-purple-700 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-pink-600" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600">Item Name</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Price (UGX)</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Stock</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.category_name}</td>
                      <td className="p-4 font-semibold text-gray-900">{parseInt(item.price).toLocaleString()}</td>
                      <td className="p-4 text-gray-600">{item.stock_quantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openItemModal(item)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={2} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-900" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX)</label>
                  <input required type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-900" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                  <input required type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-900" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white text-gray-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 flex items-center gap-2">
                  <Save size={18} /> Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Category</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900" 
                  value={categoryFormData.name} 
                  onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  placeholder="e.g., Baking Supplies"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  rows={2} 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900" 
                  value={categoryFormData.description} 
                  onChange={e => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2">
                  <Save size={18} /> Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}