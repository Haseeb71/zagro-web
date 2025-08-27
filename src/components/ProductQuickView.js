import { useState } from 'react';
import Image from 'next/image';

export default function ProductQuickView({ product }) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Sample product images (you can replace with real product images)
  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image
  ];

  // Sample sizes (you can make this dynamic based on product)
  const sizes = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];

  // Sample colors (you can make this dynamic based on product)
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Navy', value: '#1E3A8A' },
    { name: 'Gray', value: '#6B7280' }
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    // Add to cart logic here
    console.log('Added to cart:', { 
      product: product.name, 
      color: colors[selectedColor].name, 
      size: selectedSize, 
      quantity 
    });
    alert('Added to cart!');
  };

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Product Images */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {product.name} - View {selectedColor + 1}
                </span>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedColor === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedColor(index)}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 lg:p-8">
          <div className="space-y-6">
            {/* Product Badge */}
            {product.badge && (
              <div className="inline-block">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Product Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>
              {product.category && (
                <span className="text-gray-600 font-medium">{product.category}</span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 font-medium">({product.rating})</span>
                {product.sold && (
                  <span className="text-gray-500">• {product.sold} sold</span>
                )}
              </div>
            )}

            {/* Product Description */}
            <div>
              <p className="text-gray-600 leading-relaxed">
              {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex space-x-3">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === index
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(index)}
                    title={color.name}
                  >
                    {color.value === '#FFFFFF' && (
                      <div className="w-full h-full rounded-full border border-gray-200"></div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">{colors[selectedColor].name}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`py-3 px-4 border rounded-lg font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </button>
                <button className="py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-3">
                {[
                  { icon: '🚚', text: 'Free shipping on orders over $100' },
                  { icon: '↩️', text: '30-day return policy' },
                  { icon: '🛡️', text: '1-year warranty included' },
                  { icon: '💎', text: 'Premium materials and craftsmanship' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 