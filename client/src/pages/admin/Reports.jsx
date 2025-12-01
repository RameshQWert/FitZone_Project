import React from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlineCalendar,
} from 'react-icons/hi';

const AdminReports = () => {
  const reports = [
    {
      id: 1,
      name: 'Monthly Revenue Report',
      description: 'Detailed breakdown of all revenue streams',
      icon: HiOutlineChartBar,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 2,
      name: 'Member Activity Report',
      description: 'Track member attendance and engagement',
      icon: HiOutlineDocumentReport,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 3,
      name: 'Class Performance Report',
      description: 'Analyze class attendance and popularity',
      icon: HiOutlineCalendar,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 4,
      name: 'Trainer Performance Report',
      description: 'Review trainer ratings and sessions',
      icon: HiOutlineDocumentReport,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Generate and download business reports</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <HiOutlineDocumentReport className="text-primary-400" size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium">Advanced Reports Coming Soon</h4>
            <p className="text-gray-400 text-sm mt-1">
              Detailed analytics and custom report generation will be available in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-800 rounded-2xl p-6 border border-dark-700 hover:border-dark-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color}`}>
                  <report.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{report.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <select className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-primary-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>This year</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors">
                <HiOutlineDownload className="mr-2" size={18} />
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
