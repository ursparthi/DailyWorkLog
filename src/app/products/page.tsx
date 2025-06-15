"use client";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Trash2, PlusCircle, Save, Pencil, X } from "lucide-react";
import type { Product } from "../../lib/types";

// Helper to get products from localStorage
function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-products");
  return data ? JSON.parse(data) : [];
}

// Helper to save products to localStorage
function saveProducts(products: Product[]) {
  localStorage.setItem("wagewise-products", JSON.stringify(products));
}

// Employee type
interface Employee {
  id: string;
  name: string;
  classType: "A" | "B" | "C" | "D";
  phone: string;
}

// Helper to get employees from localStorage
function getEmployees(): Employee[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("wagewise-employees");
  return data ? JSON.parse(data) : [];
}

// Helper to save employees to localStorage
function saveEmployees(employees: Employee[]) {
  localStorage.setItem("wagewise-employees", JSON.stringify(employees));
}

export default function ProductsPage() {
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  // State for form inputs
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  // State for validation messages
  const [error, setError] = useState("");
  // State for delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmp, setNewEmp] = useState<{ name: string; classType: "A" | "B" | "C" | "D"; phone: string }>({ name: "", classType: "A", phone: "" });
  const [addingNewEmp, setAddingNewEmp] = useState(false);
  const [editEmpId, setEditEmpId] = useState<string | null>(null);
  const [editEmp, setEditEmp] = useState<{ name: string; classType: "A" | "B" | "C" | "D"; phone: string }>({ name: "", classType: "A", phone: "" });

  // Load products from localStorage on mount
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  // Load employees from localStorage on mount
  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  // Handle add product
  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (name.length > 50) {
      setError("Product name must be 50 characters or less.");
      return;
    }
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 0) {
      setError("Rate must be a positive number.");
      return;
    }
    // Check for duplicate name
    if (products.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("Product name already exists.");
      return;
    }
    const newProduct: Product = {
      id: uuidv4(),
      name: name.trim(),
      rate: rateNum,
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveProducts(updated);
    setName("");
    setRate("");
  }

  // Handle delete product
  function handleDeleteProduct(id: string) {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    setDeleteId(null);
  }

  // Add employee
  function handleAddEmployee() {
    if (!newEmp.name.trim() || !newEmp.phone.trim()) return;
    const newEmployee: Employee = {
      id: uuidv4(),
      name: newEmp.name.trim(),
      classType: newEmp.classType,
      phone: newEmp.phone.trim(),
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    saveEmployees(updated);
    setNewEmp({ name: "", classType: "A", phone: "" });
    setAddingNewEmp(false);
  }

  function handleStartAddEmployee() {
    setNewEmp({ name: "", classType: "A", phone: "" });
    setAddingNewEmp(true);
  }

  function handleCancelAddEmployee() {
    setNewEmp({ name: "", classType: "A", phone: "" });
    setAddingNewEmp(false);
  }

  // Delete employee
  function handleDeleteEmployee(id: string) {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    saveEmployees(updated);
  }

  // Start editing
  function handleEditEmployee(id: string) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
      setEditEmpId(id);
      setEditEmp({ name: emp.name, classType: emp.classType, phone: emp.phone });
    }
  }

  // Save edit
  function handleSaveEditEmployee(id: string) {
    const updated = employees.map(e =>
      e.id === id ? { ...e, name: editEmp.name.trim(), classType: editEmp.classType, phone: editEmp.phone.trim() } : e
    );
    setEmployees(updated);
    saveEmployees(updated);
    setEditEmpId(null);
  }

  // Cancel edit
  function handleCancelEditEmployee() {
    setEditEmpId(null);
  }

  const cardHeader =
    "flex items-center gap-2 border-l-4 border-blue-600 dark:border-blue-400 bg-gray-100 dark:bg-gray-800 rounded-t px-4 py-2 mb-4";

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Product</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Define a new product type and its rate for wage calculation.
          </p>
          <form onSubmit={handleAddProduct} className="space-y-4 max-w-xl">
            <div>
              <input
                type="text"
                placeholder="e.g., Bricks, Tiles"
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                value={rate}
                onChange={e => setRate(e.target.value)}
                min={0}
                step={0.01}
                required
              />
            </div>
            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-400 font-semibold transition"
            >
              <PlusCircle size={18} /> Add Product
            </button>
          </form>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Existing Products</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            List of currently defined products and their rates.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">Name</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">Rate (per unit)</th>
                  <th className="px-4 py-2 text-center font-semibold tracking-wide text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400 dark:text-gray-500">
                      No products defined yet.
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr key={product.id} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.name}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{product.rate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                          onClick={() => setDeleteId(product.id)}
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                        {/* Delete confirmation dialog */}
                        {deleteId === product.id && (
                          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-zinc-900 rounded shadow p-6 max-w-xs w-full">
                              <div className="mb-4 text-gray-900 dark:text-gray-100">Are you sure you want to delete <b>{product.name}</b>?</div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                  onClick={() => setDeleteId(null)}
                                >Cancel</button>
                                <button
                                  className="px-3 py-1 rounded bg-red-600 dark:bg-red-500 text-white"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >Delete</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Employee Details Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Employee Details</h2>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Add and manage employee details below.</p>
            <button
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              onClick={handleStartAddEmployee}
              disabled={addingNewEmp}
            >
              <PlusCircle size={20} /> Add Employee
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">S/N</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">Name</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">Class</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide text-gray-900 dark:text-gray-100">Phone Number</th>
                  <th className="px-4 py-2 text-center font-semibold tracking-wide text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* New employee row */}
                {addingNewEmp && (
                  <tr className="bg-gray-50 dark:bg-zinc-800">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-semibold">{employees.length + 1}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                        placeholder="Name"
                        value={newEmp.name}
                        onChange={e => setNewEmp(emp => ({ ...emp, name: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                        value={newEmp.classType}
                        onChange={e => setNewEmp(emp => ({ ...emp, classType: e.target.value as "A" | "B" | "C" | "D" }))}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                        placeholder="Phone Number"
                        value={newEmp.phone}
                        onChange={e => setNewEmp(emp => ({ ...emp, phone: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-full"
                        title="Save"
                        onClick={handleAddEmployee}
                        disabled={!newEmp.name.trim() || !newEmp.phone.trim()}
                      >
                        <Save size={18} />
                      </button>
                      <button
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-2 rounded-full"
                        title="Cancel"
                        onClick={handleCancelAddEmployee}
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                )}
                {/* Existing employees */}
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 dark:text-gray-500">
                      No employees added yet.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, idx) => (
                    <tr key={emp.id} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {editEmpId === emp.id ? (
                          <input
                            type="text"
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            value={editEmp.name}
                            onChange={e => setEditEmp(ed => ({ ...ed, name: e.target.value }))}
                          />
                        ) : (
                          emp.name
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editEmpId === emp.id ? (
                          <select
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            value={editEmp.classType}
                            onChange={(e) => setEditEmp(ed => ({ ...ed, classType: e.target.value as "A" | "B" | "C" | "D" }))}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        ) : (
                          <span
                            className={
                              emp.classType === "A"
                                ? "inline-block px-2 py-1 rounded bg-blue-500 text-white text-xs font-bold"
                                : emp.classType === "B"
                                ? "inline-block px-2 py-1 rounded bg-green-500 text-white text-xs font-bold"
                                : emp.classType === "C"
                                ? "inline-block px-2 py-1 rounded bg-yellow-400 text-black text-xs font-bold"
                                : "inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-bold"
                            }
                          >
                            {emp.classType}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {editEmpId === emp.id ? (
                          <input
                            type="text"
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            value={editEmp.phone}
                            onChange={e => setEditEmp(ed => ({ ...ed, phone: e.target.value }))}
                          />
                        ) : (
                          emp.phone
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {editEmpId === emp.id ? (
                          <>
                            <button
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-full"
                              title="Save"
                              onClick={() => handleSaveEditEmployee(emp.id)}
                            >
                              <Save size={18} />
                            </button>
                            <button
                              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-2 rounded-full"
                              title="Cancel"
                              onClick={handleCancelEditEmployee}
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-full"
                              title="Edit"
                              onClick={() => handleEditEmployee(emp.id)}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full"
                              title="Delete"
                              onClick={() => handleDeleteEmployee(emp.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 