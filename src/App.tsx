/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  FileText, 
  RefreshCcw, 
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, parse } from 'date-fns';
import { fetchDashboardData } from './services/googleSheetsService';
import { DashboardData, UnifiedOrder, FilterState } from './types';
import { cn, formatNumber, formatPercent } from './lib/utils';

// Components
import KPICard from './components/KPICard';
import ProductionCharts from './components/ProductionCharts';
import ShippingCharts from './components/ShippingCharts';
import OrderTable from './components/OrderTable';
import FilterBar from './components/FilterBar';
import InvoiceTable from './components/InvoiceTable';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'shipping' | 'invoices'>('dashboard');
  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: [null, null],
    brand: 'All',
    soNo: '',
    woNo: '',
    model: 'All',
    destination: 'All',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchDashboardData();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please check your Google Sheet visibility.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unify and Filter Data
  const unifiedData = useMemo(() => {
    if (!data) return [];

    const orders: UnifiedOrder[] = data.erp.map(erpRec => {
      // Find matching IN record for metadata (Brand, Model, etc)
      const inRec = data.in.find(i => 
        i.soNo === erpRec.soNo && 
        i.woNo === erpRec.woNo && 
        i.productCode === erpRec.productCode
      );

      const targetQty = erpRec.orderQty;
      const producedQty = erpRec.totalProduction;
      const goodQty = erpRec.goodProduct;
      const reworkQty = erpRec.rework;

      return {
        soNo: erpRec.soNo,
        woNo: erpRec.woNo,
        productCode: erpRec.productCode,
        date: erpRec.date,
        brand: inRec?.customerBrand || 'Unknown',
        model: inRec?.model || 'Unknown',
        size: inRec?.size || 'Unknown',
        color: inRec?.color || 'Unknown',
        targetQty,
        producedQty,
        goodQty,
        reworkQty,
        achievement: targetQty > 0 ? producedQty / targetQty : 0,
        goodRate: producedQty > 0 ? goodQty / producedQty : 0,
        reworkRate: producedQty > 0 ? reworkQty / producedQty : 0,
        status: erpRec.remark,
      };
    });

    // Apply Filters
    return orders.filter(order => {
      const matchBrand = filters.brand === 'All' || order.brand === filters.brand;
      const matchModel = filters.model === 'All' || order.model === filters.model;
      const matchSO = !filters.soNo || order.soNo.includes(filters.soNo);
      const matchWO = !filters.woNo || order.woNo.includes(filters.woNo);
      
      // Date range filter (assuming DD/MM/YYYY or similar from sheet)
      let matchDate = true;
      if (filters.dateRange[0] && filters.dateRange[1]) {
        try {
          const orderDate = parse(order.date, 'd/M/yyyy', new Date());
          matchDate = isWithinInterval(orderDate, { 
            start: filters.dateRange[0], 
            end: filters.dateRange[1] 
          });
        } catch (e) {
          matchDate = true; // Skip filtering if date parse fails
        }
      }

      return matchBrand && matchModel && matchSO && matchWO && matchDate;
    });
  }, [data, filters]);

  // Totals
  const totals = useMemo(() => {
    return unifiedData.reduce((acc, curr) => ({
      target: acc.target + curr.targetQty,
      produced: acc.produced + curr.producedQty,
      good: acc.good + curr.goodQty,
      rework: acc.rework + curr.reworkQty,
    }), { target: 0, produced: 0, good: 0, rework: 0 });
  }, [unifiedData]);

  const totalExported = useMemo(() => {
    if (!data) return 0;
    return data.shipping.reduce((sum, item) => sum + item.quantity, 0);
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-xl font-medium text-gray-900">Loading Dashboard Data...</p>
          <p className="text-gray-500">Connecting to Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Error Loading Data</h2>
          <p className="mt-2 text-center text-gray-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-8 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F5F7] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Alpha ERP</span>
        </div>

        <nav className="mt-10 flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'invoices', label: 'Invoices', icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon size={20} className={activeTab === item.id ? "text-indigo-600" : "text-gray-400"} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <div className="rounded-2xl bg-indigo-600 p-4 text-white">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Sync Status</p>
            <p className="mt-1 text-sm font-semibold">Live Connection Active</p>
            <p className="mt-2 text-[10px] opacity-70">Last synced: {format(new Date(), 'HH:mm:ss')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Operations Analytics'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'shipping' && 'Shipping Records'}
              {activeTab === 'invoices' && 'Invoice Tracking'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 p-1">
              <div className="h-full w-full rounded-full bg-indigo-600" />
            </div>
          </div>
        </header>

        {/* Dynamic Context Filters */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          availableBrands={Array.from(new Set(data?.in.map(i => i.customerBrand)))}
          availableModels={Array.from(new Set(unifiedData.map(o => o.model)))}
          availableDestinations={Array.from(new Set(data?.shipping.map(s => s.destination)))}
        />

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* KPI Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <KPICard title="Target Production" value={totals.target} icon={BarChart3} color="blue" />
                  <KPICard title="Total Produced" value={totals.produced} icon={PackageCircleIcon} color="indigo" />
                  <KPICard title="Good Product" value={totals.good} icon={CheckCircle2} color="emerald" />
                  <KPICard title="Total Rework" value={totals.rework} icon={AlertCircle} color="amber" />
                  <KPICard 
                    title="Achievement Rate" 
                    value={formatPercent(totals.target > 0 ? totals.produced / totals.target : 0)} 
                    icon={TrendingUp} 
                    color="violet" 
                  />
                  <KPICard title="Total Exported" value={totalExported} icon={Truck} color="slate" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <TrendingUp size={20} className="text-indigo-600" />
                      Production Trends (Daily)
                    </h3>
                    <ProductionCharts data={unifiedData} />
                  </div>
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Truck size={20} className="text-indigo-600" />
                      Export Analysis by Destination
                    </h3>
                    <ShippingCharts data={data?.shipping || []} />
                  </div>
                </div>

                {/* Main Table for Dashboard Context */}
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <LayoutDashboard size={20} className="text-indigo-600" />
                    Real-time Order Status
                  </h3>
                  <OrderTable data={unifiedData} />
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <OrderTable data={unifiedData} />
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                 <div className="space-y-8">
                    <ShippingCharts data={data?.shipping || []} isDetailed />
                    <OrderTable data={data?.shipping || [] as any} isShipping />
                 </div>
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                 <InvoiceTable data={data?.shipping || []} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PackageCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <path d="M12 10v4" />
      <path d="m9 10 3-3 3 3" />
    </svg>
  );
}
