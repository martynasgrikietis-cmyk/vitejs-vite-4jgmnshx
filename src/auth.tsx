// ── auth.tsx — Multi-account auth system ─────────────────
import { useState, useEffect, createContext, useContext } from "react";
import { sb, C, FONT, css, Err } from "./shared";

// ── Types ─────────────────────────────────────────────────
export type Coach = {
  id: string;
  username: string;
  full_name: string;
  telegram_chat_id?: string;
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
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", fontFamily:"'Barlow','Helvetica Neue',sans-serif", overflow:"hidden" }}>
      {/* Left — wallpaper */}
      <div style={{ flex:1, position:"relative", display:"flex" }} className="login-left">
        <img src="https://images.unsplash.com/photo-1549476464-37392f717541?w=1200&q=90" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", filter:"brightness(0.22) saturate(0.3) contrast(1.2)" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(6,7,9,0.1), rgba(6,7,9,0.8))" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(212,168,83,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.05) 1px,transparent 1px)", backgroundSize:"56px 56px" }}/>
        <div style={{ position:"relative", padding:"48px", display:"flex", flexDirection:"column" as const, justifyContent:"flex-end" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:24, height:1, background:"#D4A853" }}/>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:"#D4A853", letterSpacing:"0.3em" }}>DNA TRAINER</span>
          </div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:56, color:"#F5F0E8", lineHeight:0.9, letterSpacing:"0.02em", textShadow:"0 4px 40px rgba(0,0,0,0.9)" }}>
            SPORTO<br/><span style={{ color:"#D4A853" }}>SISTEMA</span>
          </div>
          <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:12, color:"#505868", fontWeight:300, marginTop:14, letterSpacing:"0.08em" }}>
            Profesionali trenerių platforma
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div style={{ width:380, background:C.surface, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column" as const, justifyContent:"center", padding:"48px 40px" }}>
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ marginBottom:28 }}>
          <circle cx="24" cy="24" r="21" stroke="#D4A853" strokeWidth="1" opacity="0.5"/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.2" fill="none"/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.2" fill="none" transform="rotate(60 24 24)"/>
          <ellipse cx="24" cy="24" rx="11" ry="5" stroke="#D4A853" strokeWidth="1.2" fill="none" transform="rotate(120 24 24)"/>
          <circle cx="24" cy="24" r="2.2" fill="#D4A853"/>
        </svg>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, color:"#F5F0E8", letterSpacing:"0.04em", lineHeight:1, marginBottom:6 }}>PRISIJUNGTI</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, color:"#505868", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:36 }}>Coach platforma</div>
        <Err msg={err} />
        <div style={{ marginBottom:24 }}>
          <span style={css.label}>Vartotojo vardas</span>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={css.input} placeholder="vardas" autoFocus autoCapitalize="none" autoCorrect="off" />
        </div>
        <div style={{ marginBottom:32 }}>
          <span style={css.label}>Slaptažodis</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ ...css.input, letterSpacing:4 }} placeholder="••••••••" />
        </div>
        <button onClick={submit} disabled={loading} style={{ ...css.btnG, width:"100%", padding:"14px", fontSize:11, letterSpacing:"0.18em", opacity: username && password ? 1 : 0.4 }}>
          {loading ? "JUNGIAMASI..." : "PRISIJUNGTI →"}
        </button>
        <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:11, color:"#303848", marginTop:20, letterSpacing:"0.04em" }}>Kreipkitės į administratorių dėl prieigos.</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400&family=Barlow+Condensed:wght@600&display=swap');
        @media(max-width:600px){ .login-left{display:none!important;} }
      `}</style>
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
