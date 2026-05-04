/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UnifiedOrder, ShippingRecord } from '../types';
import { cn, formatNumber, formatPercent } from '../lib/utils';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderTableProps {
  data: (UnifiedOrder | ShippingRecord)[];
  isShipping?: boolean;
}

export default function OrderTable({ data, isShipping = false }: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredData = data.filter(item => {
    const searchStr = JSON.stringify(item).toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortConfig?.key !== colKey) return <ChevronDown size={14} className="opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Search items, SO No, brands, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              {!isShipping ? (
                <>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('soNo')}>
                    <div className="flex items-center gap-2">SO / WO <SortIcon colKey="soNo" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('brand')}>
                    <div className="flex items-center gap-2">Brand / Model <SortIcon colKey="brand" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('targetQty')}>
                    <div className="flex items-center gap-2">Target <SortIcon colKey="targetQty" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('producedQty')}>
                    <div className="flex items-center gap-2">Produced <SortIcon colKey="producedQty" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('achievement')}>
                    <div className="flex items-center gap-2">Ach % <SortIcon colKey="achievement" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-2">Status <SortIcon colKey="status" /></div>
                  </th>
                </>
              ) : (
                <>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('invoiceNo')}>
                    <div className="flex items-center gap-2">Invoice <SortIcon colKey="invoiceNo" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('customer')}>
                    <div className="flex items-center gap-2">Customer <SortIcon colKey="customer" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('destination')}>
                    <div className="flex items-center gap-2">Destination <SortIcon colKey="destination" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('quantity')}>
                    <div className="flex items-center gap-2">Qty <SortIcon colKey="quantity" /></div>
                  </th>
                  <th className="cursor-pointer px-6 py-4" onClick={() => requestSort('shippingDate')}>
                    <div className="flex items-center gap-2">Date <SortIcon colKey="shippingDate" /></div>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sortedData.map((item: any, idx) => (
              <tr key={idx} className="transition-colors hover:bg-gray-50/50">
                {!isShipping ? (
                  <>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.soNo}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{item.woNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{item.brand}</p>
                      <p className="text-xs text-gray-500">{item.model}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{formatNumber(item.targetQty)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-600 font-bold">{formatNumber(item.producedQty)}</span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${Math.min(item.achievement * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "rounded-full px-2 py-1 text-[11px] font-bold",
                        item.achievement >= 1 ? "bg-emerald-100 text-emerald-700" : 
                        item.achievement > 0.5 ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {formatPercent(item.achievement)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "text-xs font-medium px-2.5 py-1 rounded-lg",
                         item.status.toUpperCase().includes('DONE') || item.status.toUpperCase().includes('FINISHED')
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                       )}>
                         {item.status || 'Pending'}
                       </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.invoiceNo}</td>
                    <td className="px-6 py-4 text-gray-700">{item.customer}</td>
                    <td className="px-6 py-4 text-gray-700">{item.destination}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{formatNumber(item.quantity)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{item.shippingDate}</td>
                  </>
                )}
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center text-gray-400">
                   No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
