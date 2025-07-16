import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { GemsTransaction } from '../utils/mockData';
import { getGemsStats, getGemsTransactions } from '../services/apiService';
import { useDebounce } from '../hooks/useDebounce';
import { Filter, Eye, EyeOff, Download, Info, Send, FileText, CheckCircle, XCircle, CheckSquare, XSquare, Loader, RotateCcw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const GemsPage: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState({ JSON_SENT: 0, PDF_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0, DDO_RECEIVED: 0, DDO_REJECTED: 0 });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [tableData, setTableData] = useState<GemsTransaction[]>([]);
  const [filters, setFilters] = useState({ geNumber: '', eventName: '', fromDate: '', toDate: '' });
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedFilters = useDebounce(filters, 500);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const statsData = await getGemsStats(debouncedFilters);
      if (statsData) {
        setStatusCounts(statsData.statusCounts || { JSON_SENT: 0, PDF_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0, DDO_RECEIVED: 0, DDO_REJECTED: 0 });
        setTotalTransactions(statsData.totalTransactions || 0);
      }
    } catch (error) {
      console.error("Failed to fetch GEMS stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, [debouncedFilters]);

  const fetchTransactions = useCallback(async () => {
    setIsTableLoading(true);
    setCurrentPage(1); // Reset to first page on new data fetch
    try {
      const data = await getGemsTransactions(selectedStatus, debouncedFilters);
      setTableData(data);
    } catch (error) {
      console.error("Failed to fetch GEMS transactions:", error);
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
    setFilters({ geNumber: '', eventName: '', fromDate: '', toDate: '' });
    setSelectedStatus(null); // Also reset status selection
  };
  
  const downloadCSV = (dataToExport: GemsTransaction[]) => {
    if (dataToExport.length === 0) {
      alert("No data to download.");
      return;
    }
    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof GemsTransaction], (_key, value) => value === null ? '' : value)
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gems_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieChartOptions = {
    title: { text: 'Distribution Overview', subtext: 'Transaction status distribution', left: 'center', textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { bottom: '0%', left: 'center', itemGap: 10, textStyle: { fontSize: 12 } },
    series: [{
        name: 'Transaction Status', type: 'pie', radius: ['40%', '70%'],
        data: [
          { value: statusCounts.JSON_SENT, name: 'JSON Sent', itemStyle: { color: '#3B82F6' } },
          { value: statusCounts.PDF_SENT, name: 'PDF Sent', itemStyle: { color: '#0EA5E9' } },
          { value: statusCounts.HRMS_RECEIVED, name: 'HRMS Received', itemStyle: { color: '#22C55E' } },
          { value: statusCounts.DDO_RECEIVED, name: 'DDO Received', itemStyle: { color: '#84CC16' } },
          { value: statusCounts.DDO_REJECTED, name: 'DDO Rejected', itemStyle: { color: '#F97316' } },
          { value: statusCounts.HRMS_REJECTED, name: 'HRMS Rejection', itemStyle: { color: '#EF4444' } },
        ],
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
  };

  const barChartOptions = {
    title: { text: 'Transaction Volume', subtext: 'Counts by status', left: 'center', textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['JSON Sent', 'PDF Sent', 'HRMS Rcvd', 'DDO Rcvd', 'DDO Rjct', 'HRMS Rjct'], axisLabel: { rotate: 30, fontSize: 10, interval: 0 } },
    yAxis: { type: 'value' },
    series: [{
        type: 'bar', barWidth: '60%',
        data: [
          { value: statusCounts.JSON_SENT, itemStyle: { color: '#3B82F6' } },
          { value: statusCounts.PDF_SENT, itemStyle: { color: '#0EA5E9' } },
          { value: statusCounts.HRMS_RECEIVED, itemStyle: { color: '#22C55E' } },
          { value: statusCounts.DDO_RECEIVED, itemStyle: { color: '#84CC16' } },
          { value: statusCounts.DDO_REJECTED, itemStyle: { color: '#F97316' } },
          { value: statusCounts.HRMS_REJECTED, itemStyle: { color: '#EF4444' } },
        ],
        borderRadius: 4,
      }]
  };

  const statusCards = [
    { key: 'JSON_SENT', title: 'JSON Sent', shortTitle: 'JSON\nSent', value: statusCounts.JSON_SENT, icon: Send, iconBgGradient: 'from-blue-500 to-indigo-600', cardBg: 'bg-blue-50', borderColor: 'hover:border-blue-500' },
    { key: 'PDF_SENT', title: 'PDF Sent', shortTitle: 'PDF Sent', value: statusCounts.PDF_SENT, icon: FileText, iconBgGradient: 'from-sky-500 to-cyan-600', cardBg: 'bg-sky-50', borderColor: 'hover:border-sky-500' },
    { key: 'HRMS_RECEIVED', title: 'HRMS Received', shortTitle: 'HRMS\nReceived', value: statusCounts.HRMS_RECEIVED, icon: CheckCircle, iconBgGradient: 'from-green-500 to-emerald-600', cardBg: 'bg-green-50', borderColor: 'hover:border-green-500' },
    { key: 'HRMS_REJECTED', title: 'HRMS Rejection', shortTitle: 'HRMS\nRejection', value: statusCounts.HRMS_REJECTED, icon: XCircle, iconBgGradient: 'from-red-500 to-rose-600', cardBg: 'bg-red-50', borderColor: 'hover:border-red-500' },
    { key: 'DDO_RECEIVED', title: 'DDO Received', shortTitle: 'DDO\nReceived', value: statusCounts.DDO_RECEIVED, icon: CheckSquare, iconBgGradient: 'from-lime-500 to-green-600', cardBg: 'bg-lime-50', borderColor: 'hover:border-lime-500' },
    { key: 'DDO_REJECTED', title: 'DDO Rejected', shortTitle: 'DDO\nRejected', value: statusCounts.DDO_REJECTED, icon: XSquare, iconBgGradient: 'from-amber-500 to-orange-600', cardBg: 'bg-orange-50', borderColor: 'hover:border-orange-500' },
  ];

  const handleStatusCardClick = (status: string | null) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const paginatedData = tableData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 bg-slate-100">
        <Navbar />
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">GEMS Dashboard</h1>
                <p className="text-gray-600">Monitor and track GEMS transaction statuses in real-time</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCards(!showCards)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {showCards ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showCards ? 'Hide Cards' : 'Show Cards'}</span>
              </motion.button>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="GE Number" value={filters.geNumber} onChange={(e) => setFilters({ ...filters, geNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Event Name" value={filters.eventName} onChange={(e) => setFilters({ ...filters, eventName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <AnimatePresence>
              {showCards && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 mt-6">
                  {isStatsLoading ? (
                    <div className="flex justify-center items-center h-24"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      <motion.div key="ALL" whileHover={{ y: -2, scale: 1.02 }} onClick={() => handleStatusCardClick(null)} className={`relative bg-slate-50 p-4 rounded-xl shadow-sm border transition-all cursor-pointer ${selectedStatus === null ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} hover:border-slate-500`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600"><Layers className="w-5 h-5 text-white" /></div>
                          <div className="text-right"><p className="text-2xl font-bold text-gray-800">{totalTransactions}</p></div>
                        </div>
                        <div><h3 className="text-sm font-semibold text-gray-700 leading-tight whitespace-pre-line">All Transactions</h3></div>
                      </motion.div>
                      {statusCards.map((card) => {
                        const CardIcon = card.icon;
                        return (
                          <motion.div key={card.key} whileHover={{ y: -2, scale: 1.02 }} onClick={() => handleStatusCardClick(card.key)} className={`relative ${card.cardBg} p-4 rounded-xl shadow-sm border transition-all cursor-pointer ${selectedStatus === card.key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} ${card.borderColor}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.iconBgGradient}`}><CardIcon className="w-5 h-5 text-white" /></div>
                              <div className="text-right"><p className="text-2xl font-bold text-gray-800">{card.value}</p></div>
                            </div>
                            <div><h3 className="text-sm font-semibold text-gray-700 leading-tight whitespace-pre-line">{card.shortTitle}</h3></div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={pieChartOptions} style={{ height: '350px' }} showLoading={isStatsLoading} /></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><ReactECharts option={barChartOptions} style={{ height: '350px' }} showLoading={isStatsLoading} /></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedStatus ? `${selectedStatus.replace(/_/g, ' ')} Details` : 'All GEMS Transactions'}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GE Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF File Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JSON Sent Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((transaction, index) => (
                          <motion.tr key={transaction.TRANSACTION_ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{transaction.TRANSACTION_ID}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{transaction.EVENT_ID}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.GE_NUMBER}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.EVENT_NAME}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-600">{transaction.PDF_FILE_NAME}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{transaction.JSONSENTDATE}</td>
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

export default GemsPage;
