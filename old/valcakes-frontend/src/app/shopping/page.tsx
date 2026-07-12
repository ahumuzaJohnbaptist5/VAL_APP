// src/app/shopping/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category_name: string;
  in_stock: boolean;
  stock_quantity: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ShoppingCenter() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemCount } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
  axios.get("http://localhost:8000/api/shopping/categories/"),
  axios.get("http://localhost:8000/api/shopping/items/"),
]);
        setCategories(catRes.data);
        setItems(itemRes.data as ShopItem[]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryClick = async (id: string | null) => {
    setActiveCategory(id);
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/shop/items/";
      if (id) {
        url += `?category=${id}`;
      }
      const res = await axios.get(url);
      setItems(res.data as ShopItem[]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };
    const handleAddToCart = (item: ShopItem) => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      toast("Please log in to add items to your cart", { icon: "" });
      router.push("/login");
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Val Investments" className="h-8 w-auto" />
            <span className="font-serif text-xl font-bold text-gray-900 hidden sm:block">VAL INVESTMENTS</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition">Home</Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition">About</Link>
            <Link href="/customer" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition">Cakes</Link>
            <Link href="/shopping" className="text-sm font-medium text-pink-600 border-b-2 border-pink-600 pb-1">Shopping Center</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2880')" }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Shopping<br />
            <span className="text-pink-400">Center</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Quality wholesale supplies for bakers, restaurants, and businesses. Everything you need, delivered with care.
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition shadow-lg text-base"
          >
            Browse Products
          </button>
        </div>
      </div>

      {/* Main Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-6 py-10">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? "bg-pink-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-stone-300 hover:border-pink-400"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id.toString())}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id.toString()
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-stone-300 hover:border-pink-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100"
              >
                <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Package size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                    {item.category_name}
                  </div>
                  {!item.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-1.5">{item.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-2xl font-bold text-pink-600">
                        {parseInt(item.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">UGX</span>
                    </div>
                    <button
                      disabled={!item.in_stock}
                      className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors shadow-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart size={16} className="inline mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No items found.</h3>
            <p className="text-gray-400 text-sm">Try another category or check back later!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="Val Investments" className="h-8 w-auto" />
            <span className="font-serif text-xl font-bold text-gray-900">VAL INVESTMENTS</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Your trusted wholesale partner.</p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>+256-763386097</span>
            <span>•</span>
            <span>valinvestiments@gmail.com</span>
          </div>
          <p className="text-xs text-gray-400 mt-6">© {new Date().getFullYear()} Val Investments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}