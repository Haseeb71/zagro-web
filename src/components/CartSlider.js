import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateQuantity, removeFromCart, closeCart, clearAutoCloseTimer } from '@/redux/slices/cartSlice';
import { mediaUrl, productImageUrl } from '@/utils/mediaUrl';

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const CartSlider = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoCloseTimeoutRef = useRef(null);

  const { items: cartItems, totalItems, totalPrice, autoCloseTimer } = useAppSelector((state) => state.cart);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 40);
    } else {
      setIsVisible(false);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (autoCloseTimer && isOpen) {
      const timeRemaining = autoCloseTimer - Date.now();
      if (timeRemaining > 0) {
        if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = setTimeout(() => {
          dispatch(closeCart());
          dispatch(clearAutoCloseTimer());
        }, timeRemaining);
      }
    }
    return () => {
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
    };
  }, [autoCloseTimer, isOpen, dispatch]);

  const handleUserInteraction = () => {
    if (autoCloseTimer) {
      dispatch(clearAutoCloseTimer());
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
    }
  };

  const handleCheckout = () => {
    setIsAnimating(true);
    setTimeout(() => {
      dispatch(closeCart());
      router.push('/checkout');
    }, 280);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  useEffect(() => {
    if (!isOpen) setIsAnimating(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 z-[9998] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-md z-[9999] transform transition-all duration-300 ease-out flex flex-col shop-glass-bg border-l border-white/50 shadow-2xl ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        onMouseEnter={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <div className="glass-panel m-3 mb-0 rounded-2xl px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a7350]">Bag</p>
            <h2 className="font-display text-2xl text-[#141210]">Shopping Cart</h2>
            <p className="text-sm text-[#6b6560] mt-0.5">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/70 border border-white/80 flex items-center justify-center hover:bg-white transition"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden min-h-0 px-3 py-3">
          {cartItems.length === 0 ? (
            <div className="h-full glass-panel rounded-2xl flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/70 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#8a7350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-[#141210]">Your cart is empty</h3>
                <p className="text-sm text-[#6b6560] mt-1">Add a watch to get started</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 rounded-full bg-[#141210] text-white px-5 py-2.5 text-sm"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-3 pr-1">
              {cartItems.map((item) => {
                const img = productImageUrl(item.product) || mediaUrl(item.product?.image);
                return (
                  <div key={item.id} className="glass-card p-3.5 flex gap-3">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white/60 shrink-0 border border-white/70">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-[#6b6560]">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-[#141210] line-clamp-2">{item.product.name}</h3>
                      {(item.size || item.color) && (
                        <p className="text-[11px] text-[#6b6560] mt-0.5">
                          {[item.size && item.size !== 'One Size' ? `Size: ${item.size}` : null, item.color && item.color !== 'Default' ? `Color: ${item.color}` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="text-sm text-[#9a7a4f] mt-1 font-medium">{formatRs(item.product.price)}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleUserInteraction();
                              dispatch(updateQuantity({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) }));
                            }}
                            className="h-7 w-7 rounded-full bg-white/80 border border-black/5 text-[#141210]"
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleUserInteraction();
                              dispatch(updateQuantity({ itemId: item.id, quantity: item.quantity + 1 }));
                            }}
                            className="h-7 w-7 rounded-full bg-white/80 border border-black/5 text-[#141210]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleUserInteraction();
                            dispatch(removeFromCart(item.id));
                          }}
                          className="text-[#6b6560] hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="glass-panel m-3 mt-0 rounded-2xl p-5 shrink-0">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-[#6b6560]">
                <span>Subtotal</span>
                <span className="text-[#141210] font-medium">{formatRs(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[#6b6560]">
                <span>Shipping</span>
                <span className={totalPrice >= 15000 ? 'text-emerald-700 font-medium' : 'text-[#141210] font-medium'}>
                  {totalPrice >= 15000 ? 'Free' : formatRs(250)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/5">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-xl text-[#9a7a4f]">
                  {formatRs(totalPrice + (totalPrice >= 15000 ? 0 : 250))}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleUserInteraction();
                handleCheckout();
              }}
              disabled={isAnimating}
              className="w-full rounded-full bg-[#141210] text-white py-3.5 text-sm font-medium hover:bg-[#2a2620] disabled:opacity-50 transition"
            >
              {isAnimating ? 'Opening checkout…' : 'Proceed to Checkout'}
            </button>
            <button
              type="button"
              onClick={() => {
                handleUserInteraction();
                onClose();
              }}
              className="w-full mt-3 text-sm text-[#6b6560] hover:text-[#9a7a4f]"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSlider;
