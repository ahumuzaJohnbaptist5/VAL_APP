// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
      
      {/* BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2889&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* TOP NAVIGATION */}
        <header className="flex items-center justify-between px-8 py-6 md:px-16">
               {/* LOGO - Made much larger and more prominent */}
          <div className="flex items-center gap-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border-2 border-white/30">
              <img 
                src="/logo.png" 
                alt="Val Cakes Logo" 
                className="h-20 w-auto object-contain" 
              />
            </div>
            <span className="text-3xl font-extrabold tracking-wider hidden sm:block text-white drop-shadow-xl">VAL CAKES</span>
          </div>
          {/* NAV LINKS */}
          <div className="hidden md:flex gap-5 text-sm font-semibold text-gray-800">
            {/* Navigation Links - Bright and Visible */}
          <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wider">
            <Link href="/owner/shop" className="text-white hover:text-pink-400 transition-colors drop-shadow-md">Admin Portal</Link>
            <Link href="/" className="text-white hover:text-pink-400 transition-colors drop-shadow-md">Home</Link>
            <Link href="/about" className="text-pink-400 border-b-2 border-pink-400 pb-1 transition-colors drop-shadow-md">About Us</Link>
            <Link href="/customer" className="text-white hover:text-pink-400 transition-colors drop-shadow-md">Cakes</Link>
            <Link href="/shopping" className="text-white hover:text-pink-400 transition-colors drop-shadow-md">Shopping Center</Link>
            <Link href="/contact" className="text-white hover:text-pink-400 transition-colors drop-shadow-md">Contact</Link>
          </nav>
</div>
        </header>

        {/* HERO SECTION */}
        <main className="flex-1 flex items-center px-8 md:px-16">
          <div className="max-w-2xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-2xl shadow-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                Freshly Baked <br />
                <span className="text-green-400">Happiness.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">
                Custom cakes for your sweetest moments. Handcrafted with love, delivered with care.
              </p>
              
              <Link href="/customer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg">
                Order Now
              </Link>
            </div>
          </div>
        </main>

        {/* BOTTOM SECTION */}
        <footer className="px-8 md:px-16 py-8 flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-t from-black/80 to-transparent">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Quick Access</p>
            <div className="flex gap-4">
              <Link href="/customer" className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
                 Shop Cakes
              </Link>
              <Link href="/custom" className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
                🎨 Custom Design
              </Link>
              <Link href="/track" className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
                🚚 Track Order
              </Link>
              <Link href="/owner/shop" className="text-gray-400 hover:text-white text-sm">
              Admin Portal
              </Link>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Val Cakes. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}