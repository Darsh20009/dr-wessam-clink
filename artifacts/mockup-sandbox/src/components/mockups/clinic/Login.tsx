import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, ArrowLeft, ChevronLeft } from "lucide-react";

export function Login() {
  const [tab, setTab] = useState<"doctor" | "patient">("patient");
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* animated bg mesh */
        .login-mesh {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(6,182,212,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(37,99,235,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(14,165,233,0.08) 0%, transparent 70%);
        }

        .l-grid-lines {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .login-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          padding: 30px 26px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .l-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 13px 46px 13px 16px;
          color: white;
          font-family: 'Cairo', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }
        .l-input:focus {
          border-color: rgba(6,182,212,0.7);
          background: rgba(6,182,212,0.07);
          box-shadow: 0 0 0 4px rgba(6,182,212,0.1);
        }
        .l-input::placeholder { color: rgba(255,255,255,0.3); }

        .l-btn {
          width: 100%;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #2563eb 100%);
          color: white; border: none; border-radius: 14px;
          padding: 15px;
          font-family: 'Cairo', sans-serif; font-size: 15px; font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(6,182,212,0.35);
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .l-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.6s;
        }
        .l-btn:active::after { left: 150%; }
        .l-btn:active { transform: scale(0.98); }

        .l-tab {
          flex: 1; padding: 10px 6px; border: none; border-radius: 10px;
          font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.3s;
        }
        .l-tab-on {
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: white;
          box-shadow: 0 4px 16px rgba(6,182,212,0.4);
        }
        .l-tab-off { background: transparent; color: rgba(255,255,255,0.4); }

        .l-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 40px; padding: 7px 14px;
          color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600;
        }
        .l-pill span { color: #22d3ee; }

        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.3)} }
      `}</style>

      <div className="login-mesh" />
      <div className="l-grid-lines" />

      {/* Floating orbs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 20px" }}>

        {/* Logo block */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* Tooth icon with glow */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
            <div style={{ position: "absolute", inset: -10, background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(12px)" }} />
            <div style={{
              position: "relative",
              width: 76, height: 76,
              background: "linear-gradient(145deg, #0ea5e9, #0369a1)",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 34,
              boxShadow: "0 10px 40px rgba(6,182,212,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>🦷</div>
          </div>
          <h1 style={{ color: "white", fontSize: 21, fontWeight: 900, letterSpacing: "-0.3px", marginBottom: 4 }}>عيادة د. وسام يوسف</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, fontWeight: 500 }}>أخصائي تقويم الأسنان — بني مزار، المنيا</p>

          {/* Status pill */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div className="l-pill">
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span>متاح الآن — السبت إلى الخميس</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="login-card" style={{ width: "100%", maxWidth: 390 }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: 6, borderRadius: 14, marginBottom: 26 }}>
            {[{ key: "patient", label: "👤 أنا مريض" }, { key: "doctor", label: "🩺 أنا الطبيب" }].map(t => (
              <button key={t.key} className={`l-tab ${tab === t.key ? "l-tab-on" : "l-tab-off"}`} onClick={() => setTab(t.key as any)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ color: "white", fontSize: 19, fontWeight: 800, marginBottom: 5 }}>
              {tab === "patient" ? "ادخل لمتابعة علاجك 🦷" : "لوحة تحكم الطبيب"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>
              {tab === "patient" ? "أدخل رقم هاتفك لمتابعة جلساتك ومواعيدك وملفك الطبي" : "أدخل بيانات الدخول للوصول للوحة التحكم الكاملة"}
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Phone field */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 7 }}>رقم الهاتف</label>
              <div style={{ position: "relative" }}>
                <Phone size={15} style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                <input className="l-input" type="tel" placeholder={tab === "patient" ? "01xxxxxxxxx" : "01156798324"} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 7 }}>
                {tab === "patient" ? "رمز الدخول" : "كلمة المرور"}
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", right: 15, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                <input className="l-input" type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} style={{ paddingLeft: 44 }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "left" }}>
              <a href="#" style={{ color: "#38bdf8", fontSize: 12.5, textDecoration: "none", fontWeight: 600 }}>
                {tab === "patient" ? "مشكلة في الدخول؟ تواصل مع العيادة" : "نسيت كلمة المرور؟"}
              </a>
            </div>

            <button className="l-btn">
              {tab === "patient" ? "دخول بوابة المريض ←" : "دخول لوحة التحكم ←"}
            </button>

            {tab === "patient" && (
              <div style={{ textAlign: "center", paddingTop: 4 }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>مريض جديد؟ </span>
                <a href="#" style={{ color: "#22d3ee", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>تواصل مع العيادة</a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom contact bar */}
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 40 }}>
          <a href="tel:01156798324" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.4)", fontSize: 12.5, textDecoration: "none" }}>
            <Phone size={12} color="#22d3ee" /> 01156798324
          </a>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
          <a href="https://wa.me/201156798324" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.4)", fontSize: 12.5, textDecoration: "none" }}>
            <span style={{ color: "#22c55e" }}>●</span> واتساب
          </a>
        </div>

      </div>
    </div>
  );
}
