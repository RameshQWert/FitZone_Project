import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiMinus,
  HiPlus,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineTag,
} from 'react-icons/hi';
import { storeService } from '../../services';
import { useAuth } from '../../context';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await storeService.getCart();
      // API returns { success: true, data: cart }
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await storeService.updateCartItem(itemId, newQuantity);
      
      // Update local state
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
      
      // Recalculate totals
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setRemoving(itemId);
      await storeService.removeFromCart(itemId);
      toast.success('Item removed from cart');
      
      // Update local state
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item._id !== itemId),
      }));
      
      // Recalculate totals
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await storeService.clearCart();
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getShippingCost = () => {
    if (!cart?.totalAmount) return 0;
    return cart.totalAmount >= 999 ? 0 : 99;
  };

  const getTotalWithShipping = () => {
    return (cart?.totalAmount || 0) + getShippingCost();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items?.length;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HiOutlineShoppingCart className="w-8 h-8 text-orange-400" />
            Shopping Cart
            {!isEmpty && (
              <span className="text-lg font-normal text-gray-400">
                ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
          {!isEmpty && (
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingBag className="w-16 h-16 text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. 
              Browse our store and find something you like!
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 rounded-xl p-4 md:p-6 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/store/product/${item.product?.slug}`}
                      className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={
                          item.image || 
                          item.product?.thumbnail ||
                          (item.product?.images?.[0] 
                            ? (typeof item.product.images[0] === 'string' 
                                ? item.product.images[0] 
                                : item.product.images[0].url)
                            : 'https://via.placeholder.com/200x200?text=No+Image')
                        }
                        alt={item.product?.name || item.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/store/product/${item.product?.slug}`}
                        className="text-lg font-semibold text-gray-200 hover:text-orange-400 transition-colors line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>
                      
                      {item.variant && (
                        <p className="text-sm text-gray-400 mt-1">
                          Variant: <span className="text-gray-300">{item.variant}</span>
                        </p>
                      )}
                      
                      <p className="text-orange-400 font-bold text-xl mt-2">
                        ₹{item.price?.toLocaleString()}
                      </p>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item._id}
                            className="px-3 py-2 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <HiMinus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-white font-medium min-w-[50px] text-center">
                            {updating === item._id ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin mx-auto"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={updating === item._id}
                            className="px-3 py-2 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <HiPlus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item._id)}
                          disabled={removing === item._id}
                          className="text-gray-400 hover:text-red-400 p-2 transition-colors disabled:opacity-50"
                        >
                          {removing === item._id ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-red-400 rounded-full animate-spin"></div>
                          ) : (
                            <HiOutlineTrash className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-gray-400 text-sm">Item Total</p>
                      <p className="text-white font-bold text-lg">
                        ₹{(item.price * item.quantity)?.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link
                to="/store"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors mt-4"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span className="font-medium">₹{cart.totalAmount?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span className="flex items-center gap-2">
                      <HiOutlineTruck className="w-5 h-5" />
                      Shipping
                    </span>
                    <span className={`font-medium ${getShippingCost() === 0 ? 'text-green-400' : ''}`}>
                      {getShippingCost() === 0 ? 'FREE' : `₹${getShippingCost()}`}
                    </span>
                  </div>

                  {getShippingCost() > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-sm text-orange-400">
                        Add ₹{(999 - cart.totalAmount).toLocaleString()} more for FREE delivery!
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-white text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-400">₹{getTotalWithShipping()?.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Including all taxes</p>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <button className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  onClick={() => navigate('/store/checkout')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  Proceed to Checkout
                </motion.button>

                {/* Payment Methods */}
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm mb-3">We accept</p>
                  <div className="flex justify-center gap-4">
                    <div className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">UPI</div>
                    <div className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">Cards</div>
                    <div className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">Net Banking</div>
                    <div className="bg-gray-700 px-3 py-1 rounded text-xs text-gray-300">COD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
