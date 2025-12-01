import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const data = response.data.data || response.data;
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/users/${id}`);
        setMembers(members.filter((m) => m._id !== id));
        toast.success('Member deleted successfully');
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (member) => {
    setSelectedMember({ ...member });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedMember({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'member',
      isActive: true,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (modalMode === 'add') {
        const response = await api.post('/auth/register', {
          fullName: selectedMember.fullName,
          email: selectedMember.email,
          phone: selectedMember.phone,
          password: selectedMember.password || 'password123',
        });
        const newMember = response.data.user || response.data;
        setMembers([...members, newMember]);
        toast.success('Member added successfully');
      } else {
        const response = await api.put(`/users/${selectedMember._id}`, {
          fullName: selectedMember.fullName,
          email: selectedMember.email,
          phone: selectedMember.phone,
          role: selectedMember.role,
          isActive: selectedMember.isActive,
        });
        const updatedMember = response.data.data || response.data;
        setMembers(members.map((m) => (m._id === selectedMember._id ? updatedMember : m)));
        toast.success('Member updated successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (member) => {
    if (member.isActive) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Active</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Inactive</span>;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-500/20 text-purple-400',
      trainer: 'bg-blue-500/20 text-blue-400',
      member: 'bg-gray-500/20 text-gray-400',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[role] || styles.member}`}>{role}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Members</h1>
          <p className="text-gray-400 mt-1">Manage your gym members and their subscriptions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlinePlus className="mr-2" size={20} />
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="member">Members</option>
            <option value="trainer">Trainers</option>
            <option value="admin">Admins</option>
          </select>

          {/* Export */}
          <button className="flex items-center px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-gray-300 hover:text-white hover:border-dark-500 transition-colors">
            <HiOutlineDownload className="mr-2" size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700/50">
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Member</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Contact</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Role</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Joined</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                          {member.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-white font-medium">{member.fullName}</p>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{member.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(member)}</td>
                    <td className="px-6 py-4 text-gray-300">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(member)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                          title="View"
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash size={18} />
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
        <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {filteredMembers.length} of {members.length} members
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-primary-500 rounded-lg text-white">1</button>
            <button className="px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Member Modal */}
      <AnimatePresence>
        {showModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
                <h3 className="text-lg font-semibold text-white">
                  {modalMode === 'view' ? 'Member Details' : modalMode === 'edit' ? 'Edit Member' : 'Add Member'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-dark-700 text-gray-400"
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {modalMode === 'view' ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl">
                        {selectedMember.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white">{selectedMember.fullName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleBadge(selectedMember.role)}
                          {getStatusBadge(selectedMember)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <HiOutlineMail className="text-gray-400" />
                        <span>{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <HiOutlinePhone className="text-gray-400" />
                        <span>{selectedMember.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <HiOutlineCalendar className="text-gray-400" />
                        <span>Joined: {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={selectedMember.fullName || ''}
                        onChange={(e) => setSelectedMember({ ...selectedMember, fullName: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                      <input
                        type="email"
                        value={selectedMember.email || ''}
                        onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={selectedMember.phone || ''}
                        onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    {modalMode === 'add' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                        <input
                          type="password"
                          value={selectedMember.password || ''}
                          onChange={(e) => setSelectedMember({ ...selectedMember, password: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          required
                        />
                      </div>
                    )}
                    {modalMode === 'edit' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                          <select
                            value={selectedMember.role || 'member'}
                            onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                            className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
                          >
                            <option value="member">Member</option>
                            <option value="trainer">Trainer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={selectedMember.isActive}
                            onChange={(e) => setSelectedMember({ ...selectedMember, isActive: e.target.checked })}
                            className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500"
                          />
                          <label htmlFor="isActive" className="text-gray-300">Active Account</label>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-dark-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:bg-dark-600 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMembers;
