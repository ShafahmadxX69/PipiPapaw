/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';
import { ShippingRecord } from '../types';

interface ShippingChartsProps {
  data: ShippingRecord[];
  isDetailed?: boolean;
}

export default function ShippingCharts({ data, isDetailed = false }: ShippingChartsProps) {
  // Aggregate by Destination
  const destDataMap = data.reduce((acc, curr) => {
    const dest = curr.destination || 'Other';
    acc[dest] = (acc[dest] || 0) + curr.quantity;
    return acc;
  }, {} as Record<string, number>);

  const destChartData = Object.entries(destDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Aggregate by Brand
  const brandDataMap = data.reduce((acc, curr) => {
    const brand = curr.brand || 'No Brand';
    acc[brand] = (acc[brand] || 0) + curr.quantity;
    return acc;
  }, {} as Record<string, number>);

  const brandChartData = Object.entries(brandDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  return (
    <div className="space-y-12">
      <div className="h-[300px] w-full">
        <p className="mb-4 text-sm font-medium text-gray-500 uppercase">Total Qty by Destination (Top 10)</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={destChartData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              width={100}
              tick={{ fill: '#475569', fontWeight: 500 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
            <Bar dataKey="value" name="Shipped Qty" radius={[0, 4, 4, 0]}>
               {destChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {isDetailed && (
        <div className="h-[300px] w-full mt-10">
          <p className="mb-4 text-sm font-medium text-gray-500 uppercase">Export Volume by Brand</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brandChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" name="Total Quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
