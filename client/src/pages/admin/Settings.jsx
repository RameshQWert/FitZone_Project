import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineColorSwatch,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineSave,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'FitZone',
    siteEmail: 'contact@fitzone.com',
    sitePhone: '+1 (555) 123-4567',
    address: '123 Fitness Street, Gym City, GC 12345',
    notifications: {
      emailNewMember: true,
      emailPayment: true,
      emailClassReminder: false,
      pushNotifications: true,
    },
    maintenance: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary-500/20 rounded-lg">
          <Icon className="text-primary-400" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your gym's configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <HiOutlineSave className="mr-2" size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection title="General Settings" icon={HiOutlineCog}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.sitePhone}
                onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications" icon={HiOutlineBell}>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors">
              <div>
                <p className="text-white font-medium">New Member Notifications</p>
                <p className="text-gray-400 text-sm">Get notified when new members register</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailNewMember}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNewMember: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors">
              <div>
                <p className="text-white font-medium">Payment Notifications</p>
                <p className="text-gray-400 text-sm">Get notified for payment activities</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailPayment}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailPayment: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors">
              <div>
                <p className="text-white font-medium">Class Reminders</p>
                <p className="text-gray-400 text-sm">Send reminders before classes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailClassReminder}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailClassReminder: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-gray-400 text-sm">Enable browser push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, pushNotifications: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
            </label>
          </div>
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="Security" icon={HiOutlineShieldCheck}>
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-xl">
              <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-gray-400 text-sm mb-3">Add an extra layer of security to your account</p>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
                Enable 2FA
              </button>
            </div>
            <div className="p-4 bg-dark-700 rounded-xl">
              <h4 className="text-white font-medium mb-2">Change Password</h4>
              <p className="text-gray-400 text-sm mb-3">Update your admin password regularly</p>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </SettingSection>

        {/* System Settings */}
        <SettingSection title="System" icon={HiOutlineGlobe}>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-gray-400 text-sm">Temporarily disable public access</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance}
                onChange={(e) => setSettings({ ...settings, maintenance: e.target.checked })}
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
              />
            </label>
            <div className="p-4 bg-dark-700 rounded-xl">
              <h4 className="text-white font-medium mb-2">Database Backup</h4>
              <p className="text-gray-400 text-sm mb-3">Create a backup of your database</p>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
                Create Backup
              </button>
            </div>
            <div className="p-4 bg-dark-700 rounded-xl">
              <h4 className="text-white font-medium mb-2">Clear Cache</h4>
              <p className="text-gray-400 text-sm mb-3">Clear system cache for better performance</p>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
                Clear Cache
              </button>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default AdminSettings;
