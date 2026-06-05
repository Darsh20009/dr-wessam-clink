import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaStar, FaGraduationCap, FaTrophy } from 'react-icons/fa';
import { FiCalendar, FiUser, FiChevronDown, FiClock, FiAward } from 'react-icons/fi';

const defaultSettings = {
  heroTitle: 'ابتسامة أجمل تبدأ من د. وسام يوسف',
  heroSubtitle: 'خبرة متخصصة في تقويم الأسنان بأحدث التقنيات وأعلى معايير الجودة',
  doctorName: 'د. وسام يوسف',
  doctorTitle: 'أخصائي تقويم الأسنان',
  doctorBio: 'طبيب متخصص في تقويم الأسنان بخبرة أكثر من 10 سنوات في علاج حالات التقويم المختلفة للأطفال والبالغين.',
  doctorExperience: '+10 سنوات خبرة',
  doctorPatients: '+1000 مريض سعيد',
  doctorSuccess: '98% نسبة نجاح',
  phone: '01000000000',
  whatsapp: '201000000000',
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

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    axios.get('/site').then(r => {
      if (r.data && r.data._id) setSettings({ ...defaultSettings, ...r.data });
    }).catch(() => {});
  }, []);

  const activeServices = (settings.services || []).filter(s => s.isActive !== false);
  const activeReviews = (settings.reviews || []).filter(r => r.isActive !== false);
  const activeFaqs = (settings.faqs || []).filter(f => f.isActive !== false);

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: '#1e293b' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0', padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="logo" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '50%' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a3a6b' }}>{settings.doctorName}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{settings.doctorTitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="#about" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>عن الطبيب</a>
          <a href="#services" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>الخدمات</a>
          <a href="#contact" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>تواصل معنا</a>
          <button onClick={() => navigate('/login')} style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          }}>تسجيل الدخول</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a3a6b 0%, #1e3a8a 40%, #1e40af 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        padding: '60px 5%', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            🦷 عيادة تقويم الأسنان المتخصصة
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '20px' }}>
            {settings.heroTitle.split(settings.doctorName).map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length - 1 && <span style={{ color: '#93c5fd' }}>{settings.doctorName}</span>}</span>
            ))}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', lineHeight: 1.8, marginBottom: '36px', maxWidth: '500px' }}>
            {settings.heroSubtitle}
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'white', color: '#1a3a6b', border: 'none',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '16px',
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}><FiUser /> تسجيل الدخول</button>
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{
              background: '#25d366', color: 'white',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            }}><FaWhatsapp /> حجز موعد</a>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
            {[settings.doctorPatients, settings.doctorSuccess, settings.doctorExperience].map((stat, i) => {
              const parts = stat?.match(/^([^ا-ي\s]*)([\s\S]*)$/) || [stat, '', stat];
              return (
                <div key={i}>
                  <div style={{ color: '#93c5fd', fontSize: '28px', fontWeight: 900 }}>{parts[1] || stat}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{parts[2]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Doctor */}
      <section id="about" style={{ padding: '80px 5%', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>تعرف على الطبيب</div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b' }}>نبذة عن {settings.doctorName}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            {/* Left: info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <img src="/logo.png" alt="doctor" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dbeafe' }} />
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '22px', color: '#1a3a6b' }}>{settings.doctorName}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>{settings.doctorTitle}</p>
                </div>
              </div>
              <p style={{ color: '#475569', lineHeight: 1.9, fontSize: '15px', marginBottom: '28px' }}>{settings.doctorBio}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[settings.doctorExperience, settings.doctorPatients, settings.doctorSuccess].map((s, i) => (
                  <div key={i} style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '16px' }}>{s?.split(' ')[0]}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s?.split(' ').slice(1).join(' ')}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: certificates + achievements */}
            <div>
              {settings.certificates?.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaGraduationCap style={{ color: '#2563eb' }} /> المؤهلات والشهادات
                  </h4>
                  {settings.certificates.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', borderRight: '3px solid #2563eb' }}>
                      <FiAward style={{ color: '#2563eb', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{c.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{c.institution} {c.year && `— ${c.year}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {settings.achievements?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaTrophy style={{ color: '#f59e0b' }} /> الإنجازات
                  </h4>
                  {settings.achievements.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>★</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{a.title}</div>
                        {a.description && <div style={{ fontSize: '12px', color: '#64748b' }}>{a.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>خدماتنا</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b' }}>ماذا نقدم لك؟</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '12px' }}>خدمات متكاملة في تقويم الأسنان بأعلى معايير الجودة</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {activeServices.map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '16px', padding: '28px 20px',
              textAlign: 'center', border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(37,99,235,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ fontSize: '40px', marginBottom: '14px' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1a3a6b' }}>{s.title}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before/After */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>النتائج</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b' }}>قبل وبعد العلاج</h2>
          <p style={{ color: '#64748b', marginTop: '12px' }}>نتائج حقيقية لمرضى عيادتنا</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: '#f1f5f9', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '36px' }}>🦷</span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>قبل</span>
                </div>
                <div style={{ background: '#dbeafe', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '36px' }}>😁</span>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>بعد</span>
                </div>
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '13px' }}>حالة تقويم ناجحة #{i}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: '80px 5%', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>آراء المرضى</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800 }}>ماذا يقول مرضانا؟</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {activeReviews.map((r, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[...Array(r.rating || 5)].map((_, j) => <FaStar key={j} style={{ color: '#f59e0b', fontSize: '16px' }} />)}
              </div>
              <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: '16px', fontSize: '14px' }}>"{r.text}"</p>
              <div style={{ fontWeight: 700, color: '#1a3a6b', fontSize: '14px' }}>{r.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800 }}>الأسئلة الشائعة</h2>
          <p style={{ color: '#64748b', marginTop: '12px' }}>إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {activeFaqs.map((f, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', padding: '18px 20px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '15px',
                color: '#1e293b', cursor: 'pointer', textAlign: 'right',
              }}>
                {f.question}
                <FiChevronDown style={{ transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : '', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', color: '#64748b', fontSize: '14px', lineHeight: 1.8 }}>{f.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: '80px 5%', background: 'linear-gradient(135deg, #1a3a6b, #1e40af)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white' }}>تواصل معنا</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '12px' }}>نحن هنا لمساعدتك</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { icon: <FaPhone />, title: 'الهاتف', value: settings.phone, href: `tel:${settings.phone}` },
            { icon: <FaWhatsapp />, title: 'واتساب', value: settings.phone, href: `https://wa.me/${settings.whatsapp}` },
            { icon: <FaMapMarkerAlt />, title: 'العنوان', value: settings.address, href: settings.googleMapsUrl || '#' },
            { icon: <FiClock />, title: 'ساعات العمل', value: settings.workingHours, href: '#' },
          ].map((c, i) => (
            <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px 20px',
              textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)',
              textDecoration: 'none', display: 'block',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <div style={{ fontSize: '28px', color: '#93c5fd', marginBottom: '12px' }}>{c.icon}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{c.value}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '24px', fontSize: '13px' }}>
        © 2026 عيادة {settings.doctorName} - جميع الحقوق محفوظة
      </footer>

      {/* WhatsApp Float */}
      <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{
        position: 'fixed', bottom: '24px', left: '24px', zIndex: 999,
        background: '#25d366', color: 'white', borderRadius: '50%',
        width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
        textDecoration: 'none', transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <FaWhatsapp />
      </a>
    </div>
  );
}
