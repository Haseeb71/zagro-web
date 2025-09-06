import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Zagro Footwear</h3>
            <p className="text-gray-600 mb-4">
              Premium shoes with cutting-edge technology for ultimate comfort and style.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.058.975.045 1.504.207 1.857.344.467.182.8.398 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.857.047 1.023.058 1.351.058 3.807v.468c0 2.456-.011 2.784-.058 3.807-.045.975-.207 1.504-.344 1.857-.182.466-.399.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058h-.08c-2.597 0-2.917-.01-3.96-.058-.976-.045-1.505-.207-1.858-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041v-.08c0-2.597.01-2.917.058-3.96.045-.976.207-1.505.344-1.858a3.097 3.097 0 00.748-1.15 3.098 3.098 0 001.15-.748c.353-.137.882-.3 1.857-.344 1.023-.047 1.351-.058 3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/categories/men" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Men's Shoes</Link></li>
              <li><Link href="/categories/women" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Women's Shoes</Link></li>
              <li><Link href="/categories/kids" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Kids' Shoes</Link></li>
              <li><Link href="/categories/new-arrivals" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">FAQ</Link></li>
              <li><Link href="/size-guide" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Size Guide</Link></li>
              <li><Link href="/shipping" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Returns & Exchanges</Link></li>
              <li><Link href="/warranty" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Warranty</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Careers</Link></li>
              <li><Link href="/sustainability" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Sustainability</Link></li>
              <li><Link href="/store-locator" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Store Locator</Link></li>
              <li><Link href="/affiliate" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Affiliate Program</Link></li>
              <li><Link href="/press" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Press</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Stay Updated</h3>
              <p className="text-gray-600">Get the latest news and exclusive offers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-gray-500 text-sm">© 2024 Zagro Footwear. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span className="text-gray-500 text-sm">Payment Methods:</span>
            <div className="flex space-x-2">
              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">V</span>
              </div>
              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">M</span>
              </div>
              <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">P</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 