// ── Calendar.tsx — Coach calendar, schedule settings, booking page ──
import { useState, useEffect, useCallback } from "react";
import { sb, C, FONT, css, Spinner } from "./shared";

// ── Helpers ───────────────────────────────────────────────
const DAY_NAMES = ["Sekmadienis","Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis"];
const DAY_SHORT = ["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"];
const MONTH_NAMES = ["Sausis","Vasaris","Kovas","Balandis","Gegužė","Birželis","Liepa","Rugpjūtis","Rugsėjis","Spalis","Lapkritis","Gruodis"];

function toDateStr(d: Date){ return d.toISOString().slice(0,10); }
function todayStr(){ return toDateStr(new Date()); }
function addDays(d: Date, n: number){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function parseTime(t: string){ const [h,m]=t.split(":").map(Number); return h*60+m; }
function formatTime(mins: number){ const h=Math.floor(mins/60); const m=mins%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }
function getLT(d: Date){ return d.toLocaleDateString("lt-LT",{weekday:"long",month:"long",day:"numeric"}); }

const DEFAULT_SCHEDULE = {
  working_days:[1,2,3,4,5],
  start_time:"08:00",
  end_time:"18:00",
  slot_duration:60,
  advance_days:7,
  blocked_dates:[] as string[],
};

type Schedule = typeof DEFAULT_SCHEDULE;
type Booking = { id:string; date:string; time:string; client_name:string; client_phone:string; goal:string; notes:string; status:string; created_at:string; };

// Generate time slots for a day
function getSlots(schedule: Schedule, dateStr: string, bookings: Booking[]): string[] {
  const d = new Date(dateStr+"T12:00:00");
  const dow = d.getDay(); // 0=Sun
  if(!schedule.working_days.includes(dow)) return [];
  if(schedule.blocked_dates.includes(dateStr)) return [];
  const slots: string[] = [];
  const start = parseTime(schedule.start_time);
  const end = parseTime(schedule.end_time);
  const booked = bookings.filter(b=>b.date===dateStr&&b.status!=="cancelled").map(b=>b.time);
  for(let t=start; t+schedule.slot_duration<=end; t+=schedule.slot_duration){
    const ts = formatTime(t);
    if(!booked.includes(ts)) slots.push(ts);
  }
  return slots;
}

// ── BOOKING PUBLIC PAGE ───────────────────────────────────
export function BookingPage(){
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    Promise.all([
      sb.get("schedule","?limit=1").catch(()=>[]),
      sb.get("bookings",`?date=gte.${todayStr()}&order=date,time`).catch(()=>[]),
    ]).then(([sch,bk])=>{
      if(sch.length) setSchedule({...DEFAULT_SCHEDULE,...sch[0]});
      setBookings(bk);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  // Build available days (next 7 days)
  const days: string[] = [];
  for(let i=0;i<schedule.advance_days;i++){
    const d = addDays(new Date(), i);
    const ds = toDateStr(d);
    const dow = d.getDay();
    if(schedule.working_days.includes(dow) && !schedule.blocked_dates.includes(ds)){
      days.push(ds);
    }
  }

  const slots = selectedDate ? getSlots(schedule, selectedDate, bookings) : [];

  const SUPABASE_URL = "https://wtsksjyayilyyudvizsx.supabase.co";

  const submit = async()=>{
    if(!name.trim()||!phone.trim()||!selectedDate||!selectedTime){ setError("Užpildykite visus laukus."); return; }
    setSubmitting(true); setError("");
    try{
      await sb.insert("bookings",{date:selectedDate,time:selectedTime,client_name:name.trim(),client_phone:phone.trim(),goal:"",notes:"",status:"pending"});
      // Fire notification (don't await — don't block success screen if it fails)
      fetch(`${SUPABASE_URL}/functions/v1/notify-booking`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({date:selectedDate,time:selectedTime,client_name:name.trim(),client_phone:phone.trim()}),
      }).catch(()=>{});
      setDone(true);
    }catch(e:any){ setError("Klaida: "+e.message); }
    finally{ setSubmitting(false); }
  };

  if(loading) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,color:C.muted,gap:12,flexDirection:"column"}}>
      <div style={{width:28,height:28,border:`2px solid ${C.border}`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Kraunama...
    </div>
  );

  if(done) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;}body{margin:0;}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fadeUp .4s ease both;}`}</style>
      <div className="fu" style={{background:C.surface,borderRadius:24,border:`1px solid ${C.greenBorder}`,padding:"40px 32px",maxWidth:400,width:"100%",textAlign:"center",boxShadow:"0 40px 100px #00000066"}}>
        <div style={{fontSize:56,marginBottom:16}}>✅</div>
        <div style={{fontSize:22,fontWeight:900,color:C.green,marginBottom:8}}>Rezervacija patvirtinta!</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:20}}>Jūsų treniruotė užregistruota</div>
        <div style={{background:C.faint,borderRadius:12,padding:"16px 20px",marginBottom:24}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:4}}>📅 Data ir laikas</div>
          <div style={{fontSize:18,fontWeight:800,color:C.text}}>{new Date(selectedDate+"T12:00:00").toLocaleDateString("lt-LT",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          <div style={{fontSize:24,fontWeight:900,color:C.gold,marginTop:4}}>{selectedTime}</div>
        </div>
        <div style={{fontSize:13,color:C.muted}}>Coach Martynas susisieks su jumis patvirtindamas rezervaciją.</div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;}body{margin:0;}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fadeUp .4s ease both;}.fu1{animation:fadeUp .4s .08s ease both;}.fu2{animation:fadeUp .4s .16s ease both;}.slot-btn:hover{border-color:#f0b429!important;background:#f0b42918!important;color:#f0b429!important;}`}</style>

      {/* Hero */}
      <div style={{background:`linear-gradient(180deg,#0f1623 0%,${C.bg} 100%)`,padding:"36px 20px 28px",textAlign:"center",borderBottom:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,height:200,background:`radial-gradient(ellipse at 50% 0%,${C.gold}22 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{width:68,height:68,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:C.bg,margin:"0 auto 16px",boxShadow:`0 8px 28px ${C.gold}44`}} className="fu">M</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:4,letterSpacing:"-0.02em"}} className="fu1">Coach Martynas</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:4}} className="fu1">Asmeninė treniruotė — 60 min.</div>
        <div style={{fontSize:12,color:C.gold,fontWeight:600}} className="fu2">📅 Pasirinkite laiką ir užsiregistruokite</div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"24px 16px"}}>
        {/* Step 1 — Pick day */}
        <div className="fu1" style={{marginBottom:24}}>
          <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" as const,marginBottom:12}}>1. Pasirinkite dieną</div>
          {days.length===0?(
            <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"24px",textAlign:"center",color:C.muted,fontSize:13}}>
              Šiuo metu laisvų laikų nėra. Susisiekite tiesiogiai.
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
              {days.map(ds=>{
                const d=new Date(ds+"T12:00:00");
                const isToday=ds===todayStr();
                const isSel=ds===selectedDate;
                const avail=getSlots(schedule,ds,bookings).length;
                return(
                  <button key={ds} onClick={()=>{setSelectedDate(ds);setSelectedTime("");}}
                    style={{background:isSel?C.goldSoft:C.surface,borderRadius:12,border:isSel?`2px solid ${C.gold}`:`1px solid ${C.border}`,padding:"12px 10px",cursor:avail>0?"pointer":"not-allowed",opacity:avail>0?1:0.4,transition:"all .15s",textAlign:"center" as const,fontFamily:FONT}}>
                    <div style={{fontSize:10,color:isSel?C.gold:C.muted,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>{DAY_SHORT[d.getDay()]}{isToday?" · Šiandien":""}</div>
                    <div style={{fontSize:20,fontWeight:900,color:isSel?C.gold:C.text,marginBottom:2}}>{d.getDate()}</div>
                    <div style={{fontSize:10,color:isSel?C.gold:C.muted}}>{MONTH_NAMES[d.getMonth()]}</div>
                    <div style={{fontSize:9,color:avail>0?C.green:C.red,fontWeight:600,marginTop:4}}>{avail>0?`${avail} laisv${avail===1?"as":"i"}`:""}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2 — Pick time */}
        {selectedDate&&(
          <div className="fu" style={{marginBottom:24}}>
            <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" as const,marginBottom:12}}>
              2. Pasirinkite laiką — {getLT(new Date(selectedDate+"T12:00:00"))}
            </div>
            {slots.length===0?(
              <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:"20px",textAlign:"center",color:C.muted,fontSize:13}}>Šią dieną laisvų laikų nėra.</div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8}}>
                {slots.map(t=>(
                  <button key={t} className="slot-btn" onClick={()=>setSelectedTime(t)}
                    style={{background:selectedTime===t?C.goldSoft:C.surface,borderRadius:10,border:selectedTime===t?`2px solid ${C.gold}`:`1px solid ${C.border}`,padding:"12px 8px",cursor:"pointer",fontFamily:FONT,fontSize:16,fontWeight:800,color:selectedTime===t?C.gold:C.text,transition:"all .15s",textAlign:"center" as const}}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Your details */}
        {selectedDate&&selectedTime&&(
          <div className="fu" style={{marginBottom:24}}>
            <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase" as const,marginBottom:12}}>3. Jūsų duomenys</div>
            <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:20,display:"flex",flexDirection:"column" as const,gap:14}}>
              {/* Selected summary */}
              <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:24}}>📅</div>
                <div>
                  <div style={{fontSize:12,color:C.muted}}>Pasirinktas laikas</div>
                  <div style={{fontSize:14,fontWeight:800,color:C.gold}}>{getLT(new Date(selectedDate+"T12:00:00"))} · {selectedTime}</div>
                </div>
                <button onClick={()=>{setSelectedTime("");}} style={{marginLeft:"auto",background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div>
                <span style={css.label}>Vardas ir pavardė *</span>
                <input value={name} onChange={e=>setName(e.target.value)} style={css.input} placeholder="Jonas Jonaitis"/>
              </div>
              <div>
                <span style={css.label}>Telefono numeris *</span>
                <input value={phone} onChange={e=>setPhone(e.target.value)} style={css.input} placeholder="+370 600 00000" type="tel"/>
              </div>
              {error&&<div style={{background:"#ef444418",border:"1px solid #ef444440",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#f87171"}}>{error}</div>}
              <button onClick={submit} disabled={submitting} style={{...css.btnG,width:"100%",padding:"14px",fontSize:15,borderRadius:12,opacity:name&&phone?1:0.5}}>
                {submitting?"⏳ Registruojama...":"✅ Rezervuoti treniruotę"}
              </button>
              <div style={{fontSize:11,color:C.muted,textAlign:"center" as const}}>Coach Martynas susisieks su jumis patvirtinimui.</div>
            </div>
          </div>
        )}

        <div style={{textAlign:"center" as const,color:C.muted,fontSize:11,marginTop:32,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{fontWeight:700,color:C.gold,marginBottom:4}}>Coach Martynas</div>
          <div>Asmeninės treniruotės · Sporto sistema</div>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR TAB (coach view) ─────────────────────────────
export function CalendarTab(){
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [scheduleId, setScheduleId] = useState<string|null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"week"|"settings">("week");
  const [weekStart, setWeekStart] = useState<Date>(()=>{
    const d=new Date(); const dow=d.getDay(); const diff=dow===0?-6:1-dow;
    d.setDate(d.getDate()+diff); d.setHours(0,0,0,0); return d;
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking|null>(null);
  const [schedForm, setSchedForm] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [blockDate, setBlockDate] = useState("");
  const [bookingLink] = useState(()=>window.location.origin+window.location.pathname+"?type=booking");

  const load = useCallback(async()=>{
    setLoading(true);
    try{
      const [sch,bk] = await Promise.all([
        sb.get("schedule","?limit=1").catch(()=>[]),
        sb.get("bookings","?order=date,time").catch(()=>[]),
      ]);
      if(sch.length){ setSchedule({...DEFAULT_SCHEDULE,...sch[0]}); setSchedForm({...DEFAULT_SCHEDULE,...sch[0]}); setScheduleId(sch[0].id); }
      setBookings(bk);
    }finally{ setLoading(false); }
  },[]);
  useEffect(()=>{ load(); },[load]);

  const saveSchedule = async()=>{
    setSaving(true);
    try{
      if(scheduleId) await sb.update("schedule",scheduleId,schedForm);
      else{ const r=await sb.insert("schedule",schedForm); setScheduleId(r[0]?.id||null); }
      setSchedule(schedForm); setView("week");
    }catch(e:any){ alert("Klaida: "+e.message); }
    finally{ setSaving(false); }
  };

  const updateBookingStatus = async(id:string, status:string)=>{
    try{
      await sb.update("bookings",id,{status});
      setBookings(p=>p.map(b=>b.id===id?{...b,status}:b));
      if(selectedBooking?.id===id) setSelectedBooking(p=>p?{...p,status}:null);
    }catch(e:any){ alert("Klaida: "+e.message); }
  };

  const deleteBooking = async(id:string)=>{
    if(!confirm("Ištrinti šią rezervaciją?"))return;
    try{ await sb.delete("bookings",id); setBookings(p=>p.filter(b=>b.id!==id)); setSelectedBooking(null); }
    catch(e:any){ alert("Klaida: "+e.message); }
  };

  const toggleBlock = (ds:string)=>{
    const blocked = schedForm.blocked_dates||[];
    const next = blocked.includes(ds)?blocked.filter(d=>d!==ds):[...blocked,ds];
    setSchedForm(p=>({...p,blocked_dates:next}));
  };

  const toggleWorkDay = (dow:number)=>{
    const wd = schedForm.working_days||[];
    const next = wd.includes(dow)?wd.filter(d=>d!==dow):[...wd,dow];
    setSchedForm(p=>({...p,working_days:next}));
  };

  // Week days
  const weekDays: string[] = [];
  for(let i=0;i<7;i++) weekDays.push(toDateStr(addDays(weekStart,i)));

  const prevWeek=()=>setWeekStart(p=>addDays(p,-7));
  const nextWeek=()=>setWeekStart(p=>addDays(p,7));
  const goToday=()=>{const d=new Date();const dow=d.getDay();const diff=dow===0?-6:1-dow;d.setDate(d.getDate()+diff);d.setHours(0,0,0,0);setWeekStart(d);};

  const statusColor=(s:string)=>s==="confirmed"?C.green:s==="cancelled"?C.red:C.gold;
  const statusLabel=(s:string)=>s==="confirmed"?"✅ Patvirtinta":s==="cancelled"?"❌ Atšaukta":"⏳ Laukiama";

  const upcomingBookings = bookings.filter(b=>b.date>=todayStr()&&b.status!=="cancelled").sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const todayBookings = bookings.filter(b=>b.date===todayStr()&&b.status!=="cancelled");

  if(loading) return <Spinner/>;

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap" as const,gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>📅 Kalendorius</div>
          <div style={{color:C.muted,fontSize:13,marginTop:2}}>{upcomingBookings.length} artėjančių rezervacijų</div>
        </div>
        <div style={{display:"flex",gap:8,marginLeft:"auto",flexWrap:"wrap" as const}}>
          <button onClick={()=>setView(v=>v==="week"?"settings":"week")} style={{...css.btnGhost,fontSize:12}}>
            {view==="week"?"⚙️ Nustatymai":"📅 Kalendorius"}
          </button>
          <button onClick={()=>navigator.clipboard?.writeText(bookingLink)} style={{...css.btnG,fontSize:12}}>
            🔗 Kopijuoti rezervacijos nuorodą
          </button>
        </div>
      </div>

      {/* Booking link banner */}
      <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" as const}}>
        <div style={{fontSize:18}}>🔗</div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.gold,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>Klientų rezervacijos nuoroda</div>
          <div style={{fontSize:11,color:C.muted,wordBreak:"break-all" as const}}>{bookingLink}</div>
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(bookingLink)} style={{...css.btnTeal,fontSize:11,flexShrink:0}}>📋 Kopijuoti</button>
        <a href={bookingLink} target="_blank" rel="noopener noreferrer" style={{...css.btnGhost,fontSize:11,textDecoration:"none",flexShrink:0}}>🔗 Atidaryti</a>
      </div>

      {/* SETTINGS VIEW */}
      {view==="settings"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16} as any}>
          <div style={css.card}>
            <span style={css.secTitle}>Darbo dienos</span>
            <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
              {[1,2,3,4,5,6,0].map(dow=>(
                <button key={dow} onClick={()=>toggleWorkDay(dow)} style={{padding:"8px 12px",borderRadius:8,border:schedForm.working_days.includes(dow)?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:schedForm.working_days.includes(dow)?C.goldSoft:"transparent",color:schedForm.working_days.includes(dow)?C.gold:C.muted,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:600}}>
                  {DAY_SHORT[dow]}
                </button>
              ))}
            </div>
          </div>
          <div style={css.card}>
            <span style={css.secTitle}>Darbo laikas</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><span style={css.label}>Pradžia</span><input type="time" value={schedForm.start_time} onChange={e=>setSchedForm(p=>({...p,start_time:e.target.value}))} style={css.input}/></div>
              <div><span style={css.label}>Pabaiga</span><input type="time" value={schedForm.end_time} onChange={e=>setSchedForm(p=>({...p,end_time:e.target.value}))} style={css.input}/></div>
            </div>
          </div>
          <div style={css.card}>
            <span style={css.secTitle}>Blokuoti datos</span>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input type="date" value={blockDate} onChange={e=>setBlockDate(e.target.value)} style={{...css.input,flex:1}}/>
              <button onClick={()=>{if(blockDate){toggleBlock(blockDate);setBlockDate("");}}} style={{...css.btnRed,flexShrink:0}}>+ Blokuoti</button>
            </div>
            {(schedForm.blocked_dates||[]).length===0?<div style={{fontSize:12,color:C.muted}}>Nėra blokuotų datų</div>:(
              <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                {(schedForm.blocked_dates||[]).sort().map(ds=>(
                  <div key={ds} style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:7,padding:"4px 10px",fontSize:11,color:C.red,display:"flex",alignItems:"center",gap:6}}>
                    {new Date(ds+"T12:00:00").toLocaleDateString("lt-LT")}
                    <button onClick={()=>toggleBlock(ds)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:14,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={css.card}>
            <span style={css.secTitle}>Informacija</span>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
              <div>⏱️ Sesijos trukmė: <b style={{color:C.text}}>60 min.</b></div>
              <div>📅 Rezervacija iki: <b style={{color:C.text}}>7 dienos į priekį</b></div>
              <div>👥 Vienas klientas per laiką</div>
            </div>
          </div>
          <div style={{gridColumn:"1/-1" as any,display:"flex",justifyContent:"flex-end",gap:10}}>
            <button onClick={()=>setView("week")} style={css.btnGhost}>Atšaukti</button>
            <button onClick={saveSchedule} disabled={saving} style={css.btnG}>{saving?"⏳ Saugoma...":"💾 Išsaugoti nustatymus"}</button>
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {view==="week"&&(<>
        {/* Today's summary */}
        {todayBookings.length>0&&(
          <div style={{...css.card,marginBottom:16,background:C.surface2,border:`1px solid ${C.greenBorder}`}}>
            <span style={{...css.secTitle,color:C.green}}>Šiandien — {new Date().toLocaleDateString("lt-LT",{weekday:"long",month:"long",day:"numeric"})}</span>
            <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
              {todayBookings.sort((a,b)=>a.time.localeCompare(b.time)).map(b=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:12,background:C.faint,borderRadius:8,padding:"9px 12px",cursor:"pointer"}} onClick={()=>setSelectedBooking(b)}>
                  <div style={{fontSize:18,fontWeight:900,color:C.gold,minWidth:48}}>{b.time}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{b.client_name}</div>
                    <div style={{fontSize:11,color:C.muted}}>{b.client_phone}</div>
                  </div>
                  <div style={{background:statusColor(b.status)+"22",border:`1px solid ${statusColor(b.status)}44`,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:statusColor(b.status)}}>{statusLabel(b.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week navigation */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap" as const}}>
          <button onClick={prevWeek} style={css.btnGhost}>‹ Ankstesnė</button>
          <button onClick={goToday} style={{...css.btnGhost,fontSize:11}}>Šiandien</button>
          <button onClick={nextWeek} style={css.btnGhost}>Kita ›</button>
          <div style={{marginLeft:"auto",fontSize:13,fontWeight:600,color:C.text}}>
            {new Date(weekDays[0]+"T12:00:00").toLocaleDateString("lt-LT",{month:"long",year:"numeric"})}
          </div>
        </div>

        {/* Week grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:20}}>
          {weekDays.map(ds=>{
            const d = new Date(ds+"T12:00:00");
            const isToday = ds===todayStr();
            const isPast = ds<todayStr();
            const dow = d.getDay();
            const isWorking = schedule.working_days.includes(dow) && !schedule.blocked_dates.includes(ds);
            const dayBookings = bookings.filter(b=>b.date===ds&&b.status!=="cancelled");
            const allSlots = isWorking?Math.floor((parseTime(schedule.end_time)-parseTime(schedule.start_time))/schedule.slot_duration):0;
            const freeSlots = allSlots - dayBookings.length;

            return(
              <div key={ds} style={{background:isToday?C.surface2:C.surface,borderRadius:10,border:isToday?`2px solid ${C.gold}`:`1px solid ${C.border}`,padding:"10px 6px",opacity:isPast&&!isToday?0.5:1,minHeight:100}}>
                <div style={{fontSize:9,color:isToday?C.gold:C.muted,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.06em",marginBottom:2,textAlign:"center" as const}}>{DAY_SHORT[dow]}</div>
                <div style={{fontSize:18,fontWeight:900,color:isToday?C.gold:C.text,textAlign:"center" as const,marginBottom:4}}>{d.getDate()}</div>
                {!isWorking&&<div style={{fontSize:9,color:C.muted,textAlign:"center" as const}}>Laisva diena</div>}
                {isWorking&&(<>
                  {dayBookings.map(b=>(
                    <div key={b.id} onClick={()=>setSelectedBooking(b)} style={{background:statusColor(b.status)+"22",border:`1px solid ${statusColor(b.status)}44`,borderRadius:5,padding:"3px 5px",marginBottom:3,cursor:"pointer",fontSize:9,fontWeight:700,color:statusColor(b.status)}}>
                      {b.time} {b.client_name.split(" ")[0]}
                    </div>
                  ))}
                  {freeSlots>0&&<div style={{fontSize:9,color:C.green,textAlign:"center" as const,marginTop:4}}>{freeSlots} laisv{freeSlots===1?"as":"i"}</div>}
                  {freeSlots===0&&dayBookings.length>0&&<div style={{fontSize:9,color:C.red,textAlign:"center" as const,marginTop:4}}>Pilnas</div>}
                </>)}
              </div>
            );
          })}
        </div>

        {/* Upcoming bookings list */}
        <div style={css.card}>
          <span style={css.secTitle}>Artėjančios rezervacijos</span>
          {upcomingBookings.length===0?<div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0",fontSize:13}}>Rezervacijų dar nėra</div>:(
            <div style={{display:"flex",flexDirection:"column" as const,gap:7}}>
              {upcomingBookings.map(b=>(
                <div key={b.id} onClick={()=>setSelectedBooking(b)} style={{display:"flex",alignItems:"center",gap:12,background:C.faint,borderRadius:10,padding:"10px 14px",cursor:"pointer",transition:"background .1s"}}>
                  <div style={{textAlign:"center" as const,minWidth:52}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:600}}>{DAY_SHORT[new Date(b.date+"T12:00:00").getDay()]}</div>
                    <div style={{fontSize:18,fontWeight:900,color:b.date===todayStr()?C.gold:C.text}}>{new Date(b.date+"T12:00:00").getDate()}</div>
                    <div style={{fontSize:9,color:C.muted}}>{MONTH_NAMES[new Date(b.date+"T12:00:00").getMonth()].slice(0,3)}</div>
                  </div>
                  <div style={{width:1,height:40,background:C.border}}/>
                  <div style={{fontSize:18,fontWeight:900,color:C.gold,minWidth:50}}>{b.time}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{b.client_name}</div>
                    <div style={{fontSize:11,color:C.muted}}>{b.client_phone}</div>
                  </div>
                  <div style={{background:statusColor(b.status)+"22",border:`1px solid ${statusColor(b.status)}44`,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,color:statusColor(b.status),flexShrink:0}}>{statusLabel(b.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>)}

      {/* Booking detail modal */}
      {selectedBooking&&(
        <div style={css.overlay}>
          <div style={css.modal(440)}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:15,color:C.gold}}>📅 Rezervacija</div>
              <button onClick={()=>setSelectedBooking(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
            </div>
            <div style={{padding:22,display:"flex",flexDirection:"column" as const,gap:14}}>
              {/* Date/time */}
              <div style={{background:C.faint,borderRadius:12,padding:"14px 16px",textAlign:"center" as const}}>
                <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{getLT(new Date(selectedBooking.date+"T12:00:00"))}</div>
                <div style={{fontSize:32,fontWeight:900,color:C.gold}}>{selectedBooking.time}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>60 minučių sesija</div>
              </div>
              {/* Client info */}
              <div style={{display:"flex",gap:10}}>
                <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:C.bg,flexShrink:0}}>{(selectedBooking.client_name||"?")[0].toUpperCase()}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:C.text}}>{selectedBooking.client_name}</div>
                  <a href={`tel:${selectedBooking.client_phone}`} style={{fontSize:13,color:C.teal,textDecoration:"none",fontWeight:600}}>📞 {selectedBooking.client_phone}</a>
                </div>
              </div>
              {/* Status */}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:C.muted}}>Statusas:</span>
                <span style={{background:statusColor(selectedBooking.status)+"22",border:`1px solid ${statusColor(selectedBooking.status)}44`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700,color:statusColor(selectedBooking.status)}}>{statusLabel(selectedBooking.status)}</span>
              </div>
              {/* Actions */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                {selectedBooking.status!=="confirmed"&&<button onClick={()=>updateBookingStatus(selectedBooking.id,"confirmed")} style={{...css.btnGreen,flex:1}}>✅ Patvirtinti</button>}
                {selectedBooking.status!=="cancelled"&&<button onClick={()=>updateBookingStatus(selectedBooking.id,"cancelled")} style={{...css.btnRed,flex:1}}>❌ Atšaukti</button>}
                <button onClick={()=>deleteBooking(selectedBooking.id)} style={{...css.btnGhost,flex:1,fontSize:12}}>🗑️ Ištrinti</button>
              </div>
              <div style={{fontSize:11,color:C.muted,textAlign:"center" as const}}>
                Užregistruota: {new Date(selectedBooking.created_at).toLocaleDateString("lt-LT",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
