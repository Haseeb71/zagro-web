import React from 'react';
import usePromotionModal from '../hooks/usePromotionModal';

export default function TestPromotion() {
  const { showPromotionModal, closePromotionModal, resetPromotionModal } = usePromotionModal();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Promotion Modal Test
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">🎉 Promotion Modal Features</h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Shows automatically on home page (every reload)</li>
            <li>• Shows once on other pages (localStorage memory)</li>
            <li>• Cycles through active promotions every 5 seconds</li>
            <li>• Uses the same design as the discount modal</li>
            <li>• Fetches real promotion data from API</li>
            <li>• Smooth animations on open/close</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Test Promotion Modal</h3>
            <p className="text-gray-600 mb-4">
              Click to manually show the promotion modal for testing.
            </p>
            <button
              onClick={() => {
                // Force show modal for testing
                localStorage.removeItem('hasSeenPromotionModal');
                window.location.reload();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Show Promotion Modal
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Reset Modal State</h3>
            <p className="text-gray-600 mb-4">
              Reset the modal state so it shows again on next page load.
            </p>
            <button
              onClick={resetPromotionModal}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Reset Modal State
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Smart Display Logic:</h3>
              <p className="text-gray-600">
                <strong>Home Page:</strong> Shows every time you reload the page (no localStorage check)<br/>
                <strong>Other Pages:</strong> Shows only once, then remembers using localStorage
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">2. Promotion Cycling:</h3>
              <p className="text-gray-600">
                The modal cycles through all active promotions every 5 seconds, showing different offers
                automatically. Users can see dots at the bottom indicating which promotion is currently shown.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. API Integration:</h3>
              <p className="text-gray-600">
                Fetches real promotion data from your API and filters only active promotions.
                The modal displays the mainText and subText from each promotion.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. User Actions:</h3>
              <p className="text-gray-600">
                Users can click "SHOP NOW" to proceed to shopping or "MAYBE LATER" to close the modal.
                The modal won't show again until the localStorage is cleared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
