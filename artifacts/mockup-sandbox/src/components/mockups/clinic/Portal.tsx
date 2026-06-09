import { useState } from "react";
import { Calendar, FileText, CreditCard, Bell, Phone, ChevronLeft, Clock, CheckCircle, AlertCircle, MessageCircle, Home, User, ChevronDown, ChevronUp, Star } from "lucide-react";

export function Portal() {
  const [activeTab, setActiveTab] = useState("home");
  const [expandSession, setExpandSession] = useState<number | null>(0);

  const sessions = [
    { date: "٢ يونيو ٢٠٢٥", type: "جلسة تقويم #8", notes: "تم تعديل الأسلاك وتغيير المطاط — تقدم ممتاز", paid: true, amount: 350 },
    { date: "١٠ مايو ٢٠٢٥", type: "جلسة تقويم #7", notes: "متابعة ممتازة، تقدم ملحوظ في المحاذاة", paid: true, amount: 350 },
    { date: "١٥ أبريل ٢٠٢٥", type: "جلسة تقويم #6", notes: "تعديلات على قوس التقويم", paid: false, amount: 350 },
  ];

  const nextApt = { date: "الأربعاء، ١٨ يونيو", time: "11:00 صباحاً", type: "متابعة تقويم", days: 10 };
  const progress = 65;

  const bottomTabs = [
    { key: "home", icon: <Home size={20} />, label: "الرئيسية" },
    { key: "appts", icon: <Calendar size={20} />, label: "المواعيد" },
    { key: "files", icon: <FileText size={20} />, label: "الملف" },
    { key: "payments", icon: <CreditCard size={20} />, label: "المدفوعات" },
    { key: "profile", icon: <User size={20} />, label: "حسابي" },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#f1f5fb", minHeight: "100vh", paddingBottom: 72 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .p-card { background: white; border-radius: 20px; padding: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.05); border: 1px solid #e8edf5; }
        .p-btm-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: none; background: transparent; cursor: pointer; padding: 7px 4px 5px; font-family: 'Cairo', sans-serif; font-size: 10px; font-weight: 700; transition: color 0.2s; position: relative; }

        @keyframes progress-fill { from { width: 0% } }
        .prog-bar { animation: progress-fill 1.4s cubic-bezier(0.4,0,0.2,1) forwards; }

        @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .float-badge { animation: float-up 3s ease-in-out infinite; }

        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .live-dot { animation: pulse-live 1.5s ease-in-out infinite; }
      `}</style>

      {/* HERO HEADER */}
      <div style={{ background: "linear-gradient(150deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)", padding: "20px 16px 0", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: "hidden", position: "relative", boxShadow: "0 8px 40px rgba(15,23,42,0.35)" }}>

        {/* background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div style={{ position: "absolute", top: -60, right: -40, width: 180, height: 180, background: "rgba(14,165,233,0.12)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, background: "rgba(139,92,246,0.12)", borderRadius: "50%", filter: "blur(30px)" }} />

        {/* Top bar */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(14,165,233,0.4)" }}>🦷</div>
            <span style={{ color: "#7dd3fc", fontSize: 12.5, fontWeight: 700 }}>عيادة د. وسام يوسف</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ position: "relative", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell size={15} color="white" />
              <span className="live-dot" style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #1e3a8a", display: "block" }} />
            </button>
          </div>
        </div>

        {/* Patient greeting */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 58, height: 58, background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06))", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0, backdropFilter: "blur(10px)" }}>
            أح
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11.5, marginBottom: 2, fontWeight: 600 }}>مرحباً بك،</div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1 }}>أحمد محمد</div>
            <div style={{ color: "#7dd3fc", fontSize: 11.5, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
              مريض نشط — تقويم أسنان
            </div>
          </div>
        </div>

        {/* Progress block */}
        <div style={{ position: "relative", background: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, fontWeight: 700 }}>🦷 تقدم خطة العلاج</span>
            <span style={{ background: "rgba(14,165,233,0.2)", color: "#38bdf8", padding: "3px 10px", borderRadius: 20, fontSize: 13, fontWeight: 900, border: "1px solid rgba(14,165,233,0.3)" }}>{progress}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 50, height: 9, overflow: "hidden" }}>
            <div className="prog-bar" style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #06b6d4)", borderRadius: 50, boxShadow: "0 0 12px rgba(14,165,233,0.5)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10.5 }}>بدأ: يناير ٢٠٢٥</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10.5 }}>المتوقع: ديسمبر ٢٠٢٦</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { val: "1", label: "موعد قادم", icon: "📅" },
            { val: "8", label: "جلسة علاج", icon: "🦷" },
            { val: "70%", label: "نسبة السداد", icon: "💰" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "12px 6px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: 17, lineHeight: 1 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 14px 0" }}>

        {/* Next Appointment */}
        <div className="p-card" style={{ marginBottom: 12, background: "linear-gradient(135deg, #1d4ed8, #2563eb)", border: "none", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>🗓️ موعدك القادم</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: "-0.3px" }}>{nextApt.date}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={11} /> {nextApt.time} — {nextApt.type}
              </div>
            </div>
            <div className="float-badge" style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 14px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700 }}>بعد</div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{nextApt.days}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>أيام</div>
            </div>
          </div>
        </div>

        {/* Contact actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <a href="tel:01156798324" style={{ textDecoration: "none" }}>
            <div className="p-card" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}>
                <Phone size={17} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>اتصل بالعيادة</span>
            </div>
          </a>
          <a href="https://wa.me/201156798324" style={{ textDecoration: "none" }}>
            <div className="p-card" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #25d366, #16a34a)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>
                <MessageCircle size={17} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>واتساب</span>
            </div>
          </a>
        </div>

        {/* Sessions */}
        <div className="p-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" /> آخر الجلسات
            </h3>
            <a href="#" style={{ color: "#0ea5e9", fontSize: 12, textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>الكل <ChevronLeft size={11} /></a>
          </div>
          {sessions.map((s, i) => (
            <div key={i} style={{ borderBottom: i < sessions.length - 1 ? "1px solid #f1f5f9" : "none", paddingBottom: i < sessions.length - 1 ? 12 : 0, marginBottom: i < sessions.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }} onClick={() => setExpandSession(expandSession === i ? null : i)}>
                <div style={{ width: 36, height: 36, background: s.paid ? "#d1fae5" : "#fee2e2", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.paid ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.type}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: s.paid ? "#10b981" : "#ef4444" }}>{s.amount} ج</span>
                      {expandSession === i ? <ChevronUp size={12} color="#94a3b8" /> : <ChevronDown size={12} color="#94a3b8" />}
                    </div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>{s.date}</div>
                  {expandSession === i && (
                    <div style={{ marginTop: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 10, color: "#64748b", fontSize: 11.5, lineHeight: 1.7 }}>
                      📝 {s.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM TABS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e8edf5", display: "flex", zIndex: 100, boxShadow: "0 -8px 30px rgba(15,23,42,0.08)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {bottomTabs.map(t => (
          <button key={t.key} className="p-btm-tab" onClick={() => setActiveTab(t.key)} style={{ color: activeTab === t.key ? "#1d4ed8" : "#94a3b8" }}>
            {activeTab === t.key && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 26, height: 3, background: "linear-gradient(90deg,#0ea5e9,#2563eb)", borderRadius: "0 0 4px 4px" }} />}
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
