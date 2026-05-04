/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filter, X } from 'lucide-react';
import { FilterState } from '../types';
import { cn } from '../lib/utils';

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableBrands: string[];
  availableModels: string[];
  availableDestinations: string[];
}

export default function FilterBar({ 
  filters, 
  setFilters, 
  availableBrands, 
  availableModels, 
  availableDestinations 
}: FilterBarProps) {
  
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      dateRange: [null, null],
      brand: 'All',
      soNo: '',
      woNo: '',
      model: 'All',
      destination: 'All',
    });
  };

  const hasActiveFilters = 
    filters.brand !== 'All' || 
    filters.model !== 'All' || 
    filters.destination !== 'All' || 
    filters.soNo !== '' || 
    filters.woNo !== '' ||
    (filters.dateRange[0] !== null);

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mr-2">
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="SO No."
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={filters.soNo}
            onChange={(e) => updateFilter('soNo', e.target.value)}
          />
          <input
            type="text"
            placeholder="WO No."
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={filters.woNo}
            onChange={(e) => updateFilter('woNo', e.target.value)}
          />
          
          <select
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={filters.brand}
            onChange={(e) => updateFilter('brand', e.target.value)}
          >
            <option value="All">All Brands</option>
            {availableBrands.map(b => b ? <option key={b} value={b}>{b}</option> : null)}
          </select>

          <select
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={filters.model}
            onChange={(e) => updateFilter('model', e.target.value)}
          >
            <option value="All">All Models</option>
            {availableModels.map(m => m ? <option key={m} value={m}>{m}</option> : null)}
          </select>

          <select
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={filters.destination}
            onChange={(e) => updateFilter('destination', e.target.value)}
          >
            <option value="All">All Destinations</option>
            {availableDestinations.map(d => d ? <option key={d} value={d}>{d}</option> : null)}
          </select>
        </div>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
