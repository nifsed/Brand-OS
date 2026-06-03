import { useState, useCallback, useEffect, useRef } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0b0a08", s1: "#111009", s2: "#181610", s3: "#1e1b14",
  gold: "#c8a84b", goldDim: "#7a6428", goldBrt: "#f0c060",
  text: "#e2ddd4", mid: "#948e84", dim: "#4a4740",
  green: "#4a9e6b", greenBg: "#0a1a10",
  orange: "#d4753a", orangeBg: "#1a0e06",
  red: "#c04040", redBg: "#1a0808",
  blue: "#4a85c8", blueBg: "#080e1a",
  border: "#1e1c16", border2: "#2a2820",
};

const IDR = (n) => n ? "Rp " + Math.round(n).toLocaleString("id-ID") : "Rp 0";
const PCT = (n) => isNaN(n)||!isFinite(n) ? "0.0%" : n.toFixed(1) + "%";
const NUM = (n) => Math.round(n||0).toLocaleString("id-ID");
const f = parseFloat;


// ─── LOCALSTORAGE HOOK ────────────────────────────────────────────────────────
function useLocalState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem("brandos_" + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });
  const setAndStore = useCallback((val) => {
    setState(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      try { localStorage.setItem("brandos_" + key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [state, setAndStore];
}

// ─── SHARED UI ───────────────────────────────────────────────────────────────
const Label = ({c, children}) => <div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:c||C.mid,fontFamily:"'DM Mono',monospace",marginBottom:6}}>{children}</div>;
const Divider = ({label}) => <div style={{display:"flex",alignItems:"center",gap:10,margin:"24px 0 18px"}}><div style={{flex:1,height:1,background:C.border}}/>{label&&<span style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:C.dim,fontFamily:"'DM Mono',monospace"}}>{label}</span>}<div style={{flex:1,height:1,background:C.border}}/></div>;

const Field = ({label, hint, children}) => (
  <div style={{marginBottom:14}}>
    <Label>{label}</Label>
    {hint && <div style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace",marginBottom:4}}>{hint}</div>}
    {children}
  </div>
);

const Input = ({value, onChange, type="text", placeholder, prefix, suffix, multiline, rows=3, small}) => {
  const base = {background:C.s1,border:`1px solid ${C.border2}`,color:C.text,fontFamily:"'DM Mono',monospace",fontSize:small?11:13,outline:"none",width:"100%",boxSizing:"border-box"};
  if (multiline) return <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,padding:"9px 11px",resize:"vertical",borderRadius:2}}/>;
  return (
    <div style={{display:"flex",alignItems:"center",background:C.s1,border:`1px solid ${C.border2}`,borderRadius:2,overflow:"hidden"}}>
      {prefix && <span style={{padding:"0 9px",color:C.dim,fontSize:11,fontFamily:"'DM Mono',monospace",borderRight:`1px solid ${C.border2}`,whiteSpace:"nowrap"}}>{prefix}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"0"} style={{...base,border:"none",padding:"9px 11px",flex:1,background:"transparent",borderRadius:0}}/>
      {suffix && <span style={{padding:"0 9px",color:C.dim,fontSize:11,fontFamily:"'DM Mono',monospace",borderLeft:`1px solid ${C.border2}`,whiteSpace:"nowrap"}}>{suffix}</span>}
    </div>
  );
};

const Stat = ({label, value, sub, color, hi}) => (
  <div style={{padding:"13px 15px",background:hi?C.s3:C.s1,border:`1px solid ${hi?C.gold+"50":C.border2}`,borderRadius:3}}>
    <div style={{fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:hi?C.gold:C.dim,fontFamily:"'DM Mono',monospace",marginBottom:5}}>{label}</div>
    <div style={{fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:color||C.text,lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace",marginTop:3}}>{sub}</div>}
  </div>
);

const Alert = ({type, label, note}) => {
  const m = {ok:[C.green,C.greenBg,"✓"],warn:[C.orange,C.orangeBg,"!"],bad:[C.red,C.redBg,"✕"],info:[C.blue,C.blueBg,"→"]};
  const [col,bg,icon] = m[type]||m.info;
  return <div style={{display:"flex",gap:10,padding:"11px 13px",background:bg,border:`1px solid ${col}30`,borderRadius:2,marginBottom:8}}><span style={{color:col,fontFamily:"'DM Mono',monospace",minWidth:14,fontSize:12}}>{icon}</span><div><div style={{fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:col,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{label}</div><div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",lineHeight:1.6}}>{note}</div></div></div>;
};

const Btn = ({onClick, children, disabled, secondary}) => (
  <button onClick={onClick} disabled={disabled} style={{padding:"12px 20px",background:disabled?"#2a2720":secondary?"transparent":C.gold,border:secondary?`1px solid ${C.border2}`:"none",borderRadius:2,color:disabled?C.dim:secondary?C.mid:"#0b0a08",fontSize:11,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:disabled?"not-allowed":"pointer",fontWeight:700,transition:"all 0.15s"}}>
    {children}
  </button>
);

const Tag = ({c, children}) => <span style={{display:"inline-block",padding:"2px 7px",background:(c||C.gold)+"18",border:`1px solid ${(c||C.gold)}40`,borderRadius:2,fontSize:9,color:c||C.gold,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",marginRight:5,marginBottom:3}}>{children}</span>;

// ─── SEASONALITY DATA ─────────────────────────────────────────────────────────
const DEFAULT_SEASONS = [
  {month:"Jan",mult:1.0,note:"Normal"},
  {month:"Feb",mult:1.1,note:"Pra-Ramadan"},
  {month:"Mar",mult:2.5,note:"Ramadan Peak"},
  {month:"Apr",mult:3.5,note:"Lebaran Peak"},
  {month:"Mei",mult:0.7,note:"Post-Lebaran"},
  {month:"Jun",mult:0.6,note:"Decline"},
  {month:"Jul",mult:0.8,note:"Recovery"},
  {month:"Agu",mult:0.9,note:"Recovery"},
  {month:"Sep",mult:1.0,note:"Stable"},
  {month:"Okt",mult:1.1,note:"Q4 Start"},
  {month:"Nov",mult:1.3,note:"Pre-Harbolnas"},
  {month:"Des",mult:1.8,note:"Harbolnas"},
];

const SKU_CATS = ["Best Seller","Fast Moving","Potential","Slow Moving"];
const BUFFERS = {"Best Seller":0.25,"Fast Moving":0.10,"Potential":0.05,"Slow Moving":0.05};
const BCG_COLORS = {"⭐ STAR":C.gold,"🐄 CASH COW":C.green,"❓ QUESTION MARK":C.goldDim,"🐕 DOG":C.mid,"🐌 SLOW MOVE":C.orange,"☠ DEADSTOCK":C.red};

// ─── MODULE 1: CANVAS ────────────────────────────────────────────────────────
function CanvasModule() {
  const [d, setD] = useLocalState("canvas", {brandName:"",tagline:"",category:"",founded:"",keyPartners:"",keyActivities:"",keyResources:"",valueProposition:"",custRelationship:"",channels:"",custSegments:"",costStructure:"",revenueStreams:"",unfairAdvantage:"",problemSolving:"",keyMetrics:""});
  const s = k => v => setD(p=>({...p,[k]:v}));
  const blocks = [
    {key:"keyPartners",label:"Key Partners",color:"#6b5a9e",cs:0,ce:1,rs:0,re:1,hint:"Supplier, mitra distribusi, vendor kritis"},
    {key:"keyActivities",label:"Key Activities",color:"#4a7a9e",cs:1,ce:2,rs:0,re:0,hint:"Aktivitas inti yang menggerakkan bisnis"},
    {key:"keyResources",label:"Key Resources",color:"#4a7a9e",cs:1,ce:2,rs:1,re:1,hint:"Tim, IP, modal, infrastruktur"},
    {key:"valueProposition",label:"Value Proposition",color:C.gold,cs:2,ce:3,rs:0,re:1,hint:"Alasan utama pelanggan memilih brand ini"},
    {key:"custRelationship",label:"Customer Relationships",color:"#4a9e6b",cs:3,ce:4,rs:0,re:0,hint:"Cara brand membangun & retain pelanggan"},
    {key:"channels",label:"Channels",color:"#4a9e6b",cs:3,ce:4,rs:1,re:1,hint:"TikTok Shop, Shopee, offline, dll"},
    {key:"custSegments",label:"Customer Segments",color:"#9e6b4a",cs:4,ce:5,rs:0,re:1,hint:"Siapa pelanggan & segmen prioritas"},
  ];
  const bottomBlocks = [
    {key:"costStructure",label:"Cost Structure",color:C.red,hint:"COGS, SDM, ads, operasional, sewa"},
    {key:"revenueStreams",label:"Revenue Streams",color:C.green,hint:"Dari mana pendapatan masuk"},
  ];
  const extraBlocks = [
    {key:"unfairAdvantage",label:"Unfair Advantage",color:C.goldDim,hint:"Yang tidak bisa ditiru kompetitor"},
    {key:"problemSolving",label:"Problem Solving",color:C.blue,hint:"Masalah apa yang diselesaikan brand"},
    {key:"keyMetrics",label:"Key Metrics",color:"#9e9e4a",hint:"Metrik utama yang dimonitor tim"},
  ];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[["Nama Brand","brandName"],["Tagline","tagline"],["Kategori","category"],["Tahun Berdiri","founded"]].map(([l,k])=>(
          <Field key={k} label={l}><Input value={d[k]} onChange={s(k)} placeholder={l}/></Field>
        ))}
      </div>
      <Divider label="Business Model Canvas"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gridTemplateRows:"auto auto",gap:8,marginBottom:8}}>
        {blocks.map(b=>(
          <div key={b.key} style={{gridColumn:`${b.cs+1}/${b.ce+2}`,gridRow:`${b.rs+1}/${b.re+2}`,background:C.s1,border:`1px solid ${C.border2}`,borderTop:`2px solid ${b.color}`,borderRadius:2,padding:10,minHeight:b.rs!==b.re?160:100,display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:b.color,fontFamily:"'DM Mono',monospace",marginBottom:5}}>{b.label}</div>
            <textarea value={d[b.key]} onChange={e=>s(b.key)(e.target.value)} placeholder={b.hint} style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,lineHeight:1.6,resize:"none",width:"100%",minHeight:60}}/>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {bottomBlocks.map(b=>(
          <div key={b.key} style={{background:C.s1,border:`1px solid ${C.border2}`,borderTop:`2px solid ${b.color}`,borderRadius:2,padding:10}}>
            <div style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:b.color,fontFamily:"'DM Mono',monospace",marginBottom:5}}>{b.label}</div>
            <textarea value={d[b.key]} onChange={e=>s(b.key)(e.target.value)} placeholder={b.hint} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,lineHeight:1.6,resize:"none",minHeight:60}}/>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {extraBlocks.map(b=>(
          <div key={b.key} style={{background:C.s1,border:`1px solid ${C.border2}`,borderTop:`2px solid ${b.color}`,borderRadius:2,padding:10}}>
            <div style={{fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:b.color,fontFamily:"'DM Mono',monospace",marginBottom:5}}>{b.label}</div>
            <textarea value={d[b.key]} onChange={e=>s(b.key)(e.target.value)} placeholder={b.hint} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,lineHeight:1.6,resize:"none",minHeight:70}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 2: FORECAST + SEASONALITY ────────────────────────────────────────
function ForecastModule() {
  const [seasons, setSeasons] = useLocalState("forecast_seasons", DEFAULT_SEASONS);
  const [selectedMonth, setSelectedMonth] = useLocalState("forecast_month", 3);
  const [bsBuffer, setBsBuffer] = useLocalState("forecast_bs", "25"); const [fmBuffer, setFmBuffer] = useLocalState("forecast_fm", "10");
  const [trafficBuffer, setTrafficBuffer] = useLocalState("forecast_traffic", "5"); const [safetyBuffer, setSafetyBuffer] = useLocalState("forecast_safety", "15");
  const emptySku = () => ({name:"",cat:"Best Seller",m1:"",m2:"",m3:"",price:"",cogs:"",stock:"",lead:"14"});
  const [skus, setSkus] = useLocalState("forecast_skus", Array(8).fill(null).map(emptySku));
  const [result, setResult] = useState(null);

  const updSku = (i,k,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const updSeason = (i,k,v) => setSeasons(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const calculate = () => {
    const sm = seasons[selectedMonth].mult;
    const rows = skus.map(sk => {
      const sales = [f(sk.m1)||0, f(sk.m2)||0, f(sk.m3)||0];
      const valid = sales.filter(v=>v>0);
      const avg = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
      const buf = sk.cat==="Best Seller"?f(bsBuffer)/100:sk.cat==="Fast Moving"?f(fmBuffer)/100:f(trafficBuffer)/100;
      const forecast = Math.ceil(avg * sm * (1+buf));
      const stockNeeded = Math.ceil(forecast * (1+f(safetyBuffer)/100));
      const restock = Math.max(0, stockNeeded - (f(sk.stock)||0));
      const revenue = forecast * (f(sk.price)||0);
      const restockCost = restock * (f(sk.cogs)||0);
      const dailyAvg = avg/30;
      const dio = dailyAvg > 0 ? (f(sk.stock)||0)/dailyAvg : 0;
      const ssr = avg > 0 ? (f(sk.stock)||0)/avg : 0;
      return {...sk, avg, sm, buf, forecast, stockNeeded, restock, revenue, restockCost, dio, ssr};
    });
    setResult(rows);
  };

  const totalForecastRev = result ? result.reduce((a,r)=>a+r.revenue,0) : 0;
  const totalRestock = result ? result.reduce((a,r)=>a+r.restockCost,0) : 0;

  return (
    <div>
      <Divider label="Seasonality Multiplier"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(12,1fr)",gap:4,marginBottom:16}}>
        {seasons.map((s,i)=>(
          <div key={i} onClick={()=>setSelectedMonth(i)} style={{background:i===selectedMonth?C.goldDim+"40":C.s1,border:`1px solid ${i===selectedMonth?C.gold:C.border2}`,borderRadius:2,padding:"8px 4px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:9,color:i===selectedMonth?C.gold:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:4}}>{s.month}</div>
            <input type="number" value={s.mult} onChange={e=>updSeason(i,"mult",parseFloat(e.target.value)||1)}
              style={{width:"100%",background:"transparent",border:"none",outline:"none",color:i===selectedMonth?C.goldBrt:C.text,fontFamily:"'DM Mono',monospace",fontSize:12,textAlign:"center",fontWeight:700}}/>
            <div style={{fontSize:8,color:C.dim,fontFamily:"'DM Mono',monospace",marginTop:2,lineHeight:1.2}}>{s.note}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 14px",background:C.goldDim+"15",border:`1px solid ${C.gold}30`,borderRadius:2,marginBottom:16,fontSize:11,fontFamily:"'DM Mono',monospace",color:C.mid}}>
        Forecast bulan: <span style={{color:C.goldBrt,fontWeight:700}}>{seasons[selectedMonth].month}</span> — Seasonal multiplier: <span style={{color:C.goldBrt,fontWeight:700}}>{seasons[selectedMonth].mult}x</span> <span style={{color:C.dim}}>({seasons[selectedMonth].note})</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <Field label="Best Seller Buffer"><Input value={bsBuffer} onChange={setBsBuffer} suffix="%" type="number"/></Field>
        <Field label="Fast Moving Buffer"><Input value={fmBuffer} onChange={setFmBuffer} suffix="%" type="number"/></Field>
        <Field label="Traffic Growth %"><Input value={trafficBuffer} onChange={setTrafficBuffer} suffix="%" type="number"/></Field>
        <Field label="Safety Stock %"><Input value={safetyBuffer} onChange={setSafetyBuffer} suffix="%" type="number"/></Field>
      </div>

      <Divider label="SKU Input"/>
      <div style={{overflowX:"auto",marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["SKU / Produk","Kategori","M-3","M-2","M-1","Harga Jual","COGS/unit","Stok Skrg","Lead (hr)",""].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skus.map((sk,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`}}>
                <td style={{padding:"5px 6px"}}><input value={sk.name} onChange={e=>updSku(i,"name",e.target.value)} placeholder={`SKU ${i+1}`} style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:110}}/></td>
                <td style={{padding:"5px 6px"}}>
                  <select value={sk.cat} onChange={e=>updSku(i,"cat",e.target.value)} style={{background:C.s2,border:`1px solid ${C.border2}`,color:C.text,fontFamily:"'DM Mono',monospace",fontSize:10,padding:"3px 5px",borderRadius:2,outline:"none"}}>
                    {SKU_CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </td>
                {["m1","m2","m3","price","cogs","stock","lead"].map(k=>(
                  <td key={k} style={{padding:"5px 6px"}}><input type="number" value={sk[k]} onChange={e=>updSku(i,k,e.target.value)} placeholder="0" style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:70,textAlign:"right"}}/></td>
                ))}
                <td><button onClick={()=>setSkus(s=>s.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:14}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <Btn secondary onClick={()=>setSkus(s=>[...s,emptySku()])}>+ SKU</Btn>
        <Btn onClick={calculate}>Hitung Forecast →</Btn>
      </div>

      {result && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            <Stat label="Total Forecast Revenue" value={IDR(totalForecastRev)} hi/>
            <Stat label="Total Restock Cost" value={IDR(totalRestock)} color={C.orange}/>
            <Stat label="Seasonal Multiplier" value={`${seasons[selectedMonth].mult}x`} sub={seasons[selectedMonth].note} color={C.gold}/>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {["SKU","Kategori","Avg/Bln","Seasonal","Buffer","Forecast","Stok Needed","Restock","Rev Forecast","DIO","SSR"].map(h=>(
                    <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.filter(r=>r.name||r.avg>0).map((r,i)=>{
                  const catCol = r.cat==="Best Seller"?C.gold:r.cat==="Fast Moving"?C.green:r.cat==="Potential"?C.blue:C.dim;
                  const dioSt = r.dio<15?"bad":r.dio<30?"warn":"ok";
                  const ssrSt = r.ssr<1?"bad":r.ssr<2?"warn":"ok";
                  const stColors = {ok:C.green,warn:C.orange,bad:C.red};
                  return (
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}20`,background:i%2===0?C.s1:C.s2}}>
                      <td style={{padding:"7px 8px",color:C.text}}>{r.name||`SKU ${i+1}`}</td>
                      <td style={{padding:"7px 8px"}}><Tag c={catCol}>{r.cat}</Tag></td>
                      <td style={{padding:"7px 8px",color:C.mid,textAlign:"right"}}>{r.avg.toFixed(1)}</td>
                      <td style={{padding:"7px 8px",color:C.gold,textAlign:"right"}}>{r.sm}x</td>
                      <td style={{padding:"7px 8px",color:catCol,textAlign:"right"}}>+{(r.buf*100).toFixed(0)}%</td>
                      <td style={{padding:"7px 8px",color:C.text,fontWeight:700,textAlign:"right"}}>{NUM(r.forecast)}</td>
                      <td style={{padding:"7px 8px",color:C.mid,textAlign:"right"}}>{NUM(r.stockNeeded)}</td>
                      <td style={{padding:"7px 8px",color:r.restock>0?C.orange:C.green,textAlign:"right"}}>{r.restock>0?NUM(r.restock):"✓"}</td>
                      <td style={{padding:"7px 8px",color:C.gold,textAlign:"right"}}>{IDR(r.revenue)}</td>
                      <td style={{padding:"7px 8px",color:stColors[dioSt],textAlign:"right"}}>{r.dio.toFixed(0)}hr</td>
                      <td style={{padding:"7px 8px",color:stColors[ssrSt],textAlign:"right"}}>{r.ssr.toFixed(2)}x</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MODULE 3: SIZE BREAKDOWN ─────────────────────────────────────────────────
function SizeModule() {
  const sizes = ["XXS","XS","S","M","L","XL","XXL","XXXL"];
  const [ratios, setRatios] = useLocalState("size_ratios", {XXS:0,XS:0,S:20,M:35,L:25,XL:15,XXL:5,XXXL:0});
  const [skus, setSkus] = useLocalState("size_skus", Array(6).fill(null).map((_,i)=>({name:`SKU ${i+1}`,forecast:"",cogsPerUnit:""})));
  const updRatio = (sz,v) => setRatios(r=>({...r,[sz]:parseFloat(v)||0}));
  const updSku = (i,k,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const totalRatio = Object.values(ratios).reduce((a,b)=>a+b,0);

  const breakdown = skus.map(sk => {
    const fc = f(sk.forecast)||0;
    const bySize = {};
    sizes.forEach(sz => { bySize[sz] = Math.ceil(fc * ratios[sz]/100); });
    const cogsTotal = Object.values(bySize).reduce((a,b)=>a+b,0) * (f(sk.cogsPerUnit)||0);
    return {...sk, bySize, cogsTotal, total:Object.values(bySize).reduce((a,b)=>a+b,0)};
  });

  return (
    <div>
      <Divider label="Size Ratio"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:8,marginBottom:8}}>
        {sizes.map(sz=>(
          <Field key={sz} label={sz}>
            <Input value={ratios[sz]} onChange={v=>updRatio(sz,v)} suffix="%" type="number"/>
          </Field>
        ))}
      </div>
      <div style={{padding:"8px 12px",background:Math.abs(totalRatio-100)<0.5?C.greenBg:C.redBg,border:`1px solid ${Math.abs(totalRatio-100)<0.5?C.green:C.red}40`,borderRadius:2,marginBottom:20,fontSize:11,fontFamily:"'DM Mono',monospace",color:Math.abs(totalRatio-100)<0.5?C.green:C.red}}>
        Total ratio: {totalRatio.toFixed(1)}% {Math.abs(totalRatio-100)<0.5?"✓ OK":"← Harus = 100%"}
      </div>

      <Divider label="SKU Forecast Input"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {skus.map((sk,i)=>(
          <div key={i} style={{background:C.s1,border:`1px solid ${C.border2}`,borderRadius:2,padding:12}}>
            <Field label="Nama SKU"><Input value={sk.name} onChange={v=>updSku(i,"name",v)} placeholder={`SKU ${i+1}`}/></Field>
            <Field label="Forecast Unit"><Input value={sk.forecast} onChange={v=>updSku(i,"forecast",v)} type="number"/></Field>
            <Field label="COGS/unit"><Input value={sk.cogsPerUnit} onChange={v=>updSku(i,"cogsPerUnit",v)} prefix="Rp" type="number"/></Field>
          </div>
        ))}
      </div>

      <Divider label="Size Breakdown Output"/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              <th style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>SKU</th>
              <th style={{padding:"7px 8px",textAlign:"right",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>Total</th>
              {sizes.map(sz=><th key={sz} style={{padding:"7px 8px",textAlign:"right",color:C.dim,fontSize:9,letterSpacing:"0.1em",fontWeight:"normal"}}>{sz}</th>)}
              <th style={{padding:"7px 8px",textAlign:"right",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>COGS Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((r,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`,background:i%2===0?C.s1:C.s2}}>
                <td style={{padding:"7px 8px",color:C.text,fontWeight:700}}>{r.name}</td>
                <td style={{padding:"7px 8px",color:C.gold,textAlign:"right",fontWeight:700}}>{NUM(r.total)}</td>
                {sizes.map(sz=><td key={sz} style={{padding:"7px 8px",color:r.bySize[sz]>0?C.mid:C.dim,textAlign:"right"}}>{r.bySize[sz]>0?NUM(r.bySize[sz]):"-"}</td>)}
                <td style={{padding:"7px 8px",color:C.orange,textAlign:"right"}}>{IDR(r.cogsTotal)}</td>
              </tr>
            ))}
            <tr style={{borderTop:`1px solid ${C.border}`,background:C.s3}}>
              <td style={{padding:"7px 8px",color:C.gold,fontWeight:700}}>TOTAL</td>
              <td style={{padding:"7px 8px",color:C.gold,textAlign:"right",fontWeight:700}}>{NUM(breakdown.reduce((a,r)=>a+r.total,0))}</td>
              {sizes.map(sz=><td key={sz} style={{padding:"7px 8px",color:C.text,textAlign:"right",fontWeight:700}}>{NUM(breakdown.reduce((a,r)=>a+r.bySize[sz],0))}</td>)}
              <td style={{padding:"7px 8px",color:C.orange,textAlign:"right",fontWeight:700}}>{IDR(breakdown.reduce((a,r)=>a+r.cogsTotal,0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MODULE 4: BCG MATRIX ─────────────────────────────────────────────────────
function BCGModule() {
  const [thresholds, setThresholds] = useLocalState("bcg_thresholds", {deadstock:90,slowmove:45,bestDio:20,ssrBest:2.0,revShareStar:0.15});
  const [skus, setSkus] = useLocalState("bcg_skus", Array(10).fill(null).map((_,i)=>({name:`SKU ${i+1}`,units30:"",units90:"",stock:"",price:"",cogs:""})));
  const updSku = (i,k,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const totalRev30 = skus.reduce((a,sk)=>(f(sk.units30)||0)*(f(sk.price)||0)+a,0);

  const classified = skus.map(sk => {
    const u30=f(sk.units30)||0, stock=f(sk.stock)||0, price=f(sk.price)||0;
    const avgDaily = u30/30;
    const dio = avgDaily>0 ? stock/avgDaily : 999;
    const ssr = u30>0 ? stock/u30 : 0;
    const rev30 = u30*price;
    const revShare = totalRev30>0 ? rev30/totalRev30 : 0;
    const velocity = skus.filter(s=>(f(s.units30)||0)>0).length>0 ? u30/(skus.reduce((a,s)=>a+(f(s.units30)||0),0)/skus.filter(s=>(f(s.units30)||0)>0).length||1) : 0;
    let quadrant;
    if (dio > thresholds.deadstock) quadrant = "☠ DEADSTOCK";
    else if (dio > thresholds.slowmove) quadrant = "🐌 SLOW MOVE";
    else if (revShare >= thresholds.revShareStar && velocity > 1) quadrant = "⭐ STAR";
    else if (revShare >= thresholds.revShareStar && velocity <= 1) quadrant = "🐄 CASH COW";
    else if (revShare < thresholds.revShareStar && velocity > 1) quadrant = "❓ QUESTION MARK";
    else quadrant = "🐕 DOG";
    return {...sk, dio, ssr, rev30, revShare, velocity, quadrant};
  });

  const summary = Object.keys(BCG_COLORS).map(q=>({
    q, count:classified.filter(r=>r.quadrant===q).length,
    rev:classified.filter(r=>r.quadrant===q).reduce((a,r)=>a+r.rev30,0),
    avgDio:classified.filter(r=>r.quadrant===q).length>0?classified.filter(r=>r.quadrant===q).reduce((a,r)=>a+r.dio,0)/classified.filter(r=>r.quadrant===q).length:0
  }));

  const actions = {"⭐ STAR":"Pertahankan & scale. Buffer stok lebih tinggi.","🐄 CASH COW":"Jaga konsistensi. Monitor margin.","❓ QUESTION MARK":"Evaluasi. Naikkan awareness atau reposisi.","🐕 DOG":"Pertimbangkan discontinue atau promo clearance.","🐌 SLOW MOVE":"Promo agresif atau bundle. Kurangi restock.","☠ DEADSTOCK":"Clearance segera. Jangan restock."};

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
        {[["DIO Deadstock (>hari)","deadstock"],["DIO Slow Move (>hari)","slowmove"],["DIO Best Seller (<hari)","bestDio"],["SSR Best Seller (>x)","ssrBest"],["Rev Share Star (>%)","revShareStar"]].map(([l,k])=>(
          <Field key={k} label={l}><Input value={thresholds[k]} onChange={v=>setThresholds(t=>({...t,[k]:parseFloat(v)||0}))} type="number"/></Field>
        ))}
      </div>

      <Divider label="SKU Input"/>
      <div style={{overflowX:"auto",marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["SKU / Produk","Units Terjual (30hr)","Units Terjual (90hr)","Stok Sekarang","Harga Jual","COGS/unit",""].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skus.map((sk,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`}}>
                <td style={{padding:"5px 6px"}}><input value={sk.name} onChange={e=>updSku(i,"name",e.target.value)} placeholder={`SKU ${i+1}`} style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:100}}/></td>
                {["units30","units90","stock","price","cogs"].map(k=>(
                  <td key={k} style={{padding:"5px 6px"}}><input type="number" value={sk[k]} onChange={e=>updSku(i,k,e.target.value)} placeholder="0" style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:80,textAlign:"right"}}/></td>
                ))}
                <td><button onClick={()=>setSkus(s=>s.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:14}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Btn secondary onClick={()=>setSkus(s=>[...s,{name:`SKU ${s.length+1}`,units30:"",units90:"",stock:"",price:"",cogs:""}])}>+ SKU</Btn>

      <Divider label="BCG Classification"/>
      <div style={{overflowX:"auto",marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["SKU","DIO (hari)","SSR (x)","Rev Share","Velocity","BCG Kuadran"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classified.filter(r=>r.name).map((r,i)=>{
              const qc = BCG_COLORS[r.quadrant]||C.mid;
              return (
                <tr key={i} style={{borderBottom:`1px solid ${C.border}20`,background:i%2===0?C.s1:C.s2}}>
                  <td style={{padding:"7px 8px",color:C.text}}>{r.name}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:r.dio>thresholds.deadstock?C.red:r.dio>thresholds.slowmove?C.orange:C.green}}>{r.dio===999?"—":r.dio.toFixed(0)+" hr"}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:r.ssr<1?C.red:r.ssr<2?C.orange:C.green}}>{r.ssr.toFixed(2)}x</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:C.mid}}>{PCT(r.revShare*100)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:r.velocity>1?C.green:C.mid}}>{r.velocity.toFixed(2)}x</td>
                  <td style={{padding:"7px 8px"}}><Tag c={qc}>{r.quadrant}</Tag></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Divider label="BCG Summary Matrix"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {summary.filter(s=>s.count>0).map(s=>{
          const qc = BCG_COLORS[s.q]||C.mid;
          return (
            <div key={s.q} style={{background:C.s1,border:`1px solid ${qc}30`,borderLeft:`3px solid ${qc}`,borderRadius:2,padding:14}}>
              <div style={{fontSize:14,marginBottom:6}}>{s.q.split(" ")[0]}</div>
              <div style={{fontSize:12,color:qc,fontFamily:"'DM Mono',monospace",fontWeight:700,marginBottom:4}}>{s.q.substring(2)}</div>
              <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{s.count} SKU · {IDR(s.rev)}</div>
              <div style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace",marginBottom:8}}>Avg DIO: {s.avgDio.toFixed(0)} hari</div>
              <div style={{fontSize:10,color:C.mid,fontFamily:"'DM Mono',monospace",fontStyle:"italic",lineHeight:1.5}}>{actions[s.q]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MODULE 5: AD PERFORMANCE ─────────────────────────────────────────────────
function AdPerfModule() {
  const [thresholds, setThresholds] = useLocalState("adperf_thresholds", {ctr:2,cvr:3,atc:8,roas:3,cpc:2500});
  const emptySku = () => ({name:"",spend:"",impresi:"",klik:"",atc:"",checkout:"",revenue:""});
  const [skus, setSkus] = useLocalState("adperf_skus", Array(6).fill(null).map(emptySku));
  const updSku = (i,k,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const calc = skus.map(sk => {
    const spend=f(sk.spend)||0, imp=f(sk.impresi)||0, klik=f(sk.klik)||0;
    const atc=f(sk.atc)||0, checkout=f(sk.checkout)||0, rev=f(sk.revenue)||0;
    const ctr = klik>0&&imp>0?klik/imp*100:0;
    const cvr = klik>0&&checkout>0?checkout/klik*100:0;
    const atcRate = klik>0&&atc>0?atc/klik*100:0;
    const roas = spend>0?rev/spend:0;
    const cpc = klik>0&&spend>0?spend/klik:0;
    let diag = "—";
    if (spend>0) {
      if (roas < thresholds.roas) diag = "⚠ ROAS Rendah — Kurangi Spend";
      else if (ctr < thresholds.ctr) diag = "📉 CTR Rendah — Ganti Creative";
      else if (atcRate > thresholds.atc && cvr < thresholds.cvr) diag = "🛒 ATC Tinggi CVR Rendah — Cek Harga";
      else if (cvr < thresholds.cvr) diag = "📉 CVR Rendah — Optimasi Halaman";
      else if (atcRate < thresholds.atc) diag = "👁 Traffic OK, ATC Rendah — Perkuat Value Prop";
      else diag = "✓ Performa Baik";
    }
    const diagColor = diag.startsWith("⚠")||diag.startsWith("📉")||diag.startsWith("🛒")?C.orange:diag.startsWith("👁")?C.blue:diag==="✓ Performa Baik"?C.green:C.dim;
    return {...sk,ctr,cvr,atcRate,roas,cpc,diag,diagColor};
  });

  const totals = {
    spend:calc.reduce((a,r)=>a+(f(r.spend)||0),0),
    rev:calc.reduce((a,r)=>a+(f(r.revenue)||0),0),
    klik:calc.reduce((a,r)=>a+(f(r.klik)||0),0),
    imp:calc.reduce((a,r)=>a+(f(r.impresi)||0),0),
    checkout:calc.reduce((a,r)=>a+(f(r.checkout)||0),0),
  };
  const blendedRoas = totals.spend>0?totals.rev/totals.spend:0;
  const avgCtr = totals.imp>0?totals.klik/totals.imp*100:0;
  const avgCvr = totals.klik>0?totals.checkout/totals.klik*100:0;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
        {[["CTR Bagus (>%)","ctr"],["CVR Bagus (>%)","cvr"],["ATC Rate Bagus (>%)","atc"],["Min ROAS","roas"],["Max CPC (Rp)","cpc"]].map(([l,k])=>(
          <Field key={k} label={l}><Input value={thresholds[k]} onChange={v=>setThresholds(t=>({...t,[k]:parseFloat(v)||0}))} type="number"/></Field>
        ))}
      </div>

      <Divider label="Ad Input per SKU"/>
      <div style={{overflowX:"auto",marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["SKU / Produk","Ad Spend","Impresi","Klik","Add to Cart","Checkout","Revenue dari Iklan",""].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skus.map((sk,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`}}>
                <td style={{padding:"5px 6px"}}><input value={sk.name} onChange={e=>updSku(i,"name",e.target.value)} placeholder={`SKU ${i+1}`} style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:100}}/></td>
                {["spend","impresi","klik","atc","checkout","revenue"].map(k=>(
                  <td key={k} style={{padding:"5px 6px"}}><input type="number" value={sk[k]} onChange={e=>updSku(i,k,e.target.value)} placeholder="0" style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:80,textAlign:"right"}}/></td>
                ))}
                <td><button onClick={()=>setSkus(s=>s.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:14}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Btn secondary onClick={()=>setSkus(s=>[...s,emptySku()])}>+ SKU</Btn>

      <Divider label="Performance Analysis"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <Stat label="Blended ROAS" value={blendedRoas.toFixed(1)+"x"} color={blendedRoas<thresholds.roas?C.red:blendedRoas<thresholds.roas*1.5?C.orange:C.green} hi/>
        <Stat label="Avg CTR" value={PCT(avgCtr)} color={avgCtr<thresholds.ctr?C.red:C.green}/>
        <Stat label="Avg CVR" value={PCT(avgCvr)} color={avgCvr<thresholds.cvr?C.red:C.green}/>
        <Stat label="Total Ad Spend" value={IDR(totals.spend)} color={C.orange}/>
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["SKU","CTR","CVR","ATC Rate","ROAS","CPC","Diagnosis"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calc.filter(r=>r.name||(f(r.spend)||0)>0).map((r,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`,background:i%2===0?C.s1:C.s2}}>
                <td style={{padding:"7px 8px",color:C.text}}>{r.name||`SKU ${i+1}`}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:r.ctr<thresholds.ctr&&r.ctr>0?C.red:C.mid}}>{r.ctr>0?PCT(r.ctr):"—"}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:r.cvr<thresholds.cvr&&r.cvr>0?C.red:C.mid}}>{r.cvr>0?PCT(r.cvr):"—"}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:r.atcRate>thresholds.atc?C.green:r.atcRate>0?C.orange:C.dim}}>{r.atcRate>0?PCT(r.atcRate):"—"}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:r.roas<thresholds.roas&&r.roas>0?C.red:r.roas>=thresholds.roas*1.5?C.green:C.orange}}>{r.roas>0?r.roas.toFixed(1)+"x":"—"}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:r.cpc>thresholds.cpc?C.red:C.mid}}>{r.cpc>0?IDR(r.cpc):"—"}</td>
                <td style={{padding:"7px 8px",color:r.diagColor,fontSize:10}}>{r.diag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MODULE 6: PRODUCT TRACKER ────────────────────────────────────────────────
function ProdTrackModule() {
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const [skus, setSkus] = useLocalState("tracker_skus", Array(6).fill(null).map((_,i)=>({name:`SKU ${i+1}`,data:Array(12).fill("")})));
  const [view, setView] = useLocalState("tracker_view", "revenue");
  const updSku = (i,k,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const updData = (i,j,v) => setSkus(s=>s.map((r,idx)=>idx===i?{...r,data:r.data.map((d,di)=>di===j?v:d)}:r));

  const analyzed = skus.map(sk => {
    const vals = sk.data.map(d=>f(d)||0);
    const first3 = vals.slice(0,3).filter(v=>v>0);
    const last3 = vals.slice(9,12).filter(v=>v>0);
    const avgFirst = first3.length>0?first3.reduce((a,b)=>a+b,0)/first3.length:0;
    const avgLast = last3.length>0?last3.reduce((a,b)=>a+b,0)/last3.length:0;
    const trend = avgFirst>0?(avgLast-avgFirst)/avgFirst:0;
    const status = trend>0.1?"📈 Growing":trend<-0.1?"📉 Declining":"→ Flat";
    const statusColor = trend>0.1?C.green:trend<-0.1?C.red:C.mid;
    const peak = Math.max(...vals); const peakMonth = vals.indexOf(peak);
    return {...sk, vals, trend, status, statusColor, peak, peakMonth, total:vals.reduce((a,b)=>a+b,0)};
  });

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <Btn secondary={view!=="revenue"} onClick={()=>setView("revenue")}>Revenue</Btn>
        <Btn secondary={view!=="units"} onClick={()=>setView("units")}>Units</Btn>
      </div>

      <div style={{overflowX:"auto",marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              <th style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"normal",minWidth:100}}>SKU</th>
              {months.map(m=><th key={m} style={{padding:"7px 8px",textAlign:"right",color:C.dim,fontSize:9,fontWeight:"normal",minWidth:70}}>{m}</th>)}
              <th style={{padding:"7px 8px",textAlign:"right",color:C.dim,fontSize:9,fontWeight:"normal"}}>Trend</th>
              <th style={{padding:"7px 8px",textAlign:"left",color:C.dim,fontSize:9,fontWeight:"normal"}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {analyzed.map((r,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}20`,background:i%2===0?C.s1:C.s2}}>
                <td style={{padding:"5px 6px"}}>
                  <input value={r.name} onChange={e=>updSku(i,"name",e.target.value)} style={{background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:"'DM Mono',monospace",fontSize:11,width:90}}/>
                </td>
                {r.data.map((d,j)=>{
                  const v = f(d)||0;
                  const maxVal = Math.max(...analyzed.map(sk=>Math.max(...sk.vals)));
                  const intensity = maxVal>0?v/maxVal:0;
                  return (
                    <td key={j} style={{padding:"5px 4px",background:v>0?`rgba(200,168,75,${intensity*0.25})`:"transparent",textAlign:"right"}}>
                      <input type="number" value={d} onChange={e=>updData(i,j,e.target.value)} placeholder="0" style={{background:"transparent",border:"none",outline:"none",color:v>0?C.text:C.dim,fontFamily:"'DM Mono',monospace",fontSize:10,width:60,textAlign:"right"}}/>
                    </td>
                  );
                })}
                <td style={{padding:"7px 8px",textAlign:"right",color:r.statusColor}}>{PCT(r.trend*100)}</td>
                <td style={{padding:"7px 8px",color:r.statusColor,fontSize:10}}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Divider label="Performance Summary"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {analyzed.filter(r=>r.total>0).map((r,i)=>(
          <div key={i} style={{background:C.s1,border:`1px solid ${C.border2}`,borderLeft:`3px solid ${r.statusColor}`,borderRadius:2,padding:14}}>
            <div style={{fontSize:13,color:C.text,fontFamily:"'DM Mono',monospace",fontWeight:700,marginBottom:6}}>{r.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace"}}>Total</span>
              <span style={{fontSize:11,color:C.text,fontFamily:"'DM Mono',monospace"}}>{r.total>10000?IDR(r.total):NUM(r.total)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace"}}>Peak</span>
              <span style={{fontSize:11,color:C.gold,fontFamily:"'DM Mono',monospace"}}>{months[r.peakMonth]}: {r.peak>10000?IDR(r.peak):NUM(r.peak)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace"}}>Trend</span>
              <span style={{fontSize:11,color:r.statusColor,fontFamily:"'DM Mono',monospace"}}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 7: UNIT ECONOMICS ─────────────────────────────────────────────────
function UnitEconModule() {
  const [d, setD] = useLocalState("unitecon", {rev:"",cogs:"47",tRev:"",sRev:"",kRev:"",oRev:"",tFee:"8",sFee:"10",kFee:"7",oFee:"30",ads:"",aff:"5",ret:"3",sdm:"",ops:"",rent:"",price:"",ucogs:"",pkg:""});
  const s = k => v => setD(p=>({...p,[k]:v}));
  const [calc, setCalc] = useState(null);

  const run = () => {
    const rev=f(d.rev)||0, cogs=f(d.cogs)/100||0;
    const tRev=f(d.tRev)||0, sRev=f(d.sRev)||0, kRev=f(d.kRev)||0, oRev=f(d.oRev)||0;
    const tFee=f(d.tFee)/100||0, sFee=f(d.sFee)/100||0, kFee=f(d.kFee)/100||0, oFee=f(d.oFee)/100||0;
    const ads=f(d.ads)||0, aff=f(d.aff)/100||0, ret=f(d.ret)/100||0;
    const sdm=f(d.sdm)||0, ops=f(d.ops)||0, rent=f(d.rent)||0;
    const price=f(d.price)||0, ucogs=f(d.ucogs)||0, pkg=f(d.pkg)||0;

    const grossProfit = rev*(1-cogs);
    const tFeeAmt=tRev*tFee, sFeeAmt=sRev*sFee, kFeeAmt=kRev*kFee, oFeeAmt=oRev*oFee;
    const affAmt=rev*aff, retAmt=rev*ret;
    const totalFees = tFeeAmt+sFeeAmt+kFeeAmt+oFeeAmt+affAmt+retAmt;
    const afterFees = grossProfit - ads - totalFees;
    const totalFixed = sdm+ops+rent;
    const npm = afterFees - totalFixed;
    const npmPct = rev>0?(npm/rev)*100:0;
    const blendedFeeRate = rev>0?totalFees/rev:0;
    const roas = ads>0?rev/ads:0;
    const unitFees = price>0?price*blendedFeeRate:0;
    const unitAds = price>0&&rev>0?price*(ads/rev):0;
    const contrib = price - ucogs - pkg - unitFees - unitAds;
    const contribPct = price>0?(contrib/price)*100:0;
    const breakeven = contrib>0&&totalFixed>0?Math.ceil(totalFixed/contrib):0;
    const breakevenRev = breakeven*price;
    const vendorFloat = rev*cogs*(60/30);

    setCalc({grossProfit,totalFees,tFeeAmt,sFeeAmt,kFeeAmt,oFeeAmt,affAmt,retAmt,afterFees,totalFixed,npm,npmPct,blendedFeeRate,roas,contrib,contribPct,breakeven,breakevenRev,vendorFloat,ads,rev,cogs});
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
      <div>
        <Divider label="Revenue & COGS"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Total Revenue Bulanan"><Input value={d.rev} onChange={s("rev")} prefix="Rp" type="number"/></Field>
          <Field label="Blended COGS %" hint="HPP termasuk packaging"><Input value={d.cogs} onChange={s("cogs")} suffix="%" type="number"/></Field>
        </div>
        <Divider label="Channel Revenue"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="TikTok Shop Rev"><Input value={d.tRev} onChange={s("tRev")} prefix="Rp" type="number"/></Field>
          <Field label="Fee TikTok %"><Input value={d.tFee} onChange={s("tFee")} suffix="%" type="number"/></Field>
          <Field label="Shopee Rev"><Input value={d.sRev} onChange={s("sRev")} prefix="Rp" type="number"/></Field>
          <Field label="Fee Shopee %"><Input value={d.sFee} onChange={s("sFee")} suffix="%" type="number"/></Field>
          <Field label="Tokopedia Rev"><Input value={d.kRev} onChange={s("kRev")} prefix="Rp" type="number"/></Field>
          <Field label="Fee Tokopedia %"><Input value={d.kFee} onChange={s("kFee")} suffix="%" type="number"/></Field>
          <Field label="Offline Rev"><Input value={d.oRev} onChange={s("oRev")} prefix="Rp" type="number"/></Field>
          <Field label="Konsinyasi %"><Input value={d.oFee} onChange={s("oFee")} suffix="%" type="number"/></Field>
        </div>
        <Divider label="Variable & Fixed Costs"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Ads Spend"><Input value={d.ads} onChange={s("ads")} prefix="Rp" type="number"/></Field>
          <Field label="Affiliator %"><Input value={d.aff} onChange={s("aff")} suffix="%" type="number"/></Field>
          <Field label="Return Rate %"><Input value={d.ret} onChange={s("ret")} suffix="%" type="number"/></Field>
          <Field label="SDM / Gaji"><Input value={d.sdm} onChange={s("sdm")} prefix="Rp" type="number"/></Field>
          <Field label="Operasional"><Input value={d.ops} onChange={s("ops")} prefix="Rp" type="number"/></Field>
          <Field label="Sewa / Gudang"><Input value={d.rent} onChange={s("rent")} prefix="Rp" type="number"/></Field>
        </div>
        <Divider label="Per Unit"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Field label="Avg Selling Price"><Input value={d.price} onChange={s("price")} prefix="Rp" type="number"/></Field>
          <Field label="COGS / Unit"><Input value={d.ucogs} onChange={s("ucogs")} prefix="Rp" type="number"/></Field>
          <Field label="Packaging / Unit"><Input value={d.pkg} onChange={s("pkg")} prefix="Rp" type="number"/></Field>
        </div>
        <div style={{marginTop:8}}><Btn onClick={run}>Hitung Unit Economics →</Btn></div>
      </div>

      <div>
        {!calc ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:C.dim,fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textAlign:"center"}}>ISI DATA → HITUNG</div>
        ) : (
          <>
            <Divider label="P&L Waterfall"/>
            {[
              {l:"Revenue",v:calc.rev,color:C.text,bold:true},
              {l:`— COGS (${d.cogs}%)`,v:-calc.rev*calc.cogs,color:C.red},
              {l:"= Gross Profit",v:calc.grossProfit,color:C.green,bold:true},
              {l:"— Ads Spend",v:-calc.ads,color:C.orange},
              {l:"— TikTok Fee",v:-calc.tFeeAmt,color:C.red},
              {l:"— Shopee Fee",v:-calc.sFeeAmt,color:C.red},
              {l:"— Tokopedia Fee",v:-calc.kFeeAmt,color:C.red},
              {l:"— Offline Fee",v:-calc.oFeeAmt,color:C.red},
              {l:"— Affiliator",v:-calc.affAmt,color:C.red},
              {l:"— Returns",v:-calc.retAmt,color:C.red},
              {l:"= After Fees",v:calc.afterFees,color:C.text,bold:true},
              {l:"— Fixed Costs",v:-calc.totalFixed,color:C.red},
              {l:"= NET PROFIT",v:calc.npm,color:calc.npmPct<5?C.red:calc.npmPct<10?C.orange:C.green,bold:true},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:row.bold?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:row.bold?11:10,color:C.mid,fontFamily:"'DM Mono',monospace"}}>{row.l}</span>
                <span style={{fontSize:row.bold?14:12,color:row.color,fontFamily:"'Cormorant Garamond',serif",fontWeight:row.bold?700:400}}>{IDR(row.v)}</span>
              </div>
            ))}
            <div style={{padding:"10px 13px",background:calc.npmPct<5?C.redBg:C.greenBg,border:`1px solid ${calc.npmPct<5?C.red:C.green}40`,borderRadius:2,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace"}}>NPM</span>
              <span style={{fontSize:22,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:calc.npmPct<5?C.red:calc.npmPct<10?C.orange:C.green}}>{PCT(calc.npmPct)}</span>
            </div>

            <Divider label="Key Metrics"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <Stat label="ROAS" value={calc.roas.toFixed(1)+"x"} color={calc.roas<3?C.red:calc.roas<5?C.orange:C.green}/>
              <Stat label="Blended Fee Rate" value={PCT(calc.blendedFeeRate*100)}/>
              <Stat label="Contribution/Unit" value={IDR(calc.contrib)} color={calc.contrib<0?C.red:C.green} sub={PCT(calc.contribPct)+" per unit"}/>
              <Stat label="Break-even Units" value={NUM(calc.breakeven)} sub={IDR(calc.breakevenRev)} hi/>
            </div>
            <Stat label="Vendor Float (Net 60)" value={IDR(calc.vendorFloat)} sub="Working capital dari hutang vendor"/>

            {calc.npmPct<5 && <div style={{marginTop:12}}><Alert type="bad" label="NPM Warning" note="NPM di bawah 5% — margin terlalu tipis. Review ads efficiency dan struktur COGS sebelum scale."/></div>}
            {calc.roas<3 && calc.ads>0 && <Alert type="warn" label="ROAS Rendah" note="Ads spend tidak efisien. Audit creative performance sebelum scale budget."/>}
            {calc.contrib<0 && <Alert type="bad" label="Negative Contribution" note="Per unit contribution negatif — setiap penjualan rugi. Review COGS atau harga jual segera."/>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── MODULE 8: DASHBOARD ──────────────────────────────────────────────────────
function DashboardModule() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:300,flexDirection:"column",gap:16}}>
      <div style={{fontSize:32,opacity:0.3}}>◎</div>
      <div style={{fontSize:12,color:C.dim,fontFamily:"'DM Mono',monospace",textAlign:"center",lineHeight:1.8}}>
        Dashboard otomatis tersedia di versi Excel.<br/>
        Isi semua modul di atas, lalu buka file .xlsx<br/>
        untuk melihat Summary Dashboard yang auto-pull<br/>dari semua sheet.
      </div>
    </div>
  );
}

// ─── PLAN MODULE ─────────────────────────────────────────────────────────────
function PlanModule() {
  const [d, setD] = useLocalState("plan_main", {vision:"",mission:"",goal12:"",goal3yr:"",targetMarket:"",marketSize:"",competitors:"",differentiator:"",positioning:""});
  const [milestones, setMilestones] = useLocalState("plan_milestones", Array(6).fill(null).map((_,i)=>({month:`Bulan ${i+1}`,revenue:"",initiative:"",kpi:""})));
  const [risks, setRisks] = useLocalState("plan_risks", Array(3).fill(null).map((_,i)=>({risk:"",prob:"",impact:"",mitigation:""})));
  const s = k => v => setD(p=>({...p,[k]:v}));
  const updM = (i,k,v) => setMilestones(m=>m.map((r,idx)=>idx===i?{...r,[k]:v}:r));
  const updR = (i,k,v) => setRisks(r=>r.map((rr,idx)=>idx===i?{...rr,[k]:v}:rr));

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
      <div>
        <Divider label="Vision & Mission"/>
        <Field label="Vision" hint="5–10 tahun ke depan"><Input value={d.vision} onChange={s("vision")} multiline rows={2} placeholder="Menjadi brand menswear urban terdepan..."/></Field>
        <Field label="Mission"><Input value={d.mission} onChange={s("mission")} multiline rows={2} placeholder="Merancang produk yang menemani urban man..."/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Target 12 Bulan"><Input value={d.goal12} onChange={s("goal12")} placeholder="Rp 2M/bulan, 3 channel"/></Field>
          <Field label="Target 3 Tahun"><Input value={d.goal3yr} onChange={s("goal3yr")} placeholder="Series A, ekspansi SEA"/></Field>
        </div>
        <Divider label="Market & Positioning"/>
        <Field label="Target Market" hint="Demografis + psikografis"><Input value={d.targetMarket} onChange={s("targetMarket")} multiline rows={2} placeholder="Pria urban 25-38 tahun..."/></Field>
        <Field label="Market Size"><Input value={d.marketSize} onChange={s("marketSize")} placeholder="Rp 15T (menswear premium Indonesia)"/></Field>
        <Field label="Kompetitor Utama"><Input value={d.competitors} onChange={s("competitors")} placeholder="About Blank, DILI, ..."/></Field>
        <Field label="Differentiator"><Input value={d.differentiator} onChange={s("differentiator")} multiline rows={2} placeholder="Premium offline presence + digital play..."/></Field>
        <Field label="Positioning Statement"><Input value={d.positioning} onChange={s("positioning")} multiline rows={2} placeholder="Untuk urban professional yang..."/></Field>
      </div>
      <div>
        <Divider label="6-Month Milestones"/>
        {milestones.map((m,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div style={{fontSize:10,color:C.gold,fontFamily:"'DM Mono',monospace",paddingTop:28}}>{m.month}</div>
            <Field label="Revenue Target"><Input value={m.revenue} onChange={v=>updM(i,"revenue",v)} prefix="Rp" type="number" small/></Field>
            <Field label="Inisiatif"><Input value={m.initiative} onChange={v=>updM(i,"initiative",v)} small/></Field>
            <Field label="KPI"><Input value={m.kpi} onChange={v=>updM(i,"kpi",v)} small/></Field>
          </div>
        ))}
        <Divider label="Risk & Mitigation"/>
        {risks.map((r,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 1fr",gap:8,marginBottom:8}}>
            <Field label={`Risk ${i+1}`}><Input value={r.risk} onChange={v=>updR(i,"risk",v)} small/></Field>
            <Field label="Prob"><Input value={r.prob} onChange={v=>updR(i,"prob",v)} small/></Field>
            <Field label="Impact"><Input value={r.impact} onChange={v=>updR(i,"impact",v)} small/></Field>
            <Field label="Mitigasi"><Input value={r.mitigation} onChange={v=>updR(i,"mitigation",v)} small/></Field>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  {id:"canvas",    label:"Canvas",     num:"01"},
  {id:"plan",      label:"Plan",       num:"02"},
  {id:"forecast",  label:"Forecast",   num:"03"},
  {id:"size",      label:"Size Break", num:"04"},
  {id:"bcg",       label:"BCG Matrix", num:"05"},
  {id:"adperf",    label:"Ad Perf",    num:"06"},
  {id:"tracker",   label:"Tracker",    num:"07"},
  {id:"economics", label:"Unit Econ",  num:"08"},
  {id:"dashboard", label:"Dashboard",  num:"09"},
];

export default function App() {
  const [tab, setTab] = useState("canvas");
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,textarea,select{color-scheme:dark;}
        input::placeholder,textarea::placeholder{color:#2e2c28;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.border2};}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
      `}</style>

      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.s1,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14}}>
          <span style={{fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.goldDim,fontFamily:"'DM Mono',monospace"}}>Bill & Board</span>
          <span style={{fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:C.text}}>Brand OS</span>
          <span style={{fontSize:9,letterSpacing:"0.14em",color:C.dim,fontFamily:"'DM Mono',monospace"}}>v2.0</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>{if(window.confirm("Reset semua data? Tidak bisa di-undo.")){Object.keys(localStorage).filter(k=>k.startsWith("brandos_")).forEach(k=>localStorage.removeItem(k));window.location.reload();}}} style={{background:"transparent",border:`1px solid ${C.border2}`,color:C.dim,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.12em",padding:"4px 10px",cursor:"pointer",borderRadius:2}}>RESET DATA</button>
          <div style={{display:"flex",gap:4}}>
            {TABS.map(t=>(
              <div key={t.id} style={{width:5,height:5,borderRadius:"50%",background:tab===t.id?C.gold:C.border2}}/>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.s1,padding:"0 32px",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 16px",background:"none",border:"none",cursor:"pointer",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",color:tab===t.id?C.gold:C.dim,borderBottom:tab===t.id?`1px solid ${C.gold}`:"1px solid transparent",marginBottom:-1,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:7}}>
            <span style={{color:tab===t.id?C.goldDim:C.dim,fontSize:9}}>{t.num}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content — keep all mounted, hide inactive tabs */}
      <div style={{padding:"28px 32px",maxWidth:1400,margin:"0 auto"}}>
        <div style={{display:tab==="canvas"?"block":"none"}}><CanvasModule/></div>
        <div style={{display:tab==="plan"?"block":"none"}}><PlanModule/></div>
        <div style={{display:tab==="forecast"?"block":"none"}}><ForecastModule/></div>
        <div style={{display:tab==="size"?"block":"none"}}><SizeModule/></div>
        <div style={{display:tab==="bcg"?"block":"none"}}><BCGModule/></div>
        <div style={{display:tab==="adperf"?"block":"none"}}><AdPerfModule/></div>
        <div style={{display:tab==="tracker"?"block":"none"}}><ProdTrackModule/></div>
        <div style={{display:tab==="economics"?"block":"none"}}><UnitEconModule/></div>
        <div style={{display:tab==="dashboard"?"block":"none"}}><DashboardModule/></div>
      </div>
    </div>
  );
}
