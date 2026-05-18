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
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
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
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;
    letter-spacing:0.14em;text-transform:uppercase;
    cursor:pointer;border:none;
    padding:6px 14px;border-radius:8px;
    transition:all .12s ease;
    position:relative;top:0;
  }
  .arch-nav-btn:not(.active){background:transparent;color:#6A7A8A;}
  .arch-nav-btn:not(.active):hover{background:rgba(212,168,83,0.1);color:#D4A853;}
  .arch-nav-btn.active{
    background:linear-gradient(145deg,#E8BE6A,#B8902A);
    color:#1A0E00;
    box-shadow:0 4px 0 #7A5A10,0 6px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2);
  }

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
    cursor:pointer;
  }
  .arch-stat-block:last-child{border-right:none;}
  .arch-stat-block:hover{background:rgba(212,168,83,0.06);}

  /* ── EXERCISE/CLIENT CARDS ── */
  .arch-card{
    background:#060709;
    transition:all .2s;
    cursor:pointer;
  }
  .arch-card:hover{background:#0C0E13;transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(212,168,83,0.15);}

  /* ── 3D BUTTONS ── */
  button{transition:all .12s ease;position:relative;top:0;}
  button:active{transform:translateY(3px) !important;top:3px !important;}

  .arch-btn-primary{
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;
    letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;
    background:linear-gradient(145deg,#E8BE6A,#B8902A);
    color:#1A0E00;border:none;
    padding:11px 20px;border-radius:10px;
    box-shadow:0 6px 0 #7A5A10,0 8px 16px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.25);
    transition:all .12s ease;
  }
  .arch-btn-primary:hover{filter:brightness(1.08);}
  .arch-btn-primary:active{box-shadow:0 2px 0 #7A5A10,0 3px 8px rgba(0,0,0,0.4) !important;}
  .arch-btn-ghost{
    font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;
    letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;
    background:linear-gradient(145deg,#1E2535,#141820);
    color:#C0D0E0;border:1px solid #2A3545;
    padding:10px 18px;border-radius:10px;
    box-shadow:0 4px 0 #0A0E14,0 6px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06);
    transition:all .12s ease;
  }
  .arch-btn-ghost:hover{color:#D4A853;border-color:#D4A85360;}
  .arch-btn-ghost:active{box-shadow:0 1px 0 #0A0E14,0 2px 6px rgba(0,0,0,0.3) !important;}

  /* ── BOTTOM NAV ACTIVE GLOW ── */
  .bottom-nav-item.active .bottom-nav-icon{filter:drop-shadow(0 0 6px #D4A853);}

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
  .arch-input:focus{border-bottom-color:#D4A853;box-shadow:0 4px 12px rgba(212,168,83,0.15);}
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
    /* Safe area padding for notch/status bar */
    body{
      padding-top:env(safe-area-inset-top);
      background:#060709;
    }

    /* Header — full width, safe area aware */
    .header-pad{
      padding-top:calc(env(safe-area-inset-top) + 8px) !important;
      padding-left:16px !important;
      padding-right:16px !important;
      height:auto !important;
      min-height:calc(52px + env(safe-area-inset-top)) !important;
    }

    /* Content area */
    .content-pad{
      padding:calc(62px + env(safe-area-inset-top)) 0 calc(80px + env(safe-area-inset-bottom)) !important;
      max-width:100% !important;
    }

    /* Hero section */
    .hero-section{min-height:200px !important;}
    .hero-section .hero-inner{padding:20px 16px !important;}
    .hero-title{font-size:48px !important;}

    /* Quick action buttons — full width stacked */
    .hero-actions{
      display:flex !important;
      flex-direction:column !important;
      gap:8px !important;
      width:100% !important;
    }
    .hero-actions button{
      width:100% !important;
      padding:14px !important;
      font-size:12px !important;
      justify-content:center !important;
    }

    /* Stats grid — 2x2 clean */
    .dash-stats{
      grid-template-columns:1fr 1fr !important;
    }
    .arch-stat-block{
      padding:16px 14px !important;
    }
    .arch-stat-block .stat-num{
      font-size:40px !important;
    }

    /* Dashboard bottom — single column */
    .dash-bottom{grid-template-columns:1fr !important;}

    /* Cards */
    .cl-grid{grid-template-columns:1fr !important;}
    .ex-grid{grid-template-columns:repeat(2,1fr) !important;}
    .food-grid{grid-template-columns:1fr !important;}
    .cf-grid{grid-template-columns:1fr !important;}
    .macro-grid{grid-template-columns:1fr 1fr 1fr !important;}
    .meal-grid{grid-template-columns:1fr !important;}

    /* Forms */
    .ex2-grid{grid-template-columns:1fr 1fr !important;}
    .food4-grid{grid-template-columns:1fr 1fr !important;}
    .pick-row{gap:8px;padding:10px 14px;}
    .pick-row>div{min-width:calc(50% - 4px);}
    .pick-row>button{width:100%;margin-top:4px;}
    .step-nav button{padding:5px 7px!important;font-size:10px!important;}
    .view-actions button{min-width:unset;font-size:11px;}
    .day-btns{display:grid!important;grid-template-columns:repeat(4,1fr);gap:6px!important;}

    /* Modals — full screen on mobile */
    .modal-inner{
      max-height:100vh !important;
      border-radius:0 !important;
      margin:0 !important;
      width:100% !important;
    }

    /* Hide desktop labels */
    .logout-label{display:none;}
    .hsubtitle{display:none;}
    .header-nav-items{display:none !important;}

    /* Section headings smaller */
    .sec-heading{font-size:28px !important;}

    /* Bottom navigation */
    .bottom-nav{
      display:flex;
      position:fixed;
      bottom:0;left:0;right:0;
      background:#0C0E13;
      border-top:1px solid #1E2430;
      z-index:200;
      padding:6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content:space-around;
      align-items:center;
    }
    .bottom-nav-item{
      display:flex;flex-direction:column;
      align-items:center;gap:2px;
      padding:6px 8px;cursor:pointer;
      min-width:44px;
      transition:background .15s;
      flex:1;
    }
    .bottom-nav-item.active{background:rgba(212,168,83,0.12);}
    .bottom-nav-icon{font-size:22px;line-height:1;}
    .bottom-nav-label{
      font-size:9px;color:#505868;
      letter-spacing:0.04em;font-weight:600;
      text-transform:uppercase;
      font-family:'Barlow Condensed',sans-serif;
      white-space:nowrap;
    }
    .bottom-nav-item.active .bottom-nav-label{color:#D4A853;}

    /* Touch targets */
    button{min-height:44px;}
    input,select,textarea{
      font-size:16px !important;
      min-height:44px;
    }

    /* Prevent tap highlight */
    *{-webkit-tap-highlight-color:transparent;}
  }

  @media(min-width:641px) and (max-width:960px){
    .cl-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));}
    .cf-grid{grid-template-columns:1fr;}
    .dash-stats{grid-template-columns:repeat(2,1fr);}
    .dash-bottom{grid-template-columns:1fr;}
  }
  @media(hover:none){button{min-height:44px;}}
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
    fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase" as const,
    padding:"6px 14px",borderRadius:"8px",
    background:a?"linear-gradient(145deg,#E8BE6A,#B8902A)":"transparent",
    color:a?"#1A0E00":C.muted,
    border:"none",cursor:"pointer",transition:"all .12s ease",
    boxShadow:a?"0 4px 0 #7A5A10,0 6px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2)":"none",
    position:"relative" as const,top:0,
  }),
  btnG:    {
    padding:"11px 22px",
    background:"linear-gradient(145deg,#E8BE6A,#B8902A)",
    color:"#1A0E00",
    border:"none",
    fontFamily:CONDENSED_FONT,fontWeight:800,fontSize:11,
    cursor:"pointer",letterSpacing:"0.16em",textTransform:"uppercase" as const,
    borderRadius:"10px",
    boxShadow:"0 6px 0 #7A5A10, 0 8px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
    transition:"all .12s ease",
    position:"relative" as const,
    top:0,
  },
  btnGhost:{
    padding:"10px 18px",
    background:"linear-gradient(145deg,#1E2535,#141820)",
    color:"#C0D0E0",
    border:"1px solid #2A3545",
    fontFamily:CONDENSED_FONT,fontWeight:600,fontSize:11,
    cursor:"pointer",letterSpacing:"0.12em",textTransform:"uppercase" as const,
    borderRadius:"10px",
    boxShadow:"0 4px 0 #0A0E14, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
    transition:"all .12s ease",
    position:"relative" as const,
    top:0,
  },
  btnTeal: {
    padding:"9px 16px",
    background:"linear-gradient(145deg,#3A7A9A,#1E5068)",
    color:"#A0E0F8",
    border:"none",
    fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,
    letterSpacing:"0.1em",textTransform:"uppercase" as const,
    borderRadius:"10px",
    boxShadow:"0 4px 0 #0E2A38, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    transition:"all .12s ease",
    position:"relative" as const,
    top:0,
  },
  btnRed:  {
    padding:"9px 16px",
    background:"linear-gradient(145deg,#D05060,#902030)",
    color:"#FFD0D8",
    border:"none",
    fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,
    letterSpacing:"0.1em",textTransform:"uppercase" as const,
    borderRadius:"10px",
    boxShadow:"0 4px 0 #500010, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    transition:"all .12s ease",
    position:"relative" as const,
    top:0,
  },
  btnGreen:{
    padding:"9px 16px",
    background:"linear-gradient(145deg,#3A8858,#206038)",
    color:"#A0F0C0",
    border:"none",
    fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,
    letterSpacing:"0.1em",textTransform:"uppercase" as const,
    borderRadius:"10px",
    boxShadow:"0 4px 0 #0A3018, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    transition:"all .12s ease",
    position:"relative" as const,
    top:0,
  },
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
  <button onClick={onClick} style={{
    padding:"5px 14px",
    border:"none",
    background:active?`linear-gradient(145deg,${c}DD,${c}99)`:"linear-gradient(145deg,#1E2535,#141820)",
    color:active?"#fff":C.muted,
    fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,cursor:"pointer",fontWeight:700,
    flexShrink:0,letterSpacing:"0.12em",textTransform:"uppercase" as const,
    borderRadius:"8px",
    boxShadow:active?`0 4px 0 ${c}55,0 6px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2)`:"0 3px 0 #0A0E14,0 4px 8px rgba(0,0,0,0.3)",
    transition:"all .12s ease",
    position:"relative" as const,top:0,
  }}>{label}</button>
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
  if(!list.length)return<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#2A3040",fontSize:28,background:C.faint,flexDirection:"column" as const,gap:6}}><span>📷</span><span style={{fontSize:9,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:C.muted}}>Nuotraukų nėra</span></div>;
  return(
    <div style={{position:"relative",height,overflow:"hidden",background:C.faint}}>
      <img src={list[cur]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity .2s"}} onError={e=>(e.target as HTMLImageElement).style.opacity="0.2"}/>
      {list.length>1&&<>
        {/* Counter badge */}
        <div style={{position:"absolute" as const,top:8,right:8,background:"rgba(0,0,0,0.7)",padding:"2px 8px",fontSize:9,color:"white",fontFamily:CONDENSED_FONT,letterSpacing:"0.1em"}}>{cur+1}/{list.length}</div>
        {/* Prev/next buttons */}
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p-1+list.length)%list.length);}} style={{position:"absolute" as const,left:0,top:0,bottom:0,width:36,background:"linear-gradient(to right,rgba(0,0,0,0.4),transparent)",border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:8}}>‹</button>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%list.length);}} style={{position:"absolute" as const,right:0,top:0,bottom:0,width:36,background:"linear-gradient(to left,rgba(0,0,0,0.4),transparent)",border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}>›</button>
        {/* Dot indicators */}
        <div style={{position:"absolute" as const,bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
          {list.map((_,i)=>(
            <div key={i} onClick={e=>{e.stopPropagation();setCur(i);}} style={{width:i===cur?16:5,height:5,background:i===cur?C.gold:"rgba(255,255,255,0.4)",cursor:"pointer",transition:"all .2s"}}/>
          ))}
        </div>
      </>}
    </div>
  );
}

export function MultiImgUploader({imgs,onChange,maxImgs=4}:{imgs:string[],onChange:any,maxImgs?:number}){
  const fileRef=useRef<HTMLInputElement>(null);
  const urlRef=useRef<HTMLInputElement>(null);
  const [showUrl,setShowUrl]=useState(false);
  const [dragging,setDragging]=useState<number|null>(null);
  const [dragOver,setDragOver]=useState<number|null>(null);

  const addFile=(e:any)=>{
    const files=Array.from(e.target.files) as File[];
    const remaining=maxImgs-(imgs||[]).length;
    files.slice(0,remaining).forEach((f:File)=>{
      const r=new FileReader();
      r.onload=ev=>onChange((p:string[])=>[...(p||[]),(ev.target as any).result]);
      r.readAsDataURL(f);
    });
    e.target.value="";
  };

  const addUrl=()=>{
    const v=urlRef.current?.value?.trim();
    if(v&&!(imgs||[]).includes(v)&&(imgs||[]).length<maxImgs){
      onChange((p:string[])=>[...(p||[]),v]);
      if(urlRef.current)urlRef.current.value="";
      setShowUrl(false);
    }
  };

  const remove=(i:number)=>onChange((p:string[])=>p.filter((_:string,j:number)=>j!==i));

  const moveL=(i:number)=>{if(i===0)return;const a=[...(imgs||[])];[a[i-1],a[i]]=[a[i],a[i-1]];onChange(()=>a);};
  const moveR=(i:number)=>{if(i===(imgs||[]).length-1)return;const a=[...(imgs||[])];[a[i],a[i+1]]=[a[i+1],a[i]];onChange(()=>a);};

  const handleDragStart=(i:number)=>setDragging(i);
  const handleDragEnd=()=>{
    if(dragging!==null&&dragOver!==null&&dragging!==dragOver){
      const a=[...(imgs||[])];
      const item=a.splice(dragging,1)[0];
      a.splice(dragOver,0,item);
      onChange(()=>a);
    }
    setDragging(null);setDragOver(null);
  };

  const list=imgs||[];
  const slots=maxImgs;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={css.label as any}>Nuotraukos <span style={{color:C.muted,fontWeight:400,fontSize:9}}>({list.length}/{slots} · vilkite kad perrikiuotumėte)</span></span>
        {list.length>0&&list.length<slots&&(
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>fileRef.current?.click()} style={{...css.btnTeal,padding:"3px 10px",fontSize:9}}>+ Įkelti</button>
            <button onClick={()=>setShowUrl(s=>!s)} style={{...css.btnGhost,padding:"3px 10px",fontSize:9}}>+ URL</button>
          </div>
        )}
      </div>

      {/* 4-slot image grid */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${slots},1fr)`,gap:6,marginBottom:showUrl?10:0}}>
        {Array.from({length:slots}).map((_,i)=>{
          const src=list[i];
          const isFirst=i===0;
          const isDraggingThis=dragging===i;
          const isDragTarget=dragOver===i;

          if(src){
            return(
              <div key={i}
                draggable
                onDragStart={()=>handleDragStart(i)}
                onDragOver={e=>{e.preventDefault();setDragOver(i);}}
                onDragEnd={handleDragEnd}
                style={{
                  position:"relative" as const,
                  aspectRatio:"1",
                  border:`2px solid ${isFirst?C.gold:isDragTarget?"#5B8DB8":C.border}`,
                  overflow:"hidden",
                  cursor:"grab",
                  opacity:isDraggingThis?0.5:1,
                  transition:"all .15s",
                  background:C.faint,
                }}
              >
                <img src={src} alt={`Photo ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>(e.target as HTMLImageElement).style.opacity="0.3"}/>
                {/* Cover badge */}
                {isFirst&&(
                  <div style={{position:"absolute" as const,top:4,left:4,background:C.gold,padding:"1px 6px",fontSize:7,fontWeight:700,color:C.bg,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em"}}>COVER</div>
                )}
                {/* Controls overlay */}
                <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0)",transition:"background .15s",display:"flex",alignItems:"flex-end",justifyContent:"center",gap:3,padding:4}}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,0,0,0.55)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(0,0,0,0)")}>
                  <div style={{display:"flex",gap:3,opacity:0}} className="img-controls">
                    {i>0&&<button onClick={()=>moveL(i)} title="Judinti kairėn" style={{width:20,height:20,background:"rgba(255,255,255,0.9)",border:"none",color:"#000",fontSize:10,cursor:"pointer",flexShrink:0}}>←</button>}
                    {i<list.length-1&&<button onClick={()=>moveR(i)} title="Judinti dešinėn" style={{width:20,height:20,background:"rgba(255,255,255,0.9)",border:"none",color:"#000",fontSize:10,cursor:"pointer",flexShrink:0}}>→</button>}
                    <button onClick={()=>remove(i)} title="Ištrinti" style={{width:20,height:20,background:"#ef4444",border:"none",color:"white",fontSize:11,cursor:"pointer",flexShrink:0}}>×</button>
                  </div>
                </div>
                {/* Always visible delete button */}
                <button onClick={()=>remove(i)} style={{position:"absolute" as const,top:2,right:2,width:18,height:18,background:"rgba(0,0,0,0.7)",border:"none",color:"white",fontSize:10,cursor:"pointer",flexShrink:0,lineHeight:1}}>×</button>
              </div>
            );
          }else{
            // Empty slot
            return(
              <div key={i}
                onDragOver={e=>{e.preventDefault();setDragOver(i);}}
                onDrop={()=>{}}
                onClick={()=>fileRef.current?.click()}
                style={{
                  aspectRatio:"1",
                  border:`1px dashed ${isDragTarget?C.teal:C.border}`,
                  background:isDragTarget?C.tealSoft:C.faint,
                  display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",
                  cursor:"pointer",color:C.muted,gap:4,
                  transition:"all .15s",
                }}
              >
                <span style={{fontSize:22,opacity:0.4}}>📷</span>
                {i===0&&list.length===0&&<span style={{fontSize:8,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:C.muted}}>Pridėti</span>}
              </div>
            );
          }
        })}
      </div>

      {/* CSS for hover controls */}
      <style>{`.img-controls{opacity:0;transition:opacity .15s;}div:hover>.img-controls{opacity:1!important;}`}</style>

      {/* Empty state big upload button */}
      {list.length===0&&(
        <div onClick={()=>fileRef.current?.click()} style={{border:`1px dashed ${C.border}`,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,gap:10,marginTop:6,fontSize:11,fontFamily:CONDENSED_FONT,letterSpacing:"0.12em",textTransform:"uppercase" as const,background:C.faint}}>
          <span style={{fontSize:20}}>📷</span>SPUSTELĖKITE ARBA VILKITE NUOTRAUKAS
        </div>
      )}

      {/* URL input */}
      {showUrl&&(
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <input ref={urlRef} placeholder="https://example.com/image.jpg" style={{...css.input,flex:1,fontSize:12}} onKeyDown={e=>e.key==="Enter"&&addUrl()} autoFocus/>
          <button onClick={addUrl} style={{...css.btnG,padding:"8px 14px",fontSize:13,fontWeight:900}}>+</button>
          <button onClick={()=>setShowUrl(false)} style={{...css.btnGhost,padding:"8px 10px",fontSize:13}}>×</button>
        </div>
      )}

      {/* Add buttons when empty */}
      {list.length===0&&(
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>fileRef.current?.click()} style={{...css.btnTeal,flex:1,fontSize:11,justifyContent:"center",display:"flex",alignItems:"center",gap:6}}>📁 Pasirinkti failus</button>
          <button onClick={()=>setShowUrl(s=>!s)} style={{...css.btnGhost,flex:1,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🔗 Įklijuoti URL</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} style={{display:"none"}}/>

      {/* Info text */}
      <div style={{fontSize:9,color:C.muted,marginTop:6,fontFamily:CONDENSED_FONT,letterSpacing:"0.08em"}}>
        Pirma nuotrauka — COVER (rodoma kortele ir PDF). Vilkite kad perrikiuotumėte.
      </div>
    </div>
  );
}
