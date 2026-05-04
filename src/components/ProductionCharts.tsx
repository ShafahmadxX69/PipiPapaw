/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { UnifiedOrder } from '../types';
import { format } from 'date-fns';

interface ProductionChartsProps {
  data: UnifiedOrder[];
}

export default function ProductionCharts({ data }: ProductionChartsProps) {
  // Aggregate by Date
  const aggregatedData = data.reduce((acc, curr) => {
    const day = curr.date;
    if (!acc[day]) acc[day] = { date: day, target: 0, produced: 0, good: 0 };
    acc[day].target += curr.targetQty;
    acc[day].produced += curr.producedQty;
    acc[day].good += curr.goodQty;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(aggregatedData).sort((a, b) => {
    // Simple sort for date strings DD/MM/YYYY
    const [ad, am, ay] = a.date.split('/').map(Number);
    const [bd, bm, by] = b.date.split('/').map(Number);
    return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime();
  });

  // Pie chart for Good vs Rework
  const totalGood = data.reduce((sum, item) => sum + item.goodQty, 0);
  const totalRework = data.reduce((sum, item) => sum + item.reworkQty, 0);
  const pieData = [
    { name: 'Good Product', value: totalGood, color: '#10b981' },
    { name: 'Rework', value: totalRework, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-12">
      <div className="h-[300px] w-full">
        <p className="mb-4 text-sm font-medium text-gray-500 uppercase">Production vs Target (Daily)</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748b' }} 
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748b' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Bar dataKey="target" fill="#e2e8f0" name="Target Qty" radius={[4, 4, 0, 0]} />
            <Bar dataKey="produced" fill="#4f46e5" name="Produced Qty" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[250px]">
        <div className="h-full">
          <p className="mb-4 text-sm font-medium text-gray-500 uppercase">Production Quality Rate</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col justify-center space-y-4 px-6 border-l border-gray-100">
           <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Good Quality Rate</p>
              <p className="text-2xl font-black text-emerald-600">
                {totalGood + totalRework > 0 ? ((totalGood / (totalGood + totalRework)) * 100).toFixed(1) : 0}%
              </p>
           </div>
           <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Overall Waste Rate</p>
              <p className="text-2xl font-black text-amber-600">
                {totalGood + totalRework > 0 ? ((totalRework / (totalGood + totalRework)) * 100).toFixed(1) : 0}%
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
