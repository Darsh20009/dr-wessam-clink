import { useState } from "react";
import { Phone, MapPin, Clock, Star, ChevronDown, MessageCircle, Award, Users, Calendar, CheckCircle, Menu, X, Heart, Zap, Shield } from "lucide-react";

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { num: "+1000", label: "حالة ناجحة" },
    { num: "+10", label: "سنوات خبرة" },
    { num: "98%", label: "رضا المرضى" },
    { num: "6", label: "خدمات متخصصة" },
  ];

  const services = [
    { icon: "🦷", title: "تقويم الأسنان", desc: "بأحدث التقنيات وأفضل المواد العالمية" },
    { icon: "✨", title: "التقويم الشفاف", desc: "تقويم غير مرئي مريح وفعّال" },
    { icon: "🦴", title: "علاج مشاكل الفك", desc: "تشخيص وعلاج اضطرابات المفصل" },
    { icon: "👶", title: "تقويم الأطفال", desc: "رعاية متخصصة لابتسامة طفلك" },
    { icon: "😁", title: "تصميم الابتسامة", desc: "ابتسامة أجمل وأكثر ثقة" },
    { icon: "⚡", title: "العلاج السريع", desc: "بروتوكولات لتقليل مدة العلاج" },
  ];

  const reviews = [
    { name: "أحمد محمد", stars: 5, text: "دكتور ممتاز، نتائج رائعة في وقت قياسي. أنصح الجميع بالتقويم عنده." },
    { name: "سارة إبراهيم", stars: 5, text: "تجربة احترافية من أول زيارة. الدكتور متميز ومتابعة ممتازة." },
    { name: "محمد علي", stars: 5, text: "الحمد لله انتهى التقويم والنتيجة فوق التوقعات. شكراً دكتور وسام." },
  ];

  const faqs = [
    { q: "كم مدة علاج التقويم؟", a: "تتراوح مدة علاج التقويم بين 12 و24 شهراً حسب الحالة." },
    { q: "هل التقويم مؤلم؟", a: "قد يكون هناك إحساس خفيف في الأيام الأولى ثم يختفي تدريجياً." },
    { q: "ما الفرق بين التقويم العادي والشفاف؟", a: "التقويم الشفاف غير مرئي ومريح، وكلاهما فعّال حسب الحالة." },
    { q: "هل أحتاج حجز موعد مسبق؟", a: "نعم، يُفضّل الحجز المسبق لضمان الوقت المناسب." },
  ];

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        .nav-link { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .btn-primary { background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; border: none; border-radius: 50px; font-family: 'Cairo', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(6,182,212,0.5); }
        .btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.5); color: white; border-radius: 50px; font-family: 'Cairo', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-outline:hover { background: rgba(255,255,255,0.15); border-color: white; }
        .service-card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.07); border: 1px solid #f1f5f9; transition: all 0.3s; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(2,132,199,0.15); border-color: #bae6fd; }
        .review-card { background: #f8faff; border-radius: 20px; padding: 20px; border: 1px solid #e2eeff; }
        .faq-item { border-bottom: 1px solid #e2e8f0; }
        .stat-card { text-align: center; }
        @media (max-width: 640px) {
          .hero-btns { flex-direction: column !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(2,23,60,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #06b6d4, #0284c7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🦷</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>د. وسام يوسف</div>
              <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 500 }}>أخصائي تقويم الأسنان</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="desktop-nav">
            {["الخدمات", "الطبيب", "التقييمات", "اتصل بنا"].map(item => (
              <a key={item} href="#" className="nav-link">{item}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="tel:01156798324" style={{ background: "rgba(6,182,212,0.15)", color: "#7dd3fc", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 50, padding: "7px 14px", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={13} /> احجز
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(150deg, #02173c 0%, #0a2a5e 40%, #0c4a6e 100%)", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 60, position: "relative", overflow: "hidden" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: "rgba(6,182,212,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -50, width: 300, height: 300, background: "rgba(59,130,246,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: 50, padding: "6px 14px", marginBottom: 24 }}>
                <div style={{ width: 6, height: 6, background: "#06b6d4", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 600 }}>متاح للحجز الآن — بني مزار، المنيا</span>
              </div>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, color: "white", lineHeight: 1.3, marginBottom: 16 }}>
                ابتسامة أجمل<br />
                <span style={{ background: "linear-gradient(135deg, #06b6d4, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>تبدأ من هنا</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.8, marginBottom: 32, maxWidth: 480 }}>
                د. وسام يوسف أخصائي تقويم الأسنان — خبرة +10 سنوات بأحدث التقنيات وأعلى معايير الجودة في بني مزار
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }} className="hero-btns">
                <a href="tel:01156798324">
                  <button className="btn-primary" style={{ padding: "14px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={16} /> احجز موعد الآن
                  </button>
                </a>
                <a href="https://wa.me/201156798324" target="_blank">
                  <button className="btn-outline" style={{ padding: "14px 24px", fontSize: 15, display: "flex", alignItems: "center", gap: 8, color: "white" }}>
                    <MessageCircle size={16} /> واتساب
                  </button>
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
                {[{ icon: <Shield size={14} />, text: "معتمد طبياً" }, { icon: <Award size={14} />, text: "عضو جمعية التقويم" }, { icon: <Heart size={14} />, text: "أكثر من 1000 مريض" }].map(b => (
                  <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                    <span style={{ color: "#06b6d4" }}>{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 28, padding: 32, textAlign: "center", maxWidth: 320, width: "100%" }}>
                <div style={{ width: 120, height: 120, margin: "0 auto 20px", borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(6,182,212,0.5)", background: "linear-gradient(135deg, #0284c7, #0c4a6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>
                  👨‍⚕️
                </div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>د. وسام يوسف</div>
                <div style={{ color: "#7dd3fc", fontSize: 13, marginBottom: 16 }}>أخصائي تقويم الأسنان</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>بكالوريوس + ماجستير • جامعة القاهرة</div>
                <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(6,182,212,0.15)", borderRadius: 12, color: "#7dd3fc", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Clock size={12} /> السبت - الخميس: 10ص - 8م
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", padding: "48px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="stats-grid">
            {stats.map(s => (
              <div key={s.num} className="stat-card">
                <div style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "white", lineHeight: 1 }}>{s.num}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <div style={{ padding: "80px 20px", background: "#f8faff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0284c7", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>خدماتنا</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#0f172a" }}>تخصصات العيادة</h2>
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>نقدم أحدث حلول تقويم الأسنان بخبرة 10 سنوات</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="services-grid">
            {services.map(s => (
              <div key={s.title} className="service-card">
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#fef3c7", color: "#d97706", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>التقييمات</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#0f172a" }}>ماذا يقول مرضانا</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="reviews-grid">
            {reviews.map(r => (
              <div key={r.name} className="review-card">
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={{ color: "#334155", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>"{r.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #0284c7, #06b6d4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>{r.name[0]}</div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{r.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: "80px 20px", background: "#f8faff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0284c7", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>الأسئلة الشائعة</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#0f172a" }}>أجوبة على أسئلتك</h2>
          </div>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }}>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", textAlign: "right" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{f.q}</span>
                  <ChevronDown size={16} color="#0284c7" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0, marginRight: 8 }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", color: "#64748b", fontSize: 14, lineHeight: 1.8 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(150deg, #02173c, #0a2a5e)", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🦷</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "white", marginBottom: 16 }}>جاهز لابتسامة أجمل؟</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginBottom: 32, lineHeight: 1.8 }}>احجز موعدك الآن واحصل على استشارة مجانية مع د. وسام يوسف</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:01156798324">
              <button className="btn-primary" style={{ padding: "16px 32px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={17} /> اتصل الآن: 01156798324
              </button>
            </a>
            <a href="https://wa.me/201156798324" target="_blank">
              <button style={{ padding: "16px 28px", fontSize: 15, background: "#25d366", color: "white", border: "none", borderRadius: 50, fontFamily: "'Cairo', sans-serif", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <MessageCircle size={17} /> واتساب
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#010d1f", padding: "40px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #06b6d4, #0284c7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦷</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>عيادة د. وسام يوسف</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { icon: <MapPin size={13} />, text: "بني مزار، المنيا، فوق مكتبة الأهرام" },
              { icon: <Phone size={13} />, text: "01156798324" },
              { icon: <Clock size={13} />, text: "السبت - الخميس: 10ص - 8م" },
            ].map(i => (
              <div key={i.text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                <span style={{ color: "#0284c7" }}>{i.icon}</span> {i.text}
              </div>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>© 2025 عيادة د. وسام يوسف — جميع الحقوق محفوظة</div>
        </div>
      </footer>
    </div>
  );
}
