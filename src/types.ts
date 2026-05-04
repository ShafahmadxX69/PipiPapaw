/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ERPRecord {
  date: string; // Column C
  soNo: string; // Column F
  woNo: string; // Column G
  productCode: string; // Column H
  nameSpec: string; // Column I
  orderQty: number; // Column J
  totalProduction: number; // Column K
  goodProduct: number; // Column L
  rework: number; // Column M
  sampleTestLab: string; // Column N
  remark: string; // Column Q
  staff: string; // Column R
}

export interface INRecord {
  soNo: string; // Column A
  woNo: string; // Column B
  productCode: string; // Column C
  customerBrand: string; // Column D
  model: string; // Column E
  size: string; // Column F
  nestedInfo: string; // Column G
  color: string; // Column H
  poQty: number; // Column I
  inQty: number; // Column J
  remaining: number; // Column K
  readyForShipment: string; // Column M
  reworkQty: number; // Column N
  erpQty: number; // Column O
}

export interface ExpSchedRecord {
  customerBrand: string; // Column B
  destination: string; // Column D
  invoiceNo: string; // Column F
  stuffingDate: string; // Column R
  containerType: string; // Column S
}

export interface ShippingRecord {
  shippingDate: string; // Column B
  poNo: string; // Column C
  customer: string; // Column D
  containerType: string; // Column E
  destination: string; // Column G
  invoiceNo: string; // Column H
  brand: string; // Column I
  modelName: string; // Column J
  quantity: number; // Column L
}

export interface DashboardData {
  erp: ERPRecord[];
  in: INRecord[];
  expSched: ExpSchedRecord[];
  shipping: ShippingRecord[];
}

export interface UnifiedOrder {
  soNo: string;
  woNo: string;
  productCode: string;
  date: string;
  brand: string;
  model: string;
  size: string;
  color: string;
  targetQty: number;
  producedQty: number;
  goodQty: number;
  reworkQty: number;
  achievement: number;
  goodRate: number;
  reworkRate: number;
  status: string;
}

export interface FilterState {
  dateRange: [Date | null, Date | null];
  brand: string;
  soNo: string;
  woNo: string;
  model: string;
  destination: string;
}
