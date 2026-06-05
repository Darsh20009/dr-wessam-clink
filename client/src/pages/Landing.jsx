import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTooth, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import { FiCalendar, FiUser, FiFolderPlus, FiCheckCircle, FiChevronDown } from 'react-icons/fi';

const services = [
  { icon: '🦷', title: 'تقويم الأسنان', desc: 'تقويم احترافي بأحدث التقنيات وأفضل المواد العالمية' },
  { icon: '💎', title: 'التقويم الشفاف', desc: 'تقويم غير مرئي مريح وفعّال لنتائج مثالية' },
  { icon: '🦴', title: 'علاج مشاكل الفك', desc: 'تشخيص وعلاج شامل لاضطرابات المفصل الفكي' },
  { icon: '👶', title: 'تقويم الأطفال', desc: 'رعاية متخصصة لتقويم أسنان الأطفال في مرحلة النمو' },
  { icon: '😁', title: 'تصميم الابتسامة', desc: 'إعادة تصميم ابتسامتك لتكون أكثر جمالاً وتناسقاً' },
];

const reviews = [
  { name: 'أحمد محمد', rating: 5, text: 'دكتور ممتاز، نتائج رائعة في وقت قياسي. أنصح الجميع بالتقويم عنده.' },
  { name: 'سارة إبراهيم', rating: 5, text: 'تجربة احترافية من أول زيارة. الدكتور متميز ومتابعة ممتازة.' },
  { name: 'محمد علي', rating: 5, text: 'الحمد لله انتهى التقويم والنتيجة فوق التوقعات. شكراً دكتور وسام.' },
];

const faqs = [
  { q: 'كم مدة علاج التقويم؟', a: 'تتراوح مدة علاج التقويم عادةً بين 12 و24 شهراً حسب الحالة.' },
  { q: 'هل التقويم مؤلم؟', a: 'قد يكون هناك إحساس خفيف في الأيام الأولى ثم يختفي تدريجياً.' },
  { q: 'ما الفرق بين التقويم العادي والشفاف؟', a: 'التقويم الشفاف غير مرئي ومريح أكثر، لكن كلاهما فعّال حسب الحالة.' },
  { q: 'هل أحتاج لحجز موعد مسبق؟', a: 'نعم، يُفضّل حجز موعد مسبق لضمان الوقت المناسب.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: '#1e293b' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0', padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="logo" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '50%' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a3a6b' }}>د. وسام يوسف</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>أخصائي تقويم الأسنان</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="#services" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>الخدمات</a>
          <a href="#contact" style={{ color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>تواصل معنا</a>
          <button onClick={() => navigate('/login')} style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', fontFamily: 'Cairo, sans-serif'
          }}>تسجيل الدخول</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a3a6b 0%, #1e3a8a 40%, #1e40af 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        padding: '60px 5%', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', right: '-50px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#bfdbfe', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
            🦷 عيادة تقويم الأسنان المتخصصة
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '20px' }}>
            ابتسامة أجمل تبدأ من<br />
            <span style={{ color: '#93c5fd' }}>د. وسام يوسف</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', lineHeight: 1.8, marginBottom: '36px', maxWidth: '500px' }}>
            خبرة متخصصة في تقويم الأسنان بأحدث التقنيات وأعلى معايير الجودة لنتائج تتخطى توقعاتك
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'white', color: '#1a3a6b', border: 'none',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '16px',
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
              <FiUser /> تسجيل الدخول
            </button>
            <button onClick={() => navigate('/login')} style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <FiCalendar /> حجز موعد
            </button>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
            {[['+1000', 'مريض سعيد'], ['98%', 'نسبة نجاح'], ['10+', 'سنوات خبرة']].map(([num, label]) => (
              <div key={label}>
                <div style={{ color: '#93c5fd', fontSize: '28px', fontWeight: 900 }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '80px 5%', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>خدماتنا</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b' }}>ماذا نقدم لك؟</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '12px' }}>خدمات متكاملة في تقويم الأسنان بأعلى معايير الجودة</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {services.map((s, i) => (
            <div key={i} style={{
              background: '#f8fafc', borderRadius: '16px', padding: '28px 20px',
              textAlign: 'center', border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(37,99,235,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ fontSize: '40px', marginBottom: '14px' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1a3a6b' }}>{s.title}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>{s.desc}</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
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
          {reviews.map((r, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[...Array(r.rating)].map((_, j) => <FaStar key={j} style={{ color: '#f59e0b', fontSize: '16px' }} />)}
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
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', padding: '18px 20px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '15px',
                color: '#1e293b', cursor: 'pointer', textAlign: 'right',
              }}>
                {f.q}
                <FiChevronDown style={{ transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : '' }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', color: '#64748b', fontSize: '14px', lineHeight: 1.8 }}>{f.a}</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {[
            { icon: <FaPhone />, title: 'الهاتف', value: '01000000000', href: 'tel:01000000000' },
            { icon: <FaWhatsapp />, title: 'واتساب', value: '01000000000', href: 'https://wa.me/201000000000' },
            { icon: <FaMapMarkerAlt />, title: 'العنوان', value: 'القاهرة، مصر', href: '#' },
          ].map((c, i) => (
            <a key={i} href={c.href} style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px 20px',
              textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)',
              textDecoration: 'none', display: 'block',
              transition: 'background 0.2s',
            }}>
              <div style={{ fontSize: '28px', color: '#93c5fd', marginBottom: '12px' }}>{c.icon}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ color: 'white', fontWeight: 700 }}>{c.value}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '24px', fontSize: '13px' }}>
        © 2026 عيادة د. وسام يوسف - جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
