import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Mock product data (you would fetch this from an API in a real application)
const productData = {
  id: 101,
  name: "EVAPOR8 2.0 Ultra Performance",
  category: "Running",
  price: 179.99,
  oldPrice: 229.99,
  discount: "22%",
  rating: 4.8,
  reviews: 124,
  description: "Engineered for peak breathability and all-day comfort, the EVAPOR8 2.0 keeps you light on your feet with its ultra-breathable design and dynamic support.",
  features: [
    "Ultra-lightweight construction at only 8.5oz",
    "Breathable mesh upper for maximum ventilation",
    "Dynamic support system adapts to your stride",
    "Responsive cushioning for energy return",
    "Durable rubber outsole with strategic traction pattern"
  ],
  colors: [
    { name: "Solar Blue", hex: "#0062cc", images: ["/images/shoes/blue-1.jpg", "/images/shoes/blue-2.jpg", "/images/shoes/blue-3.jpg", "/images/shoes/blue-4.jpg"] },
    { name: "Volcanic Red", hex: "#dc3545", images: ["/images/shoes/red-1.jpg", "/images/shoes/red-2.jpg", "/images/shoes/red-3.jpg", "/images/shoes/red-4.jpg"] },
    { name: "Stealth Black", hex: "#212529", images: ["/images/shoes/black-1.jpg", "/images/shoes/black-2.jpg", "/images/shoes/black-3.jpg", "/images/shoes/black-4.jpg"] },
  ],
  sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
  inStock: true,
  specifications: [
    { name: "Weight", value: "8.5oz (Men's size 9)" },
    { name: "Drop", value: "8mm" },
    { name: "Upper", value: "Engineered mesh with TPU overlays" },
    { name: "Midsole", value: "Responsive foam with carbon plate" },
    { name: "Outsole", value: "Rubber with high-abrasion compounds" },
    { name: "Cushioning", value: "Responsive" },
    { name: "Best For", value: "Road running, racing, tempo runs" }
  ],
  relatedProducts: [
    { id: 102, name: "CloudStep Pro", price: 149.99, image: "/images/shoes/related-1.jpg", category: "Training" },
    { id: 103, name: "AeroGlide X1", price: 189.99, image: "/images/shoes/related-2.jpg", category: "Running" },
    { id: 104, name: "StreetStyle X3", price: 129.99, image: "/images/shoes/related-3.jpg", category: "Casual" },
    { id: 105, name: "UltraLight Trainer", price: 159.99, image: "/images/shoes/related-4.jpg", category: "Training" },
  ]
};

export default function Product() {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Image gallery settings
  const gallerySettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    customPaging: function(i) {
      return (
        <div className="mt-2">
          <div className="w-12 h-12 mx-1 rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">Image {i+1}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  // Related products slider settings
  const relatedProductsSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Handle image zoom effect
  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  // Initialize AOS animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 100,
      });
    }
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white`}>
      {/* Navigation - Light Theme */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Zagro Footwear
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Men</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Women</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Kids</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Collections</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-700 hover:text-blue-600 transition relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">2</span>
              </button>
              <button className="p-2 text-gray-700 hover:text-blue-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/" className="hover:text-blue-600 transition">Footwear</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/" className="hover:text-blue-600 transition">Running</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900">{productData.name}</span>
          </div>
        </div>
      </div>

      {/* Product Main Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <div data-aos="fade-right">
              <div 
                className={`overflow-hidden rounded-lg border border-gray-200 relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <Slider {...gallerySettings} className="product-gallery">
                  {productData.colors[selectedColor].images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <div 
                        className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${isZoomed ? 'scale-150' : 'scale-100'} transition-transform duration-300`}
                        style={isZoomed ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        } : {}}
                      >
                        <span className="text-gray-500">Image: {image}</span>
                      </div>
                    </div>
                  ))}
                </Slider>
                
                {/* 360 View Button */}
                <button className="absolute bottom-4 right-4 z-10 bg-white/80 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  360° View
                </button>
              </div>

              {/* Thumbnails (could be made functional in a real implementation) */}
              <div className="flex justify-center mt-4 gap-2">
                {productData.colors[selectedColor].images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400 transition`}
                  >
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div data-aos="fade-left">
              {/* Product badges */}
              <div className="flex gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  New Arrival
                </span>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  In Stock
                </span>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  {productData.discount} OFF
                </span>
              </div>

              {/* Product title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{productData.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">{productData.category}</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(productData.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">{productData.rating}</span>
                  <span className="mx-1 text-gray-600">•</span>
                  <button className="text-sm text-blue-600 hover:text-blue-800 transition">
                    {productData.reviews} Reviews
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">${productData.price}</span>
                  <span className="text-lg text-gray-500 line-through">${productData.oldPrice}</span>
                  <span className="text-sm text-green-600 font-medium">Save ${(productData.oldPrice - productData.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Includes taxes and free shipping on orders over $75</p>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Color: {productData.colors[selectedColor].name}</h3>
                </div>
                <div className="flex gap-3">
                  {productData.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedColor === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={() => setSelectedColor(index)}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === index && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {productData.sizes.map((size) => (
                    <button
                      key={size}
                      className={`py-2 border rounded-md text-sm font-medium transition
                        ${selectedSize === size 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-900 hover:border-gray-300'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Guide Modal */}
              {showSizeGuide && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
                  <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Size Guide</h3>
                      <button onClick={() => setShowSizeGuide(false)} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">US</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UK</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EU</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CM</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[
                            [7, 6, 40, 25],
                            [7.5, 6.5, 40.5, 25.5],
                            [8, 7, 41, 26],
                            [8.5, 7.5, 42, 26.5],
                            [9, 8, 42.5, 27],
                            [9.5, 8.5, 43, 27.5],
                            [10, 9, 44, 28],
                            [10.5, 9.5, 44.5, 28.5],
                            [11, 10, 45, 29],
                            [11.5, 10.5, 45.5, 29.5],
                            [12, 11, 46, 30],
                          ].map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2 text-sm text-gray-900">{row[0]}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row[1]}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row[2]}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Sizing may vary slightly depending on the model. If you're between sizes, we recommend sizing up.</p>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center w-32">
                  <button 
                    className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 w-12 border-t border-b border-gray-300 text-center text-gray-900"
                  />
                  <button 
                    className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button className="group relative flex-1 py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-full shadow-md hover:shadow-lg transition overflow-hidden">
                  <span className="relative z-10">Add to Cart</span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
                <button className="flex-1 py-3 px-8 bg-gray-900 hover:bg-black text-white text-base font-semibold rounded-full shadow-md hover:shadow-lg transition">
                  Buy Now
                </button>
                <button className="p-3 rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Shipping & Returns */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600">Free shipping on orders over $75</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600">Free returns within 30 days</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600">1-year manufacturer warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200" data-aos="fade-up">
            <div className="flex flex-wrap -mb-px">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-12" data-aos="fade-up">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div>
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
                  <p className="text-gray-700 mb-6">{productData.description}</p>
                  
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h4>
                  <ul className="list-disc pl-6 space-y-2 mb-6">
                    {productData.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Technology Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Ultra-Responsive Cushioning</h5>
                      <p className="text-sm text-gray-600">
                        Our patented foam technology delivers explosive energy return with every stride.
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Adaptive Fit System</h5>
                      <p className="text-sm text-gray-600">
                        Innovative upper design molds to your foot for custom comfort and support.
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Performance Traction</h5>
                      <p className="text-sm text-gray-600">
                        Strategically placed rubber compounds provide optimal grip in all conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {productData.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{spec.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Care Instructions</h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Clean with mild soap and water only
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Air dry away from direct heat or sunlight
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Do not machine wash or tumble dry
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Store in a cool, dry place
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                  <button className="mt-4 md:mt-0 inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Write a Review
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="md:w-1/3 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <span className="text-3xl font-bold text-gray-900 mr-2">{productData.rating}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.floor(productData.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{productData.reviews} verified reviews</p>
                    
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center">
                          <div className="w-12 text-sm text-gray-600">{star} stars</div>
                          <div className="w-full h-2 bg-gray-200 rounded-full mx-2">
                            <div className="h-2 bg-yellow-400 rounded-full" style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '5%' : star === 2 ? '3%' : '2%' }}></div>
                          </div>
                          <div className="w-10 text-right text-xs text-gray-600">
                            {star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '5%' : star === 2 ? '3%' : '2%'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    {/* Sample reviews */}
                    <div className="space-y-6">
                      {[
                        { name: "Alex Johnson", date: "2 months ago", rating: 5, comment: "Absolutely love these shoes! Super comfortable right out of the box and they've held up well for my daily runs. The responsive cushioning is really noticeable, especially on longer distances.", verified: true },
                        { name: "Sam Taylor", date: "1 month ago", rating: 4, comment: "Great shoes overall. The fit is true to size and the cushioning is excellent. Took off one star because the laces are a bit too short for my liking, but that's a minor issue.", verified: true },
                        { name: "Jordan Williams", date: "2 weeks ago", rating: 5, comment: "Best running shoes I've ever owned. Perfect amount of support without feeling bulky. Already ordered a second pair in another color!", verified: true }
                      ].map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 mr-2">{review.name}</span>
                                {review.verified && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Verified Purchase</span>
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                <div className="flex text-yellow-400 mr-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-2 text-gray-600">{review.comment}</p>
                          <div className="mt-3 flex items-center space-x-4">
                            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905 0 .905.714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              Helpful (12)
                            </button>
                            <button className="text-sm text-gray-500 hover:text-gray-700">
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full mt-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      Load More Reviews
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" data-aos="fade-up">You Might Also Like</h2>
          
          <div data-aos="fade-up">
            <Slider {...relatedProductsSettings} className="related-products-slider -mx-2">
              {productData.relatedProducts.map((product) => (
                <div key={product.id} className="px-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-105 duration-300">
                    <div className="relative aspect-square bg-gray-200">
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">Image: {product.image}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-blue-600">{product.category}</span>
                      <h3 className="mt-1 font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 font-semibold text-gray-900">${product.price}</p>
                      <button className="mt-3 w-full py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-md transition">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Our Community</h2>
            <p className="text-gray-600 mb-6">Subscribe to get special offers, free giveaways, and early access to new releases.</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-grow sm:rounded-r-none"
              />
              <button className="mt-3 sm:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md sm:rounded-l-none shadow-sm transition">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Zagro Footwear</h3>
              <p className="text-gray-400 mb-4">Creating innovative footwear for every athlete since 2007.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Men's Shoes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Women's Shoes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Kids' Shoes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">New Arrivals</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Sale</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Order Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Shipping & Delivery</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Returns & Exchanges</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Size Guide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Sustainability</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2023 Zagro Footwear. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}