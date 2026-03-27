"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ExternalLink,
  Train,
  Car,
  Footprints,
  Building2,
  Home,
  Layers,
  CheckSquare,
  Square,
  RotateCcw,
  TrendingUp,
  BarChart3,
  ListFilter,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  DollarSign,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Listing {
  zpid: string;
  address: string;
  area: string;
  state?: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  hoa: number;
  tax: number;
  taxMonthly?: number;
  yearBuilt: number;
  hasElevator?: boolean;
  hasWD?: boolean;
  hasParking?: boolean;
  daysOnMarket: number;
  daysText?: string;
  imgUrl: string;
  zillowUrl: string;
  streetEasyUrl?: string;
  lat: number;
  lng: number;
  commuteMinutes?: number;
  commuteMode?: string;
}

// ─── URL Builders ─────────────────────────────────────────────────────────────

function buildStreetEasySearchUrl(address: string, area: string): string | null {
  const njAreas = ["Jersey City", "Hoboken", "Weehawken", "Fort Lee", "Edgewater",
    "West New York", "North Bergen", "Newark", "Montclair", "Morristown",
    "Princeton", "New Brunswick", "Edison", "Englewood", "Teaneck", "Hackensack",
    "Summit", "Westfield", "Elizabeth", "Cranford", "Maplewood", "South Orange"];
  if (njAreas.includes(area)) return null;
  const clean = address.replace(/,?\s*(NY|New York)\s*\d{5}$/i, "").replace(/,/g, " ").trim();
  return `https://www.google.com/search?q=site%3Astreeteasy.com+${encodeURIComponent(clean)}`;
}

function buildGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
}

function buildDirectionsUrl(fromAddress: string, toAddress: string, mode: string): string {
  const travelMode = mode === "transit" ? "&travelmode=transit" : mode === "walking" ? "&travelmode=walking" : "&travelmode=driving";
  return `https://www.google.com/maps/dir/${encodeURIComponent(fromAddress)}/${encodeURIComponent(toAddress)}${travelMode}`;
}

interface Filters {
  naturalQuery: string;
  selectedNYCAreas: string[];
  selectedNJAreas: string[];
  types: string[];
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  maxSqft: string;
  minHOA: string;
  maxHOA: string;
  minTax: string;
  maxTax: string;
  minHOATax: string;
  maxHOATax: string;
  builtAfter: string;
  elevator: "any" | "required";
  washerDryer: "any" | "required";
  parking: "any" | "required";
  daysOnMarket: string;
  commuteDestination: string;
  commuteMode: "driving" | "transit" | "walking";
  commuteMaxMinutes: string;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "largest" | "monthly_asc";

// ─── Area Data ────────────────────────────────────────────────────────────────

const NYC_AREAS: Record<string, string[]> = {
  Manhattan: [
    "Upper East Side", "Upper West Side", "Midtown", "Chelsea", "Greenwich Village",
    "East Village", "SoHo", "Tribeca", "LES", "FiDi", "Harlem", "Murray Hill",
    "Hudson Yards", "Hell's Kitchen", "Kips Bay", "Gramercy", "Battery Park City",
  ],
  Brooklyn: [
    "Williamsburg", "DUMBO", "Brooklyn Heights", "Park Slope", "Greenpoint",
    "Downtown Brooklyn", "Bed-Stuy", "Crown Heights", "Prospect Heights",
    "Fort Greene", "Clinton Hill", "Cobble Hill", "Boerum Hill",
  ],
  Queens: [
    "Long Island City", "Astoria", "Flushing", "Forest Hills",
    "Jackson Heights", "Sunnyside",
  ],
  Bronx: ["Riverdale", "Mott Haven"],
  "Staten Island": ["St. George"],
};

const NJ_AREAS: Record<string, string[]> = {
  "Hudson County": [
    "Jersey City", "Hoboken", "Weehawken", "Fort Lee", "Edgewater",
    "West New York", "North Bergen",
  ],
  "Bergen County": ["Englewood", "Fort Lee", "Teaneck", "Hackensack"],
  "Essex County": ["Montclair", "Newark", "Maplewood", "South Orange"],
  "Union County": ["Summit", "Westfield", "Elizabeth", "Cranford"],
};

const PROPERTY_TYPES = ["Condo", "Co-op", "House", "Townhouse", "Multi-Family"];

// ─── Default Filters ──────────────────────────────────────────────────────────

const defaultFilters: Filters = {
  naturalQuery: "",
  selectedNYCAreas: [],
  selectedNJAreas: [],
  types: [],
  minPrice: "",
  maxPrice: "",
  minBeds: "",
  minBaths: "",
  minSqft: "",
  maxSqft: "",
  minHOA: "",
  maxHOA: "",
  minTax: "",
  maxTax: "",
  minHOATax: "",
  maxHOATax: "",
  builtAfter: "",
  elevator: "any",
  washerDryer: "any",
  parking: "any",
  daysOnMarket: "",
  commuteDestination: "",
  commuteMode: "transit",
  commuteMaxMinutes: "",
};

// ─── Natural Language Parser ──────────────────────────────────────────────────

function parseNaturalLanguage(query: string): Partial<Filters> {
  const lower = query.toLowerCase();
  const result: Partial<Filters> = {};

  const priceMatch = lower.match(/(?:under|max|below|up to|less than)\s*\$?([\d.,]+)([km]?)/i);
  if (priceMatch) {
    let val = parseFloat(priceMatch[1].replace(/,/g, ""));
    if (priceMatch[2] === "k") val *= 1000;
    if (priceMatch[2] === "m") val *= 1000000;
    result.maxPrice = String(Math.round(val));
  }

  const minPriceMatch = lower.match(/(?:over|min|above|at least|from)\s*\$?([\d.,]+)([km]?)/i);
  if (minPriceMatch) {
    let val = parseFloat(minPriceMatch[1].replace(/,/g, ""));
    if (minPriceMatch[2] === "k") val *= 1000;
    if (minPriceMatch[2] === "m") val *= 1000000;
    result.minPrice = String(Math.round(val));
  }

  const bedsMatch = lower.match(/(\d+)\s*(?:br|bed|bedroom|베드)/);
  if (bedsMatch) result.minBeds = bedsMatch[1];
  if (lower.includes("studio")) result.minBeds = "0";

  const types: string[] = [];
  if (lower.includes("condo") || lower.includes("콘도")) types.push("Condo");
  if (lower.includes("co-op") || lower.includes("coop")) types.push("Co-op");
  if (lower.includes("house") || lower.includes("주택")) types.push("House");
  if (lower.includes("townhouse") || lower.includes("타운하우스")) types.push("Townhouse");
  if (lower.includes("multi-family") || lower.includes("multifamily")) types.push("Multi-Family");
  if (types.length > 0) result.types = types;

  const allNYCAreas = Object.values(NYC_AREAS).flat();
  const allNJAreas = Object.values(NJ_AREAS).flat();
  const foundNYC = allNYCAreas.filter((a) =>
    lower.includes(a.toLowerCase()) || (a === "Long Island City" && lower.includes("lic"))
  );
  const foundNJ = allNJAreas.filter((a) => lower.includes(a.toLowerCase()));
  if (foundNYC.length > 0) result.selectedNYCAreas = foundNYC;
  if (foundNJ.length > 0) result.selectedNJAreas = foundNJ;

  if (lower.includes("washer") || lower.includes("w/d") || lower.includes("세탁기")) {
    result.washerDryer = "required";
  }
  if (lower.includes("elevator") || lower.includes("엘리베이터")) {
    result.elevator = "required";
  }
  if (lower.includes("parking") || lower.includes("주차")) {
    result.parking = "required";
  }

  return result;
}

// ─── Spring Transition ────────────────────────────────────────────────────────

const spring = { type: "spring" as const, stiffness: 400, damping: 25 };

// ─── MultiSelect Component ────────────────────────────────────────────────────

interface MultiSelectProps {
  label: string;
  groups: Record<string, string[]>;
  selected: string[];
  onChange: (items: string[]) => void;
  lang: "en" | "ko";
}

function MultiSelect({ label, groups, selected, onChange, lang }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const allItems = Object.values(groups).flat();
  const filtered = search
    ? allItems.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]);
  };

  const selectAll = () => onChange(allItems);
  const clearAll = () => onChange([]);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={spring}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all hover:border-blue-300 hover:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="truncate text-left text-gray-700">
          {selected.length > 0
            ? selected.length <= 3
              ? selected.join(", ")
              : `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`
            : label}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60"
          >
            <div className="border-b border-gray-100 p-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "en" ? "Search areas..." : "지역 검색..."}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <button
                onClick={selectAll}
                className="text-xs font-medium text-blue-500 transition hover:text-blue-600"
              >
                {lang === "en" ? "Select All" : "전체 선택"}
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 transition hover:text-gray-600"
              >
                {lang === "en" ? "Clear" : "초기화"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {filtered ? (
                filtered.length > 0 ? (
                  filtered.map((item) => (
                    <MultiSelectItem key={item} item={item} selected={selected} onToggle={toggle} />
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-gray-400">
                    {lang === "en" ? "No matches" : "결과 없음"}
                  </div>
                )
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {group}
                    </div>
                    {items.map((item) => (
                      <MultiSelectItem key={item} item={item} selected={selected} onToggle={toggle} />
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiSelectItem({
  item,
  selected,
  onToggle,
}: {
  item: string;
  selected: string[];
  onToggle: (item: string) => void;
}) {
  const isSelected = selected.includes(item);
  return (
    <motion.button
      whileHover={{ backgroundColor: "#F8FAFF" }}
      onClick={() => onToggle(item)}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors"
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 shrink-0 text-blue-500" />
      ) : (
        <Square className="h-4 w-4 shrink-0 text-gray-300" />
      )}
      <span className={isSelected ? "font-medium text-gray-900" : "text-gray-500"}>{item}</span>
    </motion.button>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

const TYPE_BG: Record<string, string> = {
  Condo: "from-sky-100 to-blue-200",
  "Co-op": "from-orange-100 to-amber-200",
  House: "from-emerald-100 to-green-200",
  Townhouse: "from-violet-100 to-purple-200",
  "Multi-Family": "from-pink-100 to-rose-200",
};

const TYPE_BADGE: Record<string, string> = {
  Condo: "bg-blue-100 text-blue-600",
  "Co-op": "bg-orange-100 text-orange-600",
  House: "bg-emerald-100 text-emerald-600",
  Townhouse: "bg-violet-100 text-violet-600",
  "Multi-Family": "bg-pink-100 text-pink-600",
};

const TYPE_ICON: Record<string, string> = {
  Condo: "text-blue-300",
  "Co-op": "text-orange-300",
  House: "text-emerald-300",
  Townhouse: "text-violet-300",
  "Multi-Family": "text-pink-300",
};

function ListingCard({ listing, lang, commuteDestination }: { listing: Listing; lang: "en" | "ko"; commuteDestination?: string }) {
  const sqftPyeong = Math.round(listing.sqft / 35.58);
  const taxMonthly = listing.taxMonthly ?? Math.round(listing.tax / 12);
  const monthlyTotal = Math.round((listing.hoa || 0) + taxMonthly);
  // StreetEasy: use Flask-verified URL if available, otherwise Google search
  const seUrl = (listing as any).streeteasyUrl || buildStreetEasySearchUrl(listing.address, listing.area);
  const mapsUrl = buildGoogleMapsUrl(listing.address);

  const formatPrice = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M`
      : `$${(n / 1000).toFixed(0)}K`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={spring}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50"
    >
      {/* Image / Gradient */}
      <div
        className={`relative h-44 w-full cursor-pointer bg-cover bg-center ${!listing.imgUrl ? `bg-gradient-to-br ${TYPE_BG[listing.type] ?? "from-gray-100 to-gray-200"}` : ""}`}
        style={listing.imgUrl ? { backgroundImage: `url(${listing.imgUrl})` } : undefined}
        onClick={() => listing.zillowUrl && window.open(listing.zillowUrl, "_blank")}
      >
        {!listing.imgUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className={`h-14 w-14 ${TYPE_ICON[listing.type] ?? "text-gray-200"}`} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${TYPE_BADGE[listing.type] ?? "bg-gray-100 text-gray-500"}`}>
            {listing.type}
          </span>
        </div>
        {(listing.daysText || listing.daysOnMarket > 0) && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm">
              {listing.daysText || `${listing.daysOnMarket}d`}
            </span>
          </div>
        )}
        {listing.commuteMinutes != null && listing.commuteMinutes > 0 && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white shadow-md">
              {listing.commuteMode === "transit" ? (
                <Train className="h-3 w-3" />
              ) : listing.commuteMode === "walking" ? (
                <Footprints className="h-3 w-3" />
              ) : (
                <Car className="h-3 w-3" />
              )}
              {listing.commuteMinutes}min
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-2xl font-bold text-gray-900">
          {formatPrice(listing.price)}
        </div>

        <div className="mb-0.5 text-sm font-semibold text-gray-800">{listing.address}</div>
        <div className="mb-3 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3" />
          {listing.area}
        </div>

        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5 text-gray-400" />
            {listing.beds === 0 ? (lang === "en" ? "Studio" : "스튜디오") : `${listing.beds}bd`}
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-gray-400" />
            {listing.baths}ba
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5 text-gray-400" />
            {listing.sqft > 0 ? `${listing.sqft.toLocaleString()}sqft` : "N/A"}
            {listing.sqft > 0 && <span className="text-gray-300">({sqftPyeong}평)</span>}
          </span>
        </div>

        {/* Monthly costs */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
          {(listing.hoa || 0) > 0 && (
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-gray-500">
              HOA ${(listing.hoa || 0).toLocaleString()}/mo
            </span>
          )}
          {taxMonthly > 0 && (
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-gray-500">
              Tax ~${taxMonthly.toLocaleString()}/mo
            </span>
          )}
          {monthlyTotal > 0 && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-600">
              ${monthlyTotal.toLocaleString()}/mo
            </span>
          )}
        </div>

        {/* Year built + listing date */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {listing.yearBuilt > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
              <Calendar className="h-2.5 w-2.5" />
              Built {listing.yearBuilt}
            </span>
          )}
          {(listing.daysText || listing.daysOnMarket > 0) && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
              📅 {listing.daysText || `Listed ${listing.daysOnMarket}d ago`}
            </span>
          )}
        </div>

        {/* Commute info */}
        {listing.commuteMinutes != null && listing.commuteMinutes > 0 && commuteDestination && (
          <div className="mb-3 rounded-xl bg-blue-50 p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700">
                {listing.commuteMode === "transit" ? "🚇" : listing.commuteMode === "walking" ? "🚶" : "🚗"}{" "}
                <b>{listing.commuteMinutes}min</b> → {commuteDestination.substring(0, 30)}
              </span>
              <a
                href={buildDirectionsUrl(listing.address, commuteDestination, listing.commuteMode || "driving")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                📍 Maps
              </a>
            </div>
          </div>
        )}

        {/* Action links */}
        <div className="mt-auto flex gap-1.5">
          <a
            href={listing.zillowUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-blue-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            Zillow
          </a>
          {seUrl && (
            <a
              href={seUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-800 px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-900"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              StreetEasy
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            Maps
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function AmenityBadge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-600"
          : "bg-red-50 text-red-400 line-through"
      }`}
    >
      {label}
    </span>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingState({ lang }: { lang: "en" | "ko" }) {
  const colors = ["text-blue-400", "text-coral-400", "text-emerald-400"];
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6 flex items-end gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          >
            <Home className={`h-8 w-8 ${colors[i % colors.length]}`} />
          </motion.div>
        ))}
      </div>
      <div className="mb-3 text-sm font-semibold text-gray-700">
        {lang === "en" ? "Searching listings..." : "매물을 검색 중입니다..."}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="h-2 w-2 rounded-full bg-blue-400"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ searched, lang }: { searched: boolean; lang: "en" | "ko" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5"
      >
        {searched ? (
          <Search className="h-16 w-16 text-gray-200" />
        ) : (
          <Home className="h-16 w-16 text-blue-200" />
        )}
      </motion.div>
      <div className="mb-2 text-xl font-bold text-gray-800">
        {searched
          ? lang === "en" ? "No properties found" : "검색 결과가 없습니다"
          : lang === "en" ? "Find your perfect home" : "드림 홈을 검색하세요"}
      </div>
      <div className="max-w-xs text-sm text-gray-400">
        {searched
          ? lang === "en"
            ? "Try broadening your search criteria."
            : "검색 조건을 넓혀 다시 시도해보세요."
          : lang === "en"
          ? "Use the search bar or filters above to find properties in NYC and NJ."
          : "위의 검색창이나 필터를 사용하여 NYC/NJ 매물을 찾아보세요."}
      </div>
    </div>
  );
}

// ─── Market Insights ──────────────────────────────────────────────────────────

const NEIGHBORHOOD_PROFILES: Record<string, { vibe: string; transit: string; schools: string; priceNote: string }> = {
  "Upper East Side": { vibe: "클래식한 고급 주거지. 미술관, 갤러리, 고급 레스토랑 밀집. 가족 친화적이고 조용한 분위기", transit: "4/5/6, Q 라인. 2nd Ave subway 개통 후 접근성 향상", schools: "PS 6, PS 77 등 우수 공립학교 다수. Dalton, Brearley 등 명문 사립", priceNote: "맨해튼 상위 시세. 콘도 중위가 $1.2M+, 코압 $600K–$900K 범위" },
  "Upper West Side": { vibe: "센트럴파크 + 리버사이드 파크 양쪽. 문화·학문 중심지(Columbia, Lincoln Center). 가족 많고 지적 분위기", transit: "1/2/3, B/C 라인. 맨해튼 남북 이동 편리", schools: "PS 87, PS 199 인기 학군. Trinity, Collegiate 사립 명문", priceNote: "UES보다 소폭 저렴. 코압 $500K–$800K, 콘도 $800K–$1.5M" },
  "Midtown": { vibe: "상업·오피스 중심. 주거보다 직장인 1인 가구 중심. 편의시설 최고, 관광객 많아 시끄러울 수 있음", transit: "거의 모든 지하철 노선 접근 가능. Grand Central, Penn Station 도보권", schools: "주거 학군 제한적. 가족보다 싱글/커플 적합", priceNote: "스튜디오/1베드 중심. 콘도 $600K–$1M, 렌트 $3K–$5K/mo" },
  "Chelsea": { vibe: "아트 갤러리, High Line, 트렌디한 레스토랑. LGBTQ+ 프렌들리. 젊고 활기찬 분위기", transit: "1/2/3, A/C/E, L 라인. 하이라인 도보권", schools: "가족 학군보다 싱글/커플 적합 지역", priceNote: "콘도 $700K–$1.5M. 신축 럭셔리 콘도 많음" },
  "Greenwich Village": { vibe: "NYU 캠퍼스 인접. 역사적인 타운하우스, 카페, 재즈 클럽. 보헤미안 + 고급 주거 혼합", transit: "A/B/C/D/E/F/M, 1/2/3 라인. West 4th St 허브", schools: "PS 41 인기. NYU 인접으로 학생 많음", priceNote: "맨해튼 프리미엄. 코압 $500K+, 콘도 $800K–$2M" },
  "East Village": { vibe: "펑크 역사 + 현재는 트렌디한 바·레스토랑 밀집. 젊은 층 인기. 다양한 문화 혼합", transit: "6, L, N/R 라인. Astor Place, 1st Ave", schools: "가족 거주 증가 추세. PS 19, PS 64", priceNote: "그리니치빌리지보다 저렴. 코압 $400K–$700K" },
  "SoHo": { vibe: "캐스트아이언 건물, 명품 쇼핑, 갤러리. 주말 관광객 많음. 로프트 스타일 주거", transit: "N/R/W, 6, C/E 라인", schools: "주거 학군 제한적. 쇼핑·문화 중심", priceNote: "NYC 최고가 지역 중 하나. 로프트 콘도 $1.5M+" },
  "Tribeca": { vibe: "NYC 최고급 주거지 중 하나. 셀럽·금융인 거주. 가족 친화적, 조용하고 넓은 거리", transit: "1/2/3, A/C/E 라인. Chambers St", schools: "PS 234, Stuyvesant HS 인접. 가족 선호 학군", priceNote: "맨해튼 최고가. 콘도 중위가 $2M+, 로프트 $3M+" },
  "Financial District": { vibe: "월스트리트. 상업→주거 전환 진행 중. 신축 콘도 많고 워터프론트 뷰", transit: "거의 모든 노선. Fulton Center 허브", schools: "PS 234 배정. 가족 거주 빠르게 증가 중", priceNote: "맨해튼 대비 가성비 좋은 편. 콘도 $600K–$1.2M" },
  "Lower East Side": { vibe: "이민자 역사 + 현재 힙스터 문화. 바·클럽 나이트라이프. 다양한 음식 문화", transit: "F, J/M/Z, B/D 라인. Delancey-Essex", schools: "PS 20, PS 134. 차터스쿨 다수", priceNote: "맨해튼 엔트리 레벨. 코압 $350K–$600K" },
  "Harlem": { vibe: "아프리칸 아메리칸 문화 중심지. 르네상스 역사. 젠트리피케이션 진행 중. 브라운스톤 매력", transit: "2/3, A/B/C/D 라인. 125th St 허브", schools: "학군 편차 큼. 차터스쿨 인기(Success Academy 등)", priceNote: "맨해튼 최저가 진입점. 코압 $200K–$500K, 콘도 $400K–$800K" },
  "Murray Hill": { vibe: "직장인 1인 가구 밀집. 한인타운(K-Town) 인접. 조용한 주거 + 편의시설", transit: "6, 4/5 라인. Grand Central 도보", schools: "싱글/커플 적합. 가족 학군 보통", priceNote: "미드타운 대비 가성비. 코압 $350K–$600K" },
  "Hudson Yards": { vibe: "최신 개발지. 럭셔리 쇼핑(The Shops), The Vessel. 모던한 고급 분위기", transit: "7 라인 연장. 34th St-Hudson Yards", schools: "신규 개발지라 학군 형성 중", priceNote: "럭셔리 신축 콘도 $1M–$5M+" },
  "Hell's Kitchen": { vibe: "타임스퀘어 인접하지만 로컬 분위기 유지. 다양한 레스토랑, 극장가. LGBTQ+ 프렌들리", transit: "A/C/E, N/Q/R/W, 1/2/3 라인", schools: "싱글/커플 적합. PS 111", priceNote: "미드타운 웨스트 가성비. 코압 $300K–$600K" },
  "Kips Bay": { vibe: "병원(NYU Langone, Bellevue) 인접. 조용한 주거지. 의료진 많이 거주", transit: "6 라인. 23rd, 28th, 33rd St", schools: "보통 학군. 가족보다 직장인 적합", priceNote: "가성비 좋은 맨해튼. 코압 $300K–$500K" },
  "Gramercy": { vibe: "프라이빗 Gramercy Park 중심. 조용하고 고급스러운 주거지. 전통적 매력", transit: "6, L, N/R 라인. 14th St-Union Sq 인접", schools: "PS 40, Epiphany School. 가족 선호", priceNote: "코압 $400K–$800K. Gramercy Park 키 보유 프리미엄" },
  "Battery Park City": { vibe: "허드슨 리버 워터프론트. 계획 도시 느낌. 공원 많고 가족 친화적. 조용", transit: "1 라인, E 라인. Brookfield Place", schools: "PS 276, Stuyvesant HS 인접. 가족 최적 학군", priceNote: "콘도 $600K–$1.2M. 리버뷰 프리미엄" },
  "Williamsburg": { vibe: "브루클린 힙스터 문화 중심지. 카페·바·빈티지숍. 젊은 크리에이티브 밀집. 맨해튼 스카이라인 뷰", transit: "L, G, J/M/Z 라인. Bedford Ave", schools: "PS 84, PS 132. 차터스쿨 인기", priceNote: "브루클린 프리미엄 지역. 콘도 $600K–$1.2M, 렌트 $3K–$4.5K/mo" },
  "DUMBO": { vibe: "브루클린 브릿지 뷰 아이코닉. 테크 스타트업 허브. 고급 콘도 + 갤러리", transit: "F, A/C 라인. York St, High St", schools: "PS 307. 가족 거주 증가 추세", priceNote: "브루클린 최고가. 콘도 $1M–$3M+" },
  "Brooklyn Heights": { vibe: "NYC 최초 역사보호구역. 브라운스톤 거리. 프로미네이드에서 맨해튼 스카이라인 뷰. 가족 최적", transit: "2/3, 4/5, A/C, R 라인. Borough Hall", schools: "PS 8 (NYC 최고 공립 중 하나). Packer Collegiate 사립", priceNote: "브루클린 최고급. 코압 $500K–$1.5M, 콘도 $800K–$2M" },
  "Park Slope": { vibe: "가족 중심 주거지. 프로스펙트 파크 인접. 브라운스톤 주택가. 유기농·친환경 문화", transit: "F, G, R, B/Q, 2/3 라인", schools: "PS 321 (NYC 최고 학군). MS 51. 사립 Berkeley Carroll", priceNote: "브루클린 프리미엄. 브라운스톤 $1.5M–$3M, 콘도 $600K–$1.2M" },
  "Greenpoint": { vibe: "폴란드 이민자 역사 + 현재 아티스트·크리에이티브 커뮤니티. 윌리엄스버그보다 조용하고 로컬 느낌", transit: "G 라인. Nassau Ave. NYC Ferry", schools: "PS 110, PS 31. 보통 학군", priceNote: "윌리엄스버그보다 소폭 저렴. 콘도 $500K–$900K" },
  "Downtown Brooklyn": { vibe: "상업·쇼핑 중심. 신축 고층 콘도 빠르게 증가. 교통 허브", transit: "거의 모든 브루클린 노선. Atlantic Terminal, Jay St", schools: "가족보다 직장인 적합. PS 287", priceNote: "신축 콘도 $500K–$1M. 가성비 좋은 편" },
  "Bedford-Stuyvesant": { vibe: "아프리칸 아메리칸 문화 중심. 브라운스톤 매력. 젠트리피케이션 진행 중. 커뮤니티 강함", transit: "A/C, G, J/M/Z 라인", schools: "학군 편차 큼. 차터스쿨 다수", priceNote: "브루클린 가성비 최고. 브라운스톤 $800K–$1.5M, 콘도 $400K–$700K" },
  "Crown Heights": { vibe: "다양한 문화 혼합(카리비안, 하시딕 유대인). Brooklyn Museum, Prospect Park 인접. 활기찬 분위기", transit: "2/3, 4/5, S 라인. Franklin Ave", schools: "학군 편차 있음. PS 9, PS 138", priceNote: "가성비 우수. 콘도 $400K–$700K, 렌트 $2K–$3K/mo" },
  "Prospect Heights": { vibe: "Barclays Center, Brooklyn Museum 인접. 젊은 가족·전문직 밀집. 세련된 분위기", transit: "2/3, B/Q 라인. Atlantic Ave-Barclays", schools: "PS 9, PS 705. 학군 양호", priceNote: "Park Slope보다 저렴. 콘도 $500K–$900K" },
  "Fort Greene": { vibe: "BAM(Brooklyn Academy of Music) 중심. 문화·예술 커뮤니티. 브라운스톤 + 다양성", transit: "C, G, B/Q/R 라인. DeKalb Ave", schools: "PS 20, PS 67. Fort Greene Park 도보권", priceNote: "코압 $300K–$600K, 콘도 $500K–$900K" },
  "Clinton Hill": { vibe: "Pratt Institute 인접. 아티스트 + 가족 혼합. 빅토리안 주택가. 나무 많은 거리", transit: "G, C 라인. Clinton-Washington Ave", schools: "PS 11, PS 56. 학군 양호", priceNote: "Fort Greene 대비 소폭 저렴. 콘도 $400K–$800K" },
  "Cobble Hill": { vibe: "소규모 부티크·카페 중심. 가족 친화적. Brooklyn Heights와 유사한 조용한 고급 분위기", transit: "F/G 라인. Bergen St", schools: "PS 29 (인기 학군). Brooklyn Friends School 사립", priceNote: "브루클린 프리미엄. 코압 $400K–$800K, 브라운스톤 $2M+" },
  "Boerum Hill": { vibe: "앤틱숍·독립서점·레스토랑. Brooklyn Heights와 Park Slope 사이. 가족 + 전문직", transit: "F/G, A/C, 2/3/4/5 라인. Hoyt-Schermerhorn", schools: "PS 38, MS 51. 양호 학군", priceNote: "코압 $400K–$700K. 타운하우스 $1.5M+" },
  "Long Island City": { vibe: "맨해튼 스카이라인 뷰 최고. 신축 고층 콘도. MoMA PS1 아트씬. 빠른 맨해튼 접근", transit: "7, E/M, G, N/W 라인. 맨해튼까지 1 정거장", schools: "PS 78, PS 1. 학군 빠르게 개선 중", priceNote: "맨해튼 대비 가성비 최고. 콘도 $500K–$1M, 렌트 $2.5K–$4K/mo" },
  "Astoria": { vibe: "그리스계 커뮤니티 역사 + 현재 다문화 음식 천국. 가족 친화적. 공원 많음", transit: "N/W, R 라인. 맨해튼 20분", schools: "PS 122, PS 85. 학군 양호", priceNote: "퀸즈 가성비. 코압 $200K–$400K, 콘도 $400K–$700K" },
  "Flushing": { vibe: "대규모 아시안(중국계, 한국계) 커뮤니티. 아시아 음식 최고. 활기차고 붐비는 분위기", transit: "7 라인 종점. LIRR. 맨해튼 40분", schools: "우수 학군. Stuyvesant, Bronx Science 입학 비율 높음", priceNote: "가성비 최고. 콘도 $300K–$600K, 코압 $150K–$350K" },
  "Forest Hills": { vibe: "조용한 교외 느낌. Tudor 스타일 주택. Forest Hills Gardens 고급 주거지. 가족 최적", transit: "E/F, R 라인. 맨해튼 30분", schools: "우수 학군. PS 144, Forest Hills HS", priceNote: "코압 $200K–$500K, 콘도 $400K–$800K" },
  "Jackson Heights": { vibe: "세계에서 가장 다양한 동네 중 하나. 인도·콜롬비아·필리핀 등 다문화. 음식 다양성 최고", transit: "7, E/F/M/R 라인. Roosevelt Ave 허브", schools: "PS 69, PS 149. 다양한 이중언어 프로그램", priceNote: "퀸즈 최저가. 코압 $150K–$350K" },
  "Sunnyside": { vibe: "중산층 주거지. Sunnyside Gardens 역사 주택가. 조용하고 커뮤니티 강함", transit: "7 라인. 맨해튼 15분", schools: "PS 150, PS 199. 양호 학군", priceNote: "LIC 대비 가성비. 코압 $200K–$400K" },
  "Riverdale": { vibe: "브롱스 최고급 주거지. 교외 느낌. 허드슨 리버 뷰. 대형 주택 + 가족 중심", transit: "1 라인. 맨해튼 45분", schools: "Horace Mann, Riverdale Country School 명문 사립. 공립도 양호", priceNote: "브롱스 프리미엄. 코압 $200K–$500K, 하우스 $600K–$1.5M" },
  "Mott Haven": { vibe: "사우스 브롱스. 재개발 활발. Piano District 신축 콘도. 저렴한 진입점", transit: "6, 4/5 라인. 맨해튼 20분", schools: "학군 개선 중. 차터스쿨 다수", priceNote: "NYC 최저가 진입점 중 하나. 콘도 $300K–$600K" },
  "Jersey City": { vibe: "맨해튼 워터프론트 뷰. 빠른 PATH 접근. 다양한 문화 + 급성장 중. 레스토랑 씬 활발", transit: "PATH(맨해튼 15분), NJ Transit, Light Rail, Ferry", schools: "PS 3, PS 5. McNair Academic HS (NJ 최고 중 하나). 차터스쿨 인기", priceNote: "맨해튼 대비 30–40% 저렴. 콘도 $400K–$800K, 렌트 $2.5K–$3.5K/mo" },
  "Hoboken": { vibe: "1마일 스퀘어 도시. 젊은 전문직 밀집. 바·레스토랑 활발. 가족도 증가 중", transit: "PATH(맨해튼 10분), Ferry, NJ Transit", schools: "Hoboken Dual Language Charter. 공립 학군 소규모지만 양호", priceNote: "NJ 프리미엄. 콘도 $500K–$900K, 렌트 $2.5K–$4K/mo" },
  "Weehawken": { vibe: "맨해튼 스카이라인 뷰 최고 명당. 조용한 주거지. 워터프론트 고급 콘도", transit: "NJ Transit 버스, Ferry(맨해튼 10분), Lincoln Tunnel 인접", schools: "소규모 학군. Theodore Roosevelt School", priceNote: "뷰 프리미엄. 콘도 $500K–$1M" },
  "Fort Lee": { vibe: "GWB 인접. 한국계 커뮤니티 최대. 한국 마트·식당 밀집. 가족 친화적", transit: "GWB 버스(맨해튼 30분). 차량 필수는 아니지만 편리", schools: "Fort Lee School District. 학군 양호. 한국어 이중언어 프로그램", priceNote: "콘도 $300K–$600K. 한인 커뮤니티 인프라 최고" },
  "Edgewater": { vibe: "허드슨 리버 워터프론트. 조용한 교외 + 쇼핑(Mitsuwa 일본마트). 가족 적합", transit: "NJ Transit 버스. Ferry(맨해튼 20분)", schools: "소규모 학군. Eleanor Van Gelder School", priceNote: "콘도 $300K–$500K. 리버 뷰 가성비" },
  "Newark": { vibe: "NJ 최대 도시. 재개발 진행 중. Ironbound 포르투갈 커뮤니티 음식 유명. 문화 다양성", transit: "PATH, NJ Transit, Newark Penn Station. EWR 공항 인접", schools: "학군 편차 큼. 매그넷 스쿨(Science Park HS) 우수", priceNote: "NJ 최저가 진입점. 콘도 $200K–$400K" },
  "Montclair": { vibe: "교외 + 도시 문화 혼합. 아트·음악·다양성. 트렌디한 다운타운. 가족 최적", transit: "NJ Transit(맨해튼 45분). 차량 권장", schools: "Montclair School District 우수. Montclair HS", priceNote: "NJ 프리미엄 교외. 하우스 $500K–$1M+" },
};

function MarketInsights({ results, lang }: { results: Listing[]; lang: "en" | "ko" }) {
  if (results.length === 0) return null;

  const prices = results.map((r) => r.price);
  const medianPrice = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  const avgPsf =
    results.reduce((sum, r) => sum + (r.sqft > 0 ? r.price / r.sqft : 0), 0) / results.length;
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

  const insights = [
    {
      icon: TrendingUp,
      label: lang === "en" ? "Median Price" : "중간 가격",
      value: fmt(medianPrice),
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-white",
      iconBg: "bg-blue-100 text-blue-500",
    },
    {
      icon: BarChart3,
      label: lang === "en" ? "Avg $/sqft" : "평균 $/평방피트",
      value: `$${Math.round(avgPsf).toLocaleString()}`,
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-white",
      iconBg: "bg-violet-100 text-violet-500",
    },
    {
      icon: ListFilter,
      label: lang === "en" ? "Total Listings" : "총 매물 수",
      value: results.length.toString(),
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-white",
      iconBg: "bg-emerald-100 text-emerald-500",
    },
    {
      icon: DollarSign,
      label: lang === "en" ? "Price Range" : "가격 범위",
      value: `${fmt(minP)} – ${fmt(maxP)}`,
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-50 to-white",
      iconBg: "bg-orange-100 text-orange-500",
    },
  ];

  // Group by area
  const byArea: Record<string, { count: number; prices: number[]; sqfts: number[]; hoas: number[] }> = {};
  for (const r of results) {
    const a = r.area || "Unknown";
    if (!byArea[a]) byArea[a] = { count: 0, prices: [], sqfts: [], hoas: [] };
    byArea[a].count++;
    if (r.price) byArea[a].prices.push(r.price);
    if (r.sqft) byArea[a].sqfts.push(r.sqft);
    if (r.hoa) byArea[a].hoas.push(r.hoa);
  }

  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  };
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  // Best deals by $/sqft
  const bestDeals = results
    .filter((r) => r.price && r.sqft && r.sqft > 0)
    .sort((a, b) => a.price / a.sqft - b.price / b.sqft)
    .slice(0, 3);

  const areas = Object.entries(byArea).sort((a, b) => b[1].count - a[1].count);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10 space-y-6"
    >
      {/* Summary cards */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-bold text-gray-700">
            {lang === "en" ? "Market Insights" : "시장 분석"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {insights.map((insight) => (
            <motion.div
              key={insight.label}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={spring}
              className={`rounded-xl border border-gray-100 ${insight.bg} p-4`}
            >
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${insight.iconBg}`}>
                <insight.icon className="h-4 w-4" />
              </div>
              <div className={`text-lg font-bold ${insight.color}`}>{insight.value}</div>
              <div className="text-xs text-gray-400">{insight.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Area breakdown table */}
      {areas.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-gray-700">
              {lang === "en" ? "By Neighborhood" : "지역별 분석"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-100 text-left text-gray-400">
                  <th className="px-3 py-2 font-semibold">{lang === "en" ? "Area" : "지역"}</th>
                  <th className="px-3 py-2 text-center font-semibold">{lang === "en" ? "Listings" : "매물 수"}</th>
                  <th className="px-3 py-2 text-right font-semibold">{lang === "en" ? "Median $" : "중위 가격"}</th>
                  <th className="px-3 py-2 text-right font-semibold">{lang === "en" ? "Avg Sqft" : "평균 면적"}</th>
                  <th className="px-3 py-2 text-right font-semibold">$/sqft</th>
                  <th className="px-3 py-2 text-right font-semibold">{lang === "en" ? "Avg HOA" : "평균 HOA"}</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(([area, d]) => {
                  const mp = median(d.prices);
                  const as2 = avg(d.sqfts);
                  const ah = avg(d.hoas);
                  const pps = as2 ? Math.round(avg(d.prices) / as2) : 0;
                  return (
                    <tr key={area} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">{area}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{d.count}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-800">${mp.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{as2.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">${pps.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">${ah.toLocaleString()}/mo</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Neighborhood Report */}
      {areas.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-gray-700">
              {lang === "en" ? "Neighborhood Report" : "동네 분석 보고서"}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map(([area]) => {
              const profile = NEIGHBORHOOD_PROFILES[area];
              if (!profile) return null;
              return (
                <div key={area} className="rounded-xl border border-gray-100 bg-gradient-to-br from-indigo-50/50 to-white p-4">
                  <h3 className="mb-2 text-sm font-bold text-gray-800">{area}</h3>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-indigo-500">분위기</span>
                      <span>{profile.vibe}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-blue-500">교통</span>
                      <span>{profile.transit}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-emerald-500">학군</span>
                      <span>{profile.schools}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-semibold text-orange-500">시세</span>
                      <span>{profile.priceNote}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best deals */}
      {bestDeals.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-gray-700">
              {lang === "en" ? "Best Deals by $/sqft" : "$/sqft 기준 Best Deals"}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {bestDeals.map((d, i) => (
              <div key={d.zpid || i} className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                <div className="mb-1 text-lg font-bold text-emerald-600">
                  ${Math.round(d.price / d.sqft).toLocaleString()}/sqft
                </div>
                <div className="text-xs font-semibold text-gray-800">{d.address}</div>
                <div className="mt-1 text-xs text-gray-400">
                  ${d.price.toLocaleString()} · {d.sqft.toLocaleString()}sqft · {d.beds}bd/{d.baths}ba
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

// ─── Input Components ─────────────────────────────────────────────────────────

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Address Autocomplete (Nominatim) ─────────────────────────────────────────

function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  lang: "en" | "ko";
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => { setQuery(value); }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=us&addressdetails=1`, {
      headers: { "User-Agent": "FirstHomeAI/1.0" },
    })
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data || []);
        setShowDropdown(true);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  };

  const handleInput = (v: string) => {
    setQuery(v);
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(v), 400);
  };

  const selectSuggestion = (s: { display_name: string }) => {
    setQuery(s.display_name);
    onChange(s.display_name);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">
        {lang === "en" ? "Destination" : "목적지"}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
        <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            {loading && (
              <div className="px-4 py-3 text-xs text-gray-400">
                {lang === "en" ? "Searching..." : "검색 중..."}
              </div>
            )}
            {!loading && suggestions.length === 0 && query.length >= 3 && (
              <div className="px-4 py-3 text-xs text-gray-400">
                {lang === "en" ? "No matches found" : "일치하는 결과 없음"}
              </div>
            )}
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-gray-700 transition hover:bg-blue-50"
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{s.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AmenityToggle({
  label,
  value,
  onChange,
  lang,
}: {
  label: string;
  value: "any" | "required";
  onChange: (v: "any" | "required") => void;
  lang: "en" | "ko";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-1.5">
        {(["any", "required"] as const).map((opt) => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            onClick={() => onChange(opt)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              value === opt
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {opt === "any"
              ? lang === "en" ? "Any" : "상관없음"
              : lang === "en" ? "Required" : "필수"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BED_BATH_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Studio", value: "0" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Largest", value: "largest" },
  { label: "Monthly ↑", value: "monthly_asc" },
];

const STORAGE_KEY = "firsthome_search";

function saveSearchState(filters: Filters, results: Listing[], sortBy: SortOption) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, results, sortBy, ts: Date.now() }));
  } catch {}
}

function loadSearchState(): { filters: Filters; results: Listing[]; sortBy: SortOption } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - (data.ts || 0) > 30 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { filters: { ...defaultFilters, ...data.filters }, results: data.results || [], sortBy: data.sortBy || "newest" };
  } catch { return null; }
}

export default function SearchPage() {
  const { lang, setLang } = useLanguageStore();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [nlQuery, setNlQuery] = useState("");
  const [sqftUnit, setSqftUnit] = useState<"sqft" | "pyeong">("sqft");

  // Restore previous search from sessionStorage on mount
  useEffect(() => {
    const saved = loadSearchState();
    if (saved) {
      setFilters(saved.filters);
      setResults(saved.results);
      setSortBy(saved.sortBy);
      setSearched(true);
    }
  }, []);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNLSearch = () => {
    if (!nlQuery.trim()) return;
    const parsed = parseNaturalLanguage(nlQuery);
    setFilters((prev) => ({ ...prev, ...parsed, naturalQuery: nlQuery }));
    handleSearch({ ...filters, ...parsed, naturalQuery: nlQuery });
  };

  const handleSearch = async (overrideFilters?: Filters) => {
    const activeFilters = overrideFilters ?? filters;

    // If no areas selected, don't search
    if (activeFilters.selectedNYCAreas.length === 0 && activeFilters.selectedNJAreas.length === 0) {
      console.warn("No areas selected — skipping search");
      setSearched(true);
      setResults([]);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      console.log("Searching with filters:", JSON.stringify(activeFilters, null, 2));
      const response = await fetch(`/api/search?_t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(activeFilters),
      });
      if (!response.ok) {
        console.error("Search response not OK:", response.status);
        throw new Error("Search failed");
      }
      const data = await response.json();
      console.log(`Search returned ${data.listings?.length ?? 0} listings`);
      const listings = data.listings ?? [];
      setResults(listings);
      saveSearchState(activeFilters, listings, sortBy);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setNlQuery("");
    setResults([]);
    setSearched(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const downloadCSV = () => {
    if (sortedResults.length === 0) return;
    const headers = ["Address", "Area", "Price", "Type", "Beds", "Baths", "Sqft", "HOA/mo", "Tax/mo", "Total/mo", "Year Built", "Days Listed", "Zillow URL", "StreetEasy URL"];
    const rows = sortedResults.map((l) => {
      const taxMo = l.taxMonthly ?? Math.round(l.tax / 12);
      const seUrl = (l as any).streeteasyUrl || buildStreetEasySearchUrl(l.address, l.area) || "";
      return [
        `"${l.address}"`, l.area, l.price, l.type, l.beds, l.baths, l.sqft,
        l.hoa || 0, taxMo, (l.hoa || 0) + taxMo, l.yearBuilt || "",
        l.daysText || (l.daysOnMarket > 0 ? `${l.daysOnMarket}d` : ""),
        l.zillowUrl, seUrl,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `firsthome_search_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "largest": return b.sqft - a.sqft;
      case "monthly_asc": return (a.hoa + a.tax / 12) - (b.hoa + b.tax / 12);
      default: return a.daysOnMarket - b.daysOnMarket;
    }
  });

  const t = (en: string, ko: string) => lang === "en" ? en : ko;

  const toggleLang = () => setLang(lang === "en" ? "ko" : "en");

  // Active filter count
  const activeFilterCount = [
    filters.selectedNYCAreas.length > 0,
    filters.selectedNJAreas.length > 0,
    filters.types.length > 0,
    filters.minPrice || filters.maxPrice,
    filters.minBeds,
    filters.minBaths,
    filters.minSqft || filters.maxSqft,
    filters.builtAfter,
    filters.daysOnMarket,
    filters.commuteDestination,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Nav />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white pb-10 pt-14">
        {/* Soft pastel blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -15, 25, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute -top-16 left-1/4 h-72 w-72 rounded-full bg-blue-100/70 blur-[80px]"
          />
          <motion.div
            animate={{ x: [0, -25, 18, 0], y: [0, 20, -12, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute -top-8 right-1/4 h-56 w-56 rounded-full bg-pink-100/60 blur-[70px]"
          />
          <motion.div
            animate={{ x: [0, 18, -28, 0], y: [0, -18, 14, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-8 right-8 h-48 w-48 rounded-full bg-emerald-100/50 blur-[60px]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-500"
          >
            <Home className="h-3.5 w-3.5" />
            {t("NYC & NJ Property Search", "NYC & NJ 매물 검색")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
          >
            {lang === "en" ? (
              <>
                Find Your{" "}
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  Dream Home
                </span>
              </>
            ) : (
              <>
                내가 꿈꾸던{" "}
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  집
                </span>
                을 찾아보세요
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mb-7 text-base text-gray-400"
          >
            {t(
              "Search smarter — just describe what you want",
              "원하는 매물의 조건을 구체적으로 설명해보세요"
            )}
          </motion.p>

          {/* Natural Language Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-100 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500">
                <Search className="h-4.5 w-4.5 text-white" />
              </div>
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNLSearch()}
                placeholder={
                  lang === "en"
                    ? "Try: '1BR condo under 800K in LIC with washer/dryer'"
                    : "'LIC 1베드 콘도 80만불 이하 세탁기 포함'"
                }
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none"
              />
              {nlQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setNlQuery("")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 hover:text-gray-500"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                onClick={handleNLSearch}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-600"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Search", "검색")}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6">

        {/* ── Filters Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <motion.button
            whileHover={{ backgroundColor: "#F9FAFB" }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-between px-6 py-4 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <span className="font-bold text-gray-800">{t("Filters", "필터")}</span>
              {activeFilterCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                  className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600"
                >
                  {activeFilterCount} {t("active", "활성")}
                </motion.span>
              )}
            </div>
            <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 px-6 pb-6 pt-5">
                  <div className="grid gap-6">

                    {/* Location */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {t("Location", "지역")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <MultiSelect
                          label={t("NYC Areas", "뉴욕시 지역")}
                          groups={NYC_AREAS}
                          selected={filters.selectedNYCAreas}
                          onChange={(v) => updateFilter("selectedNYCAreas", v)}
                          lang={lang}
                        />
                        <MultiSelect
                          label={t("NJ Areas", "뉴저지 지역")}
                          groups={NJ_AREAS}
                          selected={filters.selectedNJAreas}
                          onChange={(v) => updateFilter("selectedNJAreas", v)}
                          lang={lang}
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Building2 className="h-3.5 w-3.5" />
                        {t("Property Type", "매물 유형")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map((type) => (
                          <motion.button
                            key={type}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={spring}
                            onClick={() => toggleType(type)}
                            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                              filters.types.includes(type)
                                ? "border-blue-400 bg-blue-500 text-white shadow-md shadow-blue-200"
                                : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-500"
                            }`}
                          >
                            {type}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <DollarSign className="h-3.5 w-3.5" />
                        {t("Price Range", "가격 범위")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FilterInput
                          label={t("Min Price ($)", "최소 가격 ($)")}
                          value={filters.minPrice}
                          onChange={(v) => updateFilter("minPrice", v)}
                          placeholder="e.g. 500000"
                          type="number"
                        />
                        <FilterInput
                          label={t("Max Price ($)", "최대 가격 ($)")}
                          value={filters.maxPrice}
                          onChange={(v) => updateFilter("maxPrice", v)}
                          placeholder="e.g. 1200000"
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Beds & Baths */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <BedDouble className="h-3.5 w-3.5" />
                        {t("Bedrooms & Bathrooms", "방 수 & 화장실")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FilterSelect
                          label={t("Bedrooms", "방 수")}
                          value={filters.minBeds}
                          onChange={(v) => updateFilter("minBeds", v)}
                          options={BED_BATH_OPTIONS.map((o) =>
                            lang === "en" ? o : { ...o, label: o.label === "Any" ? "상관없음" : o.label === "Studio" ? "스튜디오" : o.label }
                          )}
                        />
                        <FilterSelect
                          label={t("Bathrooms", "화장실")}
                          value={filters.minBaths}
                          onChange={(v) => updateFilter("minBaths", v)}
                          options={BED_BATH_OPTIONS.filter((o) => o.label !== "Studio").map((o) =>
                            lang === "en" ? o : { ...o, label: o.label === "Any" ? "상관없음" : o.label }
                          )}
                        />
                      </div>
                    </div>

                    {/* Sqft Range */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Ruler className="h-3.5 w-3.5" />
                        {t("Sqft Range", "면적 범위")}
                        <div className="ml-auto flex gap-1">
                          {(["sqft", "pyeong"] as const).map((unit) => (
                            <button
                              key={unit}
                              onClick={() => setSqftUnit(unit)}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                                sqftUnit === unit
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            >
                              {unit === "sqft" ? "sqft" : "평"}
                            </button>
                          ))}
                        </div>
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FilterInput
                          label={`${t("Min Sqft", "최소 면적")} (${sqftUnit})`}
                          value={filters.minSqft}
                          onChange={(v) => {
                            const val = sqftUnit === "pyeong" ? String(Math.round(Number(v) * 35.58)) : v;
                            updateFilter("minSqft", val);
                          }}
                          placeholder={sqftUnit === "sqft" ? "e.g. 500" : "e.g. 14"}
                          type="number"
                        />
                        <FilterInput
                          label={`${t("Max Sqft", "최대 면적")} (${sqftUnit})`}
                          value={filters.maxSqft}
                          onChange={(v) => {
                            const val = sqftUnit === "pyeong" ? String(Math.round(Number(v) * 35.58)) : v;
                            updateFilter("maxSqft", val);
                          }}
                          placeholder={sqftUnit === "sqft" ? "e.g. 1500" : "e.g. 42"}
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Monthly Costs */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Layers className="h-3.5 w-3.5" />
                        {t("Monthly Costs", "월 비용")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <FilterInput
                          label={t("Min HOA ($/mo)", "최소 관리비 ($/월)")}
                          value={filters.minHOA}
                          onChange={(v) => updateFilter("minHOA", v)}
                          placeholder="0"
                          type="number"
                        />
                        <FilterInput
                          label={t("Max HOA ($/mo)", "최대 관리비 ($/월)")}
                          value={filters.maxHOA}
                          onChange={(v) => updateFilter("maxHOA", v)}
                          placeholder="2000"
                          type="number"
                        />
                        <FilterInput
                          label={t("Max Tax ($/yr)", "최대 세금 ($/년)")}
                          value={filters.maxTax}
                          onChange={(v) => updateFilter("maxTax", v)}
                          placeholder="24000"
                          type="number"
                        />
                        <FilterInput
                          label={t("Min HOA+Tax Total ($/mo)", "최소 관리비+세금 합계 ($/월)")}
                          value={filters.minHOATax}
                          onChange={(v) => updateFilter("minHOATax", v)}
                          placeholder="0"
                          type="number"
                        />
                        <FilterInput
                          label={t("Max HOA+Tax Total ($/mo)", "최대 관리비+세금 합계 ($/월)")}
                          value={filters.maxHOATax}
                          onChange={(v) => updateFilter("maxHOATax", v)}
                          placeholder="3000"
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Year Built */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {t("Year Built", "건축년도")}
                      </h3>
                      <div className="max-w-xs">
                        <FilterInput
                          label={t("Built After", "건축년도 (이후)")}
                          value={filters.builtAfter}
                          onChange={(v) => updateFilter("builtAfter", v)}
                          placeholder="e.g. 2000"
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Listed Within (Days on Market) */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {t("Listed Within", "매물 등록 기간")}
                      </h3>
                      <div className="max-w-xs">
                        <FilterSelect
                          label={t("Days on Market", "등록 기간")}
                          value={filters.daysOnMarket}
                          onChange={(v) => updateFilter("daysOnMarket", v)}
                          options={[
                            { label: t("Any", "전체"), value: "" },
                            { label: t("1 day", "1일"), value: "1" },
                            { label: t("3 days", "3일"), value: "3" },
                            { label: t("7 days", "7일"), value: "7" },
                            { label: t("14 days", "14일"), value: "14" },
                            { label: t("30 days", "30일"), value: "30" },
                            { label: t("90 days", "90일"), value: "90" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Amenities — filtered via Zillow search API */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Building2 className="h-3.5 w-3.5" />
                        {t("Amenities", "편의시설")}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <AmenityToggle
                          label={t("Elevator", "엘리베이터")}
                          value={filters.elevator}
                          onChange={(v) => updateFilter("elevator", v)}
                          lang={lang}
                        />
                        <AmenityToggle
                          label={t("In-Unit W/D", "세탁기/건조기")}
                          value={filters.washerDryer}
                          onChange={(v) => updateFilter("washerDryer", v)}
                          lang={lang}
                        />
                        <AmenityToggle
                          label={t("Parking", "주차")}
                          value={filters.parking}
                          onChange={(v) => updateFilter("parking", v)}
                          lang={lang}
                        />
                      </div>
                    </div>

                    {/* Commute Time — Zillow-style */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Train className="h-3.5 w-3.5" />
                        {t("Commute Time", "통근 시간")}
                      </h3>
                      <div className="space-y-4">
                        {/* Address autocomplete */}
                        <AddressAutocomplete
                          value={filters.commuteDestination}
                          onChange={(v) => updateFilter("commuteDestination", v)}
                          placeholder={t("Enter address, city, state and ZIP code", "주소, 도시, 주, 우편번호 입력")}
                          lang={lang}
                        />

                        {/* Travel Mode */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                            {t("Travel Mode", "이동 수단")}
                          </label>
                          <div className="flex gap-1.5">
                            {([
                              { value: "driving", en: "Drive", ko: "운전", icon: Car },
                              { value: "transit", en: "Transit", ko: "대중교통", icon: Train },
                              { value: "walking", en: "Walk", ko: "도보", icon: Footprints },
                            ] as const).map((mode) => (
                              <motion.button
                                key={mode.value}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                transition={spring}
                                onClick={() => updateFilter("commuteMode", mode.value)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                                  filters.commuteMode === mode.value
                                    ? "border-blue-200 bg-blue-50 text-blue-600"
                                    : "border-gray-200 text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                <mode.icon className="h-3.5 w-3.5" />
                                {t(mode.en, mode.ko)}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Max Travel Time — button group + custom input */}
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                            {t("Max. Travel Time", "최대 이동 시간")}
                          </label>
                          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                            {[
                              { label: "60min", value: "60" },
                              { label: "45min", value: "45" },
                              { label: "30min", value: "30" },
                              { label: "15min", value: "15" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateFilter("commuteMaxMinutes", opt.value)}
                                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-all ${
                                  filters.commuteMaxMinutes === opt.value
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={!["60", "45", "30", "15"].includes(filters.commuteMaxMinutes) ? filters.commuteMaxMinutes : ""}
                                onChange={(e) => updateFilter("commuteMaxMinutes", e.target.value)}
                                placeholder={t("Custom", "직접입력")}
                                className={`h-full w-full border-l border-gray-200 px-2 py-2.5 text-center text-xs font-semibold outline-none ${
                                  filters.commuteMaxMinutes && !["60", "45", "30", "15"].includes(filters.commuteMaxMinutes)
                                    ? "bg-blue-500 text-white placeholder-blue-200"
                                    : "bg-white text-gray-500 placeholder-gray-400"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 border-t border-gray-100 pt-5">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={() => handleSearch()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-600"
                      >
                        <Search className="h-4 w-4" />
                        {t("Search Properties", "매물 검색")}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t("Reset", "초기화")}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Results Section ── */}
        {(loading || searched) && (
          <section>
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    layout
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600"
                  >
                    {sortedResults.length.toLocaleString()}{" "}
                    {lang === "en" ? "properties" : "개 매물"}
                  </motion.span>
                  <span className="text-sm font-semibold text-gray-700">
                    {t("Results", "검색 결과")}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={spring}
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-emerald-300 hover:text-emerald-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    CSV
                  </motion.button>
                </div>

                {sortedResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t("Sort:", "정렬:")}</span>
                    <div className="flex gap-1.5">
                      {SORT_OPTIONS.map((opt) => (
                        <motion.button
                          key={opt.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={spring}
                          onClick={() => setSortBy(opt.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            sortBy === opt.value
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {loading && <LoadingState lang={lang} />}

            {!loading && sortedResults.length === 0 && (
              <EmptyState searched={searched} lang={lang} />
            )}

            {!loading && sortedResults.length > 0 && (
              <>
                <motion.div
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { delayChildren: 0.05, staggerChildren: 0.05 },
                    },
                  }}
                >
                  {sortedResults.map((listing) => (
                    <motion.div
                      key={listing.zpid}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={spring}
                    >
                      <ListingCard listing={listing} lang={lang} commuteDestination={filters.commuteDestination} />
                    </motion.div>
                  ))}
                </motion.div>

                <MarketInsights results={results} lang={lang} />
              </>
            )}
          </section>
        )}

        {!loading && !searched && (
          <EmptyState searched={false} lang={lang} />
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">Made with care by Kelly</p>
      </footer>
    </div>
  );
}
