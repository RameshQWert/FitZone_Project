import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineStar,
  HiStar,
  HiOutlineArrowLeft,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiMinus,
  HiPlus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { storeService } from '../../services';
import { useAuth } from '../../context';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await storeService.getProductBySlug(slug);
      // API returns { success: true, data: product } - data IS the product
      const productData = response.data;
      setProduct(productData);
      
      // Set default variant if exists
      if (productData?.variants?.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
      
      // Fetch related products
      const relatedResponse = await storeService.getProducts({ 
        category: productData.category,
        limit: 4 
      });
      // API returns { data: [...products] }
      const relatedData = relatedResponse.data || [];
      setRelatedProducts(
        relatedData.filter(p => p._id !== productData._id).slice(0, 4)
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await storeService.addToCart(product._id, quantity, {
        variant: selectedVariant?.name || null,
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    const maxStock = selectedVariant?.stock || product?.stock || 10;
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImage(prev => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant?.price) return selectedVariant.price;
    return product?.salePrice || product?.price;
  };

  const getOriginalPrice = () => {
    if (selectedVariant?.price && product?.price > selectedVariant.price) {
      return product.price;
    }
    return product?.salePrice ? product.price : null;
  };

  const getDiscount = () => {
    const original = getOriginalPrice();
    const current = getCurrentPrice();
    if (original && current < original) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  const isInStock = () => {
    if (selectedVariant) return selectedVariant.stock > 0;
    return product?.stock > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-800 rounded-2xl h-96 lg:h-[500px]"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-800 rounded w-3/4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                <div className="h-10 bg-gray-800 rounded w-1/3"></div>
                <div className="h-24 bg-gray-800 rounded"></div>
                <div className="h-12 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/store" className="text-gray-400 hover:text-orange-400 transition-colors">
            Store
          </Link>
          <span className="text-gray-600">/</span>
          <Link 
            to={`/store?category=${product.category}`} 
            className="text-gray-400 hover:text-orange-400 transition-colors capitalize"
          >
            {product.category}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={
                    product.images?.[selectedImage]
                      ? (typeof product.images[selectedImage] === 'string' 
                          ? product.images[selectedImage] 
                          : product.images[selectedImage].url)
                      : (product.thumbnail || 'https://via.placeholder.com/500x500?text=No+Image')
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {/* Image Navigation */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <HiOutlineChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {getDiscount() > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{getDiscount()}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image.url;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-orange-500 ring-2 ring-orange-500/50'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <span className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                {product.brand}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  i < Math.floor(product.ratings?.average || 0) ? (
                    <HiStar key={i} className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <HiOutlineStar key={i} className="w-5 h-5 text-gray-600" />
                  )
                ))}
              </div>
              <span className="text-gray-400">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-orange-400">
                ₹{getCurrentPrice()?.toLocaleString()}
              </span>
              {getOriginalPrice() && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{getOriginalPrice()?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isInStock() 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isInStock() ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isInStock() ? 'In Stock' : 'Out of Stock'}
              </div>
              
              {/* Low Stock Warning */}
              {(selectedVariant?.stock || product?.stock) > 0 && (selectedVariant?.stock || product?.stock) <= 5 && (
                <div className="flex items-center gap-2 text-orange-400 font-medium animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span>Hurry! Only {selectedVariant?.stock || product?.stock} left in stock!</span>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <label className="text-gray-300 font-medium">Select Variant:</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedVariant?.name === variant.name
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                          : variant.stock === 0
                            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                            : 'border-gray-700 text-gray-300 hover:border-orange-500/50'
                      }`}
                    >
                      {variant.name}
                      {variant.price && variant.price !== product.price && (
                        <span className="ml-2 text-sm text-gray-400">
                          ₹{variant.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-gray-300 font-medium">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiMinus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 text-white font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= (selectedVariant?.stock || product?.stock || 10)}
                    className="px-4 py-3 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiPlus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  {selectedVariant?.stock || product?.stock || 0} available
                </span>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={!isInStock() || addingToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-8 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-red-400 transition-colors"
              >
                <HiOutlineHeart className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
              <div className="text-center">
                <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <HiOutlineTruck className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-gray-300 text-sm font-medium">Free Delivery</p>
                <p className="text-gray-500 text-xs">Orders above ₹999</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <HiOutlineShieldCheck className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-gray-300 text-sm font-medium">Secure Payment</p>
                <p className="text-gray-500 text-xs">100% Protected</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <HiOutlineRefresh className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-gray-300 text-sm font-medium">Easy Returns</p>
                <p className="text-gray-500 text-xs">7 Days Policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Product Description</h2>
            <div className="prose prose-invert prose-orange max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-gray-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Summary */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Customer Reviews</h2>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-orange-400 mb-2">
                {product.ratings?.average?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  i < Math.floor(product.ratings?.average || 0) ? (
                    <HiStar key={i} className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <HiOutlineStar key={i} className="w-6 h-6 text-gray-600" />
                  )
                ))}
              </div>
              <p className="text-gray-400">Based on {product.ratings?.count || 0} reviews</p>
            </div>

            {/* Reviews List */}
            {product.reviews?.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {product.reviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-medium">{review.userName || 'Anonymous'}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          i < review.rating ? (
                            <HiStar key={i} className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <HiOutlineStar key={i} className="w-4 h-4 text-gray-600" />
                          )
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-400 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedImage = relatedProduct.thumbnail || 
                  (relatedProduct.images?.[0] 
                    ? (typeof relatedProduct.images[0] === 'string' 
                        ? relatedProduct.images[0] 
                        : relatedProduct.images[0].url)
                    : 'https://via.placeholder.com/300x300?text=No+Image');
                return (
                  <Link
                    key={relatedProduct._id}
                    to={`/store/product/${relatedProduct.slug}`}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gray-800/50 rounded-xl overflow-hidden hover:ring-2 hover:ring-orange-500/50 transition-all"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={relatedImage}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-gray-200 font-medium truncate group-hover:text-orange-400 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-orange-400 font-bold mt-1">
                          ₹{(relatedProduct.price)?.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
