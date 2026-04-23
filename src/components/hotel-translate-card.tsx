"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  LANG_LABELS,
  targetLangsFor,
  type TranslateLang,
} from "@/lib/translate-target";
import type { Booking } from "@/lib/supabase/types";

interface Translation {
  name: string;
  address: string;
  greeting: string;
}

interface HotelTranslateCardProps {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}

const LANG_FONTS: Record<TranslateLang, string> = {
  th: "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif",
  "zh-CN": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
  "zh-HK": "'Noto Sans TC', 'PingFang HK', 'Microsoft JhengHei', system-ui, sans-serif",
};

export function HotelTranslateCard({
  booking,
  open,
  onClose,
}: HotelTranslateCardProps) {
  const details = useMemo(
    () => (booking.details || {}) as Record<string, unknown>,
    [booking.details]
  );
  const hotelName = booking.title;
  const address = (details.address as string | undefined) || "";
  const city = (details.city as string | undefined) || "";

  const langs = targetLangsFor({ address, city });
  const cached = (details.translations as
    | Record<string, Translation>
    | undefined) || undefined;

  const [translations, setTranslations] = useState<
    Record<string, Translation> | null
  >(cached ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedFor = useRef<string>("");

  const cacheKey = `${booking.id}|${langs.join(",")}|${hotelName}|${address}`;

  const fetchTranslations = useCallback(async () => {
    if (!address || langs.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hotelName,
          address,
          languages: langs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Translation failed");
      const next = data.translations as Record<string, Translation>;
      setTranslations(next);

      // Best-effort cache back onto the booking so re-opens are instant
      try {
        await fetch(`/api/bookings/${booking.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            details: { ...details, translations: next },
          }),
        });
      } catch {
        // Non-fatal — translation still shown for the current view.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  }, [address, hotelName, langs, booking.id, details]);

  useEffect(() => {
    if (!open) return;
    if (langs.length === 0) return;
    if (translations && Object.keys(translations).length > 0) return;
    if (fetchedFor.current === cacheKey) return;
    fetchedFor.current = cacheKey;
    fetchTranslations();
  }, [open, cacheKey, translations, langs.length, fetchTranslations]);

  if (!open) return null;

  const englishGreeting = `Hi! We are going to ${hotelName}, ${address}, please. Thank you!`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 60,
          }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            background: "#FBF6EC",
            color: "#2B1810",
            overflowY: "auto",
            padding: "max(20px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom)) 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogPrimitive.Title
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            Show this hotel to a local
          </DialogPrimitive.Title>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8C7B6A",
              }}
            >
              Show to a local
            </span>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                style={{
                  border: "none",
                  background: "#fff",
                  borderRadius: 999,
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  color: "#2B1810",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 2px rgba(26,26,46,.12)",
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </DialogPrimitive.Close>
          </div>

          {langs.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", maxWidth: 420 }}>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  No native translation available
                </p>
                <p style={{ color: "#8C7B6A", fontSize: 14 }}>
                  This hotel isn&rsquo;t in mainland China, Hong Kong, or
                  Thailand, so we don&rsquo;t auto-translate it. Show the
                  English address below.
                </p>
                <div style={{ marginTop: 24, textAlign: "left" }}>
                  <EnglishBlock
                    name={hotelName}
                    address={address}
                    greeting={englishGreeting}
                  />
                </div>
              </div>
            </div>
          ) : loading ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div
                className="animate-spin rounded-full h-10 w-10"
                style={{
                  border: "2px solid #C41E3A",
                  borderBottomColor: "transparent",
                }}
              />
              <p style={{ color: "#8C7B6A", fontSize: 14 }}>Translating…</p>
            </div>
          ) : error ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#C41E3A",
                  textAlign: "center",
                }}
              >
                Translation failed
              </p>
              <p style={{ color: "#8C7B6A", fontSize: 14, textAlign: "center" }}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  fetchedFor.current = "";
                  fetchTranslations();
                }}
                style={{
                  border: "none",
                  background: "#6B3410",
                  color: "#F5E9C8",
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try again
              </button>
              <div style={{ marginTop: 16, alignSelf: "stretch" }}>
                <EnglishBlock
                  name={hotelName}
                  address={address}
                  greeting={englishGreeting}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {langs.map((lang) => {
                const t = translations?.[lang];
                if (!t) return null;
                return (
                  <NativeBlock
                    key={lang}
                    lang={lang}
                    translation={t}
                    showLabel={langs.length > 1}
                  />
                );
              })}

              <div
                style={{
                  borderTop: "1px solid #E2D8C8",
                  paddingTop: 20,
                }}
              >
                <EnglishBlock
                  name={hotelName}
                  address={address}
                  greeting={englishGreeting}
                />
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function NativeBlock({
  lang,
  translation,
  showLabel,
}: {
  lang: TranslateLang;
  translation: Translation;
  showLabel: boolean;
}) {
  const font = LANG_FONTS[lang];
  return (
    <div>
      {showLabel && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8C7B6A",
            marginBottom: 10,
          }}
        >
          {LANG_LABELS[lang]}
        </div>
      )}
      <div
        style={{
          fontFamily: font,
          fontSize: "clamp(28px, 8vw, 56px)",
          fontWeight: 700,
          lineHeight: 1.15,
          color: "#2B1810",
          marginBottom: 12,
          wordBreak: "break-word",
        }}
      >
        {translation.name}
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: "clamp(20px, 5vw, 32px)",
          fontWeight: 500,
          lineHeight: 1.3,
          color: "#2B1810",
          marginBottom: 14,
          wordBreak: "break-word",
        }}
      >
        {translation.address}
      </div>
      <div
        style={{
          fontFamily: font,
          fontSize: "clamp(18px, 4.2vw, 26px)",
          fontWeight: 500,
          lineHeight: 1.35,
          color: "#6B3410",
          background: "#fff",
          borderRadius: 12,
          padding: "14px 16px",
          boxShadow: "0 1px 2px rgba(26,26,46,.06)",
        }}
      >
        {translation.greeting}
      </div>
    </div>
  );
}

function EnglishBlock({
  name,
  address,
  greeting,
}: {
  name: string;
  address: string;
  greeting: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#8C7B6A",
          marginBottom: 8,
        }}
      >
        English
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#2B1810" }}>{name}</div>
      <div style={{ fontSize: 14, color: "#2B1810", marginTop: 4 }}>{address}</div>
      <div
        style={{
          fontSize: 13,
          fontStyle: "italic",
          color: "#8C7B6A",
          marginTop: 8,
        }}
      >
        {greeting}
      </div>
    </div>
  );
}
