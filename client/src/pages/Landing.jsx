import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaStar, FaGraduationCap, FaTrophy, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FiCalendar, FiUser, FiChevronDown, FiClock, FiAward, FiCheck, FiArrowLeft } from 'react-icons/fi';

const defaultSettings = {
  heroTitle: 'ابتسامة أجمل تبدأ من د. وسام يوسف',
  heroSubtitle: 'خبرة متخصصة في تقويم الأسنان بأحدث التقنيات وأعلى معايير الجودة',
  doctorName: 'د. وسام يوسف',
  doctorTitle: 'أخصائي تقويم الأسنان',
  doctorBio: 'طبيب متخصص في تقويم الأسنان بخبرة أكثر من 10 سنوات في علاج حالات التقويم المختلفة للأطفال والبالغين.',
  doctorExperience: '+10 سنوات خبرة',
  doctorPatients: '+1000 مريض سعيد',
  doctorSuccess: '98% نسبة نجاح',
  phone: '01156798324',
  whatsapp: '201156798324',
  address: 'القاهرة، مصر',
  workingHours: 'السبت - الخميس: 10 ص - 8 م',
  certificates: [
    { title: 'بكالوريوس طب الأسنان', year: '2010', institution: 'جامعة القاهرة' },
    { title: 'ماجستير تقويم الأسنان', year: '2014', institution: 'جامعة القاهرة' },
  ],
  achievements: [
    { title: '+1000 حالة ناجحة', description: 'علاج حالات متنوعة بنتائج متميزة' },
    { title: 'عضو جمعية التقويم', description: 'عضو فعّال في الجمعية العلمية المصرية' },
  ],
  services: [
    { icon: '🦷', title: 'تقويم الأسنان', description: 'تقويم احترافي بأحدث التقنيات وأفضل المواد العالمية', isActive: true },
    { icon: '💎', title: 'التقويم الشفاف', description: 'تقويم غير مرئي مريح وفعّال لنتائج مثالية', isActive: true },
    { icon: '🦴', title: 'علاج مشاكل الفك', description: 'تشخيص وعلاج شامل لاضطرابات المفصل الفكي', isActive: true },
    { icon: '👶', title: 'تقويم الأطفال', description: 'رعاية متخصصة لتقويم أسنان الأطفال', isActive: true },
    { icon: '😁', title: 'تصميم الابتسامة', description: 'إعادة تصميم ابتسامتك لتكون أكثر جمالاً', isActive: true },
    { icon: '⚡', title: 'العلاج السريع', description: 'بروتوكولات حديثة لتقليل مدة العلاج', isActive: true },
  ],
  reviews: [
    { name: 'أحمد محمد', rating: 5, text: 'دكتور ممتاز، نتائج رائعة في وقت قياسي. أنصح الجميع بالتقويم عنده.', isActive: true },
    { name: 'سارة إبراهيم', rating: 5, text: 'تجربة احترافية من أول زيارة. الدكتور متميز ومتابعة ممتازة.', isActive: true },
    { name: 'محمد علي', rating: 5, text: 'الحمد لله انتهى التقويم والنتيجة فوق التوقعات.', isActive: true },
  ],
  faqs: [
    { question: 'كم مدة علاج التقويم؟', answer: 'تتراوح مدة علاج التقويم عادةً بين 12 و24 شهراً حسب الحالة.', isActive: true },
    { question: 'هل التقويم مؤلم؟', answer: 'قد يكون هناك إحساس خفيف في الأيام الأولى ثم يختفي تدريجياً.', isActive: true },
    { question: 'ما الفرق بين التقويم العادي والشفاف؟', answer: 'التقويم الشفاف غير مرئي ومريح أكثر، لكن كلاهما فعّال حسب الحالة.', isActive: true },
    { question: 'هل أحتاج لحجز موعد مسبق؟', answer: 'نعم، يُفضّل حجز موعد مسبق لضمان الوقت المناسب.', isActive: true },
  ],
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

  .landing-root { font-family: 'Cairo', sans-serif; direction: rtl; color: #f1f5f9; background: #030b1a; }

  @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) rotate(5deg)} }
  @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(-8deg)} }
  @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes counter { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }

  .hero-gradient {
    background: linear-gradient(135deg, #030b1a 0%, #061428 30%, #0a1f3d 60%, #062040 100%);
    position: relative;
    overflow: hidden;
  }

  .glass-card {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
  }

  .glass-card-blue {
    background: rgba(14,165,233,0.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(14,165,233,0.15);
    border-radius: 20px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #0ea5e9 70%, #38bdf8 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .gold-text {
    background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn-glow {
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: white;
    border: none;
    padding: 16px 36px;
    border-radius: 14px;
    font-weight: 800;
    font-size: 16px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    transition: all 0.3s;
    box-shadow: 0 0 30px rgba(14,165,233,0.35), 0 4px 15px rgba(0,0,0,0.3);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(14,165,233,0.5), 0 8px 25px rgba(0,0,0,0.4); }

  .btn-outline-glass {
    background: rgba(255,255,255,0.07);
    color: white;
    border: 1.5px solid rgba(255,255,255,0.2);
    padding: 16px 36px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    backdrop-filter: blur(10px);
  }
  .btn-outline-glass:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.35); transform: translateY(-2px); }

  .service-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    transition: all 0.35s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(37,99,235,0.05));
    opacity: 0;
    transition: opacity 0.35s;
    border-radius: 20px;
  }
  .service-card:hover { transform: translateY(-6px); border-color: rgba(14,165,233,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(14,165,233,0.1); }
  .service-card:hover::before { opacity: 1; }

  .review-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px;
    transition: all 0.3s;
  }
  .review-card:hover { border-color: rgba(14,165,233,0.25); transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.25); }

  .stat-item { text-align: center; }
  .stat-num { font-size: 52px; font-weight: 900; line-height: 1; margin-bottom: 8px; }
  .stat-label { font-size: 14px; color: rgba(255,255,255,0.55); }

  .nav-link { color: rgba(255,255,255,0.7); font-weight: 600; font-size: 14px; text-decoration: none; transition: color 0.2s; padding: 6px 4px; }
  .nav-link:hover { color: white; }

  .faq-item { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; margin-bottom: 10px; overflow: hidden; transition: border-color 0.2s; }
  .faq-item.open { border-color: rgba(14,165,233,0.3); }
  .faq-btn { width: 100%; padding: 20px 24px; background: rgba(255,255,255,0.03); border: none; display: flex; align-items: center; justify-content: space-between; font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; color: white; cursor: pointer; text-align: right; }
  .faq-answer { padding: 0 24px 20px; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.9; }

  .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }

  .section-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25); color: #38bdf8; padding: 6px 16px; border-radius: 30px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }

  .divider-glow { height: 1px; background: linear-gradient(90deg, transparent, rgba(14,165,233,0.4), rgba(37,99,235,0.4), transparent); margin: 0 auto; }

  .contact-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px 20px; text-align: center; text-decoration: none; display: block; transition: all 0.3s; }
  .contact-card:hover { background: rgba(14,165,233,0.08); border-color: rgba(14,165,233,0.3); transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.3); }

  .logo-img { mix-blend-mode: screen; }
  .logo-img-dark { mix-blend-mode: screen; filter: brightness(1.15) drop-shadow(0 4px 16px rgba(14,165,233,0.4)); }
`;

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    axios.get('/api/site').then(r => {
      if (r.data && r.data._id) setSettings({ ...defaultSettings, ...r.data });
    }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeServices = (settings.services || []).filter(s => s.isActive !== false);
  const activeReviews = (settings.reviews || []).filter(r => r.isActive !== false);
  const activeFaqs = (settings.faqs || []).filter(f => f.isActive !== false);

  return (
    <>
      <style>{STYLE}</style>
      <div className="landing-root">

        {/* ── NAVBAR ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(3,11,26,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          padding: '0 5%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo-transparent.png" alt="logo" className="logo-img-dark" style={{ height: '46px', width: '46px', objectFit: 'cover', borderRadius: '12px' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '17px', color: 'white', letterSpacing: '0.3px' }}>{settings.doctorName}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{settings.doctorTitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a href="#about" className="nav-link">عن الطبيب</a>
            <a href="#services" className="nav-link">الخدمات</a>
            <a href="#reviews" className="nav-link">آراء المرضى</a>
            <a href="#contact" className="nav-link">تواصل معنا</a>
            <button onClick={() => navigate('/login')} className="btn-glow" style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '10px' }}>
              <FiUser size={14} /> دخول النظام
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 5% 60px', position: 'relative' }}>

          {/* Background orbs */}
          <div className="orb" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', top: '-100px', right: '-150px' }} />
          <div className="orb" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', bottom: '-100px', left: '10%' }} />
          <div className="orb" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', top: '30%', left: '40%' }} />

          {/* Floating geometric shapes */}
          <div style={{ position: 'absolute', top: '15%', right: '12%', width: '80px', height: '80px', border: '1.5px solid rgba(14,165,233,0.25)', borderRadius: '18px', animation: 'float1 7s ease-in-out infinite', transform: 'rotate(20deg)' }} />
          <div style={{ position: 'absolute', top: '60%', right: '6%', width: '50px', height: '50px', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '50%', animation: 'float2 9s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '8%', width: '60px', height: '60px', border: '1.5px solid rgba(14,165,233,0.2)', borderRadius: '12px', animation: 'float3 6s ease-in-out infinite', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', top: '25%', left: '15%', width: '10px', height: '10px', background: '#0ea5e9', borderRadius: '50%', opacity: 0.6, animation: 'float2 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '35%', right: '22%', width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', opacity: 0.5, animation: 'float1 8s ease-in-out infinite' }} />

          <div style={{ maxWidth: '760px', position: 'relative', zIndex: 2, animation: 'fadeUp 0.8s ease-out' }}>
            <div className="section-tag" style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '16px' }}>🦷</span> عيادة تقويم الأسنان المتخصصة
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '24px', color: 'white' }}>
              ابتسامة أجمل<br />
              <span className="gradient-text">تبدأ من هنا</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', lineHeight: 1.9, marginBottom: '20px', maxWidth: '540px' }}>
              {settings.heroSubtitle}
            </p>

            {/* Checkpoints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
              {['خبرة أكثر من 10 سنوات في تقويم الأسنان', 'أحدث التقنيات والمواد العالمية', 'رعاية شاملة ومتابعة دقيقة لكل مريض'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiCheck style={{ color: '#38bdf8', fontSize: '12px' }} />
                  </div>
                  {t}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="btn-glow">
                <FaWhatsapp size={18} /> احجز موعدك الآن
              </a>
              <button onClick={() => navigate('/login')} className="btn-outline-glass">
                <FiUser size={16} /> بوابة المريض
              </button>
            </div>
          </div>

          {/* Stats floating card */}
          <div style={{ position: 'absolute', bottom: '40px', left: '5%', right: '5%', zIndex: 2 }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', padding: '28px 40px', maxWidth: '700px', margin: '0 auto' }}>
              {[
                { num: '1000+', label: 'مريض سعيد', color: '#38bdf8' },
                { num: '98%', label: 'نسبة النجاح', color: '#f59e0b' },
                { num: '10+', label: 'سنوات خبرة', color: '#34d399' },
                { num: '5★', label: 'تقييم المرضى', color: '#a78bfa' },
              ].map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #030b1a 0%, #061020 100%)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-tag">تعرف على الطبيب</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white' }}>
                نبذة عن <span className="gradient-text">{settings.doctorName}</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', animation: 'rotate-slow 8s linear infinite', opacity: 0.6 }} />
                    <img src="/logo-transparent.png" alt="doctor" className="logo-img-dark" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: '24px', color: 'white' }}>{settings.doctorName}</h3>
                    <p style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 600 }}>{settings.doctorTitle}</p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {[1,2,3,4,5].map(i => <FaStar key={i} style={{ color: '#f59e0b', fontSize: '13px' }} />)}
                    </div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 2, fontSize: '15px', marginBottom: '32px' }}>{settings.doctorBio}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { val: '+10', label: 'سنوات', color: '#0ea5e9' },
                    { val: '+1K', label: 'مريض', color: '#f59e0b' },
                    { val: '98%', label: 'نجاح', color: '#34d399' },
                  ].map((s, i) => (
                    <div key={i} className="glass-card-blue" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: certificates */}
              <div>
                {settings.certificates?.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
                      <FaGraduationCap style={{ color: '#0ea5e9' }} /> المؤهلات والشهادات
                    </h4>
                    {settings.certificates.map((c, i) => (
                      <div key={i} className="glass-card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px', padding: '16px 20px', borderRight: '3px solid #0ea5e9' }}>
                        <FiAward style={{ color: '#0ea5e9', marginTop: '2px', flexShrink: 0, fontSize: '18px' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{c.title}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{c.institution}{c.year && ` — ${c.year}`}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {settings.achievements?.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
                      <FaTrophy style={{ color: '#f59e0b' }} /> الإنجازات
                    </h4>
                    {settings.achievements.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>🏆</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{a.title}</div>
                          {a.description && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{a.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" style={{ padding: '100px 5%', background: '#040d1e' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-tag">خدماتنا</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', marginBottom: '14px' }}>
                ماذا نقدم <span className="gradient-text">لك؟</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>خدمات متكاملة في تقويم الأسنان بأعلى معايير الجودة</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {activeServices.map((s, i) => (
                <div key={i} className="service-card">
                  <div style={{ fontSize: '52px', marginBottom: '18px', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '10px', color: 'white', position: 'relative', zIndex: 1 }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER ── */}
        <section style={{ padding: '100px 5%', background: 'linear-gradient(135deg, #040d1e, #061428, #050f20)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-tag">النتائج</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white' }}>
                قبل <span className="gold-text">وبعد</span> العلاج
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>نتائج حقيقية لمرضى عيادتنا</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ padding: '28px 20px', background: 'rgba(239,68,68,0.06)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '44px' }}>🦷</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,100,100,0.9)', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '3px 12px', borderRadius: '20px' }}>قبل</span>
                    </div>
                    <div style={{ padding: '28px 20px', background: 'rgba(14,165,233,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '44px' }}>😁</span>
                      <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, background: 'rgba(14,165,233,0.1)', padding: '3px 12px', borderRadius: '20px' }}>بعد</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>حالة تقويم ناجحة #{i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section id="reviews" style={{ padding: '100px 5%', background: '#030b1a' }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-tag">آراء المرضى</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white' }}>
                ماذا يقول <span className="gradient-text">مرضانا؟</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {activeReviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[...Array(r.rating || 5)].map((_, j) => <FaStar key={j} style={{ color: '#f59e0b', fontSize: '15px' }} />)}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: '20px', fontSize: '14px' }}>"{r.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>
                      {r.name[0]}
                    </div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>{r.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '100px 5%', background: '#040d1e' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div className="section-tag">الأسئلة الشائعة</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white' }}>
                لديك <span className="gradient-text">سؤال؟</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>إجابات على أكثر الأسئلة شيوعاً</p>
            </div>
            {activeFaqs.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.question}</span>
                  <FiChevronDown style={{ transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(180deg)' : '', flexShrink: 0, color: '#0ea5e9' }} />
                </button>
                {openFaq === i && <div className="faq-answer">{f.answer}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #040d1e, #030b1a)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-tag">تواصل معنا</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white' }}>
                نحن هنا <span className="gradient-text">لمساعدتك</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>تواصل معنا الآن واحجز موعدك</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { icon: <FaPhone />, title: 'الهاتف', value: '+20 115 679 8324', href: `tel:${settings.phone}`, color: '#34d399' },
                { icon: <FaWhatsapp />, title: 'واتساب', value: '+20 115 679 8324', href: `https://wa.me/${settings.whatsapp}`, color: '#25d366' },
                { icon: <FaMapMarkerAlt />, title: 'العنوان', value: settings.address, href: settings.googleMapsUrl || '#', color: '#f87171' },
                { icon: <FiClock />, title: 'ساعات العمل', value: settings.workingHours, href: '#', color: '#a78bfa' },
              ].map((c, i) => (
                <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="contact-card">
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${c.color}18`, border: `1px solid ${c.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: c.color, margin: '0 auto 16px' }}>{c.icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>{c.title}</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{c.value}</div>
                </a>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="glass-card-blue" style={{ marginTop: '48px', padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 900, color: 'white', marginBottom: '12px' }}>هل أنت جاهز لابتسامة مثالية؟</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '28px', fontSize: '15px' }}>احجز استشارتك المجانية اليوم مع {settings.doctorName}</p>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="btn-glow">
                <FaWhatsapp size={18} /> احجز الآن مجاناً
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#020810', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 5%' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo-transparent.png" alt="logo" className="logo-img-dark" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '10px' }} />
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>{settings.doctorName}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>أخصائي تقويم الأسنان</div>
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textAlign: 'center' }}>
              © 2026 عيادة {settings.doctorName} — جميع الحقوق محفوظة
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366', fontSize: '18px', textDecoration: 'none', transition: 'all 0.2s' }}>
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </footer>

        {/* WhatsApp Float */}
        <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{
          position: 'fixed', bottom: '28px', left: '28px', zIndex: 999,
          background: 'linear-gradient(135deg, #25d366, #128c7e)',
          color: 'white', borderRadius: '50%',
          width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '30px', boxShadow: '0 0 30px rgba(37,211,102,0.45), 0 4px 16px rgba(0,0,0,0.3)',
          textDecoration: 'none', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 45px rgba(37,211,102,0.6), 0 8px 25px rgba(0,0,0,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 30px rgba(37,211,102,0.45), 0 4px 16px rgba(0,0,0,0.3)'; }}>
          <FaWhatsapp />
        </a>
      </div>
    </>
  );
}
