import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Slider from "react-slick";
import AOS from 'aos';
import 'aos/dist/aos.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [bubbles, setBubbles] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef(null);

  // Banner slider settings
  const bannerSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    fade: true,
    cssEase: 'linear'
  };

  // Add banner images
  const bannerImages = [
    {
      id: 1,
      image: "/images/banners/banner1.jpg",
      title: "Step into the Future",
      subtitle: "Experience ultimate comfort with our revolutionary shoe technology",
      ctaText: "Shop Now"
    },
    {
      id: 2,
      image: "/images/banners/banner2.jpg",
      title: "Summer Collection",
      subtitle: "Lightweight shoes for your active lifestyle",
      ctaText: "Explore Collection"
    },
    {
      id: 3,
      image: "/images/banners/banner3.jpg",
      title: "Limited Edition Series",
      subtitle: "Exclusive designs available for a limited time only",
      ctaText: "View Limited Edition"
    }
  ];

  // Slider settings
  const featuredSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };

  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
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

  // Sample shoe product data
  const featuredProducts = [
    {
      id: 1,
      name: "AeroGlide X1",
      price: 189.99,
      image: "/images/shoes/hero-shoe-1.jpg", // Add your shoe images to public/images/shoes/
      badge: "New",
      colors: ["blue", "black", "white"]
    },
    {
      id: 2,
      name: "CloudStep Pro",
      price: 219.99,
      image: "/images/shoes/hero-shoe-2.jpg",
      badge: "Bestseller",
      colors: ["red", "gray", "black"]
    },
    {
      id: 3,
      name: "EnergyBoost Elite",
      price: 249.99,
      image: "/images/shoes/hero-shoe-3.jpg",
      badge: "Limited Edition",
      colors: ["purple", "black", "white"]
    }
  ];

  const newArrivals = [
    {
      id: 101,
      name: "FlexFit Runner",
      price: 159.99,
      image: "/images/shoes/running-1.jpg",
      category: "Running",
      rating: 4.8
    },
    {
      id: 102,
      name: "UltraLight Trainer",
      price: 139.99,
      image: "/images/shoes/training-1.jpg",
      category: "Training",
      rating: 4.7
    },
    {
      id: 103,
      name: "StreetStyle X3",
      price: 129.99,
      image: "/images/shoes/casual-1.jpg",
      category: "Casual",
      rating: 4.9
    },
    {
      id: 104,
      name: "AirWalk Comfort",
      price: 169.99,
      image: "/images/shoes/walking-1.jpg",
      category: "Walking",
      rating: 4.6
    },
    {
      id: 105,
      name: "ProTrail Hiker",
      price: 189.99,
      image: "/images/shoes/outdoor-1.jpg",
      category: "Outdoor",
      rating: 4.8
    }
  ];

  const bestSellers = [
    {
      id: 201,
      name: "SpeedMaster Pro",
      price: 199.99,
      image: "/images/shoes/running-2.jpg",
      category: "Running",
      rating: 4.9,
      sold: "2.5k+"
    },
    {
      id: 202,
      name: "DailyFlex Casual",
      price: 119.99,
      image: "/images/shoes/casual-2.jpg",
      category: "Casual",
      rating: 4.7,
      sold: "5k+"
    },
    {
      id: 203,
      name: "ProFit Trainer",
      price: 149.99,
      image: "/images/shoes/training-2.jpg",
      category: "Training",
      rating: 4.8,
      sold: "3k+"
    },
    {
      id: 204,
      name: "UrbanStyle X",
      price: 129.99,
      image: "/images/shoes/casual-3.jpg",
      category: "Casual",
      rating: 4.6,
      sold: "4k+"
    },
    {
      id: 205,
      name: "AeroSport Z1",
      price: 159.99,
      image: "/images/shoes/running-3.jpg",
      category: "Running",
      rating: 4.7,
      sold: "2k+"
    }
  ];

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

  // Re-initialize AOS on window resize
  useEffect(() => {
    const handleResize = () => {
      AOS.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Generate random bubbles only on the client side
    const newBubbles = Array.from({ length: 15 }).map(() => ({
      width: `${Math.random() * 120 + 40}px`,
      height: `${Math.random() * 120 + 40}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
      animationDelay: `${Math.random() * 5}s`
    }));

    setBubbles(newBubbles);
    setIsMounted(true);
  }, []);

  // Canvas animation with lighter colors
  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    };

    // Initialize particles with darker colors
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 2,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          // Darker blue and purple particles
          color: `rgba(${70 + Math.random() * 100}, ${80 + Math.random() * 90}, ${160 + Math.random() * 60}, ${0.5 + Math.random() * 0.5})`
        });
      }
    };

    // Update particles
    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle, index) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Add slight mouse influence
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.speedX += dx * force * 0.01;
          particle.speedY += dy * force * 0.01;
        }

        // Apply some friction
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Draw connections with darker color
      ctx.strokeStyle = 'rgba(100, 140, 220, 0.15)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    // Handle mouse movement
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY - canvas.getBoundingClientRect().top;
    };

    // Initialize and start animation
    setCanvasDimensions();
    updateParticles();
    window.addEventListener('resize', setCanvasDimensions);
    window.addEventListener('mousemove', handleMouseMove);

    // Clean up
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white`}>
      {/* Navigation - Light Theme */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600">
                Zagro Footwear
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Home</a>
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

      {/* Hero Banner Slider - replacing the 3D section */}
      <section className="relative h-[65vh] min-h-[450px] overflow-hidden">
        <Slider {...bannerSliderSettings} className="h-full">
          {bannerImages.map((banner) => (
            <div key={banner.id} className="relative h-[65vh] min-h-[450px]">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${banner.image})`,
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent"></div>
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                  <div className="max-w-2xl relative">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
                      {banner.title}
                    </h1>

                    <div className="relative z-10 mb-8">
                      <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed mt-2">
                        {banner.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button className="group px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 relative overflow-hidden">
                        <span className="relative z-10">{banner.ctaText}</span>
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </button>
                      <button className="px-8 py-3 bg-transparent border-2 backdrop-blur-sm bg-white/5 border-white/30 hover:border-white/70 text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105">
                        View Collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* Canvas background remains for additional effect */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0"
        />
      </section>

      {/* New Arrivals Slider */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <Slider {...productSliderSettings} className="product-slider">
              {newArrivals.map((product, index) => (
                <div key={product.id} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                  <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition group">
                    <div className="relative h-64 overflow-hidden">
                      {/* Replace with actual images */}
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Image: {product.image}</span>
                      </div>

                      <div className="absolute top-0 right-0 p-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="px-4 py-2 bg-white text-blue-900 font-semibold rounded-full shadow transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        <button className="p-2 text-blue-600 hover:text-blue-800 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Bestsellers Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
            <Link
              href="/bestsellers"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <Slider {...productSliderSettings} className="bestseller-slider">
              {bestSellers.map((product, index) => (
                <div key={product.id} className="px-2" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                    <div className="relative h-64 overflow-hidden">
                      {/* Replace with actual images */}
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Image: {product.image}</span>
                      </div>

                      <div className="absolute top-0 left-0 p-2">
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          Hot
                        </span>
                      </div>

                      <div className="absolute bottom-0 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-tl-lg text-xs font-medium text-gray-700">
                        {product.sold} sold
                      </div>

                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className="text-sm font-medium text-gray-600">{product.category}</span>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition flex items-center gap-1">
                          Add
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>


      {/* Featured Products Hero Slider */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <Slider {...featuredSliderSettings} className="featured-slider">
            {featuredProducts.map((product) => (
              <div key={product.id} className="relative">
                <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent z-10"></div>

                  {/* Replace with your Image component once you have images */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image: {product.image}</span>
                  </div>

                  <div className="absolute left-8 bottom-8 z-20 max-w-lg">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                      {product.badge}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                    <p className="text-xl text-white mb-4">${product.price}</p>
                    <div className="flex gap-2 mb-4">
                      {product.colors.map((color) => (
                        <div
                          key={color}
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                    <button className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-full shadow hover:bg-blue-50 transition">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>


      {/* Category Banners */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-aos="fade-up">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Running Collection", image: "/images/categories/running.jpg", color: "from-blue-400 to-blue-600" },
              { name: "Casual Wear", image: "/images/categories/casual.jpg", color: "from-purple-400 to-purple-600" },
              { name: "Athletic Performance", image: "/images/categories/athletic.jpg", color: "from-green-400 to-green-600" }
            ].map((category, index) => (
              <div
                key={index}
                className="relative h-80 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Replace with actual images */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image: {category.image}</span>
                </div>

                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition`}></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <button className="mt-4 px-6 py-2 bg-white text-gray-900 font-medium rounded-full shadow transform group-hover:scale-105 transition">
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Featured Product Section like the image */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-black relative overflow-hidden">
        {/* Diagonal geometric elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[80%] bg-gray-800 transform rotate-12 z-0"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[70%] bg-gray-800 transform -rotate-12 z-0"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div
              className="relative"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] h-[20px] bg-gradient-to-r from-yellow-400 to-yellow-200 filter blur-xl opacity-70 rounded-full"></div>

              <Image
                src="/images/shoes/featured-shoe.png"
                alt="EVAPOR8 2.0"
                width={600}
                height={400}
                className="relative z-10"
              />

              <div className="absolute bottom-0 left-0 right-0 text-center">
                <div className="inline-block bg-black/80 backdrop-blur-sm px-6 py-2 rounded-full">
                  <Image
                    src="/images/logo-evapor8.png"
                    alt="EVAPOR8 2.0"
                    width={200}
                    height={50}
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="text-white" data-aos="fade-left" data-aos-delay="300">
              <div className="mb-2">
                <span className="text-sm text-yellow-400 font-medium tracking-wider">REVOLUTIONARY TECHNOLOGY</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                EVAPOR8 2.0 – STAY COOL, <br />
                <span className="text-yellow-400">MOVE FAST</span>
              </h2>

              <div className="w-20 h-1 bg-yellow-400 mb-6 mt-4"></div>

              <p className="text-gray-300 mb-8 text-lg">
                Engineered for peak breathability and all-day comfort, Evapor8 2.0
                keeps you light on your feet with its ultra-breathable design and
                dynamic support.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span>Ultra-lightweight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span>Breathable mesh</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span>Dynamic support</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-2xl font-bold">$149.99</span>
                <span className="ml-2 text-gray-400 line-through">$189.99</span>
                <span className="ml-3 bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded">SAVE 20%</span>
              </div>

              <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black text-lg font-semibold rounded-full shadow-lg hover:shadow-yellow-400/30 transition transform hover:scale-105">
                SHOP NOW
              </button>

              <div className="mt-4 text-sm text-gray-400">
                *Now available in 3 colors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Light Theme */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-200/50 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-200/50 rounded-full blur-3xl"></div>
        </div>
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          data-aos="fade-up"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Join Our Community</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to get special offers, free giveaways, and new release notifications
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-full shadow-sm"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Light Theme */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Zagro Footwear</h3>
              <p className="text-gray-600 mb-4">
                Premium shoes with cutting-edge technology for ultimate comfort and style.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.058.975.045 1.504.207 1.857.344.467.182.8.398 1.15.748.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Men's Shoes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Women's Shoes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Kids' Shoes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">New Arrivals</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Bestsellers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Size Guide</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Shipping</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Returns</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Sustainability</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Store Locator</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Affiliate Program</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500">
            <p>© 2023 Zagro Footwear. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
