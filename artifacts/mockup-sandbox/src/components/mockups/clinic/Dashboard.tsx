import { useState } from "react";
import { Users, Calendar, DollarSign, TrendingUp, Bell, Search, Home, FileText, Settings, ChevronLeft, Clock, Plus, Zap, Activity } from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { icon: <Users size={18} />, label: "المرضى", value: "248", sub: "+12 هذا الشهر", color: "#0ea5e9", bg: "linear-gradient(135deg,#0ea5e9,#0284c7)", light: "#e0f2fe" },
    { icon: <Calendar size={18} />, label: "مواعيد اليوم", value: "8", sub: "3 متبقية", color: "#8b5cf6", bg: "linear-gradient(135deg,#8b5cf6,#7c3aed)", light: "#ede9fe" },
    { icon: <DollarSign size={18} />, label: "الإيرادات", value: "12.4k", sub: "+18% هذا الشهر", color: "#10b981", bg: "linear-gradient(135deg,#10b981,#059669)", light: "#d1fae5" },
    { icon: <Activity size={18} />, label: "الجلسات", value: "14", sub: "6 مكتملة", color: "#f59e0b", bg: "linear-gradient(135deg,#f59e0b,#d97706)", light: "#fef3c7" },
  ];

  const appointments = [
    { name: "أحمد محمد علي", time: "10:00 ص", type: "متابعة تقويم", status: "done", avatar: "أ", avatarBg: "#0ea5e9" },
    { name: "سارة إبراهيم", time: "11:30 ص", type: "تقييم أولي", status: "now", avatar: "س", avatarBg: "#8b5cf6" },
    { name: "محمد خالد", time: "1:00 م", type: "تقويم شفاف", status: "next", avatar: "م", avatarBg: "#10b981" },
    { name: "فاطمة أحمد", time: "2:30 م", type: "متابعة", status: "next", avatar: "ف", avatarBg: "#f59e0b" },
  ];

  const statusMap: any = {
    done: { label: "مكتمل ✓", color: "#10b981", bg: "#d1fae5" },
    now: { label: "● الآن", color: "#0ea5e9", bg: "#e0f2fe" },
    next: { label: "قادم", color: "#94a3b8", bg: "#f1f5f9" },
  };

  const bottomTabs = [
    { key: "home", icon: <Home size={21} />, label: "الرئيسية" },
    { key: "patients", icon: <Users size={21} />, label: "المرضى" },
    { key: "calendar", icon: <Calendar size={21} />, label: "المواعيد" },
    { key: "files", icon: <FileText size={21} />, label: "الملفات" },
    { key: "settings", icon: <Settings size={21} />, label: "الإعدادات" },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#f1f5fb", minHeight: "100vh", paddingBottom: 72, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .d-stat { background: white; border-radius: 20px; padding: 16px 14px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); border: 1px solid rgba(255,255,255,0.9); overflow: hidden; position: relative; }
        .d-stat::before { content: ''; position: absolute; top: -20px; left: -20px; width: 80px; height: 80px; background: var(--light); border-radius: 50%; opacity: 0.6; }

        .d-appt { display: flex; align-items: center; gap: 11px; padding: 12px 14px; background: white; border-radius: 16px; margin-bottom: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; transition: all 0.2s; }
        .d-appt:active { transform: scale(0.98); }

        .d-btm-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: none; background: transparent; cursor: pointer; padding: 8px 4px 6px; font-family: 'Cairo', sans-serif; font-size: 10px; font-weight: 700; transition: color 0.2s; }

        .d-search { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15); border-radius: 13px; padding: 10px 40px 10px 14px; color: white; font-family: 'Cairo', sans-serif; font-size: 14px; outline: none; width: 100%; }
        .d-search::placeholder { color: rgba(255,255,255,0.4); }

        .d-new-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 12px; padding: 8px 12px; font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(10px); }

        @keyframes now-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(14,165,233,0.4)} 50%{box-shadow:0 0 0 6px rgba(14,165,233,0)} }
        .now-dot { animation: now-pulse 2s ease-in-out infinite; border-radius: 50%; width: 8px; height: 8px; background: #0ea5e9; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%)", padding: "18px 16px 22px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 30px rgba(15,23,42,0.4)" }}>
        {/* decorative */}
        <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, background: "rgba(14,165,233,0.12)", borderRadius: "50%", filter: "blur(30px)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 20, width: 80, height: 80, background: "rgba(139,92,246,0.12)", borderRadius: "50%", filter: "blur(20px)" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(14,165,233,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>🦷</div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 15, letterSpacing: "-0.2px" }}>د. وسام يوسف</div>
              <div style={{ color: "#7dd3fc", fontSize: 10.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                لوحة التحكم
              </div>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 38, height: 38, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={16} color="white" />
              <div style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #0f172a" }} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input className="d-search" placeholder="ابحث عن مريض بالاسم أو الهاتف..." />
        </div>
      </div>

      <div style={{ padding: "16px 14px 0" }}>

        {/* Greeting + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>الأحد، ٨ يونيو ٢٠٢٥</div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.3px" }}>صباح الخير، دكتور 👋</h2>
          </div>
          <button className="d-new-btn">
            <Plus size={13} /> موعد جديد
          </button>
        </div>

        {/* Stats 2×2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} className="d-stat" style={{ "--light": s.light } as any}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: `0 4px 12px ${s.color}40` }}>
                  {s.icon}
                </div>
                <Zap size={10} color={s.color} style={{ opacity: 0.5, marginTop: 4 }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: s.color, fontWeight: 700, marginTop: 5, display: "flex", alignItems: "center", gap: 3 }}>
                <TrendingUp size={9} /> {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} color="#0ea5e9" />
              مواعيد اليوم
            </h3>
            <a href="#" style={{ color: "#0ea5e9", fontSize: 12.5, textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
              الكل <ChevronLeft size={12} />
            </a>
          </div>

          {appointments.map((a, i) => (
            <div key={a.name} className="d-appt" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${a.avatarBg}, ${a.avatarBg}cc)`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 15, flexShrink: 0, boxShadow: `0 4px 12px ${a.avatarBg}40` }}>
                {a.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 11.5, marginTop: 1.5 }}>{a.type}</div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#334155" }}>{a.time}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: statusMap[a.status].color, background: statusMap[a.status].bg, borderRadius: 20, padding: "2px 9px", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
                  {a.status === "now" && <span className="now-dot" />}
                  {statusMap[a.status].label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM TABS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e8edf5", display: "flex", zIndex: 100, boxShadow: "0 -8px 30px rgba(15,23,42,0.08)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {bottomTabs.map(t => (
          <button key={t.key} className="d-btm-tab" onClick={() => setActiveTab(t.key)} style={{ color: activeTab === t.key ? "#1d4ed8" : "#94a3b8" }}>
            {activeTab === t.key && (
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, background: "linear-gradient(90deg, #0ea5e9, #2563eb)", borderRadius: "0 0 4px 4px" }} />
            )}
            <div style={{ position: "relative" }}>
              {t.icon}
            </div>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
