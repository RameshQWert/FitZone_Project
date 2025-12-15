import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineUpload,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SiteContent = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalType, setModalType] = useState('team');
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, testimonialsRes] = await Promise.all([
        api.get('/site-content/team?all=true'),
        api.get('/site-content/testimonials?all=true'),
      ]);
      setTeam(teamRes.data.data || []);
      setTestimonials(testimonialsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setModalType(type);
    setModalMode('add');
    if (type === 'team') {
      setSelectedItem({
        name: '',
        role: '',
        image: '',
        bio: '',
        socialMedia: { linkedin: '', twitter: '' },
        order: 0,
        isActive: true,
      });
    } else {
      setSelectedItem({
        name: '',
        role: 'Member',
        image: '',
        content: '',
        rating: 5,
        order: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setModalMode('edit');
    setSelectedItem({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'team' ? 'team member' : 'testimonial'}?`)) return;

    try {
      await api.delete(`/site-content/${type === 'team' ? 'team' : 'testimonials'}/${id}`);
      if (type === 'team') {
        setTeam(team.filter((t) => t._id !== id));
      } else {
        setTestimonials(testimonials.filter((t) => t._id !== id));
      }
      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSelectedItem({ ...selectedItem, image: response.data.data.url });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const endpoint = modalType === 'team' ? 'team' : 'testimonials';

      if (modalMode === 'add') {
        const response = await api.post(`/site-content/${endpoint}`, selectedItem);
        const newItem = response.data.data;
        if (modalType === 'team') {
          setTeam([...team, newItem]);
        } else {
          setTestimonials([...testimonials, newItem]);
        }
        toast.success('Added successfully');
      } else {
        const response = await api.put(`/site-content/${endpoint}/${selectedItem._id}`, selectedItem);
        const updatedItem = response.data.data;
        if (modalType === 'team') {
          setTeam(team.map((t) => (t._id === selectedItem._id ? updatedItem : t)));
        } else {
          setTestimonials(testimonials.map((t) => (t._id === selectedItem._id ? updatedItem : t)));
        }
        toast.success('Updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Site Content</h1>
          <p className="text-gray-400 mt-1">Manage team members and testimonials</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'team'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <HiOutlineUserGroup className="mr-2" size={20} />
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'testimonials'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <HiOutlineChatAlt2 className="mr-2" size={20} />
          Testimonials
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleAdd('team')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <HiOutlinePlus className="mr-2" size={20} />
                  Add Team Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                      <img
                        src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=8b5cf6&color=fff&size=200`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                      {!member.isActive && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500/80 text-white text-xs rounded-lg">
                          Inactive
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                      <p className="text-primary-400 text-sm">{member.role}</p>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{member.bio || 'No bio available'}</p>
                      <div className="flex items-center justify-end mt-4 pt-4 border-t border-dark-700 space-x-2">
                        <button
                          onClick={() => handleEdit(member, 'team')}
                          className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <HiOutlinePencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id, 'team')}
                          className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {team.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <HiOutlineUserGroup size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No team members yet. Add your first team member!</p>
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleAdd('testimonials')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <HiOutlinePlus className="mr-2" size={20} />
                  Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-800 rounded-2xl border border-dark-700 p-5"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=8b5cf6&color=fff&size=80`}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <HiOutlineStar key={i} className="text-yellow-400 fill-yellow-400" size={14} />
                          ))}
                        </div>
                      </div>
                      {!testimonial.isActive && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg ml-auto">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm italic line-clamp-3">"{testimonial.content}"</p>
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-dark-700 space-x-2">
                      <button
                        onClick={() => handleEdit(testimonial, 'testimonials')}
                        className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <HiOutlinePencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id, 'testimonials')}
                        className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {testimonials.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <HiOutlineChatAlt2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No testimonials yet. Add your first testimonial!</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-700 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-white">
                  {modalMode === 'add' ? 'Add' : 'Edit'} {modalType === 'team' ? 'Team Member' : 'Testimonial'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-dark-700 text-gray-400"
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {/* Image Upload */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={selectedItem.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.name || 'New')}&background=8b5cf6&color=fff&size=100`}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-dark-600"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center px-3 py-2 bg-dark-700 border border-dark-600 rounded-xl text-gray-300 hover:bg-dark-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      <HiOutlineUpload className="mr-2" size={16} />
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                  </div>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={selectedItem.name || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {modalType === 'team' ? 'Role/Position *' : 'Role/Title'}
                  </label>
                  <input
                    type="text"
                    value={selectedItem.role || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, role: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    placeholder={modalType === 'team' ? 'e.g., CEO, Marketing Head' : 'e.g., Member, Premium Member'}
                  />
                </div>

                {/* Team-specific Fields */}
                {modalType === 'team' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={selectedItem.bio || ''}
                        onChange={(e) => setSelectedItem({ ...selectedItem, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="Brief description about this person..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                        <input
                          type="url"
                          value={selectedItem.socialMedia?.linkedin || ''}
                          onChange={(e) => setSelectedItem({
                            ...selectedItem,
                            socialMedia: { ...selectedItem.socialMedia, linkedin: e.target.value }
                          })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                        <input
                          type="url"
                          value={selectedItem.socialMedia?.twitter || ''}
                          onChange={(e) => setSelectedItem({
                            ...selectedItem,
                            socialMedia: { ...selectedItem.socialMedia, twitter: e.target.value }
                          })}
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Testimonial-specific Fields */}
                {modalType === 'testimonials' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Testimonial Content *</label>
                      <textarea
                        value={selectedItem.content || ''}
                        onChange={(e) => setSelectedItem({ ...selectedItem, content: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        placeholder="What did they say about your gym?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedItem({ ...selectedItem, rating: star })}
                            className={`p-1 transition-colors ${
                              star <= selectedItem.rating ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          >
                            <HiOutlineStar
                              size={24}
                              className={star <= selectedItem.rating ? 'fill-yellow-400' : ''}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedItem.order || 0}
                      onChange={(e) => setSelectedItem({ ...selectedItem, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={selectedItem.isActive ? 'true' : 'false'}
                      onChange={(e) => setSelectedItem({ ...selectedItem, isActive: e.target.value === 'true' })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedItem.name || (modalType === 'testimonials' && !selectedItem.content)}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SiteContent;
