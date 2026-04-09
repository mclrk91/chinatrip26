"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Edit3, X, Check, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/bottom-nav";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  notes: string | null;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  Documents: "📄",
  Health: "🏥",
  Technology: "📱",
  Money: "💰",
  Packing: "🧳",
  Transportation: "✈️",
};

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState("Documents");
  const [newItem, setNewItem] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/checklist");
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch {
      toast.error("Failed to load checklist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const generateChecklist = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/checklist/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setItems(data);
        toast.success("Checklist generated!");
      } else if (data.message) {
        toast.info(data.message);
        fetchItems();
      } else {
        toast.error("Failed to generate checklist");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setGenerating(false);
    }
  };

  const toggleItem = async (item: ChecklistItem) => {
    const newChecked = !item.checked;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))
    );

    try {
      const res = await fetch(`/api/checklist/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: newChecked }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, checked: !newChecked } : i))
      );
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/checklist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Item deleted");
    } catch {
      fetchItems();
      toast.error("Failed to delete item");
    }
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, item: editText.trim() } : i))
    );
    setEditingItem(null);

    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: editText.trim() }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchItems();
      toast.error("Failed to update item");
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          item: newItem.trim(),
          checked: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [...prev, data]);
        setNewItem("");
        setShowAddForm(false);
        toast.success("Item added!");
      }
    } catch {
      toast.error("Failed to add item");
    }
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  // Group by category
  const categories = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold">
            <span className="text-china-red">Pre-Trip</span>{" "}
            <span className="text-muted-foreground font-normal">Checklist</span>
          </h1>
        </header>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-china-red" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Pre-Trip</span>{" "}
          <span className="text-muted-foreground font-normal">Checklist</span>
        </h1>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{progress}% complete</span>
              <span className="text-sm text-muted-foreground">
                {checkedItems} of {totalItems} items
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-china-red h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          {totalItems === 0 && (
            <button
              onClick={generateChecklist}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 bg-china-red text-white rounded-lg px-4 py-3 font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckSquare className="h-5 w-5" />
              )}
              {generating ? "Generating..." : "Generate Checklist"}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-china-red"
                >
                  {Object.keys(CATEGORY_ICONS).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Item</label>
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="e.g., Download offline maps"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-china-red"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  disabled={!newItem.trim()}
                  className="flex-1 bg-china-red text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem("");
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Categories */}
        <div className="space-y-3">
          {Object.entries(categories).map(([category, categoryItems]) => {
            const isCollapsed = collapsedCategories.has(category);
            const catChecked = categoryItems.filter((i) => i.checked).length;
            const catTotal = categoryItems.length;

            return (
              <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-lg">{CATEGORY_ICONS[category] || "📋"}</span>
                    <span className="font-semibold text-sm">{category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {catChecked}/{catTotal}
                  </span>
                </button>

                {/* Category Items */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 group"
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(item)}
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.checked
                              ? "bg-china-red border-china-red"
                              : "border-gray-300 hover:border-china-red"
                          }`}
                        >
                          {item.checked && <Check className="h-3 w-3 text-white" />}
                        </button>

                        {/* Item Text */}
                        <div className="flex-1 min-w-0">
                          {editingItem === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(item.id);
                                  if (e.key === "Escape") setEditingItem(null);
                                }}
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-china-red"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(item.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <p
                              className={`text-sm leading-relaxed ${
                                item.checked ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {item.item}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {editingItem !== item.id && (
                          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingItem(item.id);
                                setEditText(item.item);
                              }}
                              className="p-1 text-gray-400 hover:text-china-red hover:bg-gray-50 rounded"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalItems === 0 && !showAddForm && (
          <div className="text-center py-16">
            <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-muted-foreground mb-1">No checklist items yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a checklist or add items manually
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
