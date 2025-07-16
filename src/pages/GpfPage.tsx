import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { GpfTransaction } from '../utils/mockData';
import { getGpfStats, getGpfTransactions } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';
import { Filter, Download, Info, Send, UserCheck, UserX, Loader, RotateCcw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const GpfPage: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState({ JSON_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0 });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [tableData, setTableData] = useState<GpfTransaction[]>([]);
  const [filters, setFilters] = useState({ kgid: '', fromDate: '', toDate: '' });
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedFilters = useDebounce(filters, 500);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const statsData = await getGpfStats(debouncedFilters);
      if (statsData) {
        setStatusCounts(statsData.statusCounts || { JSON_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0 });
        setTotalTransactions(statsData.totalTransactions || 0);
      }
    } catch (error) {
      console.error("Failed to fetch GPF stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, [debouncedFilters]);

  const fetchTransactions = useCallback(async () => {
    setIsTableLoading(true);
    setCurrentPage(1); // Reset to first page
    try {
      const data = await getGpfTransactions(selectedStatus, debouncedFilters);
      setTableData(data);
    } catch (error) {
      console.error("Failed to fetch GPF transactions:", error);
      setTableData([]);
    } finally {
      setIsTableLoading(false);
    }
  }, [selectedStatus, debouncedFilters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleClearFilters = () => {
    setFilters({ kgid: '', fromDate: '', toDate: '' });
    setSelectedStatus(null); // Also reset status selection
  };

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
          { value: statusCounts.JSON_SENT, name: 'JSON Sent', itemStyle: { color: '#3B82F6' } },
          { value: statusCounts.HRMS_RECEIVED, name: 'HRMS Received', itemStyle: { color: '#22C55E' } },
          { value: statusCounts.HRMS_REJECTED, name: 'HRMS Rejected', itemStyle: { color: '#EF4444' } },
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
          { value: statusCounts.HRMS_RECEIVED, itemStyle: { color: '#22C55E' } },
          { value: statusCounts.HRMS_REJECTED, itemStyle: { color: '#EF4444' } },
        ],
        borderRadius: 4,
      }]
  };

  const statusCards = [
    { key: 'JSON_SENT', title: 'JSON Sent', value: statusCounts.JSON_SENT, icon: Send, iconBgGradient: 'from-blue-500 to-indigo-600', borderColor: 'hover:border-blue-500' },
    { key: 'HRMS_RECEIVED', title: 'HRMS Acceptance', value: statusCounts.HRMS_RECEIVED, icon: UserCheck, iconBgGradient: 'from-green-500 to-emerald-600', borderColor: 'hover:border-green-500' },
    { key: 'HRMS_REJECTED', title: 'HRMS Rejection', value: statusCounts.HRMS_REJECTED, icon: UserX, iconBgGradient: 'from-red-500 to-rose-600', borderColor: 'hover:border-red-500' },
  ];

  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const paginatedData = tableData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  </div>
                  <button onClick={handleClearFilters} className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Enter KGID" value={filters.kgid} onChange={(e) => setFilters({ ...filters, kgid: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-8 mt-6">
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-24"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div key="ALL" whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" }} onClick={() => setSelectedStatus(null)} className={`relative bg-white p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${selectedStatus === null ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'} hover:border-slate-500`}>
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600"><Layers className="w-6 h-6 text-white" /></div>
                      <div className="text-right"><p className="text-3xl font-bold text-gray-800">{totalTransactions}</p></div>
                    </div>
                    <div className="mt-4"><h3 className="text-base font-semibold text-gray-800">All Transactions</h3></div>
                  </motion.div>
                  {statusCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <motion.div key={card.key} whileHover={{ y: -4, scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" }} onClick={() => setSelectedStatus(selectedStatus === card.key ? null : card.key)} className={`relative bg-white p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${selectedStatus === card.key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'} ${card.borderColor}`}>
                        <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${card.iconBgGradient}`}><CardIcon className="w-6 h-6 text-white" /></div>
                          <div className="text-right"><p className="text-3xl font-bold text-gray-800">{card.value}</p></div>
                        </div>
                        <div className="mt-4"><h3 className="text-base font-semibold text-gray-800">{card.title}</h3></div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={pieChartOptions} style={{ height: '400px' }} showLoading={isStatsLoading} /></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={barChartOptions} style={{ height: '400px' }} showLoading={isStatsLoading} /></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedStatus ? `${selectedStatus.replace(/_/g, ' ')} Details` : 'All GPF Transactions'}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Showing {tableData.length} transactions</span>
                    <button onClick={() => downloadCSV(tableData)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><Download className="w-4 h-4 ml-2 cursor-pointer hover:text-blue-600" /></button>
                  </div>
                </div>
              </div>
              {isTableLoading ? (
                <div className="flex justify-center items-center h-48"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : tableData.length === 0 ? (
                  <div className="text-center py-10 px-6">
                  <Info className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No Transactions Found</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no transactions for the selected status and filters.</p>
                </div>
              ) : (
                <>
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
                        {paginatedData.map((transaction, index) => (
                          <motion.tr key={transaction.TRANSACTION_ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
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
                  {totalPages > 1 && (
                    <div className="p-4 flex items-center justify-between border-t border-gray-200">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 flex items-center space-x-2">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                      <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 flex items-center space-x-2">
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GpfPage;
