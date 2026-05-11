// ── shared.tsx — DNA Trainer · Architectural Dark theme ──
export const SUPABASE_URL = "https://wtsksjyayilyyudvizsx.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c2tzanlheWlseXl1ZHZpenN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjI3NzgsImV4cCI6MjA5MzUzODc3OH0.wxlA05-VNVfsTe-630pQXYSewpDWII_AnOK2SIGEy7E";
export const sb = {
  headers: { "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, Prefer:"return=representation" },
  url:(t:string,q="")=>`${SUPABASE_URL}/rest/v1/${t}${q}`,
  async get(t:string,q=""){const r=await fetch(sb.url(t,q),{headers:sb.headers});if(!r.ok)throw new Error(await r.text());return r.json();},
  async insert(t:string,d:any){const r=await fetch(sb.url(t),{method:"POST",headers:sb.headers,body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
  async update(t:string,id:any,d:any){const r=await fetch(sb.url(t,`?id=eq.${id}`),{method:"PATCH",headers:{...sb.headers,Prefer:"return=representation"},body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
  async delete(t:string,id:any){const r=await fetch(sb.url(t,`?id=eq.${id}`),{method:"DELETE",headers:sb.headers});if(!r.ok)throw new Error(await r.text());},
};

export const APP_PASSWORD = "coach2024";
export const ALL_MUSCLES  = ["Krūtinė","Nugara","Kojos","Pečiai","Bicepsas","Tricepsas","Pilvas"];
export const GOALS        = ["Raumenų auginimas","Riebalų deginimas","Jėgos ugdymas","Ištvermė","Reabilitacija","Sveikata"];
export const LEVELS       = ["Pradedantysis","Vidutinis","Pažengęs"];
export const DAYS         = ["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis","Sekmadienis"];
export const REST_OPTIONS = ["30 sek","45 sek","60 sek","90 sek","2 min","3 min","4 min","5 min"];
export const MEAL_TIMES   = ["🌅 Pusryčiai","☀️ Priešpiečiai","🍽️ Pietūs","🌤️ Užkandis","🌙 Vakarienė"];
export const FOOD_CATS    = ["Mėsa & Žuvis","Grūdai & Kruopos","Daržovės","Vaisiai","Pieno produktai","Kiaušiniai","Riešutai & Sėklos","Ankštiniai","Sveiki riebalai","Kita"];
export const ACTIVITY_LEVELS = [
  {label:"Sėdimas darbas (mažai judėjimo)",factor:1.2},
  {label:"Lengvas aktyvumas (1–3 dienos/sav.)",factor:1.375},
  {label:"Vidutinis aktyvumas (3–5 dienos/sav.)",factor:1.55},
  {label:"Didelis aktyvumas (6–7 dienos/sav.)",factor:1.725},
  {label:"Profesionalus sportininkas",factor:1.9},
];

// ── ARCHITECTURAL DARK THEME ─────────────────────────────
export const C = {
  bg:"#060709",surface:"#0E1016",surface2:"#121520",border:"#1E2430",
  gold:"#D4A853",goldSoft:"#D4A85315",goldBorder:"#D4A85340",
  teal:"#5B8DB8",tealSoft:"#5B8DB812",tealBorder:"#5B8DB838",
  red:"#C05050",redSoft:"#C0505012",redBorder:"#C0505038",
  green:"#4E9068",greenSoft:"#4E906812",greenBorder:"#4E906838",
  purple:"#7B6DB0",purpleSoft:"#7B6DB012",purpleBorder:"#7B6DB038",
  text:"#FFFFFF",muted:"#8A9AAA",faint:"#080A0F",
};

export const FONT = "'Barlow','Helvetica Neue',sans-serif";
export const DISPLAY_FONT = "'Bebas Neue',sans-serif";
export const CONDENSED_FONT = "'Barlow Condensed','Helvetica Neue',sans-serif";

// Wallpaper used in hero / callout sections
export const HERO_IMG = "https://images.unsplash.com/photo-1549476464-37392f717541?w=1600&q=90";
export const GYM_IMG2 = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80";
export const GYM_IMG3 = "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80";

export const RESPONSIVE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;} body{margin:0;background:#060709;font-size:14px;}
  input,select,textarea{font-size:14px!important;}

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes skelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes aiPulse{0%,100%{opacity:.4}50%{opacity:1}}

  .fu {animation:fadeUp .4s ease both;}
  .fu1{animation:fadeUp .4s .07s ease both;}
  .fu2{animation:fadeUp .4s .14s ease both;}
  .fu3{animation:fadeUp .4s .21s ease both;}
  .fu4{animation:fadeUp .4s .28s ease both;}

  /* ── GRIDS ── */
  .ex-grid  {display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1px;background:#141820;}
  .cl-grid  {display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1px;background:#141820;}
  .food-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:#141820;}
  .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid #141820;border-bottom:1px solid #141820;}
  .dash-bottom{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:0;border-top:1px solid #141820;}
  .cf-grid  {display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .macro-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
  .ex2-grid {display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .food4-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;}
  .step-nav {display:flex;gap:4px;}
  .pick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:8px;}
  .pick-row {display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid #141820;background:#060709;}
  .view-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .view-actions button{flex:1;min-width:100px;}
  .meal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1px;background:#141820;}

  /* ── SECTION HEADINGS ── */
  .sec-heading{
    font-family:'Bebas Neue',sans-serif;
    font-size:42px;
    color:#F5F0E8;
    letter-spacing:0.04em;
    line-height:1;
    margin-bottom:20px;
  }
  .sec-eyebrow{
    display:flex;align-items:center;gap:10px;margin-bottom:10px;
  }
  .sec-eyebrow-num{
    font-family:'Bebas Neue',sans-serif;font-size:10px;
    color:#D4A853;letter-spacing:0.3em;
  }
  .sec-eyebrow-line{width:24px;height:1px;background:#D4A853;}

  /* ── NAV ── */
  .arch-nav-btn{
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;
    letter-spacing:0.16em;text-transform:uppercase;color:#505868;
    cursor:pointer;border:none;background:transparent;
    padding:0 0 2px;border-bottom:1px solid transparent;
    transition:color .2s,border-color .2s;
  }
  .arch-nav-btn:hover,.arch-nav-btn.active{color:#D4A853;border-bottom-color:#D4A853;}

  /* ── TABLE/LIST ROWS ── */
  .arch-row{
    border-top:1px solid #141820;
    transition:background .15s,padding-left .2s;
    cursor:pointer;
  }
  .arch-row:hover{background:rgba(212,168,83,0.05);padding-left:6px;}

  .arch-session-row{
    padding:13px 0;border-top:1px solid #141820;
    display:flex;align-items:center;gap:14px;cursor:pointer;
    transition:padding-left .2s;
  }
  .arch-session-row:hover{padding-left:8px;}

  /* ── STAT BLOCKS ── */
  .arch-stat-block{
    padding:22px 28px;border-right:1px solid #141820;
    transition:background .2s;
  }
  .arch-stat-block:last-child{border-right:none;}
  .arch-stat-block:hover{background:rgba(212,168,83,0.04);}

  /* ── EXERCISE/CLIENT CARDS ── */
  .arch-card{
    background:#060709;
    transition:background .2s;
    cursor:pointer;
  }
  .arch-card:hover{background:#0C0E13;}

  /* ── BUTTONS ── */
  .arch-btn-primary{
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;
    letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;
    background:#D4A853;color:#060709;border:1px solid #D4A853;
    padding:11px 20px;transition:filter .2s;
  }
  .arch-btn-primary:hover{filter:brightness(1.12);}
  .arch-btn-ghost{
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;
    letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;
    background:transparent;color:#C0B8A8;border:1px solid #141820;
    padding:10px 18px;transition:all .2s;
  }
  .arch-btn-ghost:hover{border-color:#D4A85360;color:#D4A853;}

  /* ── INPUTS ── */
  .arch-input{
    width:100%;background:#060709;
    border-top:none;border-left:none;border-right:none;
    border-bottom:1px solid #141820;
    padding:10px 0;color:#F5F0E8;
    font-family:'Barlow',sans-serif;font-size:14px;
    outline:none;transition:border-color .2s;
    box-sizing:border-box;
  }
  .arch-input:focus{border-bottom-color:#D4A853;}
  .arch-input::placeholder{color:#303848;}

  /* ── SEARCH/TAG BAR ── */
  .search-btn:hover{border-color:#D4A853 !important;color:#D4A853 !important;}
  .sbar{font-family:'Barlow Condensed',sans-serif!important;letter-spacing:0.06em;}
  .tag-row{overflow-x:auto;padding-bottom:4px;}
  .tag-row::-webkit-scrollbar{height:2px;}
  .tag-row::-webkit-scrollbar-thumb{background:#141820;}

  /* ── MOBILE ── */
  .bottom-nav{display:none;}
  @media(max-width:640px){
    .ex-grid{grid-template-columns:repeat(2,1fr);}
    .cl-grid,.food-grid{grid-template-columns:1fr;}
    .dash-stats{grid-template-columns:repeat(2,1fr);}
    .dash-bottom{grid-template-columns:1fr;}
    .cf-grid{grid-template-columns:1fr;}
    .ex2-grid{grid-template-columns:1fr 1fr;}
    .food4-grid{grid-template-columns:1fr 1fr;}
    .pick-row{gap:8px;padding:10px 14px;}
    .pick-row>div{min-width:calc(50% - 4px);}
    .pick-row>button{width:100%;margin-top:4px;}
    .step-nav button{padding:5px 7px!important;font-size:10px!important;}
    .view-actions button{min-width:unset;font-size:11px;}
    .logout-label{display:none;}
    .header-pad{padding:10px 14px!important;}
    .content-pad{padding:16px 12px!important;}
    .hsubtitle{display:none;}
    .day-btns{display:grid!important;grid-template-columns:repeat(4,1fr);gap:6px!important;}
    .meal-grid{grid-template-columns:1fr;}
    .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:#0C0E13;border-top:1px solid #141820;z-index:200;padding:6px 0 calc(6px + env(safe-area-inset-bottom));justify-content:space-around;align-items:center;}
    .bottom-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 10px;cursor:pointer;min-width:52px;transition:background .15s;}
    .bottom-nav-item.active{background:rgba(212,168,83,0.1);}
    .bottom-nav-icon{font-size:20px;line-height:1;}
    .bottom-nav-label{font-size:9px;color:#505868;letter-spacing:0.06em;font-weight:600;text-transform:uppercase;}
    .bottom-nav-item.active .bottom-nav-label{color:#D4A853;}
    .content-pad{padding-bottom:calc(80px + env(safe-area-inset-bottom))!important;}
    .header-nav-items{display:none!important;}
    .sec-heading{font-size:32px!important;}
  }
  @media(min-width:641px) and (max-width:960px){
    .cl-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));}
    .cf-grid{grid-template-columns:1fr;}
    .dash-stats{grid-template-columns:repeat(2,1fr);}
    .dash-bottom{grid-template-columns:1fr;}
  }
  @media(hover:none){button{min-height:40px;}}
`;

// ── STYLE HELPERS ────────────────────────────────────────
export const css = {
  page:    {minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT},
  header:  {background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 28px",height:62,display:"flex",alignItems:"center",gap:14},
  logo:    {width:34,height:34,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:C.bg,flexShrink:0},
  card:    {background:C.surface,border:`1px solid ${C.border}`,padding:24},
  label:   {fontSize:9,color:"#A0B0C0",letterSpacing:"0.2em",marginBottom:6,display:"block",fontWeight:600,textTransform:"uppercase" as const,fontFamily:CONDENSED_FONT},
  input:   {width:"100%",background:C.faint,borderTop:"none",borderLeft:"none",borderRight:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 0",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const,transition:"border-color .2s"},
  select:  {width:"100%",background:C.faint,border:`1px solid ${C.border}`,padding:"10px 14px",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const},
  navBtn:  (a:boolean)=>({
    fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase" as const,
    padding:"6px 14px",background:a?C.gold:"transparent",color:a?C.bg:C.muted,
    border:`1px solid ${a?C.gold:"transparent"}`,cursor:"pointer",transition:"all .15s",
  }),
  btnG:    {padding:"11px 20px",background:C.gold,color:C.bg,border:"none",fontFamily:CONDENSED_FONT,fontWeight:700,fontSize:11,cursor:"pointer",letterSpacing:"0.16em",textTransform:"uppercase" as const},
  btnGhost:{padding:"10px 18px",background:"transparent",color:"#B0C0D0",border:`1px solid ${C.border}`,fontFamily:CONDENSED_FONT,fontWeight:600,fontSize:11,cursor:"pointer",letterSpacing:"0.12em",textTransform:"uppercase" as const},
  btnTeal: {padding:"9px 14px",background:C.tealSoft,color:C.teal,border:`1px solid ${C.tealBorder}`,fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase" as const},
  btnRed:  {padding:"9px 14px",background:C.redSoft,color:C.red,border:`1px solid ${C.redBorder}`,fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase" as const},
  btnGreen:{padding:"9px 14px",background:C.greenSoft,color:C.green,border:`1px solid ${C.greenBorder}`,fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase" as const},
  secTitle:{fontFamily:DISPLAY_FONT,fontSize:36,color:C.text,letterSpacing:"0.04em",marginBottom:0,display:"block",lineHeight:1},
  overlay: {position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:8,backdropFilter:"blur(8px)"},
  modal:   (w:number)=>({background:C.surface,border:`1px solid ${C.border}`,width:"100%",maxWidth:w||520,maxHeight:"93vh",display:"flex",flexDirection:"column" as const,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,0.8)"}),
};

// ── SECTION HEADER HELPER ────────────────────────────────
export function SectionHead({num,title,action,actionLabel}:{num:string,title:string,action?:()=>void,actionLabel?:string}){
  return(
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:10,color:C.gold,letterSpacing:"0.3em"}}>{num}</span>
        <div style={{width:24,height:1,background:C.gold}}/>
        {action&&<button onClick={action} style={{...css.btnGhost,marginLeft:"auto",padding:"5px 12px",fontSize:10}}>{actionLabel}</button>}
      </div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:"#FFFFFF",letterSpacing:"0.04em",lineHeight:1}}>{title}</div>
    </div>
  );
}

export function calcBMI(w:string,h:string){if(!w||!h)return null;return parseFloat(w)/Math.pow(parseFloat(h)/100,2);}
export function bmiCat(b:number){if(b<18.5)return{label:"Nepakankamas",color:"#60a5fa"};if(b<25)return{label:"Normalus",color:"#22c55e"};if(b<30)return{label:"Antsvoris",color:"#f59e0b"};return{label:"Nutukimas",color:"#ef4444"};}
export function calcNut(w:string,h:string,age:string,gender:string,act:number){
  const wf=parseFloat(w),hf=parseFloat(h),af=parseFloat(age)||25;
  if(!wf||!hf)return null;
  const bmr=gender==="Moteris"?10*wf+6.25*hf-5*af-161:10*wf+6.25*hf-5*af+5;
  const tdee=Math.round(bmr*act);
  const lose=Math.round(tdee-500),gain=Math.round(tdee+300);
  const protLose=Math.round(wf*2.2),protGain=Math.round(wf*1.8);
  const fatLose=Math.round(lose*0.25/9),fatGain=Math.round(gain*0.25/9);
  const carbLose=Math.max(0,Math.round((lose-protLose*4-fatLose*9)/4));
  const carbGain=Math.max(0,Math.round((gain-protGain*4-fatGain*9)/4));
  return{tdee,lose,gain,protLose,protGain,fatLose,fatGain,carbLose,carbGain};
}
export function genToken(){return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}
export function getCoachId():string|null{try{const s=JSON.parse(sessionStorage.getItem("dna_session")||"null");return s?.id||null;}catch{return null;}}
export function getIsAdmin():boolean{try{const s=JSON.parse(sessionStorage.getItem("dna_session")||"null");return s?.role==="admin";}catch{return false;}}

import { useState, useRef } from "react";

export const Tag=({c,label,active,onClick}:any)=>(
  <button onClick={onClick} style={{padding:"4px 12px",border:active?`1px solid ${c}`:`1px solid ${C.border}`,background:active?c+"18":"transparent",color:active?c:C.muted,fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,cursor:"pointer",fontWeight:700,flexShrink:0,letterSpacing:"0.12em",textTransform:"uppercase" as const,transition:"all .15s"}}>{label}</button>
);
export const Badge=({label,color}:any)=><span style={{background:color+"15",border:`1px solid ${color}40`,padding:"2px 10px",color,fontSize:10,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase" as const}}>{label}</span>;
export const Spinner=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,color:C.muted,fontSize:12,gap:12,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.14em",textTransform:"uppercase"}}><div style={{width:18,height:18,border:`1px solid ${C.border}`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Kraunama</div>;
export const Skeleton=({w="100%",h=16,radius=2}:{w?:string|number,h?:number,radius?:number})=>(
  <div style={{width:w,height:h,borderRadius:radius,background:`linear-gradient(90deg,${C.border} 25%,${C.surface2} 50%,${C.border} 75%)`,backgroundSize:"200% 100%",animation:"skelShimmer 1.5s infinite"}}/>
);
export const SkeletonCard=()=>(
  <div style={{background:C.surface,border:`1px solid ${C.border}`}}>
    <div style={{height:120,background:C.border}}/>
    <div style={{padding:"14px 16px",display:"flex",flexDirection:"column" as const,gap:8}}>
      <Skeleton w="55%" h={12}/><Skeleton w="75%" h={8}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:4}}>
        {[0,1,2].map(i=><Skeleton key={i} w="100%" h={8}/>)}
      </div>
    </div>
  </div>
);
export const Err=({msg}:any)=>msg?<div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,padding:"10px 16px",fontSize:12,color:C.red,marginBottom:14,fontFamily:"'Barlow',sans-serif",letterSpacing:"0.04em"}}>{msg}</div>:null;
export const NutriBadge=({kcal,p,c,f}:any)=>(
  <div style={{display:"flex",gap:5,flexWrap:"wrap" as const}}>
    {kcal&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,padding:"2px 8px",fontSize:9,fontWeight:700,color:C.gold,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>{kcal} kcal</span>}
    {p&&<span style={{background:"#ef444412",border:"1px solid #ef444438",padding:"2px 8px",fontSize:9,fontWeight:600,color:"#f87171",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>P:{p}g</span>}
    {c&&<span style={{background:"#f9731612",border:"1px solid #f9731638",padding:"2px 8px",fontSize:9,fontWeight:600,color:"#fb923c",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>C:{c}g</span>}
    {f&&<span style={{background:C.purpleSoft,border:"1px solid #a78bfa38",padding:"2px 8px",fontSize:9,fontWeight:600,color:C.purple,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>F:{f}g</span>}
  </div>
);

export function ImgGallery({imgs,height=140}:{imgs:string[],height?:number}){
  const [cur,setCur]=useState(0);
  const list=(imgs||[]).filter(Boolean);
  if(!list.length)return<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#2A3040",fontSize:28,background:C.faint}}>📷</div>;
  return(
    <div style={{position:"relative",height,overflow:"hidden",background:C.faint}}>
      <img src={list[cur]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>(e.target as HTMLImageElement).style.display="none"}/>
      {list.length>1&&<>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p-1+list.length)%list.length);}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:24,height:24,background:"rgba(0,0,0,0.7)",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>‹</button>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%list.length);}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:24,height:24,background:"rgba(0,0,0,0.7)",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>›</button>
        <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
          {list.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setCur(i);}} style={{width:5,height:5,background:i===cur?"white":"rgba(255,255,255,0.3)",cursor:"pointer"}}/>)}
        </div>
      </>}
    </div>
  );
}

export function MultiImgUploader({imgs,onChange}:{imgs:string[],onChange:any}){
  const fileRef=useRef<HTMLInputElement>(null);
  const urlRef=useRef<HTMLInputElement>(null);
  const addFile=(e:any)=>{Array.from(e.target.files).forEach((f:any)=>{const r=new FileReader();r.onload=ev=>onChange((p:string[])=>[...p,(ev.target as any).result]);r.readAsDataURL(f);});e.target.value="";};
  const addUrl=()=>{const v=urlRef.current?.value?.trim();if(v&&!imgs.includes(v)){onChange((p:string[])=>[...p,v]);if(urlRef.current)urlRef.current.value="";}};
  const remove=(i:number)=>onChange((p:string[])=>p.filter((_,j)=>j!==i));
  const moveL=(i:number)=>{if(i===0)return;const a=[...imgs];[a[i-1],a[i]]=[a[i],a[i-1]];onChange(()=>a);};
  const moveR=(i:number)=>{if(i===imgs.length-1)return;const a=[...imgs];[a[i],a[i+1]]=[a[i+1],a[i]];onChange(()=>a);};
  return(
    <div>
      <span style={css.label}>Nuotraukos</span>
      {imgs.length>0&&(<div style={{display:"flex",gap:6,flexWrap:"wrap" as const,marginBottom:10}}>
        {imgs.map((src,i)=>(<div key={i} style={{position:"relative",width:82,height:66,overflow:"hidden",border:`2px solid ${i===0?C.gold:C.border}`,flexShrink:0}}>
          <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          {i===0&&<div style={{position:"absolute",bottom:2,left:2,background:C.gold,padding:"1px 4px",fontSize:7,fontWeight:700,color:C.bg,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>COVER</div>}
          <div style={{position:"absolute",top:2,right:2,display:"flex",gap:2}}>
            {i>0&&<button onClick={()=>moveL(i)} style={{width:14,height:14,background:"#000a",border:"none",color:"white",fontSize:8,cursor:"pointer"}}>←</button>}
            {i<imgs.length-1&&<button onClick={()=>moveR(i)} style={{width:14,height:14,background:"#000a",border:"none",color:"white",fontSize:8,cursor:"pointer"}}>→</button>}
            <button onClick={()=>remove(i)} style={{width:14,height:14,background:"#ef4444aa",border:"none",color:"white",fontSize:8,cursor:"pointer"}}>×</button>
          </div>
        </div>))}
        <div onClick={()=>fileRef.current?.click()} style={{width:82,height:66,border:`1px dashed ${C.border}`,display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontSize:9,gap:2,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>
          <span style={{fontSize:16}}>+</span>PRIDĖTI
        </div>
      </div>)}
      {imgs.length===0&&<div onClick={()=>fileRef.current?.click()} style={{height:64,border:`1px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,gap:8,marginBottom:10,fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.12em"}}>📷 SPUSTELĖKITE, KAD ĮKELTUMĖTE</div>}
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} style={{display:"none"}}/>
      <div style={{display:"flex",gap:8}}>
        <input ref={urlRef} placeholder="Arba įklijuokite URL..." style={{...css.input,flex:1,fontSize:12}} onKeyDown={e=>e.key==="Enter"&&addUrl()}/>
        <button onClick={addUrl} style={{...css.btnTeal,padding:"10px 14px",fontSize:16,fontWeight:800}}>+</button>
      </div>
    </div>
  );
}
