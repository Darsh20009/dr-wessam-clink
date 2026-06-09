import { useState } from "react";
import { Phone, MapPin, Clock, Star, ChevronDown, MessageCircle, Award, Users, Calendar, CheckCircle, Shield, Zap, Heart, ArrowLeft } from "lucide-react";

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const services = [
    { icon: "🦷", title: "تقويم الأسنان", desc: "بأحدث التقنيات وأفضل المواد", color: "#0ea5e9", bg: "#e0f2fe" },
    { icon: "✨", title: "التقويم الشفاف", desc: "غير مرئي ومريح وفعّال", color: "#8b5cf6", bg: "#ede9fe" },
    { icon: "🦴", title: "علاج مشاكل الفك", desc: "تشخيص وعلاج اضطرابات المفصل", color: "#10b981", bg: "#d1fae5" },
    { icon: "👶", title: "تقويم الأطفال", desc: "رعاية متخصصة لابتسامة طفلك", color: "#f59e0b", bg: "#fef3c7" },
    { icon: "😁", title: "تصميم الابتسامة", desc: "ابتسامة أجمل وأكثر ثقة", color: "#ec4899", bg: "#fce7f3" },
    { icon: "⚡", title: "العلاج السريع", desc: "بروتوكولات لتقليل مدة العلاج", color: "#f97316", bg: "#ffedd5" },
  ];

  const reviews = [
    { name: "أحمد محمد", stars: 5, text: "نتائج رائعة في وقت قياسي. أنصح الجميع بالتقويم عنده.", avatar: "أ", color: "#0ea5e9" },
    { name: "سارة إبراهيم", stars: 5, text: "تجربة احترافية من أول زيارة. الدكتور متميز ومتابعة ممتازة.", avatar: "س", color: "#8b5cf6" },
    { name: "محمد علي", stars: 5, text: "النتيجة فوق التوقعات. شكراً دكتور وسام على هذه اللمسة الإنسانية.", avatar: "م", color: "#10b981" },
  ];

  const faqs = [
    { q: "كم مدة علاج التقويم؟", a: "تتراوح مدة العلاج بين 12 و24 شهراً حسب درجة تعقيد الحالة." },
    { q: "هل التقويم مؤلم؟", a: "إحساس خفيف في الأيام الأولى فقط ثم يختفي تماماً." },
    { q: "ما الفرق بين التقويم الشفاف والعادي؟", a: "التقويم الشفاف غير مرئي ومريح للإزالة، وكلاهما فعّال." },
    { q: "هل أحتاج حجز موعد مسبق؟", a: "نعم، يُفضَّل الحجز لضمان الوقت المناسب لك." },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body { overflow-x: hidden; }

        .l-nav-link { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 13.5px; font-weight: 600; transition: color 0.2s; }
        .l-nav-link:hover { color: #fff; }

        .l-btn-primary { background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border: none; border-radius: 50px; font-family: 'Cairo', sans-serif; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 6px 24px rgba(14,165,233,0.4); }
        .l-btn-primary:active { transform: scale(0.97); }

        .l-btn-ghost { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.25); color: white; border-radius: 50px; font-family: 'Cairo', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); }
        .l-btn-ghost:active { background: rgba(255,255,255,0.2); }

        .l-service-card { background: white; border-radius: 20px; padding: 20px 16px; box-shadow: 0 3px 16px rgba(0,0,0,0.06); border: 1.5px solid #f1f5f9; transition: all 0.25s; }
        .l-service-card:active { transform: scale(0.97); box-shadow: 0 8px 30px rgba(14,165,233,0.15); border-color: #bae6fd; }

        .l-review-card { background: white; border-radius: 20px; padding: 18px 16px; border: 1.5px solid #f1f5f9; box-shadow: 0 3px 14px rgba(0,0,0,0.05); }

        .l-faq-btn { width: 100%; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; background: transparent; border: none; cursor: pointer; font-family: 'Cairo', sans-serif; text-align: right; }

        .l-tag { display: inline-flex; align-items: center; gap: 6px; border-radius: 40px; padding: 5px 14px; font-size: 12px; font-weight: 700; }

        @keyframes hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(14,165,233,0.4)} 50%{box-shadow:0 0 0 12px rgba(14,165,233,0)} }
        @keyframes live-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(15,23,42,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(14,165,233,0.35)" }}>🦷</div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 13.5, letterSpacing: "-0.2px" }}>د. وسام يوسف</div>
              <div style={{ color: "#7dd3fc", fontSize: 9.5, fontWeight: 600 }}>أخصائي تقويم الأسنان</div>
            </div>
          </div>
          <a href="tel:01156798324">
            <button className="l-btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={12} /> احجز الآن
            </button>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(155deg, #0a0f1e 0%, #0f172a 35%, #1e3a8a 70%, #1d4ed8 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: 58, position: "relative", overflow: "hidden" }}>

        {/* Mesh background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: 40, left: -60, width: 250, height: 250, background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", padding: "56px 20px 60px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Availability badge */}
          <div style={{ marginBottom: 22 }}>
            <span className="l-tag" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
              <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "live-dot 1.5s infinite" }} />
              متاح للحجز — بني مزار، المنيا
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(32px, 9vw, 52px)", fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
            ابتسامة أجمل<br />
            <span style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              تبدأ من هنا
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14.5, lineHeight: 1.85, marginBottom: 30, maxWidth: 360 }}>
            د. وسام يوسف — أخصائي تقويم الأسنان، خبرة +10 سنوات بأحدث التقنيات وأعلى معايير الجودة في المنيا
          </p>

          {/* Trust items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {[
              { icon: <CheckCircle size={13} />, text: "خبرة أكثر من 10 سنوات في تقويم الأسنان", color: "#0ea5e9" },
              { icon: <CheckCircle size={13} />, text: "أحدث التقنيات والمواد المعتمدة عالمياً", color: "#22c55e" },
              { icon: <CheckCircle size={13} />, text: "رعاية شاملة ومتابعة مستمرة لكل مريض", color: "#a78bfa" },
            ].map(i => (
              <div key={i.text} style={{ display: "flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                <span style={{ color: i.color, flexShrink: 0 }}>{i.icon}</span>
                {i.text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="tel:01156798324" style={{ textDecoration: "none" }}>
              <button className="l-btn-primary" style={{ width: "100%", padding: "15px 20px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Phone size={16} /> احجز موعدك الآن
              </button>
            </a>
            <a href="https://wa.me/201156798324" style={{ textDecoration: "none" }}>
              <button className="l-btn-ghost" style={{ width: "100%", padding: "14px 20px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MessageCircle size={15} /> تواصل على واتساب
              </button>
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          {[
            { num: "+1000", label: "حالة ناجحة" },
            { num: "+10", label: "سنوات خبرة" },
            { num: "98%", label: "رضا المرضى" },
            { num: "6", label: "خدمات" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "18px 6px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>{s.num}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10.5, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div style={{ padding: "60px 20px", background: "#f8faff" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span className="l-tag" style={{ background: "#e0f2fe", color: "#0284c7", marginBottom: 14, display: "inline-flex" }}>تخصصاتنا</span>
          <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>خدمات العيادة</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 10 }}>أحدث حلول تقويم الأسنان بخبرة 10 سنوات</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {services.map(s => (
            <div key={s.title} className="l-service-card">
              <div style={{ width: 46, height: 46, background: s.bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
                {s.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0f172a", marginBottom: 5 }}>{s.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCTOR CARD */}
      <div style={{ padding: "60px 20px", background: "linear-gradient(155deg, #0f172a, #1e3a8a)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="l-tag" style={{ background: "rgba(14,165,233,0.15)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.25)", marginBottom: 14, display: "inline-flex" }}>عن الطبيب</span>
            <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 900, color: "white" }}>د. وسام يوسف</h2>
            <p style={{ color: "#7dd3fc", fontSize: 14, marginTop: 8 }}>أخصائي تقويم الأسنان — جامعة القاهرة</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "24px 20px", backdropFilter: "blur(20px)" }}>
            {/* Avatar */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ animation: "hero-float 4s ease-in-out infinite" }}>
                <div style={{ width: 96, height: 96, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 0 0 8px rgba(14,165,233,0.15), 0 16px 40px rgba(14,165,233,0.4)", animation: "pulse-glow 3s infinite", border: "3px solid rgba(255,255,255,0.15)" }}>
                  👨‍⚕️
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 16 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />)}
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginRight: 6 }}>5.0 تقييم مثالي</span>
            </div>

            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, lineHeight: 1.9, textAlign: "center", marginBottom: 20 }}>
              خبرة أكثر من 10 سنوات في تقويم الأسنان وعلاج مشاكل الفك. حاصل على بكالوريوس وماجستير طب الأسنان من جامعة القاهرة.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { val: "+10", label: "سنوات خبرة", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
                { val: "+1K", label: "مريض", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                { val: "98%", label: "نجاح", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "12px 6px", background: s.bg, borderRadius: 14, border: `1px solid ${s.color}25` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div style={{ padding: "60px 20px", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="l-tag" style={{ background: "#fef3c7", color: "#d97706", marginBottom: 14, display: "inline-flex" }}>
            <Star size={11} fill="#d97706" color="#d97706" /> التقييمات
          </span>
          <h2 style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: 900, color: "#0f172a" }}>ماذا يقول مرضانا</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map(r => (
            <div key={r.name} className="l-review-card">
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.8, marginBottom: 14 }}>"{r.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 14, boxShadow: `0 4px 12px ${r.color}35` }}>
                  {r.avatar}
                </div>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: "60px 20px", background: "#f8faff" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="l-tag" style={{ background: "#e0f2fe", color: "#0284c7", marginBottom: 14, display: "inline-flex" }}>الأسئلة الشائعة</span>
          <h2 style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: 900, color: "#0f172a" }}>أسئلة وأجوبة</h2>
        </div>
        <div style={{ borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0", background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <button className="l-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", textAlign: "right", flex: 1 }}>{f.q}</span>
                <div style={{ width: 28, height: 28, background: openFaq === i ? "#0ea5e9" : "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", flexShrink: 0, marginRight: 10 }}>
                  <ChevronDown size={14} color={openFaq === i ? "white" : "#64748b"} style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
                </div>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 18px 16px 18px", color: "#64748b", fontSize: 13.5, lineHeight: 1.8, borderTop: "1px solid #f8fafc" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(150deg, #0f172a, #1e3a8a)", padding: "60px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 52, marginBottom: 18, display: "block" }}>🦷</div>
          <h2 style={{ fontSize: "clamp(22px, 7vw, 38px)", fontWeight: 900, color: "white", marginBottom: 14, letterSpacing: "-0.5px" }}>جاهز لابتسامة أجمل؟</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, marginBottom: 32, lineHeight: 1.8, maxWidth: 340, margin: "0 auto 32px" }}>
            احجز موعدك واحصل على استشارة مجانية مع د. وسام يوسف
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, margin: "0 auto" }}>
            <a href="tel:01156798324" style={{ textDecoration: "none" }}>
              <button className="l-btn-primary" style={{ width: "100%", padding: "16px 20px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Phone size={16} /> اتصل: 01156798324
              </button>
            </a>
            <a href="https://wa.me/201156798324" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "15px 20px", fontSize: 15, background: "linear-gradient(135deg, #25d366, #16a34a)", color: "white", border: "none", borderRadius: 50, fontFamily: "'Cairo', sans-serif", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(22,163,74,0.35)" }}>
                <MessageCircle size={16} /> واتساب
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#030712", padding: "36px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦷</div>
          <span style={{ color: "white", fontWeight: 800, fontSize: 15 }}>عيادة د. وسام يوسف</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
          {[
            { icon: <MapPin size={12} />, text: "بني مزار، المنيا — فوق مكتبة الأهرام" },
            { icon: <Phone size={12} />, text: "01156798324" },
            { icon: <Clock size={12} />, text: "السبت - الخميس: 10 ص — 8 م" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 12.5 }}>
              <span style={{ color: "#0ea5e9" }}>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11.5 }}>
          © 2025 عيادة د. وسام يوسف — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}
