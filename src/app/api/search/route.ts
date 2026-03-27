import { NextRequest, NextResponse } from "next/server";

function normalizeType(raw: string): string {
  const map: Record<string, string> = {
    CONDO: "Condo",
    COOPERATIVE: "Co-op",
    COOP: "Co-op",
    "CO-OP": "Co-op",
    APARTMENT: "Co-op",
    SINGLE_FAMILY: "House",
    HOUSE: "House",
    TOWNHOUSE: "Townhouse",
    MULTI_FAMILY: "Multi-Family",
    LOT: "Land",
  };
  return map[raw.toUpperCase()] || raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      selectedNYCAreas, selectedNJAreas, types,
      maxPrice, minPrice, minBeds, minBaths, minSqft, maxSqft,
      minHOA, maxHOA, minTax, maxTax, minHOATax, maxHOATax,
      builtAfter, elevator, washerDryer, parking,
      commuteDestination, commuteMode, commuteMaxMinutes,
      daysOnMarket,
    } = body;

    // Merge NYC + NJ areas into regions array
    const regions = [
      ...(selectedNYCAreas || []),
      ...(selectedNJAreas || []),
    ];

    if (regions.length === 0) {
      return NextResponse.json({ listings: [], insights: null });
    }

    // Flask SLUGS expects bare area names like "Long Island City", "Jersey City"
    // Do NOT append state suffixes

    const FLASK_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5001";

    // Build filters for Flask → Zillow filterState
    const filters: Record<string, any> = {};
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (minPrice) filters.minPrice = Number(minPrice);
    if (minBeds) filters.minBeds = Number(minBeds);
    if (minBaths) filters.minBaths = Number(minBaths);
    if (minSqft) filters.minSqft = Number(minSqft);
    if (maxSqft) filters.maxSqft = Number(maxSqft);
    if (types && types.length > 0) filters.types = types;
    if (builtAfter) filters.yearAfter = Number(builtAfter);
    if (maxHOA) filters.maxHoa = Number(maxHOA);
    if (elevator === "required") filters.elevator = true;
    if (washerDryer === "required") filters.washerDryer = true;
    if (parking === "required") filters.parking = 1;
    // Days on Zillow: map dropdown values to Zillow's doz filter
    if (daysOnMarket) {
      const dozMap: Record<string, string> = { "1": "1", "3": "3", "7": "7", "14": "14", "30": "30", "90": "90" };
      if (dozMap[daysOnMarket]) filters.daysOnZillow = dozMap[daysOnMarket];
    }

    // Call Flask with POST + JSON body
    const response = await fetch(`${FLASK_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regions,
        filters,
        destination: commuteDestination || "",
        commuteMode: commuteMode || "driving",
        maxCommute: commuteMaxMinutes ? Number(commuteMaxMinutes) : null,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Flask error:", response.status, text);
      return NextResponse.json({ listings: [], insights: null, error: `Flask returned ${response.status}` });
    }

    const data = await response.json();

    // Map Flask field names to frontend field names
    let allListings: any[] = (data.listings || []).map((l: any) => {
      const daysMatch = l.daysText?.match?.(/(\d+)/);
      return {
        ...l,
        type: normalizeType(l.homeType || l.type || ""),
        tax: l.taxMonthly != null ? l.taxMonthly * 12 : (l.tax || 0),
        imgUrl: l.img || l.imgUrl || "",
        zillowUrl: l.url || l.zillowUrl || "",
        daysOnMarket: daysMatch ? parseInt(daysMatch[1]) : 0,
        commuteMinutes: l.commuteMins ?? l.commuteMinutes,
      };
    });

    // Client-side filtering for fields Flask doesn't handle
    const filtered = allListings.filter((l: any) => {
      if (maxSqft && l.sqft > Number(maxSqft)) return false;
      if (minHOA && (l.hoa || 0) < Number(minHOA)) return false;
      if (maxHOA && (l.hoa || 0) > Number(maxHOA)) return false;
      if (minTax && (l.taxMonthly || 0) < Number(minTax)) return false;
      if (maxTax && (l.taxMonthly || 0) > Number(maxTax)) return false;
      if (minHOATax && ((l.hoa || 0) + (l.taxMonthly || 0)) < Number(minHOATax)) return false;
      if (maxHOATax && ((l.hoa || 0) + (l.taxMonthly || 0)) > Number(maxHOATax)) return false;
      if (builtAfter && l.yearBuilt && l.yearBuilt < Number(builtAfter)) return false;
      // Note: elevator/washerDryer/parking filters removed — Zillow search results
      // don't include amenity data (only available on individual detail pages)
      // Days on market filter
      if (daysOnMarket && l.daysText) {
        const match = l.daysText.match(/(\d+)/);
        if (match && parseInt(match[1]) > Number(daysOnMarket)) return false;
      }
      return true;
    });

    // Calculate insights
    const prices = filtered.map((l: any) => l.price).filter(Boolean);
    const withSqft = filtered.filter((l: any) => l.sqft && l.sqft > 0);
    const insights = prices.length > 0 ? {
      medianPrice: [...prices].sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)],
      avgPriceSqft: withSqft.length > 0
        ? Math.round(withSqft.reduce((sum: number, l: any) => sum + l.price / l.sqft, 0) / withSqft.length)
        : 0,
      totalListings: filtered.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    } : null;

    const res = NextResponse.json({ listings: filtered, insights });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed. Make sure the Flask backend is running on port 5001.", listings: [], insights: null },
      { status: 500 }
    );
  }
}
