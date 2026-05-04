/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { ERPRecord, INRecord, ExpSchedRecord, ShippingRecord, DashboardData } from '../types';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

const fetchSheetCSV = async (gid: string): Promise<string> => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch sheet with GID: ${gid}. HTTP ${response.status}`);
  return await response.text();
};

const parseNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const transformERP = (data: any[]): ERPRecord[] => {
  // ERP starts from row 6.
  return data.slice(5).map(row => {
    const remark = String(row[16] || '').toUpperCase();
    const isFinished = remark.includes('DONE') || remark.includes('FINISHED');
    
    return {
      date: String(row[2] || ''),
      soNo: String(row[5] || ''),
      woNo: String(row[6] || ''),
      productCode: String(row[7] || ''),
      nameSpec: String(row[8] || ''),
      orderQty: parseNumber(row[9]),
      totalProduction: parseNumber(row[10]),
      goodProduct: parseNumber(row[11]),
      rework: isFinished ? 0 : parseNumber(row[12]),
      sampleTestLab: String(row[13] || ''),
      remark: String(row[16] || ''),
      staff: String(row[17] || ''),
    };
  }).filter(r => r.soNo && r.date);
};

const transformIN = (data: any[]): INRecord[] => {
  // IN starts from row 6.
  return data.slice(5).map(row => ({
    soNo: String(row[0] || ''),
    woNo: String(row[1] || ''),
    productCode: String(row[2] || ''),
    customerBrand: String(row[3] || ''),
    model: String(row[4] || ''),
    size: String(row[5] || ''),
    nestedInfo: String(row[6] || ''),
    color: String(row[7] || ''),
    poQty: parseNumber(row[8]),
    inQty: parseNumber(row[9]),
    remaining: parseNumber(row[10]),
    readyForShipment: String(row[12] || ''),
    reworkQty: parseNumber(row[13]),
    erpQty: parseNumber(row[14]),
  })).filter(r => r.soNo);
};

const transformExpSched = (data: any[]): ExpSchedRecord[] => {
  // ExpSched starts from row 2/4.
  return data.slice(3).map(row => ({
    customerBrand: String(row[1] || ''),
    destination: String(row[3] || ''),
    invoiceNo: String(row[5] || ''),
    stuffingDate: String(row[17] || ''),
    containerType: String(row[18] || ''),
  })).filter(r => r.invoiceNo);
};

const transformShipping = (data: any[]): ShippingRecord[] => {
  // Shipping Record starts from row 2/4.
  return data.slice(3).map(row => ({
    shippingDate: String(row[1] || ''),
    poNo: String(row[2] || ''),
    customer: String(row[3] || ''),
    containerType: String(row[4] || ''),
    destination: String(row[6] || ''),
    invoiceNo: String(row[7] || ''),
    brand: String(row[8] || ''),
    modelName: String(row[9] || ''),
    quantity: parseNumber(row[11]),
  })).filter(r => r.invoiceNo);
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const [erpCSV, inCSV, expCSV, shipCSV] = await Promise.all([
    fetchSheetCSV('1158274905'), // ERP GID
    fetchSheetCSV('1100244896'), // IN GID
    fetchSheetCSV('359974075'),  // ExpSched GID
    fetchSheetCSV('1531796478'), // Shipping Record GID
  ]);

  const erpParsed = Papa.parse(erpCSV).data;
  const inParsed = Papa.parse(inCSV).data;
  const expParsed = Papa.parse(expCSV).data;
  const shipParsed = Papa.parse(shipCSV).data;

  return {
    erp: transformERP(erpParsed),
    in: transformIN(inParsed),
    expSched: transformExpSched(expParsed),
    shipping: transformShipping(shipParsed),
  };
};
