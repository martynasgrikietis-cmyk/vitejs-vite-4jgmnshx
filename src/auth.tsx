// ── auth.tsx — Multi-account auth system ─────────────────
import { useState, useEffect, createContext, useContext } from "react";
import { sb, C, FONT, css, Err } from "./shared";

// ── Types ─────────────────────────────────────────────────
export type Coach = {
  id: string;
  username: string;
  full_name: string;
  telegram_chat_id?: string;
  library_tier?: string;
  role: "admin" | "coach";
  active: boolean;
  created_at: string;
};

// ── Auth Context ──────────────────────────────────────────
const AuthCtx = createContext<{
  coach: Coach | null;
  isAdmin: boolean;
  logout: () => void;
}>({ coach: null, isAdmin: false, logout: () => {} });

export const useAuth = () => useContext(AuthCtx);

// ── Session helpers ───────────────────────────────────────
const SESSION_KEY = "dna_session";
export function getSession(): Coach | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}
export function setSession(c: Coach) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(c)); }
export function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

// Simple password hash (SHA-256 via Web Crypto)
async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Auth Provider ─────────────────────────────────────────
export function AuthProvider({ children, onLogout }: { children: any; onLogout: () => void }) {
  const coach = getSession();
  const isAdmin = coach?.role === "admin";
  const logout = () => { clearSession(); onLogout(); };
  return (
    <AuthCtx.Provider value={{ coach, isAdmin, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────
export function LoginScreen({ onLogin }: { onLogin: (coach: Coach) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password.trim()) { setErr("Įveskite vartotojo vardą ir slaptažodį."); return; }
    setLoading(true); setErr("");
    try {
      const hash = await hashPassword(password);
      const rows = await sb.get("coaches", `?username=eq.${encodeURIComponent(username.trim().toLowerCase())}&password_hash=eq.${hash}&active=eq.true&limit=1`);
      if (!rows.length) { setErr("Neteisingas vartotojo vardas arba slaptažodis."); setLoading(false); return; }
      const coach: Coach = rows[0];
      setSession(coach);
      onLogin(coach);
    } catch (e: any) {
      setErr("Prisijungimo klaida: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column" as const, fontFamily:"'Barlow','Helvetica Neue',sans-serif", overflow:"hidden", position:"relative" as const }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@300;400&display=swap');
        *{box-sizing:border-box;}
        body{margin:0;background:#060709;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .login-fu{animation:fadeUp .5s ease both;}
        .login-fu1{animation:fadeUp .5s .1s ease both;}
        .login-fu2{animation:fadeUp .5s .2s ease both;}
        .login-fu3{animation:fadeUp .5s .3s ease both;}
        .login-input{
          width:100%;background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px;
          padding:16px 18px;
          color:#F5F0E8;
          font-family:'Barlow',sans-serif;
          font-size:16px;
          outline:none;
          transition:border-color .2s, background .2s;
          -webkit-appearance:none;
          box-sizing:border-box;
        }
        .login-input:focus{
          border-color:#D4A853;
          background:rgba(212,168,83,0.08);
        }
        .login-input::placeholder{color:rgba(255,255,255,0.2);}
        .login-btn{
          width:100%;padding:17px;
          background:linear-gradient(135deg,#D4A853,#B8902A);
          color:#060709;border:none;border-radius:14px;
          font-family:'Barlow Condensed',sans-serif;
          font-weight:700;font-size:14px;
          letter-spacing:0.18em;text-transform:uppercase;
          cursor:pointer;
          transition:opacity .2s, transform .1s;
          -webkit-appearance:none;
        }
        .login-btn:active{transform:scale(0.98);}
        @media(min-width:641px){
          .login-left{display:flex!important;}
          .login-mobile-bg{display:none!important;}
        }
      `}</style>

      {/* ── FULL SCREEN WALLPAPER (mobile) ── */}
      <div className="login-mobile-bg" style={{ position:"absolute" as const, inset:0, zIndex:0 }}>
        <img src="https://i.pinimg.com/736x/e3/bc/16/e3bc16974256fb6913e37079fa4cb653.jpg" alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", filter:"brightness(0.18) saturate(0.3) contrast(1.2)" }}/>
        <div style={{ position:"absolute" as const, inset:0, background:"linear-gradient(to bottom, rgba(6,7,9,0.3) 0%, rgba(6,7,9,0.7) 40%, rgba(6,7,9,0.97) 70%)" }}/>
        <div style={{ position:"absolute" as const, inset:0, backgroundImage:"linear-gradient(rgba(212,168,83,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.04) 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>
      </div>

      {/* ── DESKTOP: Left wallpaper panel ── */}
      <div className="login-left" style={{ display:"none", flex:1, position:"relative" as const }}>
        <img src="https://i.pinimg.com/736x/e3/bc/16/e3bc16974256fb6913e37079fa4cb653.jpg" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", filter:"brightness(0.22) saturate(0.3) contrast(1.2)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(6,7,9,0.1), rgba(6,7,9,0.85))" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(212,168,83,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.05) 1px,transparent 1px)", backgroundSize:"56px 56px" }}/>
        <div style={{ position:"relative", padding:"48px", display:"flex", flexDirection:"column" as const, justifyContent:"flex-end" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:24, height:1, background:"#D4A853" }}/>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:"#D4A853", letterSpacing:"0.3em" }}>DNA TRAINER</span>
          </div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:60, color:"#F5F0E8", lineHeight:0.9, letterSpacing:"0.02em", textShadow:"0 4px 40px rgba(0,0,0,0.9)" }}>
            SPORTO<br/><span style={{ color:"#D4A853" }}>SISTEMA</span>
          </div>
          <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:12, color:"#505868", fontWeight:300, marginTop:14, letterSpacing:"0.08em" }}>
            Profesionali trenerių platforma
          </div>
        </div>
      </div>

      {/* ── LOGIN FORM — mobile centered, desktop right panel ── */}
      <div style={{
        position:"relative" as const, zIndex:1,
        flex:1,
        display:"flex", flexDirection:"column" as const,
        justifyContent:"flex-end",
        padding:"0 24px calc(40px + env(safe-area-inset-bottom))",
        maxWidth:480,
        width:"100%",
        margin:"0 auto",
      }}>
        {/* Logo + title — top of form */}
        <div className="login-fu" style={{ textAlign:"center" as const, marginBottom:40 }}>
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ margin:"0 auto 16px", display:"block" }}>
            <circle cx="24" cy="24" r="21" stroke="#D4A853" strokeWidth="1.2" opacity="0.7"/>
            <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.5" fill="none"/>
            <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.5" fill="none" transform="rotate(60 24 24)"/>
            <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.5" fill="none" transform="rotate(120 24 24)"/>
            <circle cx="24" cy="24" r="3" fill="#D4A853"/>
            <circle cx="35" cy="24" r="1.8" fill="#D4A853" opacity="0.6"/>
            <circle cx="18.5" cy="14.8" r="1.8" fill="#D4A853" opacity="0.6"/>
            <circle cx="18.5" cy="33.2" r="1.8" fill="#D4A853" opacity="0.6"/>
          </svg>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:"#FFFFFF", letterSpacing:"0.08em", lineHeight:1 }}>DNA TRAINER</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, color:"#505868", letterSpacing:"0.22em", textTransform:"uppercase" as const, marginTop:4 }}>Coach platforma</div>
        </div>

        {/* Error */}
        {err && (
          <div className="login-fu" style={{ background:"rgba(192,80,80,0.15)", border:"1px solid rgba(192,80,80,0.4)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#ef8080", marginBottom:16, textAlign:"center" as const }}>
            {err}
          </div>
        )}

        {/* Username */}
        <div className="login-fu1" style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, color:"#8A9AAA", letterSpacing:"0.2em", textTransform:"uppercase" as const, marginBottom:8 }}>Vartotojo vardas</div>
          <input
            className="login-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="vardas"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="login-fu2" style={{ marginBottom:28 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, color:"#8A9AAA", letterSpacing:"0.2em", textTransform:"uppercase" as const, marginBottom:8 }}>Slaptažodis</div>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ letterSpacing: password ? "0.2em" : "normal" }}
          />
        </div>

        {/* Submit button */}
        <div className="login-fu3">
          <button
            className="login-btn"
            onClick={submit}
            disabled={loading || !username || !password}
            style={{ opacity: loading || !username || !password ? 0.5 : 1 }}
          >
            {loading ? "JUNGIAMASI..." : "PRISIJUNGTI"}
          </button>
          <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:11, color:"#303848", marginTop:16, textAlign:"center" as const, letterSpacing:"0.04em" }}>
            Kreipkitės į administratorių dėl prieigos.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN — USER MANAGEMENT TAB ───────────────────────────
export function UsersTab() {
  const { coach: me } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", full_name: "", password: "", role: "coach" as "admin" | "coach", active: true, telegram_chat_id: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState<Coach | null>(null);
  const [libraryCoach, setLibraryCoach] = useState<Coach | null>(null);

  const load = async () => {
    setLoading(true);
    try { setCoaches(await sb.get("coaches", "?order=created_at")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setForm({ username: "", full_name: "", password: "", role: "coach", active: true, telegram_chat_id: "" }); setErr(""); setFormOpen(true); };
  const openEdit = (c: Coach) => { setEditId(c.id); setForm({ username: c.username, full_name: c.full_name, password: "", role: c.role, active: c.active, telegram_chat_id: c.telegram_chat_id||"" }); setErr(""); setFormOpen(true); };

  const save = async () => {
    if (!form.username.trim() || !form.full_name.trim()) { setErr("Vardas ir vartotojo vardas privalomi."); return; }
    if (!editId && !form.password.trim()) { setErr("Slaptažodis privalomas kuriant naują vartotoją."); return; }
    setSaving(true); setErr("");
    try {
      const data: any = { username: form.username.trim().toLowerCase(), full_name: form.full_name.trim(), role: form.role, active: form.active, telegram_chat_id: form.telegram_chat_id.trim()||null };
      if (form.password.trim()) data.password_hash = await hashPassword(form.password);
      if (editId) await sb.update("coaches", editId, data);
      else await sb.insert("coaches", data);
      setFormOpen(false); await load();
    } catch (e: any) { setErr("Klaida: " + e.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (c: Coach) => {
    try { await sb.update("coaches", c.id, { active: !c.active }); await load(); }
    catch (e: any) { alert("Klaida: " + e.message); }
  };

  const del = async (c: Coach) => {
    try { await sb.delete("coaches", c.id); setConfirmDel(null); await load(); }
    catch (e: any) { alert("Klaida: " + e.message); }
  };

  const roleColor = (r: string) => r === "admin" ? C.gold : C.teal;
  const roleLabel = (r: string) => r === "admin" ? "👑 Admin" : "🏋️ Treneris";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>👥 Vartotojai</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{coaches.length} vartotojų iš viso</div>
        </div>
        <button onClick={openNew} style={{ ...css.btnG, marginLeft: "auto" }}>+ Naujas vartotojas</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>Kraunama...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {coaches.map(c => (
            <div key={c.id} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${c.id === me?.id ? C.goldBorder : C.border}`, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
              {/* Avatar */}
              <div style={{ width: 48, height: 48, background: `linear-gradient(135deg,${roleColor(c.role)},${roleColor(c.role)}AA)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {(c.full_name || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.full_name}</div>
                  {c.id === me?.id && <span style={{ background: C.goldSoft, border: `1px solid ${C.goldBorder}`, borderRadius: 20, padding: "1px 8px", fontSize: 10, color: C.gold, fontWeight: 700 }}>Jūs</span>}
                  <span style={{ background: roleColor(c.role) + "18", border: `1px solid ${roleColor(c.role)}44`, borderRadius: 20, padding: "1px 8px", fontSize: 10, color: roleColor(c.role), fontWeight: 700 }}>{roleLabel(c.role)}</span>
                  {!c.active && <span style={{ background: C.redSoft, border: `1px solid ${C.redBorder}`, borderRadius: 20, padding: "1px 8px", fontSize: 10, color: C.red, fontWeight: 700 }}>Neaktyvus</span>}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>@{c.username} · Sukurtas: {new Date(c.created_at).toLocaleDateString("lt-LT")}</div>
              </div>
              <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                <button onClick={() => openEdit(c)} style={css.btnTeal}>✏️ Redaguoti</button>
                {c.role !== "admin" && (
                  <button onClick={() => setLibraryCoach(c)} style={{ ...css.btnGhost, fontSize: 11, padding: "5px 12px", color: C.gold, borderColor: C.goldBorder }}>
                    📚 Biblioteka
                  </button>
                )}
                <button onClick={() => toggleActive(c)} style={c.active ? css.btnGhost : css.btnGreen}>
                  {c.active ? "⏸ Išjungti" : "▶ Įjungti"}
                </button>
                {c.id !== me?.id && <button onClick={() => setConfirmDel(c)} style={css.btnRed}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div style={css.overlay}>
          <div style={css.modal(480)}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.gold }}>{editId ? "✏️ Redaguoti vartotoją" : "➕ Naujas vartotojas"}</div>
              <button onClick={() => setFormOpen(false)} style={{ marginLeft: "auto", width: 28, height: 28, background: C.faint, border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column" as const, gap: 14 }}>
              <Err msg={err} />
              <div><span style={css.label}>Vardas ir pavardė *</span><input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} style={css.input} placeholder="Jonas Jonaitis" /></div>
              <div><span style={css.label}>Vartotojo vardas * (mažosios raidės)</span><input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase() }))} style={css.input} placeholder="jonas" autoCapitalize="none" /></div>
              <div><span style={css.label}>{editId ? "Naujas slaptažodis (palikite tuščią jei nekeičiate)" : "Slaptažodis *"}</span><input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={css.input} placeholder="••••••••" /></div>
              <div>
                <span style={css.label}>📱 Telegram Chat ID (rezervacijų pranešimams)</span>
                <input value={form.telegram_chat_id} onChange={e => setForm(p => ({ ...p, telegram_chat_id: e.target.value }))} style={css.input} placeholder="pvz. 1687801580" />
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>Gaukite savo ID: atsiųskite žinutę @userinfobot Telegram</div>
              </div>
              <div>
                <span style={css.label}>Rolė</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["coach", "admin"] as const).map(r => (
                    <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: form.role === r ? `1px solid ${roleColor(r)}` : `1px solid ${C.border}`, background: form.role === r ? roleColor(r) + "18" : "transparent", color: form.role === r ? roleColor(r) : C.muted, fontFamily: FONT, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                      {roleLabel(r)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
                <label htmlFor="active" style={{ fontSize: 13, color: C.text, cursor: "pointer" }}>Aktyvus (gali prisijungti)</label>
              </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setFormOpen(false)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={save} disabled={saving} style={css.btnG}>{saving ? "⏳ Saugoma..." : "💾 Išsaugoti"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Library access modal */}
      {libraryCoach && (
        <LibraryAccessModal
          coach={libraryCoach}
          onClose={() => { setLibraryCoach(null); load(); }}
        />
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div style={css.overlay}>
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.redBorder}`, padding: 28, maxWidth: 340, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: C.text }}>Ištrinti vartotoją?</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>„{confirmDel.full_name}" ir visi jų duomenys bus ištrinti.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setConfirmDel(null)} style={css.btnGhost}>Atšaukti</button>
              <button onClick={() => del(confirmDel)} style={{ ...css.btnG, background: C.red, color: "#fff" }}>Ištrinti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LIBRARY ACCESS MODAL ─────────────────────────────────
// ── LIBRARY ACCESS MODAL (Tier + Individual) ─────────────
const TIERS = [
  {
    id: "full",
    name: "Pilna prieiga",
    desc: "Mato visus pratimus ir maisto produktus",
    color: "#4E9068",
    icon: "🔓",
    exFilter: () => true,
    foodFilter: () => true,
  },
  {
    id: "intermediate",
    name: "Vidutinis",
    desc: "Standartiniai pratimai, be olimpinių ir pažengusių",
    color: "#D4A853",
    icon: "🏋️",
    exFilter: (e: any) => !["Olimpiniai kėlimai","Kallistenics","Gimnastika"].includes(e.equipment||""),
    foodFilter: () => true,
  },
  {
    id: "beginner",
    name: "Pradedantysis",
    desc: "Pagrindiniai pratimai ir bazinis maistas",
    color: "#5B8DB8",
    icon: "🌱",
    exFilter: (e: any) => ["Krūtinė","Nugara","Kojos","Pečiai","Pilvas"].includes(e.muscle||""),
    foodFilter: (f: any) => ["Mėsa & Žuvis","Grūdai & Kruopos","Daržovės","Vaisiai","Pieno produktai","Kiaušiniai"].includes(f.category||""),
  },
  {
    id: "custom",
    name: "Individualus",
    desc: "Rankiniu būdu valdote kiekvieną elementą",
    color: "#9B7DD4",
    icon: "⚙️",
    exFilter: () => true,
    foodFilter: () => true,
  },
];

function LibraryAccessModal({ coach, onClose }: { coach: Coach; onClose: () => void }) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [blockedEx, setBlockedEx] = useState<Set<string>>(new Set());
  const [blockedFood, setBlockedFood] = useState<Set<string>>(new Set());
  const [tier, setTier] = useState<string>(coach.library_tier || "full");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"tier" | "exercises" | "foods">("tier");
  const [searchEx, setSearchEx] = useState("");
  const [searchFood, setSearchFood] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("Visi");
  const [catFilter, setCatFilter] = useState("Visi");
  const ALL_MUSCLES_L = ["Visi","Krūtinė","Nugara","Kojos","Pečiai","Bicepsas","Tricepsas","Pilvas"];
  const ALL_FOOD_CATS_L = ["Visi","Mėsa & Žuvis","Grūdai & Kruopos","Daržovės","Vaisiai","Pieno produktai","Kiaušiniai","Riešutai & Sėklos","Ankštiniai","Sveiki riebalai","Kita"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [exList, foodList, exBlocks, foodBlocks] = await Promise.all([
          sb.get("exercises", "?order=muscle,name&select=id,name,muscle,equipment"),
          sb.get("foods", "?order=category,name&select=id,name,category").catch(() => []),
          sb.get("coach_exercise_blocks", `?coach_id=eq.${coach.id}&select=exercise_id`).catch(() => []),
          sb.get("coach_food_blocks", `?coach_id=eq.${coach.id}&select=food_id`).catch(() => []),
        ]);
        setExercises(exList);
        setFoods(foodList);
        setBlockedEx(new Set((exBlocks as any[]).map((b: any) => b.exercise_id)));
        setBlockedFood(new Set((foodBlocks as any[]).map((b: any) => b.food_id)));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [coach.id]);

  // Apply tier — sets blocks based on tier filter
  const applyTier = (newTier: string) => {
    setTier(newTier);
    const t = TIERS.find(t => t.id === newTier);
    if (!t || newTier === "custom") return;
    // Block exercises that don't pass the tier filter
    const newBlockedEx = new Set<string>(
      exercises.filter(e => !t.exFilter(e)).map(e => e.id)
    );
    const newBlockedFood = new Set<string>(
      foods.filter(f => !t.foodFilter(f)).map(f => f.id)
    );
    setBlockedEx(newBlockedEx);
    setBlockedFood(newBlockedFood);
  };

  const toggleEx = (id: string) => {
    setTier("custom"); // Switch to custom when manually overriding
    setBlockedEx(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleFood = (id: string) => {
    setTier("custom");
    setBlockedFood(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const blockAllMuscle = (muscle: string) => { setTier("custom"); setBlockedEx(prev => { const n = new Set(prev); exercises.filter(e => e.muscle === muscle).forEach(e => n.add(e.id)); return n; }); };
  const allowAllMuscle = (muscle: string) => { setTier("custom"); setBlockedEx(prev => { const n = new Set(prev); exercises.filter(e => e.muscle === muscle).forEach(e => n.delete(e.id)); return n; }); };
  const blockAllCat = (cat: string) => { setTier("custom"); setBlockedFood(prev => { const n = new Set(prev); foods.filter(f => f.category === cat).forEach(f => n.add(f.id)); return n; }); };
  const allowAllCat = (cat: string) => { setTier("custom"); setBlockedFood(prev => { const n = new Set(prev); foods.filter(f => f.category === cat).forEach(f => n.delete(f.id)); return n; }); };

  const save = async () => {
    setSaving(true);
    try {
      // Update coach tier
      await sb.update("coaches", coach.id, { library_tier: tier });
      // Delete old blocks
      await fetch(`${sb.url("coach_exercise_blocks", `?coach_id=eq.${coach.id}`)}`, { method: "DELETE", headers: sb.headers });
      await fetch(`${sb.url("coach_food_blocks", `?coach_id=eq.${coach.id}`)}`, { method: "DELETE", headers: sb.headers });
      // Insert new blocks
      if (blockedEx.size > 0) await sb.insert("coach_exercise_blocks", Array.from(blockedEx).map(exercise_id => ({ coach_id: coach.id, exercise_id })));
      if (blockedFood.size > 0) await sb.insert("coach_food_blocks", Array.from(blockedFood).map(food_id => ({ coach_id: coach.id, food_id })));
      onClose();
    } catch (e: any) { alert("Klaida: " + e.message); }
    finally { setSaving(false); }
  };

  const filteredEx = exercises.filter(e => (muscleFilter === "Visi" || e.muscle === muscleFilter) && (!searchEx || e.name.toLowerCase().includes(searchEx.toLowerCase())));
  const filteredFood = foods.filter(f => (catFilter === "Visi" || f.category === catFilter) && (!searchFood || f.name.toLowerCase().includes(searchFood.toLowerCase())));
  const exByMuscle = ALL_MUSCLES_L.slice(1).reduce((acc: any, m) => { const l = filteredEx.filter(e => e.muscle === m); if (l.length) acc[m] = l; return acc; }, {} as Record<string, any[]>);
  const foodByCat = ALL_FOOD_CATS_L.slice(1).reduce((acc: any, c) => { const l = filteredFood.filter(f => f.category === c); if (l.length) acc[c] = l; return acc; }, {} as Record<string, any[]>);
  const allowedEx = exercises.length - blockedEx.size;
  const allowedFood = foods.length - blockedFood.size;
  const currentTier = TIERS.find(t => t.id === tier);

  return (
    <div style={css.overlay}>
      <div style={{ ...css.modal(820), maxHeight: "94vh" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.gold},#8B6520)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: C.bg, flexShrink: 0 }}>
            {(coach.full_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: C.text, letterSpacing: "0.04em", lineHeight: 1 }}>{coach.full_name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 12 }}>{currentTier?.icon}</span>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: currentTier?.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{currentTier?.name}</span>
            </div>
          </div>
          {/* Summary stats */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: C.gold, lineHeight: 1 }}>{allowedEx}<span style={{ fontSize: 12, color: C.muted }}>/{exercises.length}</span></div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: C.muted, letterSpacing: "0.12em" }}>PRATIMAI</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: C.green, lineHeight: 1 }}>{allowedFood}<span style={{ fontSize: 12, color: C.muted }}>/{foods.length}</span></div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: C.muted, letterSpacing: "0.12em" }}>MAISTAS</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, background: C.faint, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.faint }}>
          {[
            ["tier", "⚡ Lygis (Tier)"],
            ["exercises", `🏋️ Pratimai (${allowedEx}/${exercises.length})`],
            ["foods", `🥗 Maistas (${allowedFood}/${foods.length})`],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as any)} style={{ flex: 1, padding: "10px", background: "transparent", border: "none", borderBottom: tab === v ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === v ? C.gold : C.muted, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>{l}</button>
          ))}
        </div>

        {loading ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Kraunama...</div> : (
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

            {/* ── TIER TAB ── */}
            {tab === "tier" && (
              <div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.6 }}>
                  Pasirinkite greitą prieigos lygį. Jis automatiškai nustatys ką treneris matys. Po to galite rankiniu būdu patikslinti konkrečius elementus <b style={{ color: C.text }}>Pratimų</b> arba <b style={{ color: C.text }}>Maisto</b> skirtuke.
                </div>

                {/* Tier cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {TIERS.map(t => (
                    <div key={t.id} onClick={() => applyTier(t.id)} style={{
                      padding: "16px 18px", border: `2px solid ${tier === t.id ? t.color : C.border}`,
                      background: tier === t.id ? t.color + "12" : C.faint,
                      cursor: "pointer", transition: "all .15s",
                      position: "relative" as const,
                    }}>
                      {tier === t.id && (
                        <div style={{ position: "absolute" as const, top: 10, right: 10, width: 18, height: 18, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 900 }}>✓</div>
                      )}
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: tier === t.id ? t.color : C.text, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{t.desc}</div>
                      {/* Preview count */}
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, background: C.faint, border: `1px solid ${C.border}`, padding: "2px 8px", color: C.muted, letterSpacing: "0.1em" }}>
                          🏋️ {exercises.filter(t.exFilter).length} pratimai
                        </span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, background: C.faint, border: `1px solid ${C.border}`, padding: "2px 8px", color: C.muted, letterSpacing: "0.1em" }}>
                          🥗 {foods.filter(t.foodFilter).length} maistas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current state preview */}
                <div style={{ background: C.faint, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: C.muted, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Dabartinė prieiga pagal raumenų grupes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ALL_MUSCLES_L.slice(1).map(m => {
                      const total = exercises.filter(e => e.muscle === m).length;
                      const allowed = exercises.filter(e => e.muscle === m && !blockedEx.has(e.id)).length;
                      const pct = total > 0 ? Math.round(allowed / total * 100) : 100;
                      return (
                        <div key={m} style={{ padding: "6px 10px", background: pct === 100 ? C.greenSoft : pct === 0 ? C.redSoft : C.goldSoft, border: `1px solid ${pct === 100 ? C.greenBorder : pct === 0 ? C.redBorder : C.goldBorder}`, textAlign: "center" as const, minWidth: 80 }}>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, color: pct === 100 ? C.green : pct === 0 ? C.red : C.gold }}>{pct}%</div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: C.muted, letterSpacing: "0.08em" }}>{m}</div>
                          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: C.muted }}>{allowed}/{total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 12, fontFamily: "'Barlow',sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                  💡 Pasirinkę lygį galite pereiti į <b style={{ color: C.text }}>Pratimų</b> arba <b style={{ color: C.text }}>Maisto</b> skirtukus ir rankiniu būdu pakeisti atskirus elementus. Sistema automatiškai persijungs į <b style={{ color: C.purple }}>Individualų</b> lygį.
                </div>
              </div>
            )}

            {/* ── EXERCISES TAB ── */}
            {tab === "exercises" && (
              <>
                <div style={{ background: C.goldSoft, border: `1px solid ${C.goldBorder}`, padding: "8px 14px", marginBottom: 14, fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.gold }}>
                  ✅ Žalia = treneris MATO &nbsp;·&nbsp; ❌ Raudona = treneris NEMATO &nbsp;·&nbsp; Keitimas persijungia į <b>Individualų</b> lygį
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" as const }}>
                  <input value={searchEx} onChange={e => setSearchEx(e.target.value)} placeholder="🔍 Ieškoti pratimų..." style={{ ...css.input, width: 200, flexShrink: 0 }} />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {ALL_MUSCLES_L.map(m => (
                      <button key={m} onClick={() => setMuscleFilter(m)} style={{ padding: "4px 10px", background: muscleFilter === m ? C.gold : "transparent", color: muscleFilter === m ? C.bg : C.muted, border: `1px solid ${muscleFilter === m ? C.gold : C.border}`, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer" }}>{m}</button>
                    ))}
                  </div>
                </div>
                {Object.entries(exByMuscle).map(([muscle, exs]) => (
                  <div key={muscle} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                      <div style={{ width: 2, height: 14, background: C.gold }} />
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: C.text, letterSpacing: "0.04em", flex: 1 }}>{muscle}</span>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: C.muted, letterSpacing: "0.1em" }}>
                        {(exs as any[]).filter(e => !blockedEx.has(e.id)).length}/{(exs as any[]).length}
                      </span>
                      <button onClick={() => allowAllMuscle(muscle)} style={{ ...css.btnGreen, padding: "3px 10px", fontSize: 9 }}>✓ Visi</button>
                      <button onClick={() => blockAllMuscle(muscle)} style={{ ...css.btnRed, padding: "3px 10px", fontSize: 9 }}>✕ Jokie</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 4 }}>
                      {(exs as any[]).map((ex: any) => {
                        const blocked = blockedEx.has(ex.id);
                        return (
                          <div key={ex.id} onClick={() => toggleEx(ex.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: blocked ? C.redSoft : C.faint, border: `1px solid ${blocked ? C.redBorder : C.border}`, cursor: "pointer", transition: "all .15s", opacity: blocked ? 0.65 : 1 }}>
                            <div style={{ width: 16, height: 16, background: blocked ? C.red : C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0, fontWeight: 900 }}>{blocked ? "✕" : "✓"}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 600, color: blocked ? C.muted : C.text }}>{ex.name}</div>
                              {ex.equipment && <div style={{ fontSize: 9, color: C.muted }}>{ex.equipment}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── FOODS TAB ── */}
            {tab === "foods" && (
              <>
                <div style={{ background: C.greenSoft, border: `1px solid ${C.greenBorder}`, padding: "8px 14px", marginBottom: 14, fontFamily: "'Barlow',sans-serif", fontSize: 12, color: C.green }}>
                  ✅ Žalia = treneris MATO &nbsp;·&nbsp; ❌ Raudona = treneris NEMATO &nbsp;·&nbsp; Keitimas persijungia į <b>Individualų</b> lygį
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" as const }}>
                  <input value={searchFood} onChange={e => setSearchFood(e.target.value)} placeholder="🔍 Ieškoti maisto..." style={{ ...css.input, width: 200 }} />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {ALL_FOOD_CATS_L.map(c => (
                      <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "4px 10px", background: catFilter === c ? C.gold : "transparent", color: catFilter === c ? C.bg : C.muted, border: `1px solid ${catFilter === c ? C.gold : C.border}`, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer" }}>{c}</button>
                    ))}
                  </div>
                </div>
                {Object.entries(foodByCat).map(([cat, fds]) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                      <div style={{ width: 2, height: 14, background: C.green }} />
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: C.text, letterSpacing: "0.04em", flex: 1 }}>{cat}</span>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: C.muted }}>{(fds as any[]).filter(f => !blockedFood.has(f.id)).length}/{(fds as any[]).length}</span>
                      <button onClick={() => allowAllCat(cat)} style={{ ...css.btnGreen, padding: "3px 10px", fontSize: 9 }}>✓ Visi</button>
                      <button onClick={() => blockAllCat(cat)} style={{ ...css.btnRed, padding: "3px 10px", fontSize: 9 }}>✕ Jokie</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 4 }}>
                      {(fds as any[]).map((f: any) => {
                        const blocked = blockedFood.has(f.id);
                        return (
                          <div key={f.id} onClick={() => toggleFood(f.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: blocked ? C.redSoft : C.faint, border: `1px solid ${blocked ? C.redBorder : C.border}`, cursor: "pointer", transition: "all .15s", opacity: blocked ? 0.65 : 1 }}>
                            <div style={{ width: 16, height: 16, background: blocked ? C.red : C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", flexShrink: 0, fontWeight: 900 }}>{blocked ? "✕" : "✓"}</div>
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 600, color: blocked ? C.muted : C.text }}>{f.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {foods.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: "32px 0", fontSize: 13 }}>Maisto produktų nerasta</div>}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <span style={{ fontSize: 14 }}>{currentTier?.icon}</span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: currentTier?.color, fontWeight: 700, letterSpacing: "0.1em" }}>{currentTier?.name}</span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: C.muted }}>· Blokuota: {blockedEx.size} pratimų, {blockedFood.size} maisto</span>
          </div>
          <button onClick={onClose} style={css.btnGhost}>Atšaukti</button>
          <button onClick={save} disabled={saving} style={{ ...css.btnG, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saugoma..." : "💾 Išsaugoti"}
          </button>
        </div>
      </div>
    </div>
  );
}
