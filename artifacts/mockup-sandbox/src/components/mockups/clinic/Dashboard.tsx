import { useState } from "react";
import { Users, Calendar, DollarSign, TrendingUp, Bell, Search, Menu, Home, FileText, Settings, LogOut, ChevronLeft, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { icon: <Users size={20} />, label: "المرضى", value: "248", change: "+12 هذا الشهر", color: "#0284c7", bg: "#e0f2fe" },
    { icon: <Calendar size={20} />, label: "مواعيد اليوم", value: "8", change: "3 متبقية", color: "#7c3aed", bg: "#ede9fe" },
    { icon: <DollarSign size={20} />, label: "إيرادات الشهر", value: "12,400", change: "+18% من الشهر", color: "#059669", bg: "#d1fae5" },
    { icon: <TrendingUp size={20} />, label: "جلسات اليوم", value: "14", change: "6 مكتملة", color: "#d97706", bg: "#fef3c7" },
  ];

  const appointments = [
    { name: "أحمد محمد علي", time: "10:00 ص", type: "متابعة تقويم", status: "done", avatar: "أ" },
    { name: "سارة إبراهيم", time: "11:30 ص", type: "تقييم أولي", status: "now", avatar: "س" },
    { name: "محمد خالد", time: "1:00 م", type: "تقويم شفاف", status: "next", avatar: "م" },
    { name: "فاطمة أحمد", time: "2:30 م", type: "متابعة", status: "next", avatar: "ف" },
    { name: "عمر سعيد", time: "4:00 م", type: "تصميم ابتسامة", status: "next", avatar: "ع" },
  ];

  const statusMap: any = {
    done: { label: "مكتمل", color: "#059669", bg: "#d1fae5" },
    now: { label: "الآن ●", color: "#0284c7", bg: "#e0f2fe" },
    next: { label: "قادم", color: "#64748b", bg: "#f1f5f9" },
  };

  const bottomTabs = [
    { key: "home", icon: <Home size={20} />, label: "الرئيسية" },
    { key: "patients", icon: <Users size={20} />, label: "المرضى" },
    { key: "calendar", icon: <Calendar size={20} />, label: "المواعيد" },
    { key: "files", icon: <FileText size={20} />, label: "الملفات" },
    { key: "settings", icon: <Settings size={20} />, label: "الإعدادات" },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#f0f4f8", minHeight: "100vh", paddingBottom: 70, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .stat-card { background: white; border-radius: 18px; padding: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: all 0.2s; }
        .appt-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border-radius: 14px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .bottom-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: none; background: transparent; cursor: pointer; padding: 8px 4px; font-family: 'Cairo', sans-serif; font-size: 10px; font-weight: 600; transition: all 0.2s; }
        .search-input { background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 10px 40px 10px 14px; color: white; font-family: 'Cairo', sans-serif; font-size: 14px; outline: none; width: 100%; }
        .search-input::placeholder { color: rgba(255,255,255,0.45); }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: "linear-gradient(135deg, #02173c, #0a2a5e)", padding: "16px 16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #06b6d4, #0284c7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🦷</div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>د. وسام يوسف</div>
              <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 500 }}>لوحة التحكم</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{ width: 38, height: 38, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={17} color="white" />
              <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #0a2a5e" }} />
            </button>
            <button style={{ width: 38, height: 38, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Menu size={17} color="white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
          <input className="search-input" placeholder="ابحث عن مريض..." />
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>الأحد، ٨ يونيو ٢٠٢٥</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>مرحباً، جاهز لليوم؟ 👋</p>
          </div>
          <button style={{ background: "linear-gradient(135deg, #06b6d4, #0284c7)", color: "white", border: "none", borderRadius: 12, padding: "8px 14px", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Plus size={14} /> موعد جديد
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.change}</div>
                </div>
                <div style={{ width: 38, height: 38, background: s.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>مواعيد اليوم</h3>
            <a href="#" style={{ color: "#0284c7", fontSize: 13, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>كل المواعيد <ChevronLeft size={13} /></a>
          </div>

          {appointments.map(a => (
            <div key={a.name} className="appt-row">
              <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #0284c7, #06b6d4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {a.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 1 }}>{a.type}</div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{a.time}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: statusMap[a.status].color, background: statusMap[a.status].bg, borderRadius: 20, padding: "2px 8px", marginTop: 3 }}>
                  {statusMap[a.status].label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM TABS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e2e8f0", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
        {bottomTabs.map(t => (
          <button key={t.key} className="bottom-tab" onClick={() => setActiveTab(t.key)} style={{ color: activeTab === t.key ? "#0284c7" : "#94a3b8" }}>
            {t.icon}
            <span>{t.label}</span>
            {activeTab === t.key && <div style={{ width: 4, height: 4, background: "#0284c7", borderRadius: "50%" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
