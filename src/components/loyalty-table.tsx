"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  TRAVELERS,
  getTravelerMeta,
} from "@/lib/constants";
import type { LoyaltyCategory, LoyaltyNumber } from "@/lib/supabase/types";

const CATEGORY_ORDER: LoyaltyCategory[] = [
  "airline",
  "hotel",
  "known_traveler",
  "other",
];

const CATEGORY_LABELS: Record<LoyaltyCategory, string> = {
  airline: "Airlines",
  hotel: "Hotels",
  known_traveler: "Known Traveler / TSA",
  credit_card: "Credit Cards",
  other: "Other",
};

interface LoyaltyTableProps {
  rows: LoyaltyNumber[];
  onChange: () => void;
}

function maskNumber(n: string): string {
  if (n.length <= 4) return "•".repeat(n.length);
  return "•".repeat(Math.max(4, n.length - 4)) + n.slice(-4);
}

interface RowProps {
  row: LoyaltyNumber;
  onChange: () => void;
}

function LoyaltyRow({ row, onChange }: RowProps) {
  const [number, setNumber] = useState(row.number ?? "");
  const [program, setProgram] = useState(row.program_name);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const programRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = programRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [program]);

  const save = async (patch: Partial<LoyaltyNumber>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/loyalty/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      toast.error("Couldn't save — try again.");
      onChange();
    } finally {
      setSaving(false);
    }
  };

  const handleNumberBlur = () => {
    const next = number.trim();
    const prev = (row.number ?? "").trim();
    if (next === prev) return;
    save({ number: next || null });
  };

  const handleProgramBlur = () => {
    const next = program.trim();
    if (!next) {
      setProgram(row.program_name);
      return;
    }
    if (next === row.program_name) return;
    save({ program_name: next });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${row.program_name}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/loyalty/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onChange();
    } catch {
      toast.error("Couldn't delete — try again.");
      setSaving(false);
    }
  };

  const hasNumber = number.trim().length > 0;
  const display = revealed || !hasNumber ? number : maskNumber(number);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 12px",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 1px 2px rgba(26,26,46,.05)",
        opacity: saving ? 0.65 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <textarea
          ref={programRef}
          value={program}
          onChange={(e) => setProgram(e.target.value.replace(/\n/g, ""))}
          onBlur={handleProgramBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              programRef.current?.blur();
            }
          }}
          rows={1}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            fontWeight: 600,
            color: "#2B1810",
            fontFamily: "inherit",
            lineHeight: 1.3,
            resize: "none",
            overflow: "hidden",
            padding: 0,
            minWidth: 0,
            wordBreak: "break-word",
          }}
        />
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete row"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#C41E3A",
            padding: 2,
            display: "inline-flex",
            flex: "0 0 auto",
          }}
        >
          <Trash2 style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={revealed ? number : display}
          onChange={(e) => {
            setNumber(e.target.value);
            if (!revealed) setRevealed(true);
          }}
          onBlur={handleNumberBlur}
          placeholder="Add number"
          style={{
            flex: 1,
            border: "1px dashed #D9CFC2",
            background: "#FBF6EC",
            borderRadius: 6,
            padding: "6px 8px",
            fontSize: 14,
            color: "#2B1810",
            outline: "none",
            fontFamily: "inherit",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: revealed || !hasNumber ? "normal" : "0.05em",
            minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide number" : "Reveal number"}
          disabled={!hasNumber}
          style={{
            border: "none",
            background: "transparent",
            cursor: hasNumber ? "pointer" : "default",
            color: hasNumber ? "#6B3410" : "#D9CFC2",
            padding: 6,
            display: "inline-flex",
            flex: "0 0 auto",
          }}
        >
          {revealed ? (
            <EyeOff style={{ width: 16, height: 16 }} />
          ) : (
            <Eye style={{ width: 16, height: 16 }} />
          )}
        </button>
      </div>
    </div>
  );
}

interface AddRowProps {
  traveler: string;
  category: LoyaltyCategory;
  onAdded: () => void;
}

function AddRow({ traveler, category, onAdded }: AddRowProps) {
  const [open, setOpen] = useState(false);
  const [program, setProgram] = useState("");
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const p = program.trim();
    if (!p) {
      toast.error("Program name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traveler_name: traveler,
          category,
          program_name: p,
          number: number.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      setProgram("");
      setNumber("");
      setOpen(false);
      onAdded();
    } catch {
      toast.error("Couldn't add — try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: "1px dashed #D9CFC2",
          background: "transparent",
          color: "#6B3410",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Plus style={{ width: 14, height: 14 }} />
        Add {CATEGORY_LABELS[category].toLowerCase()}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto auto",
        gap: 8,
        padding: "10px 12px",
        background: "#FBF6EC",
        borderRadius: 10,
        border: "1px dashed #D9CFC2",
      }}
    >
      <input
        type="text"
        value={program}
        onChange={(e) => setProgram(e.target.value)}
        placeholder="Program name"
        autoFocus
        style={{
          border: "1px solid #D9CFC2",
          background: "#fff",
          borderRadius: 6,
          padding: "6px 8px",
          fontSize: 14,
          color: "#2B1810",
          outline: "none",
          fontFamily: "inherit",
          minWidth: 0,
        }}
      />
      <input
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Number (optional)"
        style={{
          border: "1px solid #D9CFC2",
          background: "#fff",
          borderRadius: 6,
          padding: "6px 8px",
          fontSize: 14,
          color: "#2B1810",
          outline: "none",
          fontFamily: "inherit",
          fontVariantNumeric: "tabular-nums",
          minWidth: 0,
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        style={{
          border: "none",
          background: "#6B3410",
          color: "#F5E9C8",
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setProgram("");
          setNumber("");
        }}
        style={{
          border: "none",
          background: "transparent",
          color: "#8C7B6A",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export function LoyaltyTable({ rows, onChange }: LoyaltyTableProps) {
  const byTraveler = new Map<string, LoyaltyNumber[]>();
  for (const r of rows) {
    const list = byTraveler.get(r.traveler_name) ?? [];
    list.push(r);
    byTraveler.set(r.traveler_name, list);
  }
  const known = new Set(TRAVELERS as readonly string[]);
  const order: string[] = [
    ...TRAVELERS,
    ...Array.from(byTraveler.keys()).filter((n) => !known.has(n)).sort(),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {order.map((traveler) => {
        const meta = getTravelerMeta(traveler);
        const list = byTraveler.get(traveler) ?? [];
        const byCat = new Map<LoyaltyCategory, LoyaltyNumber[]>();
        for (const r of list) {
          const arr = byCat.get(r.category) ?? [];
          arr.push(r);
          byCat.set(r.category, arr);
        }

        return (
          <section key={traveler}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: meta.color,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {meta.initial}
              </span>
              <h2
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#2B1810",
                }}
              >
                {traveler}
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {CATEGORY_ORDER.map((cat) => {
                const items = byCat.get(cat) ?? [];
                if (items.length === 0) {
                  // Render the "Add row" anchor so empty categories are still discoverable
                  // but only for categories with no items at all — keeps the page tidy.
                  return (
                    <div key={cat}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#8C7B6A",
                          marginBottom: 6,
                        }}
                      >
                        {CATEGORY_LABELS[cat]}
                      </div>
                      <AddRow
                        traveler={traveler}
                        category={cat}
                        onAdded={onChange}
                      />
                    </div>
                  );
                }
                return (
                  <div key={cat}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#8C7B6A",
                        marginBottom: 6,
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {items.map((row) => (
                        <LoyaltyRow
                          key={row.id}
                          row={row}
                          onChange={onChange}
                        />
                      ))}
                      <div style={{ marginTop: 4 }}>
                        <AddRow
                          traveler={traveler}
                          category={cat}
                          onAdded={onChange}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
