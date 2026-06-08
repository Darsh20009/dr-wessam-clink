import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, ArrowLeft, Stethoscope } from "lucide-react";

export function Login() {
  const [tab, setTab] = useState<"doctor" | "patient">("doctor");
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", minHeight: "100vh", background: "linear-gradient(150deg, #010f24 0%, #02173c 50%, #0a2a5e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-input { width: 100%; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px 48px 14px 16px; color: white; font-family: 'Cairo', sans-serif; font-size: 15px; outline: none; transition: all 0.3s; }
        .login-input:focus { border-color: #06b6d4; background: rgba(6,182,212,0.08); box-shadow: 0 0 0 3px rgba(6,182,212,0.12); }
        .login-input::placeholder { color: rgba(255,255,255,0.35); }
        .login-btn { width: 100%; background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; border: none; border-radius: 14px; padding: 15px; font-family: 'Cairo', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-top: 8px; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,182,212,0.4); }
        .tab-btn { flex: 1; padding: 11px 8px; border: none; border-radius: 12px; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .tab-active { background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; box-shadow: 0 4px 15px rgba(6,182,212,0.35); }
        .tab-inactive { background: transparent; color: rgba(255,255,255,0.5); }
        .deco-circle { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      {/* Decorative */}
      <div className="deco-circle" style={{ width: 500, height: 500, background: "rgba(6,182,212,0.07)", top: -150, left: -150 }} />
      <div className="deco-circle" style={{ width: 400, height: 400, background: "rgba(59,130,246,0.06)", bottom: -100, right: -100 }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative" }}>
        <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #06b6d4, #0284c7)", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 30px rgba(6,182,212,0.4)" }}>
          🦷
        </div>
        <h1 style={{ color: "white", fontSize: 22, fontWeight: 900, lineHeight: 1.3 }}>عيادة د. وسام يوسف</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>أخصائي تقويم الأسنان — بني مزار، المنيا</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(30px)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.1)", padding: 28, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", position: "relative" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.05)", padding: 6, borderRadius: 16, marginBottom: 28 }}>
          {[{ key: "doctor", label: "🩺 الطبيب" }, { key: "patient", label: "👤 المريض" }].map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(t.key as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            {tab === "doctor" ? "تسجيل دخول الطبيب" : "بوابة المريض"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7 }}>
            {tab === "doctor" ? "أدخل بيانات الدخول للوصول إلى لوحة التحكم" : "أدخل رقم هاتفك لمتابعة علاجك وحجز مواعيدك"}
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Phone */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>
              <Phone size={16} />
            </div>
            <input
              className="login-input"
              type="tel"
              placeholder={tab === "doctor" ? "رقم الهاتف: 01156798324" : "رقم هاتفك المسجل"}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ paddingRight: 44 }}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>
              <Lock size={16} />
            </div>
            <input
              className="login-input"
              type={showPass ? "text" : "password"}
              placeholder="كلمة المرور"
              value={pass}
              onChange={e => setPass(e.target.value)}
              style={{ paddingRight: 44, paddingLeft: 44 }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0, display: "flex" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "left" }}>
            <a href="#" style={{ color: "#7dd3fc", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>نسيت كلمة المرور؟</a>
          </div>

          <button className="login-btn">
            {tab === "doctor" ? "دخول لوحة التحكم" : "تسجيل الدخول"}
          </button>

          {tab === "patient" && (
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>مريض جديد؟ </span>
              <a href="#" style={{ color: "#06b6d4", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>تواصل مع العيادة</a>
            </div>
          )}
        </div>
      </div>

      {/* Contact shortcut */}
      <div style={{ marginTop: 28, display: "flex", gap: 20, alignItems: "center" }}>
        <a href="tel:01156798324" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
          <Phone size={13} /> 01156798324
        </a>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
        <a href="https://wa.me/201156798324" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
          💬 واتساب
        </a>
      </div>
    </div>
  );
}
