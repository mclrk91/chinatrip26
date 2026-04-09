"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeftRight, Languages, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "QAR", symbol: "QR", name: "Qatari Riyal" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
];

const COMMON_PHRASES = [
  { en: "Where is the bathroom?", emoji: "🚻" },
  { en: "How much does this cost?", emoji: "💰" },
  { en: "Take me to this address", emoji: "🚕" },
  { en: "Thank you", emoji: "🙏" },
  { en: "I have a food allergy to gluten", emoji: "⚠️" },
  { en: "Please call this number", emoji: "📞" },
  { en: "I don't speak the local language", emoji: "🗣️" },
  { en: "Can you help me?", emoji: "❓" },
];

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("THB");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    // Check cache
    try {
      const cached = localStorage.getItem("currency_rates");
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        const hourAgo = Date.now() - 3600000;
        if (parsed.timestamp > hourAgo) {
          setRates(parsed.rates);
          setLastFetch(new Date(parsed.timestamp));
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    setLoading(true);
    try {
      const codes = CURRENCIES.map((c) => c.code).join(",");
      const res = await fetch(
        `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${codes}`
      );
      const data = await res.json();
      // Frankfurter v2 returns { base, rates: { YYYY-MM-DD: { THB: x, ... } } }
      const dateKey = Object.keys(data.rates || {})[0];
      const rateData = dateKey ? data.rates[dateKey] : {};
      // Add USD = 1
      rateData.USD = 1;
      setRates(rateData);
      setLastFetch(new Date());
      // Cache
      localStorage.setItem(
        "currency_rates",
        JSON.stringify({ rates: rateData, timestamp: Date.now() })
      );
    } catch {
      // Try to use cached data even if expired
      try {
        const cached = localStorage.getItem("currency_rates");
        if (cached) {
          const parsed: CachedRates = JSON.parse(cached);
          setRates(parsed.rates);
          setLastFetch(new Date(parsed.timestamp));
        }
      } catch {
        // no rates available
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = (amt: number, from: string, to: string): number | null => {
    if (!rates) return null;
    const fromRate = rates[from];
    const toRate = rates[to];
    if (fromRate == null || toRate == null) return null;
    // Convert via USD: amt / fromRate * toRate
    return (amt / fromRate) * toRate;
  };

  const numAmount = parseFloat(amount) || 0;
  const result = convert(numAmount, fromCurrency, toCurrency);
  const toCurr = CURRENCIES.find((c) => c.code === toCurrency);

  return (
    <div className="space-y-4">
      {/* Amount + From */}
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-china-red/30"
          placeholder="Amount"
        />
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="px-3 py-3 rounded-xl border border-gray-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-china-red/30"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setFromCurrency(toCurrency);
            setToCurrency(fromCurrency);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* To currency */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-lg font-bold">
          {loading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : result !== null ? (
            `${toCurr?.symbol || ""}${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="px-3 py-3 rounded-xl border border-gray-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-china-red/30"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Quick rates */}
      {rates && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Rates (1 USD =)</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {CURRENCIES.filter((c) => c.code !== "USD").map((c) => (
              <div key={c.code} className="flex justify-between">
                <span className="text-muted-foreground">{c.code}</span>
                <span className="font-medium">
                  {c.symbol}{rates[c.code]?.toFixed(2) || "—"}
                </span>
              </div>
            ))}
          </div>
          {lastFetch && (
            <p className="text-xs text-muted-foreground mt-3">
              Rates from {lastFetch.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TranslateTool() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { code: "th", label: "Thai", flag: "🇹🇭" },
    { code: "zh", label: "Chinese", flag: "🇨🇳" },
    { code: "ar", label: "Arabic", flag: "🇶🇦" },
  ];

  const handleTranslate = async (inputText: string, lang: string) => {
    if (!inputText.trim() || !lang) return;
    setSelectedLang(lang);
    setLoading(true);
    setTranslation("");
    setEnlarged(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, language: lang }),
      });
      const data = await res.json();
      setTranslation(data.translation || "Translation failed");
    } catch {
      setTranslation("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enlarged translation overlay */}
      {enlarged && translation && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8"
          onClick={() => setEnlarged(false)}
        >
          <p className="text-sm text-muted-foreground mb-4">Tap anywhere to close</p>
          <p className="text-[36px] leading-tight text-center text-near-black font-medium">
            {translation}
          </p>
          <p className="text-lg text-muted-foreground mt-6">{text}</p>
        </div>
      )}

      {/* Input */}
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type in English..."
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-china-red/30"
        rows={2}
      />

      {/* Language buttons */}
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleTranslate(text, lang.code)}
            disabled={loading || !text.trim()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${
              selectedLang === lang.code
                ? "bg-china-red text-white border-china-red"
                : "bg-white border-gray-200 text-near-black hover:border-china-red disabled:opacity-50"
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Result */}
      {loading && (
        <div className="flex items-center gap-3 p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-china-red" />
          <span className="text-muted-foreground">Translating...</span>
        </div>
      )}
      {translation && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl leading-relaxed mb-3">{translation}</p>
          <button
            onClick={() => setEnlarged(true)}
            className="text-sm text-china-red font-medium"
          >
            Tap to enlarge
          </button>
        </div>
      )}

      {/* Common phrases */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Common Phrases</h3>
        <div className="grid grid-cols-1 gap-2">
          {COMMON_PHRASES.map((phrase) => (
            <button
              key={phrase.en}
              onClick={() => {
                setText(phrase.en);
                if (selectedLang) {
                  handleTranslate(phrase.en, selectedLang);
                }
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 text-left text-base hover:border-china-red hover:bg-red-50/30 transition-colors"
            >
              <span>{phrase.emoji}</span>
              <span>{phrase.en}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"currency" | "translate">("currency");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.push("/")} className="p-1">
            <ArrowLeft className="h-5 w-5 text-near-black" />
          </button>
          <h1 className="text-lg font-bold">Travel Tools</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setTab("currency")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "currency" ? "bg-white text-near-black shadow-sm" : "text-muted-foreground"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Currency
          </button>
          <button
            onClick={() => setTab("translate")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "translate" ? "bg-white text-near-black shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Languages className="h-4 w-4" />
            Translate
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {tab === "currency" ? <CurrencyConverter /> : <TranslateTool />}
      </main>

      <BottomNav />
    </div>
  );
}
