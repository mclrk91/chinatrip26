"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRightLeft, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
];

const LANGUAGES = [
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "th", name: "Thai" },
  { code: "ar", name: "Arabic" },
];

const COMMON_PHRASES: Record<string, { en: string; translation: string }[]> = {
  zh: [
    { en: "Hello", translation: "你好 (Nǐ hǎo)" },
    { en: "Thank you", translation: "谢谢 (Xièxiè)" },
    { en: "Where is the bathroom?", translation: "洗手间在哪里？(Xǐshǒujiān zài nǎlǐ?)" },
    { en: "How much does this cost?", translation: "这个多少钱？(Zhège duōshǎo qián?)" },
    { en: "I need help", translation: "我需要帮助 (Wǒ xūyào bāngzhù)" },
    { en: "Please take me to this address", translation: "请带我去这个地址 (Qǐng dài wǒ qù zhège dìzhǐ)" },
    { en: "I don't speak Chinese", translation: "我不会说中文 (Wǒ bù huì shuō zhōngwén)" },
    { en: "Check please", translation: "买单 (Mǎidān)" },
  ],
  th: [
    { en: "Hello", translation: "สวัสดี (Sawatdee)" },
    { en: "Thank you", translation: "ขอบคุณ (Khop khun)" },
    { en: "Where is the bathroom?", translation: "ห้องน้ำอยู่ที่ไหน (Hông náam yùu thîi nǎi)" },
    { en: "How much does this cost?", translation: "อันนี้ราคาเท่าไหร่ (An née raakhaa thâo rài)" },
    { en: "I need help", translation: "ฉันต้องการความช่วยเหลือ (Chǎn tông gaan khwaam chûai lǔea)" },
    { en: "I don't speak Thai", translation: "ฉันพูดภาษาไทยไม่ได้ (Chǎn phûut phaasǎa thai mâi dâai)" },
    { en: "Check please", translation: "เช็คบิลด้วย (Chék bin dûai)" },
  ],
  ar: [
    { en: "Hello", translation: "مرحبا (Marhaba)" },
    { en: "Thank you", translation: "شكرا (Shukran)" },
    { en: "Where is the bathroom?", translation: "أين الحمام؟ (Ayn alhammam?)" },
    { en: "How much does this cost?", translation: "كم سعر هذا؟ (Kam si'r hadha?)" },
  ],
};

export default function ToolsPage() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CNY");
  const [amount, setAmount] = useState("100");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [targetLang, setTargetLang] = useState("zh");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [enlargedText, setEnlargedText] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=THB,CNY,HKD,QAR,GBP,EUR");
      if (res.ok) {
        const data = await res.json();
        setRates({ USD: 1, ...data.rates });
      }
    } catch {
      // Fallback rates
      setRates({ USD: 1, THB: 34.5, CNY: 7.24, HKD: 7.82, QAR: 3.64, GBP: 0.79, EUR: 0.92 });
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = (amt: number, from: string, to: string): number => {
    if (!rates[from] || !rates[to]) return 0;
    return (amt / rates[from]) * rates[to];
  };

  const converted = convert(parseFloat(amount) || 0, fromCurrency, toCurrency);

  const handleTranslate = (text: string) => {
    // Check common phrases first
    const phrases = COMMON_PHRASES[targetLang] || [];
    const match = phrases.find((p) => p.en.toLowerCase() === text.toLowerCase());
    if (match) {
      setTranslatedText(match.translation);
      return;
    }
    // For non-matching text, show a message
    setTranslatedText(`Translation for "${text}" to ${LANGUAGES.find((l) => l.code === targetLang)?.name} — use common phrases below or a translation app for custom text.`);
  };

  const quickRates = [
    { from: "USD", to: "CNY", label: "$1 USD" },
    { from: "USD", to: "THB", label: "$1 USD" },
    { from: "USD", to: "HKD", label: "$1 USD" },
    { from: "USD", to: "QAR", label: "$1 USD" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Travel Tools</span>
        </h1>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        <Tabs defaultValue="currency" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="currency" className="flex-1 gap-1">
              <ArrowRightLeft className="h-4 w-4" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="translate" className="flex-1 gap-1">
              <Languages className="h-4 w-4" />
              Translate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="currency" className="mt-4 space-y-4">
            {/* Converter */}
            <Card className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-lg rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
                  />
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                  <div>
                    <label className="text-sm text-muted-foreground">From</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setFromCurrency(toCurrency);
                      setToCurrency(fromCurrency);
                    }}
                    className="mb-0.5 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div>
                    <label className="text-sm text-muted-foreground">To</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {ratesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-china-red" />
                  </div>
                ) : (
                  <div className="text-center py-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {CURRENCIES.find((c) => c.code === toCurrency)?.symbol}{converted.toFixed(2)} {toCurrency}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      1 {fromCurrency} = {convert(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick rates */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Rates</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickRates.map((r) => (
                  <Card key={`${r.from}-${r.to}`} className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-lg font-bold">
                      {CURRENCIES.find((c) => c.code === r.to)?.symbol}
                      {convert(1, r.from, r.to).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.to}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="translate" className="mt-4 space-y-4">
            <Card className="p-4 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => {
                    setTargetLang(e.target.value);
                    setTranslatedText("");
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">English text</label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTranslate(inputText)}
                  placeholder="Type in English..."
                  className="w-full mt-1 px-3 py-2 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30"
                />
              </div>

              <button
                onClick={() => handleTranslate(inputText)}
                disabled={!inputText.trim()}
                className="w-full py-2 bg-china-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Translate
              </button>

              {translatedText && (
                <button
                  onClick={() => setEnlargedText(translatedText)}
                  className="w-full p-4 bg-muted rounded-lg text-center"
                >
                  <p className="text-2xl font-bold leading-relaxed">{translatedText}</p>
                  <p className="text-xs text-muted-foreground mt-2">Tap to enlarge</p>
                </button>
              )}
            </Card>

            {/* Common phrases */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Common Phrases</h3>
              <div className="space-y-2">
                {(COMMON_PHRASES[targetLang] || []).map((phrase) => (
                  <button
                    key={phrase.en}
                    onClick={() => {
                      setInputText(phrase.en);
                      setTranslatedText(phrase.translation);
                    }}
                    className="w-full text-left p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm text-muted-foreground">{phrase.en}</p>
                    <p className="text-lg font-medium mt-0.5">{phrase.translation}</p>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {/* Enlarged translation overlay */}
      {enlargedText && (
        <div
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-8"
          onClick={() => setEnlargedText(null)}
        >
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold leading-relaxed">{enlargedText}</p>
            <p className="text-sm text-muted-foreground mt-6">Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
