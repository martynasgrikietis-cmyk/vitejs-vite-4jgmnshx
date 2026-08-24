// ── shared.tsx — DNA Trainer · Design tokens & shared UI ──
export const SUPABASE_URL = "https://wtsksjyayilyyudvizsx.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0c2tzanlheWlseXl1ZHZpenN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjI3NzgsImV4cCI6MjA5MzUzODc3OH0.wxlA05-VNVfsTe-630pQXYSewpDWII_AnOK2SIGEy7E";
export const sb = {
  headers: { "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, Prefer:"return=representation" },
  url:(t:string,q="")=>`${SUPABASE_URL}/rest/v1/${t}${q}`,
  async get(t:string,q=""){const r=await fetch(sb.url(t,q),{headers:sb.headers});if(!r.ok)throw new Error(await r.text());return r.json();},
  async insert(t:string,d:any){const r=await fetch(sb.url(t),{method:"POST",headers:sb.headers,body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
  async update(t:string,id:any,d:any){const r=await fetch(sb.url(t,`?id=eq.${id}`),{method:"PATCH",headers:{...sb.headers,Prefer:"return=representation"},body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
  async delete(t:string,id:any){const r=await fetch(sb.url(t,`?id=eq.${id}`),{method:"DELETE",headers:sb.headers});if(!r.ok)throw new Error(await r.text());},

  // ── STORAGE: upload image file, returns public URL ──
  async uploadImage(file:File, bucket="exercise-images"):Promise<string>{
    // Compress image before upload
    const compressed = await compressImage(file, 1200, 0.82);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storageUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
    const r = await fetch(storageUrl, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "true",
      },
      body: compressed,
    });
    if (!r.ok) throw new Error(await r.text());
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  },

  // ── STORAGE: delete image by URL ──
  async deleteImage(url:string, bucket="exercise-images"):Promise<void>{
    const path = url.split(`/object/public/${bucket}/`)[1];
    if(!path) return;
    await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
  },
};

// ── IMAGE COMPRESSION ────────────────────────────────────
async function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

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

// ── THEME SYSTEM ──────────────────────────────────────────
// 5 light, ergonomic themes. Colors live as CSS custom properties so the
// whole app (inline styles + CSS classes below) re-themes instantly when
// [data-theme] changes on <html> — no re-render needed.
export const THEMES = [
  {id:"sky",      name:"Dangaus mėlyna",     bg:"#F4F8FC", accent:"#2F6FED"},
  {id:"mint",     name:"Ramus mėtinis",      bg:"#F3FAF7", accent:"#12946F"},
  {id:"sand",     name:"Šiltas smėlis",      bg:"#FBF7F1", accent:"#C97A3B"},
  {id:"lavender", name:"Minimalus alyvinis", bg:"#F7F6FC", accent:"#7C5CD1"},
  {id:"clean",    name:"Švarus baltas",      bg:"#F8F9FA", accent:"#E0912B"},
];
export const DEFAULT_THEME = "sky";
export function getStoredTheme():string{
  try{ return localStorage.getItem("dna_theme") || DEFAULT_THEME; }catch{ return DEFAULT_THEME; }
}
export function applyTheme(id:string){
  try{
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("dna_theme", id);
  }catch{}
}

// ── COLOR TOKENS ──────────────────────────────────────────
// Values point at CSS variables (set per-theme below) so every component
// using C.xxx automatically follows the active theme.
export const C = {
  bg:"var(--bg)", surface:"var(--surface)", surface2:"var(--surface2)", border:"var(--border)",
  gold:"var(--gold)", goldSoft:"rgba(var(--gold-rgb),0.10)", goldBorder:"rgba(var(--gold-rgb),0.30)",
  teal:"var(--teal)", tealSoft:"var(--teal-soft)", tealBorder:"var(--teal-border)",
  red:"var(--red)", redSoft:"var(--red-soft)", redBorder:"var(--red-border)",
  green:"var(--green)", greenSoft:"var(--green-soft)", greenBorder:"var(--green-border)",
  purple:"var(--purple)", purpleSoft:"var(--purple-soft)", purpleBorder:"var(--purple-border)",
  text:"var(--text)", muted:"var(--muted)", faint:"var(--faint)",
  headingText:"var(--heading-text)", goldDark:"var(--gold-dark)",
  // composite tokens (replace old hex+alpha string concatenation like `${C.gold}44`)
  bgFade1:"rgba(var(--bg-rgb),0.30)", bgFade2:"rgba(var(--bg-rgb),0.82)",
  goldGlow:"rgba(var(--gold-rgb),0.27)", goldMid:"rgba(var(--gold-rgb),0.53)",
  goldStrong:"rgba(var(--gold-rgb),0.50)", goldFaint:"rgba(var(--gold-rgb),0.07)",
};

export const FONT = "'Barlow','Helvetica Neue',sans-serif";
export const DISPLAY_FONT = "'Bebas Neue',sans-serif";
export const CONDENSED_FONT = "'Barlow Condensed','Helvetica Neue',sans-serif";

export const HERO_IMG = "https://images.unsplash.com/photo-1549476464-37392f717541?w=1600&q=90";
export const GYM_IMG2 = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80";
export const GYM_IMG3 = "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80";

export const RESPONSIVE_CSS = `
  :root{
    --shadow-rgb:20,26,38;
    --teal:#0D7490; --teal-dark:#0A5A6E; --teal-soft:#0D749014; --teal-border:#0D749040;
    --red:#D6394A; --red-dark:#A82A38; --red-soft:#D6394A14; --red-border:#D6394A40;
    --green:#1E9E5A; --green-dark:#166B3D; --green-soft:#1E9E5A14; --green-border:#1E9E5A40;
    --purple:#7C5CD1; --purple-dark:#5B3FAE; --purple-soft:#7C5CD114; --purple-border:#7C5CD140;
--bg:#F4F8FC; --bg-rgb:244,248,252; --surface:#FFFFFF; --surface2:#E9F1FB;
    --border:#DCE6F0; --text:#16233A; --muted:#5B6B82; --faint:#EFF5FB;
    --heading-text:#0F1A2E; --gold:#2F6FED; --gold-rgb:47,111,237; --gold-dark:#1E4FBF;
  }
  [data-theme="sky"] {
    --bg:#F4F8FC; --bg-rgb:244,248,252; --surface:#FFFFFF; --surface2:#E9F1FB;
    --border:#DCE6F0; --text:#16233A; --muted:#5B6B82; --faint:#EFF5FB;
    --heading-text:#0F1A2E; --gold:#2F6FED; --gold-rgb:47,111,237; --gold-dark:#1E4FBF;
  }
  [data-theme="mint"] {
    --bg:#F3FAF7; --bg-rgb:243,250,247; --surface:#FFFFFF; --surface2:#E6F4EE;
    --border:#D9EDE3; --text:#122620; --muted:#5A7A6E; --faint:#EEF8F3;
    --heading-text:#0E1F1A; --gold:#12946F; --gold-rgb:18,148,111; --gold-dark:#0B6B50;
  }
  [data-theme="sand"] {
    --bg:#FBF7F1; --bg-rgb:251,247,241; --surface:#FFFFFF; --surface2:#F3E9D9;
    --border:#EADFC9; --text:#2B2015; --muted:#8A7458; --faint:#F8F1E7;
    --heading-text:#241A0F; --gold:#C97A3B; --gold-rgb:201,122,59; --gold-dark:#9C5B27;
  }
  [data-theme="lavender"] {
    --bg:#F7F6FC; --bg-rgb:247,246,252; --surface:#FFFFFF; --surface2:#EBE7F8;
    --border:#DEDAF1; --text:#1F1B33; --muted:#6C6690; --faint:#F2F0FA;
    --heading-text:#1B1730; --gold:#7C5CD1; --gold-rgb:124,92,209; --gold-dark:#5B3FAE;
  }
  [data-theme="clean"] {
    --bg:#F8F9FA; --bg-rgb:248,249,250; --surface:#FFFFFF; --surface2:#EFF1F3;
    --border:#E1E4E8; --text:#181B20; --muted:#666E79; --faint:#F4F5F7;
    --heading-text:#14161A; --gold:#E0912B; --gold-rgb:224,145,43; --gold-dark:#B5721A;
  }

  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;} body{margin:0;background:var(--bg);font-size:14px;transition:background .2s;}
  input,select,textarea{font-size:14px!important;}

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{from{transform:translateY(-50%) rotate(0deg)}to{transform:translateY(-50%) rotate(360deg)}}
  @keyframes skelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes aiPulse{0%,100%{opacity:.4}50%{opacity:1}}

  .fu {animation:fadeUp .4s ease both;}
  .fu1{animation:fadeUp .4s .07s ease both;}
  .fu2{animation:fadeUp .4s .14s ease both;}
  .fu3{animation:fadeUp .4s .21s ease both;}
  .fu4{animation:fadeUp .4s .28s ease both;}

  /* ── GRIDS ── */
  .ex-grid  {display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1px;background:var(--border);}
  .cl-grid  {display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1px;background:var(--border);}
  .food-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:var(--border);}
  .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
  .dash-bottom{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:0;border-top:1px solid var(--border);}
  .cf-grid  {display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .macro-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
  .ex2-grid {display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .food4-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;}
  .step-nav {display:flex;gap:4px;}
  .pick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:8px;}
  .pick-row {display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid var(--border);background:var(--bg);}
  .view-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .view-actions button{flex:1;min-width:100px;}
  .meal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1px;background:var(--border);}

  /* ── SECTION HEADINGS ── */
  .sec-heading{font-family:'Bebas Neue',sans-serif;font-size:42px;color:var(--heading-text);letter-spacing:0.04em;line-height:1;margin-bottom:20px;}
  .sec-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
  .sec-eyebrow-num{font-family:'Bebas Neue',sans-serif;font-size:10px;color:var(--gold);letter-spacing:0.3em;}
  .sec-eyebrow-line{width:24px;height:1px;background:var(--gold);}

  /* ── NAV ── */
  .arch-nav-btn{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;border:none;padding:6px 14px;border-radius:8px;transition:all .12s ease;position:relative;top:0;}
  .arch-nav-btn:not(.active){background:transparent;color:var(--muted);}
  .arch-nav-btn:not(.active):hover{background:rgba(var(--gold-rgb),0.08);color:var(--gold);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 50%,calc(100% - 8px) 100%,0 100%,8px 50%);}
  .arch-nav-btn.active{background:linear-gradient(135deg,rgba(var(--gold-rgb),0.18),rgba(var(--gold-rgb),0.06));color:var(--gold-dark);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%,10px 50%);}

  /* ── TABLE/LIST ROWS ── */
  .arch-row{border-top:1px solid var(--border);transition:background .15s,padding-left .2s;cursor:pointer;}
  .arch-row:hover{background:rgba(var(--gold-rgb),0.06);padding-left:6px;}
  .arch-session-row{padding:13px 0;border-top:1px solid var(--border);display:flex;align-items:center;gap:14px;cursor:pointer;transition:padding-left .2s;}
  .arch-session-row:hover{padding-left:8px;}

  /* ── STAT BLOCKS ── */
  .arch-stat-block{padding:22px 28px;border-right:1px solid var(--border);transition:background .2s;cursor:pointer;}
  .arch-stat-block:last-child{border-right:none;}
  .arch-stat-block:hover{background:rgba(var(--gold-rgb),0.07);}

  /* ── EXERCISE/CLIENT CARDS ── */
  .arch-card{background:var(--surface);transition:all .2s;cursor:pointer;}
  .arch-card:hover{background:var(--surface2);transform:translateY(-3px);box-shadow:0 12px 32px rgba(var(--shadow-rgb),0.14),0 0 0 1px rgba(var(--gold-rgb),0.25);}

  /* ── BUTTONS ── */
  button{transition:all .12s ease;position:relative;top:0;font-family:'Barlow',sans-serif;}
  button:active{transform:translateY(2px) !important;top:2px !important;}

  .arch-btn-primary{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;background:linear-gradient(145deg,var(--gold),var(--gold-dark));color:#FFFFFF;border:none;padding:11px 20px;border-radius:10px;box-shadow:0 4px 0 var(--gold-dark),0 6px 14px rgba(var(--shadow-rgb),0.22);transition:all .12s ease;}
  .arch-btn-primary:hover{filter:brightness(1.05);}
  .arch-btn-primary:active{box-shadow:0 1px 0 var(--gold-dark),0 2px 6px rgba(var(--shadow-rgb),0.18) !important;}
  .arch-btn-ghost{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;background:var(--surface);color:var(--text);border:1px solid var(--border);padding:10px 18px;border-radius:10px;box-shadow:0 2px 0 var(--border),0 4px 10px rgba(var(--shadow-rgb),0.08);transition:all .12s ease;}
  .arch-btn-ghost:hover{color:var(--gold);border-color:rgba(var(--gold-rgb),0.5);}
  .arch-btn-ghost:active{box-shadow:0 1px 0 var(--border),0 2px 6px rgba(var(--shadow-rgb),0.08) !important;}

  /* ── BOTTOM NAV ACTIVE GLOW ── */
  .bottom-nav-item.active .bottom-nav-icon{filter:drop-shadow(0 0 6px var(--gold));}

  /* ── INPUTS ── */
  .arch-input{width:100%;background:var(--faint);border-top:none;border-left:none;border-right:none;border-bottom:1px solid var(--border);padding:10px 0;color:var(--text);font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border-color .2s;box-sizing:border-box;}
  .arch-input:focus{border-bottom-color:var(--gold);box-shadow:0 4px 12px rgba(var(--gold-rgb),0.12);}
  .arch-input::placeholder{color:var(--muted);opacity:0.6;}

  /* ── SEARCH/TAG BAR ── */
  .search-btn:hover{border-color:var(--gold) !important;color:var(--gold) !important;}
  .sbar{font-family:'Barlow Condensed',sans-serif!important;letter-spacing:0.06em;}
  .tag-row{overflow-x:auto;padding-bottom:4px;}
  .tag-row::-webkit-scrollbar{height:2px;}
  .tag-row::-webkit-scrollbar-thumb{background:var(--border);}

  /* ── MOBILE ── */
  .bottom-nav{display:none;}
  @media(max-width:640px){
    body{padding-top:env(safe-area-inset-top);background:var(--bg);}
    .header-pad{padding-top:calc(env(safe-area-inset-top) + 8px) !important;padding-left:16px !important;padding-right:16px !important;height:auto !important;min-height:calc(52px + env(safe-area-inset-top)) !important;}
    .content-pad{padding:calc(62px + env(safe-area-inset-top)) 0 calc(80px + env(safe-area-inset-bottom)) !important;max-width:100% !important;}
    .hero-section{min-height:200px !important;}
    .hero-section .hero-inner{padding:20px 16px !important;}
    .hero-title{font-size:48px !important;}
    .hero-actions{display:flex !important;flex-direction:column !important;gap:8px !important;width:100% !important;}
    .hero-actions button{width:100% !important;padding:14px !important;font-size:12px !important;justify-content:center !important;}
    .dash-stats{grid-template-columns:1fr 1fr !important;}
    .arch-stat-block{padding:16px 14px !important;}
    .arch-stat-block .stat-num{font-size:40px !important;}
    .dash-bottom{grid-template-columns:1fr !important;}
    .cl-grid{grid-template-columns:1fr !important;}
    .ex-grid{grid-template-columns:repeat(2,1fr) !important;}
    .food-grid{grid-template-columns:1fr !important;}
    .cf-grid{grid-template-columns:1fr !important;}
    .macro-grid{grid-template-columns:1fr 1fr 1fr !important;}
    .meal-grid{grid-template-columns:1fr !important;}
    .ex2-grid{grid-template-columns:1fr 1fr !important;}
    .food4-grid{grid-template-columns:1fr 1fr !important;}
    .pick-row{gap:8px;padding:10px 14px;}
    .pick-row>div{min-width:calc(50% - 4px);}
    .pick-row>button{width:100%;margin-top:4px;}
    .step-nav button{padding:5px 7px!important;font-size:10px!important;}
    .view-actions button{min-width:unset;font-size:11px;}
    .day-btns{display:grid!important;grid-template-columns:repeat(4,1fr);gap:6px!important;}
    .modal-inner{max-height:100vh !important;border-radius:0 !important;margin:0 !important;width:100% !important;}
    .logout-label{display:none;}
    .hsubtitle{display:none;}
    .header-nav-items{display:none !important;}
    .sec-heading{font-size:28px !important;}
    .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-top:1px solid var(--border);z-index:200;padding:6px 0 calc(6px + env(safe-area-inset-bottom));justify-content:space-around;align-items:center;box-shadow:0 -4px 20px rgba(var(--shadow-rgb),0.08);}
    .bottom-nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 8px;cursor:pointer;min-width:44px;transition:background .15s;flex:1;border-radius:10px;}
    .bottom-nav-item.active{background:rgba(var(--gold-rgb),0.12);}
    .bottom-nav-icon{font-size:22px;line-height:1;}
    .bottom-nav-label{font-size:9px;color:var(--muted);letter-spacing:0.04em;font-weight:600;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;white-space:nowrap;}
    .bottom-nav-item.active .bottom-nav-label{color:var(--gold-dark);}
    button{min-height:44px;}
    input,select,textarea{font-size:16px !important;min-height:44px;}
    *{-webkit-tap-highlight-color:transparent;}
  }
  /* ── HEADER NAV — never overflow off-screen; scroll internally instead ── */
  .header-nav-items{min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;}
  .header-nav-items::-webkit-scrollbar{display:none;}
  /* ── TABLET — compact the header chrome so the full nav fits ── */
  @media(min-width:641px) and (max-width:1024px){
    .header-pad{padding-left:16px !important;padding-right:16px !important;gap:8px !important;}
    .header-nav-items{gap:0 !important;}
    .header-nav-items button{padding:8px 8px !important;}
    .logout-label,.logout-label-text{display:none !important;}
    .hsubtitle{display:none !important;}
    .search-btn{padding:6px 8px !important;}
    .theme-switch-btn{padding:6px 8px !important;}
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
  logo:    {width:34,height:34,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#FFFFFF",flexShrink:0},
  card:    {background:C.surface,border:`1px solid ${C.border}`,padding:24},
  label:   {fontSize:9,color:C.muted,letterSpacing:"0.2em",marginBottom:6,display:"block",fontWeight:600,textTransform:"uppercase" as const,fontFamily:CONDENSED_FONT},
  input:   {width:"100%",background:C.faint,borderTop:"none",borderLeft:"none",borderRight:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 0",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const,transition:"border-color .2s"},
  select:  {width:"100%",background:C.faint,border:`1px solid ${C.border}`,padding:"10px 14px",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const},
  navBtn:  (a:boolean)=>({
    fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase" as const,
    padding:"6px 14px",borderRadius:"8px",
    background:a?"linear-gradient(145deg,var(--gold),var(--gold-dark))":"transparent",
    color:a?"#FFFFFF":C.muted,
    border:"none",cursor:"pointer",transition:"all .12s ease",
    boxShadow:a?"0 3px 0 var(--gold-dark),0 5px 10px rgba(var(--shadow-rgb),0.2)":"none",
    position:"relative" as const,top:0,
  }),
  btnG:    {padding:"11px 22px",background:"linear-gradient(145deg,var(--gold),var(--gold-dark))",color:"#FFFFFF",border:"none",fontFamily:CONDENSED_FONT,fontWeight:800,fontSize:11,cursor:"pointer",letterSpacing:"0.16em",textTransform:"uppercase" as const,borderRadius:"10px",boxShadow:"0 4px 0 var(--gold-dark), 0 6px 14px rgba(var(--shadow-rgb),0.22)",transition:"all .12s ease",position:"relative" as const,top:0},
  btnGhost:{padding:"10px 18px",background:C.surface,color:C.text,border:`1px solid ${C.border}`,fontFamily:CONDENSED_FONT,fontWeight:600,fontSize:11,cursor:"pointer",letterSpacing:"0.12em",textTransform:"uppercase" as const,borderRadius:"10px",boxShadow:"0 2px 0 var(--border), 0 4px 10px rgba(var(--shadow-rgb),0.08)",transition:"all .12s ease",position:"relative" as const,top:0},
  btnTeal: {padding:"9px 16px",background:"linear-gradient(145deg,var(--teal),var(--teal-dark))",color:"#FFFFFF",border:"none",fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,borderRadius:"10px",boxShadow:"0 3px 0 var(--teal-dark), 0 5px 10px rgba(var(--shadow-rgb),0.18)",transition:"all .12s ease",position:"relative" as const,top:0},
  btnRed:  {padding:"9px 16px",background:"linear-gradient(145deg,var(--red),var(--red-dark))",color:"#FFFFFF",border:"none",fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,borderRadius:"10px",boxShadow:"0 3px 0 var(--red-dark), 0 5px 10px rgba(var(--shadow-rgb),0.18)",transition:"all .12s ease",position:"relative" as const,top:0},
  btnGreen:{padding:"9px 16px",background:"linear-gradient(145deg,var(--green),var(--green-dark))",color:"#FFFFFF",border:"none",fontFamily:CONDENSED_FONT,fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,borderRadius:"10px",boxShadow:"0 3px 0 var(--green-dark), 0 5px 10px rgba(var(--shadow-rgb),0.18)",transition:"all .12s ease",position:"relative" as const,top:0},
  secTitle:{fontFamily:DISPLAY_FONT,fontSize:36,color:C.headingText,letterSpacing:"0.04em",marginBottom:0,display:"block",lineHeight:1},
  overlay: {position:"fixed" as const,inset:0,background:"rgba(var(--shadow-rgb),0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:8,backdropFilter:"blur(8px)"},
  modal:   (w:number)=>({background:C.surface,border:`1px solid ${C.border}`,width:"100%",maxWidth:w||520,maxHeight:"93vh",display:"flex",flexDirection:"column" as const,overflow:"hidden",boxShadow:"0 40px 100px rgba(var(--shadow-rgb),0.35)"}),
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
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:C.headingText,letterSpacing:"0.04em",lineHeight:1}}>{title}</div>
    </div>
  );
}

export function calcBMI(w:string,h:string){if(!w||!h)return null;return parseFloat(w)/Math.pow(parseFloat(h)/100,2);}
export function bmiCat(b:number){if(b<18.5)return{label:"Nepakankamas",color:"#2563eb"};if(b<25)return{label:"Normalus",color:"#16a34a"};if(b<30)return{label:"Antsvoris",color:"#d97706"};return{label:"Nutukimas",color:"#dc2626"};}
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

import { useState, useRef, useEffect } from "react";

// ── THEME SWITCHER ────────────────────────────────────────
export function ThemeSwitcher(){
  const [open,setOpen]=useState(false);
  const [current,setCurrent]=useState<string>(()=>getStoredTheme());
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const onDoc=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return ()=>document.removeEventListener("mousedown", onDoc);
  },[]);

  const pick=(id:string)=>{ applyTheme(id); setCurrent(id); setOpen(false); };
  const active = THEMES.find(t=>t.id===current) || THEMES[0];

  return (
    <div ref={ref} style={{position:"relative" as const}}>
      <button onClick={()=>setOpen(o=>!o)} title="Pakeisti temą" className="theme-switch-btn" style={{display:"flex",alignItems:"center",gap:7,background:C.faint,border:`1px solid ${C.border}`,padding:"6px 12px",cursor:"pointer",borderRadius:20,fontFamily:CONDENSED_FONT}}>
        <span style={{width:13,height:13,borderRadius:"50%",background:active.accent,display:"inline-block",boxShadow:`0 0 0 2px ${C.surface}, 0 0 0 3px ${C.border}`}}/>
        <span style={{fontSize:10,color:C.text,letterSpacing:"0.1em",textTransform:"uppercase" as const,fontWeight:600}} className="logout-label">{active.name}</span>
        <span style={{fontSize:9,color:C.muted,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute" as const,top:"calc(100% + 8px)",right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:6,minWidth:200,boxShadow:`0 16px 40px rgba(var(--shadow-rgb),0.18)`,zIndex:500}}>
          {THEMES.map(t=>(
            <div key={t.id} onClick={()=>pick(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",cursor:"pointer",borderRadius:8,background:t.id===current?C.goldSoft:"transparent"}}
              onMouseEnter={e=>{ if(t.id!==current) (e.currentTarget as HTMLDivElement).style.background = C.faint; }}
              onMouseLeave={e=>{ if(t.id!==current) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
              <span style={{width:18,height:18,borderRadius:"50%",background:t.accent,flexShrink:0,boxShadow:`0 0 0 2px ${C.surface}, 0 0 0 3px ${C.border}`}}/>
              <span style={{fontSize:12,color:C.text,fontFamily:FONT,fontWeight:t.id===current?700:400}}>{t.name}</span>
              {t.id===current&&<span style={{marginLeft:"auto",color:C.gold,fontSize:12}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Tag=({c,label,active,onClick}:any)=>(
  <button onClick={onClick} style={{padding:"5px 14px",border:active?"none":`1px solid ${C.border}`,background:active?`linear-gradient(145deg,${c}DD,${c}99)`:C.surface,color:active?"#fff":C.muted,fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,cursor:"pointer",fontWeight:700,flexShrink:0,letterSpacing:"0.12em",textTransform:"uppercase" as const,borderRadius:"8px",boxShadow:active?`0 3px 0 ${c}55,0 4px 10px rgba(var(--shadow-rgb),0.18)`:"none",transition:"all .12s ease",position:"relative" as const,top:0}}>{label}</button>
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
    {p&&<span style={{background:"#ef444412",border:"1px solid #ef444438",padding:"2px 8px",fontSize:9,fontWeight:600,color:"#dc2626",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>P:{p}g</span>}
    {c&&<span style={{background:"#f9731612",border:"1px solid #f9731638",padding:"2px 8px",fontSize:9,fontWeight:600,color:"#ea580c",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>C:{c}g</span>}
    {f&&<span style={{background:C.purpleSoft,border:"1px solid #a78bfa38",padding:"2px 8px",fontSize:9,fontWeight:600,color:C.purple,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>F:{f}g</span>}
  </div>
);

export function ImgGallery({imgs,height=140}:{imgs:string[],height?:number}){
  const [cur,setCur]=useState(0);
  const list=(imgs||[]).filter(Boolean);
  if(!list.length)return<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:28,background:C.faint,flexDirection:"column" as const,gap:6}}><span>📷</span><span style={{fontSize:9,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:C.muted}}>Nuotraukų nėra</span></div>;
  return(
    <div style={{position:"relative",height,overflow:"hidden",background:C.faint}}>
      <img src={list[cur]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity .2s"}} onError={e=>(e.target as HTMLImageElement).style.opacity="0.2"}/>
      {list.length>1&&<>
        <div style={{position:"absolute" as const,top:8,right:8,background:"rgba(0,0,0,0.7)",padding:"2px 8px",fontSize:9,color:"white",fontFamily:CONDENSED_FONT,letterSpacing:"0.1em"}}>{cur+1}/{list.length}</div>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p-1+list.length)%list.length);}} style={{position:"absolute" as const,left:0,top:0,bottom:0,width:36,background:"linear-gradient(to right,rgba(0,0,0,0.4),transparent)",border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:8}}>‹</button>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%list.length);}} style={{position:"absolute" as const,right:0,top:0,bottom:0,width:36,background:"linear-gradient(to left,rgba(0,0,0,0.4),transparent)",border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}>›</button>
        <div style={{position:"absolute" as const,bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
          {list.map((_,i)=>(
            <div key={i} onClick={e=>{e.stopPropagation();setCur(i);}} style={{width:i===cur?16:5,height:5,background:i===cur?C.gold:"rgba(255,255,255,0.4)",cursor:"pointer",transition:"all .2s"}}/>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── MULTI IMAGE UPLOADER — uses Supabase Storage ─────────
export function MultiImgUploader({imgs,onChange,maxImgs=4}:{imgs:string[],onChange:any,maxImgs?:number}){
  const fileRef=useRef<HTMLInputElement>(null);
  const urlRef=useRef<HTMLInputElement>(null);
  const [showUrl,setShowUrl]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState("");
  const [dragging,setDragging]=useState<number|null>(null);
  const [dragOver,setDragOver]=useState<number|null>(null);

  const addFile=async(e:any)=>{
    const files=Array.from(e.target.files) as File[];
    e.target.value="";
    const remaining=maxImgs-(imgs||[]).length;
    const toUpload=files.slice(0,remaining);
    if(!toUpload.length) return;
    setUploading(true);
    setUploadError("");
    try{
      const urls=await Promise.all(toUpload.map(f=>sb.uploadImage(f)));
      onChange((p:string[])=>[...(p||[]),...urls]);
    }catch(err:any){
      setUploadError("Klaida įkeliant nuotrauką: "+err.message);
    }finally{
      setUploading(false);
    }
  };

  const addUrl=async()=>{
    const v=urlRef.current?.value?.trim();
    if(!v||(imgs||[]).includes(v)||(imgs||[]).length>=maxImgs)return;
    if(urlRef.current)urlRef.current.value="";
    setShowUrl(false);
    setUploading(true);
    setUploadError("");
    try{
      // Fetch + compress + host the pasted image ourselves, so a pasted link
      // behaves exactly like an uploaded file (small, reliable, no giant
      // originals ending up in PDFs later).
      const resp=await fetch(v,{mode:"cors"});
      if(!resp.ok)throw new Error("fetch failed");
      const blob=await resp.blob();
      const file=new File([blob],"pasted-image.jpg",{type:blob.type||"image/jpeg"});
      const hostedUrl=await sb.uploadImage(file);
      onChange((p:string[])=>[...(p||[]),hostedUrl]);
    }catch{
      // CORS blocked or fetch failed — fall back to using the link as-is.
      onChange((p:string[])=>[...(p||[]),v]);
      setUploadError("Nepavyko automatiškai suspausti nuotraukos iš šios nuorodos — pridėta kaip yra, bet gali būti didelė. Jei įmanoma, atsisiųskite nuotrauką ir įkelkite ją kaip failą (📁 Pasirinkti failus).");
    }finally{
      setUploading(false);
    }
  };

  const remove=(i:number)=>{
    onChange((p:string[])=>p.filter((_:string,j:number)=>j!==i));
  };

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
        <span style={css.label as any}>
          Nuotraukos <span style={{color:C.muted,fontWeight:400,fontSize:9}}>({list.length}/{slots} · vilkite kad perrikiuotumėte)</span>
        </span>
        {list.length>0&&list.length<slots&&!uploading&&(
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>fileRef.current?.click()} style={{...css.btnTeal,padding:"3px 10px",fontSize:9}}>+ Įkelti</button>
            <button onClick={()=>setShowUrl(s=>!s)} style={{...css.btnGhost,padding:"3px 10px",fontSize:9}}>+ URL</button>
          </div>
        )}
      </div>

      {uploading&&(
        <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10,fontSize:12,color:C.gold,fontFamily:CONDENSED_FONT,letterSpacing:"0.08em"}}>
          <div style={{width:14,height:14,border:`2px solid ${C.gold}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
          Įkeliama į Supabase Storage...
        </div>
      )}

      {uploadError&&(
        <div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,padding:"8px 12px",marginBottom:10,fontSize:11,color:C.red,fontFamily:CONDENSED_FONT}}>
          {uploadError}
          <button onClick={()=>setUploadError("")} style={{background:"none",border:"none",color:C.red,cursor:"pointer",marginLeft:8,fontSize:13}}>×</button>
        </div>
      )}

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
                style={{position:"relative" as const,aspectRatio:"1",border:`2px solid ${isFirst?C.gold:isDragTarget?C.teal:C.border}`,overflow:"hidden",cursor:"grab",opacity:isDraggingThis?0.5:1,transition:"all .15s",background:C.faint}}
              >
                <img src={src} alt={`Photo ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>(e.target as HTMLImageElement).style.opacity="0.3"}/>
                {isFirst&&(
                  <div style={{position:"absolute" as const,top:4,left:4,background:C.gold,padding:"1px 6px",fontSize:7,fontWeight:700,color:"#FFFFFF",fontFamily:CONDENSED_FONT,letterSpacing:"0.1em"}}>COVER</div>
                )}
                <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0)",transition:"background .15s",display:"flex",alignItems:"flex-end",justifyContent:"center",gap:3,padding:4}}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,0,0,0.55)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(0,0,0,0)")}>
                  <div style={{display:"flex",gap:3,opacity:0}} className="img-controls">
                    {i>0&&<button onClick={()=>moveL(i)} style={{width:20,height:20,background:"rgba(255,255,255,0.9)",border:"none",color:"#000",fontSize:10,cursor:"pointer",flexShrink:0}}>←</button>}
                    {i<list.length-1&&<button onClick={()=>moveR(i)} style={{width:20,height:20,background:"rgba(255,255,255,0.9)",border:"none",color:"#000",fontSize:10,cursor:"pointer",flexShrink:0}}>→</button>}
                    <button onClick={()=>remove(i)} style={{width:20,height:20,background:"#ef4444",border:"none",color:"white",fontSize:11,cursor:"pointer",flexShrink:0}}>×</button>
                  </div>
                </div>
                <button onClick={()=>remove(i)} style={{position:"absolute" as const,top:2,right:2,width:18,height:18,background:"rgba(0,0,0,0.7)",border:"none",color:"white",fontSize:10,cursor:"pointer",flexShrink:0,lineHeight:1}}>×</button>
              </div>
            );
          }else{
            return(
              <div key={i}
                onDragOver={e=>{e.preventDefault();setDragOver(i);}}
                onDrop={()=>{}}
                onClick={()=>!uploading&&fileRef.current?.click()}
                style={{aspectRatio:"1",border:`1px dashed ${isDragTarget?C.teal:C.border}`,background:isDragTarget?C.tealSoft:C.faint,display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",cursor:uploading?"not-allowed":"pointer",color:C.muted,gap:4,transition:"all .15s"}}
              >
                {uploading&&i===list.length
                  ?<div style={{width:16,height:16,border:`2px solid ${C.gold}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  :<span style={{fontSize:22,opacity:0.4}}>📷</span>
                }
                {i===0&&list.length===0&&!uploading&&<span style={{fontSize:8,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:C.muted}}>Pridėti</span>}
              </div>
            );
          }
        })}
      </div>

      <style>{`.img-controls{opacity:0;transition:opacity .15s;}div:hover>.img-controls{opacity:1!important;}`}</style>

      {list.length===0&&!uploading&&(
        <div onClick={()=>fileRef.current?.click()} style={{border:`1px dashed ${C.border}`,padding:"18px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,gap:10,marginTop:6,fontSize:11,fontFamily:CONDENSED_FONT,letterSpacing:"0.12em",textTransform:"uppercase" as const,background:C.faint}}>
          <span style={{fontSize:20}}>📷</span>SPUSTELĖKITE ARBA VILKITE NUOTRAUKAS
        </div>
      )}

      {showUrl&&(
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <input ref={urlRef} placeholder="https://example.com/image.jpg" style={{...css.input,flex:1,fontSize:12}} onKeyDown={e=>e.key==="Enter"&&addUrl()} autoFocus/>
          <button onClick={addUrl} style={{...css.btnG,padding:"8px 14px",fontSize:13,fontWeight:900}}>+</button>
          <button onClick={()=>setShowUrl(false)} style={{...css.btnGhost,padding:"8px 10px",fontSize:13}}>×</button>
        </div>
      )}

      {list.length===0&&!uploading&&(
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>fileRef.current?.click()} style={{...css.btnTeal,flex:1,fontSize:11,justifyContent:"center",display:"flex",alignItems:"center",gap:6}}>📁 Pasirinkti failus</button>
          <button onClick={()=>setShowUrl(s=>!s)} style={{...css.btnGhost,flex:1,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🔗 Įklijuoti URL</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} style={{display:"none"}}/>

      <div style={{fontSize:9,color:C.muted,marginTop:6,fontFamily:CONDENSED_FONT,letterSpacing:"0.08em"}}>
        Pirma nuotrauka — COVER (rodoma kortele ir PDF). Vilkite kad perrikiuotumėte.
      </div>
    </div>
  );
}

// ── PROGRAM DIFFICULTY SCORE ──────────────────────────────
export function calcDifficulty(program:any){
  const allEx=Object.values(program||{}).flat() as any[];
  if(!allEx.length) return null;
  let score=0;
  allEx.forEach((ex:any)=>{
    const sets=parseInt(ex.customSets||ex.sets||"3");
    const repsStr=(ex.customReps||ex.reps||"10");
    const repsMax=parseInt(repsStr.toString().split(/[-–]/)[1]||repsStr)||10;
    const weight=parseFloat(ex.customWeight||"0");
    const volume=sets*repsMax;
    const weightBonus=weight>0?Math.min(weight/20,3):0;
    const ssBonus=ex.superset?0.5:0;
    score+=volume*0.1+weightBonus+ssBonus;
  });
  const perDay=score/(Object.keys(program||{}).filter(d=>(program[d]||[]).length>0).length||1);
  const raw=Math.min(10,Math.round(perDay*0.8*10)/10);
  const label=raw<=3?"Lengvas":raw<=5?"Vidutinis":raw<=7?"Sunkus":"Elitinis";
  const color=raw<=3?"#4E9068":raw<=5?C.gold:raw<=7?"#E07B5A":"#C05050";
  return{score:raw,label,color};
}
// Static documents (PDF/print) render in their own window with no access to
// our CSS theme variables — swap any live var(--x) color for a fixed brand hex.
function pdfSafeColor(c:string|null|undefined):string{
  if(!c) return "#D4A853";
  return c.indexOf("var(")===0 ? "#D4A853" : c;
}

// PDF images are shown as small thumbnails, but browsers embed the FULL
// source resolution when printing/saving — that's what bloats file size.
// Pre-shrink each image to the exact size it's displayed at before it goes
// into the printable HTML, so quality stays crisp but the file stays small.
const pdfImgCache=new Map<string,Promise<string>>();
export function shrinkForPdf(url:string,maxW:number,maxH:number,quality=0.68):Promise<string>{
  if(!url) return Promise.resolve(url);
  if(pdfImgCache.has(url)) return pdfImgCache.get(url)!;
  const p=new Promise<string>((resolve)=>{
    const img=new Image();
    img.crossOrigin="anonymous";
    const fallback=()=>resolve(url); // if it fails (e.g. CORS), just use the original URL
    img.onerror=fallback;
    img.onload=()=>{
      try{
        const scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight);
        const w=Math.max(1,Math.round(img.naturalWidth*scale));
        const h=Math.max(1,Math.round(img.naturalHeight*scale));
        const canvas=document.createElement("canvas");
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext("2d");
        if(!ctx){fallback();return;}
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",quality));
      }catch{fallback();}
    };
    img.src=url;
  });
  pdfImgCache.set(url,p);
  return p;
}
async function shrinkAll(urls:string[],maxW:number,maxH:number,quality=0.68):Promise<Record<string,string>>{
  const unique=[...new Set(urls.filter(Boolean))];
  const results=await Promise.all(unique.map(u=>shrinkForPdf(u,maxW,maxH,quality)));
  const map:Record<string,string>={};
  unique.forEach((u,i)=>{map[u]=results[i];});
  return map;
}

// ── PDF EXPORT: training program ──────────────────────────
export async function printPDF(c:any,pl:any[]){
  const allExIds=[...new Set(Object.values(c.program||{}).flat().map((e:any)=>e.id).filter(Boolean))];
  const exMap:any={};
  if(allExIds.length){const full=await sb.get("exercises",`?id=in.(${allExIds.join(",")})&select=id,imgs,cover_img`);full.forEach((e:any)=>{exMap[e.id]=e;});}
  const prog=c.program||{},pn=c.program_name||"";
  const bv=calcBMI(c.weight,c.height),bn=bv?parseFloat(bv.toFixed(1)):null,bc=bn?bmiCat(bn):null;
  const nut2=calcNut(c.weight,c.height,c.age,c.gender,ACTIVITY_LEVELS[c.activity_index??2]?.factor||1.55);
  const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
  const today2=new Date().toLocaleDateString("lt-LT");
  const diffRaw=calcDifficulty(prog);
  const diff=diffRaw?{...diffRaw,color:pdfSafeColor(diffRaw.color)}:null;
  const win=window.open("","_blank");
  if(!win){alert("Leiskite iššokančius langus!");return;}
  win.document.write(`<!DOCTYPE html><html lang="lt"><head><meta charset="UTF-8"><title>Ruošiama...</title></head><body style="font-family:sans-serif;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">⏳ Ruošiama PDF...</body></html>`);

  // Shrink exercise photos to the exact size they're displayed at (78×62px)
  // BEFORE building the document — this is what keeps the saved PDF small.
  const allImgUrls:string[]=[];
  Object.values(exMap).forEach((e:any)=>{
    const imgs=(e.imgs&&e.imgs.length?e.imgs:e.cover_img?[e.cover_img]:[]).filter(Boolean);
    allImgUrls.push(imgs[0],imgs[1]);
  });
  const shrunk=await shrinkAll(allImgUrls,220,180,0.68);

  const goldHex="#D4A853";
  const css2=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Barlow',Arial,sans-serif;background:#F5F2EC;color:#1A1A1A;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:11px;}.cover{background:#060709;position:relative;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.cover-inner{padding:32px 36px 28px;position:relative;z-index:1;}.cover-bg{position:absolute;inset:0;background:linear-gradient(135deg,#060709 40%,#0F1118 100%);}.cover-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(212,168,83,0.06)1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.06)1px,transparent 1px);background-size:40px 40px;}.cover-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;}.logo-wrap{display:flex;align-items:center;gap:12px;}.logo-text{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#F5F0E8;letter-spacing:0.22em;text-transform:uppercase;line-height:1;}.logo-sub{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#404858;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;}.date-tag{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#606878;letter-spacing:0.14em;text-align:right;}.cover-label{display:flex;align-items:center;gap:10px;margin-bottom:8px;}.cover-num{font-family:'Bebas Neue',sans-serif;font-size:10px;color:#D4A853;letter-spacing:0.3em;}.cover-line{width:20px;height:1px;background:#D4A853;}.cover-main{font-family:'Bebas Neue',sans-serif;font-size:52px;color:#FFFFFF;line-height:0.9;letter-spacing:0.03em;}.cover-gold{color:#D4A853;}.cover-meta{display:flex;gap:20px;margin-top:16px;flex-wrap:wrap;}.meta-item{}.meta-label{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#505868;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:2px;}.meta-val{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#F5F0E8;}.meta-gold{color:#D4A853;}.diff-bar{background:#0C0E14;border-top:1px solid #1E2330;padding:10px 36px;display:flex;align-items:center;gap:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.diff-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#505868;letter-spacing:0.18em;text-transform:uppercase;}.diff-track{flex:1;height:3px;background:#1E2330;max-width:180px;}.diff-fill{height:100%;}.diff-tag{font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.12em;padding:2px 9px;border:1px solid;}.pb{position:fixed;top:10px;right:10px;padding:9px 18px;background:#D4A853;color:#060709;border:none;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;z-index:999;}.sec{margin:14px 18px;background:#FFFFFF;border:1px solid #E8E4DC;}.sh{background:#060709;padding:9px 16px;display:flex;align-items:center;gap:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.sn{font-family:'Bebas Neue',sans-serif;font-size:9px;color:#D4A853;letter-spacing:0.3em;}.sl{width:14px;height:1px;background:#D4A853;}.st{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;color:#F5F0E8;letter-spacing:0.16em;text-transform:uppercase;}.ig{display:flex;flex-wrap:wrap;gap:1px;background:#E8E4DC;}.ib{background:#FFFFFF;padding:9px 12px;min-width:75px;}.il{font-size:8px;color:#9A9888;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:2px;font-family:'Barlow Condensed',sans-serif;}.iv{font-size:13px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}.dh{background:#F5F2EC;padding:8px 16px;border-bottom:1px solid #E8E4DC;display:flex;align-items:center;justify-content:space-between;}.dn{font-family:'Bebas Neue',sans-serif;font-size:16px;color:#1A1A1A;letter-spacing:0.06em;}.dc{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#9A9888;letter-spacing:0.12em;text-transform:uppercase;}.er{display:flex;gap:10px;padding:9px 14px;border-top:1px solid #F0EDE8;align-items:flex-start;page-break-inside:avoid;}.en{width:18px;height:18px;background:#060709;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:10px;color:#D4A853;flex-shrink:0;margin-top:3px;}.ei{width:78px;height:62px;object-fit:cover;flex-shrink:0;border:1px solid #E8E4DC;}.ep{width:78px;height:62px;background:#F5F2EC;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;border:1px solid #E8E4DC;}.en2{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#1A1A1A;letter-spacing:0.04em;margin-bottom:1px;}.em{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#D4A853;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;margin-bottom:5px;}.chips{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:3px;}.chip{padding:2px 8px;font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.08em;border:1px solid;}.cg{background:#D4A85318;border-color:#D4A85140;color:#8B6520;}.cb{background:#5B8DB818;border-color:#5B8DB840;color:#3A6A90;}.cv{background:#7B6DB018;border-color:#7B6DB040;color:#5A4A90;}.cn{background:#4E906818;border-color:#4E906840;color:#2A6040;}.css2{background:#7B6DB030;border-color:#7B6DB060;color:#5A4A90;}.ed{font-size:9px;color:#9A9888;font-style:italic;line-height:1.5;margin-top:2px;}.ng{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #E8E4DC;}.nc{padding:12px 14px;}.nt{font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid;}.pt{width:100%;border-collapse:collapse;}.pt th{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#9A9888;letter-spacing:0.14em;text-transform:uppercase;padding:6px 10px;background:#F5F2EC;border-bottom:1px solid #E8E4DC;text-align:left;}.pt td{padding:6px 10px;border-bottom:1px solid #F5F2EC;font-size:10px;}.ft{text-align:center;padding:12px;color:#C8C4BC;font-size:9px;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.14em;text-transform:uppercase;border-top:1px solid #E8E4DC;margin:14px 18px 18px;}@media print{.pb{display:none;}body{background:#fff;}.sec{margin:10px 14px;}}`;
  let h=`<!DOCTYPE html><html lang="lt"><head><meta charset="UTF-8"><title>${pn||"Programa"} · ${c.name}</title><style>${css2}</style></head><body>`;
  h+=`<button class="pb" onclick="window.print()">🖨️ Spausdinti / PDF</button>`;
  h+=`<div class="cover"><div class="cover-bg"></div><div class="cover-grid"></div><div class="cover-inner"><div class="cover-top"><div class="logo-wrap"><svg width="32" height="32" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21" stroke="${goldHex}" stroke-width="1.2" opacity="0.6"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="${goldHex}" stroke-width="1.4" fill="none"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="${goldHex}" stroke-width="1.4" fill="none" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="${goldHex}" stroke-width="1.4" fill="none" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="2.5" fill="${goldHex}"/></svg><div><div class="logo-text">DNA TRAINER</div><div class="logo-sub">Coach Platform</div></div></div><div class="date-tag">${today2}</div></div><div class="cover-label"><span class="cover-num">01</span><div class="cover-line"></div></div><div class="cover-main">${pn||"TRENIRUOČIŲ"}<br/><span class="cover-gold">PROGRAMA</span></div><div class="cover-meta">`;
  if(c.name)h+=`<div class="meta-item"><div class="meta-label">Klientas</div><div class="meta-val">${c.name}</div></div>`;
  if(c.goal)h+=`<div class="meta-item"><div class="meta-label">Tikslas</div><div class="meta-val meta-gold">${c.goal}</div></div>`;
  if(c.level)h+=`<div class="meta-item"><div class="meta-label">Lygis</div><div class="meta-val">${c.level}</div></div>`;
  h+=`<div class="meta-item"><div class="meta-label">Treniruočių dienų</div><div class="meta-val meta-gold">${days2.length}/sav.</div></div>`;
  h+=`</div></div>`;
  if(diff)h+=`<div class="diff-bar"><span class="diff-lbl">Sunkumas</span><div class="diff-track"><div class="diff-fill" style="width:${diff.score*10}%;background:${diff.color}"></div></div><span class="diff-tag" style="color:${diff.color};border-color:${diff.color}40;background:${diff.color}15">${diff.label.toUpperCase()} ${diff.score}/10</span></div>`;
  h+=`</div>`;
  h+=`<div class="sec"><div class="sh"><span class="sn">02</span><div class="sl"></div><span class="st">Kliento informacija</span></div><div class="ig">`;
  if(c.name)h+=`<div class="ib"><div class="il">Vardas</div><div class="iv">${c.name}</div></div>`;
  if(c.age)h+=`<div class="ib"><div class="il">Amžius</div><div class="iv">${c.age} m.</div></div>`;
  if(c.weight)h+=`<div class="ib"><div class="il">Svoris</div><div class="iv">${c.weight} kg</div></div>`;
  if(c.height)h+=`<div class="ib"><div class="il">Ūgis</div><div class="iv">${c.height} cm</div></div>`;
  if(c.gender)h+=`<div class="ib"><div class="il">Lytis</div><div class="iv">${c.gender}</div></div>`;
  if(bn)h+=`<div class="ib" style="background:${bc!.color}15;"><div class="il">KMI</div><div class="iv" style="color:${bc!.color}">${bn} — ${bc!.label}</div></div>`;
  h+=`</div>${c.notes?`<div style="padding:9px 14px;font-size:10px;color:#9A9888;font-style:italic;border-top:1px solid #F5F2EC;">📝 ${c.notes}</div>`:""}</div>`;
  if(nut2){
    h+=`<div class="sec"><div class="sh"><span class="sn">03</span><div class="sl"></div><span class="st">Mitybos rekomendacijos</span></div><div class="ng">`;
    h+=`<div class="nc" style="border-right:1px solid #E8E4DC;"><div class="nt" style="color:#C05050;border-color:#C0505040;">🔻 Riebalų deginimas — ${nut2.lose} kcal/d.</div><div style="display:flex;gap:4px;flex-wrap:wrap;"><div class="ib" style="background:#C0505012;"><div class="il">Baltymai</div><div class="iv" style="color:#C05050">${nut2.protLose}g</div></div><div class="ib" style="background:#E07B5A12;"><div class="il">Angliavandeniai</div><div class="iv" style="color:#E07B5A">${nut2.carbLose}g</div></div><div class="ib" style="background:#7B6DB012;"><div class="il">Riebalai</div><div class="iv" style="color:#7B6DB0">${nut2.fatLose}g</div></div></div></div>`;
    h+=`<div class="nc"><div class="nt" style="color:#4E9068;border-color:#4E906840;">🔺 Raumenų auginimas — ${nut2.gain} kcal/d.</div><div style="display:flex;gap:4px;flex-wrap:wrap;"><div class="ib" style="background:#4E906812;"><div class="il">Baltymai</div><div class="iv" style="color:#4E9068">${nut2.protGain}g</div></div><div class="ib" style="background:#E07B5A12;"><div class="il">Angliavandeniai</div><div class="iv" style="color:#E07B5A">${nut2.carbGain}g</div></div><div class="ib" style="background:#7B6DB012;"><div class="il">Riebalai</div><div class="iv" style="color:#7B6DB0">${nut2.fatGain}g</div></div></div></div>`;
    h+=`</div></div>`;
  }
  let dn=4;
  days2.forEach(day2=>{
    const exs=prog[day2]||[];
    h+=`<div class="sec"><div class="sh"><span class="sn">${String(dn++).padStart(2,"0")}</span><div class="sl"></div><span class="st">${day2}</span></div><div class="dh"><div class="dn">${day2.toUpperCase()}</div><div class="dc">${exs.length} pratimas(-ai)</div></div>`;
    if(!exs.length)h+=`<div style="padding:12px 16px;color:#C8C4BC;font-size:10px;font-style:italic;">Pratimų nėra</div>`;
    else exs.forEach((ex:any,i:number)=>{
      const fullEx=exMap[ex.id]||ex;const imgs=(fullEx.imgs&&fullEx.imgs.length?fullEx.imgs:fullEx.cover_img?[fullEx.cover_img]:[]).filter(Boolean);
      h+=`<div class="er"><div class="en">${i+1}</div>`;
      h+=imgs[0]?`<img src="${shrunk[imgs[0]]||imgs[0]}" class="ei" onerror="this.style.display='none'"/>`:`<div class="ep">📷</div>`; h+=imgs[1]?`<img src="${shrunk[imgs[1]]||imgs[1]}" class="ei" onerror="this.style.display='none'"/>`:``;
      h+=`<div style="flex:1"><div class="en2">${ex.superset?`<span class="chip css2">SS</span> `:""}${ex.name}</div><div class="em">${ex.muscle||""}${ex.equipment?` · ${ex.equipment}`:""}</div><div class="chips">`;
      if(ex.customSets)h+=`<span class="chip cg">Ser: ${ex.customSets}</span>`;
      if(ex.customReps)h+=`<span class="chip cb">Kart: ${ex.customReps}</span>`;
      if(ex.customWeight)h+=`<span class="chip cn">Svoris: ${ex.customWeight}kg</span>`;
      if(ex.customRest)h+=`<span class="chip cv">Poilsis: ${ex.customRest}</span>`;
      h+=`</div>${ex.description?`<div class="ed">${ex.description}</div>`:""}</div></div>`;
    });
    h+=`</div>`;
  });
  if(pl&&pl.length>0){
    h+=`<div class="sec"><div class="sh"><span class="sn">${String(dn++).padStart(2,"0")}</span><div class="sl"></div><span class="st">Pažangos istorija</span></div>`;
    h+=`<table class="pt"><thead><tr><th>Data</th><th>Svoris</th><th>Krūtinė</th><th>Juosmuo</th><th>Klubai</th><th>Pastabos</th></tr></thead><tbody>`;
    pl.forEach((p:any,i:number)=>{h+=`<tr style="background:${i%2?"#FAFAF8":"#FFF"}"><td>${new Date(p.date).toLocaleDateString("lt-LT")}</td><td style="font-weight:700;color:#D4A853;font-family:'Barlow Condensed'">${p.weight?p.weight+" kg":"—"}</td><td>${p.chest?p.chest+" cm":"—"}</td><td>${p.waist?p.waist+" cm":"—"}</td><td>${p.hips?p.hips+" cm":"—"}</td><td style="color:#9A9888;font-style:italic">${p.notes||"—"}</td></tr>`;});
    h+=`</tbody></table></div>`;
  }
  const waitScript=`<script>(function(){var btn=document.querySelector('.pb');if(!btn)return;var imgs=Array.prototype.slice.call(document.images);var pending=imgs.filter(function(im){return !im.complete;}).length;if(pending>0){var orig=btn.textContent;btn.textContent='⏳ Kraunamos nuotraukos...';btn.disabled=true;btn.style.opacity='0.6';var done=function(){pending--;if(pending<=0){btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';}};imgs.forEach(function(im){if(!im.complete){im.addEventListener('load',done);im.addEventListener('error',done);}});setTimeout(function(){if(pending>0){btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';}},6000);}})();</script>`;
  h+=`<div class="ft">DNA Trainer · Coach Platform · ${today2}</div>${waitScript}</body></html>`;
  win.document.open();win.document.write(h);win.document.close();
}

// ── PDF EXPORT: meal plan ─────────────────────────────────
export async function printMealPDF(c:any){
  const mp=c.meal_plan||{},mpn=c.meal_plan_name||"Mitybos planas";
  const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
  const today2=new Date().toLocaleDateString("lt-LT");
  const win=window.open("","_blank");
  if(!win){alert("Leiskite iššokančius langus!");return;}
  win.document.write(`<!DOCTYPE html><html lang="lt"><head><meta charset="UTF-8"><title>Ruošiama...</title></head><body style="font-family:sans-serif;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">⏳ Ruošiama PDF...</body></html>`);

  // Shrink food photos to the exact size they're displayed at (52×52px)
  // BEFORE building the document — keeps the saved PDF small.
  const allImgUrls:string[]=[];
  days2.forEach(day=>{
    const dayData=mp[day]||{};
    (Object.values(dayData).flat() as any[]).forEach((f:any)=>{
      const img=(f.imgs||[]).filter(Boolean)[0];
      if(img)allImgUrls.push(img);
    });
  });
  const shrunk=await shrinkAll(allImgUrls,150,150,0.68);

  const pstyle=`*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#fff;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}.hdr{background:#1A1A1A;padding:18px 24px;display:flex;align-items:center;gap:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.logo{width:42px;height:42px;background:linear-gradient(135deg,#2D7D46,#1F5C33);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;flex-shrink:0}.ht{font-size:17px;font-weight:900;color:#22c55e}.hs{font-size:9px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px}.hr{margin-left:auto;text-align:right;color:#fff}.sec{margin:12px 18px;border:1.5px solid #e0e0e8;border-radius:11px;overflow:hidden}.sh{background:#1A1A1A;color:#fff;padding:9px 16px;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;-webkit-print-color-adjust:exact;print-color-adjust:exact}.day-tot{display:flex;gap:8px;padding:8px 14px;background:#f9fafb;border-bottom:1px solid #eee;flex-wrap:wrap}.tot-badge{border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700}.mt-hdr{padding:8px 14px 4px;font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px}.fr{display:flex;gap:10px;padding:6px 14px;border-top:1px solid #f5f5f5;align-items:center;page-break-inside:avoid}.fi{width:52px;height:52px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid #eee}.fp{width:52px;height:52px;background:#f0f0f5;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px}.fn{font-size:12px;font-weight:700;margin-bottom:2px}.fg{font-size:10px;color:#888}.fb{display:flex;gap:5px;margin-top:3px;flex-wrap:wrap}.fbb{border-radius:5px;padding:2px 7px;font-size:10px;font-weight:600}.pb{position:fixed;top:10px;right:10px;padding:9px 18px;background:#2D7D46;color:#fff;border:none;border-radius:8px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;z-index:999;box-shadow:0 2px 8px #0003}.ft{text-align:center;padding:14px;color:#aaa;font-size:10px;border-top:1px solid #eee;margin-top:10px}@media(max-width:600px){.sec{margin:8px 10px}.fr{gap:8px;padding:5px 10px}.fi,.fp{width:42px;height:42px}.pb{top:6px;right:6px;padding:7px 12px;font-size:12px}}@media print{.pb{display:none}}`;
  let h=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${mpn}-${c.name}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>${pstyle}</style></head><body>`;
  h+=`<button class="pb" onclick="window.print()">🖨️ Išsaugoti kaip PDF</button>`;
  h+=`<div class="hdr"><div class="logo">🥗</div><div><div class="ht">DNA Trainer</div><div class="hs">Mitybos planas</div></div><div class="hr"><div style="font-size:13px;font-weight:700">${mpn}</div><div style="font-size:10px;color:#888;margin-top:2px">${c.name} · ${today2}</div></div></div>`;
  h+=`<div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 18px;background:#f9fafb;border-bottom:1px solid #eee">`;
  if(c.name)h+=`<span style="background:#f0f0f8;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600">👤 ${c.name}</span>`;
  if(c.goal)h+=`<span style="background:#f0b42918;border:1px solid #f0b42940;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;color:#c9a000">${c.goal}</span>`;
  if(c.weight)h+=`<span style="background:#f0f0f8;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600">⚖️ ${c.weight} kg</span>`;
  h+=`</div>`;
  days2.forEach(day=>{
    const dayData=mp[day]||{};
    const allItems:any[]=Object.values(dayData).flat();
    if(!allItems.length)return;
    const tot=allItems.reduce((a:any,f:any)=>({kcal:a.kcal+(f.kcalActual||0),prot:a.prot+(f.protActual||0),carbs:a.carbs+(f.carbsActual||0),fat:a.fat+(f.fatActual||0)}),{kcal:0,prot:0,carbs:0,fat:0});
    h+=`<div class="sec"><div class="sh">${day}</div>`;
    h+=`<div class="day-tot">`;
    h+=`<span class="tot-badge" style="background:#f0b42920;color:#c9a000">${Math.round(tot.kcal)} kcal</span>`;
    h+=`<span class="tot-badge" style="background:#ef444420;color:#dc2626">B: ${Math.round(tot.prot)}g</span>`;
    h+=`<span class="tot-badge" style="background:#f9731620;color:#ea6100">A: ${Math.round(tot.carbs)}g</span>`;
    h+=`<span class="tot-badge" style="background:#a78bfa20;color:#7c3aed">R: ${Math.round(tot.fat)}g</span>`;
    h+=`</div>`;
    const MEAL_TIMES_ORDER=["🌅 Pusryčiai","☀️ Priešpiečiai","🍽️ Pietūs","🌤️ Užkandis","🌙 Vakarienė"];
    MEAL_TIMES_ORDER.forEach(mt=>{
      const items=(dayData[mt]||[]) as any[];
      if(!items.length)return;
      const mtKcal=items.reduce((a:any,f:any)=>a+(f.kcalActual||0),0);
      h+=`<div class="mt-hdr">${mt} <span style="color:#888;font-weight:400;font-size:9px;margin-left:4px">${Math.round(mtKcal)} kcal</span></div>`;
      items.forEach(f=>{
        const img=(f.imgs||[]).filter(Boolean)[0];
        h+=`<div class="fr">`;
        h+=img?`<img src="${shrunk[img]||img}" class="fi"/>`:`<div class="fp">🍽️</div>`;
        h+=`<div style="flex:1"><div class="fn">${f.name}</div><div class="fg">${f.grams}g · ${f.category||""}</div>`;
        h+=`<div class="fb">`;
        if(f.kcalActual)h+=`<span class="fbb" style="background:#f0b42918;color:#c9a000">${f.kcalActual} kcal</span>`;
        if(f.protActual)h+=`<span class="fbb" style="background:#ef444418;color:#dc2626">B:${f.protActual}g</span>`;
        if(f.carbsActual)h+=`<span class="fbb" style="background:#f9731618;color:#ea6100">A:${f.carbsActual}g</span>`;
        if(f.fatActual)h+=`<span class="fbb" style="background:#a78bfa18;color:#7c3aed">R:${f.fatActual}g</span>`;
        h+=`</div></div></div>`;
      });
    });
    h+=`</div>`;
  });
  h+=`<div class="ft">© DNA Trainer · Mitybos planas · ${today2}</div></body></html>`;
  win.document.open();win.document.write(h);win.document.close();
}

// ── SINGLE-IMAGE (JPG) EXPORT ──────────────────────────────
// Renders the whole program/meal plan as one tall JPG using <canvas>.
// Images are fetched through our own edge function (image-proxy) so a
// canvas export never fails due to the source host's CORS policy.
function loadImageViaProxy(url:string):Promise<HTMLImageElement|null>{
  return new Promise((resolve)=>{
    if(!url){resolve(null);return;}
    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=`${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
  });
}

function wrapCanvasText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number):string[]{
  const words=(text||"").split(/\s+/).filter(Boolean);
  const lines:string[]=[];
  let cur="";
  for(const w of words){
    const test=cur?cur+" "+w:w;
    if(ctx.measureText(test).width>maxWidth&&cur){lines.push(cur);cur=w;}
    else cur=test;
  }
  if(cur)lines.push(cur);
  return lines.length?lines:[""];
}

function roundRectPath(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

export async function generateTrainingJpg(c:any):Promise<void>{
  const W=880,PAD=32,SCALE=2;
  const prog=c.program||{};
  const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
  const today2=new Date().toLocaleDateString("lt-LT");

  const allExIds=[...new Set(Object.values(prog).flat().map((e:any)=>e.id).filter(Boolean))];
  const exMap:any={};
  if(allExIds.length){const full=await sb.get("exercises",`?id=in.(${allExIds.join(",")})&select=id,imgs,cover_img`);full.forEach((e:any)=>{exMap[e.id]=e;});}

  // measure pass
  const meas=document.createElement("canvas");
  const mctx=meas.getContext("2d")!;
  mctx.font="600 13px Arial";
  const rows:{day:string,ex:any,lines:string[],height:number}[]=[];
  const chipFont="700 10px Arial";
  days2.forEach(day=>{
    (prog[day]||[]).forEach((ex:any)=>{
      mctx.font="600 13px Arial";
      const lines=wrapCanvasText(mctx,ex.description||"",W-PAD*2-84-14);
      const descLines=ex.description?Math.min(lines.length,3):0;
      const h=Math.max(74,40+descLines*15+16);
      rows.push({day,ex,lines:ex.description?lines.slice(0,3):[],height:h});
    });
  });
  const headerH=150;
  const dayHeaderH=40;
  const footerH=50;
  let totalH=headerH+footerH;
  let curDay="";
  rows.forEach(r=>{ if(r.day!==curDay){totalH+=dayHeaderH;curDay=r.day;} totalH+=r.height; });
  if(rows.length===0)totalH+=60;

  const canvas=document.createElement("canvas");
  canvas.width=W*SCALE;canvas.height=totalH*SCALE;
  const ctx=canvas.getContext("2d")!;
  ctx.scale(SCALE,SCALE);
  ctx.fillStyle="#FFFFFF";ctx.fillRect(0,0,W,totalH);

  // header
  ctx.fillStyle="#0B0D12";ctx.fillRect(0,0,W,headerH);
  ctx.fillStyle="#D4A853";ctx.font="700 11px Arial";ctx.textBaseline="alphabetic";
  ctx.fillText("DNA TRAINER",PAD,36);
  ctx.fillStyle="#606878";ctx.font="10px Arial";
  ctx.fillText(today2,W-PAD-ctx.measureText(today2).width,36);
  ctx.fillStyle="#FFFFFF";ctx.font="700 30px Arial";
  ctx.fillText(c.program_name||"Treniruočių programa",PAD,80);
  ctx.fillStyle="#D4A853";ctx.font="600 13px Arial";
  ctx.fillText(c.name||"",PAD,106);
  const metaBits=[c.goal,c.level].filter(Boolean).join("  ·  ");
  if(metaBits){ctx.fillStyle="#8A93A0";ctx.font="11px Arial";ctx.fillText(metaBits,PAD,126);}

  let y=headerH;
  curDay="";
  for(const r of rows){
    if(r.day!==curDay){
      ctx.fillStyle="#F5F2EC";ctx.fillRect(0,y,W,dayHeaderH);
      ctx.fillStyle="#0B0D12";ctx.font="700 15px Arial";
      ctx.fillText(r.day.toUpperCase(),PAD,y+26);
      y+=dayHeaderH;
      curDay=r.day;
    }
    const rowTop=y;
    ctx.strokeStyle="#EEEBE4";ctx.beginPath();ctx.moveTo(0,rowTop);ctx.lineTo(W,rowTop);ctx.stroke();

    // photo
    const fullEx=exMap[r.ex.id]||r.ex;
    const imgUrl=(fullEx.imgs&&fullEx.imgs[0])||fullEx.cover_img;
    const px=PAD,py=rowTop+10,pw=64,ph=r.height-20;
    if(imgUrl){
      const img=await loadImageViaProxy(imgUrl);
      if(img){
        roundRectPath(ctx,px,py,pw,ph,8);ctx.save();ctx.clip();
        const scale=Math.max(pw/img.width,ph/img.height);
        const dw=img.width*scale,dh=img.height*scale;
        ctx.drawImage(img,px-(dw-pw)/2,py-(dh-ph)/2,dw,dh);
        ctx.restore();
      }
    }
    if(!imgUrl){
      ctx.fillStyle="#F5F2EC";roundRectPath(ctx,px,py,pw,ph,8);ctx.fill();
      ctx.fillStyle="#B8B2A6";ctx.font="20px Arial";ctx.fillText("📷",px+pw/2-10,py+ph/2+7);
    }

    const tx=px+pw+14;
    ctx.fillStyle="#0B0D12";ctx.font="700 14px Arial";
    ctx.fillText(r.ex.name||"",tx,rowTop+24);
    ctx.fillStyle="#B8902A";ctx.font="700 10px Arial";
    ctx.fillText((r.ex.muscle||"")+(r.ex.equipment?" · "+r.ex.equipment:""),tx,rowTop+40);

    let cx=tx;
    const chip=(label:string,val:string,bg:string,fg:string)=>{
      if(!val)return;
      const text=`${label}: ${val}`;
      ctx.font=chipFont;
      const tw=ctx.measureText(text).width;
      ctx.fillStyle=bg;roundRectPath(ctx,cx,rowTop+48,tw+14,18,5);ctx.fill();
      ctx.fillStyle=fg;ctx.fillText(text,cx+7,rowTop+61);
      cx+=tw+14+6;
    };
    chip("Ser",r.ex.customSets,"#D4A85320","#8B6520");
    chip("Kart",r.ex.customReps,"#5B8DB820","#3A6A90");
    chip("Sv",r.ex.customWeight?r.ex.customWeight+"kg":"","#4E906820","#2A6040");
    chip("Poilsis",r.ex.customRest,"#7B6DB020","#5A4A90");

    if(r.lines.length){
      ctx.fillStyle="#8A93A0";ctx.font="italic 11px Arial";
      r.lines.forEach((line,i)=>ctx.fillText(line,tx,rowTop+74+i*15));
    }
    y+=r.height;
  }

  if(rows.length===0){
    ctx.fillStyle="#B8B2A6";ctx.font="13px Arial";
    ctx.fillText("Pratimų nėra",PAD,y+34);
    y+=60;
  }

  ctx.fillStyle="#F5F2EC";ctx.fillRect(0,y,W,footerH);
  ctx.fillStyle="#B8B2A6";ctx.font="10px Arial";
  const ftext="DNA Trainer · Coach Platform";
  ctx.fillText(ftext,(W-ctx.measureText(ftext).width)/2,y+29);

  const blob:Blob=await new Promise((res)=>canvas.toBlob(b=>res(b as Blob),"image/jpeg",0.85));
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=`${(c.program_name||"programa").replace(/[^\w\s-]/g,"")}-${(c.name||"").replace(/[^\w\s-]/g,"")}.jpg`;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),4000);
}

export async function generateMealJpg(c:any):Promise<void>{
  const W=880,PAD=32,SCALE=2;
  const mp=c.meal_plan||{};
  const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
  const today2=new Date().toLocaleDateString("lt-LT");
  const MEAL_TIMES_ORDER=["🌅 Pusryčiai","☀️ Priešpiečiai","🍽️ Pietūs","🌤️ Užkandis","🌙 Vakarienė"];

  const meas=document.createElement("canvas");
  const mctx=meas.getContext("2d")!;

  type Row={kind:"day"|"meal"|"food",text?:string,food?:any,height:number};
  const rows:Row[]=[];
  days2.forEach(day=>{
    const dayData=mp[day]||{};
    const items:any[]=Object.values(dayData).flat();
    if(!items.length)return;
    rows.push({kind:"day",text:day,height:38});
    MEAL_TIMES_ORDER.forEach(mt=>{
      const mtItems=(dayData[mt]||[]) as any[];
      if(!mtItems.length)return;
      rows.push({kind:"meal",text:mt,height:26});
      mtItems.forEach(f=>rows.push({kind:"food",food:f,height:66}));
    });
  });

  const headerH=140,footerH=50;
  let totalH=headerH+footerH+rows.reduce((a,r)=>a+r.height,0);
  if(rows.length===0)totalH+=60;

  const canvas=document.createElement("canvas");
  canvas.width=W*SCALE;canvas.height=totalH*SCALE;
  const ctx=canvas.getContext("2d")!;
  ctx.scale(SCALE,SCALE);
  ctx.fillStyle="#FFFFFF";ctx.fillRect(0,0,W,totalH);

  ctx.fillStyle="#1A1A1A";ctx.fillRect(0,0,W,headerH);
  ctx.fillStyle="#22c55e";ctx.font="700 11px Arial";
  ctx.fillText("DNA TRAINER · MITYBOS PLANAS",PAD,36);
  ctx.fillStyle="#888";ctx.font="10px Arial";
  ctx.fillText(today2,W-PAD-ctx.measureText(today2).width,36);
  ctx.fillStyle="#FFFFFF";ctx.font="700 28px Arial";
  ctx.fillText(c.meal_plan_name||"Mitybos planas",PAD,78);
  ctx.fillStyle="#22c55e";ctx.font="600 13px Arial";
  ctx.fillText(c.name||"",PAD,102);
  if(c.goal){ctx.fillStyle="#aaa";ctx.font="11px Arial";ctx.fillText(c.goal,PAD,122);}

  let y=headerH;
  for(const r of rows){
    if(r.kind==="day"){
      ctx.fillStyle="#1A1A1A";ctx.fillRect(0,y,W,r.height);
      ctx.fillStyle="#FFFFFF";ctx.font="700 15px Arial";
      ctx.fillText(r.text!.toUpperCase(),PAD,y+25);
    }else if(r.kind==="meal"){
      ctx.fillStyle="#F0FDF4";ctx.fillRect(0,y,W,r.height);
      ctx.fillStyle="#16a34a";ctx.font="700 11px Arial";
      ctx.fillText(r.text!,PAD,y+18);
    }else if(r.kind==="food"){
      const f=r.food;
      ctx.strokeStyle="#F0F0F0";ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
      const px=PAD,py=y+7,pw=52,ph=52;
      const imgUrl=(f.imgs||[]).filter(Boolean)[0];
      if(imgUrl){
        const img=await loadImageViaProxy(imgUrl);
        if(img){
          roundRectPath(ctx,px,py,pw,ph,8);ctx.save();ctx.clip();
          const scale=Math.max(pw/img.width,ph/img.height);
          const dw=img.width*scale,dh=img.height*scale;
          ctx.drawImage(img,px-(dw-pw)/2,py-(dh-ph)/2,dw,dh);
          ctx.restore();
        }
      }
      if(!imgUrl){
        ctx.fillStyle="#F5F5F8";roundRectPath(ctx,px,py,pw,ph,8);ctx.fill();
        ctx.fillStyle="#B0B0B8";ctx.font="18px Arial";ctx.fillText("🍽️",px+pw/2-9,py+ph/2+6);
      }
      const tx=px+pw+14;
      ctx.fillStyle="#111";ctx.font="700 13px Arial";
      ctx.fillText(f.name||"",tx,y+24);
      ctx.fillStyle="#888";ctx.font="10px Arial";
      ctx.fillText(`${f.grams||""}g${f.category?" · "+f.category:""}`,tx,y+38);
      let cx=tx;
      const chip=(text:string,bg:string,fg:string)=>{
        if(!text)return;
        ctx.font="700 9px Arial";
        const tw=ctx.measureText(text).width;
        ctx.fillStyle=bg;roundRectPath(ctx,cx,y+44,tw+12,16,5);ctx.fill();
        ctx.fillStyle=fg;ctx.fillText(text,cx+6,y+56);
        cx+=tw+12+5;
      };
      if(f.kcalActual)chip(`${f.kcalActual} kcal`,"#f0b42920","#c9a000");
      if(f.protActual)chip(`B:${f.protActual}g`,"#ef444420","#dc2626");
      if(f.carbsActual)chip(`A:${f.carbsActual}g`,"#f9731620","#ea6100");
      if(f.fatActual)chip(`R:${f.fatActual}g`,"#a78bfa20","#7c3aed");
    }
    y+=r.height;
  }

  if(rows.length===0){
    ctx.fillStyle="#B0B0B8";ctx.font="13px Arial";
    ctx.fillText("Maisto plano nėra",PAD,y+34);
    y+=60;
  }

  ctx.fillStyle="#FAFAFA";ctx.fillRect(0,y,W,footerH);
  ctx.fillStyle="#B0B0B8";ctx.font="10px Arial";
  const ftext="© DNA Trainer · Mitybos planas";
  ctx.fillText(ftext,(W-ctx.measureText(ftext).width)/2,y+29);

  const blob:Blob=await new Promise((res)=>canvas.toBlob(b=>res(b as Blob),"image/jpeg",0.85));
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=`${(c.meal_plan_name||"mityba").replace(/[^\w\s-]/g,"")}-${(c.name||"").replace(/[^\w\s-]/g,"")}.jpg`;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),4000);
}
