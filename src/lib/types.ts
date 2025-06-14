export type Product = {
  id: string;
  name: string;
  rate: number;
};

export type DailyLogEntry = {
  id: string;
  productId: string;
  productName?: string;
  productRate?: number;
  meter: number;
};

export type EmployeeLedgerEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  employeeName?: string;
  totalAmount: number;
  advanceAmount: number;
  repayAmount: number;
  balanceAmount: number;
}; 