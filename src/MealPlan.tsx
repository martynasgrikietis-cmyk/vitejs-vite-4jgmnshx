// ── MealPlan.tsx — Foods library + Meal plan builder ──────
import { useState, useCallback, useEffect } from "react";
import { sb, C, FONT, FOOD_CATS, MEAL_TIMES, DAYS, css, Tag, Spinner, Err, NutriBadge, ImgGallery, MultiImgUploader } from "./shared";

const emptyFoodForm = {name:"",category:"Mėsa & Žuvis",calories:"",protein:"",carbs:"",fat:"",portion:"100",unit:"g",description:"",imgs:[] as string[]};

// ── FOODS TAB ─────────────────────────────────────────────
export function FoodsTab({autoOpen=false,onFoodsLoaded}:{autoOpen?:boolean,onFoodsLoaded?:(f:any[])=>void}){
  const [foods,setFoods]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("Visos");
  const [formOpen,setFormOpen]=useState(autoOpen);
  const [editId,setEditId]=useState<any>(null);
  const [form,setForm]=useState({...emptyFoodForm});
  const [saving,setSaving]=useState(false);
  const [confirmDel,setConfirmDel]=useState<any>(null);

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{const d=await sb.get("foods","?order=name");setFoods(d);onFoodsLoaded&&onFoodsLoaded(d);}
    catch(e:any){setError("Klaida: "+e.message);}
    finally{setLoading(false);}
  },[onFoodsLoaded]);
  useEffect(()=>{load();},[load]);

  const openNew=()=>{setEditId(null);setForm({...emptyFoodForm});setFormOpen(true);};
  const openEdit=(f:any)=>{setEditId(f.id);setForm({name:f.name,category:f.category||"Mėsa & Žuvis",calories:f.calories||"",protein:f.protein||"",carbs:f.carbs||"",fat:f.fat||"",portion:f.portion||"100",unit:f.unit||"g",description:f.description||"",imgs:f.imgs||[]});setFormOpen(true);};
  const save=async()=>{
    if(!form.name.trim())return;setSaving(true);
    try{if(editId)await sb.update("foods",editId,form);else await sb.insert("foods",form);setFormOpen(false);await load();}
    catch(e:any){alert("Klaida: "+e.message);}finally{setSaving(false);}
  };
  const del=async(id:any)=>{try{await sb.delete("foods",id);setConfirmDel(null);await load();}catch(e:any){alert("Klaida: "+e.message);}};
  const filtered=foods.filter(f=>(cat==="Visos"||f.category===cat)&&f.name.toLowerCase().includes(search.toLowerCase()));

  return(
    <div>
      <div style={{display:"flex",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>Maisto produktų biblioteka</div>
          <div style={{color:C.muted,fontSize:13,marginTop:2}}>{foods.length} produktų iš viso</div>
        </div>
        <button onClick={openNew} style={{...css.btnG,marginLeft:"auto",background:C.green,color:C.bg}}>+ Naujas produktas</button>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti produktų..." className="sbar" style={{...css.input,width:220}}/>
        <div className="tag-row" style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Visos",...FOOD_CATS].map(c=><Tag key={c} c={C.green} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}
        </div>
        <button onClick={load} style={{...css.btnGhost,marginLeft:"auto",fontSize:11}}>↺</button>
      </div>
      <Err msg={error}/>
      {loading?<Spinner/>:(
        <div className="food-grid" style={{}}>
          {filtered.map(f=>(
            <div key={f.id} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{position:"relative"}}>
                <ImgGallery imgs={f.imgs} height={130}/>
                <div style={{position:"absolute",bottom:8,left:8,background:"#000c",borderRadius:6,padding:"3px 9px",fontSize:10,color:C.green,fontWeight:600}}>{f.category}</div>
              </div>
              <div style={{padding:"12px 14px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
                <div style={{fontWeight:700,fontSize:13,color:C.text}}>{f.name}</div>
                <div style={{fontSize:11,color:C.muted}}>Per {f.portion||100}{f.unit||"g"}</div>
                <NutriBadge kcal={f.calories} p={f.protein} c={f.carbs} f={f.fat}/>
                {f.description&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{f.description}</div>}
                <div style={{display:"flex",gap:7,marginTop:"auto",paddingTop:8}}>
                  <button style={css.btnTeal} onClick={()=>openEdit(f)}>✏️ Redaguoti</button>
                  <button style={css.btnRed} onClick={()=>setConfirmDel(f)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0&&!loading&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:60,fontSize:13}}>Produktų nerasta. Pridėkite pirmą produktą!</div>}
        </div>
      )}

      {/* Food Form Modal */}
      {formOpen&&(<div style={css.overlay}><div style={css.modal(580)}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.green}}>{editId?"✏️ Redaguoti produktą":"➕ Naujas maisto produktas"}</div>
          <button onClick={()=>setFormOpen(false)} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14}} className="modal-inner">
          <MultiImgUploader imgs={form.imgs} onChange={(fn:any)=>setForm(p=>({...p,imgs:typeof fn==="function"?fn(p.imgs):fn}))}/>
          <div><span style={css.label}>Pavadinimas *</span><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={css.input} placeholder="pvz. Vištienos krūtinėlė"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><span style={css.label}>Kategorija</span><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={css.select}>{FOOD_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
              <div><span style={css.label}>Porcija</span><input type="number" value={form.portion} onChange={e=>setForm(p=>({...p,portion:e.target.value}))} style={css.input} placeholder="100"/></div>
              <div><span style={css.label}>Vnt.</span><select value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} style={css.select}><option>g</option><option>ml</option><option>vnt.</option></select></div>
            </div>
          </div>
          <div>
            <span style={css.label}>🔥 Maistingumo vertė (per porciją)</span>
            <div className="food4-grid" style={{}}>
              <div><span style={{...css.label,color:C.gold}}>Kalorijos (kcal)</span><input type="number" value={form.calories} onChange={e=>setForm(p=>({...p,calories:e.target.value}))} style={{...css.input,borderColor:"#f0b42940"}} placeholder="0"/></div>
              <div><span style={{...css.label,color:"#f87171"}}>Baltymai (g)</span><input type="number" value={form.protein} onChange={e=>setForm(p=>({...p,protein:e.target.value}))} style={{...css.input,borderColor:"#ef444440"}} placeholder="0"/></div>
              <div><span style={{...css.label,color:"#fb923c"}}>Angliavandeniai (g)</span><input type="number" value={form.carbs} onChange={e=>setForm(p=>({...p,carbs:e.target.value}))} style={{...css.input,borderColor:"#f9731640"}} placeholder="0"/></div>
              <div><span style={{...css.label,color:C.purple}}>Riebalai (g)</span><input type="number" value={form.fat} onChange={e=>setForm(p=>({...p,fat:e.target.value}))} style={{...css.input,borderColor:"#a78bfa40"}} placeholder="0"/></div>
            </div>
          </div>
          <div><span style={css.label}>Aprašymas / pastabos</span><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{...css.input,resize:"none"}} placeholder="Papildoma informacija..."/></div>
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={save} disabled={saving} style={{...css.btnG,background:C.green,color:C.bg,opacity:form.name.trim()?1:0.4}}>{saving?"⏳ Saugoma...":"💾 Išsaugoti"}</button>
        </div>
      </div></div>)}

      {/* Confirm Delete */}
      {confirmDel&&(<div style={css.overlay}><div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.redBorder}`,padding:28,maxWidth:340,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>🗑️</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:C.text}}>Ištrinti produktą?</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:20}}>„{confirmDel.name}" bus ištrintas visam laikui.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
          <button onClick={()=>del(confirmDel.id)} style={{...css.btnG,background:C.red,color:"#fff"}}>Ištrinti</button>
        </div>
      </div></div>)}
    </div>
  );
}

// ── MEAL PLAN BUILDER (used inside client form step 3) ────
export function MealPlanBuilder({
  days, mealPlan, setMealPlan, foods,
}:{days:string[],mealPlan:any,setMealPlan:any,foods:any[]}){
  const [pickCtx,setPickCtx]=useState<any>(null); // {day, mt}
  const [pickSearch,setPickSearch]=useState("");
  const [pickCat,setPickCat]=useState("Visos");
  const [pickedFood,setPickedFood]=useState<any>(null);
  const [pickGrams,setPickGrams]=useState("100");

  const openPick=(day:string,mt:string)=>{setPickCtx({day,mt});setPickedFood(null);setPickGrams("100");setPickSearch("");setPickCat("Visos");};
  const foodList=foods.filter(f=>(pickCat==="Visos"||f.category===pickCat)&&f.name.toLowerCase().includes(pickSearch.toLowerCase()));
  const dayTotals=(day:string)=>Object.values(mealPlan[day]||{}).flat().reduce((acc:any,f:any)=>({kcal:acc.kcal+(f.kcalActual||0),prot:acc.prot+(f.protActual||0),carbs:acc.carbs+(f.carbsActual||0),fat:acc.fat+(f.fatActual||0)}),{kcal:0,prot:0,carbs:0,fat:0}) as any;

  const addFood=()=>{
    if(!pickedFood||!pickCtx)return;
    const g=parseFloat(pickGrams)||100;
    const r=g/(parseFloat(pickedFood.portion)||100);
    const entry={...pickedFood,grams:g,kcalActual:Math.round((pickedFood.calories||0)*r),protActual:+(((pickedFood.protein||0)*r).toFixed(1)),carbsActual:+(((pickedFood.carbs||0)*r).toFixed(1)),fatActual:+(((pickedFood.fat||0)*r).toFixed(1))};
    setMealPlan((p:any)=>({...p,[pickCtx.day]:{...(p[pickCtx.day]||{}),[pickCtx.mt]:[...((p[pickCtx.day]||{})[pickCtx.mt]||[]),entry]}}));
    setPickCtx(null);
  };
  const removeFood=(day:string,mt:string,idx:number)=>setMealPlan((p:any)=>({...p,[day]:{...(p[day]||{}),[mt]:(p[day]||{})[mt].filter((_:any,i:number)=>i!==idx)}}));

  if(days.length===0)return<div style={{...css.card,textAlign:"center",color:C.muted,padding:36}}>Grįžkite į 1 žingsnį ir pasirinkite treniruočių dienas.</div>;

  return(
    <div>
      <div className="meal-grid" style={{}}>
        {days.map(day=>{
          const t=dayTotals(day);
          return(
            <div key={day} style={{...css.card,padding:14}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:6}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:C.green}}/>
                <span style={{fontWeight:800,fontSize:11,textTransform:"uppercase" as const,letterSpacing:"0.08em",color:C.text}}>{day}</span>
                {t.kcal>0&&<span style={{marginLeft:"auto",fontSize:10,color:C.gold,fontWeight:700}}>{Math.round(t.kcal)} kcal</span>}
              </div>
              {t.kcal>0&&(
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                  <NutriBadge kcal={Math.round(t.kcal)} p={Math.round(t.prot)} c={Math.round(t.carbs)} f={Math.round(t.fat)}/>
                </div>
              )}
              {MEAL_TIMES.map(mt=>{
                const items=(mealPlan[day]||{})[mt]||[];
                const mtKcal=items.reduce((a:any,f:any)=>a+(f.kcalActual||0),0);
                return(
                  <div key={mt} style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",fontSize:11,fontWeight:700,color:C.green,marginBottom:5,gap:6}}>
                      <span>{mt}</span>
                      {mtKcal>0&&<span style={{color:C.muted,fontWeight:500,fontSize:10}}>{Math.round(mtKcal)} kcal</span>}
                      <button onClick={()=>openPick(day,mt)} style={{...css.btnGreen,padding:"2px 8px",fontSize:10,marginLeft:"auto"}}>+ Pridėti</button>
                    </div>
                    {items.map((f:any,i:number)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:7,background:C.faint,borderRadius:7,padding:"6px 9px",marginBottom:3}}>
                        {(f.imgs||[]).filter(Boolean)[0]?<img src={f.imgs[0]} alt="" style={{width:30,height:30,borderRadius:6,objectFit:"cover",flexShrink:0}}/>:<div style={{width:30,height:30,background:C.border,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🍽️</div>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
                          <div style={{fontSize:10,color:C.muted}}>{f.grams}g · {f.kcalActual} kcal</div>
                        </div>
                        <button onClick={()=>removeFood(day,mt,i)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:14,padding:"0 2px",flexShrink:0}}>×</button>
                      </div>
                    ))}
                    {items.length===0&&<div style={{fontSize:10,color:C.muted,padding:"2px 4px",fontStyle:"italic"}}>Tuščia</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Food picker modal */}
      {pickCtx&&(<div style={{...css.overlay,zIndex:300}}><div style={css.modal(800)}>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:13,color:C.green}}>🥗 {pickCtx.mt} — {pickCtx.day}</div>
          <button onClick={()=>setPickCtx(null)} style={{marginLeft:"auto",width:26,height:26,background:C.faint,border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
        </div>
        <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.faint}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input value={pickSearch} onChange={e=>setPickSearch(e.target.value)} placeholder="🔍 Ieškoti..." style={{...css.input,width:170}}/>
          <div className="tag-row" style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["Visos",...FOOD_CATS].map(c=><Tag key={c} c={C.green} label={c} active={pickCat===c} onClick={()=>setPickCat(c)}/>)}
          </div>
        </div>
        <div style={{overflowY:"auto",padding:10,flex:1}}>
          {foods.length===0?(
            <div style={{textAlign:"center",color:C.muted,padding:40}}>
              <div style={{fontSize:32,marginBottom:12}}>🍽️</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:8}}>Maisto biblioteka tuščia</div>
              <div style={{fontSize:12}}>Pirmiausia pridėkite produktų skiltyje „🥗 Mityba"</div>
            </div>
          ):(
            <div className="pick-grid" style={{}}>
              {foodList.map(f=>(
                <div key={f.id} onClick={()=>setPickedFood(f)} style={{background:C.faint,borderRadius:10,border:pickedFood?.id===f.id?`2px solid ${C.green}`:`1px solid ${C.border}`,cursor:"pointer",overflow:"hidden",position:"relative"}}>
                  <ImgGallery imgs={f.imgs} height={80}/>
                  {pickedFood?.id===f.id&&<div style={{position:"absolute",top:5,right:5,width:18,height:18,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:C.bg,fontSize:10}}>✓</div>}
                  <div style={{padding:"7px 9px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:3}}>{f.name}</div>
                    <NutriBadge kcal={f.calories} p={f.protein} c={f.carbs} f={f.fat}/>
                  </div>
                </div>
              ))}
              {foodList.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:C.muted,padding:36}}>Nerasta</div>}
            </div>
          )}
        </div>
        {pickedFood&&(
          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.faint,display:"flex",alignItems:"flex-end",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:130}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{pickedFood.name}</div>
              <NutriBadge kcal={pickedFood.calories} p={pickedFood.protein} c={pickedFood.carbs} f={pickedFood.fat}/>
              <div style={{fontSize:10,color:C.muted,marginTop:3}}>Etalonu: {pickedFood.portion||100}{pickedFood.unit||"g"}</div>
            </div>
            <div>
              <span style={css.label}>Gramų kiekis</span>
              <input type="number" value={pickGrams} onChange={e=>setPickGrams(e.target.value)} style={{...css.input,width:95,textAlign:"center",color:C.green}}/>
            </div>
            <div style={{fontSize:12,color:C.muted,alignSelf:"center",minWidth:80}}>
              ≈ <b style={{color:C.gold}}>{Math.round((pickedFood.calories||0)*(parseFloat(pickGrams)||100)/(parseFloat(pickedFood.portion)||100))}</b> kcal
            </div>
            <button onClick={addFood} style={{...css.btnG,background:C.green,color:C.bg,alignSelf:"flex-end"}}>Pridėti +</button>
          </div>
        )}
      </div></div>)}
    </div>
  );
}

// ── CLIENT SHARE — Meal plan public view ─────────────────
export function MealSharePage({client}:{client:any}){
  const trainingDays=DAYS.filter(d=>(client.training_days||[]).includes(d));

  return(
    <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px"}}>
      {trainingDays.map((day,di)=>{
        const mealDay=(client.meal_plan||{})[day]||{};
        const totals=Object.values(mealDay).flat().reduce((acc:any,f:any)=>({kcal:acc.kcal+(f.kcalActual||0),prot:acc.prot+(f.protActual||0),carbs:acc.carbs+(f.carbsActual||0),fat:acc.fat+(f.fatActual||0)}),{kcal:0,prot:0,carbs:0,fat:0}) as any;
        return(
          <div key={day} style={{marginBottom:20}} className={`fu${Math.min(di+1,4)}`}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.green,flexShrink:0}}/>
              <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase" as const,letterSpacing:"0.12em",color:C.green}}>{day}</div>
            </div>
            {totals.kcal>0&&(
              <div style={{marginBottom:10}}>
                <NutriBadge kcal={Math.round(totals.kcal)} p={Math.round(totals.prot)} c={Math.round(totals.carbs)} f={Math.round(totals.fat)}/>
              </div>
            )}
            {MEAL_TIMES.map(mt=>{
              const items=mealDay[mt]||[];
              if(!items.length)return null;
              const mtKcal=items.reduce((a:any,f:any)=>a+(f.kcalActual||0),0);
              return(
                <div key={mt} style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:10,overflow:"hidden"}}>
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.text}}>{mt}</span>
                    {mtKcal>0&&<span style={{marginLeft:"auto",fontSize:11,color:C.gold,fontWeight:600}}>{Math.round(mtKcal)} kcal</span>}
                  </div>
                  {items.map((f:any,i:number)=>{
                    const fImgs=(f.imgs||[]).filter(Boolean);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:i<items.length-1?`1px solid ${C.faint}`:"none"}}>
                        {fImgs[0]
                          ?<img src={fImgs[0]} alt={f.name} style={{width:60,height:60,borderRadius:12,objectFit:"cover",flexShrink:0}}/>
                          :<div style={{width:60,height:60,background:C.faint,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🍽️</div>
                        }
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{f.name}</div>
                          <div style={{fontSize:12,color:C.muted,marginBottom:5}}>{f.grams}g · {f.category}</div>
                          <NutriBadge kcal={f.kcalActual} p={f.protActual} c={f.carbsActual} f={f.fatActual}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
