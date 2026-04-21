"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { DayNote } from "@/lib/supabase/types";

interface DayNotesProps {
  date: string;
  notes: DayNote[];
  onChange: () => void;
}

export function DayNotes({ date, notes, onChange }: DayNotesProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const handleAdd = async () => {
    const content = draft.trim();
    if (!content) {
      setAdding(false);
      setDraft("");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/day-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, content }),
      });
      if (!res.ok) throw new Error("save failed");
      setDraft("");
      setAdding(false);
      onChange();
    } catch {
      toast.error("Couldn't save note. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const content = editDraft.trim();
    if (!content) {
      setEditingId(null);
      setEditDraft("");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/day-notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("update failed");
      setEditingId(null);
      setEditDraft("");
      onChange();
    } catch {
      toast.error("Couldn't update note. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/day-notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      onChange();
    } catch {
      toast.error("Couldn't delete note. Try again.");
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: 6, marginTop: 8 }}>
      {notes.map((note) => {
        const isEditing = editingId === note.id;
        return (
          <div
            key={note.id}
            style={{
              background: "#FFF8EA",
              border: "1px solid #ECD9B3",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <StickyNote
              style={{ width: 14, height: 14, color: "#B8941F", marginTop: 3, flexShrink: 0 }}
            />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <Textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={3}
                    autoFocus
                    style={{ fontSize: 14 }}
                  />
                  <div className="flex" style={{ gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={saving}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#ffffff",
                        background: "#6B3410",
                        padding: "6px 12px",
                        borderRadius: 6,
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft("");
                      }}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6B3410",
                        background: "transparent",
                        padding: "6px 12px",
                        borderRadius: 6,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    color: "#2B1810",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {note.content}
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="flex" style={{ gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label="Edit note"
                  onClick={() => {
                    setEditingId(note.id);
                    setEditDraft(note.content);
                  }}
                  style={{ padding: 4, color: "#8C7B6A" }}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                </button>
                <button
                  type="button"
                  aria-label="Delete note"
                  onClick={() => handleDelete(note.id)}
                  style={{ padding: 4, color: "#C96F3B" }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <div
          style={{
            background: "#FFF8EA",
            border: "1px dashed #ECD9B3",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Checklist, weather, reminders…"
            style={{ fontSize: 14 }}
          />
          <div className="flex" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ffffff",
                background: "#6B3410",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              {saving ? "Saving…" : "Save note"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft("");
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6B3410",
                background: "transparent",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center"
          style={{
            alignSelf: "flex-start",
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#6B3410",
            background: "transparent",
            padding: "4px 2px",
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Add note
        </button>
      )}
    </div>
  );
}
