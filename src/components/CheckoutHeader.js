import Link from 'next/link';

export default function CheckoutHeader() {
  return (
    <>
      {/* Custom CSS for checkout header */}
      <style jsx>{`
        .checkout-header {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid #e2e8f0;
        }
        
        .logo-floating {
          animation: logoFloat 4s ease-in-out infinite;
        }
        
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        
        .checkout-header:hover .logo-floating {
          animation-play-state: paused;
          transform: scale(1.05);
        }
      `}</style>

      {/* Checkout Header - Fixed Header */}
      <header className="checkout-header fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-24">
            {/* Logo - Centered and Larger */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="logo-floating hover:scale-105 transition-all duration-300 ease-out"
              >
                <img 
                  src="/images/logo.png" 
                  alt="Zagro Footwear Logo" 
                  className="h-16 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-300" 
                />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
