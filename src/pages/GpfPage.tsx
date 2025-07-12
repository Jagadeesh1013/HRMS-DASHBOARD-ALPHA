import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { generateGpfData, getGpfStatusCounts, GpfTransaction } from '../utils/mockData';
import { Filter, Download, Info, Send, UserCheck, UserX } from 'lucide-react';

const GpfPage: React.FC = () => {
  const [data] = useState<GpfTransaction[]>(() => generateGpfData(120));
  const [filters, setFilters] = useState({
    kgid: '',
    fromDate: '',
    toDate: '',
  });
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredDataForStats = useMemo(() => {
    return data.filter(item => {
      const matchesKgid = !filters.kgid || item.KGID.toLowerCase().includes(filters.kgid.toLowerCase());
      const matchesFromDate = !filters.fromDate || item.JSON_SENT_DATE >= filters.fromDate;
      const matchesToDate = !filters.toDate || item.JSON_SENT_DATE <= filters.toDate;
      return matchesKgid && matchesFromDate && matchesToDate;
    });
  }, [data, filters]);

  const tableData = useMemo(() => {
    if (!selectedStatus) return [];
    return filteredDataForStats.filter(item => item.status === selectedStatus);
  }, [selectedStatus, filteredDataForStats]);

  const statusCounts = useMemo(() => getGpfStatusCounts(filteredDataForStats), [filteredDataForStats]);

  const downloadCSV = (dataToExport: GpfTransaction[]) => {
    if (dataToExport.length === 0) {
      alert("No data to download.");
      return;
    }
    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof GpfTransaction], (_key, value) => value === null ? '' : value)
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gpf_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieChartOptions = {
    title: { text: 'GPF Distribution', left: 'center', textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { bottom: '0%', left: 'center' },
    series: [{
        name: 'GPF Status', type: 'pie', radius: ['40%', '70%'],
        data: [
          { value: statusCounts.JSON_SENT, name: 'JSON Sent', itemStyle: { color: '#3B82F6' } }, // blue-500
          { value: statusCounts.HRMS_RECEIVED, name: 'HRMS Received', itemStyle: { color: '#0EA5E9' } }, // sky-500
          { value: statusCounts.HRMS_REJECTED, name: 'HRMS Rejected', itemStyle: { color: '#EF4444' } }, // red-500
        ],
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
  };

  const barChartOptions = {
    title: { text: 'GPF Volume', left: 'center', textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['JSON Sent', 'HRMS Received', 'HRMS Rejected'] },
    yAxis: { type: 'value' },
    series: [{
        type: 'bar', barWidth: '50%',
        data: [
          { value: statusCounts.JSON_SENT, itemStyle: { color: '#3B82F6' } },
          { value: statusCounts.HRMS_RECEIVED, itemStyle: { color: '#0EA5E9' } },
          { value: statusCounts.HRMS_REJECTED, itemStyle: { color: '#EF4444' } },
        ],
        borderRadius: 4,
      }]
  };

  const statusCards = [
    { key: 'JSON_SENT', title: 'JSON Sent', value: statusCounts.JSON_SENT, icon: Send, iconColor: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'hover:border-blue-500' },
    { key: 'HRMS_RECEIVED', title: 'HRMS Acceptance', value: statusCounts.HRMS_RECEIVED, icon: UserCheck, iconColor: 'text-sky-600', bgColor: 'bg-sky-100', borderColor: 'hover:border-sky-500' },
    { key: 'HRMS_REJECTED', title: 'HRMS Rejection', value: statusCounts.HRMS_REJECTED, icon: UserX, iconColor: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'hover:border-red-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 bg-slate-100">
        <Navbar />
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">GPF Dashboard</h1>
              <p className="text-gray-600">Monitor and track GPF transaction statuses and employee data</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Enter KGID" value={filters.kgid} onChange={(e) => setFilters({ ...filters, kgid: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusCards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <motion.div
                      key={card.key}
                      whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" }}
                      onClick={() => setSelectedStatus(selectedStatus === card.key ? null : card.key)}
                      className={`relative bg-white p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${
                        selectedStatus === card.key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                      } ${card.borderColor}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                          <CardIcon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-base font-semibold text-gray-800">{card.title}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={pieChartOptions} style={{ height: '400px' }} /></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={barChartOptions} style={{ height: '400px' }} /></div>
            </div>

            <AnimatePresence>
              {selectedStatus && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">{selectedStatus.replace('_', ' ')} Details</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Showing {tableData.length} transactions</span>
                          <button onClick={() => downloadCSV(tableData)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-4 h-4 ml-2 cursor-pointer hover:text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KGID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JSON Sent Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.slice(0, 10).map((transaction, index) => (
                            <motion.tr key={transaction.TRANSACTION_ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{transaction.KGID}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.NAME}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.JOINING_DATE}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-600">{transaction.POLICY_NO}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{transaction.JSON_SENT_DATE}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedStatus && (
              <div className="text-center py-10 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <Info className="mx-auto h-10 w-10 text-blue-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">View Transaction Details</h3>
                <p className="mt-1 text-sm text-gray-500">Click on any status card above to display the corresponding transaction list here.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GpfPage;
