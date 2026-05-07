// ── auth.tsx — Multi-account auth system ─────────────────
import { useState, useEffect, createContext, useContext } from "react";
import { sb, C, FONT, css, Err } from "./shared";

// ── Types ─────────────────────────────────────────────────
export type Coach = {
  id: string;
  username: string;
  full_name: string;
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
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%,#D4860A08 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`, padding: "40px 32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 8px 40px #00000014", position: "relative" }}>
        <div style={{ width: 72, height: 72, background: `linear-gradient(135deg,${C.gold},#B06A08)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", margin: "0 auto 20px", boxShadow: `0 8px 24px ${C.gold}44`, letterSpacing: "-0.05em" }}>DNA</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 4, letterSpacing: "-0.03em" }}>DNA Trainer</div>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>Sporto & Mitybos programa</div>
        <Err msg={err} />
        <div style={{ marginBottom: 14 }}>
          <span style={css.label}>Vartotojo vardas</span>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={css.input} placeholder="vardas" autoFocus autoCapitalize="none" autoCorrect="off" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <span style={css.label}>Slaptažodis</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ ...css.input, letterSpacing: 4 }} placeholder="••••••••" />
        </div>
        <button onClick={submit} disabled={loading} style={{ ...css.btnG, width: "100%", padding: "13px", fontSize: 14, borderRadius: 12, opacity: username && password ? 1 : 0.5 }}>
          {loading ? "⏳ Jungiamasi..." : "🔓 Prisijungti"}
        </button>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 16 }}>Kreipkitės į administratorių dėl prieigos.</div>
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
  const [form, setForm] = useState({ username: "", full_name: "", password: "", role: "coach" as "admin" | "coach", active: true });
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

  const openNew = () => { setEditId(null); setForm({ username: "", full_name: "", password: "", role: "coach", active: true }); setErr(""); setFormOpen(true); };
  const openEdit = (c: Coach) => { setEditId(c.id); setForm({ username: c.username, full_name: c.full_name, password: "", role: c.role, active: c.active }); setErr(""); setFormOpen(true); };

  const save = async () => {
    if (!form.username.trim() || !form.full_name.trim()) { setErr("Vardas ir vartotojo vardas privalomi."); return; }
    if (!editId && !form.password.trim()) { setErr("Slaptažodis privalomas kuriant naują vartotoją."); return; }
    setSaving(true); setErr("");
    try {
      const data: any = { username: form.username.trim().toLowerCase(), full_name: form.full_name.trim(), role: form.role, active: form.active };
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
