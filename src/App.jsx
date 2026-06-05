import { useState, useEffect } from "react";

// --- FONT INJECTION ----------------------------------------------------------
const injectFonts = () => {
  if (document.getElementById("brandos-fonts")) return;
  const link = document.createElement("link");
  link.id = "brandos-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
  // Global input focus style
  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; }
    body { -webkit-font-smoothing: antialiased; }
    input:focus, select:focus, textarea:focus {
      border-color: #3d5a9e !important;
      outline: none;
      background: #ffffff !important;
    }
    input[type=number]::-webkit-inner-spin-button { opacity: 0.25; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #f2f1ee; }
    ::-webkit-scrollbar-thumb { background: #c8c6c0; border-radius: 2px; }
    nav::-webkit-scrollbar { height: 2px; }
    tr:hover > td { background: #f7f6f3 !important; transition: background 0.1s; }
    button:hover { opacity: 0.75; cursor: pointer; }
    select option { background: #ffffff; color: #1a1917; }
    ::placeholder { color: #bbb9b3; }
  `;
  document.head.appendChild(style);
};

// --- PALETTE - Warm Light Professional --------------------------------------
// Direction: Linear.app meets consulting firm - crisp, warm, restrained
const C = {
  // Base - warm off-white, not clinical white
  bg:           "#f7f6f3",   // warm linen - easy on eyes all day
  surface:      "#ffffff",   // pure white card
  surfaceAlt:   "#f2f1ee",   // table header, subtle fills
  surfaceHover: "#eceae6",   // hover state

  // Borders - hairline, warm gray
  border:       "#e4e2dc",
  borderLight:  "#ece9e3",

  // Typography - ink, not pure black
  text:         "#1a1917",   // warm near-black
  textSecondary:"#6b6860",   // secondary
  textMuted:    "#a09e98",   // placeholder, labels

  // Accent - deep slate blue, serious but not cold
  accent:       "#3d5a9e",
  accentLight:  "#eef1fa",
  accentDim:    "#c8d1ec",

  // Positive - forest, not neon green
  positive:     "#2e6b47",
  positiveLight:"#edf5f1",
  positiveDim:  "#bcd9cb",

  // Warning - warm amber
  warning:      "#8a6220",
  warningLight: "#fdf6ea",
  warningDim:   "#e8d4a8",

  // Negative - deep crimson, not screaming red
  negative:     "#7d2e2e",
  negativeLight:"#fdf0f0",
  negativeDim:  "#e8c0c0",

  // Aliases for backward compat
  gold:         "#8a6220",
  goldLight:    "#fdf6ea",
  goldDim:      "#e8d4a8",
  red:          "#7d2e2e",
  redLight:     "#fdf0f0",
  yellow:       "#8a6220",
  yellowLight:  "#fdf6ea",
  green:        "#2e6b47",
  greenLight:   "#edf5f1",
};

// --- HELPERS ---------------------------------------------------------------
const fmt = (n) =>
  n == null || isNaN(n) ? "-" : "Rp " + Number(n).toLocaleString("id-ID");
const pct = (n) => (isNaN(n) ? "-" : (n * 100).toFixed(1) + "%");
const num = (v) => parseFloat(v) || 0;

const SEASONS = [
  { label: "Jan", mult: 1.0 }, { label: "Feb", mult: 0.9 },
  { label: "Mar", mult: 3.5 }, // Ramadan
  { label: "Apr", mult: 0.6 }, // Post-Lebaran
  { label: "May", mult: 1.0 }, { label: "Jun", mult: 1.1 },
  { label: "Jul", mult: 1.0 }, { label: "Aug", mult: 1.0 },
  { label: "Sep", mult: 1.0 }, { label: "Oct", mult: 1.0 },
  { label: "Nov", mult: 1.2 }, // Pre-Harbolnas
  { label: "Dec", mult: 1.8 }, // Harbolnas
];

const MONTHS_ALL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const quarterOf = (mi) => Math.floor(mi / 3); // 0-based quarter index

// --- SHARED STYLES - Professional Terminal ----------------------------------
const FONT_MONO = "'IBM Plex Mono', 'Fira Code', 'Cascadia Code', monospace";
const FONT_SANS = "'IBM Plex Sans', 'Inter', system-ui, sans-serif";

const styles = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: FONT_SANS,
    color: C.text,
    fontSize: 13,
    lineHeight: 1.5,
  },
  header: {
    background: "#1a1917",
    borderBottom: `1px solid ${C.border}`,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    gap: 24,
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: 52,
  },
  headerLogo: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },
  headerTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.18em",
    fontFamily: FONT_MONO,
    textTransform: "uppercase",
  },
  headerVersion: {
    color: C.accent,
    fontSize: 10,
    fontFamily: FONT_MONO,
    letterSpacing: "0.12em",
    padding: "2px 6px",
    border: `1px solid ${C.accentDim}`,
    borderRadius: 2,
  },
  headerSub: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: FONT_MONO,
    letterSpacing: "0.14em",
    marginLeft: "auto",
  },
  nav: {
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    padding: "0 32px",
    display: "flex",
    gap: 0,
    overflowX: "auto",
    position: "sticky",
    top: 52,
    zIndex: 99,
  },
  navItem: (active) => ({
    padding: "13px 18px",
    fontSize: 11,
    fontFamily: FONT_MONO,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    borderBottom: active ? `1px solid ${C.accent}` : "1px solid transparent",
    borderTop: "1px solid transparent",
    color: active ? C.text : C.textSecondary,
    whiteSpace: "nowrap",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    transition: "color 0.12s",
  }),
  content: { padding: "28px 32px", maxWidth: 1160, margin: "0 auto" },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    padding: "20px 24px",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: FONT_MONO,
    letterSpacing: "0.18em",
    color: C.textSecondary,
    textTransform: "uppercase",
    marginBottom: 16,
    fontWeight: 600,
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: 10,
  },
  label: {
    fontSize: 10,
    color: C.textMuted,
    fontFamily: FONT_MONO,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 5,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    border: `1px solid ${C.border}`,
    borderRadius: 2,
    fontSize: 12,
    background: C.surfaceAlt,
    color: C.text,
    fontFamily: FONT_MONO,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.12s",
  },
  btn: {
    padding: "8px 16px",
    background: C.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: 2,
    fontSize: 10,
    fontFamily: FONT_MONO,
    cursor: "pointer",
    letterSpacing: "0.14em",
    fontWeight: 600,
    textTransform: "uppercase",
    transition: "all 0.12s",
  },
  btnSm: {
    padding: "4px 10px",
    background: C.surfaceAlt,
    color: C.textSecondary,
    border: `1px solid ${C.border}`,
    borderRadius: 2,
    fontSize: 10,
    fontFamily: FONT_MONO,
    cursor: "pointer",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  btnDanger: {
    padding: "4px 10px",
    background: "transparent",
    color: C.negative,
    border: `1px solid ${C.negativeDim}`,
    borderRadius: 2,
    fontSize: 10,
    fontFamily: FONT_MONO,
    cursor: "pointer",
    letterSpacing: "0.1em",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    background: C.surfaceAlt,
    padding: "8px 12px",
    textAlign: "left",
    fontFamily: FONT_MONO,
    fontSize: 10,
    color: C.textMuted,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  td: {
    padding: "9px 12px",
    borderBottom: `1px solid ${C.border}`,
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: C.text,
  },
  alert: (type) => ({
    padding: "10px 14px",
    borderRadius: 2,
    marginBottom: 10,
    fontSize: 11,
    fontFamily: FONT_MONO,
    letterSpacing: "0.04em",
    lineHeight: 1.6,
    borderLeft: `3px solid`,
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeftColor: type === "red" || type === "negative" ? C.negative
      : type === "yellow" || type === "warning" ? C.warning
      : type === "gold" || type === "accent" ? C.accent
      : C.positive,
    background: type === "red" || type === "negative" ? C.negativeLight
      : type === "yellow" || type === "warning" ? C.warningLight
      : type === "gold" || type === "accent" ? C.accentLight
      : C.positiveLight,
    color: type === "red" || type === "negative" ? "#c97a7a"
      : type === "yellow" || type === "warning" ? "#c9a060"
      : type === "gold" || type === "accent" ? "#7090d0"
      : "#6aaa86",
  }),
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 },
  kpiBox: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    padding: "16px 18px",
  },
  kpiLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontFamily: FONT_MONO,
    marginBottom: 6,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 600,
    color: C.text,
    fontFamily: FONT_SANS,
    letterSpacing: "-0.02em",
  },
  kpiSub: {
    fontSize: 10,
    color: C.textMuted,
    fontFamily: FONT_MONO,
    marginTop: 4,
    letterSpacing: "0.08em",
  },
};

// --- PASSWORD GATE ----------------------------------------------------------
const APP_PASSWORD = (typeof process !== "undefined" && process.env?.REACT_APP_PASSWORD) || "brandos2024";

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#1a1917", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#ffffff", border: "1px solid #e4e2dc", borderRadius: 3, padding: 48, width: 360, textAlign: "center" }}>
        <div style={{ color: C.text, fontSize: 18, fontWeight: 600, fontFamily: FONT_MONO, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Brand OS</div>
        <div style={{ color: C.accent, fontSize: 10, fontFamily: FONT_MONO, letterSpacing: "0.14em", marginBottom: 8 }}>v2.0</div>
        <div style={{ color: C.textMuted, fontSize: 10, fontFamily: FONT_MONO, letterSpacing: "0.12em", marginBottom: 32, textTransform: "uppercase" }}>Bill & Board Group</div>
        <input
          type="password"
          placeholder="Enter password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { if (pw === APP_PASSWORD) onUnlock(); else setErr(true); } }}
          style={{ ...styles.input, marginBottom: 12, textAlign: "center", letterSpacing: "0.2em" }}
        />
        {err && <div style={{ color: "#c97a7a", fontSize: 10, fontFamily: FONT_MONO, letterSpacing: "0.1em", marginBottom: 8 }}>Access denied.</div>}
        <button style={{ ...styles.btn, width: "100%", letterSpacing: "0.2em", padding: "10px 18px" }} onClick={() => { if (pw === APP_PASSWORD) onUnlock(); else setErr(true); }}>
          AUTHENTICATE
        </button>
      </div>
    </div>
  );
}

// --- TABS -------------------------------------------------------------------
const TABS = [
  "Canvas", "Business Plan", "Demand Forecast",
  "Size Breakdown", "BCG Matrix", "Ad Performance",
  "Product Tracker", "Unit Economics", "Cashflow", "Dashboard"
];

// --- CATEGORY CONFIG --------------------------------------------------------
const SKU_CATEGORIES = [
  { value: "best_seller",  label: "Best Seller",  buffer: 25, color: C.accent,
    advice: "Jaga flow penjualan - restock konsisten, jangan sampai stockout. Agresif di iklan boleh tapi selalu monitor ROAS dan kondisi stok secara berkala. Jangan over-rely pada satu SKU." },
  { value: "potential",    label: "Potential",    buffer: 12, color: C.positive,
    advice: "Tambah buffer jika ada validasi kuat bahwa penjualan akan naik signifikan (misal: masuk trending, atau setelah kampanye iklan berjalan 7+ hari dengan ROAS positif). Jangan overstock sebelum ada bukti data." },
  { value: "slow_moving",  label: "Slow Moving",  buffer: 5,  color: C.warning,
    advice: "Hati-hati jadi deadstock. Evaluasi dulu apakah masih ada potensi naik (harga terlalu tinggi? foto kurang menarik? musim salah?). Jika bisa diperbaiki, hold restock. Jika tidak ada sinyal naik dalam 30 hari, siapkan exit strategy." },
  { value: "deadstock",    label: "Deadstock",    buffer: 0,  color: C.negative,
    advice: "Hentikan restock. Fokus habiskan stok existing secepatnya - flash sale, bundling, atau diskon agresif. Setiap hari yang lewat = biaya opportunity cost modal yang tertahan." },
];
const getCategoryConfig = (val) => SKU_CATEGORIES.find(c => c.value === val) || SKU_CATEGORIES[0];

// ===========================================================================
// --- FORECAST MODULE (ENHANCED v2) -----------------------------------------
// ===========================================================================
function ForecastModule({ skuNames, setSkuNames }) {
  const defaultSkus = () =>
    Array(3).fill(null).map((_, i) => ({
      name: `SKU ${i + 1}`,
      category: "best_seller",
      hist: [50, 55, 60],
      avgSales: 55,
      histOverride: false,
      currentStock: 100,
      incomingStock: 0,        // WIP / incoming production units
      incomingDate: "",        // expected arrival date yyyy-mm-dd
      price: 150000,
      cogs: 70000,
      leadDays: 14,
      minOrder: 50,
    }));

  const [skus, setSkus] = useState(() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus_v2")) || defaultSkus(); }
    catch { return defaultSkus(); }
  });
  const [forecastMonth, setForecastMonth] = useState(() => {
    try { return parseInt(localStorage.getItem("forecast_month") || new Date().getMonth()); }
    catch { return new Date().getMonth(); }
  });
  const [safetyPct, setSafetyPct] = useState(15);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [expandedSku, setExpandedSku] = useState(null); // which SKU has history expanded
  const [brandGender, setBrandGender] = useState(() => {
    try { return localStorage.getItem("forecast_gender") || "menswear"; } catch { return "menswear"; }
  });
  const [sizeRange, setSizeRange] = useState(() => {
    try { return localStorage.getItem("forecast_size_range") || "xs_xl"; } catch { return "xs_xl"; }
  });

  // Persist
  useEffect(() => {
    localStorage.setItem("forecast_skus_v2", JSON.stringify(skus));
    // Also write to "forecast_skus" key so AdPerformance module can read it
    const compat = skus.map(s => ({
      name: s.name, avgSales: computeAvg(s), currentStock: s.currentStock,
      price: s.price, cogs: s.cogs, leadDays: s.leadDays, minOrder: s.minOrder,
    }));
    localStorage.setItem("forecast_skus", JSON.stringify(compat));
    localStorage.setItem("forecast_month", forecastMonth);
    setSkuNames(skus.map((s) => s.name));
  }, [skus, forecastMonth, setSkuNames]);

  useEffect(() => { localStorage.setItem("forecast_gender", brandGender); }, [brandGender]);
  useEffect(() => { localStorage.setItem("forecast_size_range", sizeRange); }, [sizeRange]);

  // Compute avg from history (or manual override)
  const computeAvg = (sku) => {
    if (sku.histOverride) return sku.avgSales;
    const filled = (sku.hist || [0,0,0]).filter(v => v > 0);
    return filled.length > 0 ? filled.reduce((a,b)=>a+b,0) / filled.length : sku.avgSales;
  };

  const updateSku = (i, field, val) => {
    const copy = [...skus];
    if (field === "hist") {
      copy[i] = { ...copy[i], hist: val, histOverride: false };
    } else if (field === "avgSales") {
      copy[i] = { ...copy[i], avgSales: num(val), histOverride: true };
    } else if (field === "name" || field === "category") {
      copy[i] = { ...copy[i], [field]: val };
    } else {
      copy[i] = { ...copy[i], [field]: num(val) };
    }
    setSkus(copy);
  };

  const addSku = () => setSkus([...skus, {
    name: `SKU ${skus.length + 1}`, category: "potential",
    hist: [0, 0, 0], avgSales: 50, histOverride: false,
    currentStock: 100, incomingStock: 0, incomingDate: "",
    price: 150000, cogs: 70000, leadDays: 14, minOrder: 50,
  }]);
  const removeSku = (i) => setSkus(skus.filter((_, idx) => idx !== i));

  // -- Date helpers -----------------------------------------------
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split("T")[0];
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const dayOfMonth = today.getDate();
  const remainingDaysMonth = daysInCurrentMonth - dayOfMonth + 1; // incl. today

  // Double-date days in current month (10th and matching day e.g. 6/6, 7/7...)
  const currentMonthNum = today.getMonth() + 1; // 1-12
  const doubleDateDay = currentMonthNum <= 12 ? currentMonthNum : null; // e.g. June = 6, so 6/6
  const hasDoubleDate = doubleDateDay !== null && doubleDateDay >= dayOfMonth;
  // Double-date multiplier per season
  const isRamadan = forecastMonth === 2; // March
  const isHarbolnas = forecastMonth === 11; // December
  const ddMult = isRamadan ? 4.5 : isHarbolnas ? 4.0 : 2.5; // midpoint of ranges

  // -- Per-SKU calcs ----------------------------------------------
  const calcSku = (sku) => {
    const catCfg = getCategoryConfig(sku.category);
    const bufferPct = catCfg.buffer;
    const avg = computeAvg(sku);
    const seasonMult = SEASONS[forecastMonth].mult;
    const adjustedSales = avg * seasonMult;
    const dailySales = adjustedSales / 30;

    // Incoming stock - only counts if arrival date is within this month or already passed
    let effectiveIncoming = 0;
    let incomingDaysUntil = null;
    if (sku.incomingStock > 0 && sku.incomingDate) {
      const arrDate = new Date(sku.incomingDate);
      arrDate.setHours(0,0,0,0);
      incomingDaysUntil = Math.round((arrDate - today) / 86400000);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
      if (arrDate <= endOfMonth) effectiveIncoming = sku.incomingStock;
    }

    const totalEffectiveStock = sku.currentStock + effectiveIncoming;

    // Closing forecast bulan berjalan
    const salesRemainingMonth = dailySales * remainingDaysMonth;
    // Add double-date spike if still upcoming this month
    const ddSpike = hasDoubleDate ? dailySales * ddMult : 0;
    const projectedSalesThisMonth = salesRemainingMonth + ddSpike;
    const closingStockThisMonth = Math.max(0, totalEffectiveStock - projectedSalesThisMonth);

    // Next month forecast
    const nextMonthIdx = (forecastMonth + 1) % 12;
    const nextMonthSales = avg * SEASONS[nextMonthIdx].mult;
    const buffer = nextMonthSales * (bufferPct / 100);
    const safetyStock = nextMonthSales * (safetyPct / 100);
    const reorderPoint = (nextMonthSales / 30) * sku.leadDays + safetyStock;

    // Restock - based on total effective stock (incl. incoming)
    const restock = sku.category === "deadstock" ? 0
      : Math.max(0, Math.ceil((nextMonthSales + buffer + safetyStock - totalEffectiveStock) / sku.minOrder) * sku.minOrder);
    const restockCost = restock * sku.cogs;
    const daysOfStock = dailySales > 0 ? totalEffectiveStock / dailySales : 999;
    const excessStock = totalEffectiveStock - (adjustedSales + buffer + safetyStock);

    // Trend
    const hist = sku.hist || [0,0,0];
    const trend = (hist[0]>0 && hist[2]>0) ? ((hist[2]-hist[0])/hist[0]*100) : 0;

    let stockStatus = "ok";
    if (sku.category === "deadstock") stockStatus = "deadstock_risk";
    else if (totalEffectiveStock <= safetyStock) stockStatus = "critical";
    else if (totalEffectiveStock < reorderPoint) stockStatus = "low";
    else if (excessStock > adjustedSales * 2 || daysOfStock > 90) stockStatus = "overstock";

    // Double-date warning
    const ddWarning = hasDoubleDate && dailySales > 0 && sku.currentStock < ddSpike * 2;

    return {
      adjustedSales, avg, dailySales, buffer, bufferPct, safetyStock,
      reorderPoint, restock, restockCost, daysOfStock, stockStatus,
      excessStock, trend, effectiveIncoming, incomingDaysUntil,
      totalEffectiveStock, closingStockThisMonth, projectedSalesThisMonth,
      salesRemainingMonth, ddSpike, ddWarning,
    };
  };

  // -- Revenue projection -----------------------------------------
  const revenueProjection = () => [0,1,2].map((q) => {
    const startMonth = (forecastMonth + q * 3) % 12;
    let totalRev = 0, totalGP = 0;
    for (let m = 0; m < 3; m++) {
      const mi = (startMonth + m) % 12;
      skus.forEach((sku) => {
        const sales = computeAvg(sku) * SEASONS[mi].mult;
        totalRev += sales * sku.price;
        totalGP  += sales * (sku.price - sku.cogs);
      });
    }
    const months = [0,1,2].map((m) => MONTHS_ALL[(startMonth + m) % 12]);
    return { q: q+1, months, totalRev, totalGP, margin: totalRev ? totalGP/totalRev : 0 };
  });

  const projections = revenueProjection();
  const skuCalcs = skus.map(calcSku);
  const criticalSkus    = skuCalcs.filter(c => c.stockStatus === "critical");
  const lowSkus         = skuCalcs.filter(c => c.stockStatus === "low");
  const overstockSkus   = skuCalcs.filter(c => c.stockStatus === "overstock" || c.stockStatus === "deadstock_risk");
  const totalRestockCost = skuCalcs.reduce((s,c) => s + c.restockCost, 0);

  const statusLabel = { ok:"On Track", low:"Low Stock", critical:"Critical", overstock:"Overstock", deadstock_risk:"Deadstock" };
  const statusColor = { ok:C.positive, low:C.warning, critical:C.negative, overstock:C.warning, deadstock_risk:C.negative };

  const prevMonths = [
    MONTHS_ALL[(forecastMonth - 3 + 12) % 12],
    MONTHS_ALL[(forecastMonth - 2 + 12) % 12],
    MONTHS_ALL[(forecastMonth - 1 + 12) % 12],
  ];

  const curMonthLabel = MONTHS_ALL[forecastMonth];
  const nextMonthLabel = MONTHS_ALL[(forecastMonth + 1) % 12];

  // -- Action Plan (pre-computed before return) ------------------
  const actionPlans = (() => {
    const ROAS_FLOOR = 3;
    const plans = { marketing:[], production:[], finance:[] };
    skus.forEach((sku, i) => {
      const c = skuCalcs[i];
      const cat = getCategoryConfig(sku.category);
      const nm = sku.name;
      if (c.stockStatus==="critical") {
        plans.marketing.push({ t:"negative", msg:`${nm}: Tahan agresivitas iklan - stok kritis, risiko stockout merusak rating toko. Fokus organic: update foto, deskripsi, respon ulasan.` });
      } else if (c.stockStatus==="overstock"||c.stockStatus==="deadstock_risk") {
        plans.marketing.push({ t:"warning", msg:`${nm}: Aktifkan flash voucher & bundling. Target likuidasi ${Math.round(c.excessStock>0?c.excessStock:sku.currentStock*0.3)} unit dalam 14 hari. Turunkan floor ROAS ke ${(ROAS_FLOOR*0.8).toFixed(1)}x sementara.` });
      } else if (c.stockStatus==="low") {
        plans.marketing.push({ t:"warning", msg:`${nm}: Kurangi budget harian 30-40% sambil tunggu restock (${sku.leadDays} hari). Jangan pause total - jaga ranking produk.` });
      } else if (cat.value==="best_seller") {
        plans.marketing.push({ t:"positive", msg:`${nm}: Kondisi ideal. Naikkan budget iklan 20% per 3 hari jika ROAS stabil.` });
      }
      if (c.ddWarning) plans.marketing.push({ t:"warning", msg:`${nm}: Double date mendekat - siapkan flash voucher 24 jam, pastikan stok tidak habis di tengah event.` });
      if (c.restock>0 && sku.category!=="deadstock") {
        const isUrgent = c.stockStatus==="critical";
        const deadline = (() => { const d=new Date(today); d.setDate(d.getDate()+Math.max(1,remainingDaysMonth-sku.leadDays)); return d.toLocaleDateString("id-ID"); })();
        plans.production.push({ t:isUrgent?"negative":c.stockStatus==="low"?"warning":"accent", msg:`${isUrgent?"URGENT - ":""}${nm}: PO ${c.restock} unit (${fmt(c.restockCost)}). Lead time ${sku.leadDays} hari - order paling lambat ${deadline}.` });
      }
      if (sku.category==="deadstock") plans.production.push({ t:"negative", msg:`${nm}: Hentikan produksi. Habiskan stok existing ${sku.currentStock} unit terlebih dahulu.` });
      if (c.effectiveIncoming>0) plans.production.push({ t:"accent", msg:`${nm}: ${c.effectiveIncoming} unit incoming${c.incomingDaysUntil!=null?" ("+c.incomingDaysUntil+" hr lagi)":""}. Siapkan QC dan kapasitas gudang.` });
      if (c.restockCost>0 && sku.category!=="deadstock") plans.finance.push({ t:"accent", msg:`${nm}: Alokasikan ${fmt(c.restockCost)} untuk restock bulan ini.` });
      if (c.stockStatus==="overstock"||c.stockStatus==="deadstock_risk") {
        plans.finance.push({ t:"warning", msg:`${nm}: Nilai aset stok ${fmt(sku.currentStock*sku.cogs)} (at cost). Likuidasi di 70% harga = ${fmt(Math.round(sku.currentStock*sku.price*0.7))}. Jika tidak bergerak 21 hari, turunkan harga 30%.` });
      }
    });
    if (totalRestockCost>0) plans.finance.push({ t:"accent", msg:`Total kebutuhan modal restock: ${fmt(totalRestockCost)}. Cek posisi kas di tab Cashflow sebelum konfirmasi PO.` });
    return plans;
  })();

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Demand Forecast</h2>
          <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 0, letterSpacing: "0.03em" }}>
            Proyeksi stok, closing bulan berjalan, revenue 3 kuartal, dan saran strategis per SKU.
          </p>
        </div>
        <div style={{ textAlign:"right", fontSize:10, fontFamily:FONT_MONO, color:C.textMuted }}>
          <div style={{ color:C.textSecondary, fontWeight:600 }}>Last Updated</div>
          <div style={{ color:C.text, fontSize:12, marginTop:2 }}>{todayStr}</div>
          <div style={{ marginTop:2 }}>Hari ke-{dayOfMonth} / {daysInCurrentMonth} - sisa {remainingDaysMonth} hari</div>
          {hasDoubleDate && <div style={{ color:C.warning, marginTop:2, fontWeight:600 }}>Double Date {currentMonthNum}/{currentMonthNum} dalam {doubleDateDay - dayOfMonth + 1} hari</div>}
        </div>
      </div>

      {/* Alerts */}
      {criticalSkus.length > 0 && <div style={styles.alert("red")}>{criticalSkus.length} SKU Critical - stok di bawah safety stock. Segera buat PO.</div>}
      {lowSkus.length > 0 && <div style={styles.alert("warning")}>{lowSkus.length} SKU Low Stock - mendekati reorder point. Siapkan PO sekarang.</div>}
      {overstockSkus.length > 0 && <div style={styles.alert("warning")}>{overstockSkus.length} SKU Overstock - kas tertahan. Prioritas likuidasi.</div>}
      {skuCalcs.some(c => c.ddWarning) && <div style={styles.alert("warning")}>Double date {currentMonthNum}/{currentMonthNum} mendekat - {skuCalcs.filter(c=>c.ddWarning).length} SKU berpotensi stockout saat spike. Cek stok segera.</div>}
      {totalRestockCost > 0 && (
        <div style={{ ...styles.alert("accent"), background: C.accentLight, borderLeftColor: C.accent, color: C.accent }}>
          Total kebutuhan restock: <strong>{fmt(totalRestockCost)}</strong> - pastikan cashflow mencukupi sebelum PO.
        </div>
      )}

      {/* Settings */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Pengaturan Forecast</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          <div>
            <label style={styles.label}>Bulan Forecast</label>
            <select value={forecastMonth} onChange={(e) => setForecastMonth(+e.target.value)} style={styles.input}>
              {MONTHS_ALL.map((m, i) => <option key={i} value={i}>{m} (×{SEASONS[i].mult})</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Safety Stock %</label>
            <input type="number" value={safetyPct} onChange={(e) => setSafetyPct(+e.target.value)} style={styles.input} min={0} max={50} />
          </div>
          <div>
            <label style={styles.label}>Proyeksi Revenue</label>
            <select value={forecastMonths} onChange={(e) => setForecastMonths(+e.target.value)} style={styles.input}>
              <option value={3}>1 Kuartal</option>
              <option value={6}>2 Kuartal</option>
              <option value={9}>3 Kuartal</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Kategori Brand</label>
            <select value={brandGender} onChange={e => setBrandGender(e.target.value)} style={styles.input}>
              <option value="menswear">Menswear</option>
              <option value="womenswear">Womenswear</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Range Ukuran</label>
            <select value={sizeRange} onChange={e => setSizeRange(e.target.value)} style={styles.input}>
              <option value="xs_xl">XS - XL (5 size)</option>
              <option value="s_xl">S - XL (4 size)</option>
            </select>
          </div>
        </div>
        {/* Category legend */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {SKU_CATEGORIES.map(cat => (
            <div key={cat.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: FONT_MONO }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, display: "inline-block" }} />
              <span style={{ color: cat.color, fontWeight: "bold" }}>{cat.label}</span>
              <span style={{ color: C.textMuted }}>buffer {cat.buffer}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projection - per quarter + monthly breakdown */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Proyeksi Revenue - 3 Kuartal ke Depan</div>
        <div style={styles.grid3}>
          {projections.map((q) => {
            // Per-month breakdown within quarter
            const monthlyBreakdown = q.months.map(m => {
              const mi = MONTHS_ALL.indexOf(m);
              let mRev = 0, mGP = 0;
              skus.forEach(sku => {
                const sales = computeAvg(sku) * SEASONS[mi].mult;
                mRev += sales * sku.price;
                mGP  += sales * (sku.price - sku.cogs);
              });
              return { m, mi, rev: mRev, gp: mGP, mult: SEASONS[mi].mult };
            });
            const maxRev = Math.max(...monthlyBreakdown.map(mb => mb.rev));
            return (
              <div key={q.q} style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                {/* Quarter header */}
                <div style={{ background: C.accentLight, borderBottom: `1px solid ${C.border}`, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.accent, fontWeight: "bold", marginBottom: 2 }}>
                    Q{q.q} - {q.months.join(", ")}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: "bold", color: C.text, fontFamily: FONT_MONO }}>{fmt(q.totalRev)}</div>
                  <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.green, marginTop: 2 }}>
                    GP: {fmt(q.totalGP)} ({pct(q.margin)})
                  </div>
                </div>
                {/* Monthly breakdown */}
                {monthlyBreakdown.map(mb => {
                  const barWidth = maxRev > 0 ? (mb.rev / maxRev) * 100 : 0;
                  const gpMargin = mb.rev > 0 ? mb.gp / mb.rev : 0;
                  return (
                    <div key={mb.m} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontFamily: FONT_MONO, fontWeight: "bold", color: C.text }}>{mb.m}</span>
                        <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted }}>×{mb.mult} season</span>
                      </div>
                      {/* Bar */}
                      <div style={{ height: 6, background: C.border, borderRadius: 3, marginBottom: 4 }}>
                        <div style={{ height: "100%", width: barWidth + "%", background: mb.mult >= 2 ? C.gold : mb.mult >= 1.1 ? C.green : "#90a4ae", borderRadius: 3, transition: "width 0.3s" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontFamily: FONT_MONO, fontWeight: "bold", color: C.text }}>{fmt(mb.rev)}</span>
                        <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.green }}>GP {pct(gpMargin, 1)}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding: "6px 14px", background: C.surfaceAlt }}>
                  <span style={{ fontSize: 9, fontFamily: FONT_MONO, color: C.textMuted }}>
                    Gold bar = peak season (×2+)  x  Hijau = naik (×1.1+)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted, fontFamily: FONT_MONO }}>
          * Berdasarkan rata-rata historis × seasonality. Tidak termasuk pertumbuhan organik.
        </div>
      </div>

      {/* SKU Table with history */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={styles.cardTitle}>Data SKU</div>
          <button style={styles.btn} onClick={addSku}>+ Tambah SKU</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "SKU", "Kategori",
                  prevMonths[0], prevMonths[1], prevMonths[2],
                  "Avg/Bln", "Daily Sales", "Stok Kini", "Incoming", "Est. Tiba",
                  "Harga Jual", "HPP", "Lead Time", "Min Order", ""
                ].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {skus.map((sku, i) => {
                const avg = computeAvg(sku);
                const daily = (avg * SEASONS[forecastMonth].mult / 30).toFixed(1);
                const cat = getCategoryConfig(sku.category);
                const hist = sku.hist || [0,0,0];
                return (
                  <tr key={i} style={{ borderLeft: `2px solid ${cat.color}` }}>
                    <td style={styles.td}>
                      <input type="text" value={sku.name} onChange={e => updateSku(i,"name",e.target.value)}
                        style={{ ...styles.input, width:110, fontWeight:600 }} />
                    </td>
                    <td style={styles.td}>
                      <select value={sku.category} onChange={e => updateSku(i,"category",e.target.value)}
                        style={{ ...styles.input, width:120, color:cat.color, fontWeight:600 }}>
                        {SKU_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </td>
                    {[0,1,2].map(mi => (
                      <td key={mi} style={styles.td}>
                        <input type="number" value={hist[mi]||0}
                          onChange={e => { const h=[...hist]; h[mi]=num(e.target.value); updateSku(i,"hist",h); }}
                          style={{ ...styles.input, width:65 }} />
                      </td>
                    ))}
                    <td style={{ ...styles.td, color:C.accent, fontWeight:600 }}>
                      <div>{Math.round(avg)}</div>
                      <div style={{ fontSize:9, color:C.textMuted }}>{sku.histOverride?"manual":"hist."}</div>
                    </td>
                    <td style={{ ...styles.td, color:C.textSecondary, fontWeight:500 }}>{daily}/hr</td>
                    <td style={styles.td}>
                      <input type="number" value={sku.currentStock} onChange={e => updateSku(i,"currentStock",e.target.value)}
                        style={{ ...styles.input, width:75 }} />
                    </td>
                    <td style={styles.td}>
                      <input type="number" value={sku.incomingStock||0} onChange={e => updateSku(i,"incomingStock",e.target.value)}
                        style={{ ...styles.input, width:75, color:sku.incomingStock>0?C.accent:C.text }} placeholder="0" />
                    </td>
                    <td style={styles.td}>
                      <input type="date" value={sku.incomingDate||""} onChange={e => updateSku(i,"incomingDate",e.target.value)}
                        style={{ ...styles.input, width:120, fontSize:11 }} />
                    </td>
                    {["price","cogs","leadDays","minOrder"].map(f => (
                      <td key={f} style={styles.td}>
                        <input type="number" value={sku[f]} onChange={e => updateSku(i,f,e.target.value)}
                          style={{ ...styles.input, width:80 }} />
                      </td>
                    ))}
                    <td style={styles.td}>
                      <button style={styles.btnDanger} onClick={() => removeSku(i)}>x</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop:8, fontSize:10, color:C.textMuted, fontFamily:FONT_MONO }}>
          Avg/Bln dihitung otomatis dari histori 3 bulan. Incoming Stock dihitung hanya jika tiba dalam bulan berjalan.
        </div>
      </div>

      {/* Forecast Result + Diagnosis */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Hasil Forecast & Diagnosa Stok</div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "SKU","Kategori","Trend","Daily Sales","Closing "+curMonthLabel,
                  "Stok Efektif","Days of Stock","Incoming","Reorder Point","Forecast "+nextMonthLabel,
                  "Restock Qty","Biaya Restock","Status"
                ].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {skus.map((sku, i) => {
                const c = skuCalcs[i];
                const cat = getCategoryConfig(sku.category);
                const trendColor = c.trend>10?C.positive:c.trend<-10?C.negative:C.textMuted;
                const rowBg = c.stockStatus==="critical"||c.stockStatus==="deadstock_risk"
                  ? C.negativeLight : c.stockStatus==="overstock" ? C.warningLight : "transparent";
                return (
                  <tr key={i} style={{ background:rowBg, borderLeft:`2px solid ${cat.color}` }}>
                    <td style={{ ...styles.td, fontWeight:600 }}>{sku.name}</td>
                    <td style={{ ...styles.td, color:cat.color, fontSize:11, fontWeight:500 }}>{cat.label}</td>
                    <td style={{ ...styles.td, color:trendColor, fontWeight:600 }}>
                      {c.trend!==0?(c.trend>0?"▲":"▼")+Math.abs(c.trend).toFixed(0)+"%":"-"}
                    </td>
                    <td style={{ ...styles.td, color:C.textSecondary }}>{c.dailySales.toFixed(1)}/hr</td>
                    <td style={{ ...styles.td, fontWeight:600, color:c.closingStockThisMonth<c.safetyStock?C.negative:C.positive }}>
                      {Math.round(c.closingStockThisMonth)} unit
                      {c.ddSpike>0 && <div style={{ fontSize:9, color:C.warning, marginTop:1 }}>DD +{Math.round(c.ddSpike)} est.</div>}
                    </td>
                    <td style={{ ...styles.td, fontWeight:600 }}>
                      {c.totalEffectiveStock}
                      {c.effectiveIncoming>0 && <div style={{ fontSize:9, color:C.accent }}>+{c.effectiveIncoming} WIP</div>}
                    </td>
                    <td style={{ ...styles.td, fontWeight:600, color:c.daysOfStock<14?C.negative:c.daysOfStock<30?C.warning:C.positive }}>
                      {c.daysOfStock<900?c.daysOfStock.toFixed(0)+" hr":"inf"}
                    </td>
                    <td style={{ ...styles.td, color:c.effectiveIncoming>0?C.accent:C.textMuted }}>
                      {c.effectiveIncoming>0?(
                        <div>
                          <div style={{ fontWeight:600 }}>{c.effectiveIncoming} unit</div>
                          <div style={{ fontSize:9, color:C.textMuted }}>{c.incomingDaysUntil!=null?(c.incomingDaysUntil<=0?"Tiba hari ini":c.incomingDaysUntil+" hr lagi"):""}</div>
                        </div>
                      ):"-"}
                    </td>
                    <td style={styles.td}>{Math.round(c.reorderPoint)}</td>
                    <td style={styles.td}>{Math.round(c.adjustedSales)}</td>
                    <td style={{ ...styles.td, color:c.restock>0?C.negative:C.positive, fontWeight:600 }}>
                      {sku.category==="deadstock"?<span style={{ color:C.negative }}>STOP</span>:c.restock>0?c.restock:"-"}
                    </td>
                    <td style={{ ...styles.td, color:c.restockCost>0?C.negative:C.positive }}>
                      {c.restockCost>0?fmt(c.restockCost):"-"}
                    </td>
                    <td style={{ ...styles.td, color:statusColor[c.stockStatus], fontWeight:600 }}>
                      {statusLabel[c.stockStatus]}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background:C.surfaceAlt }}>
                <td style={{ ...styles.td, fontWeight:600 }} colSpan={11}>Total Restock</td>
                <td style={{ ...styles.td, fontWeight:600, color:C.negative }}>{fmt(totalRestockCost)}</td>
                <td style={styles.td} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Diagnosa Per SKU - category-aware */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, fontWeight: "bold", color: C.text, marginBottom: 10 }}> Diagnosa & Saran Per SKU:</div>
          {skus.map((sku, i) => {
            const c = skuCalcs[i];
            const cat = getCategoryConfig(sku.category);
            const trendTxt = c.trend > 10 ? `Tren naik ${c.trend.toFixed(0)}% - validasi bagus untuk pertimbangkan buffer lebih tinggi.`
              : c.trend < -10 ? `Tren turun ${Math.abs(c.trend).toFixed(0)}% - pertimbangkan turunkan kategori jika berlanjut.`
              : "";

            // Stock action message
            const stockMsg = {
              critical: `Stok ${sku.name} KRITIS (${sku.currentStock} unit, sisa ${c.daysOfStock.toFixed(0)} hari). SEGERA buat PO minimal ${c.restock} unit.`,
              low: `Stok ${sku.name} mendekati reorder point (${Math.round(c.reorderPoint)} unit). Mulai proses pembelian sekarang - lead time ${sku.leadDays} hari.`,
              overstock: `${sku.name} overstock - kelebihan +/-${Math.round(c.excessStock)} unit (${c.daysOfStock.toFixed(0)} hari). Tahan restock, dorong penjualan via promo.`,
              deadstock_risk: `${sku.name} deadstock - ${c.daysOfStock < 900 ? c.daysOfStock.toFixed(0)+" hari" : "stok stagnan"}. Jalankan flash sale atau bundling segera.`,
              ok: null,
            }[c.stockStatus];

            return (
              <div key={i} style={{ marginBottom: 12, border: `1px solid ${cat.color}30`, borderRadius: 3, overflow: "hidden" }}>
                {/* Category header */}
                <div style={{ background: cat.color + "15", borderBottom: `1px solid ${cat.color}30`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: "bold", color: cat.color }}>{cat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: "bold", color: C.text }}>- {sku.name}</span>
                  {trendTxt && <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: c.trend > 0 ? C.green : C.red, marginLeft: "auto" }}>{c.trend > 0 ? "▲" : "▼"} {Math.abs(c.trend).toFixed(0)}% trend</span>}
                </div>
                <div style={{ padding: "10px 14px" }}>
                  {/* Stock action */}
                  {stockMsg && (
                    <div style={{ ...styles.alert(c.stockStatus === "critical" || c.stockStatus === "deadstock_risk" ? "red" : "yellow"), marginBottom: 8 }}>
                      {stockMsg}
                    </div>
                  )}
                  {/* Category advice */}
                  <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.text, lineHeight: 1.6, padding: "8px 12px", background: cat.color + "08", borderRadius: 4, borderLeft: `2px solid ${cat.color}` }}>
                    <span style={{ fontWeight: "bold", color: cat.color }}>Saran ({cat.label}): </span>{cat.advice}
                  </div>
                  {/* Trend context */}
                  {trendTxt && (
                    <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted, marginTop: 6 }}>{trendTxt}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// --- CASHFLOW SIMULATOR ----------------------------------------------------
// ===========================================================================
function CashflowSimulator({ skuNames }) {
  const defaultObligations = () => [
    { id: 1, name: "Gaji Tim", amount: 15000000, dueDay: 25, type: "payroll", recurring: true },
    { id: 2, name: "Pembayaran Vendor A", amount: 8000000, dueDay: 10, type: "vendor", recurring: true },
    { id: 3, name: "Sewa Kantor", amount: 3500000, dueDay: 1, type: "opex", recurring: true },
  ];

  const [kasAwal, setKasAwal] = useState(() => num(localStorage.getItem("cf_kas")) || 25000000);
  const [estimasiRevBulanIni, setEstimasiRevBulanIni] = useState(() => num(localStorage.getItem("cf_rev")) || 50000000);
  const [estimasiCogsRatio, setEstimasiCogsRatio] = useState(() => num(localStorage.getItem("cf_cogs")) || 47);
  const [estimasiAdSpend, setEstimasiAdSpend] = useState(() => num(localStorage.getItem("cf_ads")) || 6500000);
  const [obligations, setObligations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cf_obligations")) || defaultObligations(); }
    catch { return defaultObligations(); }
  });
  const [newObl, setNewObl] = useState({ name: "", amount: "", dueDay: "", type: "opex", recurring: true });
  const [restockAmount, setRestockAmount] = useState(() => num(localStorage.getItem("cf_restock")) || 0);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Persist
  useEffect(() => { localStorage.setItem("cf_kas", kasAwal); }, [kasAwal]);
  useEffect(() => { localStorage.setItem("cf_rev", estimasiRevBulanIni); }, [estimasiRevBulanIni]);
  useEffect(() => { localStorage.setItem("cf_cogs", estimasiCogsRatio); }, [estimasiCogsRatio]);
  useEffect(() => { localStorage.setItem("cf_ads", estimasiAdSpend); }, [estimasiAdSpend]);
  useEffect(() => { localStorage.setItem("cf_obligations", JSON.stringify(obligations)); }, [obligations]);
  useEffect(() => { localStorage.setItem("cf_restock", restockAmount); }, [restockAmount]);

  const addObligation = () => {
    if (!newObl.name || !newObl.amount || !newObl.dueDay) return;
    setObligations([...obligations, { ...newObl, id: Date.now(), amount: num(newObl.amount), dueDay: num(newObl.dueDay) }]);
    setNewObl({ name: "", amount: "", dueDay: "", type: "opex", recurring: true });
  };
  const removeObligation = (id) => setObligations(obligations.filter((o) => o.id !== id));

  // -- Calculations ----------------------------------------------
  const cogsTotal = estimasiRevBulanIni * (estimasiCogsRatio / 100);
  const totalObligations = obligations.reduce((s, o) => s + o.amount, 0);
  const totalOutflow = cogsTotal + estimasiAdSpend + totalObligations + restockAmount;
  const netCashflow = estimasiRevBulanIni - totalOutflow;
  const endKas = kasAwal + netCashflow;
  const runwayMonths = totalOutflow > 0 ? kasAwal / totalOutflow : 999;

  // -- Diagnosa -------------------------------------------------
  // Read forecast data for cashflow integration
  const forecastSkusCF = (() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus_v2")) || []; } catch { return []; }
  })();
  const totalInventoryValue = forecastSkusCF.reduce((s,f) => s + (f.currentStock||0)*(f.cogs||0), 0);
  const totalInventoryRetail = forecastSkusCF.reduce((s,f) => s + (f.currentStock||0)*(f.price||0), 0);
  const overstockSkusCF = forecastSkusCF.filter(f => {
    const avg = f.avgSales || 50;
    return f.currentStock > avg * 2.5;
  });
  const liquidatableValue = overstockSkusCF.reduce((s,f) => s + (f.currentStock||0)*(f.price||0)*0.65, 0);

  const getDiagnosa = () => {
    const alerts = [];

    // Primary cashflow status
    if (endKas < 0) {
      alerts.push({ type: "red", msg: "KAS HABIS - Proyeksi kas akhir bulan negatif. Tunda restock, percepat penagihan, atau cari modal tambahan segera." });
      if (liquidatableValue > 0) alerts.push({ type: "warning", msg: `Opsi darurat: ${overstockSkusCF.length} SKU overstock dapat dilikuidasi. Estimasi nilai likuidasi (65% harga) = ${fmt(liquidatableValue)}. Prioritaskan flash sale segera untuk perbaiki posisi kas.` });
    } else if (endKas < totalObligations) {
      alerts.push({ type: "red", msg: `Kas akhir bulan (${fmt(endKas)}) tidak cukup untuk kewajiban bulan depan (${fmt(totalObligations)}). Risiko gagal bayar tinggi.` });
      if (liquidatableValue > 0) alerts.push({ type: "warning", msg: `Pertimbangkan likuidasi stok overstock senilai ${fmt(liquidatableValue)} untuk perbaiki posisi kas sebelum jatuh tempo.` });
    } else if (endKas < totalObligations * 1.5) {
      alerts.push({ type: "warning", msg: `Kas akhir bulan tipis (${fmt(endKas)}). Buffer ${(endKas/totalObligations).toFixed(1)}x kewajiban. Tahan restock besar sampai posisi kas membaik.` });
    } else {
      alerts.push({ type: "positive", msg: `Posisi kas aman. Buffer ${(endKas/totalObligations).toFixed(1)}x kewajiban bulanan. Runway ~ ${runwayMonths.toFixed(1)} bulan.` });
    }

    // Restock vs kas
    if (restockAmount > kasAwal * 0.4) alerts.push({ type: "warning", msg: `Restock (${fmt(restockAmount)}) menghabiskan ${((restockAmount/kasAwal)*100).toFixed(0)}% kas. Pertimbangkan cicil PO atau negosiasi tempo vendor 30-45 hari.` });

    // Payroll
    const totalPayroll = obligations.filter(o=>o.type==="payroll").reduce((s,o)=>s+o.amount,0);
    if (totalPayroll > estimasiRevBulanIni * 0.25) alerts.push({ type: "warning", msg: `Payroll (${fmt(totalPayroll)}) melebihi 25% revenue. Rasio payroll-to-revenue perlu diperhatikan untuk keberlanjutan bisnis.` });

    // Ad spend
    if (estimasiAdSpend > estimasiRevBulanIni * 0.15) alerts.push({ type: "warning", msg: `Ad spend (${fmt(estimasiAdSpend)}) di atas 15% revenue. Pastikan ROAS masih profitable sebelum scale lebih jauh.` });

    // Inventory asset position
    if (totalInventoryValue > 0) alerts.push({ type: "accent", msg: `Nilai aset inventori saat ini: ${fmt(totalInventoryValue)} (at cost) / ${fmt(totalInventoryRetail)} (retail price). ${overstockSkusCF.length>0?`${overstockSkusCF.length} SKU overstock - nilai yang bisa dilikuidasi: ~${fmt(liquidatableValue)}.`:"Seluruh stok dalam kondisi sehat."}` });

    return alerts;
  };

  const diagnosa = getDiagnosa();

  // -- Kalender tagihan ------------------------------------------
  const daysInMonth = new Date(2025, viewMonth + 1, 0).getDate();
  const monthName = MONTHS_ALL[viewMonth];
  const oblByDay = {};
  obligations.forEach((o) => {
    const day = Math.min(o.dueDay, daysInMonth);
    if (!oblByDay[day]) oblByDay[day] = [];
    oblByDay[day].push(o);
  });

  // Cashflow by week
  const weeklyFlow = [1, 8, 15, 22].map((startDay, wi) => {
    const endDay = wi < 3 ? startDay + 6 : daysInMonth;
    const outflow = obligations.filter((o) => o.dueDay >= startDay && o.dueDay <= endDay).reduce((s, o) => s + o.amount, 0);
    const inflow = (estimasiRevBulanIni / 4); // evenly distributed (simplified)
    return { week: wi + 1, startDay, endDay, inflow, outflow, net: inflow - outflow };
  });

  const typeColors = { payroll: "#c0392b", vendor: "#2980b9", opex: "#8e44ad", ads: "#e67e22", other: "#7f8c8d" };
  const typeLabels = { payroll: "Payroll", vendor: "Vendor", opex: "Opex", ads: "Ads", other: "Lainnya" };

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Cashflow Simulator</h2>
      <p style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO, marginBottom: 24 }}>
        Posisi kas, proyeksi akhir bulan, kalender tagihan, dan diagnosa terintegrasi dengan forecast stok.
      </p>

      {/* Diagnosa Alerts */}
      {diagnosa.map((d, i) => <div key={i} style={styles.alert(d.type)}>{d.msg}</div>)}

      {/* KPI Row */}
      <div style={{ ...styles.grid3, marginBottom: 20 }}>
        <div style={{ ...styles.kpiBox, borderLeft: `2px solid ${C.accent}` }}>
          <div style={styles.kpiLabel}>Kas Saat Ini</div>
          <div style={styles.kpiValue}>{fmt(kasAwal)}</div>
          <div style={styles.kpiSub}>Saldo awal bulan</div>
        </div>
        <div style={{ ...styles.kpiBox, borderLeft: `3px solid ${netCashflow >= 0 ? C.green : C.red}` }}>
          <div style={styles.kpiLabel}>Net Cashflow Bulan Ini</div>
          <div style={{ ...styles.kpiValue, color: netCashflow >= 0 ? C.positive : C.negative }}>{fmt(netCashflow)}</div>
          <div style={styles.kpiSub}>Revenue - semua outflow</div>
        </div>
        <div style={{ ...styles.kpiBox, borderLeft: `3px solid ${endKas >= totalObligations * 1.5 ? C.green : endKas >= 0 ? C.yellow : C.red}` }}>
          <div style={styles.kpiLabel}>Proyeksi Kas Akhir Bulan</div>
          <div style={{ ...styles.kpiValue, color: endKas >= 0 ? C.text : C.negative }}>{fmt(endKas)}</div>
          <div style={styles.kpiSub}>Runway ~ {runwayMonths < 100 ? runwayMonths.toFixed(1) + " bln" : "inf"}</div>
        </div>
      </div>

      {/* Input Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Posisi Kas & Revenue */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Posisi Kas & Revenue</div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Saldo Kas Awal Bulan (Rp)", val: kasAwal, set: setKasAwal },
              { label: "Estimasi Revenue Bulan Ini (Rp)", val: estimasiRevBulanIni, set: setEstimasiRevBulanIni },
              { label: "COGS Ratio (%)", val: estimasiCogsRatio, set: setEstimasiCogsRatio },
              { label: "Budget Ad Spend (Rp)", val: estimasiAdSpend, set: setEstimasiAdSpend },
              { label: "Restock / PO Bulan Ini (Rp)", val: restockAmount, set: setRestockAmount },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label style={styles.label}>{label}</label>
                <input type="number" value={val} onChange={(e) => set(num(e.target.value))} style={styles.input} />
              </div>
            ))}
          </div>
        </div>

        {/* Rincian Outflow */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Rincian Cashflow</div>
          <table style={styles.table}>
            <tbody>
              {[
                { label: "Revenue", value: estimasiRevBulanIni, positive: true },
                { label: `COGS (${estimasiCogsRatio}%)`, value: -cogsTotal },
                { label: "Ad Spend", value: -estimasiAdSpend },
                { label: "Restock / PO", value: -restockAmount },
                ...obligations.map((o) => ({ label: o.name, value: -o.amount, type: o.type })),
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ ...styles.td, color: C.textMuted }}>{row.label}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", color: row.value >= 0 ? C.green : C.red }}>
                    {row.value >= 0 ? "+" : ""}{fmt(Math.abs(row.value))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: C.surfaceAlt }}>
                <td style={{ ...styles.td, fontWeight: "bold" }}>NET CASHFLOW</td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", color: netCashflow >= 0 ? C.positive : C.negative }}>
                  {netCashflow >= 0 ? "+" : ""}{fmt(netCashflow)}
                </td>
              </tr>
              <tr style={{ background: C.goldLight }}>
                <td style={{ ...styles.td, fontWeight: "bold", color: C.accent }}>KAS AKHIR BULAN</td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", color: endKas >= 0 ? C.accent : C.negative }}>
                  {fmt(endKas)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tambah Kewajiban */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Kalender Tagihan & Kewajiban</div>

        {/* Add form */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr 1fr 0.5fr auto", gap: 10, marginBottom: 16, alignItems: "end" }}>
          {[
            { key: "name", label: "Nama Tagihan", type: "text", placeholder: "Gaji, Vendor..." },
            { key: "amount", label: "Jumlah (Rp)", type: "number", placeholder: "5000000" },
            { key: "dueDay", label: "Tanggal Jatuh Tempo", type: "number", placeholder: "15" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={styles.label}>{label}</label>
              <input type={type} value={newObl[key]} placeholder={placeholder}
                onChange={(e) => setNewObl({ ...newObl, [key]: e.target.value })} style={styles.input} />
            </div>
          ))}
          <div>
            <label style={styles.label}>Tipe</label>
            <select value={newObl.type} onChange={(e) => setNewObl({ ...newObl, type: e.target.value })} style={styles.input}>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Recurring</label>
            <select value={newObl.recurring} onChange={(e) => setNewObl({ ...newObl, recurring: e.target.value === "true" })} style={styles.input}>
              <option value="true">Ya</option>
              <option value="false">Sekali</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>&nbsp;</label>
            <button style={styles.btn} onClick={addObligation}>+ Tambah</button>
          </div>
        </div>

        {/* Obligation list */}
        <table style={styles.table}>
          <thead>
            <tr>
              {["Nama", "Tipe", "Jumlah", "Jatuh Tempo", "Recurring", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {obligations.sort((a, b) => a.dueDay - b.dueDay).map((o) => (
              <tr key={o.id}>
                <td style={{ ...styles.td, fontWeight: "bold" }}>{o.name}</td>
                <td style={styles.td}>
                  <span style={{ background: typeColors[o.type] || "#888", color: "#fff", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontFamily: FONT_MONO }}>
                    {typeLabels[o.type] || o.type}
                  </span>
                </td>
                <td style={{ ...styles.td, color: C.red, fontWeight: "bold" }}>{fmt(o.amount)}</td>
                <td style={styles.td}>Tgl {o.dueDay}</td>
                <td style={styles.td}>{o.recurring ? "v Bulanan" : "Sekali"}</td>
                <td style={styles.td}><button style={styles.btnDanger} onClick={() => removeObligation(o.id)}>x</button></td>
              </tr>
            ))}
            <tr style={{ background: C.surfaceAlt }}>
              <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>TOTAL KEWAJIBAN TETAP</td>
              <td style={{ ...styles.td, fontWeight: "bold", color: C.red }}>{fmt(totalObligations)}</td>
              <td colSpan={3} style={styles.td}></td>
            </tr>
          </tbody>
        </table>

        {/* Weekly cashflow visualization */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.accent, fontWeight: "bold", marginBottom: 12, letterSpacing: "0.1em" }}>
            ALIRAN KAS MINGGUAN - {monthName.toUpperCase()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {weeklyFlow.map((w) => (
              <div key={w.week} style={{ background: C.surfaceAlt, borderRadius: 6, padding: "12px 14px", borderLeft: `3px solid ${w.net >= 0 ? C.green : C.red}` }}>
                <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted, marginBottom: 4 }}>Minggu {w.week} (Tgl {w.startDay}-{w.endDay})</div>
                <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.green }}>+{fmt(w.inflow)}</div>
                <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.red }}>-{fmt(w.outflow)}</div>
                <div style={{ fontSize: 13, fontFamily: FONT_MONO, fontWeight: "bold", color: w.net >= 0 ? C.positive : C.negative, marginTop: 4 }}>
                  {w.net >= 0 ? "+" : ""}{fmt(w.net)}
                </div>
                {obligations.filter((o) => o.dueDay >= w.startDay && o.dueDay <= w.endDay).map((o) => (
                  <div key={o.id} style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted, marginTop: 2 }}>- Tgl {o.dueDay}: {o.name}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// --- BUSINESS CANVAS -------------------------------------------------------
// ===========================================================================
function BusinessCanvas() {
  const fields = [
    { key: "vp", label: "Value Proposition", placeholder: "Apa yang membuat brand kamu unik dan bernilai bagi pelanggan?" },
    { key: "cs", label: "Customer Segments", placeholder: "Siapa target pelanggan utama kamu?" },
    { key: "ch", label: "Channels", placeholder: "Bagaimana kamu menjangkau pelanggan? (Shopee, TikTok, Offline...)" },
    { key: "cr", label: "Customer Relationships", placeholder: "Bagaimana kamu membangun dan menjaga hubungan dengan pelanggan?" },
    { key: "rs", label: "Revenue Streams", placeholder: "Dari mana saja pendapatan brand kamu?" },
    { key: "kr", label: "Key Resources", placeholder: "Aset utama apa yang dibutuhkan bisnis kamu?" },
    { key: "ka", label: "Key Activities", placeholder: "Aktivitas utama apa yang harus dilakukan?" },
    { key: "kp", label: "Key Partners", placeholder: "Siapa mitra strategis kamu? (Vendor, supplier, distributor...)" },
    { key: "cs2", label: "Cost Structure", placeholder: "Apa saja biaya terbesar dalam bisnis kamu?" },
  ];
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("canvas")) || {}; } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("canvas", JSON.stringify(data)); }, [data]);
  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Business Canvas</h2>
      <p style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO, marginBottom: 24 }}>Model bisnis 1 halaman - 9 building blocks.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {fields.map((f) => (
          <div key={f.key} style={styles.card}>
            <div style={styles.cardTitle}>{f.label}</div>
            <textarea value={data[f.key] || ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{ ...styles.input, height: 100, resize: "vertical", fontFamily: FONT_SANS, fontSize: 12, lineHeight: 1.6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- BUSINESS PLAN ---------------------------------------------------------
function BusinessPlan() {
  const sections = [
    { key: "exec", label: "Executive Summary" },
    { key: "vision", label: "Visi & Misi" },
    { key: "market", label: "Analisis Pasar" },
    { key: "product", label: "Produk & Layanan" },
    { key: "marketing", label: "Strategi Marketing" },
    { key: "ops", label: "Operasional" },
    { key: "finance", label: "Proyeksi Keuangan" },
  ];
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bizplan")) || {}; } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("bizplan", JSON.stringify(data)); }, [data]);
  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Business Plan</h2>
      <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 20, letterSpacing: "0.03em" }}>Dokumentasi rencana bisnis terstruktur.</p>
      {sections.map((s) => (
        <div key={s.key} style={styles.card}>
          <div style={styles.cardTitle}>{s.label}</div>
          <textarea value={data[s.key] || ""} onChange={(e) => setData({ ...data, [s.key]: e.target.value })}
            placeholder={`Tulis ${s.label.toLowerCase()} di sini...`}
            style={{ ...styles.input, height: 120, resize: "vertical", fontFamily: FONT_SANS, fontSize: 12, lineHeight: 1.6 }} />
        </div>
      ))}
    </div>
  );
}

const GOLDEN_CONFIGS = {
  menswear: {
    xs_xl: {
      sizes: ["XS", "S", "M", "L", "XL"],
      ratio: [0.5, 1, 2, 2, 1],   // normalized -> /6.5
      label: "Menswear XS-XL (0.5:1:2:2:1)",
      note: "Menswear dominan di M & L. XS relatif kecil, XL moderate.",
      goldenSizes: ["M", "L"],
    },
    s_xl: {
      sizes: ["S", "M", "L", "XL"],
      ratio: [1, 2, 2, 1],
      label: "Menswear S-XL (1:2:2:1)",
      note: "Tanpa XS - distribusi seimbang dengan peak di M dan L.",
      goldenSizes: ["M", "L"],
    },
  },
  womenswear: {
    xs_xl: {
      sizes: ["XS", "S", "M", "L", "XL"],
      ratio: [1, 2, 2, 1, 0.5],
      label: "Womenswear XS-XL (1:2:2:1:0.5)",
      note: "Womenswear dominan di S & M. XL relatif kecil.",
      goldenSizes: ["S", "M"],
    },
    s_xl: {
      sizes: ["S", "M", "L", "XL"],
      ratio: [2, 2, 1, 0.5],
      label: "Womenswear S-XL (2:2:1:0.5)",
      note: "Tanpa XS - peak di S dan M, L dan XL lebih kecil.",
      goldenSizes: ["S", "M"],
    },
  },
};

function SizeBreakdown({ skuNames }) {
  // Read gender & size range from forecast settings
  const brandGender = (() => {
    try { return localStorage.getItem("forecast_gender") || "menswear"; } catch { return "menswear"; }
  })();
  const sizeRange = (() => {
    try { return localStorage.getItem("forecast_size_range") || "xs_xl"; } catch { return "xs_xl"; }
  })();

  const goldenCfg = GOLDEN_CONFIGS[brandGender]?.[sizeRange] || GOLDEN_CONFIGS.menswear.xs_xl;
  const { sizes, ratio, label: goldenLabel, note: goldenNote, goldenSizes } = goldenCfg;
  const ratioSum = ratio.reduce((a, b) => a + b, 0);

  // Per-SKU total units (linked from forecast)
  const forecastSkusRaw = (() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus_v2")) || []; } catch { return []; }
  })();

  // Manual override per SKU total (if user wants custom total, not from forecast)
  const [totalOverride, setTotalOverride] = useState(() => {
    try { return JSON.parse(localStorage.getItem("size_total_override")) || {}; } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("size_total_override", JSON.stringify(totalOverride)); }, [totalOverride]);

  // Manual size ratio override per SKU (default = golden)
  const [ratioOverride, setRatioOverride] = useState(() => {
    try { return JSON.parse(localStorage.getItem("size_ratio_override")) || {}; } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("size_ratio_override", JSON.stringify(ratioOverride)); }, [ratioOverride]);

  const resetRatio = (name) => {
    const copy = { ...ratioOverride }; delete copy[name]; setRatioOverride(copy);
  };

  const getTotal = (name) => {
    if (totalOverride[name] != null) return totalOverride[name];
    const fs = forecastSkusRaw.find(f => f.name === name);
    return fs?.currentStock || 100;
  };

  const getRatio = (name) => ratioOverride[name] || ratio;

  const calcBreakdown = (name) => {
    const total = getTotal(name);
    const r = getRatio(name);
    const rSum = r.reduce((a, b) => a + b, 0);
    return sizes.map((sz, i) => ({
      sz,
      qty: Math.round((r[i] / rSum) * total),
      pct: rSum > 0 ? (r[i] / rSum * 100).toFixed(0) : 0,
      isGolden: goldenSizes.includes(sz),
    }));
  };

  const updateRatio = (name, idx, val) => {
    const cur = getRatio(name);
    const copy = [...cur]; copy[idx] = num(val);
    setRatioOverride({ ...ratioOverride, [name]: copy });
  };

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Size Breakdown</h2>
      <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 16, letterSpacing: "0.03em" }}>
        Distribusi ukuran per SKU berbasis golden ratio. Kategori brand & range ukuran diatur di Demand Forecast.
      </p>

      {/* Golden Ratio Info */}
      <div style={{ ...styles.card, borderLeft: `2px solid ${C.accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: "bold", color: C.accent, fontFamily: FONT_MONO, marginBottom: 4 }}>
              {brandGender === "menswear" ? "" : ""} {goldenLabel}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO, marginBottom: 8 }}>{goldenNote}</div>
            {/* Visual ratio bar */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {sizes.map((sz, i) => (
                <div key={sz} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: goldenSizes.includes(sz) ? C.gold : C.textMuted, fontWeight: goldenSizes.includes(sz) ? "bold" : "normal", marginBottom: 2 }}>{sz}</div>
                  <div style={{ width: 28, height: Math.round((ratio[i] / Math.max(...ratio)) * 40) + 8, background: goldenSizes.includes(sz) ? C.gold : C.border, borderRadius: 3, margin: "0 auto" }} />
                  <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted, marginTop: 2 }}>{ratio[i]}x</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: C.warningLight, border: `1px solid ${C.warningDim}`, borderRadius: 3, padding: "10px 14px", maxWidth: 320 }}>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.yellow, fontWeight: "bold", marginBottom: 4 }}>Catatan Penting</div>
            <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.text, lineHeight: 1.6 }}>
              Ini adalah golden ratio umum berdasarkan pola penjualan fashion Indonesia. <strong>Setiap brand berbeda</strong> - validasi dengan data penjualan aktual kamu minimal 3 bulan. Jika size tertentu selalu habis duluan -> naikkan rasionya. Jika sering sisa -> turunkan. Override rasio per SKU tersedia di bawah.
            </div>
          </div>
        </div>
      </div>

      {/* Per-SKU breakdown */}
      {skuNames.map((name, si) => {
        const breakdown = calcBreakdown(name);
        const total = getTotal(name);
        const isOverrideRatio = !!ratioOverride[name];
        const isOverrideTotal = totalOverride[name] != null;
        const fs = forecastSkusRaw.find(f => f.name === name);

        return (
          <div key={name} style={{ ...styles.card, marginBottom: 14 }}>
            {/* SKU header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: "bold" }}>{name}</span>
                {fs && <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted }}>{getCategoryConfig(fs.category || "potential").label}</span>}
                {isOverrideRatio && <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.accent, border: `1px solid ${C.gold}`, borderRadius: 3, padding: "1px 6px" }}>rasio custom</span>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div>
                  <label style={{ ...styles.label, marginBottom: 2 }}>Total Unit</label>
                  <input type="number" value={total}
                    onChange={e => setTotalOverride({ ...totalOverride, [name]: num(e.target.value) })}
                    style={{ ...styles.input, width: 90 }}
                    title={isOverrideTotal ? "Manual override" : "Dari stok Forecast"} />
                </div>
                {isOverrideRatio && (
                  <button style={{ ...styles.btnSm, marginTop: 16 }} onClick={() => resetRatio(name)}>Reset Rasio</button>
                )}
              </div>
            </div>

            {/* Visual bar breakdown */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {breakdown.map(({ sz, qty, pct: p, isGolden }) => (
                <div key={sz} style={{ flex: 1, minWidth: 60, textAlign: "center" }}>
                  <div style={{ height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ width: "80%", height: Math.max(8, (num(p) / 100) * 60) + "px", background: isGolden ? C.gold : C.border, borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: "bold", fontFamily: FONT_MONO, color: isGolden ? C.gold : C.text, marginTop: 4 }}>{sz}</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", fontFamily: FONT_MONO }}>{qty}</div>
                  <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted }}>{p}%</div>
                </div>
              ))}
            </div>

            {/* Ratio override inputs */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              <div style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted, marginBottom: 6 }}>
                Kustomisasi rasio (opsional) - berdasarkan data penjualan aktual brand kamu:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sizes.map((sz, idx) => {
                  const r = getRatio(name);
                  return (
                    <div key={sz} style={{ textAlign: "center" }}>
                      <label style={{ ...styles.label, color: goldenSizes.includes(sz) ? C.gold : C.textMuted }}>{sz}</label>
                      <input type="number" value={r[idx]} step={0.5} min={0}
                        onChange={e => updateRatio(name, idx, e.target.value)}
                        style={{ ...styles.input, width: 58, textAlign: "center" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- BCG MATRIX -------------------------------------------------------------
function BCGMatrix({ skuNames }) {
  const [thresholds, setThresholds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bcg_thresh")) || { deadstock: 90, slowmove: 45, bestDIO: 20, revShare: 15 }; }
    catch { return { deadstock: 90, slowmove: 45, bestDIO: 20, revShare: 15 }; }
  });
  useEffect(() => { localStorage.setItem("bcg_thresh", JSON.stringify(thresholds)); }, [thresholds]);

  // -- Baca dari Forecast v2 -------------------------------------
  const forecastSkusRaw = (() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus_v2")) || []; } catch { return []; }
  })();
  const forecastMonth = (() => {
    try { return parseInt(localStorage.getItem("forecast_month") || new Date().getMonth()); } catch { return new Date().getMonth(); }
  })();

  // Override revenue/bln per-SKU (manual edit jika perlu)
  const [revenueOverride, setRevenueOverride] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bcg_rev_override")) || {}; } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("bcg_rev_override", JSON.stringify(revenueOverride)); }, [revenueOverride]);

  // Build merged rows: dari forecast + override revenue
  const rows = skuNames.map(name => {
    const fs = forecastSkusRaw.find(f => f.name === name);
    const hist = fs?.hist || [0,0,0];
    const filledHist = hist.filter(v => v > 0);
    const avgSales = fs?.histOverride ? fs.avgSales : (filledHist.length > 0 ? filledHist.reduce((a,b)=>a+b,0)/filledHist.length : fs?.avgSales || 0);
    const seasonMult = SEASONS[forecastMonth]?.mult || 1;
    const adjustedSales = avgSales * seasonMult;
    const currentStock = fs?.currentStock || 0;
    const price = fs?.price || 0;
    // Revenue/bln = avg sales bulan terakhir × harga (pakai hist bulan terakhir jika ada)
    const lastMonthSales = hist[2] > 0 ? hist[2] : avgSales;
    const defaultRevenue = lastMonthSales * price;
    const revenue = revenueOverride[name] != null ? revenueOverride[name] : defaultRevenue;
    const cat = fs ? getCategoryConfig(fs.category || "potential") : getCategoryConfig("potential");
    // Trend
    const trend = (hist[0]>0 && hist[2]>0) ? ((hist[2]-hist[0])/hist[0]*100) : 0;
    return { name, currentStock, adjustedSales, lastMonthSales, avgSales, revenue, price, cat, hist, trend };
  });

  const classify = (row) => {
    const dio = row.adjustedSales > 0 ? (row.currentStock / (row.adjustedSales / 30)) : 999;
    const totalRev = rows.reduce((s, r) => s + r.revenue, 0);
    const revSharePct = totalRev > 0 ? (row.revenue / totalRev) * 100 : 0;
    if (dio >= thresholds.deadstock) return { label: "Deadstock", color: C.negative };
    if (dio >= thresholds.slowmove) return { label: "Slow Mover", color: C.warning };
    if (dio <= thresholds.bestDIO && revSharePct >= thresholds.revShare) return { label: "Star", color: C.accent };
    if (dio <= thresholds.bestDIO) return { label: "Cash Cow", color: C.positive };
    return { label: "Question Mark", color: C.textSecondary };
  };

  const noForecastData = forecastSkusRaw.length === 0;
  const prevMonthName = MONTHS_ALL[(forecastMonth - 1 + 12) % 12];
  const totalRev = rows.reduce((s, r) => s + r.revenue, 0);

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>BCG Matrix - Inventori</h2>
      <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 16, letterSpacing: "0.03em" }}>
        Klasifikasi SKU berdasarkan Days in Inventory & kontribusi revenue. Data stok & sales otomatis dari Demand Forecast.
      </p>

      {noForecastData && (
        <div style={styles.alert("yellow")}>Belum ada data di Demand Forecast. Isi modul Demand Forecast terlebih dahulu - data stok & sales akan otomatis muncul di sini.</div>
      )}

      {/* Threshold settings */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Threshold Klasifikasi</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { f: "deadstock", l: "Deadstock (DIO hari >=)" },
            { f: "slowmove",  l: "Slow Move (DIO hari >=)" },
            { f: "bestDIO",   l: "Best DIO (hari <=)" },
            { f: "revShare",  l: "Star Rev Share (% >=)" },
          ].map(({ f, l }) => (
            <div key={f}>
              <label style={styles.label}>{l}</label>
              <input type="number" value={thresholds[f]}
                onChange={e => setThresholds({ ...thresholds, [f]: num(e.target.value) })}
                style={styles.input} />
            </div>
          ))}
        </div>
      </div>

      {/* Main table */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={styles.cardTitle}>Hasil BCG</div>
          <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted, marginTop: -14 }}>
            Sales/Bln = avg historis × seasonality | Revenue/Bln = penjualan {prevMonthName} × harga
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "SKU", "Kategori Forecast", "Stok Saat Ini",
                  `Sales ${prevMonthName}`, "Avg Sales/Bln", "Adj Sales/Bln",
                  "Revenue/Bln", "DIO (hari)", "Rev Share", "Trend 3 Bln", "Klasifikasi BCG"
                ].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const cat = classify(row);
                const dio = row.adjustedSales > 0 ? (row.currentStock / (row.adjustedSales / 30)).toFixed(0) : "inf";
                const revShare = totalRev > 0 ? ((row.revenue / totalRev) * 100).toFixed(1) : "0";
                const trendColor = row.trend > 10 ? C.green : row.trend < -10 ? C.red : C.textMuted;
                return (
                  <tr key={i} style={{ borderLeft: `2px solid ${row.cat.color}` }}>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>{row.name}</td>
                    <td style={{ ...styles.td, color: row.cat.color, fontSize: 11 }}>{row.cat.label}</td>
                    <td style={styles.td}>{row.currentStock}</td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: C.accent }}>{Math.round(row.lastMonthSales)}</td>
                    <td style={styles.td}>{Math.round(row.avgSales)}</td>
                    <td style={styles.td}>{Math.round(row.adjustedSales)}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>{fmt(row.revenue)}</span>
                        {revenueOverride[row.name] != null && (
                          <span style={{ fontSize: 9, color: C.accent, fontFamily: FONT_MONO }}>manual</span>
                        )}
                        <input type="number" value={row.revenue}
                          onChange={e => setRevenueOverride({ ...revenueOverride, [row.name]: num(e.target.value) })}
                          style={{ ...styles.input, width: 100, fontSize: 10 }}
                          title="Edit jika perlu override" />
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: num(dio) >= thresholds.deadstock ? C.negative : num(dio) >= thresholds.slowmove ? C.warning : C.positive }}>
                      {dio} hr
                    </td>
                    <td style={styles.td}>{revShare}%</td>
                    <td style={{ ...styles.td, color: trendColor, fontWeight: "bold" }}>
                      {row.trend !== 0 ? (row.trend > 0 ? "▲" : "▼") + Math.abs(row.trend).toFixed(0) + "%" : "-"}
                    </td>
                    <td style={{ ...styles.td, color: cat.color, fontWeight: "bold" }}>{cat.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: C.textMuted, fontFamily: FONT_MONO }}>
          * Revenue/Bln default = penjualan bulan terakhir × harga dari Forecast. Bisa di-override manual per SKU jika aktual berbeda.
        </div>
      </div>

      {/* -- Diagnosa & Saran Per SKU -- */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Diagnosa & Saran Strategis - Per SKU</div>
        {rows.map((row, i) => {
          const bcg = classify(row);
          const dio = row.adjustedSales > 0 ? row.currentStock / (row.adjustedSales / 30) : 999;
          const revShare = totalRev > 0 ? (row.revenue / totalRev) * 100 : 0;
          const trendDown = row.trend < -10;
          const trendUp   = row.trend > 10;
          const trendFlat = !trendDown && !trendUp;

          // -- Saran berdasarkan kombinasi BCG + trend + kategori forecast --
          const sarans = [];

          if (bcg.label.includes("Star")) {
            sarans.push({ type: "green", icon: "", title: "Star - Maksimalkan & Jaga",
              body: "Ini produk terbaik kamu sekarang. Pastikan lini produksi stabil dan stok tidak pernah kosong. Agresifkan paid ads - ROAS di channel ini harus dimonitor ketat agar tidak drop saat scaling. Optimalkan juga organic: konten review, foto lifestyle, dan SEO toko." });
            if (trendDown) sarans.push({ type: "yellow", icon: "", title: "Star tapi tren turun",
              body: `Penjualan turun ${Math.abs(row.trend).toFixed(0)}% dalam 3 bulan. Star yang trendnya turun bisa jatuh ke Cash Cow atau bahkan Question Mark. Evaluasi: apakah ada kompetitor baru, perubahan harga, atau fatigue iklan? Lakukan refresh kreatif dan cek harga kompetitor sebelum terlambat.` });
            if (revShare > 40) sarans.push({ type: "yellow", icon: "", title: "Konsentrasi revenue terlalu tinggi",
              body: `${row.name} menyumbang ${revShare.toFixed(0)}% total revenue. Terlalu bergantung pada satu SKU adalah risiko - jika tiba-tiba drop, cashflow terganggu. Mulai develop SKU lain sebagai backup revenue.` });
          }

          if (bcg.label.includes("Cash Cow")) {
            sarans.push({ type: "green", icon: "", title: "Cash Cow - Jaga Flow, Jangan Over-Invest",
              body: "DIO bagus, tapi revenue share belum cukup besar untuk jadi Star. Jaga konsistensi stok dan optimalkan organic - foto, ulasan, dan SEO toko. Paid ads boleh tapi efisiensi dulu sebelum scale. Gunakan cashflow dari produk ini untuk fund pengembangan SKU berpotensi." });
            if (trendDown) sarans.push({ type: "yellow", icon: "", title: "Cash Cow tren turun - mulai geser prioritas",
              body: `Penjualan turun ${Math.abs(row.trend).toFixed(0)}% - Cash Cow yang trendnya terus turun akan jadi Question Mark. Evaluasi apakah worth dipertahankan atau mulai geser alokasi iklan dan stok ke SKU yang sedang naik.` });
          }

          if (bcg.label.includes("Question Mark")) {
            if (trendUp) {
              sarans.push({ type: "green", icon: "", title: "Question Mark tapi tren naik - kandidat Star",
                body: `Penjualan naik ${row.trend.toFixed(0)}% dalam 3 bulan. Ini sinyal valid untuk mulai naikkan investasi. Tambah buffer stok, uji scale iklan 20-30%, dan pantau ROAS ketat. Jika tren bertahan 2 bulan ke depan, shift kategori ke Potential atau Best Seller.` });
            } else if (trendDown) {
              sarans.push({ type: "red", icon: "", title: "Question Mark + tren turun - evaluasi exit",
                body: `Penjualan turun ${Math.abs(row.trend).toFixed(0)}% dan kontribusi revenue rendah. Jangan tambah stok. Tahan iklan kecuali ada perubahan signifikan (harga, foto, bundling). Jika tidak ada perbaikan dalam 30 hari, pertimbangkan clearance dan realokasi modal ke SKU yang lebih proven.` });
            } else {
              sarans.push({ type: "yellow", icon: "", title: "Question Mark - butuh validasi lebih",
                body: "Penjualan flat dan kontribusi revenue belum signifikan. Lakukan satu iterasi tajam: test foto baru, turunkan harga 5-10%, atau coba flash voucher selama 7 hari. Ukur hasilnya - naik berarti ada potensi, flat/turun berarti pertimbangkan exit." });
            }
          }

          if (bcg.label.includes("Slow Mover")) {
            sarans.push({ type: "yellow", icon: "", title: "Slow Mover - Hati-hati DIO Tinggi",
              body: `DIO ${dio.toFixed(0)} hari - stok bergerak lambat, modal tertahan. Sebelum restock, coba dorong penjualan dulu: voucher toko, bundle dengan Best Seller, atau flash sale 3 hari. Jika setelah intervensi tidak ada pergerakan signifikan, kurangi stok ke level minimum dan hold restock.` });
            if (trendDown) sarans.push({ type: "red", icon: "", title: "Slow Mover + tren turun - risiko deadstock",
              body: `Kombinasi berbahaya: DIO tinggi + penjualan turun ${Math.abs(row.trend).toFixed(0)}%. Tanpa aksi agresif, ini akan jadi deadstock dalam waktu dekat. Prioritaskan clearance sekarang - diskon, bundle, atau tawarkan ke reseller dengan margin lebih rendah daripada modal tertahan.` });
          }

          if (bcg.label.includes("Deadstock")) {
            sarans.push({ type: "red", icon: "", title: "Deadstock - Prioritas Habiskan Modal",
              body: `DIO ${dio.toFixed(0)} hari - modal nyangkut dan tidak berputar. Hentikan semua restock. Fokus 100% habiskan stok existing: flash sale agresif, bundle wajib dengan SKU lain, atau tawarkan ke wholesaler/reseller dengan harga di atas COGS. Setiap hari yang lewat = biaya opportunity cost yang tidak perlu.` });
            if (revShare > 15) sarans.push({ type: "red", icon: "", title: "Deadstock menyumbang revenue besar - hati-hati",
              body: `${row.name} masih contribute ${revShare.toFixed(0)}% revenue meski DIO tinggi - ini berarti penjualannya masih ada tapi stok terlalu besar. Turunkan stok ke level yang sehat (DIO < 45 hari) dan jangan restock sampai rasio ini normal.` });
          }

          // Saran lintas SKU - jika Star ada dan ini underperform
          const starExists = rows.some(r => classify(r).label.includes("Star") && r.name !== row.name);
          if (starExists && (bcg.label.includes("Question Mark") || bcg.label.includes("Slow Mover") || bcg.label.includes("Deadstock"))) {
            sarans.push({ type: "gold", icon: "", title: "Saran realokasi resource",
              body: `Ada SKU lain yang sedang di posisi Star/terbaik. Pertimbangkan geser sebagian budget iklan dan alokasi stok dari ${row.name} ke SKU yang lebih proven - modal yang berputar lebih cepat menghasilkan cashflow lebih sehat.` });
          }

          const headerBg = bcg.label.includes("Star") ? C.accentLight
            : bcg.label.includes("Cash Cow") ? C.positiveLight
            : bcg.label.includes("Deadstock") || (bcg.label.includes("Question Mark") && trendDown) ? C.negativeLight
            : C.warningLight;
          const headerBorder = bcg.label.includes("Star") ? C.accentDim
            : bcg.label.includes("Cash Cow") ? C.positiveDim
            : bcg.label.includes("Deadstock") || (bcg.label.includes("Question Mark") && trendDown) ? C.negativeDim
            : C.warningDim;

          return (
            <div key={i} style={{ marginBottom: 14, border: `1px solid ${headerBorder}30`, borderRadius: 3, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}30`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: "bold", color: C.text }}>{row.name}</span>
                <span style={{ fontSize: 12, fontWeight: "bold", color: bcg.color, fontFamily: FONT_MONO }}>{bcg.label}</span>
                <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: row.cat.color }}>({row.cat.label})</span>
                <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted, marginLeft: "auto" }}>
                  DIO {dio.toFixed(0)} hr  x  Rev share {revShare.toFixed(1)}%
                  {row.trend !== 0 && (
                    <span style={{ color: trendDown ? C.red : C.green, marginLeft: 8 }}>
                      {trendDown ? "▼" : "▲"}{Math.abs(row.trend).toFixed(0)}% trend
                    </span>
                  )}
                </span>
              </div>
              {/* Saran items */}
              <div style={{ padding: "10px 14px" }}>
                {sarans.map((s, j) => (
                  <div key={j} style={{ marginBottom: j < sarans.length - 1 ? 8 : 0, padding: "10px 14px", borderRadius: 5,
                    background: s.type === "red" ? C.redLight : s.type === "yellow" ? C.yellowLight : s.type === "green" ? C.greenLight : C.goldLight,
                    border: `1px solid ${s.type === "red" ? C.red : s.type === "yellow" ? C.yellow : s.type === "green" ? C.green : C.gold}40` }}>
                    <div style={{ fontSize: 12, fontWeight: "bold", fontFamily: FONT_MONO,
                      color: s.type === "red" ? C.red : s.type === "yellow" ? C.yellow : s.type === "green" ? C.green : C.gold,
                      marginBottom: 4 }}>
                      {s.icon} {s.title}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.text, lineHeight: 1.65 }}>
                      {s.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- SHOPEE ADS PERFORMANCE --------------------------------------------------
function AdPerformance({ skuNames }) {
  const [thresh, setThresh] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adperf_thresh")) || { ctr: 2, cvr: 3, atc: 8, roas: 3, cpc: 2500 }; } catch { return { ctr: 2, cvr: 3, atc: 8, roas: 3, cpc: 2500 }; }
  });
  const defaultSkus = () => skuNames.map((name) => ({ name, impr: 10000, clicks: 300, atc: 80, orders: 15, revenue: 2250000, spend: 450000, dailyBudget: 50000 }));
  const [skus, setSkus] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adperf_skus")) || defaultSkus(); } catch { return defaultSkus(); }
  });
  useEffect(() => {
    const updated = skuNames.map((name, i) => skus[i] ? { ...skus[i], name } : { name, impr: 10000, clicks: 300, atc: 80, orders: 15, revenue: 2250000, spend: 450000, dailyBudget: 50000 });
    setSkus(updated);
  }, [skuNames]);
  useEffect(() => { localStorage.setItem("adperf_skus", JSON.stringify(skus)); }, [skus]);
  useEffect(() => { localStorage.setItem("adperf_thresh", JSON.stringify(thresh)); }, [thresh]);

  const update = (i, f, v) => { const c = [...skus]; c[i] = { ...c[i], [f]: num(v) }; setSkus(c); };
  const updateThresh = (f, v) => setThresh({ ...thresh, [f]: num(v) });

  // Baca data forecast dari localStorage
  const forecastSkus = (() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus")) || []; } catch { return []; }
  })();
  const forecastMonth = (() => {
    try { return parseInt(localStorage.getItem("forecast_month") || "0"); } catch { return 0; }
  })();

  const getForecastContext = (skuName) => {
    const fs = forecastSkus.find(f => f.name === skuName);
    if (!fs) return null;
    const seasonMult = SEASONS[forecastMonth]?.mult || 1;
    const adjustedSales = fs.avgSales * seasonMult;
    const safetyStock = adjustedSales * 0.15;
    const reorderPoint = (adjustedSales / 30) * fs.leadDays + safetyStock;
    const excessStock = fs.currentStock - (adjustedSales * 1.4);
    const daysOfStock = fs.currentStock / (adjustedSales / 30);

    if (fs.currentStock <= safetyStock) return { status: "critical", daysOfStock, currentStock: fs.currentStock, reorderPoint, excessStock, adjustedSales, minOrder: fs.minOrder };
    if (fs.currentStock <= reorderPoint) return { status: "low", daysOfStock, currentStock: fs.currentStock, reorderPoint, excessStock, adjustedSales, minOrder: fs.minOrder };
    if (excessStock > adjustedSales * 2) return { status: "overstock", daysOfStock, currentStock: fs.currentStock, reorderPoint, excessStock, adjustedSales, minOrder: fs.minOrder };
    if (daysOfStock > 90) return { status: "deadstock_risk", daysOfStock, currentStock: fs.currentStock, reorderPoint, excessStock, adjustedSales, minOrder: fs.minOrder };
    return { status: "ok", daysOfStock, currentStock: fs.currentStock, reorderPoint, excessStock, adjustedSales, minOrder: fs.minOrder };
  };

  const calc = (s) => {
    const ctr = s.impr > 0 ? (s.clicks / s.impr) * 100 : 0;
    const cvr = s.clicks > 0 ? (s.orders / s.clicks) * 100 : 0;
    const atcR = s.clicks > 0 ? (s.atc / s.clicks) * 100 : 0;
    const roas = s.spend > 0 ? s.revenue / s.spend : 0;
    const cpc = s.clicks > 0 ? s.spend / s.clicks : 0;
    const cpa = s.orders > 0 ? s.spend / s.orders : 0;
    return { ctr, cvr, atcR, roas, cpc, cpa };
  };

  // Generate saran per SKU berdasarkan performa ads + konteks forecast
  const getSaran = (sku, c, fc) => {
    const sarads = []; // saran ads murni
    const sarstock = []; // saran berbasis stok

    // -- Saran berbasis performa iklan -----------------------------
    if (c.ctr < thresh.ctr * 0.5) sarads.push({ type: "red", text: "CTR sangat rendah (" + c.ctr.toFixed(2) + "%) - ganti foto utama, pakai foto lifestyle bukan catalog. Prioritas perbaiki sebelum naikkan budget." });
    else if (c.ctr < thresh.ctr) sarads.push({ type: "yellow", text: "CTR di bawah target (" + c.ctr.toFixed(2) + "%) - coba A/B test thumbnail berbeda. Tambahkan label promo atau badge." });

    if (c.atcR < thresh.atc) sarads.push({ type: "yellow", text: "ATC rate rendah (" + c.atcR.toFixed(1) + "%) - harga kurang kompetitif atau deskripsi produk tidak meyakinkan. Cek harga competitor & tambah voucher toko." });

    if (c.cvr < thresh.cvr && c.ctr >= thresh.ctr) sarads.push({ type: "yellow", text: "Traffic masuk tapi tidak convert (CVR " + c.cvr.toFixed(2) + "%) - optimasi halaman produk: foto lebih lengkap, review, dan fast response." });

    if (c.roas >= thresh.roas * 1.5) sarads.push({ type: "green", text: "ROAS excellent (" + c.roas.toFixed(2) + "x) - iklan ini profitable. Pertimbangkan naikkan budget harian 20-30%." });
    else if (c.roas >= thresh.roas) sarads.push({ type: "green", text: "ROAS on-target (" + c.roas.toFixed(2) + "x) - maintain budget, monitor 3 hari ke depan sebelum keputusan scale." });
    else if (c.roas < thresh.roas && c.roas >= 1.5) sarads.push({ type: "yellow", text: "ROAS di bawah target (" + c.roas.toFixed(2) + "x) - evaluasi keyword & bid. Turunkan budget 20% sampai ROAS recover." });
    else if (c.roas < 1.5) sarads.push({ type: "red", text: "ROAS berbahaya (" + c.roas.toFixed(2) + "x) - iklan rugi. Pause atau potong budget minimum sampai ada perbaikan kreatif/harga." });

    if (c.cpc > thresh.cpc) sarads.push({ type: "yellow", text: "CPC mahal (" + fmt(c.cpc) + ") - keyword terlalu kompetitif. Coba exact match keyword atau long-tail keyword yang lebih spesifik." });

    // -- Saran berbasis konteks stok forecast ---------------------
    if (fc) {
      const suggestedBudget = Math.round(sku.dailyBudget / 1000) * 1000;

      if (fc.status === "overstock" || fc.status === "deadstock_risk") {
        const kelebihanUnit = Math.round(fc.excessStock);
        const hariHabis = Math.round(fc.daysOfStock);
        sarstock.push({
          type: "yellow",
          icon: "-",
          text: `Stok berlebih ${kelebihanUnit > 0 ? kelebihanUnit + " unit" : ""} - estimasi habis dalam ${hariHabis} hari tanpa aksi.`,
          action: `Naikkan ROAS target sementara menjadi ${(thresh.roas * 0.8).toFixed(1)}x (lebih longgar) untuk mempercepat penjualan. Tambah budget harian dari ${fmt(sku.dailyBudget)} -> ${fmt(Math.round(sku.dailyBudget * 1.3 / 1000) * 1000)}. Aktifkan voucher flash sale atau bundling.`,
        });
      }

      if (fc.status === "critical") {
        sarstock.push({
          type: "red",
          icon: "",
          text: `Stok KRITIS - hanya ${fc.currentStock} unit tersisa (${fc.daysOfStock.toFixed(0)} hari).`,
          action: `TAHAN atau PAUSE iklan sekarang. Budget harian saat ini ${fmt(sku.dailyBudget)} terbuang sia-sia jika stok habis di tengah campaign. Aktifkan kembali hanya setelah restock masuk.`,
        });
      }

      if (fc.status === "low") {
        const hariHabis = Math.round(fc.daysOfStock);
        sarstock.push({
          type: "yellow",
          icon: "",
          text: `Stok menipis - estimasi habis ${hariHabis} hari lagi (${fc.currentStock} unit).`,
          action: `Kurangi budget harian dari ${fmt(sku.dailyBudget)} -> ${fmt(Math.round(sku.dailyBudget * 0.6 / 1000) * 1000)} untuk memperlambat penjualan sambil menunggu restock. Jangan pause total agar ranking produk tidak turun.`,
        });
      }

      if (fc.status === "ok" && c.roas >= thresh.roas) {
        sarstock.push({
          type: "green",
          icon: "",
          text: `Stok aman (${fc.daysOfStock.toFixed(0)} hari) + ROAS on-target.`,
          action: `Kondisi ideal untuk scale. Naikkan budget harian ${fmt(sku.dailyBudget)} -> ${fmt(Math.round(sku.dailyBudget * 1.2 / 1000) * 1000)} secara bertahap. Monitor 3 hari, jika ROAS stabil naikkan lagi 20%.`,
        });
      }
    } else {
      // Tidak ada data forecast - saran generik berbasis ROAS + budget
      if (c.roas >= thresh.roas) {
        sarstock.push({ type: "green", icon: "", text: "Performa iklan bagus.", action: `Pertimbangkan scale budget harian dari ${fmt(sku.dailyBudget)} -> ${fmt(Math.round(sku.dailyBudget * 1.2 / 1000) * 1000)}. Hubungkan data Forecast untuk saran berbasis stok.` });
      } else {
        sarstock.push({ type: "yellow", icon: "", text: "Belum ada data forecast untuk SKU ini.", action: "Isi modul Demand Forecast dengan nama SKU yang sama untuk mendapat saran berbasis kondisi stok." });
      }
    }

    return { sarads, sarstock };
  };

    // -- Aggregate overall totals ----------------------------------
  const totalSpend    = skus.reduce((s,sku) => s + sku.spend, 0);
  const totalRevenue  = skus.reduce((s,sku) => s + sku.revenue, 0);
  const totalOrders   = skus.reduce((s,sku) => s + sku.orders, 0);
  const totalClicks   = skus.reduce((s,sku) => s + sku.clicks, 0);
  const totalImpr     = skus.reduce((s,sku) => s + sku.impr, 0);
  const blendedROAS   = totalSpend>0 ? totalRevenue/totalSpend : 0;
  const blendedCTR    = totalImpr>0 ? (totalClicks/totalImpr)*100 : 0;
  const blendedCVR    = totalClicks>0 ? (totalOrders/totalClicks)*100 : 0;
  const blendedCPA    = totalOrders>0 ? totalSpend/totalOrders : 0;

  // Budget reallocation suggestion
  const budgetReallocSuggestion = (() => {
    const calcR = s => s.spend>0?s.revenue/s.spend:0;
    const sorted = [...skus].filter(s=>s.spend>0);
    if (sorted.length < 2) return null;
    const best = sorted.sort((a,b)=>calcR(b)-calcR(a))[0];
    const worst = [...skus].filter(s=>s.spend>0).sort((a,b)=>calcR(a)-calcR(b))[0];
    if (best && worst && best.name!==worst.name && calcR(worst)<thresh.roas*0.7) {
      return `Realokasi: Pertimbangkan geser sebagian budget dari ${worst.name} (ROAS ${calcR(worst).toFixed(2)}x) ke ${best.name} (ROAS ${calcR(best).toFixed(2)}x).`;
    }
    return null;
  })();

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Shopee Ads Performance Diagnosis</h2>
      <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 16, letterSpacing: "0.03em" }}>
        Diagnosa performa iklan per SKU di Shopee - terintegrasi dengan data forecast stok.
      </p>

      {/* Overall Summary */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Overall Performance - Semua SKU</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:16 }}>
          {[
            { l:"Total Spend",    v:fmt(totalSpend),              c:C.negative },
            { l:"Total Revenue",  v:fmt(totalRevenue),            c:C.positive },
            { l:"Blended ROAS",   v:blendedROAS.toFixed(2)+"x",  c:blendedROAS>=thresh.roas?C.positive:blendedROAS>=thresh.roas*0.6?C.warning:C.negative },
            { l:"Cost per Order", v:fmt(blendedCPA),              c:C.textSecondary },
            { l:"Blended CTR",    v:blendedCTR.toFixed(2)+"%",   c:blendedCTR>=thresh.ctr?C.positive:C.warning },
          ].map(k=>(
            <div key={k.l} style={{ ...styles.kpiBox, borderLeft:`2px solid ${k.c}` }}>
              <div style={styles.kpiLabel}>{k.l}</div>
              <div style={{ ...styles.kpiValue, color:k.c, fontSize:18 }}>{k.v}</div>
            </div>
          ))}
        </div>
        {/* Budget allocation suggestions */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <div style={{ fontSize:10, fontFamily:FONT_MONO, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Saran Alokasi Budget</div>
          {blendedROAS < thresh.roas && totalSpend > 0 && (
            <div style={styles.alert("warning")}>
              Blended ROAS {blendedROAS.toFixed(2)}x di bawah target {thresh.roas}x. Evaluasi SKU dengan ROAS terendah - pertimbangkan geser budget ke SKU yang perform lebih baik sebelum scale total.
            </div>
          )}
          {blendedROAS >= thresh.roas && (
            <div style={styles.alert("positive")}>
              Blended ROAS sehat ({blendedROAS.toFixed(2)}x). SKU terbaik bisa dipertimbangkan untuk scale bertahap - naikkan budget max 20% per 3 hari.
            </div>
          )}
  {budgetReallocSuggestion && <div style={styles.alert("accent")}>{budgetReallocSuggestion}</div>}        </div>
      </div>

      {/* Threshold Settings */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Threshold KPI</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            { f: "roas", l: "Target ROAS (x)" },
            { f: "ctr", l: "Min CTR (%)" },
            { f: "cvr", l: "Min CVR (%)" },
            { f: "atc", l: "Min ATC Rate (%)" },
            { f: "cpc", l: "Max CPC (Rp)" },
          ].map(({ f, l }) => (
            <div key={f}>
              <label style={styles.label}>{l}</label>
              <input type="number" value={thresh[f]} onChange={(e) => updateThresh(f, e.target.value)}
                style={styles.input} step={f === "roas" || f === "ctr" || f === "cvr" ? 0.1 : 500} />
            </div>
          ))}
        </div>
      </div>

      {/* Per-SKU cards */}
      {skus.map((sku, i) => {
        const c = calc(sku);
        const fc = getForecastContext(sku.name);
        const { sarads, sarstock } = getSaran(sku, c, fc);

        const stockBadge = fc ? {
          ok:           { label: "Stok Aman",       color: C.green },
          low:          { label: "Stok Menipis",    color: C.yellow },
          critical:     { label: "Stok Kritis",    color: C.red },
          overstock:    { label: "Overstock",       color: C.yellow },
          deadstock_risk: { label: "Deadstock Risk", color: C.red },
        }[fc.status] : null;

        return (
          <div key={i} style={{ ...styles.card, marginBottom: 20, borderLeft: `4px solid ${c.roas >= thresh.roas ? C.green : c.roas >= 1.5 ? C.yellow : C.red}` }}>
            {/* SKU Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: "bold" }}>{sku.name}</div>
                {stockBadge && (
                  <span style={{ fontSize: 10, fontFamily: FONT_MONO, padding: "2px 8px", borderRadius: 3, background: stockBadge.color + "22", color: stockBadge.color, fontWeight: "bold", border: `1px solid ${stockBadge.color}` }}>
                    {stockBadge.label}
                  </span>
                )}
                {fc && (
                  <span style={{ fontSize: 10, fontFamily: FONT_MONO, color: C.textMuted }}>
                    {fc.daysOfStock.toFixed(0)} hari stok tersisa
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 16, fontFamily: FONT_MONO, fontSize: 12 }}>
                <span style={{ color: c.roas >= thresh.roas ? C.positive : C.negative, fontWeight: "bold" }}>ROAS {c.roas.toFixed(2)}x</span>
                <span style={{ color: c.ctr >= thresh.ctr ? C.positive : C.negative }}>CTR {c.ctr.toFixed(2)}%</span>
                <span style={{ color: c.cvr >= thresh.cvr ? C.positive : C.negative }}>CVR {c.cvr.toFixed(2)}%</span>
              </div>
            </div>

            {/* Input row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { f: "impr", l: "Impresi" },
                { f: "clicks", l: "Klik" },
                { f: "atc", l: "ATC" },
                { f: "orders", l: "Order" },
                { f: "revenue", l: "Revenue (Rp)" },
                { f: "spend", l: "Spend (Rp)" },
                { f: "dailyBudget", l: "Budget/Hari (Rp)" },
              ].map(({ f, l }) => (
                <div key={f}>
                  <label style={styles.label}>{l}</label>
                  <input type="number" value={sku[f] || 0} onChange={(e) => update(i, f, e.target.value)} style={styles.input} />
                </div>
              ))}
            </div>

            {/* Metrics strip */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { l: "CTR", v: c.ctr.toFixed(2) + "%", ok: c.ctr >= thresh.ctr },
                { l: "CVR", v: c.cvr.toFixed(2) + "%", ok: c.cvr >= thresh.cvr },
                { l: "ATC Rate", v: c.atcR.toFixed(1) + "%", ok: c.atcR >= thresh.atc },
                { l: "ROAS", v: c.roas.toFixed(2) + "x", ok: c.roas >= thresh.roas },
                { l: "CPC", v: fmt(c.cpc), ok: c.cpc <= thresh.cpc },
                { l: "CPA", v: fmt(c.cpa), ok: true },
              ].map(({ l, v, ok }) => (
                <div key={l} style={{ background: ok ? C.positiveLight : C.negativeLight, border: `1px solid ${ok ? C.positiveDim : C.negativeDim}`, borderRadius: 5, padding: "6px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontFamily: FONT_MONO, color: C.textMuted }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: ok ? C.positive : C.negative, fontFamily: FONT_MONO }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Diagnosa Ads */}
            {sarads.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted, marginBottom: 6, fontWeight: "bold", letterSpacing: "0.08em" }}>DIAGNOSA IKLAN</div>
                {sarads.map((s, j) => (
                  <div key={j} style={{ ...styles.alert(s.type), marginBottom: 6 }}>{s.text}</div>
                ))}
              </div>
            )}

            {/* Saran Berbasis Stok */}
            <div>
              <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.textMuted, marginBottom: 6, fontWeight: "bold", letterSpacing: "0.08em" }}>SARAN - KONDISI STOK</div>
              {sarstock.map((s, j) => (
                <div key={j} style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 6, border: `1px solid`, borderColor: s.type === "red" ? C.red : s.type === "yellow" ? C.yellow : s.type === "green" ? C.green : C.gold, background: s.type === "red" ? C.redLight : s.type === "yellow" ? C.yellowLight : s.type === "green" ? C.greenLight : C.goldLight }}>
                  <div style={{ fontSize: 12, fontFamily: FONT_MONO, fontWeight: "bold", color: s.type === "red" ? C.red : s.type === "yellow" ? C.yellow : s.type === "green" ? C.green : C.gold, marginBottom: 4 }}>
                    {s.icon} {s.text}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.text, lineHeight: 1.6 }}>
                    -> {s.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- PRODUCT TRACKER -------------------------------------------------------
function ProductTracker({ skuNames }) {
  // -- Baca dari Forecast v2 --------------------------------------
  const forecastSkusRaw = (() => {
    try { return JSON.parse(localStorage.getItem("forecast_skus_v2")) || []; } catch { return []; }
  })();
  const forecastMonth = (() => {
    try { return parseInt(localStorage.getItem("forecast_month") || new Date().getMonth()); } catch { return new Date().getMonth(); }
  })();

  // Actual bulan ini - hanya unit terjual bulan ini, retur, rating yang diinput manual
  const defaultActual = () => skuNames.map(name => ({ name, unitsSold: 0, returns: 0, rating: 4.5 }));
  const [actual, setActual] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tracker_actual")) || defaultActual(); } catch { return defaultActual(); }
  });
  useEffect(() => {
    const updated = skuNames.map((name, i) => actual[i] ? { ...actual[i], name } : { name, unitsSold: 0, returns: 0, rating: 4.5 });
    setActual(updated);
  }, [skuNames]);
  useEffect(() => { localStorage.setItem("tracker_actual", JSON.stringify(actual)); }, [actual]);

  const updateActual = (i, f, v) => {
    const c = [...actual]; c[i] = { ...c[i], [f]: f === "rating" ? num(v) : num(v) }; setActual(c);
  };

  // Build rows: merge forecast hist + actual bulan ini
  const rows = skuNames.map((name, i) => {
    const fs = forecastSkusRaw.find(f => f.name === name);
    const hist = fs?.hist || [0, 0, 0];
    const filledHist = hist.filter(v => v > 0);
    const avgSales = fs?.histOverride ? fs.avgSales : (filledHist.length > 0 ? filledHist.reduce((a,b)=>a+b,0)/filledHist.length : fs?.avgSales || 0);
    const seasonMult = SEASONS[forecastMonth]?.mult || 1;
    const forecastBulanIni = Math.round(avgSales * seasonMult);
    const price = fs?.price || 0;
    const cat = fs ? getCategoryConfig(fs.category || "potential") : getCategoryConfig("potential");
    const act = actual[i] || { unitsSold: 0, returns: 0, rating: 4.5 };
    const revenueAktual = act.unitsSold * price;
    const vsTarget = forecastBulanIni > 0 ? ((act.unitsSold - forecastBulanIni) / forecastBulanIni * 100) : 0;
    const returnRate = act.unitsSold > 0 ? (act.returns / act.unitsSold * 100) : 0;
    return { name, hist, avgSales, forecastBulanIni, price, cat, act, revenueAktual, vsTarget, returnRate };
  });

  const prevMonths = [
    MONTHS_ALL[(forecastMonth - 3 + 12) % 12],
    MONTHS_ALL[(forecastMonth - 2 + 12) % 12],
    MONTHS_ALL[(forecastMonth - 1 + 12) % 12],
  ];
  const curMonthName = MONTHS_ALL[forecastMonth];
  const noForecastData = forecastSkusRaw.length === 0;

  const totalForecast = rows.reduce((s, r) => s + r.forecastBulanIni, 0);
  const totalAktual   = rows.reduce((s, r) => s + r.act.unitsSold, 0);
  const totalRevAktual = rows.reduce((s, r) => s + r.revenueAktual, 0);

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Product Performance Tracker</h2>
      <p style={{ fontSize: 11, color: C.textSecondary, fontFamily: FONT_MONO, marginBottom: 16, letterSpacing: "0.03em" }}>
        Performa aktual vs forecast per SKU. Histori 3 bulan otomatis dari Demand Forecast.
      </p>

      {noForecastData && (
        <div style={styles.alert("yellow")}>Isi modul Demand Forecast terlebih dahulu - histori penjualan & target akan otomatis muncul di sini.</div>
      )}

      {/* KPI summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: `Target Forecast ${curMonthName}`, val: totalForecast + " unit", color: C.accent },
          { label: `Aktual Terjual ${curMonthName}`, val: totalAktual + " unit", color: totalAktual >= totalForecast ? C.positive : C.negative },
          { label: "Revenue Aktual", val: fmt(totalRevAktual), color: C.green },
        ].map(k => (
          <div key={k.label} style={{ ...styles.kpiBox, borderLeft: `3px solid ${k.color}` }}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: k.color, fontFamily: FONT_MONO }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "SKU", "Kategori",
                  prevMonths[0], prevMonths[1], prevMonths[2],
                  `Target ${curMonthName}`,
                  `Aktual ${curMonthName}`, "Revenue Aktual",
                  "vs Target", "Retur", "Return Rate", "Rating"
                ].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const vsColor = row.vsTarget >= 0 ? C.positive : row.vsTarget >= -15 ? C.warning : C.negative;
                return (
                  <tr key={i} style={{ borderLeft: `2px solid ${row.cat.color}` }}>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>{row.name}</td>
                    <td style={{ ...styles.td, color: row.cat.color, fontSize: 11 }}>{row.cat.label}</td>

                    {/* History 3 bulan - read only dari forecast */}
                    {row.hist.map((h, mi) => (
                      <td key={mi} style={{ ...styles.td, color: C.textMuted, fontStyle: "italic" }}>{h > 0 ? h : "-"}</td>
                    ))}

                    {/* Target forecast bulan ini - read only */}
                    <td style={{ ...styles.td, fontWeight: "bold", color: C.accent }}>{row.forecastBulanIni}</td>

                    {/* Aktual input */}
                    <td style={styles.td}>
                      <input type="number" value={row.act.unitsSold}
                        onChange={e => updateActual(i, "unitsSold", e.target.value)}
                        style={{ ...styles.input, width: 80 }} />
                    </td>

                    <td style={{ ...styles.td, fontWeight: "bold", color: C.green }}>{fmt(row.revenueAktual)}</td>

                    {/* vs Target */}
                    <td style={{ ...styles.td, fontWeight: "bold", color: vsColor }}>
                      {row.vsTarget > 0 ? "▲" : row.vsTarget < 0 ? "▼" : "="}{Math.abs(row.vsTarget).toFixed(1)}%
                    </td>

                    {/* Retur input */}
                    <td style={styles.td}>
                      <input type="number" value={row.act.returns}
                        onChange={e => updateActual(i, "returns", e.target.value)}
                        style={{ ...styles.input, width: 70 }} />
                    </td>

                    <td style={{ ...styles.td, color: row.returnRate > 5 ? C.negative : C.positive }}>
                      {row.returnRate.toFixed(1)}%
                    </td>

                    {/* Rating input */}
                    <td style={styles.td}>
                      <input type="number" value={row.act.rating}
                        onChange={e => updateActual(i, "rating", e.target.value)}
                        style={{ ...styles.input, width: 65 }} step={0.1} min={1} max={5} />
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr style={{ background: C.surfaceAlt }}>
                <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>TOTAL</td>
                {[0,1,2].map(mi => (
                  <td key={mi} style={{ ...styles.td, color: C.textMuted, fontStyle: "italic" }}>
                    {rows.reduce((s,r) => s + (r.hist[mi]||0), 0) || "-"}
                  </td>
                ))}
                <td style={{ ...styles.td, fontWeight: "bold", color: C.accent }}>{totalForecast}</td>
                <td style={{ ...styles.td, fontWeight: "bold", color: totalAktual >= totalForecast ? C.positive : C.negative }}>{totalAktual}</td>
                <td style={{ ...styles.td, fontWeight: "bold", color: C.green }}>{fmt(totalRevAktual)}</td>
                <td style={{ ...styles.td, fontWeight: "bold", color: totalAktual >= totalForecast ? C.positive : C.negative }}>
                  {totalForecast > 0 ? ((totalAktual - totalForecast) / totalForecast * 100).toFixed(1) + "%" : "-"}
                </td>
                <td colSpan={3} style={styles.td} />
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: C.textMuted, fontFamily: FONT_MONO }}>
          * Histori 3 bulan & target otomatis dari Demand Forecast. Input manual hanya: unit terjual bulan ini, retur, dan rating.
        </div>
      </div>
    </div>
  );
}

// --- UNIT ECONOMICS ---------------------------------------------------------
function UnitEconomics() {
  const [d, setD] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ue")) || {
        price: 299000, cogs: 140000, marketplace_fee: 8, adSpendPct: 13,
        packaging: 5000, shipping_subsidy: 0, return_rate: 3
      };
    } catch { return { price: 299000, cogs: 140000, marketplace_fee: 8, adSpendPct: 13, packaging: 5000, shipping_subsidy: 0, return_rate: 3 }; }
  });
  useEffect(() => { localStorage.setItem("ue", JSON.stringify(d)); }, [d]);
  const set = (k, v) => setD({ ...d, [k]: num(v) });

  const mktFee = d.price * (d.marketplace_fee / 100);
  const adCost = d.price * (d.adSpendPct / 100);
  const netRevenue = d.price - mktFee - d.shipping_subsidy;
  const grossProfit = netRevenue - d.cogs - d.packaging;
  const netProfit = grossProfit - adCost;
  const netMargin = d.price > 0 ? (netProfit / d.price) * 100 : 0;
  const returnCost = d.cogs * (d.return_rate / 100);
  const adjustedNetProfit = netProfit - returnCost;

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Unit Economics</h2>
      <p style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO, marginBottom: 24 }}>Breakdown profit per unit terjual.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Input</div>
          {[
            { key: "price", label: "Harga Jual (Rp)" },
            { key: "cogs", label: "HPP / COGS (Rp)" },
            { key: "marketplace_fee", label: "Marketplace Fee (%)" },
            { key: "adSpendPct", label: "Ad Spend (% dari harga)" },
            { key: "packaging", label: "Packaging (Rp)" },
            { key: "shipping_subsidy", label: "Subsidi Ongkir (Rp)" },
            { key: "return_rate", label: "Return Rate (%)" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={styles.label}>{label}</label>
              <input type="number" value={d[key]} onChange={(e) => set(key, e.target.value)} style={styles.input} />
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Hasil per Unit</div>
          <table style={styles.table}>
            <tbody>
              {[
                { label: "Harga Jual", val: d.price, bold: false },
                { label: `Marketplace Fee (${d.marketplace_fee}%)`, val: -mktFee },
                { label: "Subsidi Ongkir", val: -d.shipping_subsidy },
                { label: "Net Revenue", val: netRevenue, bold: true },
                { label: "COGS", val: -d.cogs },
                { label: "Packaging", val: -d.packaging },
                { label: "Gross Profit", val: grossProfit, bold: true },
                { label: `Ad Cost (${d.adSpendPct}%)`, val: -adCost },
                { label: "Net Profit", val: netProfit, bold: true },
                { label: `Return Cost (${d.return_rate}%)`, val: -returnCost },
                { label: "Adjusted Net Profit", val: adjustedNetProfit, bold: true },
                { label: "Net Margin", val: null, display: netMargin.toFixed(1) + "%", bold: true, color: netMargin > 15 ? C.green : netMargin > 5 ? C.yellow : C.red },
              ].map((row, i) => (
                <tr key={i} style={{ background: row.bold ? C.surfaceAlt : "transparent" }}>
                  <td style={{ ...styles.td, fontWeight: row.bold ? "bold" : "normal" }}>{row.label}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: row.bold ? "bold" : "normal", color: row.color || (row.val === null ? C.text : row.val >= 0 ? C.text : C.red) }}>
                    {row.display || (row.val === null ? "-" : (row.val >= 0 ? "" : "-") + fmt(Math.abs(row.val)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD --------------------------------------------------------------
function Dashboard({ skuNames }) {
  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: FONT_MONO, letterSpacing: "0.04em", color: C.text }}>Summary Dashboard</h2>
      <p style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO, marginBottom: 24 }}>Ringkasan semua modul dalam satu tampilan.</p>
      <div style={styles.grid3}>
        {["Business Canvas", "Demand Forecast", "BCG Matrix", "Ad Performance", "Unit Economics", "Cashflow Simulator"].map((name) => (
          <div key={name} style={{ ...styles.kpiBox, textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 8, fontFamily: FONT_MONO, color: C.textMuted }}>
              {name === "Business Canvas" ? "-" : name === "Demand Forecast" ? "-" : name === "BCG Matrix" ? "-" : name === "Ad Performance" ? "-" : name === "Unit Economics" ? "-" : "-"}
            </div>
            <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT_MONO }}>
              {skuNames.length} SKU aktif
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...styles.card, marginTop: 20, textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: C.accent, fontFamily: FONT_MONO, marginBottom: 8 }}>BRAND OS v2.0</div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT_MONO }}>
          Enhanced Forecast × Cashflow Simulator × Revenue Projection<br />
          Bill & Board Group - @hanif.mhu
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// --- APP ROOT --------------------------------------------------------------
// ===========================================================================
export default function App() {
  useEffect(() => { injectFonts(); }, []);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("brandos_auth") === "1");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("brandos_tab") || TABS[0]);
  const [skuNames, setSkuNames] = useState(["SKU 1", "SKU 2", "SKU 3", "SKU 4", "SKU 5"]);

  const handleUnlock = () => { sessionStorage.setItem("brandos_auth", "1"); setUnlocked(true); };
  const handleTabChange = (tab) => { setActiveTab(tab); localStorage.setItem("brandos_tab", tab); };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  const renderTab = () => {
    switch (activeTab) {
      case "Canvas": return <BusinessCanvas />;
      case "Business Plan": return <BusinessPlan />;
      case "Demand Forecast": return <ForecastModule skuNames={skuNames} setSkuNames={setSkuNames} />;
      case "Size Breakdown": return <SizeBreakdown skuNames={skuNames} />;
      case "BCG Matrix": return <BCGMatrix skuNames={skuNames} />;
      case "Ad Performance": return <AdPerformance skuNames={skuNames} />;
      case "Product Tracker": return <ProductTracker skuNames={skuNames} />;
      case "Unit Economics": return <UnitEconomics />;
      case "Cashflow": return <CashflowSimulator skuNames={skuNames} />;
      case "Dashboard": return <Dashboard skuNames={skuNames} />;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.headerLogo}>
          <div style={styles.headerTitle}>Brand OS</div>
          <div style={styles.headerVersion}>v2.0</div>
        </div>
        <div style={styles.headerSub}>Bill & Board Group - Business Intelligence Suite</div>
      </div>
      <nav style={styles.nav}>
        {TABS.map((tab) => (
          <div key={tab} style={styles.navItem(activeTab === tab)} onClick={() => handleTabChange(tab)}>
            {tab === "Cashflow Simulator" ? tab : tab}
          </div>
        ))}
      </nav>
      <div style={styles.content}>{renderTab()}</div>
    </div>
  );
}
