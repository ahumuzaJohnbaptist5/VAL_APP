// src/app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white border-b-2 border-gray-300 px-6 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Val Cakes" className="h-8 w-auto" />
            <span className="font-bold text-lg text-gray-900 hidden sm:block">VAL CAKES</span>
          </div>
          
          <div className="hidden md:flex gap-5 text-sm font-semibold text-gray-800">
            <Link href="/" className="hover:text-green-600 transition">Home</Link>
            <Link href="/about" className="text-green-600 border-b-2 border-green-600">About Us</Link>
            <Link href="/customer" className="hover:text-green-600 transition">Shop</Link>
            <Link href="/login" className="hover:text-green-600 transition">My Account</Link>
            <Link href="/contact" className="hover:text-green-600 transition">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Reduced padding */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">ABOUT US</h1>
          <p className="text-gray-300">A little about us</p>
        </div>
      </div>

      {/* Main Content - Reduced spacing */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Val Investments</h2>
            <p className="text-gray-700 leading-relaxed">
              At Val Investments, every success story begins with a dream, determination, and the support of a community.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our founder, <strong className="text-gray-900">Ayebazibwe Vallence</strong>, started this journey while he was a 
              <strong className="text-green-600"> second-year student at Kabale University</strong> in Kabale District, Uganda.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden shadow-xl bg-gray-100">
              <img 
                src="/photo.png" 
                alt="Ayebazibwe Vallence - Founder" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Journey Section - More compact */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">The Journey</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
            <p>
              The business started by making and selling <strong className="text-gray-900">mandazi, pancakes, and chapattis</strong> to 
              fellow students and nearby shops around the university.
            </p>
            <p>
              Without professional baking equipment, Vallence baked cakes using ordinary cooking saucepans. The cakes often came out 
              with imperfect shapes, and he would carefully trim and reshape them by hand. Although challenging, customers loved the 
              taste and continued recommending them.
            </p>
            <p className="font-medium text-gray-900">
              Over the years, Val Investments has invested in modern baking equipment and now produces beautifully designed, 
              high-quality cakes for birthdays, weddings, graduations, and corporate events.
            </p>
          </div>
        </div>

        {/* What We Offer - Compact grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Custom celebration cakes",
              "Wedding & graduation cakes",
              "Birthday & anniversary cakes",
              "Cupcakes",
              "Fresh chapattis",
              "Cake design & decoration",
              "Event setup services",
              "Cake delivery",
              "Mobile Money payments"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision - Side by side, compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-sm leading-relaxed">
              To create memorable experiences through quality baking, exceptional service, and innovation while empowering our community.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Our Vision</h3>
            <p className="text-sm leading-relaxed">
              To become Ugandas most trusted baking brand, known for excellence, creativity, and customer satisfaction.
            </p>
          </div>
        </div>

        {/* Appreciation - Compact */}
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Thank You</h2>
          <p className="text-gray-700 text-sm leading-relaxed text-center max-w-3xl mx-auto">
            Val Investments wouldnt be here without the support of our customers, friends, and the Kabale community. 
            From selling mandazi around Kabale University to operating with professional equipment, this journey has been possible because of you.
          </p>
          <p className="text-center text-lg font-bold text-green-600 mt-4">
            Val Investments - Baking Happiness, Growing Together.
          </p>
        </div>

        {/* Contact Banner - Compact */}
        <div className="bg-gradient-to-r from-green-50 to-orange-50 border-2 border-gray-200 rounded-xl p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Get 10% off your first order!</h3>
              <p className="text-sm text-gray-600">Contact us today</p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-semibold text-gray-900">+256-763386097</p>
              <p className="text-sm text-gray-600">valinvestiments@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <footer className="bg-gray-50 border-t-2 border-gray-300 px-6 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">VAL INVESTMENTS</h4>
            <p className="text-gray-700 text-xs">Baking happiness in Uganda since 2020.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">QUICK LINKS</h4>
            <ul className="space-y-1 text-gray-700 text-xs">
              <li><Link href="/" className="hover:text-green-600">Home</Link></li>
              <li><Link href="/about" className="hover:text-green-600">About Us</Link></li>
              <li><Link href="/customer" className="hover:text-green-600">Shop</Link></li>
              <li><Link href="/contact" className="hover:text-green-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">CONTACT</h4>
            <p className="text-gray-700 text-xs">+256-763386097</p>
            <p className="text-gray-700 text-xs">+256-753715114</p>
            <p className="text-gray-700 text-xs">valinvestiments@gmail.com</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Val Investments. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}