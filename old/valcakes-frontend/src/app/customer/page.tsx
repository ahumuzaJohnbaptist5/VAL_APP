// src/app/customer/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingCart, CakeSlice } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import CartDrawer from "@/components/CartDrawer";

interface Category {
  id: number;
  name: string;
}

interface Cake {
  id: number;
  name: string;
  description: string;
  base_price: string;
  image: string;
  category_name: string;
}

export default function CustomerHome() {
  const { addItem, getItemCount } = useCartStore();
  const router = useRouter();
  
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, cakeRes] = await Promise.all([
          axios.get("http://localhost:8000/api/catalog/categories/"),
          axios.get("http://localhost:8000/api/catalog/cakes/"),
        ]);
        setCategories(catRes.data);
        setCakes(cakeRes.data as Cake[]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleCategoryClick = async (id: string | null) => {
    setActiveCategory(id);
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/catalog/cakes/";
      if (id) {
        url += `?category=${id}`;
      }
      const res = await axios.get(url);
      setCakes(res.data as Cake[]);
    } catch (error) {
      console.error("Error fetching cakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (cake: Cake) => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      const pendingItem = {
        id: cake.id,
        name: cake.name,
        price: parseFloat(cake.base_price),
        image: cake.image,
      };
      localStorage.setItem("valcakes_pending_item", JSON.stringify(pendingItem));
      
      toast("Please create an account to add items to your cart", { icon: "" });
      router.push("/register");
      return;
    }

    addItem({
      id: cake.id,
      name: cake.name,
      price: parseFloat(cake.base_price),
      image: cake.image,
    });
    toast.success(`${cake.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Elegant Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Val Cakes" className="h-8 w-auto" />
            <span className="font-serif text-xl font-bold text-gray-900 hidden sm:block">VAL CAKES</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition"
            >
              Log In
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-pink-50 rounded-full transition"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {mounted && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - FULL SCREEN HEIGHT */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2889&auto=format&fit=crop')" }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Freshly Baked<br />
            <span className="text-pink-400">Happiness.</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Custom cakes for your sweetest moments. Handcrafted with love, delivered with care.
          </p>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition shadow-lg text-base"
          >
            Explore Our Cakes
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
            All Cakes
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
            {cakes.map((cake) => (
              <div
                key={cake.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100"
              >
                {/* Product Image */}
                <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                  {cake.image ? (
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <CakeSlice size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                    {cake.category_name}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-1.5">{cake.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                    {cake.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-2xl font-bold text-pink-600">
                        {parseInt(cake.base_price).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">UGX</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(cake)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors shadow-sm text-xs font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cakes.length === 0 && (
          <div className="text-center py-16">
            <CakeSlice size={48} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No cakes found.</h3>
            <p className="text-gray-400 text-sm">Try another category or check back later!</p>
          </div>
        )}
      </div>

      {/* Elegant Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/logo.png" alt="Val Cakes" className="h-8 w-auto" />
            <span className="font-serif text-xl font-bold text-gray-900">VAL CAKES</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Baking happiness, one cake at a time.</p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>+256-763386097</span>
            <span>•</span>
            <span>valinvestiments@gmail.com</span>
          </div>
          <p className="text-xs text-gray-400 mt-6">© {new Date().getFullYear()} Val Investments. All rights reserved.</p>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}