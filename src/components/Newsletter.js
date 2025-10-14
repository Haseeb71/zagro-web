import React from 'react';

export default function Newsletter() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-200/50 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-200/50 rounded-full blur-3xl"></div>
      </div>

      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        data-aos="fade-up"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-gray-800">Join Our Community</h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
          Subscribe to get special offers, free giveaways, and new release notifications
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 text-black outline-none px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-full shadow-sm text-sm sm:text-base lg:text-lg"
          />
          <button className="relative px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base overflow-hidden">
            <span
              className="absolute inset-0 z-0 transition-all duration-700 ease-in-out"
              style={{
                background: 'linear-gradient(to left, #000 0%, #fff 100%)',
                width: '0%',
                left: '100%',
                top: 0,
                bottom: 0,
                transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
                borderRadius: '9999px',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
              id="liquid-gradient"
            />
            <span className="relative z-10 transition-colors duration-500">
              Subscribe
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        button {
          position: relative;
          overflow: hidden;
          background: linear-gradient(to right, #000 0%, #fff 100%);
          color: #fff;
        }
        button:hover #liquid-gradient {
          width: 100%;
          left: 0;
        }
      `}</style>
    </section>
  );
}
