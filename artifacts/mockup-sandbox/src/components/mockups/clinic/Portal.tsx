import { useState } from "react";
import { Calendar, FileText, CreditCard, Bell, Phone, ChevronLeft, Clock, CheckCircle, AlertCircle, Star, MessageCircle, Home, User, Settings } from "lucide-react";

export function Portal() {
  const [activeTab, setActiveTab] = useState("home");

  const sessions = [
    { date: "٢ يونيو ٢٠٢٥", type: "جلسة تقويم #8", notes: "تم تعديل الأسلاك وتغيير المطاط", paid: true, amount: 350 },
    { date: "١٠ مايو ٢٠٢٥", type: "جلسة تقويم #7", notes: "متابعة ممتازة، تقدم ملحوظ", paid: true, amount: 350 },
    { date: "١٥ أبريل ٢٠٢٥", type: "جلسة تقويم #6", notes: "تعديلات على قوس التقويم", paid: false, amount: 350 },
  ];

  const upcomingAppt = { date: "الأربعاء، ١٨ يونيو", time: "11:00 صباحاً", type: "متابعة تقويم" };

  const bottomTabs = [
    { key: "home", icon: <Home size={20} />, label: "الرئيسية" },
    { key: "appts", icon: <Calendar size={20} />, label: "المواعيد" },
    { key: "files", icon: <FileText size={20} />, label: "الملف" },
    { key: "payments", icon: <CreditCard size={20} />, label: "المدفوعات" },
    { key: "profile", icon: <User size={20} />, label: "حسابي" },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#f0f4f8", minHeight: "100vh", paddingBottom: 70 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .bottom-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: none; background: transparent; cursor: pointer; padding: 8px 4px; font-family: 'Cairo', sans-serif; font-size: 10px; font-weight: 600; transition: color 0.2s; }
        .card { background: white; border-radius: 18px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
        .session-row { border-bottom: 1px solid #f1f5f9; padding: 14px 0; }
        .session-row:last-child { border-bottom: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #02173c 0%, #0a2a5e 60%, #0c4a6e 100%)", padding: "20px 16px 32px", borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #06b6d4, #0284c7)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🦷</div>
            <div style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 700 }}>عيادة د. وسام يوسف</div>
          </div>
          <button style={{ position: "relative", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={17} color="white" />
            <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #0a2a5e" }} />
          </button>
        </div>

        {/* Patient Greeting */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, background: "rgba(255,255,255,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "2px solid rgba(255,255,255,0.2)" }}>
            👤
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 2 }}>أهلاً بك،</div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 900 }}>أحمد محمد</div>
            <div style={{ color: "#7dd3fc", fontSize: 12, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
              مريض نشط — تقويم أسنان
            </div>
          </div>
        </div>

        {/* Treatment Progress */}
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>تقدم العلاج</span>
            <span style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 800 }}>65%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 50, height: 8, overflow: "hidden" }}>
            <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #06b6d4, #38bdf8)", borderRadius: 50 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>بدأ: يناير ٢٠٢٥</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>المتوقع: ديسمبر ٢٠٢٦</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Next Appointment */}
        <div className="card" style={{ marginBottom: 14, background: "linear-gradient(135deg, #0284c7, #0369a1)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🗓️ موعدك القادم</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{upcomingAppt.date}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
                <Clock size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {upcomingAppt.time} — {upcomingAppt.type}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 14px" }}>
              <div style={{ color: "white", fontSize: 11, fontWeight: 700, textAlign: "center" }}>بعد</div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 900, textAlign: "center", lineHeight: 1 }}>10</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textAlign: "center" }}>أيام</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[
            { icon: <Phone size={20} />, label: "اتصل بالعيادة", color: "#0284c7", bg: "#e0f2fe", action: "tel:01156798324" },
            { icon: <MessageCircle size={20} />, label: "واتساب", color: "#059669", bg: "#d1fae5", action: "https://wa.me/201156798324" },
          ].map(q => (
            <a key={q.label} href={q.action} style={{ textDecoration: "none" }}>
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 40, height: 40, background: q.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: q.color, flexShrink: 0 }}>
                  {q.icon}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{q.label}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>آخر الجلسات</h3>
            <a href="#" style={{ color: "#0284c7", fontSize: 13, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>كل الجلسات <ChevronLeft size={13} /></a>
          </div>
          {sessions.map((s, i) => (
            <div key={i} className="session-row">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: s.paid ? "#d1fae5" : "#fee2e2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.paid ? <CheckCircle size={17} color="#059669" /> : <AlertCircle size={17} color="#ef4444" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.type}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: s.paid ? "#059669" : "#ef4444" }}>{s.amount} ج</div>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{s.date}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3, lineHeight: 1.6 }}>{s.notes}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM TABS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e2e8f0", display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
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
