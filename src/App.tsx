import { useState, useRef, useEffect, useCallback } from "react";

// ── Supabase config ───────────────────────────────────────
const SUPABASE_URL = "https://wtsksjyayilyyudvizsx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c2tzanlheWlseXl1ZHZpenN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjI3NzgsImV4cCI6MjA5MzUzODc3OH0.wxlA05-VNVfsTe-630pQXYSewpDWII_AnOK2SIGEy7E";

// Simple Supabase REST helper
const sb = {
  headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=representation" },
  url: (table, query = "") => `${SUPABASE_URL}/rest/v1/${table}${query}`,

  async get(table, query = "") {
    const r = await fetch(sb.url(table, query), { headers: sb.headers });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(sb.url(table), { method: "POST", headers: sb.headers, body: JSON.stringify(data) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async update(table, id, data) {
    const r = await fetch(sb.url(table, `?id=eq.${id}`), { method: "PATCH", headers: { ...sb.headers, Prefer: "return=representation" }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(sb.url(table, `?id=eq.${id}`), { method: "DELETE", headers: sb.headers });
    if (!r.ok) throw new Error(await r.text());
  },
};

// ── Simple password login ─────────────────────────────────
const APP_PASSWORD = "coach2024"; // Change this to your own password!


// ── Print styles ──────────────────────────────────────────
const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  @media print {
    body { margin:0; background:white !important; font-family:'Inter',sans-serif !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .no-print { display:none !important; }
    .print-root { display:block !important; }
    * { box-sizing:border-box; }
  }
  @media screen { .print-root { display:none !important; } }
`;

// ── Constants ─────────────────────────────────────────────
const ALL_MUSCLES  = ["Krūtinė","Nugara","Kojos","Pečiai","Bicepsas","Tricepsas","Pilvas"];
const GOALS        = ["Raumenų auginimas","Riebalų deginimas","Jėgos ugdymas","Ištvermė","Reabilitacija","Sveikata"];
const LEVELS       = ["Pradedantysis","Vidutinis","Pažengęs"];
const DAYS         = ["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis","Sekmadienis"];
const REST_OPTIONS = ["30 sek","45 sek","60 sek","90 sek","2 min","3 min","4 min","5 min"];
const ACTIVITY_LEVELS = [
  { label:"Sėdimas darbas (mažai judėjimo)",       factor:1.2   },
  { label:"Lengvas aktyvumas (1–3 dienos/sav.)",   factor:1.375 },
  { label:"Vidutinis aktyvumas (3–5 dienos/sav.)", factor:1.55  },
  { label:"Didelis aktyvumas (6–7 dienos/sav.)",   factor:1.725 },
  { label:"Profesionalus sportininkas",             factor:1.9   },
];
const emptyExForm  = { name:"", muscle:"Krūtinė", equipment:"", sets:"3", reps:"10-12", description:"", imgs:[] };
const emptyClient  = { name:"", age:"", weight:"", height:"", gender:"Vyras", goal:"", level:"", notes:"", training_days:[], activity_index:2 };

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:"#0f1117", surface:"#171c27", border:"#252d3d",
  gold:"#c9a84c", goldSoft:"#c9a84c22", goldBorder:"#c9a84c44",
  teal:"#4ea8a0", tealSoft:"#4ea8a022", tealBorder:"#4ea8a044",
  red:"#c0474a",  redSoft:"#c0474a18",  redBorder:"#c0474a44",
  purple:"#a78bfa", green:"#4ade80",
  text:"#e4e8f0", muted:"#6b7a99", faint:"#1e2535",
};
const FONT = "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif";

// ── Helpers ───────────────────────────────────────────────
function calcBMI(w,h){ if(!w||!h) return null; return parseFloat(w)/Math.pow(parseFloat(h)/100,2); }
function bmiCat(b){ if(b<18.5) return{label:"Nepakankamas",color:"#60a5fa"}; if(b<25) return{label:"Normalus",color:"#4ade80"}; if(b<30) return{label:"Antsvoris",color:"#fbbf24"}; return{label:"Nutukimas",color:"#f87171"}; }
function calcNut(w,h,age,gender,act){
  const wf=parseFloat(w),hf=parseFloat(h),af=parseFloat(age)||25;
  if(!wf||!hf) return null;
  const bmr=gender==="Moteris"?10*wf+6.25*hf-5*af-161:10*wf+6.25*hf-5*af+5;
  const tdee=Math.round(bmr*act);
  return{ tdee, lose:Math.round(tdee-500), gain:Math.round(tdee+300), protLose:Math.round(wf*2), protGain:Math.round(wf*1.8) };
}

// ── CSS shortcuts ─────────────────────────────────────────
const css = {
  page:    {minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT},
  header:  {background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 28px",display:"flex",alignItems:"center",gap:14},
  logo:    {width:38,height:38,background:C.gold,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:C.bg,flexShrink:0},
  card:    {background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:22},
  label:   {fontSize:11,color:C.muted,letterSpacing:"0.08em",marginBottom:6,display:"block",fontWeight:600,textTransform:"uppercase"},
  input:   {width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.text,fontFamily:FONT,fontSize:13,outline:"none",boxSizing:"border-box"},
  select:  {width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.text,fontFamily:FONT,fontSize:13,outline:"none",boxSizing:"border-box"},
  navBtn:  (a)=>({padding:"8px 18px",borderRadius:7,border:a?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:a?C.gold:"transparent",color:a?C.bg:C.muted,fontFamily:FONT,fontWeight:600,fontSize:12,cursor:"pointer"}),
  btnG:    {padding:"10px 24px",background:C.gold,color:C.bg,border:"none",borderRadius:8,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"},
  btnGhost:{padding:"9px 18px",background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:FONT,fontWeight:600,fontSize:12,cursor:"pointer"},
  btnTeal: {padding:"7px 13px",background:C.tealSoft,color:C.teal,border:`1px solid ${C.tealBorder}`,borderRadius:6,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:600},
  btnRed:  {padding:"7px 13px",background:C.redSoft,color:C.red,border:`1px solid ${C.redBorder}`,borderRadius:6,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:600},
  btnPrint:{padding:"10px 24px",background:C.teal,color:"#fff",border:"none",borderRadius:8,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"},
  secTitle:{fontSize:10,color:C.teal,letterSpacing:"0.18em",marginBottom:16,display:"block",fontWeight:700,textTransform:"uppercase"},
  overlay: {position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16,backdropFilter:"blur(4px)"},
  modal:   (w)=>({background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,width:"100%",maxWidth:w||520,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px #00000055"}),
};

// ── Reusable UI pieces ────────────────────────────────────
const Tag = ({c,label,active,onClick}) => <button onClick={onClick} style={{padding:"5px 13px",borderRadius:20,border:active?`1px solid ${c}`:`1px solid ${C.border}`,background:active?c+"22":"transparent",color:active?c:C.muted,fontFamily:FONT,fontSize:11,cursor:"pointer",fontWeight:600}}>{label}</button>;
const Badge = ({label,color}) => <span style={{background:color+"18",border:`1px solid ${color}44`,borderRadius:20,padding:"3px 12px",color,fontSize:12,fontWeight:600}}>{label}</span>;
const Spinner = () => <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,color:C.muted,fontSize:14}}>⏳ Kraunama...</div>;
const Err = ({msg}) => msg?<div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:C.red,marginBottom:14}}>{msg}</div>:null;

function ImgGallery({ imgs, height=145 }) {
  const [cur,setCur] = useState(0);
  const list = (imgs||[]).filter(Boolean);
  if(!list.length) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:28,background:C.faint}}>📷</div>;
  return (
    <div style={{position:"relative",height,overflow:"hidden",background:C.faint}}>
      <img src={list[cur]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"} />
      {list.length>1&&<>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p-1+list.length)%list.length);}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",background:"#000a",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>‹</button>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%list.length);}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",background:"#000a",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>›</button>
        <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
          {list.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setCur(i);}} style={{width:6,height:6,borderRadius:"50%",background:i===cur?"white":"rgba(255,255,255,0.4)",cursor:"pointer"}} />)}
        </div>
      </>}
    </div>
  );
}

function MultiImgUploader({ imgs, onChange }) {
  const fileRef = useRef();
  const urlRef  = useRef();
  const addFile = (e) => { Array.from(e.target.files).forEach(f=>{ const r=new FileReader(); r.onload=ev=>onChange(p=>[...p,ev.target.result]); r.readAsDataURL(f); }); e.target.value=""; };
  const addUrl  = () => { const v=urlRef.current?.value?.trim(); if(v&&!imgs.includes(v)){onChange(p=>[...p,v]);urlRef.current.value="";} };
  const remove  = (i) => onChange(p=>p.filter((_,j)=>j!==i));
  const moveL   = (i) => { if(i===0)return; const a=[...imgs];[a[i-1],a[i]]=[a[i],a[i-1]];onChange(()=>a); };
  const moveR   = (i) => { if(i===imgs.length-1)return; const a=[...imgs];[a[i],a[i+1]]=[a[i+1],a[i]];onChange(()=>a); };
  return (
    <div>
      <span style={css.label}>Nuotraukos (galite pridėti kelias)</span>
      {imgs.length>0&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {imgs.map((src,i)=>(
            <div key={i} style={{position:"relative",width:100,height:80,borderRadius:8,overflow:"hidden",border:`2px solid ${i===0?C.gold:C.border}`,flexShrink:0}}>
              <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              {i===0&&<div style={{position:"absolute",bottom:3,left:3,background:C.gold,borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700,color:C.bg}}>COVER</div>}
              <div style={{position:"absolute",top:3,right:3,display:"flex",gap:2}}>
                {i>0&&<button onClick={()=>moveL(i)} style={{width:18,height:18,borderRadius:3,background:"#000a",border:"none",color:"white",fontSize:10,cursor:"pointer"}}>←</button>}
                {i<imgs.length-1&&<button onClick={()=>moveR(i)} style={{width:18,height:18,borderRadius:3,background:"#000a",border:"none",color:"white",fontSize:10,cursor:"pointer"}}>→</button>}
                <button onClick={()=>remove(i)} style={{width:18,height:18,borderRadius:3,background:"#c0474aaa",border:"none",color:"white",fontSize:10,cursor:"pointer"}}>×</button>
              </div>
            </div>
          ))}
          <div onClick={()=>fileRef.current?.click()} style={{width:100,height:80,borderRadius:8,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontSize:11,gap:4}}>
            <span style={{fontSize:20}}>+</span><span>Pridėti</span>
          </div>
        </div>
      )}
      {imgs.length===0&&<div onClick={()=>fileRef.current?.click()} style={{height:80,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,gap:8,marginBottom:12,fontSize:13}}><span style={{fontSize:22}}>📷</span> Spustelėkite, kad įkeltumėte</div>}
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} style={{display:"none"}} />
      <div style={{display:"flex",gap:8}}>
        <input ref={urlRef} placeholder="Arba įklijuokite URL ir spauskite +" style={{...css.input,flex:1,fontSize:12}} onKeyDown={e=>e.key==="Enter"&&addUrl()} />
        <button onClick={addUrl} style={{...css.btnTeal,padding:"8px 14px",fontSize:16,fontWeight:800}}>+</button>
      </div>
      <div style={{fontSize:11,color:C.muted,marginTop:6}}>💡 Pirmoji nuotrauka — viršelis. ← → perkelia, × ištrina.</div>
    </div>
  );
}


// ── PRINT / PDF VIEW ─────────────────────────────────────
function PrintView({ client: c, program, programName, progressList }) {
  if (!c) return null;
  const bmiVal = calcBMI(c.weight, c.height);
  const bmiNum = bmiVal ? parseFloat(bmiVal.toFixed(1)) : null;
  const nut    = calcNut(c.weight, c.height, c.age, c.gender, ACTIVITY_LEVELS[c.activity_index ?? 2]?.factor || 1.55);
  const trainingDays = DAYS.filter(d => (c.training_days || []).includes(d));
  const today  = new Date().toLocaleDateString("lt-LT");

  const s = {
    page:     { fontFamily:"'Inter',sans-serif", background:"white", color:"#111", minHeight:"100vh" },
    header:   { background:"#0f1117", padding:"20px 32px", display:"flex", alignItems:"center", gap:16, WebkitPrintColorAdjust:"exact", printColorAdjust:"exact" },
    logoBox:  { width:46, height:46, background:"#c9a84c", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#0f1117", flexShrink:0 },
    section:  { margin:"20px 32px", border:"1.5px solid #e0e0e8", borderRadius:12, overflow:"hidden" },
    sHead:    { background:"#0f1117", color:"white", padding:"11px 20px", fontWeight:700, fontSize:13, letterSpacing:"0.12em", textTransform:"uppercase", WebkitPrintColorAdjust:"exact", printColorAdjust:"exact" },
    infoGrid: { display:"flex", flexWrap:"wrap", gap:12, padding:"16px 20px" },
    infoBox:  (col) => ({ background: col ? col+"12" : "#f5f5fa", border:`1.5px solid ${col ? col+"44" : "#e0e0e8"}`, borderRadius:9, padding:"10px 16px", minWidth:100 }),
    exRow:    { display:"flex", gap:14, padding:"14px 18px", borderTop:"1px solid #f0f0f5", alignItems:"flex-start", pageBreakInside:"avoid" },
    exImg:    { width:130, height:100, objectFit:"cover", borderRadius:9, flexShrink:0, border:"1.5px solid #e8e8f0" },
    exImgPh:  { width:130, height:100, background:"#f0f0f5", borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 },
    statBox:  (col) => ({ background: col ? col+"15" : "#f5f5fa", border:`1.5px solid ${col ? col+"44" : "#e0e0e8"}`, borderRadius:7, padding:"5px 12px", display:"inline-flex", flexDirection:"column", alignItems:"center", minWidth:68, marginRight:8 }),
    footer:   { textAlign:"center", padding:"20px 32px", color:"#aaa", fontSize:11, borderTop:"1px solid #eee", marginTop:16 },
  };

  return (
    <div className="print-root" style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.logoBox}>M</div>
        <div>
          <div style={{fontSize:20, fontWeight:800, color:"#c9a84c", letterSpacing:"0.02em"}}>Coach Martynas</div>
          <div style={{fontSize:10, color:"#888", letterSpacing:"0.22em", textTransform:"uppercase", marginTop:2}}>Asmeninė sporto programa</div>
        </div>
        <div style={{marginLeft:"auto", textAlign:"right"}}>
          <div style={{fontSize:14, fontWeight:700, color:"white"}}>{programName || "Sporto programa"}</div>
          <div style={{fontSize:11, color:"#888", marginTop:2}}>Sukurta: {today}</div>
        </div>
      </div>

      {/* CLIENT INFO */}
      <div style={s.section}>
        <div style={s.sHead}>👤 Kliento informacija</div>
        <div style={s.infoGrid}>
          <div style={s.infoBox()}>
            <div style={{fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3}}>Vardas</div>
            <div style={{fontSize:15, fontWeight:700, color:"#111"}}>{c.name || "—"}</div>
          </div>
          {c.age    && <div style={s.infoBox()}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Amžius</div><div style={{fontSize:15,fontWeight:700,color:"#111"}}>{c.age} m.</div></div>}
          {c.weight && <div style={s.infoBox()}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Svoris</div><div style={{fontSize:15,fontWeight:700,color:"#111"}}>{c.weight} kg</div></div>}
          {c.height && <div style={s.infoBox()}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Ūgis</div><div style={{fontSize:15,fontWeight:700,color:"#111"}}>{c.height} cm</div></div>}
          {c.gender && <div style={s.infoBox()}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Lytis</div><div style={{fontSize:15,fontWeight:700,color:"#111"}}>{c.gender}</div></div>}
          {bmiNum   && <div style={s.infoBox(bmiCat(bmiNum).color)}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>KMI</div><div style={{fontSize:15,fontWeight:700,color:bmiCat(bmiNum).color}}>{bmiNum} — {bmiCat(bmiNum).label}</div></div>}
          {c.goal   && <div style={s.infoBox("#c9a84c")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Tikslas</div><div style={{fontSize:14,fontWeight:700,color:"#c9a84c"}}>{c.goal}</div></div>}
          {c.level  && <div style={s.infoBox("#4ea8a0")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Lygis</div><div style={{fontSize:14,fontWeight:700,color:"#4ea8a0"}}>{c.level}</div></div>}
        </div>
        {c.notes && <div style={{padding:"0 20px 14px", fontSize:12, color:"#666", fontStyle:"italic"}}>📝 {c.notes}</div>}
      </div>

      {/* NUTRITION */}
      {nut && (
        <div style={s.section}>
          <div style={s.sHead}>🍽️ Mitybos rekomendacijos (Mifflin-St Jeor formulė)</div>
          <div style={s.infoGrid}>
            <div style={s.infoBox("#c9a84c")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>TDEE (palaikymas)</div><div style={{fontSize:18,fontWeight:800,color:"#c9a84c"}}>{nut.tdee}<span style={{fontSize:11,color:"#888",marginLeft:3}}>kcal</span></div></div>
            <div style={s.infoBox("#c0474a")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>🔻 Svorio metimas</div><div style={{fontSize:18,fontWeight:800,color:"#c0474a"}}>{nut.lose}<span style={{fontSize:11,color:"#888",marginLeft:3}}>kcal</span></div></div>
            <div style={s.infoBox("#f87171")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Baltymai (metimas)</div><div style={{fontSize:18,fontWeight:800,color:"#f87171"}}>{nut.protLose}<span style={{fontSize:11,color:"#888",marginLeft:3}}>g</span></div></div>
            <div style={s.infoBox("#4ade80")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>🔺 Raumenų auginimas</div><div style={{fontSize:18,fontWeight:800,color:"#4ade80"}}>{nut.gain}<span style={{fontSize:11,color:"#888",marginLeft:3}}>kcal</span></div></div>
            <div style={s.infoBox("#4ea8a0")}><div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Baltymai (auginimas)</div><div style={{fontSize:18,fontWeight:800,color:"#4ea8a0"}}>{nut.protGain}<span style={{fontSize:11,color:"#888",marginLeft:3}}>g</span></div></div>
          </div>
        </div>
      )}

      {/* TRAINING PROGRAM */}
      {trainingDays.map((day, di) => {
        const exs = (program || {})[day] || [];
        return (
          <div key={day} style={{...s.section, pageBreakInside: exs.length <= 4 ? "avoid" : "auto"}}>
            <div style={s.sHead}>{day.toUpperCase()} — {exs.length} pratimas(-ai)</div>
            {exs.length === 0
              ? <div style={{padding:"16px 20px", color:"#aaa", fontSize:13}}>Pratimų nėra</div>
              : exs.map((ex, i) => {
                  const imgs = (ex.imgs || []).filter(Boolean);
                  return (
                    <div key={i} style={s.exRow}>
                      {/* Number */}
                      <div style={{width:28,height:28,background:"#f0f0f5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#555",flexShrink:0,marginTop:4}}>{i+1}</div>
                      {/* Photos */}
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        {imgs.length === 0
                          ? <div style={s.exImgPh}>📷</div>
                          : imgs.slice(0, 2).map((src, ii) => (
                              <img key={ii} src={src} alt={ex.name} style={{...s.exImg, width: ii === 0 ? 130 : 90, height: ii === 0 ? 100 : 70}} />
                            ))
                        }
                      </div>
                      {/* Info */}
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#111",marginBottom:4}}>{ex.name}</div>
                        <div style={{fontSize:12,color:"#4ea8a0",fontWeight:600,marginBottom:8}}>{ex.muscle} · {ex.equipment}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
                          {ex.customSets && <span style={{...s.statBox("#c9a84c")}}><span style={{fontSize:9,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em"}}>Serijos</span><span style={{fontSize:15,fontWeight:800,color:"#c9a84c"}}>{ex.customSets}</span></span>}
                          {ex.customReps && <span style={{...s.statBox("#555")}}><span style={{fontSize:9,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em"}}>Kartojimai</span><span style={{fontSize:15,fontWeight:800,color:"#333"}}>{ex.customReps}</span></span>}
                          {ex.customWeight && <span style={{...s.statBox("#4ea8a0")}}><span style={{fontSize:9,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em"}}>Svoris</span><span style={{fontSize:15,fontWeight:800,color:"#4ea8a0"}}>{ex.customWeight}</span></span>}
                          {ex.customRest && <span style={{...s.statBox("#a78bfa")}}><span style={{fontSize:9,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em"}}>Poilsis</span><span style={{fontSize:14,fontWeight:800,color:"#a78bfa"}}>{ex.customRest}</span></span>}
                        </div>
                        {ex.description && <div style={{fontSize:11,color:"#777",fontStyle:"italic",lineHeight:1.5,maxWidth:400}}>{ex.description}</div>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        );
      })}

      {/* PROGRESS */}
      {progressList && progressList.length > 0 && (
        <div style={s.section}>
          <div style={s.sHead}>📈 Pažangos istorija</div>
          <div style={{padding:"14px 20px"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#f5f5fa"}}>
                  {["Data","Svoris","Krūtinė","Juosmuo","Klubai","Pastabos"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,color:"#888",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600,borderBottom:"1.5px solid #e0e0e8"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {progressList.map((p,i)=>(
                  <tr key={p.id} style={{borderBottom:"1px solid #f0f0f5",background:i%2===0?"white":"#fafafa"}}>
                    <td style={{padding:"8px 12px",color:"#555"}}>{new Date(p.date).toLocaleDateString("lt-LT")}</td>
                    <td style={{padding:"8px 12px",fontWeight:700,color:"#c9a84c"}}>{p.weight ? p.weight+" kg" : "—"}</td>
                    <td style={{padding:"8px 12px",color:"#333"}}>{p.chest ? p.chest+" cm" : "—"}</td>
                    <td style={{padding:"8px 12px",color:"#333"}}>{p.waist ? p.waist+" cm" : "—"}</td>
                    <td style={{padding:"8px 12px",color:"#333"}}>{p.hips ? p.hips+" cm" : "—"}</td>
                    <td style={{padding:"8px 12px",color:"#666",fontStyle:"italic"}}>{p.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={s.footer}>© Coach Martynas · Asmeninė sporto programa · {today}</div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw,setPw] = useState("");
  const [err,setErr] = useState("");
  const submit = () => { if(pw===APP_PASSWORD){onLogin();}else{setErr("Neteisingas slaptažodis. Bandykite dar kartą.");setPw("");} };
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT}}>
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,padding:"48px 40px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 24px 60px #00000055"}}>
        <div style={{width:64,height:64,background:C.gold,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:C.bg,margin:"0 auto 20px"}}>M</div>
        <div style={{fontSize:24,fontWeight:800,color:C.gold,marginBottom:4}}>Coach Martynas</div>
        <div style={{fontSize:12,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:32}}>Sporto programų sistema</div>
        <Err msg={err} />
        <div style={{marginBottom:16}}>
          <span style={css.label}>Slaptažodis</span>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...css.input,textAlign:"center",fontSize:18,letterSpacing:4}} placeholder="••••••••" autoFocus />
        </div>
        <button onClick={submit} style={{...css.btnG,width:"100%",padding:"13px",fontSize:14}}>🔓 Prisijungti</button>
        <div style={{fontSize:11,color:C.muted,marginTop:16}}>Tik jūs turite prieigą prie šios sistemos.</div>
      </div>
    </div>
  );
}

// ── EXERCISES TAB ─────────────────────────────────────────
function ExercisesTab() {
  const [exercises,setExercises] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [search,setSearch]       = useState("");
  const [muscle,setMuscle]       = useState("Visos");
  const [formOpen,setFormOpen]   = useState(false);
  const [editId,setEditId]       = useState(null);
  const [form,setForm]           = useState(emptyExForm);
  const [saving,setSaving]       = useState(false);
  const [confirmDel,setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setExercises(await sb.get("exercises","?order=name")); }
    catch(e){ setError("Klaida kraunant pratimus: "+e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const openNew  = () => { setEditId(null); setForm(emptyExForm); setFormOpen(true); };
  const openEdit = (ex) => { setEditId(ex.id); setForm({name:ex.name,muscle:ex.muscle||"Krūtinė",equipment:ex.equipment||"",sets:ex.sets||"3",reps:ex.reps||"10-12",description:ex.description||"",imgs:ex.imgs||[]}); setFormOpen(true); };

  const save = async () => {
    if(!form.name.trim()) return;
    setSaving(true);
    try {
      if(editId) await sb.update("exercises",editId,form);
      else await sb.insert("exercises",form);
      setFormOpen(false); await load();
    } catch(e){ alert("Klaida: "+e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    try { await sb.delete("exercises",id); setConfirmDel(null); await load(); }
    catch(e){ alert("Klaida: "+e.message); }
  };

  const filtered = exercises.filter(e=>(muscle==="Visos"||e.muscle===muscle)&&(e.name.toLowerCase().includes(search.toLowerCase())||( e.equipment||"").toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div style={{background:C.tealSoft,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:12,color:C.teal,display:"flex",alignItems:"center",gap:8}}>
        <span>☁️ Duomenys išsaugomi Supabase debesyje — pasiekiami iš bet kurio įrenginio.</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:C.text}}>Pratimų duomenų bazė</div>
          <div style={{color:C.muted,fontSize:13,marginTop:3}}>{exercises.length} pratimų iš viso</div>
        </div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto"}}>+ Naujas pratimas</button>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Ieškoti..." style={{...css.input,width:220}} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={muscle===m} onClick={()=>setMuscle(m)} />)}
        </div>
        <button onClick={load} style={{...css.btnGhost,marginLeft:"auto"}}>↺ Atnaujinti</button>
      </div>

      <Err msg={error} />
      {loading ? <Spinner /> : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))",gap:16}}>
          {filtered.map(ex=>(
            <div key={ex.id} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{position:"relative"}}>
                <ImgGallery imgs={ex.imgs} height={145} />
                <div style={{position:"absolute",bottom:8,left:8,background:"#00000099",borderRadius:6,padding:"3px 9px",fontSize:11,color:C.teal,fontWeight:600}}>{ex.muscle}</div>
                {(ex.imgs||[]).length>1&&<div style={{position:"absolute",top:8,right:8,background:"#000000aa",borderRadius:12,padding:"2px 7px",fontSize:10,color:"white",fontWeight:600}}>{(ex.imgs||[]).length} 📷</div>}
              </div>
              <div style={{padding:"14px 15px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{ex.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{ex.equipment}</div>
                <div style={{fontSize:12,color:C.gold,fontWeight:600}}>{ex.sets} ser. · {ex.reps} kart.</div>
                {ex.description&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{ex.description}</div>}
                <div style={{display:"flex",gap:7,marginTop:"auto",paddingTop:10}}>
                  <button style={css.btnTeal} onClick={()=>openEdit(ex)}>✏️ Redaguoti</button>
                  <button style={css.btnRed}  onClick={()=>setConfirmDel(ex)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0&&!loading&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:60}}>Pratimų nerasta</div>}
        </div>
      )}

      {/* Exercise form modal */}
      {formOpen&&(
        <div style={css.overlay}>
          <div style={css.modal(560)}>
            <div style={{padding:"17px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:15,color:C.gold}}>{editId?"✏️ Redaguoti pratimą":"➕ Naujas pratimas"}</div>
              <button onClick={()=>setFormOpen(false)} style={{marginLeft:"auto",width:29,height:29,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
            </div>
            <div style={{overflowY:"auto",padding:22,display:"flex",flexDirection:"column",gap:16}}>
              <MultiImgUploader imgs={form.imgs||[]} onChange={fn=>setForm(p=>({...p,imgs:typeof fn==="function"?fn(p.imgs||[]):fn}))} />
              <div><span style={css.label}>Pavadinimas *</span><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={css.input} placeholder="Pratimo pavadinimas" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><span style={css.label}>Raumenų grupė</span><select value={form.muscle} onChange={e=>setForm(p=>({...p,muscle:e.target.value}))} style={css.select}>{ALL_MUSCLES.map(m=><option key={m}>{m}</option>)}</select></div>
                <div><span style={css.label}>Inventorius</span><input value={form.equipment} onChange={e=>setForm(p=>({...p,equipment:e.target.value}))} style={css.input} placeholder="Štanga, Hanteliai..." /></div>
                <div><span style={css.label}>Serijos</span><input value={form.sets} onChange={e=>setForm(p=>({...p,sets:e.target.value}))} style={css.input} placeholder="3-4" /></div>
                <div><span style={css.label}>Kartojimai</span><input value={form.reps} onChange={e=>setForm(p=>({...p,reps:e.target.value}))} style={css.input} placeholder="10-12" /></div>
              </div>
              <div><span style={css.label}>Aprašymas</span><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} style={{...css.input,resize:"none"}} placeholder="Technikos aprašymas..." /></div>
            </div>
            <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={save} disabled={saving} style={{...css.btnG,opacity:form.name.trim()?1:0.4}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDel&&(
        <div style={css.overlay}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.redBorder}`,padding:30,maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 50px #00000055"}}>
            <div style={{fontSize:34,marginBottom:12}}>🗑️</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8,color:C.text}}>Ištrinti pratimą?</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:24}}>„{confirmDel.name}" bus ištrintas visam laikui.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={()=>del(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENTS TAB ───────────────────────────────────────────
function ClientsTab({ exercises }) {
  const [clients,setClients]         = useState([]);
  const [loading,setLoading]         = useState(true);
  const [error,setError]             = useState("");
  const [search,setSearch]           = useState("");
  const [view,setView]               = useState(null);       // viewed client
  const [progressList,setProgressList] = useState([]);
  const [progLoading,setProgLoading] = useState(false);
  const [progForm,setProgForm]       = useState({date:"",weight:"",chest:"",waist:"",hips:"",notes:""});
  const [progFormOpen,setProgFormOpen] = useState(false);
  const [clientFormOpen,setClientFormOpen] = useState(false);
  const [editClientId,setEditClientId] = useState(null);
  const [clientForm,setClientForm]   = useState(emptyClient);
  const [program,setProgram]         = useState({});
  const [programName,setProgramName] = useState("");
  const [step,setStep]               = useState(1);
  const [pickDay,setPickDay]         = useState(null);
  const [pickSearch,setPickSearch]   = useState("");
  const [pickMuscle,setPickMuscle]   = useState("Visos");
  const [pickedEx,setPickedEx]       = useState(null);
  const [pickSets,setPickSets]       = useState("");
  const [pickReps,setPickReps]       = useState("");
  const [pickWeight,setPickWeight]   = useState("");
  const [pickRest,setPickRest]       = useState("");
  const [saving,setSaving]           = useState(false);
  const [confirmDel,setConfirmDel]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setClients(await sb.get("clients","?order=name")); }
    catch(e){ setError("Klaida: "+e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const loadProgress = async (clientId) => {
    setProgLoading(true);
    try { setProgressList(await sb.get("progress",`?client_id=eq.${clientId}&order=date.desc`)); }
    catch(e){ console.error(e); }
    finally { setProgLoading(false); }
  };

  const openView = (c) => { setView(c); loadProgress(c.id); };

  const openNew = () => {
    setEditClientId(null);
    setClientForm(emptyClient);
    setProgram({});
    setProgramName("");
    setStep(1);
    setClientFormOpen(true);
  };

  const openEdit = (c) => {
    setEditClientId(c.id);
    setClientForm({
      name:c.name||"", age:c.age||"", weight:c.weight||"", height:c.height||"",
      gender:c.gender||"Vyras", goal:c.goal||"", level:c.level||"",
      notes:c.notes||"", training_days:c.training_days||[], activity_index:c.activity_index??2,
    });
    setProgram(c.program||{});
    setProgramName(c.program_name||"");
    setStep(1);
    setClientFormOpen(true);
    setView(null);
  };

  const saveClient = async () => {
    if(!clientForm.name.trim()) return;
    setSaving(true);
    const data = { ...clientForm, program, program_name:programName };
    try {
      if(editClientId) await sb.update("clients",editClientId,data);
      else await sb.insert("clients",data);
      setClientFormOpen(false);
      await load();
    } catch(e){ alert("Klaida: "+e.message); }
    finally { setSaving(false); }
  };

  const delClient = async (id) => {
    try { await sb.delete("clients",id); setConfirmDel(null); setView(null); await load(); }
    catch(e){ alert("Klaida: "+e.message); }
  };

  const saveProgress = async () => {
    if(!view||!progForm.weight) return;
    setSaving(true);
    try {
      await sb.insert("progress",{client_id:view.id,...progForm});
      setProgFormOpen(false);
      setProgForm({date:"",weight:"",chest:"",waist:"",hips:"",notes:""});
      await loadProgress(view.id);
    } catch(e){ alert("Klaida: "+e.message); }
    finally { setSaving(false); }
  };

  const delProgress = async (id) => {
    try { await sb.delete("progress",id); await loadProgress(view.id); }
    catch(e){ alert("Klaida: "+e.message); }
  };

  const toggleDay   = (d) => setClientForm(p=>({...p,training_days:p.training_days.includes(d)?p.training_days.filter(x=>x!==d):[...p.training_days,d]}));
  const openPick    = (day)=> { setPickDay(day);setPickedEx(null);setPickSets("");setPickReps("");setPickWeight("");setPickRest(""); };
  const pickList    = exercises.filter(e=>(pickMuscle==="Visos"||e.muscle===pickMuscle)&&(e.name.toLowerCase().includes(pickSearch.toLowerCase())||e.muscle.toLowerCase().includes(pickSearch.toLowerCase())));
  const addToDay    = () => { if(!pickedEx)return; setProgram(p=>({...p,[pickDay]:[...(p[pickDay]||[]),{...pickedEx,customSets:pickSets||pickedEx.sets,customReps:pickReps||pickedEx.reps,customWeight:pickWeight||"",customRest:pickRest||""}]})); setPickDay(null); };
  const removeFromDay=(day,idx)=>setProgram(p=>({...p,[day]:p[day].filter((_,i)=>i!==idx)}));

  const bmiVal = calcBMI(clientForm.weight,clientForm.height);
  const bmiNum = bmiVal?parseFloat(bmiVal.toFixed(1)):null;
  const nut    = calcNut(clientForm.weight,clientForm.height,clientForm.age,clientForm.gender,ACTIVITY_LEVELS[clientForm.activity_index]?.factor||1.55);
  const trainingDays = DAYS.filter(d=>clientForm.training_days.includes(d));
  const filtered = clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.goal||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:22,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:C.text}}>Klientų duomenų bazė</div>
          <div style={{color:C.muted,fontSize:13,marginTop:3}}>{clients.length} klientų išsaugota</div>
        </div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto"}}>+ Naujas klientas</button>
      </div>

      <Err msg={error} />
      {clients.length>0&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Ieškoti kliento..." style={{...css.input,maxWidth:360,marginBottom:20}} />}

      {loading?<Spinner/>:(
        clients.length===0?(
          <div style={{...css.card,textAlign:"center",padding:"60px 40px"}}>
            <div style={{fontSize:48,marginBottom:16}}>👥</div>
            <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Klientų dar nėra</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:24}}>Pridėkite pirmą klientą spausdami mygtuką viršuje.</div>
            <button onClick={openNew} style={css.btnG}>+ Pridėti klientą</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {filtered.map(c=>{
              const bmi=calcBMI(c.weight,c.height);
              const bmiN=bmi?parseFloat(bmi.toFixed(1)):null;
              const dayCount=Object.values(c.program||{}).filter(d=>d.length>0).length;
              const exCount=Object.values(c.program||{}).reduce((s,d)=>s+d.length,0);
              return(
                <div key={c.id} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <div style={{background:C.faint,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:46,height:46,background:C.gold,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:C.text}}>{c.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.program_name||"Programa"} · {new Date(c.created_at).toLocaleDateString("lt-LT")}</div>
                    </div>
                  </div>
                  <div style={{padding:"12px 18px",display:"flex",flexWrap:"wrap",gap:8}}>
                    {c.age&&<div style={{background:C.faint,borderRadius:7,padding:"4px 10px",fontSize:12}}><span style={{color:C.muted}}>Amžius </span><b style={{color:C.text}}>{c.age} m.</b></div>}
                    {c.weight&&<div style={{background:C.faint,borderRadius:7,padding:"4px 10px",fontSize:12}}><span style={{color:C.muted}}>Svoris </span><b style={{color:C.text}}>{c.weight} kg</b></div>}
                    {bmiN&&<div style={{background:C.faint,borderRadius:7,padding:"4px 10px",fontSize:12}}><span style={{color:C.muted}}>KMI </span><b style={{color:bmiCat(bmiN).color}}>{bmiN}</b></div>}
                    {c.goal&&<Badge label={c.goal} color={C.gold} />}
                    {c.level&&<Badge label={c.level} color={C.teal} />}
                  </div>
                  <div style={{padding:"0 18px 12px",display:"flex",gap:14}}>
                    <div style={{fontSize:12,color:C.muted}}>📅 <b style={{color:C.text}}>{dayCount}</b> dienų</div>
                    <div style={{fontSize:12,color:C.muted}}>🏋️ <b style={{color:C.text}}>{exCount}</b> pratimų</div>
                  </div>
                  <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
                    <button onClick={()=>openView(c)} style={{...css.btnTeal,flex:1}}>👁️ Peržiūrėti</button>
                    <button onClick={()=>openEdit(c)} style={{...css.btnG,flex:1,padding:"7px 13px",fontSize:12}}>✏️ Redaguoti</button>
                    <button onClick={()=>setConfirmDel(c)} style={css.btnRed}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── CLIENT DETAIL VIEW ── */}
      {view&&(
        <div style={css.overlay}>
          <div style={{...css.modal(860)}}>
            <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`}}>
              {/* Top row: name + close */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:38,height:38,background:C.gold,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:C.bg,flexShrink:0}}>{(view.name||"?")[0].toUpperCase()}</div>
                <div style={{fontWeight:700,fontSize:16,color:C.text}}>{view.name}</div>
                <button onClick={()=>setView(null)} style={{marginLeft:"auto",width:29,height:29,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
              {/* Bottom row: action buttons */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,flex:1,justifyContent:"center",display:"flex",alignItems:"center",gap:6}}>📈 Pridėti pažangą</button>
                <button onClick={()=>openEdit(view)} style={{...css.btnG,flex:1,justifyContent:"center",display:"flex",alignItems:"center",gap:6}}>✏️ Redaguoti programą</button>
                <button onClick={()=>{if(window.__setPrintData){window.__setPrintData({client:view,program:view.program||{},programName:view.program_name||"",progressList});setTimeout(()=>window.print(),400);}}} style={{...css.btnPrint,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🖨️ Spausdinti / PDF</button>
              </div>
            </div>
            <div style={{overflowY:"auto",padding:22,flex:1}}>
              {/* Client info */}
              <div style={{...css.card,marginBottom:16}}>
                <span style={css.secTitle}>Kliento duomenys</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
                  {[["Amžius",view.age&&view.age+" m."],["Svoris",view.weight&&view.weight+" kg"],["Ūgis",view.height&&view.height+" cm"],["Lytis",view.gender],["Tikslas",view.goal],["Lygis",view.level]].filter(([,v])=>v).map(([l,v])=>(
                    <div key={l} style={{background:C.faint,borderRadius:8,padding:"8px 14px"}}>
                      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:600,color:C.text}}>{v}</div>
                    </div>
                  ))}
                  {(()=>{const b=calcBMI(view.weight,view.height);if(!b)return null;const bn=parseFloat(b.toFixed(1));const bc=bmiCat(bn);return(<div style={{background:C.faint,borderRadius:8,padding:"8px 14px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>KMI</div><div style={{fontSize:14,fontWeight:700,color:bc.color}}>{bn} — {bc.label}</div></div>);})()}
                </div>
                {view.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>📝 {view.notes}</div>}
              </div>

              {/* Progress tracking */}
              <div style={{...css.card,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",marginBottom:16}}>
                  <span style={{...css.secTitle,marginBottom:0}}>📈 Pažangos istorija</span>
                  <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,marginLeft:"auto",fontSize:11}}>+ Pridėti įrašą</button>
                </div>
                {progLoading?<Spinner/>:progressList.length===0?(
                  <div style={{textAlign:"center",color:C.muted,padding:"20px 0",fontSize:13}}>Pažangos įrašų dar nėra. Pridėkite pirmą!</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {progressList.map(p=>(
                      <div key={p.id} style={{background:C.faint,borderRadius:9,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                        <div style={{fontSize:12,color:C.muted,minWidth:80}}>{new Date(p.date).toLocaleDateString("lt-LT")}</div>
                        {p.weight&&<div style={{background:C.surface,borderRadius:7,padding:"4px 10px",fontSize:13,fontWeight:700,color:C.gold}}>{p.weight} kg</div>}
                        {p.chest&&<div style={{fontSize:12,color:C.muted}}>Krūtinė: <b style={{color:C.text}}>{p.chest} cm</b></div>}
                        {p.waist&&<div style={{fontSize:12,color:C.muted}}>Juosmuo: <b style={{color:C.text}}>{p.waist} cm</b></div>}
                        {p.hips&&<div style={{fontSize:12,color:C.muted}}>Klubai: <b style={{color:C.text}}>{p.hips} cm</b></div>}
                        {p.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",flex:1}}>📝 {p.notes}</div>}
                        <button onClick={()=>delProgress(p.id)} style={{...css.btnRed,padding:"4px 8px",fontSize:11,marginLeft:"auto"}}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Program summary */}
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>📋 {view.program_name||"Programa"}</div>
              {DAYS.filter(d=>(view.training_days||[]).includes(d)).map(day=>{
                const exs=(view.program||{})[day]||[];
                return(
                  <div key={day} style={{...css.card,marginBottom:10,padding:0,overflow:"hidden"}}>
                    <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.faint}`,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:C.gold}} />
                      <span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.1em"}}>{day}</span>
                      <span style={{color:C.muted,fontSize:11}}>— {exs.length} pratimas(-ai)</span>
                    </div>
                    {exs.length===0?<div style={{padding:"10px 16px",color:C.muted,fontSize:12}}>Pratimų nėra</div>:(
                      <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:6}}>
                        {exs.map((ex,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:7,padding:"8px 10px"}}>
                            <div style={{width:34,height:34,borderRadius:6,overflow:"hidden",background:C.border,flexShrink:0}}>
                              {(ex.imgs||[]).filter(Boolean)[0]?<img src={(ex.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📷</div>}
                            </div>
                            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{ex.name}</div><div style={{fontSize:11,color:C.teal}}>{ex.muscle}</div></div>
                            <div style={{display:"flex",gap:6}}>
                              {ex.customSets&&<span style={{fontSize:11,color:C.gold,fontWeight:700}}>{ex.customSets} ser.</span>}
                              {ex.customReps&&<span style={{fontSize:11,color:C.muted}}>{ex.customReps} kart.</span>}
                              {ex.customWeight&&<span style={{fontSize:11,color:C.teal}}>⚖️{ex.customWeight}</span>}
                              {ex.customRest&&<span style={{fontSize:11,color:C.purple}}>⏱️{ex.customRest}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PROGRESS MODAL ── */}
      {progFormOpen&&(
        <div style={{...css.overlay,zIndex:300}}>
          <div style={css.modal(440)}>
            <div style={{padding:"17px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:15,color:C.gold}}>📈 Pridėti pažangos įrašą</div>
              <button onClick={()=>setProgFormOpen(false)} style={{marginLeft:"auto",width:29,height:29,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
            </div>
            <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
              <div><span style={css.label}>Data</span><input type="date" value={progForm.date} onChange={e=>setProgForm(p=>({...p,date:e.target.value}))} style={css.input} /></div>
              <div><span style={css.label}>⚖️ Svoris (kg)</span><input type="number" value={progForm.weight} onChange={e=>setProgForm(p=>({...p,weight:e.target.value}))} style={css.input} placeholder="pvz. 82.5" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><span style={css.label}>Krūtinė (cm)</span><input type="number" value={progForm.chest} onChange={e=>setProgForm(p=>({...p,chest:e.target.value}))} style={css.input} placeholder="100" /></div>
                <div><span style={css.label}>Juosmuo (cm)</span><input type="number" value={progForm.waist} onChange={e=>setProgForm(p=>({...p,waist:e.target.value}))} style={css.input} placeholder="85" /></div>
                <div><span style={css.label}>Klubai (cm)</span><input type="number" value={progForm.hips} onChange={e=>setProgForm(p=>({...p,hips:e.target.value}))} style={css.input} placeholder="100" /></div>
              </div>
              <div><span style={css.label}>Pastabos</span><textarea value={progForm.notes} onChange={e=>setProgForm(p=>({...p,notes:e.target.value}))} rows={3} style={{...css.input,resize:"none"}} placeholder="Kaip jautėsi, ką pastebėjo..." /></div>
            </div>
            <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setProgFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={saveProgress} disabled={saving} style={{...css.btnG,opacity:progForm.weight?1:0.4}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT FORM (Add/Edit) ── */}
      {clientFormOpen&&(
        <div style={css.overlay}>
          <div style={{...css.modal(860),maxHeight:"95vh"}}>
            <div style={{padding:"17px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:15,color:C.gold}}>{editClientId?"✏️ Redaguoti klientą":"➕ Naujas klientas"}</div>
              <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
                {[["1","Info"],["2","Programa"],["3","Peržiūra"]].map(([n,l])=>(
                  <button key={n} style={{...css.navBtn(step===+n),padding:"6px 14px",fontSize:12}} onClick={()=>setStep(+n)}><b>{n}.</b> {l}</button>
                ))}
                <button onClick={()=>setClientFormOpen(false)} style={{width:29,height:29,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16,marginLeft:8}}>×</button>
              </div>
            </div>
            <div style={{overflowY:"auto",padding:22,flex:1}}>

              {/* STEP 1 — Client info */}
              {step===1&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div>
                      <span style={css.label}>Lytis</span>
                      <div style={{display:"flex",gap:8}}>
                        {["Vyras","Moteris"].map(g=>(
                          <button key={g} onClick={()=>setClientForm(p=>({...p,gender:g}))} style={{flex:1,padding:"9px",borderRadius:8,border:clientForm.gender===g?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:clientForm.gender===g?C.goldSoft:"transparent",color:clientForm.gender===g?C.gold:C.muted,fontFamily:FONT,fontSize:13,cursor:"pointer",fontWeight:600}}>{g==="Vyras"?"👨 Vyras":"👩 Moteris"}</button>
                        ))}
                      </div>
                    </div>
                    {[["Vardas ir pavardė *","name","text"],["Amžius (metai)","age","number"],["Svoris (kg)","weight","number"],["Ūgis (cm)","height","number"]].map(([lb,k,t])=>(
                      <div key={k}>
                        <span style={css.label}>{lb}</span>
                        <input type={t} value={clientForm[k]} onChange={e=>setClientForm(p=>({...p,[k]:e.target.value}))} style={css.input} placeholder={lb} />
                      </div>
                    ))}
                    <div>
                      <span style={css.label}>Aktyvumo lygis</span>
                      <select value={clientForm.activity_index} onChange={e=>setClientForm(p=>({...p,activity_index:+e.target.value}))} style={css.select}>
                        {ACTIVITY_LEVELS.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <span style={css.label}>Tikslas</span>
                      <select value={clientForm.goal} onChange={e=>setClientForm(p=>({...p,goal:e.target.value}))} style={css.select}>
                        <option value="">Pasirinkite</option>
                        {GOALS.map(g=><option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <span style={css.label}>Lygis</span>
                      <select value={clientForm.level} onChange={e=>setClientForm(p=>({...p,level:e.target.value}))} style={css.select}>
                        <option value="">Pasirinkite</option>
                        {LEVELS.map(l=><option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <span style={css.label}>Pastabos</span>
                      <textarea value={clientForm.notes} onChange={e=>setClientForm(p=>({...p,notes:e.target.value}))} rows={3} style={{...css.input,resize:"none"}} placeholder="Sveikatos apribojimai, pastabos..." />
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={css.card}>
                      <span style={css.secTitle}>Treniruočių dienos</span>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {DAYS.map(d=>(
                          <button key={d} onClick={()=>toggleDay(d)} style={{padding:"7px 14px",borderRadius:8,border:clientForm.training_days.includes(d)?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:clientForm.training_days.includes(d)?C.goldSoft:"transparent",color:clientForm.training_days.includes(d)?C.gold:C.muted,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:600}}>{d.slice(0,3)}</button>
                        ))}
                      </div>
                    </div>
                    {bmiNum&&(
                      <div style={css.card}>
                        <span style={css.secTitle}>KMI ir mityba</span>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,background:C.faint,borderRadius:9,padding:"12px 14px"}}>
                          <div style={{fontSize:28,fontWeight:800,color:bmiCat(bmiNum).color}}>{bmiNum}</div>
                          <div style={{background:bmiCat(bmiNum).color+"22",border:`1px solid ${bmiCat(bmiNum).color}44`,borderRadius:7,padding:"4px 12px",color:bmiCat(bmiNum).color,fontWeight:700,fontSize:12}}>{bmiCat(bmiNum).label}</div>
                        </div>
                        {nut&&(
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                            {[["TDEE",`${nut.tdee} kcal`,C.gold],["🔻 Metimas",`${nut.lose} kcal`,C.red],["Baltymai (met.)",`${nut.protLose} g`,"#f87171"],["🔺 Auginimas",`${nut.gain} kcal`,C.green],["Baltymai (aug.)",`${nut.protGain} g`,"#4ade80"]].map(([l,v,col])=>(
                              <div key={l} style={{background:C.faint,borderRadius:8,padding:"8px 12px"}}>
                                <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{l}</div>
                                <div style={{fontSize:16,fontWeight:800,color:col}}>{v}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 — Program builder */}
              {step===2&&(
                <div>
                  <div style={{marginBottom:18}}><span style={css.label}>Programos pavadinimas</span><input value={programName} onChange={e=>setProgramName(e.target.value)} placeholder="pvz. Tomo 3 dienų programa" style={{...css.input,maxWidth:420}} /></div>
                  {clientForm.training_days.length===0?(
                    <div style={{...css.card,textAlign:"center",color:C.muted,padding:40}}>Grįžkite į 1 žingsnį ir pasirinkite treniruočių dienas.</div>
                  ):DAYS.filter(d=>clientForm.training_days.includes(d)).map(day=>(
                    <div key={day} style={{...css.card,marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",marginBottom:14,gap:10}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:C.gold}} />
                        <span style={{fontWeight:700,letterSpacing:"0.1em",fontSize:13,textTransform:"uppercase"}}>{day}</span>
                        <span style={{color:C.muted,fontSize:12}}>— {(program[day]||[]).length} pratimas(-ai)</span>
                        <button onClick={()=>openPick(day)} style={{...css.btnTeal,marginLeft:"auto"}}>+ Pridėti</button>
                      </div>
                      {(program[day]||[]).length===0?(
                        <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"12px 0"}}>Pratimų nėra</div>
                      ):(
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {(program[day]||[]).map((ex,idx)=>(
                            <div key={idx} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:9,padding:"8px 12px"}}>
                              <div style={{width:36,height:36,borderRadius:6,overflow:"hidden",background:C.border,flexShrink:0}}>
                                {(ex.imgs||[]).filter(Boolean)[0]?<img src={(ex.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📷</div>}
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ex.name}</div>
                                <div style={{fontSize:11,color:C.teal}}>{ex.muscle} · {ex.customSets} ser. · {ex.customReps} kart. {ex.customWeight&&`· ⚖️${ex.customWeight}`} {ex.customRest&&`· ⏱️${ex.customRest}`}</div>
                              </div>
                              <button onClick={()=>removeFromDay(day,idx)} style={css.btnRed}>🗑️</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3 — Preview */}
              {step===3&&(
                <div>
                  <div style={{...css.card,marginBottom:16,display:"flex",gap:16,alignItems:"center"}}>
                    <div style={{width:50,height:50,background:C.gold,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:C.bg,flexShrink:0}}>{(clientForm.name||"?")[0].toUpperCase()}</div>
                    <div>
                      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>{clientForm.name||"Klientas"}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                        {clientForm.age&&<span style={{fontSize:12,color:C.muted}}>Amžius: <b style={{color:C.text}}>{clientForm.age} m.</b></span>}
                        {clientForm.weight&&<span style={{fontSize:12,color:C.muted}}>Svoris: <b style={{color:C.text}}>{clientForm.weight} kg</b></span>}
                        {bmiNum&&<span style={{fontSize:12,color:C.muted}}>KMI: <b style={{color:bmiCat(bmiNum).color}}>{bmiNum}</b></span>}
                        {clientForm.goal&&<Badge label={clientForm.goal} color={C.gold} />}
                        {clientForm.level&&<Badge label={clientForm.level} color={C.teal} />}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📋 {programName||"Programa"} — {trainingDays.length} dienų</div>
                  {trainingDays.map(day=>(
                    <div key={day} style={{background:C.faint,borderRadius:9,padding:"10px 14px",marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{day}</div>
                      {(program[day]||[]).length===0?<div style={{fontSize:12,color:C.muted}}>Pratimų nėra</div>:(program[day]||[]).map((ex,i)=>(
                        <div key={i} style={{fontSize:12,color:C.text,padding:"3px 0",borderBottom:`1px solid ${C.border}`}}>
                          {i+1}. {ex.name} — {ex.customSets} ser. · {ex.customReps} kart. {ex.customWeight&&`· ⚖️${ex.customWeight}`} {ex.customRest&&`· ⏱️${ex.customRest}`}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:8}}>
                {step>1&&<button onClick={()=>setStep(s=>s-1)} style={css.btnGhost}>← Atgal</button>}
                {step<3&&<button onClick={()=>setStep(s=>s+1)} style={css.btnG}>Tęsti →</button>}
              </div>
              {step===3&&<button onClick={saveClient} disabled={saving} style={{...css.btnG,background:saving?C.teal:C.gold,color:saving?"#fff":C.bg}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti klientą"}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Exercise picker */}
      {pickDay&&(
        <div style={{...css.overlay,zIndex:300}}>
          <div style={css.modal(900)}>
            <div style={{padding:"15px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:14,color:C.gold}}>Pratimų pasirinkimas — {pickDay}</div>
              <button onClick={()=>setPickDay(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,cursor:"pointer",fontSize:15}}>×</button>
            </div>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.faint}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input value={pickSearch} onChange={e=>setPickSearch(e.target.value)} placeholder="🔍 Ieškoti..." style={{...css.input,width:180}} />
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={pickMuscle===m} onClick={()=>setPickMuscle(m)} />)}
              </div>
            </div>
            <div style={{overflowY:"auto",padding:12,flex:1}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
                {pickList.map(ex=>(
                  <div key={ex.id} onClick={()=>setPickedEx(ex)} style={{background:C.bg,borderRadius:10,border:pickedEx?.id===ex.id?`2px solid ${C.gold}`:`1px solid ${C.border}`,cursor:"pointer",overflow:"hidden",position:"relative"}}>
                    <ImgGallery imgs={ex.imgs} height={90} />
                    {pickedEx?.id===ex.id&&<div style={{position:"absolute",top:6,right:6,width:20,height:20,background:C.gold,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:C.bg,fontSize:11}}>✓</div>}
                    <div style={{padding:"8px 10px"}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.3,marginBottom:2}}>{ex.name}</div>
                      <div style={{fontSize:11,color:C.teal}}>{ex.muscle}</div>
                    </div>
                  </div>
                ))}
                {pickList.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:40}}>Pratimų nerasta</div>}
              </div>
            </div>
            {pickedEx&&(
              <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,background:C.faint,display:"flex",alignItems:"flex-end",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:100}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{pickedEx.name}</div>
                  <div style={{fontSize:11,color:C.teal,marginTop:2}}>{pickedEx.muscle}</div>
                </div>
                <div><span style={css.label}>🔁 Serijos</span><input value={pickSets} onChange={e=>setPickSets(e.target.value)} placeholder={pickedEx.sets} style={{...css.input,width:70,textAlign:"center",padding:"7px 6px"}} /></div>
                <div><span style={css.label}>💪 Kartojimai</span><input value={pickReps} onChange={e=>setPickReps(e.target.value)} placeholder={pickedEx.reps} style={{...css.input,width:85,textAlign:"center",padding:"7px 6px"}} /></div>
                <div><span style={css.label}>⚖️ Svoris (kg)</span><input value={pickWeight} onChange={e=>setPickWeight(e.target.value)} placeholder="60" style={{...css.input,width:85,textAlign:"center",padding:"7px 6px",color:C.teal}} /></div>
                <div><span style={css.label}>⏱️ Poilsis</span>
                  <select value={pickRest} onChange={e=>setPickRest(e.target.value)} style={{...css.select,width:105,padding:"7px 6px",color:C.purple}}>
                    <option value="">—</option>
                    {REST_OPTIONS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <button onClick={addToDay} style={{...css.btnG,alignSelf:"flex-end"}}>Pridėti +</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete client */}
      {confirmDel&&(
        <div style={css.overlay}>
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.redBorder}`,padding:30,maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 50px #00000055"}}>
            <div style={{fontSize:34,marginBottom:12}}>🗑️</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8,color:C.text}}>Ištrinti klientą?</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:24}}>„{confirmDel.name}" ir visa pažangos istorija bus ištrinta.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={()=>delClient(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [loggedIn,setLoggedIn] = useState(()=>sessionStorage.getItem("cm_auth")==="1");
  const [tab,setTab]           = useState("exercises");
  const [exercises,setExercises] = useState([]);
  const [exLoading,setExLoading] = useState(true);

  const handleLogin = () => { sessionStorage.setItem("cm_auth","1"); setLoggedIn(true); };
  const handleLogout= () => { sessionStorage.removeItem("cm_auth"); setLoggedIn(false); };

  // Load exercises once for use in both tabs
  useEffect(()=>{
    if(!loggedIn) return;
    sb.get("exercises","?order=name").then(data=>{ setExercises(data); setExLoading(false); }).catch(()=>setExLoading(false));
  },[loggedIn]);

  // printData is set by ClientsTab via a shared ref trick - we use window
  const [printData,setPrintData] = useState(null);

  // expose setPrintData globally so ClientsTab can call it
  useEffect(()=>{ window.__setPrintData = setPrintData; },[]);

  if(!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={css.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;}body{margin:0;}`}</style>
      <style>{PRINT_STYLES}</style>
      <PrintView client={printData?.client} program={printData?.program} programName={printData?.programName} progressList={printData?.progressList} />

      {/* HEADER */}
      <div style={css.header}>
        <div style={css.logo}>M</div>
        <div>
          <div style={{fontWeight:800,fontSize:16,color:C.gold}}>Coach Martynas</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase",marginTop:1}}>Sporto programų sistema</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <button style={css.navBtn(tab==="exercises")} onClick={()=>setTab("exercises")}>🏋️ Pratimai</button>
          <button style={css.navBtn(tab==="clients")}   onClick={()=>setTab("clients")}>👥 Klientai</button>
          <button onClick={handleLogout} style={{...css.btnGhost,fontSize:11,padding:"6px 12px",marginLeft:8}}>🚪 Atsijungti</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px"}}>
        {tab==="exercises" && <ExercisesTab />}
        {tab==="clients"   && <ClientsTab exercises={exercises} />}
      </div>
    </div>
  );
}
