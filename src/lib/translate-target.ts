// Picks which language(s) to translate a hotel reservation into based on
// where the hotel is located. Returns a list of BCP-47-ish tags the
// translation API understands; an empty list means English-only / skip.

export type TranslateLang = "th" | "zh-CN" | "zh-HK";

export const LANG_LABELS: Record<TranslateLang, string> = {
  "th": "Thai · ภาษาไทย",
  "zh-CN": "Simplified Chinese · 简体中文",
  "zh-HK": "Traditional Chinese · 繁體中文",
};

const THAI_CUES = [
  "thailand",
  "bangkok",
  "chiang mai",
  "chiang rai",
  "phuket",
  "krabi",
  "koh samui",
  "ko samui",
  "pattaya",
  "hua hin",
];

const HK_CUES = ["hong kong", " hk ", ", hk", "kowloon", "lantau"];

const CHINA_CUES = [
  "china",
  "beijing",
  "tianjin",
  "shanghai",
  "shenzhen",
  "guangzhou",
  "xi'an",
  "xian",
  "chongqing",
  "chengdu",
  "hangzhou",
  "suzhou",
  "nanjing",
  "wuhan",
  "qingdao",
];

function normalize(s: string | undefined | null): string {
  return ` ${(s ?? "").toLowerCase().trim()} `;
}

export function targetLangsFor(opts: {
  address?: string | null;
  city?: string | null;
}): TranslateLang[] {
  const hay = `${normalize(opts.address)} ${normalize(opts.city)}`;
  if (HK_CUES.some((c) => hay.includes(c))) return ["zh-HK", "zh-CN"];
  if (THAI_CUES.some((c) => hay.includes(c))) return ["th"];
  if (CHINA_CUES.some((c) => hay.includes(c))) return ["zh-CN"];
  return [];
}
