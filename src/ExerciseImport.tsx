// ── ExerciseImport.tsx — CSV import + built-in exercise library ──
import { useState, useRef } from "react";
import { sb, C, FONT, css, ALL_MUSCLES, Spinner } from "./shared";

// ── BUILT-IN EXERCISE LIBRARY ─────────────────────────────
// 100+ common exercises with Wikimedia/public domain image URLs
const LIBRARY: any[] = [
  // Krūtinė
  {name:"Štangos spaudimas gulint",muscle:"Krūtinė",equipment:"Štanga",sets:"4",reps:"8-10",description:"Gulint ant suolo, nuleisti štangą iki krūtinės ir išspausti.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Bench_press_2.jpg/320px-Bench_press_2.jpg"]},
  {name:"Hantelių spaudimas gulint",muscle:"Krūtinė",equipment:"Hanteliai",sets:"3",reps:"10-12",description:"Gulint ant suolo su hanteliais, spausti tiesiai aukštyn.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Dumbbell_bench_press.jpg/320px-Dumbbell_bench_press.jpg"]},
  {name:"Atsispaudimai nuo grindų",muscle:"Krūtinė",equipment:"Kūno svoris",sets:"3",reps:"15-20",description:"Klasikiniai atsispaudimai — kūnas tiesus, rankos pečių plotyje.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Push_up.jpg/320px-Push_up.jpg"]},
  {name:"Kabelinis skraidymas",muscle:"Krūtinė",equipment:"Kabeliai",sets:"3",reps:"12-15",description:"Stovint tarp kabelių, sukelti rankas į priekį ir vidurį.",video_url:"",imgs:[]},
  {name:"Nuožulnus štangos spaudimas",muscle:"Krūtinė",equipment:"Štanga",sets:"4",reps:"8-10",description:"Suolas pakrypęs 30-45°, spausti štangą virš viršutinės krūtinės dalies.",video_url:"",imgs:[]},
  {name:"Hantelių skraidymas",muscle:"Krūtinė",equipment:"Hanteliai",sets:"3",reps:"12-15",description:"Gulint ant suolo, plačiai nuleisti hanteles į šonus ir sukelti.",video_url:"",imgs:[]},
  {name:"Mašinos krūtinės spaudimas",muscle:"Krūtinė",equipment:"Treniruoklis",sets:"3",reps:"12-15",description:"Spausti ranksenas tiesiai į priekį mašinoje.",video_url:"",imgs:[]},
  {name:"Atsispaudimai ant brūsnų",muscle:"Krūtinė",equipment:"Brūsnai",sets:"3",reps:"10-12",description:"Laikantis brūsnų, lėtai leistis žemyn ir kilti aukštyn.",video_url:"",imgs:[]},

  // Nugara
  {name:"Traukimas prie krūtinės sėdint",muscle:"Nugara",equipment:"Kabeliai",sets:"4",reps:"10-12",description:"Sėdint, traukti kabelį prie apatinės krūtinės dalies.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seated_cable_row.jpg/320px-Seated_cable_row.jpg"]},
  {name:"Irklavimas su štanga",muscle:"Nugara",equipment:"Štanga",sets:"4",reps:"8-10",description:"Sulenktas pirmyn 45°, traukti štangą prie pilvo.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bent_over_row.jpg/320px-Bent_over_row.jpg"]},
  {name:"Patraukimai iki smakro",muscle:"Nugara",equipment:"Kabeliai",sets:"3",reps:"10-12",description:"Traukti kabelį nuo viršaus iki krūtinės.",video_url:"",imgs:[]},
  {name:"Hantelio irklavimas viena ranka",muscle:"Nugara",equipment:"Hanteliai",sets:"3",reps:"10-12",description:"Atsirėmęs į suolą, traukti hantelį prie šono.",video_url:"",imgs:[]},
  {name:"Atsitempimas ant kartaus",muscle:"Nugara",equipment:"Kartas",sets:"3",reps:"6-10",description:"Tvirtai laikytis karto, traukti smakrą aukščiau karto.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Pull_up_2.jpg/320px-Pull_up_2.jpg"]},
  {name:"Nugaros pratęsimas",muscle:"Nugara",equipment:"Treniruoklis",sets:"3",reps:"15",description:"Ant nugaros pratęsimo suolo lenkti ir tiesti nugarą.",video_url:"",imgs:[]},
  {name:"Platus traukimas prie krūtinės",muscle:"Nugara",equipment:"Kabeliai",sets:"4",reps:"10-12",description:"Sėdint, plačiai traukti plačią juostą prie krūtinės.",video_url:"",imgs:[]},
  {name:"Grifas nuleidimas sėdint",muscle:"Nugara",equipment:"Kabeliai",sets:"3",reps:"12",description:"Traukti grife prie krūtinės, alkūnės žemyn.",video_url:"",imgs:[]},

  // Kojos
  {name:"Pritūpimai su štanga",muscle:"Kojos",equipment:"Štanga",sets:"4",reps:"8-10",description:"Štanga ant pečių, leistis iki lygiagrečios su žeme padėties.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Squats.jpg/320px-Squats.jpg"]},
  {name:"Kojų spaudimas mašinoje",muscle:"Kojos",equipment:"Treniruoklis",sets:"4",reps:"10-12",description:"Sėdint mašinoje spausti platforma kojomis.",video_url:"",imgs:[]},
  {name:"Romanų atsilenkimai",muscle:"Kojos",equipment:"Štanga",sets:"3",reps:"10",description:"Štanga rankose, tiesiomis kojomis lenkti pirmyn.",video_url:"",imgs:[]},
  {name:"Kojų pratęsimas",muscle:"Kojos",equipment:"Treniruoklis",sets:"3",reps:"12-15",description:"Sėdint pratęsti kojas iki tiesios padėties.",video_url:"",imgs:[]},
  {name:"Kojų lenkimas gulint",muscle:"Kojos",equipment:"Treniruoklis",sets:"3",reps:"12-15",description:"Gulint ant pilvo, lenkti kojas prie sėdmenų.",video_url:"",imgs:[]},
  {name:"Žingsniai su hanteliais",muscle:"Kojos",equipment:"Hanteliai",sets:"3",reps:"12 kiekvienai",description:"Su hanteliais rankose žengti didelius žingsnius pirmyn.",video_url:"",imgs:[]},
  {name:"Blauzdų kėlimas stovint",muscle:"Kojos",equipment:"Treniruoklis",sets:"4",reps:"15-20",description:"Stovint ant platformos pakilti ant pirštų galų.",video_url:"",imgs:[]},
  {name:"Sumo pritūpimai",muscle:"Kojos",equipment:"Hanteliai",sets:"3",reps:"12",description:"Plačiai išskėstos kojos, kojų pirštai į šonus.",video_url:"",imgs:[]},
  {name:"Bulgarų pritūpimai",muscle:"Kojos",equipment:"Hanteliai",sets:"3",reps:"10 kiekvienai",description:"Viena koja ant suolo, leistis žemyn su hanteliais.",video_url:"",imgs:[]},
  {name:"Kettlebell svūpavimas",muscle:"Kojos",equipment:"Kettlebell",sets:"3",reps:"15",description:"Su kettlebell svūpuoti tarp kojų ir aukštyn iki pečių.",video_url:"",imgs:[]},

  // Pečiai
  {name:"Spaudimas virš galvos su štanga",muscle:"Pečiai",equipment:"Štanga",sets:"4",reps:"8-10",description:"Stovint spausti štangą tiesiai virš galvos.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Overhead_press.jpg/320px-Overhead_press.jpg"]},
  {name:"Hantelių kėlimas į šonus",muscle:"Pečiai",equipment:"Hanteliai",sets:"3",reps:"12-15",description:"Stovint kelti hanteles į šonus iki pečių lygio.",video_url:"",imgs:[]},
  {name:"Hantelių kėlimas į priekį",muscle:"Pečiai",equipment:"Hanteliai",sets:"3",reps:"12",description:"Pakaitomis kelti hanteles tiesiai į priekį iki pečių lygio.",video_url:"",imgs:[]},
  {name:"Hantelių spaudimas sėdint",muscle:"Pečiai",equipment:"Hanteliai",sets:"4",reps:"10-12",description:"Sėdint ant suolo spausti hanteles virš galvos.",video_url:"",imgs:[]},
  {name:"Užpakaliniai deltos kėlimai",muscle:"Pečiai",equipment:"Hanteliai",sets:"3",reps:"15",description:"Sulenktas pirmyn, kelti hanteles į šonus.",video_url:"",imgs:[]},
  {name:"Kabelinis kėlimas į šonus",muscle:"Pečiai",equipment:"Kabeliai",sets:"3",reps:"15",description:"Kabeliu iš žemo kelti ranką į šoną.",video_url:"",imgs:[]},
  {name:"Suplėšimas",muscle:"Pečiai",equipment:"Štanga",sets:"3",reps:"10",description:"Traukti štangą nuo grindų virš galvos vienu greitu judesiu.",video_url:"",imgs:[]},

  // Bicepsas
  {name:"Lenkimas su štanga",muscle:"Bicepsas",equipment:"Štanga",sets:"3",reps:"10-12",description:"Laikant štangą delnais aukštyn, lenkti alkūnes.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Bicep_curl.jpg/320px-Bicep_curl.jpg"]},
  {name:"Hantelių lenkimas pakaitomis",muscle:"Bicepsas",equipment:"Hanteliai",sets:"3",reps:"12 kiekvienai",description:"Pakaitomis lenkti hanteles sukant riešą.",video_url:"",imgs:[]},
  {name:"Koncentruotas lenkimas",muscle:"Bicepsas",equipment:"Hanteliai",sets:"3",reps:"12",description:"Sėdint alkūnę remti į šlaunį, lenkti hantelį.",video_url:"",imgs:[]},
  {name:"Kabelinis bicepso lenkimas",muscle:"Bicepsas",equipment:"Kabeliai",sets:"3",reps:"12-15",description:"Stovint prie kabelio lenkti rankas.",video_url:"",imgs:[]},
  {name:"Lenkimas ant Preacher suolo",muscle:"Bicepsas",equipment:"Štanga",sets:"3",reps:"10-12",description:"Alkūnės ant pagalvėlės, izoliuotas bicepso darbas.",video_url:"",imgs:[]},
  {name:"Plaktukas",muscle:"Bicepsas",equipment:"Hanteliai",sets:"3",reps:"12",description:"Lenkti hanteles neutraliu gripu — delnai vienas prieš kitą.",video_url:"",imgs:[]},

  // Tricepsas
  {name:"Tricepso pratęsimas virš galvos",muscle:"Tricepsas",equipment:"Hanteliai",sets:"3",reps:"12",description:"Vienu hantele virš galvos, lenkti alkūnes žemyn.",video_url:"",imgs:[]},
  {name:"Tricepso nuspaudimas kabeliu",muscle:"Tricepsas",equipment:"Kabeliai",sets:"3",reps:"12-15",description:"Stovint prie kabelio spausti žemyn iki tiesios rankos.",video_url:"",imgs:[]},
  {name:"Siauras spaudimas gulint",muscle:"Tricepsas",equipment:"Štanga",sets:"4",reps:"8-10",description:"Gulint siauriu gripu spausti štangą.",video_url:"",imgs:[]},
  {name:"Atsispaudimai nuo suolo",muscle:"Tricepsas",equipment:"Suolas",sets:"3",reps:"12-15",description:"Nugara prie suolo, atsispausti rankomis.",video_url:"",imgs:[]},
  {name:"Tricepso spardymas",muscle:"Tricepsas",equipment:"Hanteliai",sets:"3",reps:"12",description:"Sulenktas 90°, ištiesinti ranką atgal.",video_url:"",imgs:[]},
  {name:"Kaukolės trupintojas",muscle:"Tricepsas",equipment:"Štanga",sets:"3",reps:"10-12",description:"Gulint, lenkti štangą prie kaktos.",video_url:"",imgs:[]},

  // Pilvas
  {name:"Kėlimai sėdint",muscle:"Pilvas",equipment:"Kūno svoris",sets:"3",reps:"20",description:"Gulint ant nugaros, kelti viršutinę kūno dalį.",video_url:"",imgs:["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sit-ups.jpg/320px-Sit-ups.jpg"]},
  {name:"Planka",muscle:"Pilvas",equipment:"Kūno svoris",sets:"3",reps:"30-60 sek",description:"Išlaikyti tiesią kūno liniją remiantis alkūnėmis.",video_url:"",imgs:[]},
  {name:"Kabelinis pilvo lenkimas",muscle:"Pilvas",equipment:"Kabeliai",sets:"3",reps:"15-20",description:"Klūpant prie kabelio lenkti liemenį žemyn.",video_url:"",imgs:[]},
  {name:"Kojų kėlimas gulint",muscle:"Pilvas",equipment:"Kūno svoris",sets:"3",reps:"15",description:"Gulint ant nugaros kelti tiesias kojas iki 90°.",video_url:"",imgs:[]},
  {name:"Rusų posūkiai",muscle:"Pilvas",equipment:"Svoris",sets:"3",reps:"20",description:"Sėdint sukti liemenį į abi puses su svoriu.",video_url:"",imgs:[]},
  {name:"Šoninis planka",muscle:"Pilvas",equipment:"Kūno svoris",sets:"3",reps:"30 sek kiekvienai",description:"Remtis viena alkūne, kūnas tiesus į šoną.",video_url:"",imgs:[]},
  {name:"Kalnų alpinistas",muscle:"Pilvas",equipment:"Kūno svoris",sets:"3",reps:"20",description:"Atsispaudimų padėtyje greiti kojų kėlimai prie krūtinės.",video_url:"",imgs:[]},
  {name:"Ab ritelio riedėjimas",muscle:"Pilvas",equipment:"Ab ritelis",sets:"3",reps:"10-15",description:"Riedėti pirmyn iki tiesios linijos ir grįžti.",video_url:"",imgs:[]},
];

// CSV template columns
const CSV_COLS = ["Pavadinimas","Raumenų grupė","Inventorius","Serijos","Kartojimai","Aprašymas","Video URL","Nuotraukos URL"];
const CSV_MUSCLES = ["Krūtinė","Nugara","Kojos","Pečiai","Bicepsas","Tricepsas","Pilvas"];

function downloadTemplate(){
  const rows=[CSV_COLS.join(",")];
  // Example rows
  rows.push('Štangos spaudimas gulint,Krūtinė,Štanga,4,8-10,Gulint ant suolo spausti štangą,,https://example.com/photo.jpg');
  rows.push('Pritūpimai,Kojos,Štanga,4,8-10,Kojos pečių plotyje,,');
  const blob=new Blob(["\uFEFF"+rows.join("\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pratimai_template.csv";a.click();
}

// Parse CSV text
function parseCSV(text:string){
  const lines=text.trim().split("\n").filter(l=>l.trim());
  if(lines.length<2)return[];
  const header=lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,"").toLowerCase());
  const results:any[]=[];
  for(let i=1;i<lines.length;i++){
    const vals=lines[i].match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g)||[];
    const clean=(v:string)=>v?.trim().replace(/^"|"$/g,"").trim()||"";
    const row:any={};
    header.forEach((h,j)=>row[h]=clean(vals[j]||""));
    const name=row["pavadinimas"]||row["name"]||"";
    if(!name)continue;
    const muscle=CSV_MUSCLES.includes(row["raumenų grupė"]||row["muscle"]||"")?
      (row["raumenų grupė"]||row["muscle"]): "Krūtinė";
    results.push({
      name,
      muscle,
      equipment:row["inventorius"]||row["equipment"]||"",
      sets:row["serijos"]||row["sets"]||"3",
      reps:row["kartojimai"]||row["reps"]||"10-12",
      description:row["aprašymas"]||row["description"]||"",
      video_url:row["video url"]||row["video_url"]||"",
      imgs:(row["nuotraukos url"]||row["photo url"]||row["imgs"]||"").split(";").map((u:string)=>u.trim()).filter(Boolean),
    });
  }
  return results;
}

// ── CSV IMPORT MODAL ──────────────────────────────────────
export function CSVImportModal({onClose,onImported}:{onClose:()=>void,onImported:(n:number)=>void}){
  const fileRef=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState<any[]>([]);
  const [importing,setImporting]=useState(false);
  const [done,setDone]=useState(0);
  const [error,setError]=useState("");

  const handleFile=(e:any)=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const text=(ev.target as any).result as string;
      const parsed=parseCSV(text);
      if(parsed.length===0){setError("Nerasta pratimų. Patikrinkite formato pavyzdį.");return;}
      setError("");setPreview(parsed);
    };
    reader.readAsText(file,"UTF-8");
    e.target.value="";
  };

  const importAll=async()=>{
    setImporting(true);setError("");
    let count=0;
    for(const ex of preview){
      try{ await sb.insert("exercises",ex); count++; }
      catch(e:any){ console.error("Import error:",e.message); }
    }
    setDone(count);setImporting(false);
    if(count>0)onImported(count);
  };

  const removeRow=(i:number)=>setPreview(p=>p.filter((_,j)=>j!==i));

  return(
    <div style={css.overlay}>
      <div style={{...css.modal(700),maxHeight:"90vh"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:15,color:C.teal}}>📊 CSV/Excel import</div>
          <button onClick={onClose} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:20,flex:1}}>
          {done>0?(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <div style={{fontSize:20,fontWeight:900,color:C.green,marginBottom:8}}>Importuota sėkmingai!</div>
              <div style={{fontSize:14,color:C.muted,marginBottom:20}}>Pridėta {done} pratimų į biblioteką.</div>
              <button onClick={onClose} style={css.btnG}>Uždaryti</button>
            </div>
          ):preview.length===0?(
            <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
              {/* Instructions */}
              <div style={{background:C.faint,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
                <div style={{fontWeight:700,color:C.text,marginBottom:8,fontSize:13}}>📋 Kaip importuoti:</div>
                <ol style={{color:C.muted,fontSize:12,paddingLeft:18,lineHeight:2}}>
                  <li>Atsisiųskite CSV šabloną</li>
                  <li>Užpildykite Excel/Google Sheets ir išsaugokite kaip CSV</li>
                  <li>Įkelkite failą žemiau</li>
                </ol>
              </div>
              {/* Columns info */}
              <div style={{background:C.surface2,borderRadius:10,padding:"12px 16px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:8}}>Stulpeliai</div>
                <div style={{display:"flex",flexWrap:"wrap" as const,gap:6}}>
                  {CSV_COLS.map((c,i)=>(
                    <span key={c} style={{background:i<2?C.goldSoft:C.faint,border:`1px solid ${i<2?C.goldBorder:C.border}`,borderRadius:6,padding:"3px 9px",fontSize:11,color:i<2?C.gold:C.muted,fontWeight:600}}>
                      {c}{i<2?<span style={{color:C.red}}> *</span>:null}
                    </span>
                  ))}
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:8}}>Raumenų grupės: {CSV_MUSCLES.join(", ")}</div>
              </div>
              {error&&<div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:C.red}}>{error}</div>}
              <div style={{display:"flex",gap:10}}>
                <button onClick={downloadTemplate} style={{...css.btnGhost,flex:1,fontSize:12}}>⬇️ Atsisiųsti šabloną</button>
                <button onClick={()=>fileRef.current?.click()} style={{...css.btnG,flex:1}}>📂 Įkelti CSV failą</button>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
            </div>
          ):(
            <div>
              <div style={{display:"flex",alignItems:"center",marginBottom:14,gap:10}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Rasta {preview.length} pratimų</div>
                <button onClick={()=>{setPreview([]);}} style={{...css.btnGhost,fontSize:11}}>← Atgal</button>
                <button onClick={importAll} disabled={importing} style={{...css.btnG,marginLeft:"auto"}}>
                  {importing?<><span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff3",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginRight:8}}/>Importuojama...</>:`✅ Importuoti visus ${preview.length}`}
                </button>
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:6,maxHeight:400,overflowY:"auto" as const}}>
                {preview.map((ex,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:C.faint,borderRadius:9,padding:"9px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{ex.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{ex.muscle} · {ex.equipment||"—"} · {ex.sets}s × {ex.reps}r</div>
                      {ex.video_url&&<div style={{fontSize:10,color:C.green}}>▶ Video</div>}
                    </div>
                    <button onClick={()=>removeRow(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:16,padding:"0 4px"}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── EXERCISE LIBRARY MODAL ────────────────────────────────
export function ExerciseLibraryModal({onClose,onImported}:{onClose:()=>void,onImported:(n:number)=>void}){
  const [search,setSearch]=useState("");
  const [muscle,setMuscle]=useState("Visos");
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const [importing,setImporting]=useState(false);
  const [done,setDone]=useState(0);

  const filtered=LIBRARY.filter(e=>
    (muscle==="Visos"||e.muscle===muscle)&&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle=(name:string)=>{
    setSelected(p=>{const n=new Set(p); n.has(name)?n.delete(name):n.add(name); return n;});
  };
  const selectAll=()=>setSelected(new Set(filtered.map(e=>e.name)));
  const clearAll=()=>setSelected(new Set());

  const importSelected=async()=>{
    const toImport=LIBRARY.filter(e=>selected.has(e.name));
    setImporting(true);
    let count=0;
    for(const ex of toImport){
      try{ await sb.insert("exercises",ex); count++; }
      catch(e:any){ console.error(e.message); }
    }
    setDone(count);setImporting(false);
    onImported(count);
  };

  return(
    <div style={css.overlay}>
      <div style={{...css.modal(820),maxHeight:"92vh"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const}}>
          <div style={{fontWeight:700,fontSize:15,color:C.gold}}>📚 Pratimų biblioteka</div>
          {selected.size>0&&(
            <div style={{background:C.goldSoft,border:`1px solid ${C.goldBorder}`,borderRadius:7,padding:"3px 12px",fontSize:12,fontWeight:700,color:C.gold}}>
              Pasirinkta: {selected.size}
            </div>
          )}
          <button onClick={onClose} style={{marginLeft:"auto",width:28,height:28,background:C.faint,border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
        </div>

        {done>0?(
          <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",flex:1,padding:40,gap:12}}>
            <div style={{fontSize:52}}>✅</div>
            <div style={{fontSize:20,fontWeight:900,color:C.green}}>Importuota sėkmingai!</div>
            <div style={{fontSize:14,color:C.muted}}>Pridėta {done} pratimų į biblioteką.</div>
            <button onClick={onClose} style={css.btnG}>Uždaryti</button>
          </div>
        ):(
          <>
            {/* Search + filters */}
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap" as const,alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ieškoti..." style={{...css.input,width:180,flex:"none"}}/>
              <div style={{display:"flex",gap:4,flexWrap:"wrap" as const}}>
                {["Visos",...ALL_MUSCLES].map(m=>(
                  <button key={m} onClick={()=>setMuscle(m)} style={{padding:"4px 10px",borderRadius:20,border:muscle===m?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:muscle===m?C.goldSoft:"transparent",color:muscle===m?C.gold:C.muted,fontFamily:FONT,fontSize:11,cursor:"pointer",fontWeight:600,flexShrink:0}}>
                    {m}
                  </button>
                ))}
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                <button onClick={selectAll} style={{...css.btnGhost,fontSize:11,padding:"5px 10px"}}>Pasirinkti visus</button>
                {selected.size>0&&<button onClick={clearAll} style={{...css.btnRed,fontSize:11,padding:"5px 10px"}}>Išvalyti</button>}
              </div>
            </div>

            {/* Exercise grid */}
            <div style={{overflowY:"auto",padding:12,flex:1}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10}}>
                {filtered.map(ex=>{
                  const isSel=selected.has(ex.name);
                  return(
                    <div key={ex.name} onClick={()=>toggle(ex.name)}
                      style={{background:isSel?C.goldSoft:C.surface,borderRadius:12,border:isSel?`2px solid ${C.gold}`:`1px solid ${C.border}`,cursor:"pointer",overflow:"hidden",position:"relative",transition:"all .12s"}}>
                      {/* Image */}
                      {ex.imgs[0]?(
                        <img src={ex.imgs[0]} alt={ex.name} style={{width:"100%",height:90,objectFit:"cover"}} onError={e=>(e.target as HTMLImageElement).style.display="none"}/>
                      ):(
                        <div style={{height:90,background:C.faint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>💪</div>
                      )}
                      {/* Check badge */}
                      {isSel&&<div style={{position:"absolute",top:6,right:6,width:22,height:22,background:C.gold,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:C.bg,fontSize:12}}>✓</div>}
                      {/* Info */}
                      <div style={{padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.3}}>{ex.name}</div>
                        <div style={{fontSize:10,color:C.teal}}>{ex.muscle}</div>
                        <div style={{fontSize:10,color:C.muted}}>{ex.equipment} · {ex.sets}s × {ex.reps}r</div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center" as const,color:C.muted,padding:40}}>Pratimų nerasta</div>}
              </div>
            </div>

            {/* Footer */}
            <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{fontSize:12,color:C.muted}}>{filtered.length} pratimų rodoma</div>
              <button onClick={importSelected} disabled={importing||selected.size===0}
                style={{...css.btnG,marginLeft:"auto",opacity:selected.size>0?1:0.4}}>
                {importing?(
                  <><span style={{display:"inline-block",width:14,height:14,border:"2px solid #fff3",borderTopColor:C.bg,borderRadius:"50%",animation:"spin 0.8s linear infinite",marginRight:8}}/>Importuojama...</>
                ):`✅ Importuoti pasirinktus (${selected.size})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
