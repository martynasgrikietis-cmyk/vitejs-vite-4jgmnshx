// ── App.tsx — Dashboard, Exercises, Clients, Share page ──
import { useState, useCallback, useEffect } from "react";
import { sb, C, FONT, RESPONSIVE_CSS, css, ALL_MUSCLES, GOALS, LEVELS, DAYS, REST_OPTIONS, ACTIVITY_LEVELS, calcBMI, bmiCat, calcNut, genToken, getCoachId, getIsAdmin, Tag, Badge, Spinner, Skeleton, SkeletonCard, Err, NutriBadge, ImgGallery, MultiImgUploader, HERO_IMG, GYM_IMG2, DISPLAY_FONT, CONDENSED_FONT, SectionHead } from "./shared";
import { LoginScreen, AuthProvider, UsersTab, useAuth, getSession, clearSession } from "./auth";
import { FoodsTab, MealPlanBuilder, MealSharePage } from "./MealPlan";

// ── NATIVE APP INITIALIZATION ─────────────────────────────
async function initNative() {
  // Only runs inside Capacitor native app
  if (typeof (window as any).Capacitor === "undefined") return;
  if (!(window as any).Capacitor?.isNativePlatform?.()) return;
  try {
    const cap = (window as any).Capacitor;
    // Status bar via Capacitor plugins if available
    const plugins = cap.Plugins || {};
    if (plugins.StatusBar) {
      await plugins.StatusBar.setStyle({ style: "DARK" }).catch(()=>{});
      await plugins.StatusBar.setBackgroundColor({ color: "#060709" }).catch(()=>{});
    }
    // Hide splash screen
    if (plugins.SplashScreen) {
      setTimeout(() => plugins.SplashScreen.hide({ fadeOutDuration: 400 }).catch(()=>{}), 800);
    }
  } catch {}
}

import { CalendarTab, BookingPage } from "./Calendar";
import { CSVImportModal, ExerciseLibraryModal } from "./ExerciseImport";

// Extract YouTube video ID from any YouTube URL format
function getYouTubeEmbed(url:string):string|null{
  if(!url)return null;
  const patterns=[
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for(const p of patterns){ const m=url.match(p); if(m)return `https://www.youtube.com/embed/${m[1]}?rel=0`; }
  return null; // non-YouTube video link — open directly
}

const emptyExForm  = {name:"",muscle:"Krūtinė",equipment:"",sets:"3",reps:"10-12",description:"",video_url:"",imgs:[] as string[]};

const MUSCLE_COLORS:Record<string,string> = {
  "Krūtinė":"#5B8DB8","Nugara":"#4E9068","Kojos":"#D4A853",
  "Pečiai":"#9B7DD4","Bicepsas":"#E07B5A","Tricepsas":"#5BA8A0",
  "Pilvas":"#7DA84E","Visi":"#6B7280",
};
const muscleColor=(m:string)=>MUSCLE_COLORS[m]||C.teal;
const emptyClient  = {name:"",age:"",weight:"",height:"",gender:"Vyras",goal:"",level:"",notes:"",training_days:[] as string[],activity_index:2,phone:"",birthday:""};

// LoginScreen is now in auth.tsx

// ── CALENDAR + NOTES WIDGET ───────────────────────────────
function CalendarNotesWidget({upcomingBookings}:{upcomingBookings:any[]}){
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [notes, setNotes] = useState<{id:number,text:string,done:boolean}[]>(()=>{
    try{ return JSON.parse(localStorage.getItem("dna_notes")||"[]"); }catch{ return []; }
  });
  const [noteInput, setNoteInput] = useState("");

  const saveNotes = (updated: {id:number,text:string,done:boolean}[]) => {
    setNotes(updated);
    try{ localStorage.setItem("dna_notes", JSON.stringify(updated)); }catch{}
  };

  const addNote = () => {
    const t = noteInput.trim();
    if(!t) return;
    saveNotes([...notes, {id: Date.now(), text: t, done: false}]);
    setNoteInput("");
  };

  const toggleNote = (id:number) => saveNotes(notes.map(n => n.id===id ? {...n, done: !n.done} : n));
  const deleteNote = (id:number) => saveNotes(notes.filter(n => n.id!==id));

  // Calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Booking dots — which days have bookings
  const bookedDays = new Set(
    upcomingBookings
      .map(b => { const d = new Date(b.date+"T12:00"); return d.getMonth()===month && d.getFullYear()===year ? d.getDate() : null; })
      .filter(Boolean)
  );

  const monthName = viewDate.toLocaleDateString("lt-LT", {month:"long",year:"numeric"});
  const todayDay = today.getDate();
  const isCurrentMonth = today.getMonth()===month && today.getFullYear()===year;

  const prevMonth = () => setViewDate(new Date(year, month-1, 1));
  const nextMonth = () => setViewDate(new Date(year, month+1, 1));

  const weekDays = ["P","A","T","K","Pn","Š","S"];

  return (
    <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>

      {/* ── Mini Calendar ── */}
      <div style={{...css.card,padding:18}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
          <button onClick={prevMonth} style={{...css.btnGhost,padding:"3px 8px",fontSize:12,lineHeight:1}}>‹</button>
          <div style={{flex:1,textAlign:"center" as const,fontSize:12,fontWeight:700,color:C.text,textTransform:"capitalize" as const,letterSpacing:"0.04em"}}>{monthName}</div>
          <button onClick={nextMonth} style={{...css.btnGhost,padding:"3px 8px",fontSize:12,lineHeight:1}}>›</button>
        </div>

        {/* Weekday headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
          {weekDays.map(d=>(
            <div key={d} style={{textAlign:"center" as const,fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.06em",padding:"2px 0"}}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {/* Empty cells before first day */}
          {Array.from({length:startOffset}).map((_,i)=>(
            <div key={`e${i}`}/>
          ))}
          {/* Day cells */}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const day = i+1;
            const isToday = isCurrentMonth && day===todayDay;
            const hasBooking = bookedDays.has(day);
            return(
              <div key={day} style={{
                position:"relative" as const,
                textAlign:"center" as const,
                padding:"5px 2px",
                borderRadius:6,
                background:isToday?C.gold:"transparent",
                cursor:"default",
              }}>
                <div style={{
                  fontSize:11,fontWeight:isToday?800:400,
                  color:isToday?C.bg:day===todayDay?C.text:C.muted,
                  lineHeight:1,
                }}>{day}</div>
                {hasBooking && !isToday && (
                  <div style={{
                    position:"absolute" as const,bottom:1,left:"50%",transform:"translateX(-50%)",
                    width:4,height:4,borderRadius:"50%",
                    background:C.gold,
                  }}/>
                )}
                {hasBooking && isToday && (
                  <div style={{
                    position:"absolute" as const,bottom:1,left:"50%",transform:"translateX(-50%)",
                    width:4,height:4,borderRadius:"50%",
                    background:C.bg,
                  }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {bookedDays.size>0 && (
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.gold}}/>
            <span style={{fontSize:9,color:C.muted,letterSpacing:"0.08em"}}>{bookedDays.size} rezervacij{bookedDays.size===1?"a":"ų"} šį mėnesį</span>
          </div>
        )}
      </div>

      {/* ── Notes / Tasks ── */}
      <div style={{...css.card,padding:18,flex:1}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          <span style={{...css.secTitle,marginBottom:0,flex:1}}>📝 Užrašai</span>
          <span style={{fontSize:10,color:C.muted}}>{notes.filter(n=>!n.done).length} aktyvūs</span>
        </div>

        {/* Input */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <input
            value={noteInput}
            onChange={e=>setNoteInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addNote()}
            placeholder="Pridėti užduotį..."
            style={{...css.input,flex:1,fontSize:12,padding:"8px 10px"}}
          />
          <button onClick={addNote} style={{...css.btnG,padding:"8px 12px",fontSize:14,fontWeight:900,flexShrink:0}}>+</button>
        </div>

        {/* Notes list */}
        <div style={{display:"flex",flexDirection:"column" as const,gap:6,maxHeight:180,overflowY:"auto" as const}}>
          {notes.length===0 && (
            <div style={{textAlign:"center" as const,color:C.muted,padding:"16px 0",fontSize:12}}>Nėra užrašų</div>
          )}
          {notes.map(note=>(
            <div key={note.id} style={{
              display:"flex",alignItems:"flex-start",gap:8,
              padding:"8px 10px",borderRadius:8,
              background:note.done?C.faint:C.surface2,
              border:`1px solid ${note.done?C.border:C.border}`,
              opacity:note.done?0.5:1,
              transition:"opacity 0.2s",
            }}>
              {/* Checkbox */}
              <div
                onClick={()=>toggleNote(note.id)}
                style={{
                  width:16,height:16,borderRadius:4,flexShrink:0,
                  border:`1.5px solid ${note.done?C.green:C.border}`,
                  background:note.done?C.green:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",marginTop:1,
                  transition:"all 0.15s",
                }}
              >
                {note.done&&<span style={{fontSize:9,color:C.bg,fontWeight:900}}>✓</span>}
              </div>
              {/* Text */}
              <div style={{flex:1,fontSize:12,color:C.text,lineHeight:1.4,textDecoration:note.done?"line-through":"none",wordBreak:"break-word" as const}}>{note.text}</div>
              {/* Delete */}
              <button
                onClick={()=>deleteNote(note.id)}
                style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",padding:0,flexShrink:0,lineHeight:1,marginTop:1}}
              >×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function DashboardTab({onNav,allClients=[],allBookings=[]}:{onNav:(t:string,open?:boolean)=>void,allClients?:any[],allBookings?:any[]}){
  const [stats,setStats]=useState({clients:0,exercises:0,foods:0,mealplans:0});
  const [recent,setRecent]=useState<any[]>([]);
  const [upcomingBookings,setUpcomingBookings]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  const todayISO=new Date().toISOString().slice(0,10);

  useEffect(()=>{
    Promise.all([
      sb.get("clients",`?coach_id=eq.${getCoachId()}&order=created_at.desc`),
      sb.get("exercises","?select=id"),
      sb.get("foods","?select=id").catch(()=>[] as any[]),
      sb.get("bookings",`?coach_id=eq.${getCoachId()}&date=gte.${todayISO}&status=neq.cancelled&order=date.asc,time.asc&limit=10`).catch(()=>[] as any[]),
    ]).then(([clients,exs,fds,bookings])=>{
      setRecent(clients);
      setUpcomingBookings(bookings);
      setStats({clients:clients.length,exercises:exs.length,foods:fds.length,mealplans:clients.filter((c:any)=>c.meal_plan_name).length});
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const todayName=DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
  const todayClients=recent.filter(c=>(c.training_days||[]).includes(todayName));
  const todayBookings=upcomingBookings.filter(b=>b.date===todayISO);

  const statCards=[
    {icon:"👥",label:"Klientai",val:stats.clients,color:C.gold,tab:"clients"},
    {icon:"🏋️",label:"Pratimai",val:stats.exercises,color:C.teal,tab:"exercises"},
    {icon:"🥗",label:"Maisto produktai",val:stats.foods,color:C.green,tab:"foods"},
    {icon:"📅",label:"Rezervacijos",val:upcomingBookings.length,color:C.teal,tab:"calendar"},
  ];

  return(
    <div>
      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="fu" style={{position:"relative",overflow:"hidden",minHeight:280,borderBottom:`1px solid ${C.border}`}}>
        <img src="https://i.pinimg.com/736x/e3/bc/16/e3bc16974256fb6913e37079fa4cb653.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",filter:"brightness(0.35) saturate(0.4) contrast(1.15)"}} loading="eager"/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(110deg,rgba(6,7,9,0.98) 28%,rgba(6,7,9,0.6) 58%,rgba(6,7,9,0.15) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:160,background:"linear-gradient(to top,#060709,transparent)"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(212,168,83,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.055) 1px,transparent 1px)",backgroundSize:"56px 56px"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 55% 60% at 72% 50%,rgba(212,168,83,0.07) 0%,transparent 65%)"}}/>
        <div style={{position:"relative",padding:"44px 32px 36px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:10,color:C.gold,letterSpacing:"0.3em"}}>01</span>
            <div style={{width:32,height:1,background:C.gold}}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,color:"#9AABB8",letterSpacing:"0.22em",textTransform:"uppercase" as const}}>Sporto sistema · {new Date().getFullYear()}</span>
          </div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",lineHeight:0.88,letterSpacing:"0.02em",marginBottom:18,textShadow:"0 4px 40px rgba(0,0,0,0.9)"}}>
            <div style={{fontSize:"clamp(52px,7vw,88px)",color:C.text,textShadow:"0 4px 30px rgba(0,0,0,0.8)"}}>SVEIKI</div>
            <div style={{fontSize:"clamp(52px,7vw,88px)",color:C.gold,textShadow:`0 4px 30px rgba(212,168,83,0.3)`}}>SUGRĮŽĘ</div>
          </div>
          <div style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:"#8A9AAA",fontWeight:300,marginBottom:24,letterSpacing:"0.06em"}}>{new Date().toLocaleDateString("lt-LT",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}} className="hero-actions">
            <button onClick={()=>onNav("clients",true)} style={{...css.btnG,flex:1,minWidth:140,justifyContent:"center",display:"flex",alignItems:"center"}}>+ Naujas klientas</button>
            <button onClick={()=>onNav("exercises",true)} style={{...css.btnGhost,flex:1,minWidth:120,justifyContent:"center",display:"flex",alignItems:"center"}}>+ Pratimas</button>
            <button onClick={()=>onNav("foods",true)} style={{...css.btnGhost,flex:1,minWidth:100,justifyContent:"center",display:"flex",alignItems:"center"}}>+ Maistas</button>
          </div>
        </div>
      </div>

      {/* ── BIRTHDAY + INACTIVITY ALERTS ── */}
      {allClients.length>0&&<BirthdayAlerts clients={allClients}/>}
      {allClients.length>0&&allBookings.length>=0&&<InactivityAlerts clients={allClients} bookings={allBookings}/>}

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="dash-stats fu1">
        {statCards.map((s,i)=>(
          <div key={s.label} onClick={()=>onNav(s.tab)} className="arch-stat-block" style={{cursor:"pointer"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,color:"#9AABB8",letterSpacing:"0.22em",textTransform:"uppercase" as const,marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:50,color:s.color,lineHeight:1,letterSpacing:"0.04em"}}>{loading?"—":s.val}</div>
          </div>
        ))}
      </div>

      {/* Recent + Today */}
      <div className="dash-bottom fu2" style={{}}>
        <div style={{background:"#0E1016",border:"1px solid #1E2430",borderTop:"none",padding:"24px 28px"}}>
          <div style={{display:"flex",alignItems:"flex-end",marginBottom:20}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:9,color:C.gold,letterSpacing:"0.3em"}}>02</span><div style={{width:20,height:1,background:C.gold}}/></div>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:C.text,letterSpacing:"0.04em",lineHeight:1}}>PASKUTINIAI KLIENTAI</span>
            </div>
            <button onClick={()=>onNav("clients")} style={{...css.btnGhost,marginLeft:"auto",padding:"4px 10px",fontSize:9}}>Visi →</button>
          </div>
          {loading?<Spinner/>:recent.length===0?<div style={{textAlign:"center",color:C.muted,padding:"24px 0",fontSize:13}}>Klientų dar nėra</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {recent.slice(0,5).map((c:any)=>{
                const bmi=calcBMI(c.weight,c.height);
                const bmiN=bmi?parseFloat(bmi.toFixed(1)):null;
                const exCnt=Object.values(c.program||{}).reduce((s:any,d:any)=>s+d.length,0);
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:10,padding:"9px 12px"}}>
                    <div style={{width:38,height:38,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:1}}>{c.goal||"—"} · {exCnt} pratimų</div>
                    </div>
                    {bmiN&&<div style={{fontSize:11,fontWeight:700,color:bmiCat(bmiN).color,flexShrink:0}}>KMI {bmiN}</div>}
                    {(c.training_days||[]).includes(todayName)&&<span style={{background:C.greenSoft,border:`1px solid ${C.greenBorder}`,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:700,color:C.green,flexShrink:0}}>Šiandien</span>}
                    {c.meal_plan_name&&<span title="Turi mitybos planą" style={{fontSize:13,flexShrink:0}}>🥗</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{background:"#0E1016",border:"1px solid #1E2430",borderTop:"none",borderLeft:"none",padding:"24px 24px"}}>
          <div style={{marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:9,color:C.gold,letterSpacing:"0.3em"}}>03</span><div style={{width:20,height:1,background:C.gold}}/></div>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C.text,letterSpacing:"0.04em",lineHeight:1}}>ARTIMIAUSI UŽSIĖMIMAI</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:C.gold,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase" as const}}>{todayName}</div>
            {todayBookings.length>0&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,padding:"1px 8px",fontSize:9,color:C.gold,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.1em"}}>{todayBookings.length} rezervacija</span>}
          </div>
          {loading?<Spinner/>:(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {/* Calendar bookings today */}
              {todayBookings.map((b:any)=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"9px 12px"}}>
                  <div style={{fontSize:20,fontWeight:800,color:C.gold,minWidth:52,fontFamily:"'Barlow',sans-serif"}}>{b.time}</div>
                  <div style={{width:1,height:28,background:C.goldBorder}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text}}>{b.client_name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{b.client_phone} · 📅 Rezervacija</div>
                  </div>
                  <div style={{background:b.status==="confirmed"?C.greenSoft:C.goldSoft,border:`1px solid ${b.status==="confirmed"?C.greenBorder:C.goldBorder}`,borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:700,color:b.status==="confirmed"?C.green:C.gold}}>{b.status==="confirmed"?"✓ Patvirtinta":"⏳ Laukiama"}</div>
                </div>
              ))}
              {/* Training clients today */}
              {todayClients.map((c:any)=>{
                const exCnt=(c.program||{})[todayName]?.length||0;
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,background:C.greenSoft,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"9px 11px"}}>
                    <div style={{width:32,height:32,background:C.green,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{c.name}</div>
                      <div style={{fontSize:10,color:C.green}}>{exCnt} pratimų · 🏋️ Programa</div>
                    </div>
                  </div>
                );
              })}
              {todayBookings.length===0&&todayClients.length===0&&(
                <div style={{textAlign:"center",color:C.muted,padding:"16px 0",fontSize:13}}>Šiandien nėra užsiėmimų 😴</div>
              )}
              {/* Upcoming bookings */}
              {upcomingBookings.filter(b=>b.date>todayISO).slice(0,3).map((b:any)=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 12px"}}>
                  <div style={{textAlign:"center",minWidth:38}}>
                    <div style={{fontSize:14,fontWeight:900,color:C.gold,fontFamily:"'Barlow',sans-serif"}}>{new Date(b.date+"T12:00:00").getDate()}</div>
                    <div style={{fontSize:8,color:C.muted,letterSpacing:"0.06em"}}>{new Date(b.date+"T12:00:00").toLocaleDateString("lt-LT",{month:"short"}).toUpperCase()}</div>
                  </div>
                  <div style={{width:1,height:28,background:C.border}}/>
                  <div style={{fontSize:13,fontWeight:700,color:C.gold,minWidth:40}}>{b.time}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text}}>{b.client_name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{b.client_phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3rd column: Mini Calendar + Notes ── */}
        <CalendarNotesWidget upcomingBookings={upcomingBookings}/>
      </div>
    </div>
  );
}

// ── EXERCISES TAB ─────────────────────────────────────────
function ExercisesTab({autoOpen=false}:{autoOpen?:boolean}){
  const [exercises,setExercises]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [search,setSearch]=useState("");
  const [muscle,setMuscle]=useState("Visos");
  const [formOpen,setFormOpen]=useState(autoOpen);
  const [editId,setEditId]=useState<any>(null);
  const [form,setForm]=useState({...emptyExForm});
  const [saving,setSaving]=useState(false);
  const [confirmDel,setConfirmDel]=useState<any>(null);
  const [showCSV,setShowCSV]=useState(false);
  const [showLibrary,setShowLibrary]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{
      const coachId=getCoachId();
      const isAdmin=getIsAdmin();
      const [allEx,blocks]=await Promise.all([
        sb.get("exercises","?order=name"),
        isAdmin?Promise.resolve([]):sb.get("coach_exercise_blocks",`?coach_id=eq.${coachId}&select=exercise_id`).catch(()=>[]),
      ]);
      const blockedIds=new Set((blocks as any[]).map((b:any)=>b.exercise_id));
      setExercises(isAdmin?allEx:allEx.filter((e:any)=>!blockedIds.has(e.id)));
    }
    catch(e:any){setError("Klaida: "+e.message);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const openNew=()=>{setEditId(null);setForm({...emptyExForm});setFormOpen(true);};
  const openEdit=(ex:any)=>{setEditId(ex.id);setForm({name:ex.name,muscle:ex.muscle||"Krūtinė",equipment:ex.equipment||"",sets:ex.sets||"3",reps:ex.reps||"10-12",description:ex.description||"",video_url:ex.video_url||"",imgs:ex.imgs||[]});setFormOpen(true);};
  const save=async()=>{
    if(!form.name.trim())return;setSaving(true);
    try{if(editId)await sb.update("exercises",editId,form);else await sb.insert("exercises",form);setFormOpen(false);await load();}
    catch(e:any){alert("Klaida: "+e.message);}finally{setSaving(false);}
  };
  const del=async(id:any)=>{try{await sb.delete("exercises",id);setConfirmDel(null);await load();}catch(e:any){alert("Klaida: "+e.message);}};
  const filtered=exercises.filter(e=>(muscle==="Visos"||e.muscle===muscle)&&(e.name.toLowerCase().includes(search.toLowerCase())||(e.equipment||"").toLowerCase().includes(search.toLowerCase())));

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div><div style={{fontSize:24,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>Pratimų biblioteka</div><div style={{color:C.muted,fontSize:13,marginTop:2}}>{exercises.length} pratimų iš viso</div></div>
        <div style={{display:"flex",gap:8,marginLeft:"auto",flexWrap:"wrap" as const}}>
          <button onClick={()=>setShowLibrary(true)} style={{...css.btnGhost,fontSize:12}}>📚 Biblioteka</button>
          <button onClick={()=>setShowCSV(true)} style={{...css.btnGhost,fontSize:12}}>📊 CSV import</button>
          <button onClick={openNew} style={css.btnG}>+ Naujas pratimas</button>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap" as const,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti..." className="sbar" style={{...css.input,width:200}}/>
        <div className="tag-row" style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
          {["Visos",...ALL_MUSCLES].map(m=>{
            const mc=muscleColor(m);
            return(
              <button key={m} onClick={()=>setMuscle(m)} style={{
                padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0,
                border:`1px solid ${muscle===m?mc:C.border}`,
                background:muscle===m?mc+"22":"transparent",
                color:muscle===m?mc:C.muted,
                transition:"all .15s",
              }}>{m}</button>
            );
          })}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          <div style={{fontSize:11,color:C.muted,background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px"}}>{filtered.length} pratimų</div>
          <button onClick={load} style={{...css.btnGhost,fontSize:11}}>↺</button>
        </div>
      </div>
      <Err msg={error}/>
      {loading?<Spinner/>:(
        <div className="ex-grid" style={{}}>
          {filtered.map(ex=>{
            const mc=muscleColor(ex.muscle);
            const hasVideo=!!ex.video_url;
            const embedUrl=getYouTubeEmbed(ex.video_url||"");
            return(
            <div key={ex.id} style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column" as const,transition:"transform .15s,border-color .15s",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=mc+"60";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=C.border;}}>
              {/* Colored top bar */}
              <div style={{height:3,background:`linear-gradient(to right,${mc},${mc}60)`}}/>
              {/* Image with overlays */}
              <div style={{position:"relative" as const}}>
                <ImgGallery imgs={ex.imgs} height={130}/>
                {/* Muscle badge */}
                <div style={{position:"absolute" as const,top:8,left:8,background:`${mc}DD`,backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 9px",fontSize:10,color:"#fff",fontWeight:700,letterSpacing:"0.06em"}}>{ex.muscle}</div>
                {/* Video badge */}
                {hasVideo&&<div style={{position:"absolute" as const,top:8,right:8,background:"rgba(0,0,0,0.7)",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#f87171",fontWeight:700}}>▶ VIDEO</div>}
              </div>
              {/* Content */}
              <div style={{padding:"12px 14px",flex:1,display:"flex",flexDirection:"column" as const,gap:5}}>
                <div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.3}}>{ex.name}</div>
                {ex.equipment&&<div style={{fontSize:11,color:C.muted}}>{ex.equipment}</div>}
                {/* Sets/reps chips */}
                <div style={{display:"flex",gap:6,marginTop:2}}>
                  <div style={{background:`${mc}18`,border:`1px solid ${mc}40`,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:mc}}>{ex.sets} ser.</div>
                  <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:C.gold}}>{ex.reps} kart.</div>
                </div>
                {ex.description&&<div style={{fontSize:10,color:C.muted,fontStyle:"italic",lineHeight:1.5,marginTop:2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const,overflow:"hidden"}}>{ex.description}</div>}
                {/* Actions */}
                <div style={{display:"flex",gap:7,marginTop:"auto",paddingTop:8}}>
                  <button style={{...css.btnTeal,flex:1,fontSize:11,padding:"6px 8px"}} onClick={(e)=>{e.stopPropagation();openEdit(ex);}}>✏️ Redaguoti</button>
                  {hasVideo&&<a href={ex.video_url!} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{...css.btnRed,padding:"6px 10px",fontSize:13,textDecoration:"none",display:"flex",alignItems:"center"}}>▶</a>}
                  <button style={{...css.btnRed,padding:"6px 10px",fontSize:13}} onClick={(e)=>{e.stopPropagation();setConfirmDel(ex);}}>🗑️</button>
                </div>
              </div>
            </div>
            );
          })}
          {filtered.length===0&&!loading&&(
            <div style={{gridColumn:"1/-1",textAlign:"center" as const,padding:"60px 32px"}}>
              <div style={{fontSize:48,marginBottom:12}}>🏋️</div>
              <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Pratimų nerasta</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Pabandykite kitą paieškos užklausą arba pridėkite naują pratimą</div>
              <button onClick={openNew} style={css.btnG}>+ Pridėti pratimą</button>
            </div>
          )}
        </div>
      )}
      {formOpen&&(<div style={css.overlay}><div style={css.modal(560)}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.gold}}>{editId?"✏️ Redaguoti pratimą":"➕ Naujas pratimas"}</div>
          <button onClick={()=>setFormOpen(false)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14}} className="modal-inner">
          <MultiImgUploader imgs={form.imgs} onChange={(fn:any)=>setForm(p=>({...p,imgs:typeof fn==="function"?fn(p.imgs):fn}))}/>
          <div><span style={css.label}>Pavadinimas *</span><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={css.input} placeholder="Pratimo pavadinimas"/></div>
          <div className="ex2-grid" style={{}}>
            <div><span style={css.label}>Raumenų grupė</span><select value={form.muscle} onChange={e=>setForm(p=>({...p,muscle:e.target.value}))} style={css.select}>{ALL_MUSCLES.map(m=><option key={m}>{m}</option>)}</select></div>
            <div><span style={css.label}>Inventorius</span><input value={form.equipment} onChange={e=>setForm(p=>({...p,equipment:e.target.value}))} style={css.input} placeholder="Štanga, Hanteliai..."/></div>
            <div><span style={css.label}>Serijos</span><input value={form.sets} onChange={e=>setForm(p=>({...p,sets:e.target.value}))} style={css.input} placeholder="3-4"/></div>
            <div><span style={css.label}>Kartojimai</span><input value={form.reps} onChange={e=>setForm(p=>({...p,reps:e.target.value}))} style={css.input} placeholder="10-12"/></div>
          </div>
          <div><span style={css.label}>Aprašymas</span><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} style={{...css.input,resize:"none"}} placeholder="Technikos aprašymas..."/></div>
          <div>
            <span style={css.label}>🎬 Video URL (YouTube arba kitas)</span>
            <input value={(form as any).video_url||""} onChange={e=>setForm(p=>({...p,video_url:e.target.value}))} style={css.input} placeholder="https://youtube.com/watch?v=..."/>
            {(form as any).video_url&&<div style={{fontSize:11,color:C.green,marginTop:5}}>✅ Video nuoroda pridėta</div>}
          </div>
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={save} disabled={saving} style={{...css.btnG,opacity:form.name.trim()?1:0.4}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti"}</button>
        </div>
      </div></div>)}
      {showCSV&&<CSVImportModal onClose={()=>setShowCSV(false)} onImported={(n)=>{setShowCSV(false);load();alert(`Importuota ${n} pratimų!`);}}/>}
      {showLibrary&&<ExerciseLibraryModal onClose={()=>setShowLibrary(false)} onImported={(n)=>{setShowLibrary(false);load();alert(`Importuota ${n} pratimų!`);}}/>}
      {confirmDel&&(<div style={css.overlay}><div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.redBorder}`,padding:28,maxWidth:340,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>🗑️</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:C.text}}>Ištrinti pratimą?</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:20}}>„{confirmDel.name}" bus ištrintas visam laikui.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={()=>del(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
        </div>
      </div></div>)}
    </div>
  );
}

// ── CLIENT SHARE PAGE (public, no login) ─────────────────
function SharePage({token,type}:{token:string,type:string}){
  const [client,setClient]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [notFound,setNotFound]=useState(false);

  useEffect(()=>{
    sb.get("clients",`?share_token=eq.${token}&limit=1`)
      .then(data=>{if(data.length)setClient(data[0]);else setNotFound(true);})
      .catch(()=>setNotFound(true))
      .finally(()=>setLoading(false));
  },[token]);

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,color:C.muted,gap:12,flexDirection:"column"}}><div style={{width:28,height:28,border:`2px solid #E0E0E0`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Kraunama...</div>;
  if(notFound||!client)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,flexDirection:"column",gap:12,padding:20}}><div style={{fontSize:48}}>🔍</div><div style={{fontSize:18,fontWeight:700,color:C.text}}>Puslapis nerastas</div><div style={{fontSize:13,color:C.muted,textAlign:"center"}}>Nuoroda yra neteisinga arba pasibaigė.</div></div>;

  const isTraining=type==="training";
  const bv=calcBMI(client.weight,client.height);
  const bmiN=bv?parseFloat(bv.toFixed(1)):null;
  const accentColor=isTraining?C.gold:C.green;
  const planName=isTraining?(client.program_name||"Programa"):(client.meal_plan_name||"Mitybos planas");
  const planEmoji=isTraining?"🏋️":"🥗";

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;}body{margin:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease both;}
        .fu1{animation:fadeUp .4s .08s ease both;}
        .fu2{animation:fadeUp .4s .16s ease both;}
        .fu3{animation:fadeUp .4s .24s ease both;}
        .fu4{animation:fadeUp .4s .32s ease both;}
      `}</style>

      {/* Hero header — cinematic */}
      <div style={{position:"relative",padding:"36px 20px 28px",textAlign:"center",borderBottom:`1px solid ${C.border}`,overflow:"hidden",minHeight:200}}>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&q=80" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.18) saturate(0.5)"}} onError={e=>(e.target as HTMLImageElement).style.display="none"}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${C.bg}44 0%,${C.bg}CC 60%,${C.bg} 100%)`}}/>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,height:220,background:`radial-gradient(ellipse at 50% 0%,${accentColor}14 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{width:72,height:72,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontWeight:900,color:C.bg,margin:"0 auto 18px",boxShadow:`0 8px 28px ${C.gold}44`}} className="fu">{(client.name||"?")[0].toUpperCase()}</div>
        <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:4,letterSpacing:"-0.02em"}} className="fu1">{client.name}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:16}} className="fu1">{planEmoji} {planName}</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}} className="fu2">
          {client.goal&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:C.gold}}>{client.goal}</span>}
          {client.level&&<span style={{background:C.tealSoft,border:`1px solid ${C.tealBorder}`,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:C.teal}}>{client.level}</span>}
          {bmiN&&<span style={{background:bmiCat(bmiN).color+"22",border:`1px solid ${bmiCat(bmiN).color}44`,borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:bmiCat(bmiN).color}}>KMI {bmiN}</span>}
        </div>
      </div>

      {/* Training view */}
      {isTraining&&(
        <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px"}}>
          {DAYS.filter(d=>(client.training_days||[]).includes(d)).map((day,di)=>{
            const exs=(client.program||{})[day]||[];
            return(
              <div key={day} style={{marginBottom:18}} className={`fu${Math.min(di+1,4)}`}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.gold,flexShrink:0}}/>
                  <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase" as const,letterSpacing:"0.12em",color:C.gold}}>{day}</div>
                  <div style={{fontSize:11,color:C.muted}}>— {exs.length} pratimas(-ai)</div>
                </div>
                {exs.length===0?(
                  <div style={{background:C.surface,borderRadius:12,padding:"16px",textAlign:"center",color:C.muted,fontSize:13,border:`1px solid ${C.border}`}}>Poilsio diena 😴</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {exs.map((ex:any,i:number)=>{
                      const imgs=(ex.imgs||[]).filter(Boolean);
                      return(
                        <div key={i} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                          {imgs[0]&&(
                            <div style={{position:"relative",height:220,overflow:"hidden"}}>
                              <img src={imgs[0]} alt={ex.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#0a0d14cc 0%,transparent 50%)"}}/>
                              <div style={{position:"absolute",bottom:14,left:16,right:16}}>
                                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>{ex.name}</div>
                                <div style={{fontSize:12,color:"rgba(255,255,255,0.65)"}}>{ex.muscle}{ex.equipment&&` · ${ex.equipment}`}</div>
                              </div>
                              {imgs.length>1&&<div style={{position:"absolute",top:10,right:10,background:"#000a",borderRadius:10,padding:"2px 8px",fontSize:10,color:"white",fontWeight:600}}>{imgs.length} 📷</div>}
                            </div>
                          )}
                          <div style={{padding:"14px 16px"}}>
                            {!imgs[0]&&<><div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4}}>{i+1}. {ex.name}</div><div style={{fontSize:12,color:C.teal,marginBottom:10}}>{ex.muscle}{ex.equipment&&` · ${ex.equipment}`}</div></>}
                            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:ex.description?10:0}}>
                              {ex.customSets&&<div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:9,padding:"8px 14px",textAlign:"center",minWidth:64}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>Serijos</div><div style={{fontSize:18,fontWeight:900,color:C.gold}}>{ex.customSets}</div></div>}
                              {ex.customReps&&<div style={{background:C.faint,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 14px",textAlign:"center",minWidth:64}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>Kartojimai</div><div style={{fontSize:18,fontWeight:900,color:C.text}}>{ex.customReps}</div></div>}
                              {ex.customWeight&&<div style={{background:C.tealSoft,border:`1px solid ${C.tealBorder}`,borderRadius:9,padding:"8px 14px",textAlign:"center",minWidth:64}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>Svoris</div><div style={{fontSize:18,fontWeight:900,color:C.teal}}>{ex.customWeight}</div></div>}
                              {ex.customRest&&<div style={{background:"#a78bfa18",border:`1px solid #a78bfa40`,borderRadius:9,padding:"8px 14px",textAlign:"center",minWidth:64}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>Poilsis</div><div style={{fontSize:18,fontWeight:900,color:C.purple}}>{ex.customRest}</div></div>}
                            </div>
                            {ex.description&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",lineHeight:1.5}}>{ex.description}</div>}
                            {ex.video_url&&(()=>{
                              const embedUrl=getYouTubeEmbed(ex.video_url);
                              return embedUrl?(
                                <div style={{marginTop:10,borderRadius:10,overflow:"hidden",position:"relative",paddingBottom:"56.25%",height:0}}>
                                  <iframe src={embedUrl} title={ex.name} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen/>
                                </div>
                              ):(
                                <a href={ex.video_url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,marginTop:10,background:"#ef444418",border:"1px solid #ef444440",borderRadius:10,padding:"10px 14px",textDecoration:"none"}}>
                                  <span style={{fontSize:20}}>▶</span>
                                  <span style={{fontSize:13,fontWeight:700,color:"#f87171"}}>Žiūrėti pratimo video</span>
                                </a>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{textAlign:"center",color:C.muted,fontSize:11,marginTop:32,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:4}}><svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="1.5" opacity={0.6}/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none"/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="2.5" fill={C.gold}/></svg><span style={{fontSize:11,fontWeight:300,letterSpacing:"0.18em",color:C.gold}}>DNA TRAINER</span></div>
            <div>Sporto & Mitybos programa</div>
          </div>
        </div>
      )}

      {/* Meal plan view */}
      {!isTraining&&(
        <>
          <MealSharePage client={client}/>
          <div style={{textAlign:"center",color:C.muted,fontSize:11,padding:"16px 16px 32px",borderTop:`1px solid ${C.border}`,maxWidth:560,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:4}}><svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="1.5" opacity={0.6}/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none"/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="2.5" fill={C.gold}/></svg><span style={{fontSize:11,fontWeight:300,letterSpacing:"0.18em",color:C.gold}}>DNA TRAINER</span></div>
            <div>Sporto & Mitybos programa</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── SHARE MODAL COMPONENT ────────────────────────────────
function ShareModal({shareModal,setShareModal,baseUrl}:{shareModal:any,setShareModal:any,baseUrl:string}){
  const [copied,setCopied]=useState<string|null>(null);
  const trainingUrl=`${baseUrl}?share=${shareModal.token}&type=training`;
  const nutritionUrl=`${baseUrl}?share=${shareModal.token}&type=nutrition`;

  const copyLink=async(url:string,key:string)=>{
    try{
      await navigator.clipboard.writeText(url);
      setCopied(key);
      setTimeout(()=>setCopied(null),2000);
    }catch{
      // Fallback for browsers that block clipboard without https
      const el=document.createElement("textarea");
      el.value=url;el.style.position="fixed";el.style.opacity="0";
      document.body.appendChild(el);el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(key);setTimeout(()=>setCopied(null),2000);
    }
  };

  const LinkRow=({url,color,borderColor,label,ckey,btnStyle}:any)=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>{label}</div>
      <div style={{background:C.faint,borderRadius:10,padding:"10px 14px",border:`1px solid ${borderColor}`}}>
        <div style={{fontSize:11,color,wordBreak:"break-all" as const,marginBottom:10,lineHeight:1.5}}>{url}</div>
        <div style={{display:"flex",gap:8}}>
          <button
            onClick={()=>copyLink(url,ckey)}
            style={{...btnStyle,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}
          >
            {copied===ckey?"✅ Nukopijuota!":"📋 Kopijuoti nuorodą"}
          </button>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            style={{...css.btnGhost,display:"flex",alignItems:"center",justifyContent:"center",gap:5,textDecoration:"none",padding:"8px 14px",fontSize:12}}
          >🔗 Atidaryti</a>
        </div>
      </div>
    </div>
  );

  return(
    <div style={css.overlay}><div style={css.modal(500)}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
        <div style={{fontWeight:700,fontSize:15,color:C.gold}}>🔗 Nuorodos klientui</div>
        <button onClick={()=>setShareModal(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
      </div>
      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column" as const,gap:4}}>
        <div style={{background:`linear-gradient(135deg,${C.surface2},${C.faint})`,borderRadius:12,padding:"14px 16px",textAlign:"center",marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:C.bg,margin:"0 auto 10px"}}>{(shareModal.client.name||"?")[0].toUpperCase()}</div>
          <div style={{fontSize:16,fontWeight:800,color:C.text}}>{shareModal.client.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:3}}>Abi nuorodos yra viešos — klientas jas atidaro telefone be slaptažodžio</div>
        </div>

        <LinkRow
          url={trainingUrl} color={C.teal} borderColor={C.tealBorder}
          label="🏋️ Treniruočių programa" ckey="training"
          btnStyle={css.btnTeal}
        />
        <LinkRow
          url={nutritionUrl} color={C.green} borderColor={C.greenBorder}
          label="🥗 Mitybos planas" ckey="nutrition"
          btnStyle={css.btnGreen}
        />
      </div>
    </div></div>
  );
}

// ── CLIENTS TAB ───────────────────────────────────────────
function ClientsTab({exercises,foods,autoOpen=false}:{exercises:any[],foods:any[],autoOpen?:boolean}){
  const [clients,setClients]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [search,setSearch]=useState("");
  const [view,setView]=useState<any>(null);
  const [progressList,setProgressList]=useState<any[]>([]);
  const [progLoading,setProgLoading]=useState(false);
  const [progForm,setProgForm]=useState({date:"",weight:"",chest:"",waist:"",hips:"",notes:""});
  const [progFormOpen,setProgFormOpen]=useState(false);
  const [clientFormOpen,setClientFormOpen]=useState(autoOpen);
  const [editClientId,setEditClientId]=useState<any>(null);
  const [clientForm,setClientForm]=useState({...emptyClient});
  const [program,setProgram]=useState<any>({});
  const [programName,setProgramName]=useState("");
  const [mealPlan,setMealPlan]=useState<any>({});
  const [mealPlanName,setMealPlanName]=useState("");
  const [step,setStep]=useState(1);
  const [planType,setPlanType]=useState<"both"|"training"|"meal">("both");
  const [pickDay,setPickDay]=useState<any>(null);
  const [pickSearch,setPickSearch]=useState("");
  const [pickMuscle,setPickMuscle]=useState("Visos");
  const [pickedEx,setPickedEx]=useState<any>(null);
  const [pickSets,setPickSets]=useState("");
  const [pickReps,setPickReps]=useState("");
  const [pickWeight,setPickWeight]=useState("");
  const [pickRest,setPickRest]=useState("");
  const [saving,setSaving]=useState(false);
  const [confirmDel,setConfirmDel]=useState<any>(null);
  const [shareModal,setShareModal]=useState<any>(null);
  const [templateModal,setTemplateModal]=useState(false);

  const load=useCallback(async()=>{setLoading(true);setError("");try{setClients(await sb.get("clients",`?coach_id=eq.${getCoachId()}&order=name`));}catch(e:any){setError("Klaida: "+e.message);}finally{setLoading(false);};},[]);
  useEffect(()=>{load();},[load]);
  const loadProgress=async(cid:any)=>{setProgLoading(true);try{setProgressList(await sb.get("progress",`?client_id=eq.${cid}&order=date.desc`));}catch(e){console.error(e);}finally{setProgLoading(false);};};
  const openView=(c:any)=>{setView(c);loadProgress(c.id);};
  const openNew=()=>{setEditClientId(null);setClientForm({...emptyClient});setProgram({});setProgramName("");setMealPlan({});setMealPlanName("");setStep(1);setPlanType("both");setClientFormOpen(true);};
  const copyFromTemplate=(template:any)=>{
    setProgram(template.program||{});
    setProgramName((template.program_name||"")+" (kopija)");
    setMealPlan(template.meal_plan||{});
    setMealPlanName(template.meal_plan_name?(template.meal_plan_name+" (kopija)"):"");
    setPlanType(template.meal_plan_name&&template.program_name?"both":template.meal_plan_name?"meal":"training");
    setTemplateModal(false);
  };
  const openEdit=(c:any)=>{
    setEditClientId(c.id);
    setClientForm({name:c.name||"",age:c.age||"",weight:c.weight||"",height:c.height||"",gender:c.gender||"Vyras",goal:c.goal||"",level:c.level||"",notes:c.notes||"",training_days:c.training_days||[],activity_index:c.activity_index??2,phone:c.phone||"",birthday:c.birthday||""});
    setProgram(c.program||{});setProgramName(c.program_name||"");
    setMealPlan(c.meal_plan||{});setMealPlanName(c.meal_plan_name||"");
    setPlanType(c.meal_plan_name&&c.program_name?"both":c.meal_plan_name?"meal":"training");
    setStep(1);setClientFormOpen(true);setView(null);
  };
  const saveClient=async()=>{
    if(!clientForm.name.trim())return;setSaving(true);
    // Auto-name meal plan if user added foods but left name blank
    const hasMealContent=Object.values(mealPlan).some((day:any)=>Object.values(day||{}).some((items:any)=>items?.length>0));
    const finalMealName=mealPlanName||(hasMealContent?`${clientForm.name} mitybos planas`:"");
    // Auto-name program if user added exercises but left name blank
    const hasProgramContent=Object.values(program).some((d:any)=>d?.length>0);
    const finalProgramName=programName||(hasProgramContent?`${clientForm.name} programa`:"");
    const data={...clientForm,program,program_name:finalProgramName,meal_plan:mealPlan,meal_plan_name:finalMealName,coach_id:getCoachId()};
    try{if(editClientId)await sb.update("clients",editClientId,data);else await sb.insert("clients",data);setClientFormOpen(false);
      const fresh=await sb.get("clients",`?id=eq.${editClientId||"x"}&limit=1`).catch(()=>[]);
      if(fresh.length&&view&&fresh[0].id===view.id)setView(fresh[0]);
      await load();}
    catch(e:any){alert("Klaida: "+e.message);}finally{setSaving(false);}
  };
  const delClient=async(id:any)=>{try{await sb.delete("clients",id);setConfirmDel(null);setView(null);await load();}catch(e:any){alert("Klaida: "+e.message);}};
  const saveProgress=async()=>{
    if(!view||!progForm.weight)return;setSaving(true);
    try{await sb.insert("progress",{client_id:view.id,...progForm});setProgFormOpen(false);setProgForm({date:"",weight:"",chest:"",waist:"",hips:"",notes:""});await loadProgress(view.id);}
    catch(e:any){alert("Klaida: "+e.message);}finally{setSaving(false);}
  };
  const delProgress=async(id:any)=>{try{await sb.delete("progress",id);await loadProgress(view.id);}catch(e:any){alert("Klaida: "+e.message);}};
  const toggleDay=(d:string)=>setClientForm(p=>({...p,training_days:p.training_days.includes(d)?p.training_days.filter((x:string)=>x!==d):[...p.training_days,d]}));
  const openPick=(day:string)=>{setPickDay(day);setPickedEx(null);setPickSets("");setPickReps("");setPickWeight("");setPickRest("");};
  const pickList=exercises.filter(e=>(pickMuscle==="Visos"||e.muscle===pickMuscle)&&(e.name.toLowerCase().includes(pickSearch.toLowerCase())||e.muscle.toLowerCase().includes(pickSearch.toLowerCase())));
  const addToDay=()=>{if(!pickedEx)return;const isSuperset=pickSets==="SS";setProgram((p:any)=>({...p,[pickDay]:[...(p[pickDay]||[]),{...pickedEx,customSets:isSuperset?"3":pickSets||pickedEx.sets,customReps:pickReps||pickedEx.reps,customWeight:pickWeight||"",customRest:pickRest||"",superset:isSuperset}]}));setPickDay(null);};
  const removeFromDay=(day:string,idx:number)=>setProgram((p:any)=>({...p,[day]:p[day].filter((_:any,i:number)=>i!==idx)}));
  const openShareModal=async(c:any)=>{
    let token=c.share_token;
    if(!token){token=genToken();await sb.update("clients",c.id,{share_token:token});await load();}
    setShareModal({client:c,token});
  };


  // ── Program difficulty score (#9) ─────────────────────
  const calcDifficulty=(program:any)=>{
    const allEx=Object.values(program||{}).flat() as any[];
    if(!allEx.length) return null;
    let score=0;
    allEx.forEach((ex:any)=>{
      const sets=parseInt(ex.customSets||ex.sets||"3");
      const repsStr=(ex.customReps||ex.reps||"10");
      const repsMax=parseInt(repsStr.toString().split(/[-–]/)[1]||repsStr)||10;
      const weight=parseFloat(ex.customWeight||"0");
      // Volume score: sets × reps
      const volume=sets*repsMax;
      // Intensity bonus for heavy weights
      const weightBonus=weight>0?Math.min(weight/20,3):0;
      // Superset bonus
      const ssBonus=ex.superset?0.5:0;
      score+=volume*0.1+weightBonus+ssBonus;
    });
    const perDay=score/(Object.keys(program||{}).filter(d=>(program[d]||[]).length>0).length||1);
    const raw=Math.min(10,Math.round(perDay*0.8*10)/10);
    const label=raw<=3?"Lengvas":raw<=5?"Vidutinis":raw<=7?"Sunkus":"Elitinis";
    const color=raw<=3?"#4E9068":raw<=5?"#D4A853":raw<=7?"#E07B5A":"#C05050";
    return{score:raw,label,color};
  };

  const printPDF=(c:any,pl:any[])=>{
    const prog=c.program||{},pn=c.program_name||"";
    const bv=calcBMI(c.weight,c.height),bn=bv?parseFloat(bv.toFixed(1)):null,bc=bn?bmiCat(bn):null;
    const nut2=calcNut(c.weight,c.height,c.age,c.gender,ACTIVITY_LEVELS[c.activity_index??2]?.factor||1.55);
    const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
    const today2=new Date().toLocaleDateString("lt-LT");
    const diff=calcDifficulty(prog);
    const win=window.open("","_blank");
    if(!win){alert("Leiskite iššokančius langus!");return;}
    const css2=`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Barlow',Arial,sans-serif;background:#F5F2EC;color:#1A1A1A;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:11px;}.cover{background:#060709;position:relative;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.cover-inner{padding:32px 36px 28px;position:relative;z-index:1;}.cover-bg{position:absolute;inset:0;background:linear-gradient(135deg,#060709 40%,#0F1118 100%);}.cover-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(212,168,83,0.06)1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.06)1px,transparent 1px);background-size:40px 40px;}.cover-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;}.logo-wrap{display:flex;align-items:center;gap:12px;}.logo-text{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#F5F0E8;letter-spacing:0.22em;text-transform:uppercase;line-height:1;}.logo-sub{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#404858;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;}.date-tag{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#606878;letter-spacing:0.14em;text-align:right;}.cover-label{display:flex;align-items:center;gap:10px;margin-bottom:8px;}.cover-num{font-family:'Bebas Neue',sans-serif;font-size:10px;color:#D4A853;letter-spacing:0.3em;}.cover-line{width:20px;height:1px;background:#D4A853;}.cover-main{font-family:'Bebas Neue',sans-serif;font-size:52px;color:#FFFFFF;line-height:0.9;letter-spacing:0.03em;}.cover-gold{color:#D4A853;}.cover-meta{display:flex;gap:20px;margin-top:16px;flex-wrap:wrap;}.meta-item{}.meta-label{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#505868;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:2px;}.meta-val{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#F5F0E8;}.meta-gold{color:#D4A853;}.diff-bar{background:#0C0E14;border-top:1px solid #1E2330;padding:10px 36px;display:flex;align-items:center;gap:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.diff-lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#505868;letter-spacing:0.18em;text-transform:uppercase;}.diff-track{flex:1;height:3px;background:#1E2330;max-width:180px;}.diff-fill{height:100%;}.diff-tag{font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.12em;padding:2px 9px;border:1px solid;}.pb{position:fixed;top:10px;right:10px;padding:9px 18px;background:#D4A853;color:#060709;border:none;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;z-index:999;}.sec{margin:14px 18px;background:#FFFFFF;border:1px solid #E8E4DC;}.sh{background:#060709;padding:9px 16px;display:flex;align-items:center;gap:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.sn{font-family:'Bebas Neue',sans-serif;font-size:9px;color:#D4A853;letter-spacing:0.3em;}.sl{width:14px;height:1px;background:#D4A853;}.st{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;color:#F5F0E8;letter-spacing:0.16em;text-transform:uppercase;}.ig{display:flex;flex-wrap:wrap;gap:1px;background:#E8E4DC;}.ib{background:#FFFFFF;padding:9px 12px;min-width:75px;}.il{font-size:8px;color:#9A9888;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:2px;font-family:'Barlow Condensed',sans-serif;}.iv{font-size:13px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}.dh{background:#F5F2EC;padding:8px 16px;border-bottom:1px solid #E8E4DC;display:flex;align-items:center;justify-content:space-between;}.dn{font-family:'Bebas Neue',sans-serif;font-size:16px;color:#1A1A1A;letter-spacing:0.06em;}.dc{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#9A9888;letter-spacing:0.12em;text-transform:uppercase;}.er{display:flex;gap:10px;padding:9px 14px;border-top:1px solid #F0EDE8;align-items:flex-start;page-break-inside:avoid;}.en{width:18px;height:18px;background:#060709;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:10px;color:#D4A853;flex-shrink:0;margin-top:3px;}.ei{width:78px;height:62px;object-fit:cover;flex-shrink:0;border:1px solid #E8E4DC;}.ep{width:78px;height:62px;background:#F5F2EC;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;border:1px solid #E8E4DC;}.en2{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#1A1A1A;letter-spacing:0.04em;margin-bottom:1px;}.em{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#D4A853;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;margin-bottom:5px;}.chips{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:3px;}.chip{padding:2px 8px;font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:0.08em;border:1px solid;}.cg{background:#D4A85318;border-color:#D4A85140;color:#8B6520;}.cb{background:#5B8DB818;border-color:#5B8DB840;color:#3A6A90;}.cv{background:#7B6DB018;border-color:#7B6DB040;color:#5A4A90;}.cn{background:#4E906818;border-color:#4E906840;color:#2A6040;}.css2{background:#7B6DB030;border-color:#7B6DB060;color:#5A4A90;}.ed{font-size:9px;color:#9A9888;font-style:italic;line-height:1.5;margin-top:2px;}.ng{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #E8E4DC;}.nc{padding:12px 14px;}.nt{font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid;}.pt{width:100%;border-collapse:collapse;}.pt th{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#9A9888;letter-spacing:0.14em;text-transform:uppercase;padding:6px 10px;background:#F5F2EC;border-bottom:1px solid #E8E4DC;text-align:left;}.pt td{padding:6px 10px;border-bottom:1px solid #F5F2EC;font-size:10px;}.ft{text-align:center;padding:12px;color:#C8C4BC;font-size:9px;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.14em;text-transform:uppercase;border-top:1px solid #E8E4DC;margin:14px 18px 18px;}@media print{.pb{display:none;}body{background:#fff;}.sec{margin:10px 14px;}}`;
    let h=`<!DOCTYPE html><html lang="lt"><head><meta charset="UTF-8"><title>${pn||"Programa"} · ${c.name}</title><style>${css2}</style></head><body>`;
    h+=`<button class="pb" onclick="window.print()">🖨️ Spausdinti / PDF</button>`;
    // Cover
    h+=`<div class="cover"><div class="cover-bg"></div><div class="cover-grid"></div><div class="cover-inner"><div class="cover-top"><div class="logo-wrap"><svg width="32" height="32" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21" stroke="#D4A853" stroke-width="1.2" opacity="0.6"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" stroke-width="1.4" fill="none"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" stroke-width="1.4" fill="none" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" stroke-width="1.4" fill="none" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="2.5" fill="#D4A853"/></svg><div><div class="logo-text">DNA TRAINER</div><div class="logo-sub">Coach Platform</div></div></div><div class="date-tag">${today2}</div></div><div class="cover-label"><span class="cover-num">01</span><div class="cover-line"></div></div><div class="cover-main">${pn||"TRENIRUOČIŲ"}<br/><span class="cover-gold">PROGRAMA</span></div><div class="cover-meta">`;
    if(c.name)h+=`<div class="meta-item"><div class="meta-label">Klientas</div><div class="meta-val">${c.name}</div></div>`;
    if(c.goal)h+=`<div class="meta-item"><div class="meta-label">Tikslas</div><div class="meta-val meta-gold">${c.goal}</div></div>`;
    if(c.level)h+=`<div class="meta-item"><div class="meta-label">Lygis</div><div class="meta-val">${c.level}</div></div>`;
    h+=`<div class="meta-item"><div class="meta-label">Treniruočių dienų</div><div class="meta-val meta-gold">${days2.length}/sav.</div></div>`;
    h+=`</div></div>`;
    if(diff)h+=`<div class="diff-bar"><span class="diff-lbl">Sunkumas</span><div class="diff-track"><div class="diff-fill" style="width:${diff.score*10}%;background:${diff.color}"></div></div><span class="diff-tag" style="color:${diff.color};border-color:${diff.color}40;background:${diff.color}15">${diff.label.toUpperCase()} ${diff.score}/10</span></div>`;
    h+=`</div>`;
    // Client info
    h+=`<div class="sec"><div class="sh"><span class="sn">02</span><div class="sl"></div><span class="st">Kliento informacija</span></div><div class="ig">`;
    if(c.name)h+=`<div class="ib"><div class="il">Vardas</div><div class="iv">${c.name}</div></div>`;
    if(c.age)h+=`<div class="ib"><div class="il">Amžius</div><div class="iv">${c.age} m.</div></div>`;
    if(c.weight)h+=`<div class="ib"><div class="il">Svoris</div><div class="iv">${c.weight} kg</div></div>`;
    if(c.height)h+=`<div class="ib"><div class="il">Ūgis</div><div class="iv">${c.height} cm</div></div>`;
    if(c.gender)h+=`<div class="ib"><div class="il">Lytis</div><div class="iv">${c.gender}</div></div>`;
    if(bn)h+=`<div class="ib" style="background:${bc!.color}15;"><div class="il">KMI</div><div class="iv" style="color:${bc!.color}">${bn} — ${bc!.label}</div></div>`;
    h+=`</div>${c.notes?`<div style="padding:9px 14px;font-size:10px;color:#9A9888;font-style:italic;border-top:1px solid #F5F2EC;">📝 ${c.notes}</div>`:""}</div>`;
    // Nutrition
    if(nut2){
      h+=`<div class="sec"><div class="sh"><span class="sn">03</span><div class="sl"></div><span class="st">Mitybos rekomendacijos</span></div><div class="ng">`;
      h+=`<div class="nc" style="border-right:1px solid #E8E4DC;"><div class="nt" style="color:#C05050;border-color:#C0505040;">🔻 Riebalų deginimas — ${nut2.lose} kcal/d.</div><div style="display:flex;gap:4px;flex-wrap:wrap;"><div class="ib" style="background:#C0505012;"><div class="il">Baltymai</div><div class="iv" style="color:#C05050">${nut2.protLose}g</div></div><div class="ib" style="background:#E07B5A12;"><div class="il">Angliavandeniai</div><div class="iv" style="color:#E07B5A">${nut2.carbLose}g</div></div><div class="ib" style="background:#7B6DB012;"><div class="il">Riebalai</div><div class="iv" style="color:#7B6DB0">${nut2.fatLose}g</div></div></div></div>`;
      h+=`<div class="nc"><div class="nt" style="color:#4E9068;border-color:#4E906840;">🔺 Raumenų auginimas — ${nut2.gain} kcal/d.</div><div style="display:flex;gap:4px;flex-wrap:wrap;"><div class="ib" style="background:#4E906812;"><div class="il">Baltymai</div><div class="iv" style="color:#4E9068">${nut2.protGain}g</div></div><div class="ib" style="background:#E07B5A12;"><div class="il">Angliavandeniai</div><div class="iv" style="color:#E07B5A">${nut2.carbGain}g</div></div><div class="ib" style="background:#7B6DB012;"><div class="il">Riebalai</div><div class="iv" style="color:#7B6DB0">${nut2.fatGain}g</div></div></div></div>`;
      h+=`</div></div>`;
    }
    // Days
    let dn=4;
    days2.forEach(day2=>{
      const exs=prog[day2]||[];
      h+=`<div class="sec"><div class="sh"><span class="sn">${String(dn++).padStart(2,"0")}</span><div class="sl"></div><span class="st">${day2}</span></div><div class="dh"><div class="dn">${day2.toUpperCase()}</div><div class="dc">${exs.length} pratimas(-ai)</div></div>`;
      if(!exs.length)h+=`<div style="padding:12px 16px;color:#C8C4BC;font-size:10px;font-style:italic;">Pratimų nėra</div>`;
      else exs.forEach((ex:any,i:number)=>{
        const imgs=(ex.imgs||[]).filter(Boolean);
        h+=`<div class="er"><div class="en">${i+1}</div>`;
        h+=imgs[0]?`<img src="${imgs[0]}" class="ei" onerror="this.style.display='none'"/>`:`<div class="ep">📷</div>`;
        h+=`<div style="flex:1"><div class="en2">${ex.superset?`<span class="chip css2">SS</span> `:""}${ex.name}</div><div class="em">${ex.muscle||""}${ex.equipment?` · ${ex.equipment}`:""}</div><div class="chips">`;
        if(ex.customSets)h+=`<span class="chip cg">Ser: ${ex.customSets}</span>`;
        if(ex.customReps)h+=`<span class="chip cb">Kart: ${ex.customReps}</span>`;
        if(ex.customWeight)h+=`<span class="chip cn">Svoris: ${ex.customWeight}kg</span>`;
        if(ex.customRest)h+=`<span class="chip cv">Poilsis: ${ex.customRest}</span>`;
        h+=`</div>${ex.description?`<div class="ed">${ex.description}</div>`:""}</div></div>`;
      });
      h+=`</div>`;
    });
    // Progress
    if(pl&&pl.length>0){
      h+=`<div class="sec"><div class="sh"><span class="sn">${String(dn++).padStart(2,"0")}</span><div class="sl"></div><span class="st">Pažangos istorija</span></div>`;
      h+=`<table class="pt"><thead><tr><th>Data</th><th>Svoris</th><th>Krūtinė</th><th>Juosmuo</th><th>Klubai</th><th>Pastabos</th></tr></thead><tbody>`;
      pl.forEach((p:any,i:number)=>{h+=`<tr style="background:${i%2?"#FAFAF8":"#FFF"}"><td>${new Date(p.date).toLocaleDateString("lt-LT")}</td><td style="font-weight:700;color:#D4A853;font-family:'Barlow Condensed'">${p.weight?p.weight+" kg":"—"}</td><td>${p.chest?p.chest+" cm":"—"}</td><td>${p.waist?p.waist+" cm":"—"}</td><td>${p.hips?p.hips+" cm":"—"}</td><td style="color:#9A9888;font-style:italic">${p.notes||"—"}</td></tr>`;});
      h+=`</tbody></table></div>`;
    }
    h+=`<div class="ft">DNA Trainer · Coach Platform · ${today2}</div></body></html>`;
    win.document.write(h);win.document.close();
  };


  const printMealPDF=(c:any)=>{
    const mp=c.meal_plan||{},mpn=c.meal_plan_name||"Mitybos planas";
    const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
    const today2=new Date().toLocaleDateString("lt-LT");
    const win=window.open("","_blank");
    if(!win){alert("Leiskite iššokančius langus!");return;}
    const pstyle=`*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#fff;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}.hdr{background:#1A1A1A;padding:18px 24px;display:flex;align-items:center;gap:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.logo{width:42px;height:42px;background:linear-gradient(135deg,#2D7D46,#1F5C33);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;flex-shrink:0}.ht{font-size:17px;font-weight:900;color:#22c55e}.hs{font-size:9px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px}.hr{margin-left:auto;text-align:right;color:#fff}.sec{margin:12px 18px;border:1.5px solid #e0e0e8;border-radius:11px;overflow:hidden}.sh{background:#1A1A1A;color:#fff;padding:9px 16px;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;-webkit-print-color-adjust:exact;print-color-adjust:exact}.day-tot{display:flex;gap:8px;padding:8px 14px;background:#f9fafb;border-bottom:1px solid #eee;flex-wrap:wrap}.tot-badge{border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700}.mt-hdr{padding:8px 14px 4px;font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px}.fr{display:flex;gap:10px;padding:6px 14px;border-top:1px solid #f5f5f5;align-items:center;page-break-inside:avoid}.fi{width:52px;height:52px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid #eee}.fp{width:52px;height:52px;background:#f0f0f5;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px}.fn{font-size:12px;font-weight:700;margin-bottom:2px}.fg{font-size:10px;color:#888}.fb{display:flex;gap:5px;margin-top:3px;flex-wrap:wrap}.fbb{border-radius:5px;padding:2px 7px;font-size:10px;font-weight:600}.pb{position:fixed;top:10px;right:10px;padding:9px 18px;background:#2D7D46;color:#fff;border:none;border-radius:8px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;z-index:999;box-shadow:0 2px 8px #0003}.ft{text-align:center;padding:14px;color:#aaa;font-size:10px;border-top:1px solid #eee;margin-top:10px}@media(max-width:600px){.sec{margin:8px 10px}.fr{gap:8px;padding:5px 10px}.fi,.fp{width:42px;height:42px}.pb{top:6px;right:6px;padding:7px 12px;font-size:12px}}@media print{.pb{display:none}}`;
    let h=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${mpn}-${c.name}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>${pstyle}</style></head><body>`;
    h+=`<button class="pb" onclick="window.print()">🖨️ Išsaugoti kaip PDF</button>`;
    h+=`<div class="hdr"><div class="logo">🥗</div><div><div class="ht">DNA Trainer</div><div class="hs">Mitybos planas</div></div><div class="hr"><div style="font-size:13px;font-weight:700">${mpn}</div><div style="font-size:10px;color:#888;margin-top:2px">${c.name} · ${today2}</div></div></div>`;
    // Client info strip
    h+=`<div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 18px;background:#f9fafb;border-bottom:1px solid #eee">`;
    if(c.name)h+=`<span style="background:#f0f0f8;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600">👤 ${c.name}</span>`;
    if(c.goal)h+=`<span style="background:#f0b42918;border:1px solid #f0b42940;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;color:#c9a000">${c.goal}</span>`;
    if(c.weight)h+=`<span style="background:#f0f0f8;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600">⚖️ ${c.weight} kg</span>`;
    h+=`</div>`;
    // Days
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
      // Meal times
      const MEAL_TIMES_ORDER=["🌅 Pusryčiai","☀️ Priešpiečiai","🍽️ Pietūs","🌤️ Užkandis","🌙 Vakarienė"];
      MEAL_TIMES_ORDER.forEach(mt=>{
        const items=(dayData[mt]||[]) as any[];
        if(!items.length)return;
        const mtKcal=items.reduce((a:any,f:any)=>a+(f.kcalActual||0),0);
        h+=`<div class="mt-hdr">${mt} <span style="color:#888;font-weight:400;font-size:9px;margin-left:4px">${Math.round(mtKcal)} kcal</span></div>`;
        items.forEach(f=>{
          const img=(f.imgs||[]).filter(Boolean)[0];
          h+=`<div class="fr">`;
          h+=img?`<img src="${img}" class="fi"/>`:`<div class="fp">🍽️</div>`;
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
    win.document.write(h);win.document.close();
  };

  const bmiVal=calcBMI(clientForm.weight,clientForm.height);
  const bmiNum=bmiVal?parseFloat(bmiVal.toFixed(1)):null;
  const nut=calcNut(clientForm.weight,clientForm.height,clientForm.age,clientForm.gender,ACTIVITY_LEVELS[clientForm.activity_index]?.factor||1.55);
  const trainingDays=DAYS.filter(d=>clientForm.training_days.includes(d));
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.goal||"").toLowerCase().includes(search.toLowerCase()));
  const baseUrl=window.location.origin+window.location.pathname;

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div><div style={{fontSize:24,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>Klientų duomenų bazė</div><div style={{color:C.muted,fontSize:13,marginTop:2}}>{clients.length} klientų</div></div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto"}}>+ Naujas klientas</button>
      </div>
      <Err msg={error}/>
      {clients.length>0&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti kliento..." style={{...css.input,maxWidth:360,marginBottom:16}}/>}
      {loading?(<div className="cl-grid">{[1,2,3,4,5,6].map(i=><SkeletonCard key={i}/>)}</div>):(
        clients.length===0?(
          <div style={{...css.card,textAlign:"center",padding:"60px 32px"}}>
            <div style={{fontSize:48,marginBottom:14}}>👥</div>
            <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:8}}>Klientų dar nėra</div>
            <button onClick={openNew} style={css.btnG}>+ Pridėti pirmą klientą</button>
          </div>
        ):(
          <div className="cl-grid" style={{}}>
            {filtered.map(c=>{
              const bmi=calcBMI(c.weight,c.height);
              const bmiN=bmi?parseFloat(bmi.toFixed(1)):null;
              const bmiC=bmiN?bmiCat(bmiN):null;
              const dayCount=Object.values(c.program||{}).filter((d:any)=>d.length>0).length;
              const exCount=Object.values(c.program||{}).reduce((s:any,d:any)=>s+d.length,0) as number;
              const todayName=DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
              const trainsToday=(c.training_days||[]).includes(todayName);
              const completionPct=Math.min(100,Math.round((exCount/20)*100));
              return(
                <div key={c.id} style={{background:C.surface,borderRadius:16,border:`1px solid ${trainsToday?C.goldBorder:C.border}`,overflow:"hidden",display:"flex",flexDirection:"column" as const,transition:"transform .15s,border-color .15s",cursor:"pointer"}} onClick={()=>openView(c)}>
                  {/* Card top — accent bar */}
                  <div style={{height:3,background:trainsToday?`linear-gradient(to right,${C.gold},${C.gold}80)`:C.border}}/>
                  <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"flex-start",gap:12}}>
                    {/* Avatar */}
                    <div style={{width:46,height:46,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:C.bg,flexShrink:0,position:"relative" as const}}>
                      {(c.name||"?")[0].toUpperCase()}
                      {trainsToday&&<div style={{position:"absolute" as const,bottom:-3,right:-3,width:12,height:12,borderRadius:"50%",background:C.green,border:`2px solid ${C.surface}`}}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap" as const}}>
                        {c.goal&&<span style={{fontSize:10,background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"1px 7px",color:C.gold,fontWeight:600}}>{c.goal}</span>}
                        {c.level&&<span style={{fontSize:10,background:C.tealSoft,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"1px 7px",color:C.teal,fontWeight:600}}>{c.level}</span>}
                      </div>
                    </div>
                    <div style={{textAlign:"right" as const,flexShrink:0}}>
                      {bmiN&&<div style={{fontSize:13,fontWeight:800,color:bmiC!.color}}>{bmiN}</div>}
                      {bmiN&&<div style={{fontSize:9,color:C.muted,letterSpacing:"0.06em"}}>KMI</div>}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
                    {[[dayCount,"dienų","📅"],[exCount,"pratimų","🏋️"],[c.weight?c.weight+"kg":"—","svoris","⚖️"]].map(([val,lbl,icon],i)=>(
                      <div key={lbl as string} style={{padding:"8px 0",textAlign:"center" as const,borderRight:i<2?`1px solid ${C.border}`:"none"}}>
                        <div style={{fontSize:14,fontWeight:800,color:C.text}}>{val}</div>
                        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.06em",marginTop:1}}>{lbl as string}</div>
                      </div>
                    ))}
                  </div>

                  {/* Program completion bar */}
                  <div style={{padding:"10px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <div style={{fontSize:10,color:C.muted,fontFamily:CONDENSED_FONT,letterSpacing:"0.06em"}}>{c.program_name||"Programa"}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {(()=>{const d=calcDifficulty(c.program);return d?<span style={{fontSize:9,background:d.color+"18",border:`1px solid ${d.color}40`,padding:"1px 7px",color:d.color,fontFamily:CONDENSED_FONT,fontWeight:700,letterSpacing:"0.1em"}}>{d.label.toUpperCase()} {d.score}/10</span>:null;})()}
                        <div style={{fontSize:10,color:C.gold,fontWeight:600}}>{completionPct}%</div>
                      </div>
                    </div>
                    <div style={{height:3,background:C.faint,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${completionPct}%`,background:`linear-gradient(to right,${C.gold},${C.gold}88)`,transition:"width .3s"}}/>
                    </div>
                    {c.meal_plan_name&&<div style={{marginTop:7,fontSize:10,color:C.green,display:"flex",alignItems:"center",gap:4,fontFamily:CONDENSED_FONT,letterSpacing:"0.06em"}}>🥗 <span>{c.meal_plan_name}</span></div>}
                  </div>

                  {/* Actions */}
                  <div style={{padding:"0 12px 12px",display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>openView(c)} style={{...css.btnTeal,flex:1,fontSize:11,justifyContent:"center",padding:"7px 6px"}}>👁️ Peržiūrėti</button>
                    <button onClick={()=>openEdit(c)} style={{...css.btnG,flex:1,fontSize:11,padding:"7px 6px"}}>✏️ Redaguoti</button>
                    {c.phone&&<a href={`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Sveiki ${c.name}! 💪`)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{...css.btnGreen,padding:"7px 10px",fontSize:16,textDecoration:"none",display:"flex",alignItems:"center"}} title="WhatsApp">💬</a>}
                    <button onClick={()=>openShareModal(c)} style={{...css.btnGhost,padding:"7px 10px",fontSize:13}} title="Nuoroda klientui">🔗</button>
                    <button onClick={()=>setConfirmDel(c)} style={{...css.btnRed,padding:"7px 10px",fontSize:13}}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Share modal */}
      {shareModal&&(<ShareModal shareModal={shareModal} setShareModal={setShareModal} baseUrl={baseUrl}/>)}

      {/* Client detail view */}
      {view&&(<div style={css.overlay}><div style={{...css.modal(880)}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:C.bg,flexShrink:0}}>{(view.name||"?")[0].toUpperCase()}</div>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>{view.name}</div>
            <button onClick={()=>setView(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
          </div>
          <div className="view-actions">
            <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>📈 Pažanga</button>
            <button onClick={()=>openEdit(view)} style={{...css.btnG,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 12px",fontSize:12}}>✏️ Redaguoti</button>
            <button onClick={()=>openShareModal(view)} style={{...css.btnGhost,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12}}>🔗 Nuoroda</button>
            <button onClick={()=>printPDF(view,progressList)} style={{...css.btnGhost,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12,color:C.gold,borderColor:C.goldBorder}}>🖨️ Treniruočių PDF</button>
            <button onClick={()=>view.meal_plan_name?printMealPDF(view):alert("Šis klientas neturi mitybos plano.")} style={{...css.btnGhost,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12,color:view.meal_plan_name?C.green:C.muted,borderColor:view.meal_plan_name?C.greenBorder:C.border,opacity:view.meal_plan_name?1:0.5}}>🥗 Mitybos PDF</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:18,flex:1}} className="modal-inner">
          {/* Info */}
          <div style={{...css.card,marginBottom:12}}>
            <span style={css.secTitle}>Kliento duomenys</span>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
              {[["Amžius",view.age&&view.age+" m."],["Svoris",view.weight&&view.weight+" kg"],["Ūgis",view.height&&view.height+" cm"],["Lytis",view.gender],["Tikslas",view.goal],["Lygis",view.level]].filter(([,v])=>v).map(([l,v])=>(
                <div key={l as string} style={{background:C.faint,borderRadius:7,padding:"6px 11px"}}>
                  <div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{v}</div>
                </div>
              ))}
              {(()=>{const b=calcBMI(view.weight,view.height);if(!b)return null;const bn=parseFloat(b.toFixed(1));const bc=bmiCat(bn);return(<div style={{background:C.faint,borderRadius:7,padding:"6px 11px"}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>KMI</div><div style={{fontSize:13,fontWeight:700,color:bc.color}}>{bn} — {bc.label}</div></div>);})()}
            </div>
            {view.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>📝 {view.notes}</div>}
          </div>
          {/* Progress */}
          <div style={{...css.card,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:"0.04em",marginBottom:0}}>📈 PAŽANGOS ISTORIJA</span>
              <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,marginLeft:"auto",fontSize:11}}>+ Pridėti</button>
            </div>
            {progLoading?<Spinner/>:progressList.length===0
              ?<div style={{textAlign:"center",color:C.muted,padding:"24px 0",fontSize:13}}>
                  <div style={{fontSize:32,marginBottom:8}}>📊</div>
                  Pažangos įrašų dar nėra.<br/>
                  <span style={{fontSize:11}}>Pridėkite pirmą matavimą!</span>
                </div>
              :(<>
                {/* Weight chart */}
                {progressList.filter(p=>p.weight).length>=2&&(()=>{
                  const pts=[...progressList].filter(p=>p.weight).reverse();
                  const weights=pts.map(p=>parseFloat(p.weight));
                  const minW=Math.min(...weights)-1;
                  const maxW=Math.max(...weights)+1;
                  const range=maxW-minW||1;
                  const W=100,H=60;
                  const cx=(i:number)=>(i/(pts.length-1))*W;
                  const cy=(w:number)=>H-((w-minW)/range)*H;
                  const path=pts.map((p,i)=>`${i===0?"M":"L"}${cx(i).toFixed(1)},${cy(parseFloat(p.weight)).toFixed(1)}`).join(" ");
                  const area=`${path} L${W},${H} L0,${H} Z`;
                  const first=weights[0],last=weights[weights.length-1];
                  const diff=last-first;
                  const trend=diff<0?"↓ Mažėja":"↑ Didėja";
                  const trendColor=diff<0?C.green:C.red;
                  return(
                    <div style={{marginBottom:16}}>
                      {/* Summary row */}
                      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap" as const}}>
                        <div style={{background:C.faint,borderRadius:8,padding:"8px 12px",flex:1,minWidth:80}}>
                          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:3}}>Pradinis</div>
                          <div style={{fontSize:18,fontWeight:800,color:C.text}}>{weights[0]} <span style={{fontSize:10,color:C.muted}}>kg</span></div>
                        </div>
                        <div style={{background:C.faint,borderRadius:8,padding:"8px 12px",flex:1,minWidth:80}}>
                          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:3}}>Dabartinis</div>
                          <div style={{fontSize:18,fontWeight:800,color:C.gold}}>{weights[weights.length-1]} <span style={{fontSize:10,color:C.muted}}>kg</span></div>
                        </div>
                        <div style={{background:C.faint,borderRadius:8,padding:"8px 12px",flex:1,minWidth:80}}>
                          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:3}}>Pokytis</div>
                          <div style={{fontSize:18,fontWeight:800,color:trendColor}}>{diff>0?"+":""}{diff.toFixed(1)} <span style={{fontSize:10,color:C.muted}}>kg</span></div>
                        </div>
                        <div style={{background:C.faint,borderRadius:8,padding:"8px 12px",flex:1,minWidth:80}}>
                          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:3}}>Tendencija</div>
                          <div style={{fontSize:15,fontWeight:800,color:trendColor,marginTop:2}}>{trend}</div>
                        </div>
                      </div>
                      {/* SVG chart */}
                      <div style={{background:C.faint,borderRadius:12,padding:"14px 12px 8px",border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:8,textTransform:"uppercase" as const}}>Svorio dinamika (kg)</div>
                        <svg viewBox={`0 0 ${W} ${H+14}`} style={{width:"100%",overflow:"visible"}}>
                          {/* Grid lines */}
                          {[0,0.25,0.5,0.75,1].map(t=>(
                            <line key={t} x1="0" y1={(H*(1-t)).toFixed(1)} x2={W} y2={(H*(1-t)).toFixed(1)} stroke={C.border} strokeWidth="0.5" strokeDasharray="2,2"/>
                          ))}
                          {/* Area fill */}
                          <defs>
                            <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={C.gold} stopOpacity="0.25"/>
                              <stop offset="100%" stopColor={C.gold} stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <path d={area} fill="url(#wgrad)"/>
                          {/* Line */}
                          <path d={path} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          {/* Dots + labels */}
                          {pts.map((p,i)=>(
                            <g key={i}>
                              <circle cx={cx(i).toFixed(1)} cy={cy(parseFloat(p.weight)).toFixed(1)} r="3" fill={C.gold} stroke={C.surface} strokeWidth="1.5"/>
                              {/* X-axis date label */}
                              <text x={cx(i).toFixed(1)} y={H+11} textAnchor="middle" fontSize="4.5" fill={C.muted}>
                                {new Date(p.date).toLocaleDateString("lt-LT",{month:"numeric",day:"numeric"})}
                              </text>
                            </g>
                          ))}
                          {/* Y-axis labels */}
                          {[minW+1,Math.round((minW+maxW)/2),maxW-1].map((v,i)=>(
                            <text key={i} x="-1" y={(cy(v)+1.5).toFixed(1)} textAnchor="end" fontSize="4.5" fill={C.muted}>{v.toFixed(0)}</text>
                          ))}
                        </svg>
                      </div>

                      {/* Measurements chart if available */}
                      {progressList.some(p=>p.waist||p.chest||p.hips)&&(()=>{
                        const mPts=[...progressList].filter(p=>p.waist||p.chest||p.hips).reverse();
                        if(mPts.length<2)return null;
                        const series=[
                          {key:"waist",label:"Juosmuo",color:C.teal},
                          {key:"chest",label:"Krūtinė",color:C.purple},
                          {key:"hips",label:"Klubai",color:C.green},
                        ].filter(s=>mPts.some((p:any)=>p[s.key]));
                        const allVals=series.flatMap(s=>mPts.map((p:any)=>parseFloat(p[s.key]||"0")).filter(Boolean));
                        const minM=Math.min(...allVals)-1,maxM=Math.max(...allVals)+1,rangeM=maxM-minM||1;
                        const cxm=(i:number)=>(i/(mPts.length-1))*100;
                        const cym=(v:number)=>60-((v-minM)/rangeM)*60;
                        return(
                          <div style={{background:C.faint,borderRadius:12,padding:"14px 12px 8px",border:`1px solid ${C.border}`,marginTop:10}}>
                            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,flexWrap:"wrap" as const}}>
                              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const}}>Matmenys (cm)</div>
                              {series.map(s=>(
                                <div key={s.key} style={{display:"flex",alignItems:"center",gap:4}}>
                                  <div style={{width:8,height:2,background:s.color,borderRadius:1}}/>
                                  <span style={{fontSize:9,color:C.muted}}>{s.label}</span>
                                </div>
                              ))}
                            </div>
                            <svg viewBox="0 0 100 74" style={{width:"100%",overflow:"visible"}}>
                              {[0,0.5,1].map(t=>(
                                <line key={t} x1="0" y1={(60*(1-t)).toFixed(1)} x2="100" y2={(60*(1-t)).toFixed(1)} stroke={C.border} strokeWidth="0.5" strokeDasharray="2,2"/>
                              ))}
                              {series.map(s=>{
                                const linePts=mPts.filter((p:any)=>p[s.key]);
                                if(linePts.length<2)return null;
                                const p2=linePts.map((p:any,i:number)=>`${i===0?"M":"L"}${cxm(i).toFixed(1)},${cym(parseFloat(p[s.key])).toFixed(1)}`).join(" ");
                                return(
                                  <g key={s.key}>
                                    <path d={p2} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    {linePts.map((p:any,i:number)=>(
                                      <circle key={i} cx={cxm(i).toFixed(1)} cy={cym(parseFloat(p[s.key])).toFixed(1)} r="2.5" fill={s.color} stroke={C.surface} strokeWidth="1"/>
                                    ))}
                                  </g>
                                );
                              })}
                              {mPts.map((p:any,i:number)=>(
                                <text key={i} x={cxm(i).toFixed(1)} y="72" textAnchor="middle" fontSize="4.5" fill={C.muted}>
                                  {new Date(p.date).toLocaleDateString("lt-LT",{month:"numeric",day:"numeric"})}
                                </text>
                              ))}
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
                {/* Progress entries table */}
                <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                  {progressList.map((p:any)=>(
                    <div key={p.id} style={{background:C.faint,borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const}}>
                      <div style={{fontSize:11,color:C.muted,minWidth:76}}>{new Date(p.date).toLocaleDateString("lt-LT")}</div>
                      {p.weight&&<div style={{background:C.surface,borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700,color:C.gold}}>{p.weight} kg</div>}
                      {p.chest&&<div style={{fontSize:11,color:C.muted}}>Kr: <b style={{color:C.text}}>{p.chest}cm</b></div>}
                      {p.waist&&<div style={{fontSize:11,color:C.muted}}>Ju: <b style={{color:C.text}}>{p.waist}cm</b></div>}
                      {p.hips&&<div style={{fontSize:11,color:C.muted}}>Kl: <b style={{color:C.text}}>{p.hips}cm</b></div>}
                      {p.notes&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",flex:1}}>📝 {p.notes}</div>}
                      <button onClick={()=>delProgress(p.id)} style={{...css.btnRed,padding:"3px 7px",fontSize:10,marginLeft:"auto"}}>🗑️</button>
                    </div>
                  ))}
                </div>
              </>)
            }
          </div>
          {/* Training summary */}
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,fontFamily:CONDENSED_FONT,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:10}}>
            📋 {view.program_name||"Programa"}
            {(()=>{const d=calcDifficulty(view.program);return d?<span style={{fontSize:9,background:d.color+"18",border:`1px solid ${d.color}40`,padding:"2px 10px",color:d.color,fontFamily:CONDENSED_FONT,fontWeight:700,letterSpacing:"0.12em"}}>{d.label.toUpperCase()} · {d.score}/10</span>:null;})()}
          </div>
          {DAYS.filter(d=>(view.training_days||[]).includes(d)).map(day=>{
            const exs=(view.program||{})[day]||[];
            return(<div key={day} style={{...css.card,marginBottom:8,padding:0,overflow:"hidden"}}>
              <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.faint}`,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.gold}}/>
                <span style={{fontWeight:700,fontSize:11,textTransform:"uppercase" as const,letterSpacing:"0.1em"}}>{day}</span>
                <span style={{color:C.muted,fontSize:11}}>— {exs.length} prat.</span>
              </div>
              {exs.length===0?<div style={{padding:"8px 14px",color:C.muted,fontSize:12}}>Pratimų nėra</div>:(
                <div style={{padding:"6px 10px",display:"flex",flexDirection:"column",gap:5}}>
                  {exs.map((ex:any,i:number)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:C.faint,borderRadius:7,padding:"7px 10px"}}>
                      {ex.superset&&<div style={{fontSize:9,fontWeight:800,color:C.purple,background:C.purpleSoft,border:`1px solid ${C.purpleBorder}`,borderRadius:4,padding:"2px 5px",flexShrink:0}}>SS</div>}
                      <div style={{width:32,height:32,borderRadius:6,overflow:"hidden",background:C.border,flexShrink:0}}>{(ex.imgs||[]).filter(Boolean)[0]?<img src={(ex.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>}</div>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{ex.name}</div><div style={{fontSize:10,color:C.teal}}>{ex.muscle}</div></div>
                      <div style={{display:"flex",gap:4}}>{ex.customSets&&<span style={{fontSize:10,color:C.gold,fontWeight:700}}>{ex.customSets}s</span>}{ex.customReps&&<span style={{fontSize:10,color:C.muted}}>{ex.customReps}r</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>);
          })}
          {/* Meal plan section */}
          {view.meal_plan_name&&<>
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>🥗 {view.meal_plan_name}</div>
              <button onClick={()=>printMealPDF(view)} style={{...css.btnGreen,marginLeft:"auto",fontSize:11,padding:"5px 12px"}}>🖨️ Mitybos PDF</button>
            </div>
            {DAYS.filter(d=>(view.training_days||[]).includes(d)).map(day=>{
              const dayData=(view.meal_plan||{})[day]||{};
              const allFoods=Object.values(dayData).flat() as any[];
              const tot=allFoods.reduce((a:any,f:any)=>({kcal:a.kcal+(f.kcalActual||0),prot:a.prot+(f.protActual||0),carbs:a.carbs+(f.carbsActual||0),fat:a.fat+(f.fatActual||0)}),{kcal:0,prot:0,carbs:0,fat:0});
              if(!allFoods.length)return null;
              return(<div key={day} style={{...css.card,marginBottom:8,padding:0,overflow:"hidden"}}>
                <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.faint}`,display:"flex",alignItems:"center",gap:8,background:C.faint}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:C.green,flexShrink:0}}/>
                  <span style={{fontWeight:700,fontSize:11,textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>{day}</span>
                  {(tot as any).kcal>0&&<div style={{marginLeft:"auto",display:"flex",gap:6}}>
                    <span style={{fontSize:10,color:C.gold,fontWeight:700}}>{Math.round((tot as any).kcal)} kcal</span>
                    <span style={{fontSize:10,color:"#f87171"}}>P:{Math.round((tot as any).prot)}g</span>
                    <span style={{fontSize:10,color:"#fb923c"}}>C:{Math.round((tot as any).carbs)}g</span>
                    <span style={{fontSize:10,color:C.purple}}>F:{Math.round((tot as any).fat)}g</span>
                  </div>}
                </div>
                <div style={{padding:"8px 10px"}}>
                  {Object.entries(dayData).map(([mt,items]:any)=>{
                    if(!items||!items.length)return null;
                    const mtKcal=items.reduce((a:any,f:any)=>a+(f.kcalActual||0),0);
                    return(<div key={mt} style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.green,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                        <span>{mt}</span>
                        {mtKcal>0&&<span style={{color:C.muted,fontWeight:500}}>{Math.round(mtKcal)} kcal</span>}
                      </div>
                      {items.map((f:any,i:number)=>{
                        const fImg=(f.imgs||[]).filter(Boolean)[0];
                        return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,background:C.faint,borderRadius:7,padding:"6px 9px",marginBottom:3}}>
                          {fImg?<img src={fImg} alt={f.name} style={{width:34,height:34,borderRadius:7,objectFit:"cover",flexShrink:0}}/>:<div style={{width:34,height:34,background:C.border,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🍽️</div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
                            <div style={{fontSize:10,color:C.muted}}>{f.grams}g</div>
                          </div>
                          <div style={{display:"flex",gap:5,flexShrink:0}}>
                            <span style={{fontSize:10,color:C.gold,fontWeight:600}}>{f.kcalActual}kcal</span>
                            <span style={{fontSize:10,color:"#f87171"}}>P:{f.protActual}g</span>
                          </div>
                        </div>);
                      })}
                    </div>);
                  })}
                </div>
              </div>);
            })}
          </>}
        </div>

        {/* ── SESSION NOTES ── */}
        {view&&<SessionNotesPanel clientId={view.id} clientName={view.name}/>}

        {/* ── BEFORE/AFTER PHOTOS ── */}
        {view&&<BeforeAfterPanel clientId={view.id}/>}

      </div></div>)}

      {/* Progress modal */}
      {progFormOpen&&(<div style={{...css.overlay,zIndex:300}}><div style={css.modal(440)}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.gold}}>📈 Pridėti pažangos įrašą</div>
          <button onClick={()=>setProgFormOpen(false)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
          <div><span style={css.label}>Data</span><input type="date" value={progForm.date} onChange={e=>setProgForm(p=>({...p,date:e.target.value}))} style={css.input}/></div>
          <div><span style={css.label}>⚖️ Svoris (kg)</span><input type="number" value={progForm.weight} onChange={e=>setProgForm(p=>({...p,weight:e.target.value}))} style={css.input} placeholder="82.5"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><span style={css.label}>Krūtinė (cm)</span><input type="number" value={progForm.chest} onChange={e=>setProgForm(p=>({...p,chest:e.target.value}))} style={css.input} placeholder="cm"/></div>
            <div><span style={css.label}>Juosmuo (cm)</span><input type="number" value={progForm.waist} onChange={e=>setProgForm(p=>({...p,waist:e.target.value}))} style={css.input} placeholder="cm"/></div>
            <div><span style={css.label}>Klubai (cm)</span><input type="number" value={progForm.hips} onChange={e=>setProgForm(p=>({...p,hips:e.target.value}))} style={css.input} placeholder="cm"/></div>
          </div>
          <div><span style={css.label}>Pastabos</span><textarea value={progForm.notes} onChange={e=>setProgForm(p=>({...p,notes:e.target.value}))} rows={2} style={{...css.input,resize:"none"}} placeholder="Pastabos..."/></div>
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setProgFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={saveProgress} disabled={saving} style={{...css.btnG,opacity:progForm.weight?1:0.4}}>{saving?"⏳":"💾 Išsaugoti"}</button>
        </div>
      </div></div>)}

      {/* Client form — 4 steps */}
      {clientFormOpen&&(<div style={css.overlay}><div style={{...css.modal(920),maxHeight:"95vh"}}>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontWeight:700,fontSize:14,color:C.gold}}>{editClientId?"✏️ Redaguoti klientą":"➕ Naujas klientas"}</div>
          {!editClientId&&clients.length>0&&<button onClick={()=>setTemplateModal(true)} style={{...css.btnGhost,fontSize:11,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}><span>📋</span>Kopijuoti programą</button>}
          <div className="step-nav" style={{marginLeft:"auto"}}>
            {(planType==="both"?[["1","Info"],["2","Treniruotės"],["3","Mityba"],["4","Peržiūra"]]:planType==="training"?[["1","Info"],["2","Treniruotės"],["3","Peržiūra"]]:[["1","Info"],["2","Mityba"],["3","Peržiūra"]]).map(([n,l])=>(
              <button key={n} style={{...css.navBtn(step===+n),padding:"5px 11px",fontSize:11}} onClick={()=>setStep(+n)}><b>{n}.</b> {l}</button>
            ))}
            <button onClick={()=>setClientFormOpen(false)} style={{width:27,height:27,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:14,marginLeft:5}}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:18,flex:1}}>
          {/* Step 1 — Info */}
          {step===1&&(<div>
            {/* Plan type selector */}
            <div style={{marginBottom:18}}>
              <span style={css.label}>Kurti planą</span>
              <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
                {([["both","🏋️ + 🥗 Abu planus","Treniruočių ir mitybos planas",C.gold],["training","🏋️ Tik treniruotes","Tik treniruočių programa",C.teal],["meal","🥗 Tik mitybą","Tik mitybos planas",C.green]] as any[]).map(([val,icon,desc,col])=>(
                  <button key={val} onClick={()=>{setPlanType(val as any);setStep(1);}} style={{flex:1,minWidth:140,padding:"12px 14px",borderRadius:10,border:planType===val?`2px solid ${col}`:`1px solid ${C.border}`,background:planType===val?col+"18":"transparent",color:planType===val?col:C.muted,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:planType===val?700:500,textAlign:"left" as const,transition:"all .15s"}}>
                    <div style={{fontSize:16,marginBottom:4}}>{icon}</div>
                    <div style={{fontWeight:700,marginBottom:2,color:planType===val?col:C.text}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="cf-grid" style={{}}>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><span style={css.label}>Lytis</span><div style={{display:"flex",gap:8}}>{["Vyras","Moteris"].map(g=>(<button key={g} onClick={()=>setClientForm(p=>({...p,gender:g}))} style={{flex:1,padding:"8px",borderRadius:8,border:clientForm.gender===g?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:clientForm.gender===g?C.goldSoft:"transparent",color:clientForm.gender===g?C.gold:C.muted,fontFamily:FONT,fontSize:12,cursor:"pointer",fontWeight:600}}>{g==="Vyras"?"👨 Vyras":"👩 Moteris"}</button>))}</div></div>
              {[["Vardas ir pavardė *","name","text"],["Telefonas","phone","tel"],["Gimtadienis","birthday","date"],["Amžius","age","number"],["Svoris (kg)","weight","number"],["Ūgis (cm)","height","number"]].map(([lb,k,t])=>(<div key={k}><span style={css.label}>{lb}</span><input type={t} value={(clientForm as any)[k]} onChange={e=>setClientForm(p=>({...p,[k]:e.target.value}))} style={css.input} placeholder={lb as string}/></div>))}
              <div><span style={css.label}>Aktyvumo lygis</span><select value={clientForm.activity_index} onChange={e=>setClientForm(p=>({...p,activity_index:+e.target.value}))} style={css.select}>{ACTIVITY_LEVELS.map((a,i)=><option key={i} value={i}>{a.label}</option>)}</select></div>
              <div><span style={css.label}>Tikslas</span><select value={clientForm.goal} onChange={e=>setClientForm(p=>({...p,goal:e.target.value}))} style={css.select}><option value="">Pasirinkite</option>{GOALS.map(g=><option key={g}>{g}</option>)}</select></div>
              <div><span style={css.label}>Lygis</span><select value={clientForm.level} onChange={e=>setClientForm(p=>({...p,level:e.target.value}))} style={css.select}><option value="">Pasirinkite</option>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              <div><span style={css.label}>Pastabos</span><textarea value={clientForm.notes} onChange={e=>setClientForm(p=>({...p,notes:e.target.value}))} rows={3} style={{...css.input,resize:"none"}} placeholder="Sveikatos apribojimai..."/></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={css.card}>
                <span style={css.secTitle}>Treniruočių dienos</span>
                <div className="day-btns" style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {DAYS.map(d=>(<button key={d} onClick={()=>toggleDay(d)} style={{padding:"6px 12px",borderRadius:8,border:clientForm.training_days.includes(d)?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:clientForm.training_days.includes(d)?C.goldSoft:"transparent",color:clientForm.training_days.includes(d)?C.gold:C.muted,fontFamily:FONT,fontSize:11,cursor:"pointer",fontWeight:600}}>{d.slice(0,3)}</button>))}
                </div>
              </div>
              {bmiNum&&(<div style={css.card}>
                <span style={css.secTitle}>KMI ir kalorijų poreikis</span>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,background:C.faint,borderRadius:9,padding:"10px 12px"}}>
                  <div style={{fontSize:26,fontWeight:900,color:bmiCat(bmiNum).color}}>{bmiNum}</div>
                  <div style={{background:bmiCat(bmiNum).color+"22",border:`1px solid ${bmiCat(bmiNum).color}44`,borderRadius:6,padding:"3px 10px",color:bmiCat(bmiNum).color,fontWeight:700,fontSize:11}}>{bmiCat(bmiNum).label}</div>
                  {nut&&<div style={{marginLeft:"auto",background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:6,padding:"3px 10px",color:C.gold,fontWeight:700,fontSize:11}}>TDEE: {nut.tdee}</div>}
                </div>
                {nut&&(<>
                  <div style={{background:"#ef444410",border:`1px solid ${C.redBorder}`,borderRadius:9,padding:"9px 10px",marginBottom:7}}>
                    <div style={{fontSize:10,color:C.red,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",marginBottom:7}}>🔻 Riebalų deginimas — {nut.lose} kcal</div>
                    <div className="macro-grid" style={{}}>
                      {[["Baltymai","#f87171",`${nut.protLose}g`],["Angliavandeniai","#fb923c",`${nut.carbLose}g`],["Riebalai",C.purple,`${nut.fatLose}g`]].map(([l,col,v])=>(<div key={l as string} style={{background:C.surface,borderRadius:6,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.05em",marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:col as string}}>{v}</div></div>))}
                    </div>
                  </div>
                  <div style={{background:"#22c55e10",border:`1px solid ${C.greenBorder}`,borderRadius:9,padding:"9px 10px"}}>
                    <div style={{fontSize:10,color:C.green,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",marginBottom:7}}>🔺 Raumenų auginimas — {nut.gain} kcal</div>
                    <div className="macro-grid" style={{}}>
                      {[["Baltymai","#4ade80",`${nut.protGain}g`],["Angliavandeniai","#fb923c",`${nut.carbGain}g`],["Riebalai",C.purple,`${nut.fatGain}g`]].map(([l,col,v])=>(<div key={l as string} style={{background:C.surface,borderRadius:6,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.05em",marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:col as string}}>{v}</div></div>))}
                    </div>
                  </div>
                </>)}
              </div>)}
            </div>
            </div>
          </div>)}

          {/* Step 2 — Training (both/training) OR Meal (meal only) */}
          {step===2&&planType==="meal"&&(<div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap" as const}}>
              <div style={{flex:1}}><span style={css.label}>Mitybos plano pavadinimas</span><input value={mealPlanName} onChange={e=>setMealPlanName(e.target.value)} placeholder="pvz. Tomo mitybos planas" style={{...css.input,maxWidth:380}}/></div>
            </div>
            <MealPlanBuilder days={trainingDays.length>0?trainingDays:DAYS.slice(0,5)} mealPlan={mealPlan} setMealPlan={setMealPlan} foods={foods}/>
          </div>)}
          {step===2&&planType!=="meal"&&(<div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap" as const}}>
              <div style={{flex:1}}><span style={css.label}>Programos pavadinimas</span><input value={programName} onChange={e=>setProgramName(e.target.value)} placeholder="pvz. Tomo 3 dienų programa" style={{...css.input,maxWidth:380}}/></div>
              <ProgramTemplateButton exercises={exercises} onApply={(prog,name)=>{setProgram(prog);setProgramName(name);}}/>
            </div>
            {trainingDays.length===0?<div style={{...css.card,textAlign:"center",color:C.muted,padding:36}}>Grįžkite į 1 žingsnį ir pasirinkite treniruočių dienas.</div>:trainingDays.map(day=>(<div key={day} style={{...css.card,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:8}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.gold}}/>
                <span style={{fontWeight:700,letterSpacing:"0.08em",fontSize:11,textTransform:"uppercase" as const}}>{day}</span>
                <span style={{color:C.muted,fontSize:11}}>— {(program[day]||[]).length} prat.</span>
                <button onClick={()=>openPick(day)} style={{...css.btnTeal,marginLeft:"auto",fontSize:11}}>+ Pridėti</button>
              </div>
              {(program[day]||[]).length===0?<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"8px 0"}}>Pratimų nėra</div>:(
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {(program[day]||[]).map((ex:any,idx:number)=>(<div key={idx} style={{display:"flex",alignItems:"center",gap:8,background:C.faint,borderRadius:8,padding:"7px 10px"}}>
                    <div style={{width:34,height:34,borderRadius:6,overflow:"hidden",background:C.border,flexShrink:0}}>{(ex.imgs||[]).filter(Boolean)[0]?<img src={(ex.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>}</div>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{ex.name}</div><div style={{fontSize:10,color:C.teal}}>{ex.muscle} · {ex.customSets}s · {ex.customReps}r</div></div>
                    <button onClick={()=>removeFromDay(day,idx)} style={css.btnRed}>🗑️</button>
                  </div>))}
                </div>
              )}
            </div>))}
          </div>)}

          {/* Step 3 — Meal plan for "both" only */}
          {step===3&&planType==="both"&&(<div>
            <div style={{marginBottom:14}}><span style={css.label}>Mitybos plano pavadinimas</span><input value={mealPlanName} onChange={e=>setMealPlanName(e.target.value)} placeholder="pvz. Tomo mitybos planas" style={{...css.input,maxWidth:380}}/></div>
            <MealPlanBuilder days={trainingDays} mealPlan={mealPlan} setMealPlan={setMealPlan} foods={foods}/>
          </div>)}

          {/* Step 4 (both) / Step 3 (training/meal) — Preview */}
          {((step===4&&planType==="both")||(step===3&&planType!=="both"))&&(<div>
            <div style={{...css.card,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:C.bg,flexShrink:0}}>{(clientForm.name||"?")[0].toUpperCase()}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>{clientForm.name||"Klientas"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {clientForm.age&&<span style={{fontSize:11,color:C.muted}}>Amžius: <b style={{color:C.text}}>{clientForm.age} m.</b></span>}
                  {clientForm.weight&&<span style={{fontSize:11,color:C.muted}}>Svoris: <b style={{color:C.text}}>{clientForm.weight} kg</b></span>}
                  {bmiNum&&<span style={{fontSize:11,color:C.muted}}>KMI: <b style={{color:bmiCat(bmiNum).color}}>{bmiNum}</b></span>}
                  {clientForm.goal&&<Badge label={clientForm.goal} color={C.gold}/>}
                  {clientForm.level&&<Badge label={clientForm.level} color={C.teal}/>}
                </div>
              </div>
            </div>
            {programName&&<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>📋 {programName} — {trainingDays.length} dienų</div>}
            {trainingDays.map(day=>(<div key={day} style={{background:C.faint,borderRadius:8,padding:"8px 12px",marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase" as const,marginBottom:4}}>{day}</div>
              {(program[day]||[]).length===0?<div style={{fontSize:11,color:C.muted}}>Pratimų nėra</div>:(program[day]||[]).map((ex:any,i:number)=>(<div key={i} style={{fontSize:11,color:C.text,padding:"2px 0",borderBottom:`1px solid ${C.border}`}}>{i+1}. {ex.name} — {ex.customSets}s · {ex.customReps}r</div>))}
            </div>))}
            {mealPlanName&&<>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginTop:14,marginBottom:8}}>🥗 {mealPlanName}</div>
              {trainingDays.map(day=>(<div key={day} style={{background:C.faint,borderRadius:8,padding:"8px 12px",marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase" as const,marginBottom:4}}>{day}</div>
                {Object.entries(mealPlan[day]||{}).map(([mt,items]:any)=>items.length>0&&(<div key={mt} style={{fontSize:11,color:C.text,padding:"2px 0"}}><b style={{color:C.green}}>{mt}:</b> {items.map((f:any)=>f.name).join(", ")}</div>))}
              </div>))}
            </>}
          </div>)}
        </div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,justifyContent:"space-between"}}>
          {(()=>{
            const lastStep=planType==="both"?4:3;
            const isLast=step===lastStep;
            return(<>
              <div style={{display:"flex",gap:8}}>
                {step>1&&<button onClick={()=>setStep(s=>s-1)} style={css.btnGhost}>← Atgal</button>}
                {!isLast&&<button onClick={()=>setStep(s=>s+1)} style={css.btnG}>Tęsti →</button>}
              </div>
              {isLast&&<button onClick={saveClient} disabled={saving} style={css.btnG}>{saving?"⏳ Saugoma...":"💾 Išsaugoti klientą"}</button>}
            </>);
          })()}
        </div>
      </div></div>)}

      {/* Exercise picker */}
      {pickDay&&(<div style={{...css.overlay,zIndex:300}}><div style={css.modal(860)}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:13,color:C.gold}}>Pratimų pasirinkimas — {pickDay}</div>
          <button onClick={()=>setPickDay(null)} style={{marginLeft:"auto",width:26,height:26,background:C.faint,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
        </div>
        <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.faint}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input value={pickSearch} onChange={e=>setPickSearch(e.target.value)} placeholder="🔍 Ieškoti..." style={{...css.input,width:160}}/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={pickMuscle===m} onClick={()=>setPickMuscle(m)}/>)}
          </div>
        </div>
        <div style={{overflowY:"auto",padding:10,flex:1}}>
          <div className="pick-grid" style={{}}>
            {pickList.map(ex=>(<div key={ex.id} onClick={()=>setPickedEx(ex)} style={{background:C.faint,borderRadius:10,border:pickedEx?.id===ex.id?`2px solid ${C.gold}`:`1px solid ${C.border}`,cursor:"pointer",overflow:"hidden",position:"relative"}}>
              <ImgGallery imgs={ex.imgs} height={85}/>
              {pickedEx?.id===ex.id&&<div style={{position:"absolute",top:5,right:5,width:18,height:18,background:C.gold,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:C.bg,fontSize:10}}>✓</div>}
              <div style={{padding:"7px 9px"}}><div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:2}}>{ex.name}</div><div style={{fontSize:10,color:C.teal}}>{ex.muscle}</div></div>
            </div>))}
            {pickList.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:36}}>Pratimų nerasta</div>}
          </div>
        </div>
        {pickedEx&&(<div className="pick-row">
          <div style={{flex:1,minWidth:90}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{pickedEx.name}</div><div style={{fontSize:10,color:C.teal,marginTop:1}}>{pickedEx.muscle}</div></div>
          <div><span style={css.label}>Serijos</span><input value={pickSets} onChange={e=>setPickSets(e.target.value)} placeholder={pickedEx.sets} style={{...css.input,width:65,textAlign:"center",padding:"6px 5px"}}/></div>
          <div><span style={css.label}>Kartojimai</span><input value={pickReps} onChange={e=>setPickReps(e.target.value)} placeholder={pickedEx.reps} style={{...css.input,width:80,textAlign:"center",padding:"6px 5px"}}/></div>
          <div><span style={css.label}>Svoris (kg)</span><input value={pickWeight} onChange={e=>setPickWeight(e.target.value)} placeholder="60" style={{...css.input,width:80,textAlign:"center",padding:"6px 5px",color:C.teal}}/></div>
          <div><span style={css.label}>Poilsis</span><select value={pickRest} onChange={e=>setPickRest(e.target.value)} style={{...css.select,width:95,padding:"6px 5px",color:C.purple}}><option value="">—</option>{REST_OPTIONS.map(r=><option key={r}>{r}</option>)}</select></div>
          <div><span style={css.label}>Superset</span><button onClick={()=>setPickSets(ps=>ps==="SS"?"":((ps||"")+""))} style={{...css.btnGhost,padding:"6px 10px",fontSize:11,color:pickSets==="SS"?C.purple:C.muted,borderColor:pickSets==="SS"?C.purpleBorder:C.border,background:pickSets==="SS"?C.purpleSoft:"transparent"}}>SS {pickSets==="SS"?"✓":""}</button></div>
          <button onClick={addToDay} style={{...css.btnG,alignSelf:"flex-end"}}>Pridėti +</button>
        </div>)}
      </div></div>)}

      {/* Template copy modal (#15) */}
      {templateModal&&(<div style={css.overlay}><div style={{...css.modal(520)}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:14,color:C.gold}}>📋 Kopijuoti programą iš kliento</div>
          <button onClick={()=>setTemplateModal(false)} style={{marginLeft:"auto",width:27,height:27,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
        </div>
        <div style={{padding:14,maxHeight:400,overflowY:"auto" as const}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:12}}>Pasirinkite klientą kurio programą norite kopijuoti:</div>
          {clients.filter((c:any)=>(c.program&&Object.keys(c.program).length>0)||c.meal_plan_name).map((c:any)=>{
            const exCnt=Object.values(c.program||{}).reduce((s:any,d:any)=>s+d.length,0) as number;
            return(
              <div key={c.id} onClick={()=>copyFromTemplate(c)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:C.faint,border:`1px solid ${C.border}`,marginBottom:8,cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>(e.currentTarget.style.borderColor=C.goldBorder)} onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
                <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#9AABB8",marginTop:2,display:"flex",gap:8}}>
                    {c.program_name&&<span>📋 {c.program_name} ({exCnt} prat.)</span>}
                    {c.meal_plan_name&&<span style={{color:C.green}}>🥗 {c.meal_plan_name}</span>}
                  </div>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Kopijuoti →</span>
              </div>
            );
          })}
          {clients.filter((c:any)=>(c.program&&Object.keys(c.program).length>0)||c.meal_plan_name).length===0&&(
            <div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0",fontSize:13}}>Nėra klientų su programomis</div>
          )}
        </div>
      </div></div>)}

      {confirmDel&&(<div style={css.overlay}><div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.redBorder}`,padding:28,maxWidth:340,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>🗑️</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:C.text}}>Ištrinti klientą?</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:20}}>„{confirmDel.name}" ir visa pažangos istorija bus ištrinta.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={()=>delClient(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
        </div>
      </div></div>)}
    </div>
  );
}

// ── ADMIN STATISTICS TAB ─────────────────────────────────
function AdminStatsTab(){
  const [coaches,setCoaches]=useState<any[]>([]);
  const [allClients,setAllClients]=useState<any[]>([]);
  const [allBookings,setAllBookings]=useState<any[]>([]);
  const [exercises,setExercises]=useState<any[]>([]);
  const [foods,setFoods]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      sb.get("coaches","?order=created_at.asc"),
      sb.get("clients","?order=created_at.desc"),
      sb.get("bookings","?order=created_at.desc"),
      sb.get("exercises","?select=id"),
      sb.get("foods","?select=id").catch(()=>[] as any[]),
    ]).then(([c,cl,bk,ex,fd])=>{
      setCoaches(c); setAllClients(cl); setAllBookings(bk);
      setExercises(ex); setFoods(fd); setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  if(loading)return <Spinner/>;

  const totalRevenue = allClients.length * 149; // estimate per client
  const todayISO = new Date().toISOString().slice(0,10);
  const todayBookings = allBookings.filter(b=>b.date===todayISO);
  const pendingBookings = allBookings.filter(b=>b.status==="pending");
  const confirmedBookings = allBookings.filter(b=>b.status==="confirmed");

  const topStats = [
    {icon:"👥",label:"Visi treneriai",val:coaches.length,color:C.gold},
    {icon:"🏃",label:"Visi klientai",val:allClients.length,color:C.teal},
    {icon:"📅",label:"Viso rezervacijų",val:allBookings.length,color:C.green},
    {icon:"🏋️",label:"Pratimai bibliotekoje",val:exercises.length,color:C.purple},
    {icon:"🥗",label:"Maisto produktai",val:foods.length,color:C.green},
    {icon:"⏳",label:"Laukiančios rezervacijos",val:pendingBookings.length,color:C.red},
  ];

  return(
    <div className="fu">
      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:3,height:20,background:C.gold,borderRadius:2}}/>
          <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase"}}>Admin · Sistemos statistika</div>
        </div>
        <div style={{fontSize:28,fontWeight:800,color:C.text,letterSpacing:"-0.01em"}}>Platformos apžvalga</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>{new Date().toLocaleDateString("lt-LT",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>

      {/* Top stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:28}}>
        {topStats.map(s=>(
          <div key={s.label} className="stat-card" style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(ellipse at 100% 0%,${s.color}20 0%,transparent 70%)`}}/>
            <div style={{fontSize:26,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:32,fontWeight:900,color:s.color,lineHeight:1,marginBottom:5,fontFamily:"'Barlow',sans-serif"}}>{s.val}</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.1em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-coach breakdown */}
      <div style={{...css.card,marginBottom:20}}>
        <div className="section-header">
          <div className="gold-line"><span style={{fontSize:12,fontWeight:700,color:C.text,letterSpacing:"0.1em",textTransform:"uppercase"}}>Treneriai ir jų statistika</span></div>
        </div>
        <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
          {coaches.map(coach=>{
            const cClients = allClients.filter(c=>c.coach_id===coach.id);
            const cBookings = allBookings.filter(b=>b.coach_id===coach.id);
            const cPending = cBookings.filter(b=>b.status==="pending");
            const cConfirmed = cBookings.filter(b=>b.status==="confirmed");
            const cWithProgram = cClients.filter(c=>c.program && Object.keys(c.program||{}).length>0);
            const cWithMeal = cClients.filter(c=>c.meal_plan_name);
            const lastActive = cClients[0]?.created_at ? new Date(cClients[0].created_at).toLocaleDateString("lt-LT") : "—";

            return(
              <div key={coach.id} style={{background:C.faint,borderRadius:12,border:`1px solid ${C.border}`,padding:"16px 18px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" as const}}>
                {/* Avatar + name */}
                <div style={{display:"flex",alignItems:"center",gap:12,minWidth:160,flexShrink:0}}>
                  <div style={{width:40,height:40,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:C.bg,flexShrink:0}}>
                    {(coach.full_name||"?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{coach.full_name}</div>
                    <div style={{display:"flex",gap:5,marginTop:3}}>
                      <span style={{fontSize:9,background:coach.role==="admin"?C.goldSoft:"transparent",border:`1px solid ${coach.role==="admin"?C.goldBorder:C.border}`,borderRadius:10,padding:"1px 7px",color:coach.role==="admin"?C.gold:C.muted,fontWeight:700,textTransform:"uppercase" as const}}>
                        {coach.role==="admin"?"ADMIN":"COACH"}
                      </span>
                      <span style={{fontSize:9,background:coach.active?C.greenSoft:C.redSoft,border:`1px solid ${coach.active?C.greenBorder:C.redBorder}`,borderRadius:10,padding:"1px 7px",color:coach.active?C.green:C.red,fontWeight:700}}>
                        {coach.active?"AKTYVUS":"NEAKTYVUS"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,flex:1}}>
                  {[
                    {label:"Klientai",val:cClients.length,color:C.teal},
                    {label:"Rezervacijos",val:cBookings.length,color:C.gold},
                    {label:"Laukia",val:cPending.length,color:C.red},
                    {label:"Patvirtinta",val:cConfirmed.length,color:C.green},
                    {label:"Su programa",val:cWithProgram.length,color:C.purple},
                    {label:"Su mityba",val:cWithMeal.length,color:C.green},
                  ].map(stat=>(
                    <div key={stat.label} style={{textAlign:"center" as const}}>
                      <div style={{fontSize:20,fontWeight:800,color:stat.color,fontFamily:"'Barlow',sans-serif",lineHeight:1}}>{stat.val}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:3,letterSpacing:"0.06em"}}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Last activity */}
                <div style={{fontSize:10,color:C.muted,flexShrink:0,textAlign:"right" as const}}>
                  <div>Paskutinis klientas</div>
                  <div style={{color:C.text,fontWeight:600,marginTop:2}}>{lastActive}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today + pending bookings */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={css.card}>
          <div className="section-header">
            <div className="gold-line"><span style={{fontSize:12,fontWeight:700,color:C.text,letterSpacing:"0.1em",textTransform:"uppercase"}}>Šiandienos rezervacijos</span></div>
            <span style={{fontSize:12,color:C.gold,fontWeight:700}}>{todayBookings.length}</span>
          </div>
          {todayBookings.length===0
            ? <div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0",fontSize:13}}>Šiandien nėra rezervacijų</div>
            : <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
                {todayBookings.map((b:any)=>(
                  <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.gold,minWidth:46,fontFamily:"'Barlow',sans-serif"}}>{b.time}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{b.client_name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{b.client_phone||"—"}</div>
                    </div>
                    <span style={{fontSize:9,background:b.status==="confirmed"?C.greenSoft:C.goldSoft,border:`1px solid ${b.status==="confirmed"?C.greenBorder:C.goldBorder}`,borderRadius:8,padding:"2px 8px",color:b.status==="confirmed"?C.green:C.gold,fontWeight:700}}>
                      {b.status==="confirmed"?"✓ Patvirtinta":"⏳ Laukia"}
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>

        <div style={css.card}>
          <div className="section-header">
            <div className="gold-line"><span style={{fontSize:12,fontWeight:700,color:C.text,letterSpacing:"0.1em",textTransform:"uppercase"}}>Laukiančios patvirtinimo</span></div>
            <span style={{fontSize:12,color:C.red,fontWeight:700}}>{pendingBookings.length}</span>
          </div>
          {pendingBookings.length===0
            ? <div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0",fontSize:13}}>Viskas patvirtinta ✓</div>
            : <div style={{display:"flex",flexDirection:"column" as const,gap:8,maxHeight:300,overflowY:"auto" as const}}>
                {pendingBookings.slice(0,8).map((b:any)=>(
                  <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{textAlign:"center" as const,minWidth:36}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.gold,fontFamily:"'Barlow',sans-serif",lineHeight:1}}>{new Date(b.date+"T12:00").getDate()}</div>
                      <div style={{fontSize:8,color:C.muted,letterSpacing:"0.06em"}}>{new Date(b.date+"T12:00").toLocaleDateString("lt-LT",{month:"short"}).toUpperCase()}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{b.client_name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{b.time}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATION BELL (#16) ──────────────────────────────
function NotificationBell({upcomingBookings,clients}:any){
  const [open,setOpen]=useState(false);
  const todayISO=new Date().toISOString().slice(0,10);
  const todayBookings=upcomingBookings.filter((b:any)=>b.date===todayISO);
  const pendingBookings=upcomingBookings.filter((b:any)=>b.status==="pending");
  const total=todayBookings.length+pendingBookings.length;

  const notifs=[
    ...todayBookings.map((b:any)=>({type:"today",icon:"📅",title:`Sesija šiandien ${b.time}`,sub:b.client_name,color:C.gold})),
    ...pendingBookings.map((b:any)=>({type:"pending",icon:"⏳",title:`Laukia patvirtinimo`,sub:`${b.client_name} · ${b.date} ${b.time}`,color:C.teal})),
  ].slice(0,8);

  return(
    <div style={{position:"relative" as const}}>
      <button onClick={()=>setOpen(o=>!o)} style={{position:"relative" as const,width:34,height:34,background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",color:C.muted}}>
        🔔
        {total>0&&<div style={{position:"absolute" as const,top:-4,right:-4,width:16,height:16,background:C.red,borderRadius:"50%",fontSize:9,fontWeight:900,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.bg}`}}>{total}</div>}
      </button>
      {open&&(
        <div style={{position:"absolute" as const,top:40,right:0,width:290,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:"0 8px 40px rgba(0,0,0,0.5)",zIndex:300,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:700,color:C.text}}>🔔 Pranešimai</span>
            <span style={{fontSize:10,color:C.muted}}>{total} naujų</span>
          </div>
          {notifs.length===0
            ?<div style={{padding:"24px",textAlign:"center" as const,color:C.muted,fontSize:12}}>Pranešimų nėra ✓</div>
            :<div>{notifs.map((n,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 16px",borderTop:i>0?`1px solid ${C.border}`:"none",background:"transparent"}}>
                <div style={{fontSize:18,flexShrink:0}}>{n.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:n.color}}>{n.title}</div>
                  <div style={{fontSize:11,color:"#9AABB8",marginTop:2}}>{n.sub}</div>
                </div>
              </div>
            ))}</div>
          }
          <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setOpen(false)} style={{...css.btnGhost,width:"100%",fontSize:11,padding:"6px",textAlign:"center" as const}}>Uždaryti</button>
          </div>
        </div>
      )}
      {open&&<div style={{position:"fixed" as const,inset:0,zIndex:299}} onClick={()=>setOpen(false)}/>}
    </div>
  );
}

// ── REVENUE TRACKER (#11) ────────────────────────────────
function RevenueTab({clients}:any){
  const [payments,setPayments]=useState<any[]>(()=>{
    try{return JSON.parse(localStorage.getItem("dna_payments")||"[]");}catch{return [];}
  });
  const [form,setForm]=useState({clientId:"",amount:"",month:new Date().toISOString().slice(0,7),notes:"",paid:true});
  const [formOpen,setFormOpen]=useState(false);

  const save=(p:any[])=>{setPayments(p);localStorage.setItem("dna_payments",JSON.stringify(p));};
  const addPayment=()=>{
    if(!form.clientId||!form.amount)return;
    const client=clients.find((c:any)=>c.id===form.clientId);
    save([...payments,{id:Date.now(),clientName:client?.name||"",...form,amount:parseFloat(form.amount)}]);
    setForm({clientId:"",amount:"",month:new Date().toISOString().slice(0,7),notes:"",paid:true});
    setFormOpen(false);
  };
  const togglePaid=(id:number)=>save(payments.map(p=>p.id===id?{...p,paid:!p.paid}:p));
  const del=(id:number)=>save(payments.filter(p=>p.id!==id));

  const thisMonth=new Date().toISOString().slice(0,7);
  const thisMonthPay=payments.filter(p=>p.month===thisMonth);
  const totalMonth=thisMonthPay.reduce((s,p)=>s+(p.paid?p.amount:0),0);
  const unpaid=payments.filter(p=>!p.paid);
  const totalUnpaid=unpaid.reduce((s,p)=>s+p.amount,0);
  const totalAll=payments.filter(p=>p.paid).reduce((s,p)=>s+p.amount,0);

  // Group by month
  const byMonth=payments.reduce((acc:any,p:any)=>{acc[p.month]=(acc[p.month]||[]);acc[p.month].push(p);return acc;},{});
  const sortedMonths=Object.keys(byMonth).sort().reverse();

  return(
    <div className="fu">
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap" as const,gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{width:3,height:18,background:C.gold,borderRadius:2}}/>
            <span style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase" as const}}>Pajamų sekimas</span>
          </div>
          <div style={{fontSize:26,fontWeight:800,color:C.text}}>Finansai</div>
        </div>
        <button onClick={()=>setFormOpen(true)} style={css.btnG}>+ Pridėti mokėjimą</button>
      </div>

      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Šis mėnesis",val:`€${totalMonth.toFixed(0)}`,color:C.gold,icon:"📅"},
          {label:"Iš viso gauta",val:`€${totalAll.toFixed(0)}`,color:C.green,icon:"✅"},
          {label:"Nesumokėta",val:`€${totalUnpaid.toFixed(0)}`,color:C.red,icon:"⚠️"},
          {label:"Klientų",val:new Set(payments.map(p=>p.clientId)).size,color:C.teal,icon:"👥"},
        ].map(s=>(
          <div key={s.label} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 14px",position:"relative" as const,overflow:"hidden"}}>
            <div style={{position:"absolute" as const,top:0,right:0,width:60,height:60,background:`radial-gradient(circle at 100% 0%,${s.color}20,transparent 70%)`}}/>
            <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:4,textTransform:"uppercase" as const,letterSpacing:"0.1em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <RevenueChart payments={payments}/>

      {/* Unpaid alert */}
      {unpaid.length>0&&(
        <div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.red}}>{unpaid.length} nesumokėti mokėjimai — €{totalUnpaid.toFixed(0)}</div>
            <div style={{fontSize:11,color:"#9AABB8",marginTop:2}}>{unpaid.map((p:any)=>p.clientName).join(", ")}</div>
          </div>
        </div>
      )}

      {/* Payment history by month */}
      {sortedMonths.length===0
        ?<div style={{...css.card,textAlign:"center" as const,padding:"48px 32px"}}>
            <div style={{fontSize:40,marginBottom:12}}>💰</div>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>Mokėjimų istorija tuščia</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Pridėkite pirmą mokėjimą</div>
            <button onClick={()=>setFormOpen(true)} style={css.btnG}>+ Pridėti mokėjimą</button>
          </div>
        :sortedMonths.map(month=>{
          const monthPay=byMonth[month];
          const monthTotal=monthPay.filter((p:any)=>p.paid).reduce((s:any,p:any)=>s+p.amount,0);
          return(
            <div key={month} style={{...css.card,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
                <div style={{flex:1}}>
                  <span style={{fontSize:14,fontWeight:700,color:C.text}}>{new Date(month+"-01").toLocaleDateString("lt-LT",{month:"long",year:"numeric"})}</span>
                  <span style={{fontSize:12,color:C.muted,marginLeft:8}}>{monthPay.length} mokėjimų</span>
                </div>
                <span style={{fontSize:15,fontWeight:800,color:C.gold}}>€{monthTotal.toFixed(0)}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                {monthPay.map((p:any)=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:9,padding:"9px 12px"}}>
                    <div style={{width:30,height:30,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:C.bg,flexShrink:0}}>{(p.clientName||"?")[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{p.clientName}</div>
                      {p.notes&&<div style={{fontSize:10,color:C.muted}}>{p.notes}</div>}
                    </div>
                    <div style={{fontSize:14,fontWeight:800,color:p.paid?C.green:C.red}}>€{p.amount}</div>
                    <button onClick={()=>togglePaid(p.id)} style={{...p.paid?css.btnGreen:css.btnRed,padding:"4px 10px",fontSize:10,fontWeight:700}}>{p.paid?"✓ Sumokėta":"⏳ Nesumok."}</button>
                    <button onClick={()=>del(p.id)} style={{...css.btnGhost,padding:"4px 7px",fontSize:12,color:C.muted}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      }

      {/* Add payment modal */}
      {formOpen&&(<div style={css.overlay}><div style={{...css.modal(440)}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:14,color:C.gold}}>💰 Pridėti mokėjimą</div>
          <button onClick={()=>setFormOpen(false)} style={{marginLeft:"auto",width:27,height:27,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
        </div>
        <div style={{padding:"16px 18px",display:"flex",flexDirection:"column" as const,gap:12}}>
          <div><span style={css.label}>Klientas</span>
            <select value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))} style={css.select}>
              <option value="">— Pasirinkite klientą —</option>
              {clients.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="ex2-grid">
            <div><span style={css.label}>Suma (€)</span><input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="149" style={css.input}/></div>
            <div><span style={css.label}>Mėnuo</span><input type="month" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))} style={css.input}/></div>
          </div>
          <div><span style={css.label}>Pastabos</span><input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="pvz. Mėnesinis abonementas" style={css.input}/></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <input type="checkbox" id="paid" checked={form.paid} onChange={e=>setForm(p=>({...p,paid:e.target.checked}))} style={{width:16,height:16,accentColor:C.gold}}/>
            <label htmlFor="paid" style={{fontSize:13,color:C.text,cursor:"pointer"}}>Jau sumokėta</label>
          </div>
        </div>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={addPayment} style={{...css.btnG,opacity:form.clientId&&form.amount?1:0.4}}>💾 Išsaugoti</button>
        </div>
      </div></div>)}
    </div>
  );
}

// ── GLOBAL SEARCH MODAL (#10) ────────────────────────────
function GlobalSearchModal({clients,exercises,foods,onClose,onNav}:any){
  const [q,setQ]=useState("");
  const ref=useState<any>(null);

  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);

  const qL=q.toLowerCase();
  const matchC=q.length>1?clients.filter((c:any)=>c.name?.toLowerCase().includes(qL)||(c.goal||"").toLowerCase().includes(qL)).slice(0,4):[];
  const matchE=q.length>1?exercises.filter((e:any)=>e.name?.toLowerCase().includes(qL)||(e.muscle||"").toLowerCase().includes(qL)).slice(0,4):[];
  const matchF=q.length>1?foods.filter((f:any)=>f.name?.toLowerCase().includes(qL)||(f.category||"").toLowerCase().includes(qL)).slice(0,4):[];
  const total=matchC.length+matchE.length+matchF.length;

  return(
    <div style={css.overlay} onClick={onClose}>
      <div style={{...css.modal(580),maxHeight:"80vh"}} onClick={e=>e.stopPropagation()}>
        {/* Search input */}
        <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>🔍</span>
          <input
            autoFocus
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Ieškoti klientų, pratimų, maisto..."
            style={{...css.input,border:"none",background:"transparent",fontSize:15,flex:1,padding:0,outline:"none"}}
          />
          <kbd style={{fontSize:10,color:C.muted,background:C.faint,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px"}}>ESC</kbd>
        </div>
        <div style={{overflowY:"auto",padding:q.length>1?"10px 0":"20px"}}>
          {q.length<2&&(
            <div style={{textAlign:"center",color:C.muted,padding:"24px",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:8}}>⌨️</div>
              Rašykite bent 2 simbolius...
            </div>
          )}
          {q.length>1&&total===0&&(
            <div style={{textAlign:"center",color:C.muted,padding:"24px",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:8}}>🔍</div>
              Nerasta: <b style={{color:C.text}}>"{q}"</b>
            </div>
          )}
          {/* Clients */}
          {matchC.length>0&&<>
            <div style={{padding:"4px 18px 6px",fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700}}>👥 Klientai</div>
            {matchC.map((c:any)=>(
              <div key={c.id} onClick={()=>onNav("clients")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",cursor:"pointer",transition:"background .1s"}} onMouseEnter={e=>(e.currentTarget.style.background=C.faint)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div style={{width:34,height:34,background:`linear-gradient(135deg,${C.gold},#8B6520)`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{c.goal||"—"} · {c.weight&&c.weight+"kg"}</div>
                </div>
                <span style={{fontSize:11,color:C.muted}}>→</span>
              </div>
            ))}
          </>}
          {/* Exercises */}
          {matchE.length>0&&<>
            <div style={{padding:"10px 18px 6px",fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,borderTop:matchC.length>0?`1px solid ${C.border}`:"none",marginTop:matchC.length>0?4:0}}>🏋️ Pratimai</div>
            {matchE.map((e:any)=>(
              <div key={e.id} onClick={()=>onNav("exercises")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",cursor:"pointer"}} onMouseEnter={ev=>(ev.currentTarget.style.background=C.faint)} onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <div style={{width:34,height:34,background:C.tealSoft,border:`1px solid ${C.tealBorder}`,borderRadius:8,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {(e.imgs||[])[0]?<img src={e.imgs[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:16}}>🏋️</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{e.name}</div>
                  <div style={{fontSize:11,color:C.teal}}>{e.muscle} · {e.sets} ser.</div>
                </div>
                <span style={{fontSize:11,color:C.muted}}>→</span>
              </div>
            ))}
          </>}
          {/* Foods */}
          {matchF.length>0&&<>
            <div style={{padding:"10px 18px 6px",fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,borderTop:`1px solid ${C.border}`,marginTop:4}}>🥗 Maistas</div>
            {matchF.map((f:any)=>(
              <div key={f.id} onClick={()=>onNav("foods")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",cursor:"pointer"}} onMouseEnter={ev=>(ev.currentTarget.style.background=C.faint)} onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <div style={{width:34,height:34,background:C.greenSoft,border:`1px solid ${C.greenBorder}`,borderRadius:8,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {(f.imgs||[])[0]?<img src={f.imgs[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:16}}>🥗</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{f.name}</div>
                  <div style={{fontSize:11,color:C.green}}>{f.category} · {f.calories&&f.calories+" kcal"}</div>
                </div>
                <span style={{fontSize:11,color:C.muted}}>→</span>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
}

// ── QUICK ACTIONS FAB (#9) ────────────────────────────────
function QuickActionsFAB({onNav}:any){
  const [open,setOpen]=useState(false);
  const actions=[
    {icon:"👥",label:"Naujas klientas",tab:"clients",color:C.gold},
    {icon:"🏋️",label:"Naujas pratimas",tab:"exercises",color:C.teal},
    {icon:"🥗",label:"Naujas maistas",tab:"foods",color:C.green},
    {icon:"📅",label:"Kalendorius",tab:"calendar",color:C.purple},
  ];
  return(
    <div style={{position:"fixed",bottom:90,right:20,zIndex:190,display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:10}}>
      {/* Action items */}
      {open&&actions.map((a,i)=>(
        <div key={a.tab} onClick={()=>{setOpen(false);onNav(a.tab,true);}} style={{
          display:"flex",alignItems:"center",gap:10,
          background:C.surface,border:`1px solid ${C.border}`,
          borderRadius:12,padding:"8px 14px 8px 10px",
          cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          animation:"fadeUp .2s ease both",
          animationDelay:`${i*0.04}s`,
          whiteSpace:"nowrap" as const,
        }}>
          <div style={{width:28,height:28,background:a.color+"20",border:`1px solid ${a.color}40`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{a.icon}</div>
          <span style={{fontSize:12,fontWeight:600,color:C.text}}>{a.label}</span>
        </div>
      ))}
      {/* FAB button */}
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{
          width:48,height:48,borderRadius:"50%",
          background:open?C.surface:`linear-gradient(135deg,${C.gold},#8B6520)`,
          border:open?`1px solid ${C.border}`:"none",
          color:open?C.muted:"#0A0608",
          fontSize:open?20:22,cursor:"pointer",
          boxShadow:`0 4px 24px ${C.gold}44`,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all .2s",
          transform:open?"rotate(45deg)":"rotate(0deg)",
        }}
      >{open?"×":"+"}</button>
    </div>
  );
}

// ── AI ASSISTANT (#16 #17 #18) ───────────────────────────
function AIAssistantButton({clients,exercises}:any){
  const [open,setOpen]=useState(false);
  const [messages,setMessages]=useState<{role:"user"|"assistant",text:string}[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const messagesEndRef=useState<any>(null);

  const systemPrompt=`Tu esi DNA Trainer AI asistenas — sporto trenerio pagalbininkas. 
Kalbi lietuviškai. Esi draugiškas, profesionalus ir glaustas.
Duomenys apie trenerio klientus:
${JSON.stringify(clients.map((c:any)=>({vardas:c.name,tikslas:c.goal,svoris:c.weight,ukgis:c.height,amzius:c.age,treniruociu_dienos:c.training_days,programa:c.program_name,mityba:c.meal_plan_name})),null,1)}
Pratimų kiekis bibliotekoje: ${exercises.length}
Šiandienos data: ${new Date().toLocaleDateString("lt-LT")}

Gali:
- Atsakyti į klausimus apie klientus ("Kuris klientas labiausiai progresuoja?")
- Pasiūlyti treniruočių programas
- Padėti su mitybos planais  
- Analizuoti klientų duomenis
- Duoti sporto ir mitybos patarimus
Atsakyk trumpai ir konkrečiai (iki 150 žodžių).`;

  const send=async()=>{
    const t=input.trim();
    if(!t||loading)return;
    const newMessages=[...messages,{role:"user" as const,text:t}];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try{
      const resp=await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${SUPABASE_KEY}`},
        body:JSON.stringify({
          system:systemPrompt,
          max_tokens:1000,
          messages:newMessages.map(m=>({role:m.role,content:m.text})),
        }),
      });
      const data=await resp.json();
      const reply=data.content?.find((b:any)=>b.type==="text")?.text||"Atsiprašau, įvyko klaida.";
      setMessages(p=>[...p,{role:"assistant",text:reply}]);
    }catch(e){
      setMessages(p=>[...p,{role:"assistant",text:"Klaida prisijungiant prie AI. Patikrinkite interneto ryšį."}]);
    }finally{setLoading(false);}
  };

  // Quick prompts
  const quickPrompts=[
    "Kuris klientas labiausiai aktyvus?",
    "Pasiūlyk programą pradedančiajam",
    "Kiek klientų treniruojasi šiandien?",
    "Sukurk 7 dienų mitybos planą riebalų deginimui",
  ];

  if(!open)return(
    <button onClick={()=>setOpen(true)} style={{
      position:"fixed",bottom:150,right:20,zIndex:189,
      width:44,height:44,borderRadius:"50%",
      background:"linear-gradient(135deg,#7B6DB0,#4A3880)",
      border:"none",color:"#fff",fontSize:20,cursor:"pointer",
      boxShadow:"0 4px 20px #7B6DB060",
      display:"flex",alignItems:"center",justifyContent:"center",
    }} title="AI Asistenas">🤖</button>
  );

  return(
    <div style={{
      position:"fixed",bottom:90,right:20,zIndex:300,
      width:340,maxHeight:520,
      background:C.surface,border:`1px solid ${C.border}`,
      borderRadius:18,display:"flex",flexDirection:"column" as const,
      boxShadow:"0 20px 60px rgba(0,0,0,0.6)",overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,background:C.faint}}>
        <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#7B6DB0,#4A3880)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>DNA AI Asistenas</div>
          <div style={{fontSize:10,color:C.purple}}>Claude · Lietuvių kalba</div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto" as const,padding:"12px 14px",display:"flex",flexDirection:"column" as const,gap:10,minHeight:200,maxHeight:300}}>
        {messages.length===0&&(
          <div>
            <div style={{textAlign:"center" as const,color:C.muted,fontSize:12,marginBottom:12,paddingTop:8}}>
              Sveiki! Aš galiu atsakyti į klausimus apie jūsų klientus, pasiūlyti programas ir padėti su mityba.
            </div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
              {quickPrompts.map(qp=>(
                <button key={qp} onClick={()=>{setInput(qp);}} style={{...css.btnGhost,textAlign:"left" as const,padding:"7px 11px",fontSize:11,color:C.muted,whiteSpace:"normal" as const,lineHeight:1.4}}>{qp}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end" as const:"flex-start" as const}}>
            <div style={{
              maxWidth:"85%",padding:"9px 12px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",
              background:m.role==="user"?`linear-gradient(135deg,${C.gold},#8B6520)`:C.faint,
              border:m.role==="user"?"none":`1px solid ${C.border}`,
              fontSize:12,color:m.role==="user"?C.bg:C.text,lineHeight:1.6,
            }}>{m.text}</div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:4,padding:"8px 12px"}}>
            {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.purple,animation:"spin .8s linear infinite",animationDelay:`${i*0.15}s`}}/>)}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Klauskite apie klientus, programas..."
          style={{...css.input,flex:1,fontSize:12,padding:"8px 10px"}}
        />
        <button onClick={send} disabled={loading||!input.trim()} style={{...css.btnG,padding:"8px 12px",fontSize:12,opacity:loading||!input.trim()?0.5:1}}>↑</button>
      </div>
    </div>
  );
}

// ── SESSION NOTES (#1) ───────────────────────────────────
function SessionNotesPanel({clientId,clientName}:{clientId:string,clientName:string}){
  const [notes,setNotes]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [input,setInput]=useState("");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [saving,setSaving]=useState(false);

  // Load from Supabase
  useEffect(()=>{
    if(!clientId)return;
    setLoading(true);
    sb.get("session_notes",`?client_id=eq.${clientId}&order=date.desc,created_at.desc`)
      .then(data=>setNotes(data))
      .catch(()=>{
        // Fallback to localStorage if table doesn't exist yet
        try{
          const stored=JSON.parse(localStorage.getItem(`dna_notes_${clientId}`)||"[]");
          setNotes(stored);
        }catch{}
      })
      .finally(()=>setLoading(false));
  },[clientId]);

  const add=async()=>{
    if(!input.trim()||saving)return;
    setSaving(true);
    const newNote={client_id:clientId,date,text:input.trim(),coach_id:getCoachId()};
    try{
      const saved=await sb.insert("session_notes",newNote);
      setNotes(p=>[saved[0]||{...newNote,id:Date.now()},...p]);
      setInput("");
    }catch{
      // Fallback to localStorage
      const fallback={id:Date.now(),date,text:input.trim()};
      const updated=[fallback,...notes];
      setNotes(updated);
      try{localStorage.setItem(`dna_notes_${clientId}`,JSON.stringify(updated));}catch{}
      setInput("");
    }finally{setSaving(false);}
  };

  const del=async(note:any)=>{
    setNotes(p=>p.filter(n=>n.id!==note.id));
    try{
      if(typeof note.id==="string")await sb.delete("session_notes",note.id);
      else{
        // localStorage fallback
        const updated=notes.filter(n=>n.id!==note.id);
        try{localStorage.setItem(`dna_notes_${clientId}`,JSON.stringify(updated));}catch{}
      }
    }catch{}
  };

  return(
    <div style={{...css.card,marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:2,height:16,background:C.teal}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:"0.04em"}}>SESIJŲ UŽRAŠAI</span>
        <span style={{marginLeft:"auto",fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>{notes.length} užrašai · Išsaugomi nuolat</span>
      </div>
      {/* Add note form */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" as const}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...css.input,width:140,flexShrink:0}}/>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          placeholder={`Sesijos pastabos — ${clientName}...`}
          style={{...css.input,flex:1,minWidth:200}}/>
        <button onClick={add} disabled={saving||!input.trim()} style={{...css.btnTeal,padding:"10px 16px",flexShrink:0,opacity:saving||!input.trim()?0.5:1}}>
          {saving?"...":"+ Pridėti"}
        </button>
      </div>
      {/* Notes list */}
      {loading
        ?<div style={{textAlign:"center" as const,color:C.muted,padding:"16px 0",fontSize:12}}>Kraunama...</div>
        :notes.length===0
          ?<div style={{textAlign:"center" as const,color:C.muted,padding:"20px 0",fontSize:12}}>
              Sesijų užrašų dar nėra. Pridėkite po kiekvienos treniruotės.
            </div>
          :<div style={{display:"flex",flexDirection:"column" as const,gap:8,maxHeight:320,overflowY:"auto" as const}}>
            {notes.map(n=>(
              <div key={n.id} style={{background:C.faint,border:`1px solid ${C.border}`,padding:"10px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:C.gold,letterSpacing:"0.04em",flexShrink:0,marginTop:2,minWidth:80}}>
                  {new Date((n.date||"")+"T12:00").toLocaleDateString("lt-LT",{month:"short",day:"numeric",year:"numeric"})}
                </div>
                <div style={{flex:1,fontSize:12,color:C.text,lineHeight:1.6}}>{n.text}</div>
                <button onClick={()=>del(n)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,flexShrink:0,padding:0}}>×</button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ── BEFORE/AFTER PHOTOS (#5) ─────────────────────────────
function BeforeAfterPanel({clientId}:{clientId:string}){
  const storageKey=`dna_photos_${clientId}`;
  const [photos,setPhotos]=useState<{id:number,date:string,url:string,label:string}[]>(()=>{
    try{return JSON.parse(localStorage.getItem(storageKey)||"[]");}catch{return [];}
  });
  const [label,setLabel]=useState("Prieš");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const fileRef=useState<any>(null);

  const save=(p:any[])=>{setPhotos(p);localStorage.setItem(storageKey,JSON.stringify(p));};
  const addFile=(e:any)=>{
    Array.from(e.target.files).forEach((f:any)=>{
      const r=new FileReader();
      r.onload=ev=>save([...photos,{id:Date.now(),date,url:(ev.target as any).result,label}]);
      r.readAsDataURL(f);
    });
    e.target.value="";
  };
  const del=(id:number)=>save(photos.filter(p=>p.id!==id));

  return(
    <div style={{...css.card,marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:2,height:16,background:C.purple}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:"0.04em"}}>PRIEŠ / PO NUOTRAUKOS</span>
      </div>
      {/* Upload controls */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" as const,alignItems:"flex-end"}}>
        <div><span style={css.label}>Data</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...css.input,width:140}}/></div>
        <div><span style={css.label}>Tipas</span>
          <select value={label} onChange={e=>setLabel(e.target.value)} style={{...css.select,width:120}}>
            {["Prieš","Po","Priekis","Šonas","Nugara","Progresas"].map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
        <label style={{...css.btnG,cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:"10px 16px"}}>
          📷 Įkelti nuotrauką
          <input type="file" accept="image/*" onChange={addFile} style={{display:"none"}}/>
        </label>
      </div>
      {/* Photo grid */}
      {photos.length===0
        ?<div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0",fontSize:12}}>
            <div style={{fontSize:32,marginBottom:8}}>📸</div>
            Nuotraukų dar nėra. Pridėkite pirmą progreso nuotrauką.
          </div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
            {photos.map(p=>(
              <div key={p.id} style={{position:"relative" as const,background:C.faint,border:`1px solid ${C.border}`}}>
                <img src={p.url} alt={p.label} style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}}/>
                <div style={{padding:"6px 8px",borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:C.gold,letterSpacing:"0.08em"}}>{p.label}</div>
                  <div style={{fontSize:10,color:C.muted}}>{new Date(p.date+"T12:00").toLocaleDateString("lt-LT")}</div>
                </div>
                <button onClick={()=>del(p.id)} style={{position:"absolute" as const,top:4,right:4,width:20,height:20,background:"rgba(0,0,0,0.7)",border:"none",color:"white",fontSize:11,cursor:"pointer"}}>×</button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ── PROGRAM TEMPLATES LIBRARY (#6) ───────────────────────
function ProgramTemplateButton({exercises,onApply}:{exercises:any[],onApply:(prog:any,name:string)=>void}){
  const [open,setOpen]=useState(false);
  const TEMPLATES=[
    {
      name:"Pilno kūno 3 dienų (PPL)",
      days:["Pirmadienis","Trečiadienis","Penktadienis"],
      desc:"Push/Pull/Legs split — klasikinis hipertrofijos planas",
      color:C.gold,
    },
    {
      name:"Jėgos 4 dienų programa",
      days:["Pirmadienis","Antradienis","Ketvirtadienis","Penktadienis"],
      desc:"Upper/Lower split — jėgos ir masės ugdymas",
      color:C.teal,
    },
    {
      name:"Pradedantiesiems 3 dienų",
      days:["Pirmadienis","Trečiadienis","Šeštadienis"],
      desc:"Pilno kūno treniruotės — pradedantiesiems",
      color:C.green,
    },
    {
      name:"Intensyvus 5 dienų",
      days:["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis"],
      desc:"5 dienų split — pažengusiems sportininkams",
      color:C.purple,
    },
  ];

  const applyTemplate=(t:typeof TEMPLATES[0])=>{
    // Build empty program with correct days
    const prog:any={};
    t.days.forEach(d=>{prog[d]=[];});
    onApply(prog,t.name);
    setOpen(false);
  };

  return(
    <>
      <button onClick={()=>setOpen(true)} style={{...css.btnGhost,fontSize:11,display:"flex",alignItems:"center",gap:6}}>
        📋 Šablonai
      </button>
      {open&&(
        <div style={css.overlay}>
          <div style={{...css.modal(500)}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.gold,letterSpacing:"0.04em"}}>PROGRAMŲ ŠABLONAI</span>
              <button onClick={()=>setOpen(false)} style={{marginLeft:"auto",width:27,height:27,background:C.faint,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
            </div>
            <div style={{padding:16,display:"flex",flexDirection:"column" as const,gap:10,maxHeight:400,overflowY:"auto" as const}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Pasirinkite šabloną — dienų struktūra bus pritaikyta automatiškai. Pratimus pridėsite patys.</div>
              {TEMPLATES.map((t,i)=>(
                <div key={i} onClick={()=>applyTemplate(t)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:C.faint,border:`1px solid ${C.border}`,cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.color+"60")} onMouseLeave={e=>(e.currentTarget.style.borderColor=C.border)}>
                  <div style={{width:4,height:44,background:t.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,color:C.text,letterSpacing:"0.04em"}}>{t.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:3}}>{t.desc}</div>
                    <div style={{fontSize:10,color:t.color,marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em"}}>{t.days.join(" · ")}</div>
                  </div>
                  <span style={{fontSize:18,color:t.color}}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── REVENUE CHART (#17) ──────────────────────────────────
function RevenueChart({payments}:{payments:any[]}){
  if(!payments.length)return null;
  // Last 6 months
  const months:string[]=[];
  for(let i=5;i>=0;i--){
    const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);
    months.push(d.toISOString().slice(0,7));
  }
  const data=months.map(m=>({
    month:m,
    total:payments.filter(p=>p.month===m&&p.paid).reduce((s:number,p:any)=>s+p.amount,0),
    label:new Date(m+"-01").toLocaleDateString("lt-LT",{month:"short"}),
  }));
  const maxVal=Math.max(...data.map(d=>d.total),1);
  const chartH=120;

  return(
    <div style={{...css.card,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:2,height:16,background:C.gold}}/>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:"0.04em"}}>MĖNESIO PAJAMOS</span>
        <span style={{marginLeft:"auto",fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:C.muted,letterSpacing:"0.1em"}}>PASKUTINIAI 6 MĖNESIAI</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",gap:6,height:chartH,paddingBottom:0}}>
        {data.map((d,i)=>{
          const barH=maxVal>0?Math.max(4,(d.total/maxVal)*chartH):4;
          const isCurrentMonth=d.month===new Date().toISOString().slice(0,7);
          return(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column" as const,alignItems:"center",gap:0,height:"100%",justifyContent:"flex-end"}}>
              {d.total>0&&<div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:isCurrentMonth?C.gold:C.muted,marginBottom:3,letterSpacing:"0.04em"}}>€{d.total}</div>}
              <div style={{
                width:"100%",
                height:barH,
                background:isCurrentMonth?`linear-gradient(to top,${C.gold},${C.gold}80)`:`linear-gradient(to top,${C.border},${C.surface2})`,
                transition:"height .4s ease",
                position:"relative" as const,
              }}/>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:isCurrentMonth?C.gold:C.muted,letterSpacing:"0.1em",textTransform:"uppercase" as const,marginTop:6}}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── BIRTHDAY + INACTIVITY DASHBOARD WIDGETS (#4 #8) ──────
function BirthdayAlerts({clients}:{clients:any[]}){
  const today=new Date();
  const alerts=clients.filter(c=>{
    if(!c.birthday)return false;
    const bday=new Date(c.birthday);
    const next=new Date(today.getFullYear(),bday.getMonth(),bday.getDate());
    if(next<today)next.setFullYear(today.getFullYear()+1);
    const diff=Math.ceil((next.getTime()-today.getTime())/(1000*60*60*24));
    return diff<=7;
  }).map(c=>{
    const bday=new Date(c.birthday);
    const next=new Date(today.getFullYear(),bday.getMonth(),bday.getDate());
    if(next<today)next.setFullYear(today.getFullYear()+1);
    const diff=Math.ceil((next.getTime()-today.getTime())/(1000*60*60*24));
    const age=today.getFullYear()-bday.getFullYear()+(next.getFullYear()>today.getFullYear()?0:0);
    return{...c,daysUntil:diff,turnsAge:age};
  }).sort((a,b)=>a.daysUntil-b.daysUntil);

  if(!alerts.length)return null;
  return(
    <div style={{background:C.surface,border:`1px solid ${C.goldBorder}`,padding:"14px 16px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:18}}>🎂</span>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:C.gold,letterSpacing:"0.14em",textTransform:"uppercase" as const}}>Artėjantys gimtadieniai</span>
      </div>
      {alerts.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
          <div style={{width:28,height:28,background:`linear-gradient(135deg,${C.gold},#8B6520)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0]}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.daysUntil===0?"Šiandien! 🎉":c.daysUntil===1?"Rytoj":` Už ${c.daysUntil} dienų`}</div>
          </div>
          {c.phone&&<a href={`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Sveiki ${c.name}! 🎂 Sveikiname su gimtadieniu! Linkime sveikatos ir sėkmės! 💪`)}`} target="_blank" rel="noopener noreferrer" style={{...css.btnGreen,padding:"4px 10px",fontSize:10,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>💬 Sveikinti</a>}
        </div>
      ))}
    </div>
  );
}

function InactivityAlerts({clients,bookings}:{clients:any[],bookings:any[]}){
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-14);
  const cutoffStr=cutoff.toISOString().slice(0,10);

  const inactive=clients.filter(c=>{
    const lastBooking=bookings.filter(b=>b.coach_id===c.coach_id||true).filter(b=>b.client_name===c.name&&b.status==="confirmed").sort((a:any,b:any)=>b.date.localeCompare(a.date))[0];
    return!lastBooking||lastBooking.date<cutoffStr;
  }).slice(0,4);

  if(!inactive.length)return null;
  return(
    <div style={{background:C.surface,border:`1px solid ${C.redBorder}`,padding:"14px 16px",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:18}}>⚠️</span>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:C.red,letterSpacing:"0.14em",textTransform:"uppercase" as const}}>Neaktyvūs klientai (14+ dienų)</span>
      </div>
      {inactive.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
          <div style={{width:28,height:28,background:C.redSoft,border:`1px solid ${C.redBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.red,flexShrink:0}}>{(c.name||"?")[0]}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.name}</div>
            <div style={{fontSize:10,color:C.muted}}>{c.goal||"—"}</div>
          </div>
          {c.phone&&<a href={`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Sveiki ${c.name}! Kaip sekasi? Ar galėtume suplanuoti kitą treniruotę? 💪`)}`} target="_blank" rel="noopener noreferrer" style={{...css.btnRed,padding:"4px 10px",fontSize:10,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>💬 Susisiekti</a>}
        </div>
      ))}
    </div>
  );
}

// ── MACRO CALCULATOR TAB ─────────────────────────────────
function MacroCalculatorTab({clients,foods}:{clients:any[],foods:any[]}){
  const [clientId,setClientId]=useState("");
  const [weight,setWeight]=useState("");
  const [height,setHeight]=useState("");
  const [age,setAge]=useState("");
  const [gender,setGender]=useState("Vyras");
  const [actIdx,setActIdx]=useState(2);
  const [meals,setMeals]=useState(4);
  const [activeTab,setActiveTab]=useState<"calc"|"log">("calc");
  // Food log
  const [log,setLog]=useState<any[]>([]);
  const [foodSearch,setFoodSearch]=useState("");
  const [selectedFood,setSelectedFood]=useState<any>(null);
  const [foodWeight,setFoodWeight]=useState("100");

  const handleClientSelect=(id:string)=>{
    setClientId(id);
    const c=clients.find(x=>x.id===id);
    if(c){setWeight(c.weight||"");setHeight(c.height||"");setAge(c.age||"");setGender(c.gender||"Vyras");setActIdx(c.activity_index??2);}
  };

  const nut=calcNut(weight,height,age,gender,ACTIVITY_LEVELS[actIdx]?.factor||1.55);

  // 3 goal profiles with full macro breakdown
  const profiles=nut?[
    {
      id:"lose",
      icon:"🔻",
      name:"Riebalų deginimas",
      nameEn:"FAT LOSS",
      desc:"Kalorinis deficitas. Aukšti baltymai išsaugo raumenis.",
      color:"#E07B5A",
      shadow:"#8B3A10",
      kcal:nut.lose,
      prot:Math.round(parseFloat(weight||"0")*2.4),
      fat:Math.round(nut.lose*0.25/9),
      carbs:0,
      rules:[
        "Kalorinis deficitas: -500 kcal/dieną",
        "Baltymai: 2.4g/kg — raumenis išsaugo",
        "Riebalai: 25% kalorijų — hormonams",
        "Angliavandeniai: likusi dalis",
        "Vanduo: min. 2.5l/dieną",
        "Treniruotės: 3-4x per savaitę",
      ],
      foods:["Vištienos krūtinėlė","Žuvis","Kiaušiniai","Brokoliai","Špinatai","Graikų jogurtas"],
    },
    {
      id:"maintain",
      icon:"⚖️",
      name:"Formos palaikymas",
      nameEn:"MAINTENANCE",
      desc:"Balansas. Kūno sudėties gerinimas.",
      color:"#D4A853",
      shadow:"#7A5A10",
      kcal:nut.tdee,
      prot:Math.round(parseFloat(weight||"0")*2.0),
      fat:Math.round(nut.tdee*0.28/9),
      carbs:0,
      rules:[
        "Kalorijos = TDEE (nei deficitas, nei perteklius)",
        "Baltymai: 2.0g/kg — kūno sudėties gerinimui",
        "Riebalai: 28% kalorijų",
        "Angliavandeniai: energijai treniruotėms",
        "Vanduo: min. 2.0l/dieną",
        "Treniruotės: 3-5x per savaitę",
      ],
      foods:["Lašiša","Ryžiai","Avokadas","Quinoa","Pienas","Riešutai"],
    },
    {
      id:"gain",
      icon:"🔺",
      name:"Raumenų auginimas",
      nameEn:"MUSCLE GAIN",
      desc:"Kalorinis perteklius. Daug baltymų raumenims augti.",
      color:"#4E9068",
      shadow:"#1A4028",
      kcal:nut.gain,
      prot:Math.round(parseFloat(weight||"0")*2.2),
      fat:Math.round(nut.gain*0.25/9),
      carbs:0,
      rules:[
        "Kalorinis perteklius: +300 kcal/dieną",
        "Baltymai: 2.2g/kg — raumenų sintezei",
        "Riebalai: 25% kalorijų",
        "Angliavandeniai: daugiausiai — energijai",
        "Vanduo: min. 3.0l/dieną",
        "Treniruotės: 4-5x per savaitę, jėga",
      ],
      foods:["Jautiena","Makaronai","Ryžiai","Bananai","Avižos","Sūris"],
    },
  ].map(p=>{
    const protKcal=p.prot*4;
    const fatKcal=p.fat*9;
    const carbsKcal=Math.max(0,p.kcal-protKcal-fatKcal);
    return{...p,carbs:Math.round(carbsKcal/4)};
  }):[];

  // Food log
  const logTotals=log.reduce((a,f)=>({kcal:a.kcal+f.kcal,prot:a.prot+f.prot,fat:a.fat+f.fat,carbs:a.carbs+f.carbs}),{kcal:0,prot:0,fat:0,carbs:0});
  const filteredFoods=foods.filter(f=>f.name?.toLowerCase().includes(foodSearch.toLowerCase())).slice(0,8);

  const addFood=()=>{
    if(!selectedFood||!foodWeight)return;
    const w=parseFloat(foodWeight)/100;
    setLog(p=>[...p,{id:Date.now(),name:selectedFood.name,weight:parseFloat(foodWeight),
      kcal:Math.round((selectedFood.kcal_per_100g||0)*w),
      prot:Math.round((selectedFood.protein_per_100g||0)*w*10)/10,
      fat:Math.round((selectedFood.fat_per_100g||0)*w*10)/10,
      carbs:Math.round((selectedFood.carbs_per_100g||0)*w*10)/10,
    }]);
    setSelectedFood(null);setFoodSearch("");setFoodWeight("100");
  };

  // Bar component
  const Bar=({val,max,color}:{val:number,max:number,color:string})=>{
    const pct=max>0?Math.min(100,Math.round(val/max*100)):0;
    const over=val>max;
    return(
      <div style={{height:6,background:C.faint,borderRadius:3,overflow:"hidden",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.3)"}}>
        <div style={{height:"100%",width:`${pct}%`,background:over?"#C05050":color,borderRadius:3,transition:"width .4s ease"}}/>
      </div>
    );
  };

  // Donut SVG
  const Donut=({prot,fat,carbs,kcal,size=100}:{prot:number,fat:number,carbs:number,kcal:number,size?:number})=>{
    const total=prot*4+fat*9+carbs*4||1;
    const r=38,cx=size/2,cy=size/2,sw=10,circ=2*Math.PI*r;
    const segs=[
      {val:Math.round(prot*4/total*100),color:"#4E9068"},
      {val:Math.round(fat*9/total*100),color:"#7B6DB0"},
      {val:Math.round(carbs*4/total*100),color:"#D4A853"},
    ];
    let off=0;
    return(
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.faint} strokeWidth={sw}/>
        {segs.map((s,i)=>{
          const dash=circ*s.val/100;
          const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-off*circ/100} strokeLinecap="butt"/>;
          off+=s.val; return el;
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fill={C.gold} fontSize="14" fontFamily="'Bebas Neue',sans-serif">{kcal}</text>
        <text x={cx} y={cy+9} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="'Barlow Condensed',sans-serif" letterSpacing="1.5">KCAL</text>
      </svg>
    );
  };

  return(
    <div className="fu">
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:10,color:C.gold,letterSpacing:"0.3em"}}>05</span>
          <div style={{width:24,height:1,background:C.gold}}/>
        </div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:C.text,letterSpacing:"0.04em",lineHeight:1}}>MAKRO SKAIČIUOKLĖ</div>
        <div style={{fontFamily:CONDENSED_FONT,fontSize:11,color:C.muted,marginTop:6,letterSpacing:"0.08em"}}>Kalorijų ir makroelementų rekomendacijos pagal klientų tikslus</div>
      </div>

      {/* Sub tabs */}
      <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${C.border}`}}>
        {[["calc","🧮 Skaičiuoklė & Rekomendacijos"],["log","📝 Maisto dienoraštis"]].map(([v,l])=>(
          <button key={v} onClick={()=>setActiveTab(v as any)} style={{padding:"9px 20px",background:"transparent",border:"none",borderBottom:activeTab===v?`2px solid ${C.gold}`:"2px solid transparent",color:activeTab===v?C.gold:C.muted,fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" as const,cursor:"pointer",marginBottom:-1}}>{l}</button>
        ))}
      </div>

      {/* ── CALCULATOR + RECOMMENDATIONS ── */}
      {activeTab==="calc"&&(
        <div>
          {/* Input row */}
          <div style={{...css.card,marginBottom:20}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.text,letterSpacing:"0.04em",marginBottom:16}}>KLIENTO DUOMENYS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,alignItems:"end"}}>
              <div>
                <span style={css.label}>Klientas (neprivaloma)</span>
                <select value={clientId} onChange={e=>handleClientSelect(e.target.value)} style={css.select}>
                  <option value="">— Rankiniu būdu —</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><span style={css.label}>Svoris (kg)</span><input value={weight} onChange={e=>setWeight(e.target.value)} style={css.input} placeholder="80" type="number"/></div>
              <div><span style={css.label}>Ūgis (cm)</span><input value={height} onChange={e=>setHeight(e.target.value)} style={css.input} placeholder="175" type="number"/></div>
              <div><span style={css.label}>Amžius</span><input value={age} onChange={e=>setAge(e.target.value)} style={css.input} placeholder="25" type="number"/></div>
              <div><span style={css.label}>Lytis</span>
                <select value={gender} onChange={e=>setGender(e.target.value)} style={css.select}>
                  <option>Vyras</option><option>Moteris</option>
                </select>
              </div>
              <div>
                <span style={css.label}>Aktyvumas</span>
                <select value={actIdx} onChange={e=>setActIdx(parseInt(e.target.value))} style={css.select}>
                  {ACTIVITY_LEVELS.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <span style={css.label}>Valgymai/dieną: {meals}</span>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                  {[2,3,4,5,6].map(n=>(
                    <button key={n} onClick={()=>setMeals(n)} style={{width:28,height:28,borderRadius:"6px",background:meals===n?"linear-gradient(145deg,#E8BE6A,#B8902A)":"linear-gradient(145deg,#1E2535,#141820)",color:meals===n?"#1A0E00":C.muted,border:"none",fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:meals===n?"0 3px 0 #7A5A10":"0 2px 0 #0A0E14"}}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TDEE summary if data entered */}
          {nut&&(
            <div style={{background:"linear-gradient(145deg,#0E1016,#0A0C12)",border:`1px solid ${C.goldBorder}`,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" as const,boxShadow:`0 4px 20px rgba(212,168,83,0.1)`}}>
              <div>
                <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase" as const,marginBottom:4}}>Bazinės kalorijos (TDEE)</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:48,color:C.gold,lineHeight:1,letterSpacing:"0.04em"}}>{nut.tdee} <span style={{fontSize:14,color:C.muted}}>kcal/d.</span></div>
              </div>
              <div style={{width:1,height:48,background:C.border}}/>
              {[
                {l:"KMI",v:calcBMI(weight,height)?parseFloat(calcBMI(weight,height)!.toFixed(1)):null,c:C.teal},
                {l:"BMR",v:Math.round(nut.tdee/(ACTIVITY_LEVELS[actIdx]?.factor||1.55)),c:C.text},
                {l:"Valgymui",v:Math.round(nut.tdee/meals)+" kcal",c:C.purple},
              ].map(x=>x.v&&(
                <div key={x.l}>
                  <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase" as const,marginBottom:4}}>{x.l}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:x.c,lineHeight:1}}>{x.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* 3 GOAL PROFILES */}
          {profiles.length>0?(
            <>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C.text,letterSpacing:"0.04em",marginBottom:16}}>3 TIKSLŲ REKOMENDACIJOS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                {profiles.map(p=>(
                  <div key={p.id} style={{background:"linear-gradient(145deg,#0E1016,#0A0C12)",border:`1px solid ${p.color}40`,overflow:"hidden",boxShadow:`0 4px 20px rgba(0,0,0,0.3)`}}>
                    {/* Profile header */}
                    <div style={{background:`linear-gradient(135deg,${p.color}25,${p.color}10)`,borderBottom:`1px solid ${p.color}30`,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:20}}>{p.icon}</span>
                        <div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:p.color,letterSpacing:"0.06em",lineHeight:1}}>{p.nameEn}</div>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>{p.name}</div>
                        </div>
                      </div>
                      <div style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:C.muted,fontWeight:300,lineHeight:1.5}}>{p.desc}</div>
                    </div>

                    <div style={{padding:"14px 16px"}}>
                      {/* Donut + main kcal */}
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                        <Donut prot={p.prot} fat={p.fat} carbs={p.carbs} kcal={p.kcal}/>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase" as const,marginBottom:3}}>Kalorijų tikslas</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:p.color,lineHeight:1}}>{p.kcal}</div>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted}}>kcal/dieną</div>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,marginTop:4}}>Vienam valgymui: <b style={{color:p.color}}>{Math.round(p.kcal/meals)} kcal</b></div>
                        </div>
                      </div>

                      {/* Macro pills */}
                      <div style={{display:"flex",flexDirection:"column" as const,gap:8,marginBottom:14}}>
                        {[
                          {l:"Baltymai",v:p.prot,g:"g",color:"#4E9068",kcal:p.prot*4,note:`${Math.round(p.prot/parseFloat(weight||"1")*10)/10}g/kg`},
                          {l:"Riebalai",v:p.fat,g:"g",color:"#7B6DB0",kcal:p.fat*9,note:`${Math.round(p.fat*9/p.kcal*100)}% kalorijų`},
                          {l:"Angliavandeniai",v:p.carbs,g:"g",color:"#D4A853",kcal:p.carbs*4,note:`${Math.round(p.carbs*4/p.kcal*100)}% kalorijų`},
                        ].map(m=>(
                          <div key={m.l}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase" as const}}>{m.l}</span>
                              <span style={{fontFamily:CONDENSED_FONT,fontSize:11,fontWeight:700,color:m.color}}>{m.v}g <span style={{fontSize:9,color:C.muted}}>· {m.kcal} kcal · {m.note}</span></span>
                            </div>
                            <div style={{height:5,background:C.faint,borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${Math.round(m.kcal/p.kcal*100)}%`,background:`linear-gradient(to right,${m.color},${m.color}99)`,borderRadius:3}}/>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Per meal breakdown */}
                      <div style={{background:C.faint,border:`1px solid ${C.border}`,padding:"10px 12px",marginBottom:12}}>
                        <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase" as const,marginBottom:8}}>Vienas valgymas ({meals} per dieną)</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,textAlign:"center" as const}}>
                          {[
                            {l:"Kcal",v:Math.round(p.kcal/meals),c:p.color},
                            {l:"B",v:Math.round(p.prot/meals*10)/10+"g",c:"#4E9068"},
                            {l:"R",v:Math.round(p.fat/meals*10)/10+"g",c:"#7B6DB0"},
                            {l:"A",v:Math.round(p.carbs/meals*10)/10+"g",c:"#D4A853"},
                          ].map(x=>(
                            <div key={x.l}>
                              <div style={{fontFamily:CONDENSED_FONT,fontSize:7,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase" as const}}>{x.l}</div>
                              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:x.c,lineHeight:1.2}}>{x.v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rules */}
                      <div>
                        <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase" as const,marginBottom:8}}>Rekomendacijos</div>
                        {p.rules.map((r,i)=>(
                          <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",padding:"3px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                            <div style={{width:4,height:4,borderRadius:"50%",background:p.color,flexShrink:0,marginTop:5}}/>
                            <span style={{fontFamily:"'Barlow',sans-serif",fontSize:10,color:C.muted,lineHeight:1.5}}>{r}</span>
                          </div>
                        ))}
                      </div>

                      {/* Recommended foods */}
                      <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                        <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase" as const,marginBottom:6}}>Rekomenduojami maisto produktai</div>
                        <div style={{display:"flex",flexWrap:"wrap" as const,gap:4}}>
                          {p.foods.map(f=>(
                            <span key={f} style={{background:`${p.color}15`,border:`1px solid ${p.color}40`,padding:"2px 8px",fontFamily:CONDENSED_FONT,fontSize:9,color:p.color,letterSpacing:"0.06em"}}>{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div style={{...css.card,marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.text,letterSpacing:"0.04em",marginBottom:16}}>TIKSLŲ PALYGINIMAS</div>
                <div style={{overflowX:"auto" as const}}>
                  <table style={{width:"100%",borderCollapse:"collapse" as const}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${C.border}`}}>
                        {["","🔻 Riebalų deginimas","⚖️ Formos palaikymas","🔺 Raumenų auginimas"].map((h,i)=>(
                          <th key={h} style={{padding:"8px 12px",fontFamily:CONDENSED_FONT,fontSize:9,color:i===0?C.muted:profiles[i-1]?.color,letterSpacing:"0.14em",textTransform:"uppercase" as const,textAlign:i===0?"left" as const:"center" as const,fontWeight:700}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {label:"Kalorijos",vals:profiles.map(p=>`${p.kcal} kcal`)},
                        {label:"Baltymai",vals:profiles.map(p=>`${p.prot}g`)},
                        {label:"Riebalai",vals:profiles.map(p=>`${p.fat}g`)},
                        {label:"Angliavandeniai",vals:profiles.map(p=>`${p.carbs}g`)},
                        {label:"Vienam valgymui",vals:profiles.map(p=>`${Math.round(p.kcal/meals)} kcal`)},
                        {label:"Baltymai/kg",vals:profiles.map(p=>`${Math.round(p.prot/parseFloat(weight||"1")*10)/10}g`)},
                      ].map((row,ri)=>(
                        <tr key={row.label} style={{background:ri%2===0?"transparent":C.faint,borderTop:`1px solid ${C.border}`}}>
                          <td style={{padding:"8px 12px",fontFamily:CONDENSED_FONT,fontSize:11,color:C.muted,letterSpacing:"0.06em"}}>{row.label}</td>
                          {row.vals.map((v,i)=>(
                            <td key={i} style={{padding:"8px 12px",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:profiles[i].color,textAlign:"center" as const,letterSpacing:"0.04em"}}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ):(
            <div style={{...css.card,textAlign:"center" as const,padding:"48px 24px"}}>
              <div style={{fontSize:52,marginBottom:12}}>🧮</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C.muted,letterSpacing:"0.04em",marginBottom:8}}>ĮVESKITE DUOMENIS</div>
              <div style={{fontFamily:CONDENSED_FONT,fontSize:13,color:C.muted,lineHeight:1.7}}>
                Pasirinkite klientą arba įveskite:<br/>
                <b style={{color:C.text}}>Svorį · Ūgį · Amžių · Aktyvumo lygį</b><br/>
                ir gausite 3 personalines rekomendacijas
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FOOD LOG TAB ── */}
      {activeTab==="log"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:16}}>
          {/* Add food */}
          <div>
            <div style={{...css.card,marginBottom:12}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.text,letterSpacing:"0.04em",marginBottom:14}}>PRIDĖTI MAISTĄ</div>
              <div style={{marginBottom:10}}>
                <span style={css.label}>Ieškoti maisto produkto</span>
                <input value={foodSearch} onChange={e=>{setFoodSearch(e.target.value);setSelectedFood(null);}} style={css.input} placeholder="pvz. Vištiena, ryžiai, kiaušinis..."/>
              </div>
              {foodSearch&&!selectedFood&&(
                <div style={{background:C.faint,border:`1px solid ${C.border}`,marginBottom:10,maxHeight:220,overflowY:"auto" as const}}>
                  {filteredFoods.length===0
                    ?<div style={{padding:"12px 16px",color:C.muted,fontSize:12,fontFamily:CONDENSED_FONT}}>Nerasta produktų</div>
                    :filteredFoods.map(f=>(
                      <div key={f.id} onClick={()=>{setSelectedFood(f);setFoodSearch(f.name);}} style={{padding:"9px 14px",borderTop:`1px solid ${C.border}`,cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>(e.currentTarget.style.background=C.goldSoft)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                        <div style={{fontFamily:CONDENSED_FONT,fontSize:12,fontWeight:600,color:C.text}}>{f.name}</div>
                        <div style={{fontSize:10,color:C.muted,marginTop:1,fontFamily:CONDENSED_FONT}}>
                          {f.kcal_per_100g||0} kcal · B:{f.protein_per_100g||0}g · R:{f.fat_per_100g||0}g · A:{f.carbs_per_100g||0}g
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
              {selectedFood&&(
                <>
                  <div style={{marginBottom:10}}>
                    <span style={css.label}>Kiekis gramais</span>
                    <input value={foodWeight} onChange={e=>setFoodWeight(e.target.value)} style={css.input} type="number" placeholder="100"/>
                  </div>
                  <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,padding:"10px 14px",marginBottom:12}}>
                    <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.gold,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:8}}>{foodWeight}g · {selectedFood.name}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,textAlign:"center" as const}}>
                      {[
                        {l:"Kcal",v:Math.round((selectedFood.kcal_per_100g||0)*parseFloat(foodWeight||"0")/100),c:C.gold},
                        {l:"Baltymai",v:Math.round((selectedFood.protein_per_100g||0)*parseFloat(foodWeight||"0")/100*10)/10+"g",c:"#4E9068"},
                        {l:"Riebalai",v:Math.round((selectedFood.fat_per_100g||0)*parseFloat(foodWeight||"0")/100*10)/10+"g",c:"#7B6DB0"},
                        {l:"Angliavandeniai",v:Math.round((selectedFood.carbs_per_100g||0)*parseFloat(foodWeight||"0")/100*10)/10+"g",c:"#D4A853"},
                      ].map(x=>(
                        <div key={x.l}>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase" as const}}>{x.l}</div>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:x.c,lineHeight:1.2}}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={addFood} style={{...css.btnG,width:"100%",display:"flex",justifyContent:"center",alignItems:"center",gap:6}}>+ Pridėti į dienoraštį</button>
                </>
              )}
            </div>
          </div>

          {/* Log */}
          <div>
            <div style={{...css.card,background:"linear-gradient(145deg,#0E1016,#0A0C12)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.text,letterSpacing:"0.04em"}}>DIENOS SUVESTINĖ</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:C.gold,letterSpacing:"0.04em"}}>{logTotals.kcal} <span style={{fontSize:12,color:C.muted}}>kcal</span></div>
              </div>
              {/* Macro totals */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                {[
                  {l:"Baltymai",v:logTotals.prot,c:"#4E9068"},
                  {l:"Riebalai",v:logTotals.fat,c:"#7B6DB0"},
                  {l:"Angliavandeniai",v:logTotals.carbs,c:"#D4A853"},
                ].map(m=>(
                  <div key={m.l} style={{background:C.faint,border:`1px solid ${C.border}`,padding:"10px",textAlign:"center" as const,borderTop:`3px solid ${m.c}`}}>
                    <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase" as const,marginBottom:4}}>{m.l}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:m.c,lineHeight:1}}>{m.v}g</div>
                  </div>
                ))}
              </div>
              {/* Food list */}
              <div style={{fontFamily:CONDENSED_FONT,fontSize:9,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase" as const,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>Suvalgytas maistas ({log.length})</span>
                {log.length>0&&<button onClick={()=>setLog([])} style={{...css.btnRed,padding:"3px 10px",fontSize:9}}>Išvalyti</button>}
              </div>
              {log.length===0
                ?<div style={{textAlign:"center" as const,color:C.muted,padding:"24px 0"}}>
                    <div style={{fontSize:32,marginBottom:8}}>🍽️</div>
                    <div style={{fontFamily:CONDENSED_FONT,fontSize:12,letterSpacing:"0.08em"}}>Dienoraštis tuščias. Pridėkite maisto produktų.</div>
                  </div>
                :<div style={{display:"flex",flexDirection:"column" as const,gap:1,background:C.border,maxHeight:300,overflowY:"auto" as const}}>
                    {log.map(f=>(
                      <div key={f.id} style={{background:C.surface,padding:"8px 12px",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:CONDENSED_FONT,fontSize:12,fontWeight:600,color:C.text}}>{f.name}</div>
                          <div style={{fontSize:10,color:C.muted,fontFamily:CONDENSED_FONT,marginTop:1}}>{f.weight}g · B:{f.prot}g · R:{f.fat}g · A:{f.carbs}g</div>
                        </div>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:C.gold,letterSpacing:"0.04em"}}>{f.kcal}</div>
                        <button onClick={()=>setLog(p=>p.filter(x=>x.id!==f.id))} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:0}}>×</button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
// MainApp: shown when logged in
function MainApp(){
  const {coach,isAdmin,logout} = useAuth();
  const [tab,setTab]=useState("dashboard");
  const [autoOpen,setAutoOpen]=useState(false);
  const [exercises,setExercises]=useState<any[]>([]);
  const [foods,setFoods]=useState<any[]>([]);
  const [globalSearch,setGlobalSearch]=useState(false);
  const [allClients,setAllClients]=useState<any[]>([]);
  const [allBookings,setAllBookings]=useState<any[]>([]);

  const handleLogout=()=>{logout();};

  useEffect(()=>{
    // Initialize native features (status bar, splash screen)
    initNative();
    sb.get("exercises","?order=name").then(d=>setExercises(d)).catch(()=>{});
    sb.get("foods","?order=name").then(d=>setFoods(d)).catch(()=>{});
    sb.get("clients",`?coach_id=eq.${getCoachId()}&order=name`).then(d=>setAllClients(d)).catch(()=>{});
    sb.get("bookings",`?coach_id=eq.${getCoachId()}&date=gte.${new Date().toISOString().slice(0,10)}&status=neq.cancelled&order=date.asc,time.asc&limit=20`).then(d=>setAllBookings(d)).catch(()=>{});
  },[]);

  const navigate=(t:string,open=false)=>{setTab(t);setAutoOpen(open);setTimeout(()=>setAutoOpen(false),100);};

  const NAV=[
    {id:"dashboard",icon:"🏠",label:"Pradžia"},
    {id:"clients",icon:"👥",label:"Klientai"},
    {id:"exercises",icon:"🏋️",label:"Pratimai"},
    {id:"foods",icon:"🥗",label:"Mityba"},
    {id:"macro",icon:"🧮",label:"Makro"},
    {id:"calendar",icon:"📅",label:"Kalendorius"},
    ...(isAdmin?[{id:"stats",icon:"📊",label:"Statistika"},{id:"revenue",icon:"💰",label:"Pajamos"},{id:"users",icon:"⚙️",label:"Vartotojai"}]:[]),
  ];

  return(
    <div style={css.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={{...css.header,position:"fixed" as const,top:0,left:0,right:0,zIndex:100,background:"rgba(6,7,9,0.94)",backdropFilter:"blur(24px)"}} className="header-pad">
        {/* Logo — bigger */}
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{flexShrink:0}}>
          <circle cx="24" cy="24" r="21" stroke={C.gold} strokeWidth="1.2" opacity={0.7}/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke={C.gold} strokeWidth="1.5" fill="none"/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(60 24 24)"/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke={C.gold} strokeWidth="1.5" fill="none" transform="rotate(120 24 24)"/>
          <circle cx="24" cy="24" r="2.5" fill={C.gold}/>
          <circle cx="35" cy="24" r="1.6" fill={C.gold} opacity={0.7}/>
          <circle cx="18.5" cy="14.8" r="1.6" fill={C.gold} opacity={0.7}/>
          <circle cx="18.5" cy="33.2" r="1.6" fill={C.gold} opacity={0.7}/>
        </svg>
        {/* Wordmark */}
        <div>
          <div style={{fontFamily:CONDENSED_FONT,fontSize:13,fontWeight:700,color:C.text,letterSpacing:"0.22em",textTransform:"uppercase" as const}}>DNA TRAINER</div>
          <div style={{fontFamily:CONDENSED_FONT,fontSize:8,color:"#607080",letterSpacing:"0.2em",textTransform:"uppercase" as const,marginTop:1}} className="hsubtitle">Coach Platform</div>
        </div>
        {/* Bell */}
        <NotificationBell upcomingBookings={allBookings} clients={allClients}/>
        {/* Search */}
        <button onClick={()=>setGlobalSearch(true)} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,padding:"5px 12px",color:C.muted,fontSize:10,cursor:"pointer",fontFamily:CONDENSED_FONT,letterSpacing:"0.12em",textTransform:"uppercase" as const}} className="search-btn">
          <span>🔍</span>
          <span className="logout-label">Ieškoti</span>
          <span className="logout-label" style={{fontSize:9,background:C.border,padding:"1px 5px",marginLeft:2}}>⌘K</span>
        </button>
        <div style={{marginLeft:"auto",display:"flex",gap:2,alignItems:"center"}} className="header-nav-items">
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              display:"flex",flexDirection:"column" as const,alignItems:"center",gap:2,
              padding:"5px 10px",
              background:tab===n.id?"linear-gradient(145deg,#E8BE6A,#B8902A)":"transparent",
              color:tab===n.id?"#1A0E00":C.muted,
              border:"none",cursor:"pointer",
              fontFamily:CONDENSED_FONT,fontSize:9,fontWeight:700,
              letterSpacing:"0.1em",textTransform:"uppercase" as const,
              borderRadius:"8px",
              boxShadow:tab===n.id?"0 4px 0 #7A5A10,0 6px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2)":"none",
              transition:"all .12s ease",
              minWidth:50,
              position:"relative" as const,
              top:0,
            }}>
              <span style={{fontSize:16,lineHeight:1,filter:tab===n.id?"none":`drop-shadow(0 0 0 transparent)`,transition:"filter .2s"}}>{n.icon}</span>
              <span className="logout-label">{n.label}</span>
            </button>
          ))}
          <div style={{width:1,height:32,background:C.border,margin:"0 6px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:"linear-gradient(145deg,#1A2030,#0E1420)",border:`1px solid ${C.border}`,borderRadius:"10px",boxShadow:"0 4px 0 #040608,inset 0 1px 0 rgba(255,255,255,0.05)"}}>
            <div style={{width:28,height:28,borderRadius:"8px",background:`linear-gradient(135deg,${C.gold},#8B6520)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#060709",flexShrink:0,boxShadow:`0 3px 8px rgba(212,168,83,0.4)`}}>{(coach?.full_name||"?")[0].toUpperCase()}</div>
            <span className="logout-label" style={{fontSize:11,fontWeight:600,color:C.text}}>{coach?.full_name}</span>
            {isAdmin&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,padding:"2px 8px",fontSize:9,color:C.gold,fontWeight:700,fontFamily:CONDENSED_FONT,letterSpacing:"0.1em",borderRadius:"4px"}}>ADMIN</span>}
          </div>
          <button onClick={handleLogout} style={{...css.btnGhost,fontSize:10,padding:"6px 10px",marginLeft:2}}>
            <span className="logout-label">🚪 </span>Atsijungti
          </button>
        </div>
      </div>
      <div className="content-pad" style={{maxWidth:1200,margin:"0 auto",padding:"82px 32px 24px"}}>
        {tab==="dashboard"  && <DashboardTab onNav={navigate} allClients={allClients} allBookings={allBookings}/>}
        {tab==="exercises"  && <ExercisesTab key={tab+autoOpen} autoOpen={autoOpen}/>}
        {tab==="foods"      && <FoodsTab key={tab+autoOpen} autoOpen={autoOpen} onFoodsLoaded={setFoods}/>}
        {tab==="macro"      && <MacroCalculatorTab clients={allClients} foods={foods}/>}
        {tab==="clients"    && <ClientsTab key={tab+autoOpen} exercises={exercises} foods={foods} autoOpen={autoOpen}/>}
        {tab==="calendar"   && <CalendarTab/>}
        {tab==="users"      && isAdmin && <UsersTab/>}
        {tab==="stats"      && isAdmin && <AdminStatsTab/>}
        {tab==="revenue"    && isAdmin && <RevenueTab clients={allClients}/>}
      </div>
      {/* ── GLOBAL SEARCH MODAL ── */}
      {globalSearch&&<GlobalSearchModal
        clients={allClients} exercises={exercises} foods={foods}
        onClose={()=>setGlobalSearch(false)}
        onNav={(t:string,open?:boolean)=>{setGlobalSearch(false);navigate(t,open);}}
      />}

      {/* ── QUICK ACTIONS FAB ── */}
      <QuickActionsFAB onNav={(t:string,open?:boolean)=>navigate(t,open)}/>

      {/* ── AI ASSISTANT FLOATING BUTTON ── */}
      <AIAssistantButton clients={allClients} exercises={exercises}/>

      {/* Mobile bottom navigation — max 5 items */}
      <nav className="bottom-nav">
        {[
          {id:"dashboard",icon:"🏠",label:"Pradžia"},
          {id:"clients",icon:"👥",label:"Klientai"},
          {id:"macro",icon:"🧮",label:"Makro"},
          {id:"calendar",icon:"📅",label:"Kalend."},
          isAdmin
            ? {id:"users",icon:"⚙️",label:"Admin"}
            : {id:"exercises",icon:"🏋️",label:"Pratimai"},
        ].map(n=>(
          <div key={n.id} className={`bottom-nav-item${tab===n.id?" active":""}`} onClick={()=>navigate(n.id)}>
            <span className="bottom-nav-icon">{n.icon}</span>
            <span className="bottom-nav-label">{n.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

// ── APP ROUTER ────────────────────────────────────────────
function AppRouter(){
  const params=new URLSearchParams(window.location.search);
  const shareToken=params.get("share");
  const shareType=params.get("type")||"training";
  const bookingCoachId=params.get("coach");
  if(shareType==="booking"&&!shareToken)return <BookingPage coachId={bookingCoachId}/>;
  if(shareToken)return <SharePage token={shareToken} type={shareType}/>;

  const session=getSession();
  if(!session)return <LoginGate/>;
  return(
    <AuthProvider onLogout={()=>window.location.reload()}>
      <MainApp/>
    </AuthProvider>
  );
}

// ── LOGIN GATE ────────────────────────────────────────────
function LoginGate(){
  const [coach,setCoach]=useState<any>(null);
  if(coach)return(
    <AuthProvider onLogout={()=>window.location.reload()}>
      <MainApp/>
    </AuthProvider>
  );
  return <LoginScreen onLogin={(c)=>setCoach(c)}/>;
}

export default AppRouter;
