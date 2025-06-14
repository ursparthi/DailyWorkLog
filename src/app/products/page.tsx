"use client";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Trash2, PlusCircle } from "lucide-react";
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

  // Load products from localStorage on mount
  useEffect(() => {
    setProducts(getProducts());
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

  const cardHeader = "flex items-center gap-2 border-l-4 border-[hsl(var(--primary))] bg-[hsl(var(--muted))] rounded-t px-4 py-2 mb-4";

  return (
    <div className="space-y-10">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-xl font-bold">Add New Product</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            Define a new product type and its rate for wage calculation.
          </p>
          <form onSubmit={handleAddProduct} className="space-y-4 max-w-xl">
            <div>
              <input
                type="text"
                placeholder="e.g., Bricks, Tiles"
                className="w-full border rounded px-3 py-2 bg-[hsl(var(--input))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
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
                className="w-full border rounded px-3 py-2 bg-[hsl(var(--input))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                value={rate}
                onChange={e => setRate(e.target.value)}
                min={0}
                step={0.01}
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-5 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold transition"
            >
              <PlusCircle size={18} /> Add Product
            </button>
          </form>
        </div>
      </div>
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-lg p-0 overflow-hidden">
        <div className={cardHeader}>
          <h2 className="text-lg font-bold">Existing Products</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            List of currently defined products and their rates.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-[hsl(var(--muted))]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">Name</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">Rate (per unit)</th>
                  <th className="px-4 py-2 text-center font-semibold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-[hsl(var(--muted-foreground))]">
                      No products defined yet.
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-[hsl(var(--muted))]"}>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.rate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          className="text-red-600 hover:text-red-800 p-2 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--destructive)/0.1)]"
                          title="Delete"
                          onClick={() => setDeleteId(product.id)}
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                        {/* Delete confirmation dialog */}
                        {deleteId === product.id && (
                          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                            <div className="bg-white rounded shadow p-6 max-w-xs w-full">
                              <div className="mb-4">Are you sure you want to delete <b>{product.name}</b>?</div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  className="px-3 py-1 rounded bg-[hsl(var(--muted))]"
                                  onClick={() => setDeleteId(null)}
                                >Cancel</button>
                                <button
                                  className="px-3 py-1 rounded bg-[hsl(var(--destructive))] text-white"
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
    </div>
  );
} 