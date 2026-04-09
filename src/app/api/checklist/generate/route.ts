import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

// Pre-defined checklist items based on the trip requirements
const DEFAULT_CHECKLIST = [
  // Documents
  { category: "Documents", item: "Passports valid 6+ months past travel (through April 2027)", checked: false },
  { category: "Documents", item: "China visa — verify all 4 travelers have valid visas", checked: false },
  { category: "Documents", item: "Thailand entry requirements — visa exemption for US citizens (30 days)", checked: false },
  { category: "Documents", item: "Printed copies of all flight confirmations", checked: false },
  { category: "Documents", item: "Printed copies of all hotel confirmations", checked: false },
  { category: "Documents", item: "Travel insurance documentation", checked: false },
  { category: "Documents", item: "Emergency contact list with embassy numbers", checked: false },

  // Health
  { category: "Health", item: "Recommended vaccinations: Hepatitis A, Typhoid (Thailand/China)", checked: false },
  { category: "Health", item: "Prescription medications packed in carry-on bags", checked: false },
  { category: "Health", item: "Travel health insurance purchased and cards printed", checked: false },
  { category: "Health", item: "Check current COVID requirements for Thailand and China", checked: false },
  { category: "Health", item: "Basic first aid kit (pain relievers, anti-diarrheal, bandages)", checked: false },

  // Technology
  { category: "Technology", item: "VPN app installed and tested (essential for China — Google/WhatsApp blocked)", checked: false },
  { category: "Technology", item: "eSIM or local SIM plan for Thailand", checked: false },
  { category: "Technology", item: "eSIM or local SIM plan for China", checked: false },
  { category: "Technology", item: "Offline maps downloaded (Google Maps for Thailand)", checked: false },
  { category: "Technology", item: "Offline maps downloaded (Amap/Baidu for China)", checked: false },
  { category: "Technology", item: "WeChat installed and account set up (essential for China)", checked: false },
  { category: "Technology", item: "Alipay set up for payments in China", checked: false },
  { category: "Technology", item: "Power adapters packed (Thailand: Type A/B/C, China: Type A/I)", checked: false },
  { category: "Technology", item: "Portable battery pack(s) charged", checked: false },

  // Money
  { category: "Money", item: "Thai Baht — exchange currency or plan for ATMs", checked: false },
  { category: "Money", item: "Chinese Yuan — exchange currency or plan for ATMs", checked: false },
  { category: "Money", item: "Credit cards with no foreign transaction fees identified", checked: false },
  { category: "Money", item: "Notify banks of travel dates (Oct 5-24, Thailand & China)", checked: false },
  { category: "Money", item: "Cash for tips and small vendors in both countries", checked: false },

  // Packing
  { category: "Packing", item: "Weather-appropriate clothing — Thailand: hot/humid ~85°F", checked: false },
  { category: "Packing", item: "Weather-appropriate clothing — Shenzhen: warm; Xi'an: cooler ~60°F", checked: false },
  { category: "Packing", item: "Comfortable walking shoes (expect 10k+ steps/day)", checked: false },
  { category: "Packing", item: "Rain jacket or compact umbrella (Thailand rainy season ending)", checked: false },
  { category: "Packing", item: "Modest clothing for temple visits (cover shoulders/knees)", checked: false },
  { category: "Packing", item: "Swimsuit for Koh Samui beach days", checked: false },
  { category: "Packing", item: "Light layers for air-conditioned venues and flights", checked: false },

  // Transportation
  { category: "Transportation", item: "Airport transfer plan for Bangkok (BKK)", checked: false },
  { category: "Transportation", item: "Airport transfer plan for Chiang Mai (CNX)", checked: false },
  { category: "Transportation", item: "Airport transfer plan for Shenzhen (SZX) or Hong Kong (HKG)", checked: false },
  { category: "Transportation", item: "Domestic flight confirmations printed (China may require paper)", checked: false },
  { category: "Transportation", item: "Intercity transport booked (Xi'an to Chongqing — train or flight?)", checked: false },
  { category: "Transportation", item: "Amanda Ford's separate routing confirmed and coordinated", checked: false },
];

export async function POST() {
  try {
    const supabase = getServiceClient();

    // Check if checklist already has items
    const { data: existing } = await supabase
      .from("checklist")
      .select("id")
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { message: "Checklist already has items. Delete them first to regenerate." },
        { status: 200 }
      );
    }

    // Insert default items
    const { data, error } = await supabase
      .from("checklist")
      .insert(DEFAULT_CHECKLIST)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate checklist" },
      { status: 500 }
    );
  }
}
