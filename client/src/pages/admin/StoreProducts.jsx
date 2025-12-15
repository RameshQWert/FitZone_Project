import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineTag,
  HiOutlineCurrencyRupee,
  HiOutlineCollection,
  HiOutlineRefresh,
  HiOutlineStar,
} from 'react-icons/hi';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

const StoreProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const categories = [
    { value: 'supplements', label: 'Supplements', icon: '💊' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'equipment', label: 'Equipment', icon: '🏋️' },
    { value: 'accessories', label: 'Accessories', icon: '🧤' },
  ];

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
      };
      const response = await adminService.getStoreProducts(params);
      // Admin endpoint returns data directly, not nested in products
      setProducts(response.data || []);
      setPagination(response.pagination || { page: 1, total: 0, pages: 1 });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleActive = async (product) => {
    try {
      await adminService.updateStoreProduct(product._id, { isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      fetchProducts(pagination.page);
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setDeleting(productId);
      await adminService.deleteStoreProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts(pagination.page);
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await adminService.updateStoreProduct(editingProduct._id, productData);
        toast.success('Product updated successfully');
        closeModal();
        fetchProducts(pagination.page); // Stay on current page when editing
      } else {
        await adminService.createStoreProduct(productData);
        toast.success('Product created successfully');
        closeModal();
        fetchProducts(1); // Go to first page when creating new product
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineCollection className="w-7 h-7 text-orange-400" />
            Store Products
          </h1>
          <p className="text-gray-400 mt-1">Manage your store inventory and products</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Product
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchProducts()}
            className="flex items-center justify-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Product</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Category</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Price</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Stock</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Rating</th>
                <th className="text-left text-gray-300 font-medium px-6 py-4">Status</th>
                <th className="text-right text-gray-300 font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading products...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <HiOutlineCollection className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No products found</p>
                    <button
                      onClick={openAddModal}
                      className="mt-2 text-orange-400 hover:text-orange-300"
                    >
                      Add your first product
                    </button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail || product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-500 text-sm truncate max-w-xs">{product.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-sm text-gray-300 capitalize">
                        {categories.find(c => c.value === product.category)?.icon} {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">
                        <span className="font-medium">₹{product.price?.toLocaleString()}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <>
                            <span className="text-gray-500 text-sm line-through ml-2">₹{product.comparePrice.toLocaleString()}</span>
                            <span className="ml-2 text-xs text-red-400 font-medium">
                              {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock <= 0 ? 'text-red-400' :
                        product.stock < 10 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock < 10 && product.stock > 0 && (
                        <span className="ml-2 text-xs text-yellow-500">Low</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.ratings?.count > 0 ? (
                        <div className="flex items-center gap-1">
                          <HiOutlineStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white">{product.ratings.average?.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({product.ratings.count})</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No ratings</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                          product.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {product.isActive ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeOff className="w-4 h-4" />}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === product._id ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <HiOutlineTrash className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-700">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchProducts(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === i + 1
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={closeModal}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Add/Edit Modal Component
const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price || '',
    comparePrice: product?.comparePrice || '',
    category: product?.category || 'supplements',
    subcategory: product?.subcategory || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    stock: product?.stock || 0,
    tags: product?.tags?.join(', ') || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured || false,
  });
  const [images, setImages] = useState(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const response = await adminService.uploadProductImages(formData);
      // Response structure: { success: true, data: [{ url, publicId }] }
      const newImages = response.data?.map(img => ({ url: img.url, publicId: img.publicId })) || [];
      setImages(prev => [...prev, ...newImages]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        sku: formData.sku || undefined,
        stock: parseInt(formData.stock),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images,
      };
      await onSave(productData);
    } catch (error) {
      // Error handled in parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                {uploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <HiOutlinePhotograph className="w-6 h-6 text-gray-500" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Brief product tagline"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Enter product description"
            />
          </div>

          {/* Price & Compare Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Sale Price (₹) *</label>
              <p className="text-gray-500 text-xs mb-2">Current selling price</p>
              <div className="relative">
                <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.price ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                  }`}
                  placeholder="e.g., 1299"
                />
              </div>
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Original Price (₹)</label>
              <p className="text-gray-500 text-xs mb-2">MRP for discount display</p>
              <div className="relative">
                <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 1599"
                />
              </div>
              {formData.comparePrice && parseFloat(formData.comparePrice) <= parseFloat(formData.price) && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Original price should be higher than sale price to show discount
                </p>
              )}
              {formData.price && formData.comparePrice && parseFloat(formData.comparePrice) > parseFloat(formData.price) && (
                <p className="text-green-400 text-sm mt-2 font-medium">
                  💰 {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.comparePrice)) * 100)}% OFF discount will be shown
                </p>
              )}
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Subcategory</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Whey, Dumbbells"
              />
            </div>
          </div>

          {/* Brand & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Brand name"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Product SKU code"
              />
            </div>
          </div>

          {/* Stock & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.stock ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
                }`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Comma-separated: protein, gym, muscle"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300">Active (Visible in store)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300">Featured Product</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default StoreProducts;
