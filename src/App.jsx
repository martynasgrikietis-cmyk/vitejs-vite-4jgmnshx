import { useState, useRef } from "react";

const DEFAULT_EXERCISES = [
  { id: 1,  name: "Gulimas sūpavimas (štanga)",    muscle: "Krūtinė",   equipment: "Štanga",       img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",  sets:"3-4", reps:"8-12",   desc:"" },
  { id: 2,  name: "Gulimas sūpavimas (hanteliai)", muscle: "Krūtinė",   equipment: "Hanteliai",    img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",  sets:"3-4", reps:"10-12",  desc:"" },
  { id: 3,  name: "Atsispaudimai nuo grindų",      muscle: "Krūtinė",   equipment: "Kūno svoris",  img: "https://images.unsplash.com/photo-1598971639058-fab3c3109a78?w=400&q=80",  sets:"3",   reps:"15-20",  desc:"" },
  { id: 4,  name: "Kabelių skrydis",               muscle: "Krūtinė",   equipment: "Treniruoklis", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",  sets:"3",   reps:"12-15",  desc:"" },
  { id: 5,  name: "Atsitempimai prie strypo",      muscle: "Nugara",    equipment: "Strypas",      img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80",  sets:"3-4", reps:"6-10",   desc:"" },
  { id: 6,  name: "Hantelių eilė",                 muscle: "Nugara",    equipment: "Hanteliai",    img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",  sets:"3",   reps:"10-12",  desc:"" },
  { id: 7,  name: "Lat pulldown",                  muscle: "Nugara",    equipment: "Treniruoklis", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",  sets:"3-4", reps:"10-12",  desc:"" },
  { id: 8,  name: "Štangos eilė palenkus",         muscle: "Nugara",    equipment: "Štanga",       img: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80",  sets:"3",   reps:"8-10",   desc:"" },
  { id: 9,  name: "Pritūpimai (štanga)",           muscle: "Kojos",     equipment: "Štanga",       img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",  sets:"4",   reps:"8-12",   desc:"" },
  { id: 10, name: "Leg press",                     muscle: "Kojos",     equipment: "Treniruoklis", img: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80",  sets:"3-4", reps:"12-15",  desc:"" },
  { id: 11, name: "Rumuniškas deadliftas",         muscle: "Kojos",     equipment: "Štanga",       img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",  sets:"3",   reps:"10-12",  desc:"" },
  { id: 12, name: "Blauzdų kėlimas",               muscle: "Kojos",     equipment: "Treniruoklis", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",  sets:"4",   reps:"15-20",  desc:"" },
  { id: 13, name: "Pečių spaudimas (štanga)",      muscle: "Pečiai",    equipment: "Štanga",       img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",  sets:"3-4", reps:"8-12",   desc:"" },
  { id: 14, name: "Šoninis kėlimas",               muscle: "Pečiai",    equipment: "Hanteliai",    img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",  sets:"3",   reps:"12-15",  desc:"" },
  { id: 15, name: "Priekinis kėlimas",             muscle: "Pečiai",    equipment: "Hanteliai",    img: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80",  sets:"3",   reps:"12-15",  desc:"" },
  { id: 16, name: "Bicepso lenkimas (štanga)",     muscle: "Bicepsas",  equipment: "Štanga",       img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&q=80",  sets:"3",   reps:"10-12",  desc:"" },
  { id: 17, name: "Hantelių lenkimas",             muscle: "Bicepsas",  equipment: "Hanteliai",    img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80",  sets:"3",   reps:"12-15",  desc:"" },
  { id: 18, name: "Tricepso spaudimas virvute",    muscle: "Tricepsas", equipment: "Treniruoklis", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",  sets:"3",   reps:"12-15",  desc:"" },
  { id: 19, name: "French press",                  muscle: "Tricepsas", equipment: "Štanga",       img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",  sets:"3",   reps:"10-12",  desc:"" },
  { id: 20, name: "Sukimasis (crunch)",            muscle: "Pilvas",    equipment: "Kūno svoris",  img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",  sets:"3",   reps:"20-25",  desc:"" },
  { id: 21, name: "Plank",                         muscle: "Pilvas",    equipment: "Kūno svoris",  img: "https://images.unsplash.com/photo-1598971639058-fab3c3109a78?w=400&q=80",  sets:"3",   reps:"30-60s", desc:"" },
  { id: 22, name: "Kojų kėlimas",                  muscle: "Pilvas",    equipment: "Kūno svoris",  img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",  sets:"3",   reps:"15-20",  desc:"" },
];

const ALL_MUSCLES  = ["Krūtinė","Nugara","Kojos","Pečiai","Bicepsas","Tricepsas","Pilvas"];
const GOALS        = ["Raumenų auginimas","Riebalų deginimas","Jėgos ugdymas","Ištvermė","Reabilitacija","Sveikata"];
const LEVELS       = ["Pradedantysis","Vidutinis","Pažengęs"];
const DAYS         = ["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis","Sekmadienis"];
const REST_OPTIONS = ["30 sek","45 sek","60 sek","90 sek","2 min","3 min","4 min","5 min"];
const ACTIVITY_LEVELS = [
  { label:"Sėdimas darbas (mažai judėjimo)",      factor:1.2  },
  { label:"Lengvas aktyvumas (1–3 dienos/sav.)",  factor:1.375},
  { label:"Vidutinis aktyvumas (3–5 dienos/sav.)",factor:1.55 },
  { label:"Didelis aktyvumas (6–7 dienos/sav.)",  factor:1.725},
  { label:"Profesionalus sportininkas",            factor:1.9  },
];
const emptyForm = { name:"", muscle:"Krūtinė", equipment:"", sets:"3", reps:"10-12", desc:"", img:"" };

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:"#0f1117", surface:"#171c27", border:"#252d3d",
  gold:"#c9a84c", goldSoft:"#c9a84c22", goldBorder:"#c9a84c44",
  teal:"#4ea8a0", tealSoft:"#4ea8a022", tealBorder:"#4ea8a044",
  red:"#c0474a",  redSoft:"#c0474a18",  redBorder:"#c0474a44",
  purple:"#a78bfa", purpleSoft:"#a78bfa18", purpleBorder:"#a78bfa44",
  green:"#4ade80", greenSoft:"#4ade8018",
  text:"#e4e8f0", muted:"#6b7a99", faint:"#1e2535",
};
const FONT = "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif";

// ── BMI + Nutrition calculator ────────────────────────────
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  return (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2));
}
function bmiCategory(bmi) {
  if (bmi < 18.5) return { label:"Nepakankamas svoris", color:"#60a5fa" };
  if (bmi < 25)   return { label:"Normalus svoris",     color:"#4ade80" };
  if (bmi < 30)   return { label:"Antsvoris",           color:"#fbbf24" };
  return               { label:"Nutukimas",              color:"#f87171" };
}
function calcNutrition(weight, height, age, gender, activityFactor) {
  const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age) || 25;
  if (!w || !h) return null;
  // Mifflin-St Jeor BMR
  const bmr = gender === "Moteris"
    ? 10*w + 6.25*h - 5*a - 161
    : 10*w + 6.25*h - 5*a + 5;
  const tdee      = Math.round(bmr * activityFactor);
  const loseKcal  = Math.round(tdee - 500);   // ~0.5kg/week deficit
  const gainKcal  = Math.round(tdee + 300);   // lean bulk surplus
  // Protein: 1.8g/kg for active people
  const protein     = Math.round(w * 1.8);
  const proteinLose = Math.round(w * 2.0);    // higher protein on cut
  const proteinGain = Math.round(w * 1.8);
  return { tdee, loseKcal, gainKcal, protein, proteinLose, proteinGain };
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing:border-box; }
  body { margin:0; background:${C.bg}; font-family:${FONT}; }

  @media print {
    body { margin:0; background:white !important; font-family:${FONT} !important; }
    .no-print   { display:none !important; }
    .print-only { display:block !important; }
    .print-page { background:white !important; color:#111 !important; font-family:${FONT} !important; }
    .ph      { background:#0f1117 !important; padding:22px 32px !important; display:flex !important; align-items:center !important; gap:14px !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .ph-logo { width:44px !important; height:44px !important; background:${C.gold} !important; border-radius:10px !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:22px !important; font-weight:800 !important; color:#0f1117 !important; flex-shrink:0 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .ph-name { font-size:20px !important; font-weight:800 !important; color:${C.gold} !important; }
    .ph-sub  { font-size:10px !important; color:#aaa !important; letter-spacing:3px !important; text-transform:uppercase !important; }
    .ph-date { margin-left:auto !important; color:#aaa !important; font-size:12px !important; }
    .pcc      { border:1.5px solid #dde !important; border-radius:10px !important; padding:20px 24px !important; margin:22px 32px !important; background:#f8f9fc !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .pcc-title{ font-size:18px !important; font-weight:700 !important; color:#111 !important; margin-bottom:3px !important; }
    .pcc-name { font-size:13px !important; color:#555 !important; margin-bottom:12px !important; }
    .pcc-stats{ display:flex !important; flex-wrap:wrap !important; gap:18px !important; font-size:13px !important; color:#444 !important; }
    .pcc-notes{ margin-top:10px !important; font-size:12px !important; color:#666 !important; font-style:italic !important; }
    .pnut     { border:1.5px solid #dde !important; border-radius:10px !important; padding:16px 24px !important; margin:0 32px 22px 32px !important; background:#f8f9fc !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .pnut-title{ font-size:14px !important; font-weight:700 !important; color:#111 !important; margin-bottom:12px !important; }
    .pnut-grid{ display:flex !important; gap:10px !important; flex-wrap:wrap !important; }
    .pnut-box { background:white !important; border:1px solid #dde !important; border-radius:8px !important; padding:10px 14px !important; min-width:110px !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .pnut-lbl { font-size:10px !important; color:#888 !important; text-transform:uppercase !important; letter-spacing:1px !important; margin-bottom:4px !important; }
    .pnut-val { font-size:16px !important; font-weight:800 !important; color:#111 !important; }
    .pnut-unit{ font-size:11px !important; color:#888 !important; margin-left:2px !important; }
    .pdb      { margin:0 32px 22px 32px !important; border:1px solid #dde !important; border-radius:10px !important; overflow:hidden !important; page-break-inside:avoid !important; }
    .pdb-hdr  { background:#0f1117 !important; color:white !important; padding:11px 20px !important; font-weight:700 !important; font-size:13px !important; letter-spacing:2px !important; text-transform:uppercase !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .pex      { display:flex !important; gap:16px !important; padding:14px 20px !important; border-bottom:1px solid #eee !important; align-items:flex-start !important; page-break-inside:avoid !important; }
    .pex-num  { width:28px !important; height:28px !important; background:#f0f0f4 !important; border-radius:50% !important; display:flex !important; align-items:center !important; justify-content:center !important; font-weight:700 !important; font-size:12px !important; color:#444 !important; flex-shrink:0 !important; align-self:center !important; }
    .pex-img  { width:130px !important; height:100px !important; object-fit:cover !important; border-radius:8px !important; flex-shrink:0 !important; }
    .pex-ph   { width:130px !important; height:100px !important; background:#eee !important; border-radius:8px !important; flex-shrink:0 !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:28px !important; }
    .pex-info { flex:1 !important; }
    .pex-name { font-size:15px !important; font-weight:700 !important; color:#111 !important; margin-bottom:3px !important; }
    .pex-muscle{ font-size:12px !important; color:#4ea8a0 !important; font-weight:600 !important; margin-bottom:8px !important; }
    .pex-stats{ display:flex !important; gap:10px !important; flex-wrap:wrap !important; }
    .pex-sbox { background:#f3f4f8 !important; border-radius:6px !important; padding:5px 10px !important; display:flex !important; flex-direction:column !important; align-items:center !important; min-width:58px !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .pex-slbl { font-size:9px !important; color:#888 !important; text-transform:uppercase !important; letter-spacing:1px !important; }
    .pex-sval { font-size:13px !important; font-weight:700 !important; color:#111 !important; }
    .pex-desc { font-size:12px !important; color:#666 !important; margin-top:8px !important; font-style:italic !important; }
    .pfooter  { text-align:center !important; padding:18px !important; color:#bbb !important; font-size:11px !important; border-top:1px solid #eee !important; margin:16px 32px 0 32px !important; }
  }
  @media screen { .print-only { display:none !important; } }
`;

const css = {
  page:     { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:FONT },
  header:   { background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"14px 28px", display:"flex", alignItems:"center", gap:14 },
  logo:     { width:38, height:38, background:C.gold, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, color:C.bg, flexShrink:0 },
  card:     { background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:22 },
  label:    { fontSize:11, color:C.muted, letterSpacing:"0.08em", marginBottom:6, display:"block", fontWeight:600, textTransform:"uppercase" },
  input:    { width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 13px", color:C.text, fontFamily:FONT, fontSize:13, outline:"none", boxSizing:"border-box" },
  select:   { width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 13px", color:C.text, fontFamily:FONT, fontSize:13, outline:"none", boxSizing:"border-box" },
  navBtn:   (a)=>({ padding:"8px 18px", borderRadius:7, border:a?`1px solid ${C.gold}`:`1px solid ${C.border}`, background:a?C.gold:"transparent", color:a?C.bg:C.muted, fontFamily:FONT, fontWeight:600, fontSize:12, cursor:"pointer", letterSpacing:"0.06em" }),
  btnG:     { padding:"10px 24px", background:C.gold, color:C.bg, border:"none", borderRadius:8, fontFamily:FONT, fontWeight:700, fontSize:13, cursor:"pointer" },
  btnGhost: { padding:"9px 18px", background:"transparent", color:C.muted, border:`1px solid ${C.border}`, borderRadius:8, fontFamily:FONT, fontWeight:600, fontSize:12, cursor:"pointer" },
  btnTeal:  { padding:"7px 13px", background:C.tealSoft, color:C.teal, border:`1px solid ${C.tealBorder}`, borderRadius:6, fontFamily:FONT, fontSize:12, cursor:"pointer", fontWeight:600 },
  btnRed:   { padding:"7px 13px", background:C.redSoft,  color:C.red,  border:`1px solid ${C.redBorder}`,  borderRadius:6, fontFamily:FONT, fontSize:12, cursor:"pointer", fontWeight:600 },
  btnPrint: { padding:"10px 24px", background:C.teal, color:"#fff", border:"none", borderRadius:8, fontFamily:FONT, fontWeight:700, fontSize:13, cursor:"pointer" },
  secTitle: { fontSize:10, color:C.teal, letterSpacing:"0.18em", marginBottom:16, display:"block", fontWeight:700, textTransform:"uppercase" },
  overlay:  { position:"fixed", inset:0, background:"#00000088", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16, backdropFilter:"blur(4px)" },
  modalBox: (w)=>({ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, width:"100%", maxWidth:w||520, maxHeight:"92vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 60px #00000055" }),
};

function StatPill({ icon, label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, background:C.faint, borderRadius:6, padding:"3px 8px" }}>
      <span style={{ fontSize:11 }}>{icon}</span>
      <span style={{ fontSize:11, color:C.muted }}>{label}:</span>
      <span style={{ fontSize:12, fontWeight:700, color:color||C.text }}>{value}</span>
    </div>
  );
}

function ImgBox({ src }) {
  if (src) return <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />;
  return <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#333", fontSize:24 }}>📷</div>;
}

// ── Nutrition result card ─────────────────────────────────
function NutritionCard({ nut, bmiVal }) {
  if (!nut && !bmiVal) return null;
  const bmiNum  = bmiVal ? parseFloat(bmiVal.toFixed(1)) : null;
  const bmiCat  = bmiNum ? bmiCategory(bmiNum) : null;

  const Box = ({ label, value, unit, color, sub }) => (
    <div style={{ background:C.faint, borderRadius:10, padding:"14px 16px", flex:1, minWidth:110 }}>
      <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color:color||C.text }}>{value}<span style={{ fontSize:13, fontWeight:400, color:C.muted, marginLeft:3 }}>{unit}</span></div>
      {sub && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ ...css.card, marginTop:18 }}>
      <span style={css.secTitle}>📊 KMI ir mitybos skaičiuoklė</span>

      {/* BMI row */}
      {bmiNum && (
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, background:C.faint, borderRadius:10, padding:"14px 18px" }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, marginBottom:4 }}>Kūno masės indeksas (KMI)</div>
            <div style={{ fontSize:32, fontWeight:800, color:bmiCat.color }}>{bmiNum.toFixed(1)}</div>
          </div>
          <div style={{ background:bmiCat.color+"22", border:`1px solid ${bmiCat.color}55`, borderRadius:8, padding:"6px 14px", color:bmiCat.color, fontWeight:700, fontSize:13 }}>{bmiCat.label}</div>
          <div style={{ marginLeft:"auto", fontSize:11, color:C.muted, lineHeight:1.7, textAlign:"right" }}>
            <div>{"< 18.5 — Nepakankamas"}</div>
            <div>18.5–24.9 — Normalus</div>
            <div>25–29.9 — Antsvoris</div>
            <div>{"≥ 30 — Nutukimas"}</div>
          </div>
        </div>
      )}

      {/* Nutrition rows */}
      {nut && (
        <>
          {/* TDEE */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Palaikymo kalorijos (TDEE)</div>
            <div style={{ background:C.faint, borderRadius:10, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:28, fontWeight:800, color:C.gold }}>{nut.tdee}<span style={{ fontSize:13, fontWeight:400, color:C.muted, marginLeft:3 }}>kcal/d.</span></div>
              <div style={{ fontSize:12, color:C.muted }}>Tai yra kalorijų kiekis, reikalingas svorį išlaikyti.</div>
            </div>
          </div>

          {/* Lose / Gain side by side */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            {/* Lose */}
            <div style={{ background:"#c0474a10", border:`1px solid ${C.redBorder}`, borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:12, color:C.red, fontWeight:700, marginBottom:10 }}>🔻 SVORIO METIMAS</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:90 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Kalorijos</div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.red }}>{nut.loseKcal}<span style={{ fontSize:11, color:C.muted, marginLeft:2 }}>kcal</span></div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>~500 kcal deficitas/d.</div>
                </div>
                <div style={{ flex:1, minWidth:90 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Baltymai</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#f87171" }}>{nut.proteinLose}<span style={{ fontSize:11, color:C.muted, marginLeft:2 }}>g</span></div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>2.0 g × kg kūno svorio</div>
                </div>
              </div>
            </div>

            {/* Gain */}
            <div style={{ background:"#4ade8010", border:`1px solid #4ade8044`, borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:12, color:C.green, fontWeight:700, marginBottom:10 }}>🔺 RAUMENŲ AUGINIMAS</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:90 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Kalorijos</div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.green }}>{nut.gainKcal}<span style={{ fontSize:11, color:C.muted, marginLeft:2 }}>kcal</span></div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>+300 kcal perteklius/d.</div>
                </div>
                <div style={{ flex:1, minWidth:90 }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Baltymai</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#4ade80" }}>{nut.proteinGain}<span style={{ fontSize:11, color:C.muted, marginLeft:2 }}>g</span></div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>1.8 g × kg kūno svorio</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>
            * Skaičiavimai paremti Mifflin-St Jeor formule. Tai orientacinės rekomendacijos — individualūs poreikiai gali skirtis.
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab]     = useState("programa");
  const [step, setStep]   = useState(1);
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [client, setClient] = useState({
    name:"", age:"", weight:"", height:"", gender:"Vyras",
    goal:"", level:"", notes:"", trainingDays:[],
    activityIndex:2,   // default: moderate
  });
  const [program, setProgram]   = useState({});
  const [programName, setProgramName] = useState("");
  const [saved, setSaved]       = useState(false);

  const [pickDay, setPickDay]   = useState(null);
  const [pickSearch, setPickSearch] = useState("");
  const [pickMuscle, setPickMuscle] = useState("Visos");
  const [pickedEx, setPickedEx] = useState(null);
  const [pickSets, setPickSets] = useState("");
  const [pickReps, setPickReps] = useState("");
  const [pickWeight, setPickWeight] = useState("");
  const [pickRest, setPickRest]   = useState("");

  const [dbSearch, setDbSearch] = useState("");
  const [dbMuscle, setDbMuscle] = useState("Visos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]   = useState(emptyForm);
  const [confirmDel, setConfirmDel] = useState(null);
  const imgRef = useRef();

  const dbList = exercises.filter(e=>
    (dbMuscle==="Visos"||e.muscle===dbMuscle)&&
    (e.name.toLowerCase().includes(dbSearch.toLowerCase())||e.equipment.toLowerCase().includes(dbSearch.toLowerCase()))
  );

  const openNew  = ()    => { setEditingId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (ex)  => { setEditingId(ex.id); setForm({ name:ex.name,muscle:ex.muscle,equipment:ex.equipment,sets:ex.sets,reps:ex.reps,desc:ex.desc||"",img:ex.img||"" }); setFormOpen(true); };
  const handleImgFile = (e) => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setForm(p=>({...p,img:ev.target.result})); r.readAsDataURL(f); };
  const saveForm = () => { if(!form.name.trim()) return; if(editingId!==null) setExercises(p=>p.map(e=>e.id===editingId?{...e,...form}:e)); else setExercises(p=>[...p,{id:Date.now(),...form}]); setFormOpen(false); };
  const doDelete  = (id) => { setExercises(p=>p.filter(e=>e.id!==id)); setConfirmDel(null); };
  const toggleDay = (d)  => setClient(p=>({...p,trainingDays:p.trainingDays.includes(d)?p.trainingDays.filter(x=>x!==d):[...p.trainingDays,d]}));
  const openPick  = (day)=> { setPickDay(day); setPickedEx(null); setPickSets(""); setPickReps(""); setPickWeight(""); setPickRest(""); setPickSearch(""); setPickMuscle("Visos"); };
  const pickList = exercises.filter(e=>(pickMuscle==="Visos"||e.muscle===pickMuscle)&&(e.name.toLowerCase().includes(pickSearch.toLowerCase())||e.muscle.toLowerCase().includes(pickSearch.toLowerCase())));
  const addToDay = () => { if(!pickedEx) return; setProgram(p=>({...p,[pickDay]:[...(p[pickDay]||[]),{...pickedEx,customSets:pickSets||pickedEx.sets,customReps:pickReps||pickedEx.reps,customWeight:pickWeight||"",customRest:pickRest||""}]})); setPickDay(null); };
  const removeFromDay = (day,idx) => setProgram(p=>({...p,[day]:p[day].filter((_,i)=>i!==idx)}));
  const trainingDays = DAYS.filter(d=>client.trainingDays.includes(d));

  // Nutrition calculations
  const bmiVal = calcBMI(client.weight, client.height);
  const bmiNum = bmiVal ? parseFloat(bmiVal.toFixed(1)) : null;
  const actFactor = ACTIVITY_LEVELS[client.activityIndex]?.factor || 1.55;
  const nut = calcNutrition(client.weight, client.height, client.age, client.gender, actFactor);

  const Tag   = ({ c, label, active, onClick }) => (
    <button onClick={onClick} style={{ padding:"5px 13px", borderRadius:20, border:active?`1px solid ${c}`:`1px solid ${C.border}`, background:active?c+"22":"transparent", color:active?c:C.muted, fontFamily:FONT, fontSize:11, cursor:"pointer", fontWeight:600 }}>{label}</button>
  );
  const Badge = ({ label, color }) => (
    <span style={{ background:color+"18", border:`1px solid ${color}44`, borderRadius:20, padding:"3px 12px", color, fontSize:12, fontWeight:600 }}>{label}</span>
  );

  return (
    <div style={css.page}>
      <style>{globalStyles}</style>

      {/* ═══════════ PRINT-ONLY LAYOUT ═══════════ */}
      <div className="print-only print-page">
        <div className="ph">
          <div className="ph-logo">M</div>
          <div style={{ marginLeft:10 }}>
            <div className="ph-name">Coach Martynas</div>
            <div className="ph-sub">Sporto programa</div>
          </div>
          <div className="ph-date">{new Date().toLocaleDateString("lt-LT")}</div>
        </div>

        <div className="pcc">
          <div className="pcc-title">{programName||"Sporto programa"}</div>
          <div className="pcc-name">{client.name||"Klientas"}</div>
          <div className="pcc-stats">
            {client.age    &&<span>Amžius: <b>{client.age} m.</b></span>}
            {client.weight &&<span>Svoris: <b>{client.weight} kg</b></span>}
            {client.height &&<span>Ūgis: <b>{client.height} cm</b></span>}
            {bmiNum        &&<span>KMI: <b style={{color:"#4ea8a0"}}>{bmiNum}</b></span>}
            {client.goal   &&<span>Tikslas: <b>{client.goal}</b></span>}
            {client.level  &&<span>Lygis: <b>{client.level}</b></span>}
          </div>
          {client.notes &&<div className="pcc-notes">📝 {client.notes}</div>}
        </div>

        {/* Nutrition summary in print */}
        {nut && (
          <div className="pnut">
            <div className="pnut-title">📊 Mitybos rekomendacijos</div>
            <div className="pnut-grid">
              <div className="pnut-box"><div className="pnut-lbl">TDEE</div><div className="pnut-val">{nut.tdee}<span className="pnut-unit">kcal</span></div></div>
              <div className="pnut-box"><div className="pnut-lbl">Svorio metimas</div><div className="pnut-val" style={{color:"#c0474a"}}>{nut.loseKcal}<span className="pnut-unit">kcal</span></div></div>
              <div className="pnut-box"><div className="pnut-lbl">Baltymai (metimas)</div><div className="pnut-val" style={{color:"#c0474a"}}>{nut.proteinLose}<span className="pnut-unit">g</span></div></div>
              <div className="pnut-box"><div className="pnut-lbl">Raumenų auginimas</div><div className="pnut-val" style={{color:"#16a34a"}}>{nut.gainKcal}<span className="pnut-unit">kcal</span></div></div>
              <div className="pnut-box"><div className="pnut-lbl">Baltymai (auginimas)</div><div className="pnut-val" style={{color:"#16a34a"}}>{nut.proteinGain}<span className="pnut-unit">g</span></div></div>
            </div>
          </div>
        )}

        {trainingDays.map(day=>(
          <div key={day} className="pdb">
            <div className="pdb-hdr">{day} — {(program[day]||[]).length} pratimas(-ai)</div>
            {(program[day]||[]).length===0
              ?<div style={{padding:16,color:"#aaa",fontSize:13}}>Pratimų nėra</div>
              :(program[day]||[]).map((ex,idx)=>(
                <div key={idx} className="pex">
                  <div className="pex-num">{idx+1}</div>
                  {ex.img?<img src={ex.img} alt={ex.name} className="pex-img"/>:<div className="pex-ph">📷</div>}
                  <div className="pex-info">
                    <div className="pex-name">{ex.name}</div>
                    <div className="pex-muscle">{ex.muscle} · {ex.equipment}</div>
                    <div className="pex-stats">
                      <div className="pex-sbox"><span className="pex-slbl">Serijos</span><span className="pex-sval">{ex.customSets}</span></div>
                      <div className="pex-sbox"><span className="pex-slbl">Kartojimai</span><span className="pex-sval">{ex.customReps}</span></div>
                      {ex.customWeight&&<div className="pex-sbox"><span className="pex-slbl">Svoris</span><span className="pex-sval">{ex.customWeight}</span></div>}
                      {ex.customRest  &&<div className="pex-sbox"><span className="pex-slbl">Poilsis</span><span className="pex-sval">{ex.customRest}</span></div>}
                    </div>
                    {ex.desc&&<div className="pex-desc">{ex.desc}</div>}
                  </div>
                </div>
              ))
            }
          </div>
        ))}
        <div className="pfooter">© Coach Martynas · {new Date().toLocaleDateString("lt-LT")}</div>
      </div>

      {/* ═══════════ SCREEN LAYOUT ═══════════ */}
      <div className="no-print">
        <div style={css.header}>
          <div style={css.logo}>M</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:C.gold }}>Coach Martynas</div>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.2em", textTransform:"uppercase", marginTop:1 }}>Sporto programų kūrėjas</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            <button style={css.navBtn(tab==="programa")} onClick={()=>setTab("programa")}>📋 Programa</button>
            <button style={css.navBtn(tab==="db")}       onClick={()=>setTab("db")}>🏋️ Pratimų bazė</button>
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 20px" }}>

          {/* ══ DB TAB ══ */}
          {tab==="db"&&(
            <div>
              <div style={{ display:"flex", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.text }}>Pratimų duomenų bazė</div>
                  <div style={{ color:C.muted, fontSize:13, marginTop:3 }}>{exercises.length} pratimų</div>
                </div>
                <button onClick={openNew} style={{...css.btnG, marginLeft:"auto"}}>+ Naujas pratimas</button>
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
                <input value={dbSearch} onChange={e=>setDbSearch(e.target.value)} placeholder="🔍  Ieškoti pratimo..." style={{...css.input,width:220}} />
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={dbMuscle===m} onClick={()=>setDbMuscle(m)} />)}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(215px,1fr))", gap:16 }}>
                {dbList.map(ex=>(
                  <div key={ex.id} style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                    <div style={{ height:145, position:"relative", background:C.faint, overflow:"hidden" }}>
                      <ImgBox src={ex.img} />
                      <div style={{ position:"absolute", bottom:8, left:8, background:"#00000099", borderRadius:6, padding:"3px 9px", fontSize:11, color:C.teal, fontWeight:600 }}>{ex.muscle}</div>
                    </div>
                    <div style={{ padding:"14px 15px", flex:1, display:"flex", flexDirection:"column", gap:4 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{ex.name}</div>
                      <div style={{ fontSize:12, color:C.muted }}>{ex.equipment}</div>
                      <div style={{ fontSize:12, color:C.gold, fontWeight:600 }}>{ex.sets} ser. · {ex.reps} kart.</div>
                      {ex.desc&&<div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>{ex.desc}</div>}
                      <div style={{ display:"flex", gap:7, marginTop:"auto", paddingTop:10 }}>
                        <button style={css.btnTeal} onClick={()=>openEdit(ex)}>✏️ Redaguoti</button>
                        <button style={css.btnRed}  onClick={()=>setConfirmDel(ex)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {dbList.length===0&&<div style={{ gridColumn:"1/-1", textAlign:"center", color:C.muted, padding:60 }}>Pratimų nerasta</div>}
              </div>
            </div>
          )}

          {/* ══ PROGRAMA TAB ══ */}
          {tab==="programa"&&(
            <div>
              <div style={{ display:"flex", gap:6, marginBottom:28 }}>
                {[["1","Klientas"],["2","Programa"],["3","Peržiūra"]].map(([n,l])=>(
                  <button key={n} style={{...css.navBtn(step===+n), padding:"9px 20px", fontSize:13}} onClick={()=>setStep(+n)}>
                    <span style={{ fontWeight:800, marginRight:6 }}>{n}.</span>{l}
                  </button>
                ))}
              </div>

              {/* ─ STEP 1 ─ */}
              {step===1&&(
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>Kliento informacija</div>
                  <div style={{ color:C.muted, fontSize:13, marginBottom:24 }}>Užpildykite duomenis — KMI ir mitybos rekomendacijos apskaičiuojamos automatiškai</div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                    {/* Left — personal data */}
                    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                      <div style={css.card}>
                        <span style={css.secTitle}>Asmeniniai duomenys</span>

                        {/* Gender toggle */}
                        <div style={{ marginBottom:14 }}>
                          <span style={css.label}>Lytis</span>
                          <div style={{ display:"flex", gap:8 }}>
                            {["Vyras","Moteris"].map(g=>(
                              <button key={g} onClick={()=>setClient(p=>({...p,gender:g}))} style={{ flex:1, padding:"9px", borderRadius:8, border:client.gender===g?`1px solid ${C.gold}`:`1px solid ${C.border}`, background:client.gender===g?C.goldSoft:"transparent", color:client.gender===g?C.gold:C.muted, fontFamily:FONT, fontSize:13, cursor:"pointer", fontWeight:600 }}>{g==="Vyras"?"👨 Vyras":"👩 Moteris"}</button>
                            ))}
                          </div>
                        </div>

                        {[["Vardas ir pavardė","name","text"],["Amžius (metai)","age","number"],["Svoris (kg)","weight","number"],["Ūgis (cm)","height","number"]].map(([lb,k,t])=>(
                          <div key={k} style={{ marginBottom:14 }}>
                            <span style={css.label}>{lb}</span>
                            <input type={t} value={client[k]} onChange={e=>setClient(p=>({...p,[k]:e.target.value}))} style={css.input} placeholder={lb} />
                          </div>
                        ))}

                        {/* Activity level */}
                        <div style={{ marginBottom:14 }}>
                          <span style={css.label}>Aktyvumo lygis</span>
                          <select value={client.activityIndex} onChange={e=>setClient(p=>({...p,activityIndex:+e.target.value}))} style={css.select}>
                            {ACTIVITY_LEVELS.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={css.card}>
                        <span style={css.secTitle}>Tikslas ir lygis</span>
                        <div style={{ marginBottom:14 }}>
                          <span style={css.label}>Tikslas</span>
                          <select value={client.goal} onChange={e=>setClient(p=>({...p,goal:e.target.value}))} style={css.select}>
                            <option value="">Pasirinkite tikslą</option>
                            {GOALS.map(g=><option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div style={{ marginBottom:14 }}>
                          <span style={css.label}>Lygis</span>
                          <select value={client.level} onChange={e=>setClient(p=>({...p,level:e.target.value}))} style={css.select}>
                            <option value="">Pasirinkite lygį</option>
                            {LEVELS.map(l=><option key={l}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <span style={css.label}>Pastabos</span>
                          <textarea value={client.notes} onChange={e=>setClient(p=>({...p,notes:e.target.value}))} rows={3} placeholder="Sveikatos būklė, apribojimai..." style={{...css.input,resize:"none"}} />
                        </div>
                      </div>
                    </div>

                    {/* Right — training days + nutrition calculator */}
                    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                      <div style={css.card}>
                        <span style={css.secTitle}>Treniruočių dienos</span>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                          {DAYS.map(d=>(
                            <button key={d} onClick={()=>toggleDay(d)} style={{ padding:"7px 14px", borderRadius:8, border:client.trainingDays.includes(d)?`1px solid ${C.gold}`:`1px solid ${C.border}`, background:client.trainingDays.includes(d)?C.goldSoft:"transparent", color:client.trainingDays.includes(d)?C.gold:C.muted, fontFamily:FONT, fontSize:12, cursor:"pointer", fontWeight:600 }}>{d.slice(0,3)}</button>
                          ))}
                        </div>
                        {client.trainingDays.length>0&&<div style={{marginTop:12,fontSize:12,color:C.muted}}>{client.trainingDays.length} dienos pasirinktos</div>}
                      </div>

                      {/* Nutrition card — live */}
                      <NutritionCard nut={nut} bmiVal={bmiVal} />
                    </div>
                  </div>

                  <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
                    <button onClick={()=>setStep(2)} style={css.btnG}>Tęsti →</button>
                  </div>
                </div>
              )}

              {/* ─ STEP 2 ─ */}
              {step===2&&(
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>Programos sudarymas</div>
                  <div style={{ color:C.muted, fontSize:13, marginBottom:24 }}>Pridėkite pratimus kiekvienai treniruočių dienai</div>
                  <div style={{ marginBottom:20 }}>
                    <span style={css.label}>Programos pavadinimas</span>
                    <input value={programName} onChange={e=>setProgramName(e.target.value)} placeholder="pvz. Tomo 3 dienų programa" style={{...css.input,maxWidth:420}} />
                  </div>
                  {client.trainingDays.length===0
                    ?<div style={{...css.card, textAlign:"center", color:C.muted, padding:40}}>Grįžkite į 1 žingsnį ir pasirinkite treniruočių dienas</div>
                    :DAYS.filter(d=>client.trainingDays.includes(d)).map(day=>(
                      <div key={day} style={{...css.card, marginBottom:14}}>
                        <div style={{ display:"flex", alignItems:"center", marginBottom:14, gap:10 }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:C.gold }} />
                          <span style={{ fontWeight:700, letterSpacing:"0.1em", fontSize:13, color:C.text, textTransform:"uppercase" }}>{day}</span>
                          <span style={{ color:C.muted, fontSize:12 }}>— {(program[day]||[]).length} pratimas(-ai)</span>
                          <button onClick={()=>openPick(day)} style={{...css.btnTeal, marginLeft:"auto"}}>+ Pridėti pratimą</button>
                        </div>
                        {(program[day]||[]).length===0
                          ?<div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:"14px 0" }}>Pratimų nėra. Spustelėkite „+ Pridėti pratimą"</div>
                          :<div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {(program[day]||[]).map((ex,idx)=>(
                              <div key={idx} style={{ display:"flex", alignItems:"center", gap:12, background:C.faint, borderRadius:9, padding:"10px 14px" }}>
                                <div style={{ width:40, height:40, borderRadius:7, overflow:"hidden", background:C.border, flexShrink:0 }}><ImgBox src={ex.img} /></div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{ex.name}</div>
                                  <div style={{ fontSize:11, color:C.teal, marginBottom:4 }}>{ex.muscle} · {ex.equipment}</div>
                                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                    <StatPill icon="🔁" label="Ser."    value={ex.customSets}    color={C.gold} />
                                    <StatPill icon="💪" label="Kart."   value={ex.customReps} />
                                    <StatPill icon="⚖️" label="Svoris"  value={ex.customWeight} color={C.teal} />
                                    <StatPill icon="⏱️" label="Poilsis" value={ex.customRest}  color={C.purple} />
                                  </div>
                                </div>
                                <button onClick={()=>removeFromDay(day,idx)} style={css.btnRed}>🗑️</button>
                              </div>
                            ))}
                          </div>
                        }
                      </div>
                    ))
                  }
                  <div style={{ marginTop:24, display:"flex", justifyContent:"space-between" }}>
                    <button onClick={()=>setStep(1)} style={css.btnGhost}>← Atgal</button>
                    <button onClick={()=>setStep(3)} style={css.btnG}>Peržiūrėti →</button>
                  </div>
                </div>
              )}

              {/* ─ STEP 3 ─ */}
              {step===3&&(
                <div>
                  <div style={{ display:"flex", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{programName||"Sporto programa"}</div>
                      <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>Peržiūra ir eksportas</div>
                    </div>
                    <div style={{ marginLeft:"auto", display:"flex", gap:10, flexWrap:"wrap" }}>
                      <button onClick={()=>setStep(2)} style={css.btnGhost}>← Redaguoti</button>
                      <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} style={{...css.btnG, background:saved?C.teal:C.gold, color:saved?"#fff":C.bg}}>{saved?"✓ Išsaugota":"💾 Išsaugoti"}</button>
                      <button onClick={()=>window.print()} style={css.btnPrint}>🖨️ Spausdinti / PDF</button>
                    </div>
                  </div>

                  <div style={{ background:C.tealSoft, border:`1px solid ${C.tealBorder}`, borderRadius:10, padding:"11px 16px", marginBottom:20, fontSize:12.5, color:C.teal, fontWeight:500 }}>
                    💡 Spustelėkite <b>„🖨️ Spausdinti / PDF"</b> — pasirinkite <b>„Išsaugoti kaip PDF"</b>. Visi duomenys ir mitybos rekomendacijos bus įtraukti.
                  </div>

                  {/* Client card */}
                  <div style={{...css.card, marginBottom:18, display:"flex", gap:20, alignItems:"center"}}>
                    <div style={{ width:56, height:56, background:C.gold, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800, color:C.bg, flexShrink:0 }}>{(client.name||"?")[0].toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:18, fontWeight:700, marginBottom:8, color:C.text }}>{client.name||"Klientas"}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
                        {client.age    &&<span style={{color:C.muted,fontSize:13}}>Amžius: <b style={{color:C.text}}>{client.age} m.</b></span>}
                        {client.weight &&<span style={{color:C.muted,fontSize:13}}>Svoris: <b style={{color:C.text}}>{client.weight} kg</b></span>}
                        {client.height &&<span style={{color:C.muted,fontSize:13}}>Ūgis: <b style={{color:C.text}}>{client.height} cm</b></span>}
                        {bmiNum        &&<span style={{color:C.muted,fontSize:13}}>KMI: <b style={{color:bmiCategory(bmiNum).color}}>{bmiNum}</b></span>}
                        {client.goal   &&<Badge label={client.goal}  color={C.gold} />}
                        {client.level  &&<Badge label={client.level} color={C.teal} />}
                      </div>
                      {client.notes&&<div style={{marginTop:8,fontSize:12,color:C.muted,fontStyle:"italic"}}>📝 {client.notes}</div>}
                    </div>
                  </div>

                  {/* Nutrition summary in step 3 */}
                  {nut&&(
                    <div style={{...css.card, marginBottom:18}}>
                      <span style={css.secTitle}>📊 Mitybos rekomendacijos</span>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                        {[
                          { label:"TDEE (palaikymas)", value:`${nut.tdee} kcal`, color:C.gold },
                          { label:"🔻 Svorio metimas", value:`${nut.loseKcal} kcal`, color:C.red },
                          { label:"Baltymai (metimas)", value:`${nut.proteinLose} g`, color:"#f87171" },
                          { label:"🔺 Raumenų auginimas", value:`${nut.gainKcal} kcal`, color:C.green },
                          { label:"Baltymai (auginimas)", value:`${nut.proteinGain} g`, color:"#4ade80" },
                        ].map(({label,value,color})=>(
                          <div key={label} style={{ background:C.faint, borderRadius:9, padding:"12px 14px" }}>
                            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>{label}</div>
                            <div style={{ fontSize:20, fontWeight:800, color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Day tables */}
                  {trainingDays.map(day=>(
                    <div key={day} style={{...css.card, marginBottom:14, padding:0, overflow:"hidden"}}>
                      <div style={{ padding:"12px 22px", borderBottom:`1px solid ${C.faint}`, display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:C.gold }} />
                        <span style={{ fontWeight:700, letterSpacing:"0.1em", fontSize:13, textTransform:"uppercase" }}>{day}</span>
                        <span style={{ color:C.muted, fontSize:12 }}>— {(program[day]||[]).length} pratimas(-ai)</span>
                      </div>
                      {(program[day]||[]).length>0
                        ?<table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                              <tr style={{background:C.faint}}>
                                {["#","Pratimas","Raumenų gr.","Serijos","Kartojimai","⚖️ Svoris","⏱️ Poilsis","Inventorius"].map(h=>(
                                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, color:C.muted, letterSpacing:"0.07em", fontWeight:600, textTransform:"uppercase" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(program[day]||[]).map((ex,idx)=>(
                                <tr key={idx} style={{borderTop:`1px solid ${C.faint}`}}>
                                  <td style={{padding:"11px 14px",color:C.muted,fontSize:13}}>{idx+1}</td>
                                  <td style={{padding:"11px 14px"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                                      <div style={{width:40,height:40,borderRadius:7,overflow:"hidden",background:C.faint,flexShrink:0}}><ImgBox src={ex.img} /></div>
                                      <span style={{fontSize:13,fontWeight:600,color:C.text}}>{ex.name}</span>
                                    </div>
                                  </td>
                                  <td style={{padding:"11px 14px",color:C.teal,fontSize:13,fontWeight:500}}>{ex.muscle}</td>
                                  <td style={{padding:"11px 14px",color:C.gold,fontSize:13,fontWeight:700}}>{ex.customSets}</td>
                                  <td style={{padding:"11px 14px",color:C.text,fontSize:13}}>{ex.customReps}</td>
                                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.teal}}>{ex.customWeight||<span style={{color:C.muted,fontWeight:400}}>—</span>}</td>
                                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.purple}}>{ex.customRest||<span style={{color:C.muted,fontWeight:400}}>—</span>}</td>
                                  <td style={{padding:"11px 14px",color:C.muted,fontSize:12}}>{ex.equipment}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        :<div style={{padding:22,color:C.muted,fontSize:13,textAlign:"center"}}>Pratimų nėra</div>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL: Exercise form ── */}
        {formOpen&&(
          <div style={css.overlay}>
            <div style={css.modalBox(520)}>
              <div style={{ padding:"17px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
                <div style={{ fontWeight:700, fontSize:15, color:C.gold }}>{editingId!==null?"✏️ Redaguoti pratimą":"➕ Naujas pratimas"}</div>
                <button onClick={()=>setFormOpen(false)} style={{ marginLeft:"auto", width:29, height:29, background:C.faint, border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
              <div style={{ overflowY:"auto", padding:22, display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <span style={css.label}>Nuotrauka</span>
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div onClick={()=>imgRef.current?.click()} style={{ width:110, height:88, borderRadius:10, overflow:"hidden", border:`1px dashed ${C.border}`, background:C.bg, flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {form.img?<img src={form.img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:24}}>📷</div><div style={{fontSize:10,marginTop:4}}>Spustelėkite</div></div>}
                    </div>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                      <input ref={imgRef} type="file" accept="image/*" onChange={handleImgFile} style={{display:"none"}} />
                      <button onClick={()=>imgRef.current?.click()} style={css.btnTeal}>📂 Įkelti iš kompiuterio</button>
                      <input value={form.img.startsWith("data:")?"":form.img} onChange={e=>setForm(p=>({...p,img:e.target.value}))} placeholder="arba įklijuokite URL..." style={{...css.input,fontSize:12}} />
                      {form.img&&<button onClick={()=>setForm(p=>({...p,img:""}))} style={{...css.btnRed,fontSize:11}}>🗑 Išvalyti</button>}
                    </div>
                  </div>
                </div>
                <div><span style={css.label}>Pavadinimas *</span><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={css.input} placeholder="Pratimo pavadinimas" /></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><span style={css.label}>Raumenų grupė</span><select value={form.muscle} onChange={e=>setForm(p=>({...p,muscle:e.target.value}))} style={css.select}>{ALL_MUSCLES.map(m=><option key={m}>{m}</option>)}</select></div>
                  <div><span style={css.label}>Inventorius</span><input value={form.equipment} onChange={e=>setForm(p=>({...p,equipment:e.target.value}))} style={css.input} placeholder="Štanga, Hanteliai..." /></div>
                  <div><span style={css.label}>Serijos</span><input value={form.sets} onChange={e=>setForm(p=>({...p,sets:e.target.value}))} style={css.input} placeholder="pvz. 3-4" /></div>
                  <div><span style={css.label}>Kartojimai</span><input value={form.reps} onChange={e=>setForm(p=>({...p,reps:e.target.value}))} style={css.input} placeholder="pvz. 10-12" /></div>
                </div>
                <div><span style={css.label}>Aprašymas (neprivaloma)</span><textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} rows={3} placeholder="Technikos aprašymas..." style={{...css.input,resize:"none"}} /></div>
              </div>
              <div style={{ padding:"14px 22px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
                <button onClick={saveForm} style={{...css.btnG, opacity:form.name.trim()?1:0.4}}>💾 Išsaugoti</button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Pick exercise ── */}
        {pickDay&&(
          <div style={css.overlay}>
            <div style={css.modalBox(920)}>
              <div style={{ padding:"17px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.gold }}>Pratimų pasirinkimas — {pickDay}</div>
                  <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>Pasirinkite pratimą ir nustatykite parametrus</div>
                </div>
                <button onClick={()=>setPickDay(null)} style={{ marginLeft:"auto", width:29, height:29, background:C.faint, border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
              <div style={{ padding:"12px 20px", borderBottom:`1px solid ${C.faint}`, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <input value={pickSearch} onChange={e=>setPickSearch(e.target.value)} placeholder="🔍  Ieškoti..." style={{...css.input,width:200}} />
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={pickMuscle===m} onClick={()=>setPickMuscle(m)} />)}
                </div>
              </div>
              <div style={{ overflowY:"auto", padding:14, flex:1 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                  {pickList.map(ex=>(
                    <div key={ex.id} onClick={()=>setPickedEx(ex)} style={{ background:C.bg, borderRadius:11, border:pickedEx?.id===ex.id?`2px solid ${C.gold}`:`1px solid ${C.border}`, cursor:"pointer", overflow:"hidden", position:"relative" }}>
                      <div style={{ height:98, background:C.faint, overflow:"hidden" }}><ImgBox src={ex.img} /></div>
                      {pickedEx?.id===ex.id&&<div style={{ position:"absolute", top:7, right:7, width:22, height:22, background:C.gold, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:C.bg, fontSize:12 }}>✓</div>}
                      <div style={{ padding:"9px 11px" }}>
                        <div style={{ fontSize:12, fontWeight:600, color:C.text, lineHeight:1.3, marginBottom:3 }}>{ex.name}</div>
                        <div style={{ fontSize:11, color:C.teal }}>{ex.muscle}</div>
                        <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{ex.sets} ser. · {ex.reps} kart.</div>
                      </div>
                    </div>
                  ))}
                  {pickList.length===0&&<div style={{ gridColumn:"1/-1", textAlign:"center", color:C.muted, padding:40 }}>Pratimų nerasta</div>}
                </div>
              </div>
              {pickedEx&&(
                <div style={{ padding:"14px 22px", borderTop:`1px solid ${C.border}`, background:C.faint, display:"flex", alignItems:"flex-end", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:120 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{pickedEx.name}</div>
                    <div style={{ fontSize:11, color:C.teal, marginTop:2 }}>{pickedEx.muscle} · {pickedEx.equipment}</div>
                  </div>
                  <div><span style={css.label}>🔁 Serijos</span><input value={pickSets}   onChange={e=>setPickSets(e.target.value)}   placeholder={pickedEx.sets} style={{...css.input,width:72, textAlign:"center",padding:"8px 6px"}} /></div>
                  <div><span style={css.label}>💪 Kartojimai</span><input value={pickReps}   onChange={e=>setPickReps(e.target.value)}   placeholder={pickedEx.reps} style={{...css.input,width:90, textAlign:"center",padding:"8px 6px"}} /></div>
                  <div><span style={css.label}>⚖️ Svoris (kg)</span><input value={pickWeight} onChange={e=>setPickWeight(e.target.value)} placeholder="pvz. 60"        style={{...css.input,width:90, textAlign:"center",padding:"8px 6px",color:C.teal}} /></div>
                  <div><span style={css.label}>⏱️ Poilsis</span>
                    <select value={pickRest} onChange={e=>setPickRest(e.target.value)} style={{...css.select,width:110,padding:"8px 6px",color:C.purple}}>
                      <option value="">— pasirinkti —</option>
                      {REST_OPTIONS.map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={addToDay} style={{...css.btnG, alignSelf:"flex-end"}}>Pridėti +</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: Confirm delete ── */}
        {confirmDel&&(
          <div style={css.overlay}>
            <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.redBorder}`, padding:30, maxWidth:360, width:"100%", textAlign:"center", boxShadow:"0 20px 50px #00000055" }}>
              <div style={{ fontSize:34, marginBottom:12 }}>🗑️</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8, color:C.text }}>Ištrinti pratimą?</div>
              <div style={{ color:C.muted, fontSize:13, marginBottom:24 }}>„{confirmDel.name}" bus ištrintas iš duomenų bazės.</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
                <button onClick={()=>doDelete(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}