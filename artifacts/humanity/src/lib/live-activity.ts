// Live Humanity Map — activity data layer.
//
// PRIVACY: markers are NEVER exact user coordinates. We anchor activity to a
// curated set of major city/region centroids and apply a coarse random jitter
// (~tens of kilometres) so a point only ever communicates an approximate
// region — never a street-level or precise location.
//
// FUTURE-READY: the UI depends only on the `ActivitySource` interface below.
// Today we ship `MockActivitySource`. To wire real-time data later, implement
// the same interface backed by WebSockets / Supabase realtime / Firebase /
// any event stream and swap the instance in `getActivitySource()`. No UI
// changes are required.

export type ActivityType =
  | "active"
  | "new_member"
  | "pledge"
  | "cultural"
  | "dinner";

export interface ActivityMarker {
  id: string;
  type: ActivityType;
  /** Approximate latitude (region-level, jittered). */
  lat: number;
  /** Approximate longitude (region-level, jittered). */
  lng: number;
  /** Region / major-city area label (never a precise address). */
  region: string;
  country: string;
  countryCode: string;
  /** Epoch ms when this activity was observed. */
  at: number;
}

export interface GlobalStats {
  activeOnline: number;
  countriesRepresented: number;
  languagesSpoken: number;
  pledgesSigned: number;
  culturalExchanges: number;
}

export interface ActivitySnapshot {
  markers: ActivityMarker[];
  stats: GlobalStats;
}

export interface ActivitySource {
  /** Current immediate snapshot. */
  getSnapshot(): ActivitySnapshot;
  /** Subscribe to live updates. Returns an unsubscribe function. */
  subscribe(listener: (snap: ActivitySnapshot) => void): () => void;
}

interface CityAnchor {
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  lang: string;
}

// Curated regional anchors spread across every inhabited continent. These are
// well-known metro-area centroids used only as coarse anchors for jittered,
// privacy-safe markers.
const ANCHORS: CityAnchor[] = [
  { region: "New York", country: "United States", countryCode: "US", lat: 40.71, lng: -74.0, lang: "English" },
  { region: "Los Angeles", country: "United States", countryCode: "US", lat: 34.05, lng: -118.24, lang: "English" },
  { region: "Chicago", country: "United States", countryCode: "US", lat: 41.88, lng: -87.63, lang: "English" },
  { region: "Toronto", country: "Canada", countryCode: "CA", lat: 43.65, lng: -79.38, lang: "English" },
  { region: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.43, lng: -99.13, lang: "Spanish" },
  { region: "Bogotá", country: "Colombia", countryCode: "CO", lat: 4.71, lng: -74.07, lang: "Spanish" },
  { region: "Lima", country: "Peru", countryCode: "PE", lat: -12.05, lng: -77.04, lang: "Spanish" },
  { region: "Santiago", country: "Chile", countryCode: "CL", lat: -33.45, lng: -70.67, lang: "Spanish" },
  { region: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6, lng: -58.38, lang: "Spanish" },
  { region: "São Paulo", country: "Brazil", countryCode: "BR", lat: -23.55, lng: -46.63, lang: "Portuguese" },
  { region: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.91, lng: -43.17, lang: "Portuguese" },
  { region: "London", country: "United Kingdom", countryCode: "GB", lat: 51.51, lng: -0.13, lang: "English" },
  { region: "Paris", country: "France", countryCode: "FR", lat: 48.86, lng: 2.35, lang: "French" },
  { region: "Madrid", country: "Spain", countryCode: "ES", lat: 40.42, lng: -3.7, lang: "Spanish" },
  { region: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.72, lng: -9.14, lang: "Portuguese" },
  { region: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lng: 13.41, lang: "German" },
  { region: "Rome", country: "Italy", countryCode: "IT", lat: 41.9, lng: 12.5, lang: "Italian" },
  { region: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.37, lng: 4.9, lang: "Dutch" },
  { region: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.33, lng: 18.07, lang: "Swedish" },
  { region: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.23, lng: 21.01, lang: "Polish" },
  { region: "Kyiv", country: "Ukraine", countryCode: "UA", lat: 50.45, lng: 30.52, lang: "Ukrainian" },
  { region: "Moscow", country: "Russia", countryCode: "RU", lat: 55.76, lng: 37.62, lang: "Russian" },
  { region: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.01, lng: 28.98, lang: "Turkish" },
  { region: "Athens", country: "Greece", countryCode: "GR", lat: 37.98, lng: 23.73, lang: "Greek" },
  { region: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.04, lng: 31.24, lang: "Arabic" },
  { region: "Lagos", country: "Nigeria", countryCode: "NG", lat: 6.52, lng: 3.38, lang: "English" },
  { region: "Accra", country: "Ghana", countryCode: "GH", lat: 5.6, lng: -0.19, lang: "English" },
  { region: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.29, lng: 36.82, lang: "Swahili" },
  { region: "Addis Ababa", country: "Ethiopia", countryCode: "ET", lat: 9.03, lng: 38.74, lang: "Amharic" },
  { region: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.2, lng: 28.05, lang: "English" },
  { region: "Casablanca", country: "Morocco", countryCode: "MA", lat: 33.57, lng: -7.59, lang: "Arabic" },
  { region: "Dakar", country: "Senegal", countryCode: "SN", lat: 14.72, lng: -17.47, lang: "French" },
  { region: "Tunis", country: "Tunisia", countryCode: "TN", lat: 36.81, lng: 10.18, lang: "Arabic" },
  { region: "Tel Aviv", country: "Israel", countryCode: "IL", lat: 32.08, lng: 34.78, lang: "Hebrew" },
  { region: "Amman", country: "Jordan", countryCode: "JO", lat: 31.95, lng: 35.93, lang: "Arabic" },
  { region: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.71, lng: 46.68, lang: "Arabic" },
  { region: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2, lng: 55.27, lang: "Arabic" },
  { region: "Doha", country: "Qatar", countryCode: "QA", lat: 25.29, lng: 51.53, lang: "Arabic" },
  { region: "Tehran", country: "Iran", countryCode: "IR", lat: 35.69, lng: 51.39, lang: "Persian" },
  { region: "Karachi", country: "Pakistan", countryCode: "PK", lat: 24.86, lng: 67.0, lang: "Urdu" },
  { region: "New Delhi", country: "India", countryCode: "IN", lat: 28.61, lng: 77.21, lang: "Hindi" },
  { region: "Mumbai", country: "India", countryCode: "IN", lat: 19.08, lng: 72.88, lang: "Hindi" },
  { region: "Bengaluru", country: "India", countryCode: "IN", lat: 12.97, lng: 77.59, lang: "Kannada" },
  { region: "Dhaka", country: "Bangladesh", countryCode: "BD", lat: 23.81, lng: 90.41, lang: "Bengali" },
  { region: "Colombo", country: "Sri Lanka", countryCode: "LK", lat: 6.93, lng: 79.85, lang: "Sinhala" },
  { region: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.76, lng: 100.5, lang: "Thai" },
  { region: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.03, lng: 105.85, lang: "Vietnamese" },
  { region: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.21, lng: 106.85, lang: "Indonesian" },
  { region: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 3.14, lng: 101.69, lang: "Malay" },
  { region: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.35, lng: 103.82, lang: "English" },
  { region: "Manila", country: "Philippines", countryCode: "PH", lat: 14.6, lng: 120.98, lang: "Filipino" },
  { region: "Hong Kong", country: "China", countryCode: "CN", lat: 22.32, lng: 114.17, lang: "Chinese" },
  { region: "Shanghai", country: "China", countryCode: "CN", lat: 31.23, lng: 121.47, lang: "Chinese" },
  { region: "Beijing", country: "China", countryCode: "CN", lat: 39.9, lng: 116.41, lang: "Chinese" },
  { region: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.57, lng: 126.98, lang: "Korean" },
  { region: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.68, lng: 139.69, lang: "Japanese" },
  { region: "Osaka", country: "Japan", countryCode: "JP", lat: 34.69, lng: 135.5, lang: "Japanese" },
  { region: "Tashkent", country: "Uzbekistan", countryCode: "UZ", lat: 41.3, lng: 69.24, lang: "Uzbek" },
  { region: "Ulaanbaatar", country: "Mongolia", countryCode: "MN", lat: 47.89, lng: 106.91, lang: "Mongolian" },
  { region: "Sydney", country: "Australia", countryCode: "AU", lat: -33.87, lng: 151.21, lang: "English" },
  { region: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.81, lng: 144.96, lang: "English" },
  { region: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -36.85, lng: 174.76, lang: "English" },
  { region: "Reykjavík", country: "Iceland", countryCode: "IS", lat: 64.15, lng: -21.94, lang: "Icelandic" },
  { region: "Port Louis", country: "Mauritius", countryCode: "MU", lat: -20.16, lng: 57.5, lang: "English" },
  { region: "Victoria", country: "Seychelles", countryCode: "SC", lat: -4.62, lng: 55.45, lang: "English" },
  { region: "Beirut", country: "Lebanon", countryCode: "LB", lat: 33.89, lng: 35.5, lang: "Arabic" },
  { region: "Manama", country: "Bahrain", countryCode: "BH", lat: 26.23, lng: 50.59, lang: "Arabic" },
  { region: "Muscat", country: "Oman", countryCode: "OM", lat: 23.59, lng: 58.41, lang: "Arabic" },
  { region: "Baghdad", country: "Iraq", countryCode: "IQ", lat: 33.32, lng: 44.36, lang: "Arabic" },
  { region: "Guatemala City", country: "Guatemala", countryCode: "GT", lat: 14.63, lng: -90.51, lang: "Spanish" },
];

const TYPE_WEIGHTS: Record<ActivityType, number> = {
  active: 0.58,
  new_member: 0.1,
  pledge: 0.12,
  cultural: 0.1,
  dinner: 0.1,
};

const TYPE_ORDER: ActivityType[] = ["active", "new_member", "pledge", "cultural", "dinner"];

export const ACTIVITY_META: Record<
  ActivityType,
  { label: string; color: string; description: string }
> = {
  active: { label: "Active Users", color: "#3B82F6", description: "Exploring nations right now" },
  new_member: { label: "New Members", color: "#FBBF24", description: "Just joined humanity" },
  pledge: { label: "Humanity Pledges", color: "#F59E0B", description: "Signed the Humanity Pledge" },
  cultural: { label: "Cultural Exchanges", color: "#A855F7", description: "Sharing across cultures" },
  dinner: { label: "World Dinner Table", color: "#34D399", description: "Answering this week's question" },
};

function jitter(value: number, spread = 0.9): number {
  return value + (Math.random() - 0.5) * spread * 2;
}

function pickType(): ActivityType {
  const r = Math.random();
  let acc = 0;
  for (const t of TYPE_ORDER) {
    acc += TYPE_WEIGHTS[t];
    if (r <= acc) return t;
  }
  return "active";
}

let idCounter = 0;
function makeMarker(now: number): ActivityMarker {
  const anchor = ANCHORS[Math.floor(Math.random() * ANCHORS.length)];
  const type = pickType();
  return {
    id: `m${idCounter++}`,
    type,
    lat: jitter(anchor.lat),
    lng: jitter(anchor.lng),
    region: anchor.region,
    country: anchor.country,
    countryCode: anchor.countryCode,
    at: now,
  };
}

function uniqueLangCount(): number {
  return new Set(ANCHORS.map((a) => a.lang)).size;
}

class MockActivitySource implements ActivitySource {
  private markers: ActivityMarker[] = [];
  private listeners = new Set<(snap: ActivitySnapshot) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private pledges = 12840;
  private exchanges = 8460;
  private activeBase = 2480;

  constructor() {
    const now = Date.now();
    const seed = 150;
    for (let i = 0; i < seed; i++) this.markers.push(makeMarker(now));
  }

  private snapshot(): ActivitySnapshot {
    const countries = new Set(this.markers.map((m) => m.countryCode));
    return {
      markers: this.markers,
      stats: {
        activeOnline: this.activeBase + this.markers.filter((m) => m.type === "active").length,
        countriesRepresented: countries.size,
        languagesSpoken: uniqueLangCount(),
        pledgesSigned: this.pledges,
        culturalExchanges: this.exchanges,
      },
    };
  }

  private emit() {
    const snap = this.snapshot();
    for (const l of this.listeners) l(snap);
  }

  private tick() {
    const now = Date.now();
    // Churn a handful of markers so the globe visibly breathes.
    const churn = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < churn; i++) {
      if (this.markers.length > 120 && Math.random() < 0.5) {
        this.markers.splice(Math.floor(Math.random() * this.markers.length), 1);
      } else {
        this.markers.push(makeMarker(now));
      }
    }
    if (this.markers.length > 220) this.markers = this.markers.slice(-200);
    // Slowly grow cumulative counters.
    this.pledges += Math.floor(Math.random() * 3);
    this.exchanges += Math.floor(Math.random() * 4);
    this.activeBase += Math.floor((Math.random() - 0.45) * 14);
    this.emit();
  }

  getSnapshot(): ActivitySnapshot {
    return this.snapshot();
  }

  subscribe(listener: (snap: ActivitySnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    if (!this.timer) {
      this.timer = setInterval(() => this.tick(), 3200);
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }
}

let source: ActivitySource | null = null;

/**
 * Returns the active activity source. Swap `MockActivitySource` here for a
 * real-time implementation (WebSocket / Supabase / Firebase) when available —
 * the rest of the app consumes only the `ActivitySource` interface.
 */
export function getActivitySource(): ActivitySource {
  if (!source) source = new MockActivitySource();
  return source;
}
