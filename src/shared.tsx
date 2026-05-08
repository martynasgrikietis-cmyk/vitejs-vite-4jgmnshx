// ── shared.tsx — constants, colors, helpers, shared UI ────
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

export const C = {
  bg:"#080A10",surface:"#0F1118",surface2:"#161A24",border:"#1E2330",
  gold:"#D4A853",goldSoft:"#D4A85318",goldBorder:"#D4A85348",
  teal:"#5B8DB8",tealSoft:"#5B8DB815",tealBorder:"#5B8DB840",
  red:"#C05050",redSoft:"#C0505015",redBorder:"#C0505040",
  green:"#4E9068",greenSoft:"#4E906815",greenBorder:"#4E906840",
  purple:"#7B6DB0",purpleSoft:"#7B6DB015",purpleBorder:"#7B6DB040",
  text:"#F0EBE0",muted:"#5A6070",faint:"#060709",
};
export const FONT = "'Inter','Helvetica Neue',system-ui,sans-serif";

export const RESPONSIVE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;} body{margin:0;background:#0A0C12;font-size:15px;}
  input,select,textarea{font-size:15px!important;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .fu{animation:fadeUp .35s ease both;}
  .fu1{animation:fadeUp .35s .06s ease both;}
  .fu2{animation:fadeUp .35s .12s ease both;}
  .fu3{animation:fadeUp .35s .18s ease both;}
  .fu4{animation:fadeUp .35s .24s ease both;}
  .ex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;}
  .cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
  .food-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
  .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .dash-bottom{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:20px;margin-top:20px;}
  .cf-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
  .macro-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
  .ex2-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .food4-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;}
  .step-nav{display:flex;gap:5px;}
  .pick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:10px;}
  .pick-row{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid #222838;background:#08090F;}
  .view-actions{display:flex;gap:8px;flex-wrap:wrap;}
  .view-actions button{flex:1;min-width:100px;}
  .meal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;}
  @media(max-width:640px){
    .ex-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
    .cl-grid,.food-grid{grid-template-columns:1fr;}
    .dash-stats{grid-template-columns:repeat(2,1fr);gap:10px;}
    .dash-bottom{grid-template-columns:1fr;}
    .cf-grid{grid-template-columns:1fr;}
    .ex2-grid{grid-template-columns:1fr 1fr;}
    .food4-grid{grid-template-columns:1fr 1fr;}
    .macro-grid{gap:4px;}
    .pick-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;}
    .pick-row{gap:8px;padding:10px 12px;}
    .pick-row>div{min-width:calc(50% - 4px);}
    .pick-row>button{width:100%;margin-top:4px;}
    .step-nav button{padding:5px 7px!important;font-size:10px!important;}
    .view-actions button{min-width:unset;font-size:11px;}
    .logout-label{display:none;}
    .header-pad{padding:10px 14px!important;}
    .content-pad{padding:16px 12px!important;}
    .modal-inner{padding:14px!important;}
    .hsubtitle{display:none;}
    .sbar{width:100%!important;}
    .tag-row{overflow-x:auto;flex-wrap:nowrap!important;padding-bottom:4px;}
    .tag-row::-webkit-scrollbar{height:3px;}
    .tag-row::-webkit-scrollbar-thumb{background:#222838;border-radius:2px;}
    .day-btns{display:grid!important;grid-template-columns:repeat(4,1fr);gap:6px!important;}
    .meal-grid{grid-template-columns:1fr;}
  }
  @media(min-width:641px) and (max-width:960px){
    .cl-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));}
    .cf-grid{grid-template-columns:1fr;}
    .dash-stats{grid-template-columns:repeat(2,1fr);}
    .dash-bottom{grid-template-columns:1fr;}
    .food4-grid{grid-template-columns:1fr 1fr;}
  }
  @media(hover:none){button{min-height:40px;}}
  .stat-card{transition:transform .15s,border-color .15s;}
  .stat-card:hover{transform:translateY(-2px);}
  .glass-card{background:rgba(15,17,24,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}
  .nav-tab{transition:all .15s;}
  .nav-tab:hover{color:#F0EBE0 !important;}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .gold-line{display:flex;align-items:center;gap:8px;}
`;


export const css = {
  page:    {minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT},
  header:  {background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 28px",display:"flex",alignItems:"center",gap:14},
  logo:    {width:36,height:36,background:C.gold,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:C.bg,flexShrink:0},
  card:    {background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:24,backdropFilter:"blur(10px)"},
  label:   {fontSize:11,color:C.muted,letterSpacing:"0.08em",marginBottom:6,display:"block",fontWeight:600,textTransform:"uppercase" as const},
  input:   {width:"100%",background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const},
  select:  {width:"100%",background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 14px",color:C.text,fontFamily:FONT,fontSize:14,outline:"none",boxSizing:"border-box" as const},
  navBtn:  (a:boolean)=>({padding:"7px 16px",borderRadius:8,border:"none",background:a?C.gold:"transparent",color:a?C.bg:C.muted,fontFamily:"'Inter',sans-serif",fontWeight:a?700:500,fontSize:13,cursor:"pointer",transition:"all 0.15s"}),
  btnG:    {padding:"11px 22px",background:C.gold,color:C.bg,border:"none",borderRadius:8,fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"},
  btnGhost:{padding:"9px 16px",background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,fontFamily:"'Mulish',sans-serif",fontWeight:500,fontSize:12,cursor:"pointer"},
  btnTeal: {padding:"8px 14px",background:C.tealSoft,color:C.teal,border:`1px solid ${C.tealBorder}`,borderRadius:7,fontFamily:"'Inter',sans-serif",fontSize:13,cursor:"pointer",fontWeight:600},
  btnRed:  {padding:"8px 14px",background:C.redSoft,color:C.red,border:`1px solid ${C.redBorder}`,borderRadius:7,fontFamily:"'Inter',sans-serif",fontSize:13,cursor:"pointer",fontWeight:600},
  btnGreen:{padding:"8px 14px",background:C.greenSoft,color:C.green,border:`1px solid ${C.greenBorder}`,borderRadius:7,fontFamily:"'Inter',sans-serif",fontSize:13,cursor:"pointer",fontWeight:600},
  secTitle:{fontSize:10,color:C.teal,letterSpacing:"0.18em",marginBottom:14,display:"block",fontWeight:700,textTransform:"uppercase" as const},
  overlay: {position:"fixed" as const,inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:8,backdropFilter:"blur(6px)"},
  modal:   (w:number)=>({background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,width:"100%",maxWidth:w||520,maxHeight:"93vh",display:"flex",flexDirection:"column" as const,overflow:"hidden",boxShadow:"0 32px 80px #00000066"}),
};

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

// Returns current coach ID from session (used for filtering queries)
export function getCoachId():string|null{
  try{const s=JSON.parse(sessionStorage.getItem("dna_session")||"null");return s?.id||null;}
  catch{return null;}
}
// Returns true if current user is admin
export function getIsAdmin():boolean{
  try{const s=JSON.parse(sessionStorage.getItem("dna_session")||"null");return s?.role==="admin";}
  catch{return false;}
}

// ── Shared UI components ──────────────────────────────────
import { useState, useRef } from "react";

export const Tag=({c,label,active,onClick}:any)=><button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,border:active?`1px solid ${c}`:`1px solid ${C.border}`,background:active?c+"22":"transparent",color:active?c:C.muted,fontFamily:FONT,fontSize:11,cursor:"pointer",fontWeight:600,flexShrink:0}}>{label}</button>;
export const Badge=({label,color}:any)=><span style={{background:color+"18",border:`1px solid ${color}44`,borderRadius:20,padding:"3px 11px",color,fontSize:11,fontWeight:700}}>{label}</span>;
export const Spinner=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,color:C.muted,fontSize:14,gap:10}}><div style={{width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Kraunama...</div>;
export const Err=({msg}:any)=>msg?<div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:C.red,marginBottom:14}}>{msg}</div>:null;
export const NutriBadge=({kcal,p,c,f}:any)=>(
  <div style={{display:"flex",gap:5,flexWrap:"wrap" as const}}>
    {kcal&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:700,color:C.gold}}>{kcal} kcal</span>}
    {p&&<span style={{background:"#ef444418",border:"1px solid #ef444440",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:600,color:"#f87171"}}>P:{p}g</span>}
    {c&&<span style={{background:"#f9731618",border:"1px solid #f9731640",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:600,color:"#fb923c"}}>C:{c}g</span>}
    {f&&<span style={{background:C.purpleSoft,border:"1px solid #a78bfa40",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:600,color:C.purple}}>F:{f}g</span>}
  </div>
);

export function ImgGallery({imgs,height=145}:{imgs:string[],height?:number}){
  const [cur,setCur]=useState(0);
  const list=(imgs||[]).filter(Boolean);
  if(!list.length)return<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:28,background:C.faint}}>📷</div>;
  return(
    <div style={{position:"relative",height,overflow:"hidden",background:C.faint}}>
      <img src={list[cur]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>(e.target as HTMLImageElement).style.display="none"}/>
      {list.length>1&&<>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p-1+list.length)%list.length);}} style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",background:"#000a",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>‹</button>
        <button onClick={e=>{e.stopPropagation();setCur(p=>(p+1)%list.length);}} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:"50%",background:"#000a",border:"none",color:"white",fontSize:14,cursor:"pointer"}}>›</button>
        <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
          {list.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setCur(i);}} style={{width:6,height:6,borderRadius:"50%",background:i===cur?"white":"rgba(255,255,255,0.35)",cursor:"pointer"}}/>)}
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
      {imgs.length>0&&(<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        {imgs.map((src,i)=>(<div key={i} style={{position:"relative",width:90,height:72,borderRadius:8,overflow:"hidden",border:`2px solid ${i===0?C.gold:C.border}`,flexShrink:0}}>
          <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          {i===0&&<div style={{position:"absolute",bottom:2,left:2,background:C.gold,borderRadius:3,padding:"1px 4px",fontSize:8,fontWeight:700,color:C.bg}}>COVER</div>}
          <div style={{position:"absolute",top:2,right:2,display:"flex",gap:2}}>
            {i>0&&<button onClick={()=>moveL(i)} style={{width:16,height:16,borderRadius:3,background:"#000a",border:"none",color:"white",fontSize:9,cursor:"pointer"}}>←</button>}
            {i<imgs.length-1&&<button onClick={()=>moveR(i)} style={{width:16,height:16,borderRadius:3,background:"#000a",border:"none",color:"white",fontSize:9,cursor:"pointer"}}>→</button>}
            <button onClick={()=>remove(i)} style={{width:16,height:16,borderRadius:3,background:"#ef4444aa",border:"none",color:"white",fontSize:9,cursor:"pointer"}}>×</button>
          </div>
        </div>))}
        <div onClick={()=>fileRef.current?.click()} style={{width:90,height:72,borderRadius:8,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontSize:10,gap:3}}>
          <span style={{fontSize:18}}>+</span><span>Pridėti</span>
        </div>
      </div>)}
      {imgs.length===0&&<div onClick={()=>fileRef.current?.click()} style={{height:70,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,gap:8,marginBottom:10,fontSize:13}}><span style={{fontSize:20}}>📷</span>Spustelėkite, kad įkeltumėte</div>}
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFile} style={{display:"none"}}/>
      <div style={{display:"flex",gap:8}}>
        <input ref={urlRef} placeholder="Arba įklijuokite nuotraukos URL..." style={{...css.input,flex:1,fontSize:12}} onKeyDown={e=>e.key==="Enter"&&addUrl()}/>
        <button onClick={addUrl} style={{...css.btnTeal,padding:"8px 14px",fontSize:16,fontWeight:800}}>+</button>
      </div>
    </div>
  );
}
