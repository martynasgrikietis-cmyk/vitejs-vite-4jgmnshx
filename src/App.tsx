// ── App.tsx — Dashboard, Exercises, Clients, Share page ──
import { useState, useCallback, useEffect } from "react";
import { sb, C, FONT, RESPONSIVE_CSS, css, ALL_MUSCLES, GOALS, LEVELS, DAYS, REST_OPTIONS, ACTIVITY_LEVELS, APP_PASSWORD, calcBMI, bmiCat, calcNut, genToken, Tag, Badge, Spinner, Err, NutriBadge, ImgGallery, MultiImgUploader } from "./shared";
import { FoodsTab, MealPlanBuilder, MealSharePage } from "./MealPlan";

const emptyExForm  = {name:"",muscle:"Krūtinė",equipment:"",sets:"3",reps:"10-12",description:"",imgs:[] as string[]};
const emptyClient  = {name:"",age:"",weight:"",height:"",gender:"Vyras",goal:"",level:"",notes:"",training_days:[] as string[],activity_index:2};

// ── LOGIN ─────────────────────────────────────────────────
function LoginScreen({onLogin}:{onLogin:()=>void}){
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const submit=()=>{if(pw===APP_PASSWORD){onLogin();}else{setErr("Neteisingas slaptažodis.");setPw("");}};
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,padding:16}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,#1a2540 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{background:C.surface,borderRadius:24,border:`1px solid ${C.border}`,padding:"40px 32px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 40px 100px #00000066",position:"relative"}}>
        <div style={{width:72,height:72,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:900,color:C.bg,margin:"0 auto 20px",boxShadow:`0 8px 24px ${C.gold}44`}}>M</div>
        <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:4,letterSpacing:"-0.03em"}}>Coach Martynas</div>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:32}}>Sporto & Mitybos sistema</div>
        <Err msg={err}/>
        <div style={{marginBottom:16}}>
          <span style={css.label}>Slaptažodis</span>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...css.input,textAlign:"center",fontSize:20,letterSpacing:6}} placeholder="••••••••" autoFocus/>
        </div>
        <button onClick={submit} style={{...css.btnG,width:"100%",padding:"13px",fontSize:14,borderRadius:12}}>🔓 Prisijungti</button>
        <div style={{fontSize:11,color:C.muted,marginTop:16}}>Tik jūs turite prieigą prie šios sistemos.</div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function DashboardTab({onNav}:{onNav:(t:string,open?:boolean)=>void}){
  const [stats,setStats]=useState({clients:0,exercises:0,foods:0,mealplans:0});
  const [recent,setRecent]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([
      sb.get("clients","?order=created_at.desc"),
      sb.get("exercises","?select=id"),
      sb.get("foods","?select=id").catch(()=>[] as any[]),
    ]).then(([clients,exs,fds])=>{
      setRecent(clients);
      setStats({clients:clients.length,exercises:exs.length,foods:fds.length,mealplans:clients.filter((c:any)=>c.meal_plan_name).length});
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const todayName=DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
  const todayClients=recent.filter(c=>(c.training_days||[]).includes(todayName));

  const statCards=[
    {icon:"👥",label:"Klientai",val:stats.clients,color:C.gold,tab:"clients"},
    {icon:"🏋️",label:"Pratimai",val:stats.exercises,color:C.teal,tab:"exercises"},
    {icon:"🥗",label:"Maisto produktai",val:stats.foods,color:C.green,tab:"foods"},
    {icon:"📋",label:"Mitybos planai",val:stats.mealplans,color:C.purple,tab:"clients"},
  ];

  return(
    <div>
      {/* Hero banner */}
      <div className="fu" style={{background:`linear-gradient(135deg,${C.surface} 0%,${C.surface2} 100%)`,borderRadius:20,border:`1px solid ${C.border}`,padding:"28px 24px",marginBottom:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:300,height:180,background:`radial-gradient(ellipse at 100% 0%,${C.gold}18 0%,transparent 65%)`,pointerEvents:"none"}}/>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Coach Martynas · Sistema</div>
        <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:4,letterSpacing:"-0.02em"}}>Sveiki sugrįžę! 👋</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:18}}>{new Date().toLocaleDateString("lt-LT",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>onNav("clients",true)} style={{...css.btnG,borderRadius:10}}>+ Naujas klientas</button>
          <button onClick={()=>onNav("exercises",true)} style={{...css.btnGhost,borderRadius:10}}>+ Pratimas</button>
          <button onClick={()=>onNav("foods",true)} style={{...css.btnGhost,borderRadius:10}}>+ Maistas</button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="dash-stats fu1" style={{}}>
        {statCards.map(s=>(
          <div key={s.label} onClick={()=>onNav(s.tab)} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 16px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"border-color .15s"}}>
            <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`radial-gradient(ellipse at 100% 0%,${s.color}22 0%,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{fontSize:26,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:30,fontWeight:900,color:s.color,lineHeight:1,marginBottom:4}}>{loading?"—":s.val}</div>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>{s.label}</div>
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
                    <div style={{width:38,height:38,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
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
          <span style={css.secTitle}>Šiandien treniruojasi</span>
          <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:10}}>{todayName}</div>
          {loading?<Spinner/>:todayClients.length===0?<div style={{textAlign:"center",color:C.muted,padding:"16px 0",fontSize:13}}>Šiandien niekas netreniruojasi 😴</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {todayClients.map((c:any)=>{
                const exCnt=(c.program||{})[todayName]?.length||0;
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,background:C.greenSoft,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"9px 11px"}}>
                    <div style={{width:32,height:32,background:C.green,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{c.name}</div>
                      <div style={{fontSize:10,color:C.green}}>{exCnt} pratimų šiandien</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{setExercises(await sb.get("exercises","?order=name"));}
    catch(e:any){setError("Klaida: "+e.message);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const openNew=()=>{setEditId(null);setForm({...emptyExForm});setFormOpen(true);};
  const openEdit=(ex:any)=>{setEditId(ex.id);setForm({name:ex.name,muscle:ex.muscle||"Krūtinė",equipment:ex.equipment||"",sets:ex.sets||"3",reps:ex.reps||"10-12",description:ex.description||"",imgs:ex.imgs||[]});setFormOpen(true);};
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
        <div><div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>Pratimų biblioteka</div><div style={{color:C.muted,fontSize:13,marginTop:2}}>{exercises.length} pratimų iš viso</div></div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto"}}>+ Naujas pratimas</button>
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
                <div style={{position:"absolute",bottom:8,left:8,background:"#000c",borderRadius:6,padding:"3px 9px",fontSize:11,color:C.teal,fontWeight:600}}>{ex.muscle}</div>
              </div>
              <div style={{padding:"12px 14px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{ex.name}</div>
                <div style={{fontSize:12,color:C.muted}}>{ex.equipment}</div>
                <div style={{fontSize:12,color:C.gold,fontWeight:600}}>{ex.sets} ser. · {ex.reps} kart.</div>
                {ex.description&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{ex.description}</div>}
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
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={save} disabled={saving} style={{...css.btnG,opacity:form.name.trim()?1:0.4}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti"}</button>
        </div>
      </div></div>)}
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

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,color:C.muted,gap:12,flexDirection:"column"}}><div style={{width:28,height:28,border:`2px solid ${C.border}`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Kraunama...</div>;
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

      {/* Hero header */}
      <div style={{background:`linear-gradient(180deg,#0f1623 0%,${C.bg} 100%)`,padding:"36px 20px 28px",textAlign:"center",borderBottom:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,height:220,background:`radial-gradient(ellipse at 50% 0%,${accentColor}22 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{width:72,height:72,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontWeight:900,color:C.bg,margin:"0 auto 18px",boxShadow:`0 8px 28px ${C.gold}44`}} className="fu">{(client.name||"?")[0].toUpperCase()}</div>
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
            <div style={{fontWeight:700,color:C.gold,marginBottom:4}}>Coach Martynas</div>
            <div>Sporto & Mitybos sistema</div>
          </div>
        </div>
      )}

      {/* Meal plan view */}
      {!isTraining&&(
        <>
          <MealSharePage client={client}/>
          <div style={{textAlign:"center",color:C.muted,fontSize:11,padding:"16px 16px 32px",borderTop:`1px solid ${C.border}`,maxWidth:560,margin:"0 auto"}}>
            <div style={{fontWeight:700,color:C.gold,marginBottom:4}}>Coach Martynas</div>
            <div>Sporto & Mitybos sistema</div>
          </div>
        </>
      )}
    </div>
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

  const load=useCallback(async()=>{setLoading(true);setError("");try{setClients(await sb.get("clients","?order=name"));}catch(e:any){setError("Klaida: "+e.message);}finally{setLoading(false);};},[]);
  useEffect(()=>{load();},[load]);
  const loadProgress=async(cid:any)=>{setProgLoading(true);try{setProgressList(await sb.get("progress",`?client_id=eq.${cid}&order=date.desc`));}catch(e){console.error(e);}finally{setProgLoading(false);};};
  const openView=(c:any)=>{setView(c);loadProgress(c.id);};
  const openNew=()=>{setEditClientId(null);setClientForm({...emptyClient});setProgram({});setProgramName("");setMealPlan({});setMealPlanName("");setStep(1);setClientFormOpen(true);};
  const openEdit=(c:any)=>{
    setEditClientId(c.id);
    setClientForm({name:c.name||"",age:c.age||"",weight:c.weight||"",height:c.height||"",gender:c.gender||"Vyras",goal:c.goal||"",level:c.level||"",notes:c.notes||"",training_days:c.training_days||[],activity_index:c.activity_index??2});
    setProgram(c.program||{});setProgramName(c.program_name||"");
    setMealPlan(c.meal_plan||{});setMealPlanName(c.meal_plan_name||"");
    setStep(1);setClientFormOpen(true);setView(null);
  };
  const saveClient=async()=>{
    if(!clientForm.name.trim())return;setSaving(true);
    const data={...clientForm,program,program_name:programName,meal_plan:mealPlan,meal_plan_name:mealPlanName};
    try{if(editClientId)await sb.update("clients",editClientId,data);else await sb.insert("clients",data);setClientFormOpen(false);await load();}
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
  const addToDay=()=>{if(!pickedEx)return;setProgram((p:any)=>({...p,[pickDay]:[...(p[pickDay]||[]),{...pickedEx,customSets:pickSets||pickedEx.sets,customReps:pickReps||pickedEx.reps,customWeight:pickWeight||"",customRest:pickRest||""}]}));setPickDay(null);};
  const removeFromDay=(day:string,idx:number)=>setProgram((p:any)=>({...p,[day]:p[day].filter((_:any,i:number)=>i!==idx)}));
  const openShareModal=async(c:any)=>{
    let token=c.share_token;
    if(!token){token=genToken();await sb.update("clients",c.id,{share_token:token});await load();}
    setShareModal({client:c,token});
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
        <div><div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>Klientų duomenų bazė</div><div style={{color:C.muted,fontSize:13,marginTop:2}}>{clients.length} klientų</div></div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto"}}>+ Naujas klientas</button>
      </div>
      <Err msg={error}/>
      {clients.length>0&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti kliento..." style={{...css.input,maxWidth:360,marginBottom:16}}/>}
      {loading?<Spinner/>:(
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
              const dayCount=Object.values(c.program||{}).filter((d:any)=>d.length>0).length;
              const exCount=Object.values(c.program||{}).reduce((s:any,d:any)=>s+d.length,0);
              return(
                <div key={c.id} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <div style={{background:C.faint,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:C.bg,flexShrink:0}}>{(c.name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.text}}>{c.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.program_name||"Programa"} · {new Date(c.created_at).toLocaleDateString("lt-LT")}</div>
                    </div>
                    {c.meal_plan_name&&<span title="Turi mitybos planą" style={{fontSize:16}}>🥗</span>}
                  </div>
                  <div style={{padding:"10px 16px",display:"flex",flexWrap:"wrap",gap:6}}>
                    {c.age&&<div style={{background:C.faint,borderRadius:7,padding:"3px 9px",fontSize:11}}><span style={{color:C.muted}}>Amžius </span><b style={{color:C.text}}>{c.age} m.</b></div>}
                    {c.weight&&<div style={{background:C.faint,borderRadius:7,padding:"3px 9px",fontSize:11}}><span style={{color:C.muted}}>Svoris </span><b style={{color:C.text}}>{c.weight} kg</b></div>}
                    {bmiN&&<div style={{background:C.faint,borderRadius:7,padding:"3px 9px",fontSize:11}}><span style={{color:C.muted}}>KMI </span><b style={{color:bmiCat(bmiN).color}}>{bmiN}</b></div>}
                    {c.goal&&<Badge label={c.goal} color={C.gold}/>}
                    {c.level&&<Badge label={c.level} color={C.teal}/>}
                  </div>
                  <div style={{padding:"0 16px 10px",display:"flex",gap:12}}>
                    <div style={{fontSize:11,color:C.muted}}>📅 <b style={{color:C.text}}>{dayCount}</b> dienų</div>
                    <div style={{fontSize:11,color:C.muted}}>🏋️ <b style={{color:C.text}}>{exCount}</b> pratimų</div>
                  </div>
                  <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:7}}>
                    <button onClick={()=>openView(c)} style={{...css.btnTeal,flex:1,justifyContent:"center"}}>👁️ Peržiūrėti</button>
                    <button onClick={()=>openEdit(c)} style={{...css.btnG,flex:1,padding:"7px 10px",fontSize:12}}>✏️ Redaguoti</button>
                    <button onClick={()=>openShareModal(c)} style={{...css.btnGhost,padding:"7px 10px"}} title="Nuoroda klientui">🔗</button>
                    <button onClick={()=>setConfirmDel(c)} style={css.btnRed}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Share modal */}
      {shareModal&&(<div style={css.overlay}><div style={css.modal(480)}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.gold}}>🔗 Nuorodos klientui</div>
          <button onClick={()=>setShareModal(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:C.faint,borderRadius:10,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:"uppercase" as const,letterSpacing:"0.08em",fontWeight:600}}>Klientas</div>
            <div style={{fontSize:18,fontWeight:800,color:C.text}}>{shareModal.client.name}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>🏋️ Treniruočių programa</div>
            <div style={{background:C.faint,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{flex:1,fontSize:11,color:C.teal,wordBreak:"break-all" as const}}>{baseUrl}?share={shareModal.token}&type=training</span>
              <button onClick={()=>navigator.clipboard?.writeText(`${baseUrl}?share=${shareModal.token}&type=training`)} style={{...css.btnTeal,padding:"5px 10px",fontSize:11,flexShrink:0}}>📋 Kopijuoti</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>🥗 Mitybos planas</div>
            <div style={{background:C.faint,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{flex:1,fontSize:11,color:C.green,wordBreak:"break-all" as const}}>{baseUrl}?share={shareModal.token}&type=nutrition</span>
              <button onClick={()=>navigator.clipboard?.writeText(`${baseUrl}?share=${shareModal.token}&type=nutrition`)} style={{...css.btnGreen,padding:"5px 10px",fontSize:11,flexShrink:0}}>📋 Kopijuoti</button>
            </div>
          </div>
          <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:9,padding:"10px 14px",fontSize:12,color:C.gold}}>
            💡 Nuorodos yra viešos — klientas gali jas atidaryti telefone be slaptažodžio.
          </div>
        </div>
      </div></div>)}

      {/* Client detail view */}
      {view&&(<div style={css.overlay}><div style={{...css.modal(880)}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:C.bg,flexShrink:0}}>{(view.name||"?")[0].toUpperCase()}</div>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>{view.name}</div>
            <button onClick={()=>setView(null)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
          </div>
          <div className="view-actions">
            <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>📈 Pažanga</button>
            <button onClick={()=>openEdit(view)} style={{...css.btnG,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 12px",fontSize:12}}>✏️ Redaguoti</button>
            <button onClick={()=>openShareModal(view)} style={{...css.btnGhost,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12}}>🔗 Nuoroda</button>
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
            <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
              <span style={{...css.secTitle,marginBottom:0}}>📈 Pažangos istorija</span>
              <button onClick={()=>setProgFormOpen(true)} style={{...css.btnTeal,marginLeft:"auto",fontSize:11}}>+ Pridėti</button>
            </div>
            {progLoading?<Spinner/>:progressList.length===0?<div style={{textAlign:"center",color:C.muted,padding:"14px 0",fontSize:13}}>Pažangos įrašų dar nėra.</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {progressList.map((p:any)=>(
                  <div key={p.id} style={{background:C.faint,borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
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
            )}
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
                      <div style={{width:32,height:32,borderRadius:6,overflow:"hidden",background:C.border,flexShrink:0}}>{(ex.imgs||[]).filter(Boolean)[0]?<img src={(ex.imgs||[])[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>}</div>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{ex.name}</div><div style={{fontSize:10,color:C.teal}}>{ex.muscle}</div></div>
                      <div style={{display:"flex",gap:4}}>{ex.customSets&&<span style={{fontSize:10,color:C.gold,fontWeight:700}}>{ex.customSets}s</span>}{ex.customReps&&<span style={{fontSize:10,color:C.muted}}>{ex.customReps}r</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>);
          })}
          {/* Meal plan summary */}
          {view.meal_plan_name&&<>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginTop:16,marginBottom:10}}>🥗 {view.meal_plan_name}</div>
            {DAYS.filter(d=>(view.training_days||[]).includes(d)).map(day=>{
              const dayData=(view.meal_plan||{})[day]||{};
              const tot=Object.values(dayData).flat().reduce((a:any,f:any)=>({kcal:a.kcal+(f.kcalActual||0),prot:a.prot+(f.protActual||0)}),{kcal:0,prot:0}) as any;
              return(<div key={day} style={{...css.card,marginBottom:7,padding:"10px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:C.green}}/>
                  <span style={{fontWeight:700,fontSize:11,textTransform:"uppercase" as const}}>{day}</span>
                  {tot.kcal>0&&<span style={{marginLeft:"auto",fontSize:11,color:C.gold,fontWeight:600}}>{Math.round(tot.kcal)} kcal · P:{Math.round(tot.prot)}g</span>}
                </div>
                {Object.entries(dayData).map(([mt,items]:any)=>{
                  if(!items.length)return null;
                  return(<div key={mt} style={{fontSize:11,color:C.muted,padding:"2px 0"}}><b style={{color:C.green}}>{mt}:</b> {items.map((f:any)=>f.name).join(", ")}</div>);
                })}
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
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:14,color:C.gold}}>{editClientId?"✏️ Redaguoti klientą":"➕ Naujas klientas"}</div>
          <div className="step-nav" style={{marginLeft:"auto"}}>
            {[["1","Info"],["2","Treniruotės"],["3","Mityba"],["4","Peržiūra"]].map(([n,l])=>(
              <button key={n} style={{...css.navBtn(step===+n),padding:"5px 11px",fontSize:11}} onClick={()=>setStep(+n)}><b>{n}.</b> {l}</button>
            ))}
            <button onClick={()=>setClientFormOpen(false)} style={{width:27,height:27,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:14,marginLeft:5}}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:18,flex:1}}>
          {/* Step 1 — Info */}
          {step===1&&(<div className="cf-grid" style={{}}>
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
          </div>)}

          {/* Step 2 — Training */}
          {step===2&&(<div>
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

          {/* Step 3 — Meal plan */}
          {step===3&&(<div>
            <div style={{marginBottom:14}}><span style={css.label}>Mitybos plano pavadinimas</span><input value={mealPlanName} onChange={e=>setMealPlanName(e.target.value)} placeholder="pvz. Tomo mitybos planas" style={{...css.input,maxWidth:380}}/></div>
            <MealPlanBuilder days={trainingDays} mealPlan={mealPlan} setMealPlan={setMealPlan} foods={foods}/>
          </div>)}

          {/* Step 4 — Preview */}
          {step===4&&(<div>
            <div style={{...css.card,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:48,height:48,background:`linear-gradient(135deg,${C.gold},#e8961a)`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:C.bg,flexShrink:0}}>{(clientForm.name||"?")[0].toUpperCase()}</div>
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
          <div style={{display:"flex",gap:8}}>{step>1&&<button onClick={()=>setStep(s=>s-1)} style={css.btnGhost}>← Atgal</button>}{step<4&&<button onClick={()=>setStep(s=>s+1)} style={css.btnG}>Tęsti →</button>}</div>
          {step===4&&<button onClick={saveClient} disabled={saving} style={css.btnG}>{saving?"⏳ Saugoma...":"💾 Išsaugoti klientą"}</button>}
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
          <button onClick={addToDay} style={{...css.btnG,alignSelf:"flex-end"}}>Pridėti +</button>
        </div>)}
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

// ── MAIN APP ──────────────────────────────────────────────
export default function App(){
  const params=new URLSearchParams(window.location.search);
  const shareToken=params.get("share");
  const shareType=params.get("type")||"training";
  if(shareToken)return <SharePage token={shareToken} type={shareType}/>;

  const [loggedIn,setLoggedIn]=useState(()=>sessionStorage.getItem("cm_auth")==="1");
  const [tab,setTab]=useState("dashboard");
  const [autoOpen,setAutoOpen]=useState(false);
  const [exercises,setExercises]=useState<any[]>([]);
  const [foods,setFoods]=useState<any[]>([]);

  const handleLogin=()=>{sessionStorage.setItem("cm_auth","1");setLoggedIn(true);};
  const handleLogout=()=>{sessionStorage.removeItem("cm_auth");setLoggedIn(false);};

  useEffect(()=>{
    if(!loggedIn)return;
    sb.get("exercises","?order=name").then(d=>setExercises(d)).catch(()=>{});
    sb.get("foods","?order=name").then(d=>setFoods(d)).catch(()=>{});
  },[loggedIn]);

  const navigate=(t:string,open=false)=>{setTab(t);setAutoOpen(open);setTimeout(()=>setAutoOpen(false),100);};

  if(!loggedIn)return<LoginScreen onLogin={handleLogin}/>;

  const NAV=[
    {id:"dashboard",icon:"🏠",label:"Pradžia"},
    {id:"clients",icon:"👥",label:"Klientai"},
    {id:"exercises",icon:"🏋️",label:"Pratimai"},
    {id:"foods",icon:"🥗",label:"Mityba"},
  ];

  return(
    <div style={css.page}>
      <style>{RESPONSIVE_CSS}</style>
      <div style={css.header} className="header-pad">
        <div style={css.logo}>M</div>
        <div>
          <div style={{fontWeight:900,fontSize:15,color:C.gold,letterSpacing:"-0.01em"}}>Coach Martynas</div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1}} className="hsubtitle">Sporto & Mitybos sistema</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
          {NAV.map(n=>(
            <button key={n.id} style={css.navBtn(tab===n.id)} onClick={()=>navigate(n.id)}>
              <span>{n.icon}</span> <span className="logout-label">{n.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} style={{...css.btnGhost,fontSize:11,padding:"6px 10px",marginLeft:4}}>
            <span className="logout-label">🚪 </span>Atsijungti
          </button>
        </div>
      </div>
      <div className="content-pad" style={{maxWidth:1140,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="dashboard"  && <DashboardTab onNav={navigate}/>}
        {tab==="exercises"  && <ExercisesTab key={tab+autoOpen} autoOpen={autoOpen}/>}
        {tab==="foods"      && <FoodsTab key={tab+autoOpen} autoOpen={autoOpen} onFoodsLoaded={setFoods}/>}
        {tab==="clients"    && <ClientsTab key={tab+autoOpen} exercises={exercises} foods={foods} autoOpen={autoOpen}/>}
      </div>
    </div>
  );
}
