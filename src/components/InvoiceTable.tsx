/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShippingRecord } from '../types';
import { formatNumber } from '../lib/utils';

interface InvoiceTableProps {
  data: ShippingRecord[];
}

export default function InvoiceTable({ data }: InvoiceTableProps) {
  // Aggregate data by Invoice No
  const invoiceGroups = data.reduce((acc, curr) => {
    const inv = curr.invoiceNo;
    if (!acc[inv]) {
      acc[inv] = {
        invoiceNo: inv,
        destination: curr.destination,
        containerType: curr.containerType,
        totalQty: 0,
        models: {} as Record<string, number>,
      };
    }
    acc[inv].totalQty += curr.quantity;
    acc[inv].models[curr.modelName] = (acc[inv].models[curr.modelName] || 0) + curr.quantity;
    return acc;
  }, {} as Record<string, any>);

  const invoices = Object.values(invoiceGroups).sort((a, b) => b.totalQty - a.totalQty);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-4">Invoice No</th>
            <th className="px-6 py-4">Destination</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4 text-right">Total Qty</th>
            <th className="px-6 py-4">Model Breakdown</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {invoices.map((inv, idx) => (
            <tr key={idx} className="transition-colors hover:bg-gray-50/50">
              <td className="px-6 py-4 font-bold text-gray-900">{inv.invoiceNo}</td>
              <td className="px-6 py-4">{inv.destination}</td>
              <td className="px-6 py-4">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {inv.containerType}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600">{formatNumber(inv.totalQty)}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(inv.models).map(([model, qty]: any) => (
                    <div key={model} className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
                      <span className="font-semibold">{model}:</span>
                      <span>{qty}</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
