// src/app/(customer)/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ShoppingCart, CakeSlice, Star } from "lucide-react";

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
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load (Runs only once when the page loads)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch both at the same time for speed!
        const [catRes, cakeRes] = await Promise.all([
          axios.get("http://localhost:8000/api/catalog/categories/"),
          axios.get("http://localhost:8000/api/catalog/cakes/")
        ]);
        setCategories(catRes.data);
        setCakes(cakeRes.data as Cake[]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // ✅ Empty array is perfectly valid here, no underline!

  // 2. Category Filter (Standalone function, no useEffect dependency issues)
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
      console.error("Error fetching category cakes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Freshly Baked Happiness</h1>
        <p className="text-pink-100 text-lg">Custom cakes for your sweetest moments.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              activeCategory === null
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            All Cakes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id.toString())}
              className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id.toString()
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Cakes Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <div
                key={cake.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={cake.image || "https://via.placeholder.com/400x300?text=Delicious+Cake"}
                    alt={cake.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    {cake.category_name}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{cake.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs text-gray-600 ml-1">4.9</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {cake.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-600">
                      {parseInt(cake.base_price).toLocaleString()} <span className="text-sm text-gray-500">UGX</span>
                    </span>
                    <button className="bg-gray-900 text-white p-3 rounded-full hover:bg-pink-600 transition-colors shadow-lg">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && cakes.length === 0 && (
          <div className="text-center py-20">
            <CakeSlice size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No cakes found in this category.</h3>
            <p className="text-gray-400">Try another category or request a custom cake!</p>
          </div>
        )}
      </div>
    </div>
  );
}