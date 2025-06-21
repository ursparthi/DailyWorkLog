"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Save, X, RefreshCw } from "lucide-react";
import type { EmployeeLedgerEntry } from "../../lib/types";

// Add Employee interface
interface Employee {
  id: string;
  name: string;
  classType: "A" | "B" | "C" | "D";
  phone: string;
}

// Helper to get ledger entries from localStorage
function getLedger(): EmployeeLedgerEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-employee-ledger");
  return data ? JSON.parse(data) : [];
}
// Helper to save ledger entries
function saveLedger(entries: EmployeeLedgerEntry[]) {
  localStorage.setItem("wagewise-employee-ledger", JSON.stringify(entries));
}
// Helper to format currency
function formatINR(amount: number) {
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
}
// Helper to get employees from localStorage
function getEmployees() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-employees");
  return data ? JSON.parse(data) : [];
}

export default function EmployeeLedgerPage() {
  // State for ledger entries
  const [entries, setEntries] = useState<EmployeeLedgerEntry[]>([]);
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  // State for editing (row id)
  const [editingId, setEditingId] = useState<string | null>(null);
  // State for edit fields
  const [editFields, setEditFields] = useState<{ name: string; wage: string }>({ name: "", wage: "" });
  // State for delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State for clear all confirmation
  const [clearAll, setClearAll] = useState(false);
  // State for toast message
  const [toast, setToast] = useState<string | null>(null);

  // Load ledger entries on mount
  useEffect(() => {
    setEntries(getLedger());
    setEmployees(getEmployees());
  }, []);

  // Handle advance/repay change
  function handleAmountChange(id: string, field: "advanceAmount" | "repayAmount", value: string) {
    const updated = entries.map(e =>
      e.id === id
        ? {
            ...e,
            [field]: parseFloat(value) || 0,
            balanceAmount: e.totalAmount - (field === "advanceAmount" ? parseFloat(value) || 0 : e.advanceAmount) - (field === "repayAmount" ? parseFloat(value) || 0 : e.repayAmount),
          }
        : e
    );
    setEntries(updated);
    saveLedger(updated);
  }

  // Handle edit action
  function handleEdit(id: string) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setEditingId(id);
      setEditFields({ name: entry.employeeName || "", wage: entry.totalAmount.toString() });
    }
  }
  // Handle save edit
  function handleSaveEdit(id: string) {
    const updated = entries.map(e =>
      e.id === id
        ? {
            ...e,
            employeeName: editFields.name,
            totalAmount: parseFloat(editFields.wage) || 0,
            balanceAmount: (parseFloat(editFields.wage) || 0) - e.advanceAmount - e.repayAmount,
          }
        : e
    );
    setEntries(updated);
    saveLedger(updated);
    setEditingId(null);
    setToast("Entry updated.");
  }
  // Handle cancel edit
  function handleCancelEdit() {
    setEditingId(null);
  }
  // Handle delete entry
  function handleDelete(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveLedger(updated);
    setDeleteId(null);
    setToast("Entry deleted.");
  }
  // Handle clear all
  function handleClearAll() {
    setEntries([]);
    saveLedger([]);
    setClearAll(false);
    setToast("All entries cleared.");
  }
  // Dismiss toast after 2s
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Calculate totals
  const totals = entries.reduce(
    (acc, e) => {
      acc.wage += e.totalAmount;
      acc.advance += e.advanceAmount;
      acc.repay += e.repayAmount;
      acc.balance += e.balanceAmount;
      return acc;
    },
    { wage: 0, advance: 0, repay: 0, balance: 0 }
  );

  const cardHeader = "flex items-center gap-2 border-l-4 border-blue-600 dark:border-blue-400 bg-gray-100 dark:bg-gray-800 rounded-t px-4 py-2 mb-4";

  // If no entries, show empty state
  if (entries.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-500 p-6 rounded shadow mt-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No ledger entries</h2>
        <p className="text-gray-700 dark:text-gray-300">Add daily work logs to see employee wage entries here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-blue-700 dark:text-blue-400">Employee Ledger</h1>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ledger Details</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">S/N</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">DATE</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">NAME</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">TOTAL WAGE (₹)</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">ADVANCE (₹)</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">REPAY (₹)</th>
                  <th className="px-4 py-2 font-semibold tracking-wide text-gray-900 dark:text-gray-100">BALANCE (₹)</th>
                  <th className="px-4 py-2 text-center font-semibold tracking-wide text-gray-900 dark:text-gray-100">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                    <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">{idx + 1}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{new Date(entry.date).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                          value={editFields.name}
                          onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
                        />
                      ) : (
                        <>
                          {entry.employeeName}
                          {(() => {
                            const emp = employees.find(e => e.name === entry.employeeName);
                            if (!emp) return null;
                            return (
                              <span
                                className={
                                  "ml-2 px-2 py-1 rounded text-xs font-bold " +
                                  (emp.classType === "A"
                                    ? "bg-blue-500 text-white"
                                    : emp.classType === "B"
                                    ? "bg-green-500 text-white"
                                    : emp.classType === "C"
                                    ? "bg-yellow-400 text-black"
                                    : "bg-red-500 text-white")
                                }
                              >
                                {emp.classType}
                              </span>
                            );
                          })()}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                          value={editFields.wage}
                          onChange={e => setEditFields(f => ({ ...f, wage: e.target.value }))}
                        />
                      ) : (
                        formatINR(entry.totalAmount)
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 w-24 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                        value={entry.advanceAmount}
                        min={0}
                        step={0.01}
                        onChange={e => handleAmountChange(entry.id, "advanceAmount", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 w-24 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                        value={entry.repayAmount}
                        min={0}
                        step={0.01}
                        onChange={e => handleAmountChange(entry.id, "repayAmount", e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold text-blue-700 dark:text-blue-400">{formatINR(entry.balanceAmount)}</td>
                    <td className="px-4 py-2 text-center">
                      {editingId === entry.id ? (
                        <>
                          <button
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Save"
                            onClick={() => handleSaveEdit(entry.id)}
                          >
                            <Save size={16} />
                          </button>
                          <button
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Cancel"
                            onClick={handleCancelEdit}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit"
                            onClick={() => handleEdit(entry.id)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                            onClick={() => setDeleteId(entry.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* Delete confirmation dialog */}
                          {deleteId === entry.id && (
                            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                              <div className="bg-white dark:bg-zinc-900 rounded shadow p-6 max-w-xs w-full">
                                <div className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to delete this entry?</div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    onClick={() => setDeleteId(null)}
                                  >Cancel</button>
                                  <button
                                    className="px-3 py-1 rounded bg-red-600 dark:bg-red-500 text-white"
                                    onClick={() => handleDelete(entry.id)}
                                  >Delete</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 dark:bg-gray-800 font-bold text-base">
                  <td colSpan={3} className="px-4 py-2 text-right tracking-wider text-gray-900 dark:text-gray-100">TOTALS</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{formatINR(totals.wage)}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{formatINR(totals.advance)}</td>
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{formatINR(totals.repay)}</td>
                  <td className="px-4 py-2 text-blue-700 dark:text-blue-400">{formatINR(totals.balance)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      {/* Clear All Button at the bottom */}
      <div className="flex justify-end p-6">
        <button
          className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400 border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900 px-5 py-2 rounded-lg shadow hover:bg-green-100 dark:hover:bg-green-800 transition text-lg"
          onClick={() => setClearAll(true)}
        >
          <RefreshCw size={22} className="font-bold" /> CLEAR ALL
        </button>
      </div>
      {/* Clear all confirmation dialog */}
      {clearAll && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded shadow p-6 max-w-xs w-full">
            <div className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to clear all entries?</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onClick={() => setClearAll(false)}
              >Cancel</button>
              <button
                className="px-3 py-1 rounded bg-red-600 dark:bg-red-500 text-white"
                onClick={handleClearAll}
              >Clear All</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="font-bold">✔</span> {toast}
        </div>
      )}
    </div>
  );
} 