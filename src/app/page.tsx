"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Product, EmployeeLedgerEntry } from "../lib/types";

type DailyLogEntry = {
  employeeName: string;
  meters: Record<string, string>;
  date: string;
  grandTotal: number;
};
type DailyLogs = Record<string, DailyLogEntry[]>;

// Helper to get products from localStorage
function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-products");
  return data ? JSON.parse(data) : [];
}

// Helper to get/set employee name history
function getEmployeeNameHistory(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-employee-name-history");
  return data ? JSON.parse(data) : [];
}
function saveEmployeeNameHistory(names: string[]) {
  localStorage.setItem("wagewise-employee-name-history", JSON.stringify(names.slice(0, 20)));
}

// Helper to get/set daily logs
function getDailyLogs(): DailyLogs {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem("wagewise-daily-logs");
  return data ? JSON.parse(data) : {};
}
function saveDailyLogs(logs: DailyLogs) {
  localStorage.setItem("wagewise-daily-logs", JSON.stringify(logs));
}

// Helper to get/set employee ledger
function getLedger(): EmployeeLedgerEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-employee-ledger");
  return data ? JSON.parse(data) : [];
}
function saveLedger(entries: EmployeeLedgerEntry[]) {
  localStorage.setItem("wagewise-employee-ledger", JSON.stringify(entries));
}

// Helper to format currency
function formatINR(amount: number) {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
}

export default function DailyLogPage() {
  const router = useRouter();
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  // State for date (default today, yyyy-MM-dd)
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // State for employee name
  const [employeeName, setEmployeeName] = useState("");
  // State for meter values (productId -> meter)
  const [meters, setMeters] = useState<{ [id: string]: string }>({});
  // State for employee name history
  const [nameHistory, setNameHistory] = useState<string[]>([]);
  // State for toast message
  const [toast, setToast] = useState<string | null>(null);

  // Load products and name history on mount
  useEffect(() => {
    setProducts(getProducts());
    setNameHistory(getEmployeeNameHistory());
  }, []);

  // Load saved meters for selected date and employee
  useEffect(() => {
    const logs = getDailyLogs();
    const entry = logs[date]?.find((e: DailyLogEntry) => e.employeeName === employeeName);
    if (entry && entry.meters) {
      setMeters(entry.meters);
    } else {
      setMeters({});
    }
  }, [date, employeeName]);

  // Handle meter input change
  function handleMeterChange(productId: string, value: string) {
    setMeters(m => ({ ...m, [productId]: value }));
  }

  // Calculate totals
  const rowTotals = products.map(p => {
    const meter = parseFloat(meters[p.id] || "0");
    return isNaN(meter) ? 0 : meter * p.rate;
  });
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  // Handle reset meters
  function handleResetMeters() {
    setMeters({});
    setToast("All meters reset.");
  }

  // Handle save entries
  function handleSaveEntries() {
    if (!employeeName.trim()) {
      setToast("Please enter employee name.");
      return;
    }
    // Save to daily logs
    const logs = getDailyLogs();
    const entry = {
      employeeName: employeeName.trim(),
      meters,
      date,
      grandTotal,
    };
    logs[date] = logs[date]?.filter((e: DailyLogEntry) => e.employeeName !== employeeName) || [];
    logs[date].push(entry);
    saveDailyLogs(logs);
    // Save employee name to history
    let history = getEmployeeNameHistory();
    history = [employeeName.trim(), ...history.filter(n => n !== employeeName.trim())];
    saveEmployeeNameHistory(history);
    setNameHistory(history);
    // --- Add/update Employee Ledger entry ---
    const ledger = getLedger();
    // Check if entry for this date and employee exists
    const idx = ledger.findIndex((e: EmployeeLedgerEntry) => e.date === date && e.employeeName === employeeName.trim());
    const newLedgerEntry = {
      id: idx !== -1 ? ledger[idx].id : uuidv4(),
      date,
      employeeName: employeeName.trim(),
      totalAmount: grandTotal,
      advanceAmount: idx !== -1 ? ledger[idx].advanceAmount : 0,
      repayAmount: idx !== -1 ? ledger[idx].repayAmount : 0,
      balanceAmount: grandTotal - (idx !== -1 ? ledger[idx].advanceAmount : 0) - (idx !== -1 ? ledger[idx].repayAmount : 0),
    };
    if (idx !== -1) {
      ledger[idx] = newLedgerEntry;
    } else {
      ledger.push(newLedgerEntry);
    }
    saveLedger(ledger);
    // --- End Employee Ledger update ---
    setToast("Entries saved.");
  }

  // Format date for display (dd/MM/yyyy)
  function formatDateDisplay(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  }

  // Dismiss toast after 2s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // If no products, show empty state
  if (products.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded shadow mt-8">
        <h2 className="text-lg font-semibold mb-2">No products defined</h2>
        <p className="mb-2">You need to add products before logging work entries.</p>
        <button
          className="text-blue-600 underline"
          onClick={() => router.push("/products")}
        >
          Go to Products Page
        </button>
      </div>
    );
  }

  // Card header style
  const cardHeader = "flex items-center gap-2 border-l-4 border-blue-600 dark:border-blue-400 bg-gray-100 dark:bg-gray-800 rounded-t px-4 py-2 mb-4";

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-blue-700 dark:text-blue-400">Daily Work Log</h1>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Entries for {formatDateDisplay(date)}</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pb-2">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Enter meter readings for each product below. Totals are calculated automatically.</p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
              placeholder="Enter Employee Name"
              list="employee-names"
              value={employeeName}
              onChange={e => setEmployeeName(e.target.value)}
            />
            <datalist id="employee-names">
              {nameHistory.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="overflow-x-auto px-6">
          <table className="min-w-full border text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">PRODUCT</th>
                <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">RATE (₹)</th>
                <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">METER</th>
                <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">TOTAL (₹)</th>
                <th className="px-4 py-2 text-center font-semibold tracking-wide text-gray-900 dark:text-gray-100">EDIT</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product.id} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.name}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.rate.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="w-24 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                      value={meters[product.id] || "0"}
                      min={0}
                      step={0.01}
                      onChange={e => handleMeterChange(product.id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 font-semibold text-blue-700 dark:text-blue-400">{formatINR(rowTotals[idx])}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit Product"
                      onClick={() => router.push("/products")}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 dark:bg-gray-800 font-bold text-base">
                <td colSpan={3} className="px-4 py-2 text-right tracking-wider text-gray-900 dark:text-gray-100">GRAND TOTAL</td>
                <td className="px-4 py-2 text-blue-700 dark:text-blue-400">{formatINR(grandTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex gap-2 justify-end mt-6 px-6 pb-4">
          <button
            className="bg-red-600 dark:bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 dark:hover:bg-red-400 font-semibold transition"
            onClick={handleResetMeters}
          >
            Reset All Meters
          </button>
          <button
            className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-400 font-semibold transition"
            onClick={handleSaveEntries}
          >
            Save Entries
          </button>
        </div>
      </div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="font-bold">✔</span> {toast}
        </div>
      )}
    </div>
  );
}
