// ── App.tsx — Dashboard, Exercises, Clients, Share page ──
import { useState, useCallback, useEffect } from "react";
import { sb, C, FONT, RESPONSIVE_CSS, css, ALL_MUSCLES, GOALS, LEVELS, DAYS, REST_OPTIONS, ACTIVITY_LEVELS, calcBMI, bmiCat, calcNut, genToken, getCoachId, getIsAdmin, Tag, Badge, Spinner, Skeleton, SkeletonCard, Err, NutriBadge, ImgGallery, MultiImgUploader } from "./shared";
import { LoginScreen, AuthProvider, UsersTab, useAuth, getSession, clearSession } from "./auth";
import { FoodsTab, MealPlanBuilder, MealSharePage } from "./MealPlan";
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
const emptyClient  = {name:"",age:"",weight:"",height:"",gender:"Vyras",goal:"",level:"",notes:"",training_days:[] as string[],activity_index:2};

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
function DashboardTab({onNav}:{onNav:(t:string,open?:boolean)=>void}){
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
      {/* Hero banner — cinematic photo */}
      <div className="fu" style={{position:"relative",borderRadius:16,overflow:"hidden",marginBottom:22,minHeight:210}}>
        <img src="https://images.unsplash.com/photo-1549476464-37392f717541?w=1400&q=85" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.22) saturate(0.6)"}} onError={e=>(e.target as HTMLImageElement).style.display="none"}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${C.bg}EE 0%,${C.bg}88 60%,${C.bg}00 100%)`}}/>
        <div style={{position:"relative",padding:"32px 28px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:24,height:1,background:C.gold}}/>
            <div style={{fontSize:10,color:C.gold,fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase"}}>Sporto sistema · {new Date().getFullYear()}</div>
          </div>
          <div style={{fontSize:36,fontWeight:800,color:"#FFFFFF",marginBottom:4,letterSpacing:"-0.01em",fontFamily:"'Inter',sans-serif",lineHeight:1.1}}>Sveiki sugrįžę</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:22}}>{new Date().toLocaleDateString("lt-LT",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}> 
            <button onClick={()=>onNav("clients",true)} style={css.btnG}>+ Naujas klientas</button>
            <button onClick={()=>onNav("exercises",true)} style={css.btnGhost}>+ Pratimas</button>
            <button onClick={()=>onNav("foods",true)} style={css.btnGhost}>+ Maistas</button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="dash-stats fu1" style={{}}>
        {statCards.map(s=>(
          <div key={s.label} onClick={()=>onNav(s.tab)} className="stat-card" style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"20px 18px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(ellipse at 100% 0%,${s.color}22 0%,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-8,left:-8,width:60,height:60,background:`radial-gradient(circle,${s.color}08 0%,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{fontSize:30,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize:36,fontWeight:900,color:s.color,lineHeight:1,marginBottom:7,fontFamily:"'Inter',sans-serif",letterSpacing:"-0.02em"}}>{loading?"—":s.val}</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.12em"}}>{s.label}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(to right,${s.color}00,${s.color}60,${s.color}00)`}}/>
          </div>
        ))}
      </div>

      {/* Recent + Today */}
      <div className="dash-bottom fu2" style={{}}>
        <div style={css.card}>
          <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
            <span style={{...css.secTitle,marginBottom:0}}>Paskutiniai klientai</span>
            <button onClick={()=>onNav("clients")} style={{...css.btnGhost,marginLeft:"auto",fontSize:11,padding:"5px 10px"}}>Visi →</button>
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
        <div style={css.card}>
          <span style={css.secTitle}>Artimiausi užsiėmimai</span>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{fontSize:11,color:C.gold,fontWeight:600,letterSpacing:"0.08em"}}>{todayName}</div>
            {todayBookings.length>0&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:20,padding:"1px 8px",fontSize:10,color:C.gold,fontWeight:700}}>{todayBookings.length} rezervacija</span>}
          </div>
          {loading?<Spinner/>:(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {/* Calendar bookings today */}
              {todayBookings.map((b:any)=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"9px 12px"}}>
                  <div style={{fontSize:20,fontWeight:800,color:C.gold,minWidth:52,fontFamily:"'Inter',sans-serif"}}>{b.time}</div>
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
                    <div style={{fontSize:14,fontWeight:900,color:C.gold,fontFamily:"'Inter',sans-serif"}}>{new Date(b.date+"T12:00:00").getDate()}</div>
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
    try{setExercises(await sb.get("exercises","?order=name"));}
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
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti..." className="sbar" style={{...css.input,width:200}}/>
        <div className="tag-row" style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Visos",...ALL_MUSCLES].map(m=><Tag key={m} c={C.gold} label={m} active={muscle===m} onClick={()=>setMuscle(m)}/>)}
        </div>
        <button onClick={load} style={{...css.btnGhost,marginLeft:"auto",fontSize:11}}>↺</button>
      </div>
      <Err msg={error}/>
      {loading?<Spinner/>:(
        <div className="ex-grid" style={{}}>
          {filtered.map(ex=>(
            <div key={ex.id} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{position:"relative"}}><ImgGallery imgs={ex.imgs} height={140}/>
                <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.55)",borderRadius:6,padding:"3px 9px",fontSize:11,color:C.teal,fontWeight:600}}>{ex.muscle}</div>
              </div>
              <div style={{padding:"12px 14px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontWeight:700,fontSize:15,color:"#FFFFFF"}}>{ex.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{ex.equipment}</div>
                <div style={{fontSize:13,color:C.gold,fontWeight:600}}>{ex.sets} ser. · {ex.reps} kart.</div>
                {ex.description&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{ex.description}</div>}
                {ex.video_url&&<a href={ex.video_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:4,background:"#ef444418",border:"1px solid #ef444440",borderRadius:7,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#f87171",textDecoration:"none"}}>▶ Žiūrėti video</a>}
                <div style={{display:"flex",gap:7,marginTop:"auto",paddingTop:8}}>
                  <button style={css.btnTeal} onClick={()=>openEdit(ex)}>✏️ Redaguoti</button>
                  <button style={css.btnRed} onClick={()=>setConfirmDel(ex)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0&&!loading&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:60}}>Pratimų nerasta</div>}
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
    setClientForm({name:c.name||"",age:c.age||"",weight:c.weight||"",height:c.height||"",gender:c.gender||"Vyras",goal:c.goal||"",level:c.level||"",notes:c.notes||"",training_days:c.training_days||[],activity_index:c.activity_index??2});
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

  const printPDF=(c:any,pl:any[])=>{
    const prog=c.program||{},pn=c.program_name||"";
    const bv=calcBMI(c.weight,c.height),bn=bv?parseFloat(bv.toFixed(1)):null,bc=bn?bmiCat(bn):null;
    const nut2=calcNut(c.weight,c.height,c.age,c.gender,ACTIVITY_LEVELS[c.activity_index??2]?.factor||1.55);
    const days2=DAYS.filter(d=>(c.training_days||[]).includes(d));
    const today2=new Date().toLocaleDateString("lt-LT");
    const win=window.open("","_blank");
    if(!win){alert("Leiskite iššokančius langus!");return;}
    const pstyle=`*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#fff;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}.hdr{background:#1A1A1A;padding:18px 24px;display:flex;align-items:center;gap:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.logo{width:42px;height:42px;background:linear-gradient(135deg,#D4860A,#B06A08);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#0a0d14;flex-shrink:0}.ht{font-size:17px;font-weight:900;color:#f0b429}.hs{font-size:9px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px}.hr{margin-left:auto;text-align:right;color:#fff}.sec{margin:12px 18px;border:1.5px solid #e0e0e8;border-radius:11px;overflow:hidden}.sh{background:#1A1A1A;color:#fff;padding:9px 16px;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;-webkit-print-color-adjust:exact;print-color-adjust:exact}.ig{display:flex;flex-wrap:wrap;gap:7px;padding:11px 14px}.ib{background:#f5f5fa;border:1.5px solid #e0e0e8;border-radius:8px;padding:7px 11px;min-width:70px}.il{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}.iv{font-size:13px;font-weight:700}.er{display:flex;gap:10px;padding:10px 12px;border-top:1px solid #f0f0f5;align-items:flex-start;page-break-inside:avoid}.en{width:22px;height:22px;background:#f0f0f5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;color:#555;flex-shrink:0;margin-top:2px}.ei{width:90px;height:72px;object-fit:cover;border-radius:7px;flex-shrink:0;border:1.5px solid #e8e8f0}.ep{width:90px;height:72px;background:#f0f0f5;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px}.en2{font-size:12px;font-weight:700;margin-bottom:2px}.em{font-size:10px;color:#38bdf8;font-weight:600;margin-bottom:5px}.ss{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:3px}.sb{border-radius:6px;padding:3px 7px;display:inline-flex;flex-direction:column;align-items:center;border:1.5px solid}.sl{font-size:8px;color:#888;text-transform:uppercase;letter-spacing:1px}.sv{font-size:12px;font-weight:800}.ed{font-size:10px;color:#777;font-style:italic;line-height:1.5}.nut2{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #eee}.prog-t{width:100%;border-collapse:collapse;font-size:12px}.prog-t th{padding:7px 10px;text-align:left;border-bottom:1.5px solid #e0e0e8;font-size:10px;color:#888;text-transform:uppercase;background:#f5f5fa}.prog-t td{padding:7px 10px;border-bottom:1px solid #f0f0f5}.hd{display:none}.pb{position:fixed;top:10px;right:10px;padding:9px 18px;background:#D4860A;color:#000;border:none;border-radius:8px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;z-index:999;box-shadow:0 2px 8px #0003}.ft{text-align:center;padding:14px;color:#aaa;font-size:10px;border-top:1px solid #eee;margin-top:10px}@media(max-width:768px){.sec{margin:8px 10px}.sh{padding:8px 12px;font-size:10px}.ig{padding:8px 10px;gap:5px}.ib{padding:5px 8px;min-width:55px}.iv{font-size:11px}.er{gap:8px;padding:8px 10px}.ei{width:75px;height:58px}.ep{width:75px;height:58px;font-size:17px}.en2{font-size:11px}.nut2{grid-template-columns:1fr}.nut2>div{border-right:none!important;border-bottom:1px solid #eee}.hd{display:none}}@media(max-width:480px){.er{flex-wrap:wrap}.ei,.ep{width:100%;height:140px}.prog-t{font-size:10px}.prog-t th,.prog-t td{padding:5px 6px}.hd{display:none}}@media print{.pb{display:none}body{font-size:11px}}`;
    let h=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pn||"Programa"}-${c.name}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>${pstyle}</style></head><body>`;
    h+=`<button class="pb" onclick="window.print()">🖨️ Išsaugoti kaip PDF</button>`;
    h+=`<div class="hdr"><div class="logo">M</div><div><div class="ht">DNA Trainer</div><div class="hs">DNA Trainer programa</div></div><div class="hr"><div style="font-size:13px;font-weight:700">${pn||"DNA Trainer programa"}</div><div style="font-size:10px;color:#888;margin-top:2px">${today2}</div></div></div>`;
    h+=`<div class="sec"><div class="sh">👤 Kliento informacija</div><div class="ig">`;
    if(c.name)h+=`<div class="ib"><div class="il">Vardas</div><div class="iv">${c.name}</div></div>`;
    if(c.age)h+=`<div class="ib"><div class="il">Amžius</div><div class="iv">${c.age} m.</div></div>`;
    if(c.weight)h+=`<div class="ib"><div class="il">Svoris</div><div class="iv">${c.weight} kg</div></div>`;
    if(c.height)h+=`<div class="ib"><div class="il">Ūgis</div><div class="iv">${c.height} cm</div></div>`;
    if(c.gender)h+=`<div class="ib"><div class="il">Lytis</div><div class="iv">${c.gender}</div></div>`;
    if(bn)h+=`<div class="ib" style="background:${bc!.color}18;border-color:${bc!.color}55"><div class="il">KMI</div><div class="iv" style="color:${bc!.color}">${bn} — ${bc!.label}</div></div>`;
    if(c.goal)h+=`<div class="ib" style="background:#f0b42918;border-color:#f0b42940"><div class="il">Tikslas</div><div class="iv" style="color:#f0b429">${c.goal}</div></div>`;
    if(c.level)h+=`<div class="ib" style="background:#38bdf818;border-color:#38bdf840"><div class="il">Lygis</div><div class="iv" style="color:#38bdf8">${c.level}</div></div>`;
    h+=`</div>${c.notes?`<div style="padding:0 14px 10px;font-size:11px;color:#666;font-style:italic">📝 ${c.notes}</div>`:""}</div>`;
    if(nut2){
      h+=`<div class="sec"><div class="sh">🍽️ Mitybos rekomendacijos</div><div class="ig"><div class="ib" style="background:#f0b42918;border-color:#f0b42940"><div class="il">TDEE</div><div class="iv" style="color:#f0b429">${nut2.tdee} kcal</div></div></div>`;
      h+=`<div class="nut2" style="border-top:1px solid #eee"><div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:10px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔻 Riebalų deginimas — ${nut2.lose} kcal/d.</div><div style="display:flex;gap:5px;flex-wrap:wrap">`;
      h+=`<div class="ib" style="background:#ef444418;border-color:#ef444440"><div class="il">Baltymai</div><div class="iv" style="color:#f87171">${nut2.protLose}g</div></div>`;
      h+=`<div class="ib" style="background:#f9731618;border-color:#f9731640"><div class="il">Angliavandeniai</div><div class="iv" style="color:#fb923c">${nut2.carbLose}g</div></div>`;
      h+=`<div class="ib" style="background:#a78bfa18;border-color:#a78bfa40"><div class="il">Riebalai</div><div class="iv" style="color:#a78bfa">${nut2.fatLose}g</div></div>`;
      h+=`</div></div><div style="padding:12px 14px"><div style="font-size:10px;font-weight:700;color:#22c55e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔺 Raumenų auginimas — ${nut2.gain} kcal/d.</div><div style="display:flex;gap:5px;flex-wrap:wrap">`;
      h+=`<div class="ib" style="background:#22c55e18;border-color:#22c55e40"><div class="il">Baltymai</div><div class="iv" style="color:#22c55e">${nut2.protGain}g</div></div>`;
      h+=`<div class="ib" style="background:#f9731618;border-color:#f9731640"><div class="il">Angliavandeniai</div><div class="iv" style="color:#fb923c">${nut2.carbGain}g</div></div>`;
      h+=`<div class="ib" style="background:#a78bfa18;border-color:#a78bfa40"><div class="il">Riebalai</div><div class="iv" style="color:#a78bfa">${nut2.fatGain}g</div></div>`;
      h+=`</div></div></div></div>`;
    }
    days2.forEach(day2=>{
      const exs=prog[day2]||[];
      h+=`<div class="sec"><div class="sh">${day2} — ${exs.length} pratimas(-ai)</div>`;
      if(!exs.length)h+=`<div style="padding:10px 14px;color:#aaa;font-size:12px">Pratimų nėra</div>`;
      else exs.forEach((ex:any,i:number)=>{
        const imgs=(ex.imgs||[]).filter(Boolean);
        h+=`<div class="er"><div class="en">${i+1}</div>`;
        h+=imgs[0]?`<img src="${imgs[0]}" class="ei"/>`:`<div class="ep">📷</div>`;
        h+=`<div style="flex:1"><div class="en2">${ex.name}</div><div class="em">${ex.muscle||""} · ${ex.equipment||""}</div><div class="ss">`;
        if(ex.customSets)h+=`<span class="sb" style="background:#f0b42918;border-color:#f0b42940"><span class="sl">Serijos</span><span class="sv" style="color:#f0b429">${ex.customSets}</span></span>`;
        if(ex.customReps)h+=`<span class="sb" style="background:#f5f5fa;border-color:#ddd"><span class="sl">Kartojimai</span><span class="sv" style="color:#333">${ex.customReps}</span></span>`;
        if(ex.customWeight)h+=`<span class="sb" style="background:#38bdf818;border-color:#38bdf840"><span class="sl">Svoris</span><span class="sv" style="color:#38bdf8">${ex.customWeight}</span></span>`;
        if(ex.customRest)h+=`<span class="sb" style="background:#a78bfa18;border-color:#a78bfa40"><span class="sl">Poilsis</span><span class="sv" style="color:#a78bfa">${ex.customRest}</span></span>`;
        h+=`</div>${ex.description?`<div class="ed">${ex.description}</div>`:""}`;
        if(ex.video_url)h+=`<a href="${ex.video_url}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;margin-top:5px;background:#ef444418;border:1px solid #ef444440;border-radius:6px;padding:3px 9px;font-size:10px;font-weight:700;color:#f87171;text-decoration:none;">▶ Žiūrėti video</a>`;
        h+=`</div></div>`;
      });
      h+=`</div>`;
    });
    if(pl&&pl.length>0){
      h+=`<div class="sec"><div class="sh">📈 Pažangos istorija</div><div style="padding:10px 14px;overflow-x:auto"><table class="prog-t"><thead><tr><th>Data</th><th>Svoris</th><th class="hd">Krūtinė</th><th class="hd">Juosmuo</th><th class="hd">Klubai</th><th>Pastabos</th></tr></thead><tbody>`;
      pl.forEach((p:any,i:number)=>{h+=`<tr style="background:${i%2?"#fafafa":"#fff"}"><td>${new Date(p.date).toLocaleDateString("lt-LT")}</td><td style="font-weight:700;color:#f0b429">${p.weight?p.weight+" kg":"—"}</td><td class="hd">${p.chest?p.chest+" cm":"—"}</td><td class="hd">${p.waist?p.waist+" cm":"—"}</td><td class="hd">${p.hips?p.hips+" cm":"—"}</td><td style="font-style:italic;color:#666">${p.notes||"—"}</td></tr>`;});
      h+=`</tbody></table></div></div>`;
    }
    h+=`<div class="ft">© DNA Trainer · ${today2}</div></body></html>`;
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
                      <div style={{fontSize:10,color:C.muted}}>{c.program_name||"Programa"}</div>
                      <div style={{fontSize:10,color:C.gold,fontWeight:600}}>{completionPct}%</div>
                    </div>
                    <div style={{height:4,background:C.faint,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${completionPct}%`,background:`linear-gradient(to right,${C.gold},${C.gold}88)`,borderRadius:2,transition:"width .3s"}}/>
                    </div>
                    {c.meal_plan_name&&<div style={{marginTop:7,fontSize:10,color:C.green,display:"flex",alignItems:"center",gap:4}}>🥗 <span>{c.meal_plan_name}</span></div>}
                  </div>

                  {/* Actions */}
                  <div style={{padding:"0 12px 12px",display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>openView(c)} style={{...css.btnTeal,flex:1,fontSize:11,justifyContent:"center",padding:"7px 6px"}}>👁️ Peržiūrėti</button>
                    <button onClick={()=>openEdit(c)} style={{...css.btnG,flex:1,fontSize:11,padding:"7px 6px"}}>✏️ Redaguoti</button>
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
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{v}</div>
                </div>
              ))}
              {(()=>{const b=calcBMI(view.weight,view.height);if(!b)return null;const bn=parseFloat(b.toFixed(1));const bc=bmiCat(bn);return(<div style={{background:C.faint,borderRadius:7,padding:"6px 11px"}}><div style={{fontSize:9,color:C.muted,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:2}}>KMI</div><div style={{fontSize:13,fontWeight:700,color:bc.color}}>{bn} — {bc.label}</div></div>);})()}
            </div>
            {view.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>📝 {view.notes}</div>}
          </div>
          {/* Progress */}
          <div style={{...css.card,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
              <span style={{...css.secTitle,marginBottom:0}}>📈 Pažangos istorija</span>
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
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📋 {view.program_name||"Programa"}</div>
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
              {[["Vardas ir pavardė *","name","text"],["Amžius","age","number"],["Svoris (kg)","weight","number"],["Ūgis (cm)","height","number"]].map(([lb,k,t])=>(<div key={k}><span style={css.label}>{lb}</span><input type={t} value={(clientForm as any)[k]} onChange={e=>setClientForm(p=>({...p,[k]:e.target.value}))} style={css.input} placeholder={lb as string}/></div>))}
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
            <div style={{marginBottom:14}}><span style={css.label}>Mitybos plano pavadinimas</span><input value={mealPlanName} onChange={e=>setMealPlanName(e.target.value)} placeholder="pvz. Tomo mitybos planas" style={{...css.input,maxWidth:380}}/></div>
            <MealPlanBuilder days={trainingDays.length>0?trainingDays:DAYS.slice(0,5)} mealPlan={mealPlan} setMealPlan={setMealPlan} foods={foods}/>
          </div>)}
          {step===2&&planType!=="meal"&&(<div>
            <div style={{marginBottom:14}}><span style={css.label}>Programos pavadinimas</span><input value={programName} onChange={e=>setProgramName(e.target.value)} placeholder="pvz. Tomo 3 dienų programa" style={{...css.input,maxWidth:380}}/></div>
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
                  <div style={{fontSize:11,color:C.muted,marginTop:2,display:"flex",gap:8}}>
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
            <div style={{fontSize:32,fontWeight:900,color:s.color,lineHeight:1,marginBottom:5,fontFamily:"'Inter',sans-serif"}}>{s.val}</div>
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
                      <div style={{fontSize:20,fontWeight:800,color:stat.color,fontFamily:"'Inter',sans-serif",lineHeight:1}}>{stat.val}</div>
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
                    <div style={{fontSize:15,fontWeight:800,color:C.gold,minWidth:46,fontFamily:"'Inter',sans-serif"}}>{b.time}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{b.client_name}</div>
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
                      <div style={{fontSize:14,fontWeight:800,color:C.gold,fontFamily:"'Inter',sans-serif",lineHeight:1}}>{new Date(b.date+"T12:00").getDate()}</div>
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
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div>
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
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div>
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
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.name}</div>
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
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:systemPrompt,
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

  const handleLogout=()=>{logout();};

  useEffect(()=>{
    sb.get("exercises","?order=name").then(d=>setExercises(d)).catch(()=>{});
    sb.get("foods","?order=name").then(d=>setFoods(d)).catch(()=>{});
    sb.get("clients",`?coach_id=eq.${getCoachId()}&order=name`).then(d=>setAllClients(d)).catch(()=>{});
  },[]);

  const navigate=(t:string,open=false)=>{setTab(t);setAutoOpen(open);setTimeout(()=>setAutoOpen(false),100);};

  const NAV=[
    {id:"dashboard",icon:"🏠",label:"Pradžia"},
    {id:"clients",icon:"👥",label:"Klientai"},
    {id:"exercises",icon:"🏋️",label:"Pratimai"},
    {id:"foods",icon:"🥗",label:"Mityba"},
    {id:"calendar",icon:"📅",label:"Kalendorius"},
    ...(isAdmin?[{id:"stats",icon:"📊",label:"Statistika"},{id:"users",icon:"⚙️",label:"Vartotojai"}]:[]),
  ];

  return(
    <div style={css.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={css.header} className="header-pad">
        {/* Atom DNA Logo */}
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none" style={{flexShrink:0}}>
          <circle cx="24" cy="24" r="22" stroke={C.text} strokeWidth="1" opacity={0.4}/>
          <ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.text} strokeWidth="1.1" fill="none" opacity={0.75}/>
          <ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.text} strokeWidth="1.1" fill="none" opacity={0.75} transform="rotate(60 24 24)"/>
          <ellipse cx="24" cy="24" rx="12" ry="5.5" stroke={C.text} strokeWidth="1.1" fill="none" opacity={0.75} transform="rotate(120 24 24)"/>
          <circle cx="24" cy="24" r="2.2" fill={C.gold}/>
          <circle cx="36" cy="24" r="1.4" fill={C.text} opacity={0.85}/>
          <circle cx="18" cy="14.5" r="1.4" fill={C.text} opacity={0.85}/>
          <circle cx="18" cy="33.5" r="1.4" fill={C.text} opacity={0.85}/>
        </svg>
        {/* Divider */}
        <div style={{width:1,height:26,background:C.border,flexShrink:0}}/>
        {/* Wordmark */}
        <div>
          <div style={{fontWeight:300,fontSize:13,color:C.text,letterSpacing:"0.22em",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>DNA TRAINER</div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginTop:1}} className="hsubtitle">Sporto sistema</div>
        </div>
        {/* Global search button */}
        <button onClick={()=>setGlobalSearch(true)} style={{marginLeft:8,display:"flex",alignItems:"center",gap:7,background:C.faint,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",color:C.muted,fontSize:12,cursor:"pointer",transition:"all .15s"}} className="search-btn">
          <span style={{fontSize:14}}>🔍</span>
          <span className="logout-label" style={{fontSize:11,letterSpacing:"0.04em"}}>Ieškoti...</span>
          <span className="logout-label" style={{fontSize:9,background:C.border,borderRadius:4,padding:"1px 5px",marginLeft:4}}>⌘K</span>
        </button>
        <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}} className="header-nav-items">
          {NAV.map(n=>(
            <button key={n.id} style={css.navBtn(tab===n.id)} onClick={()=>navigate(n.id)}>
              <span>{n.icon}</span> <span className="logout-label">{n.label}</span>
            </button>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4,padding:"5px 10px",background:C.faint,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{width:26,height:26,background:`linear-gradient(135deg,${C.gold},#B06A08)`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",flexShrink:0}}>{(coach?.full_name||"?")[0].toUpperCase()}</div>
            <span className="logout-label" style={{fontSize:11,fontWeight:600,color:C.text}}>{coach?.full_name}</span>
            {isAdmin&&<span style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"1px 6px",fontSize:9,color:C.gold,fontWeight:700}}>ADMIN</span>}
          </div>
          <button onClick={handleLogout} style={{...css.btnGhost,fontSize:11,padding:"6px 10px",marginLeft:2}}>
            <span className="logout-label">🚪 </span>Atsijungti
          </button>
        </div>
      </div>
      <div className="content-pad" style={{maxWidth:1140,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="dashboard"  && <DashboardTab onNav={navigate}/>}
        {tab==="exercises"  && <ExercisesTab key={tab+autoOpen} autoOpen={autoOpen}/>}
        {tab==="foods"      && <FoodsTab key={tab+autoOpen} autoOpen={autoOpen} onFoodsLoaded={setFoods}/>}
        {tab==="clients"    && <ClientsTab key={tab+autoOpen} exercises={exercises} foods={foods} autoOpen={autoOpen}/>}
        {tab==="calendar"   && <CalendarTab/>}
        {tab==="users"      && isAdmin && <UsersTab/>}
        {tab==="stats"      && isAdmin && <AdminStatsTab/>}
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

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {NAV.map(n=>(
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
