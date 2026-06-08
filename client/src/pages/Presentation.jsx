import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiDollarSign, FiBarChart2, FiBell, FiGlobe, FiSettings, FiCreditCard, FiShield, FiSmartphone, FiArrowLeft, FiArrowRight, FiCheck, FiStar, FiActivity, FiFileText, FiImage, FiZap, FiLock, FiUser } from 'react-icons/fi';
import { FaWhatsapp, FaTooth } from 'react-icons/fa';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
  .pres-root { font-family: 'Cairo', sans-serif; direction: rtl; -webkit-font-smoothing: antialiased; background: #f8fafc; min-height: 100vh; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }

  .p-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid #e2e8f0; padding: 0 6%; display: flex; align-items: center; justify-content: space-between; height: 64px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
  .p-section { padding: 72px 6%; }
  .p-section-inner { max-width: 1200px; margin: 0 auto; }
  .p-tag { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 30px; padding: 4px 13px; font-size: 12.5px; font-weight: 700; margin-bottom: 12px; }
  .p-title { font-size: clamp(28px, 4vw, 48px); font-weight: 900; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px; }
  .p-sub { font-size: 16px; color: #64748b; line-height: 1.8; max-width: 600px; }
  .p-underline { width: 60px; height: 4px; border-radius: 4px; background: linear-gradient(90deg, #2563eb, #06b6d4); margin: 14px 0 0; }

  .p-feature-card {
    background: white; border-radius: 16px; padding: 26px;
    border: 1.5px solid #e2e8f0; transition: all 0.25s;
    position: relative; overflow: hidden;
  }
  .p-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-gradient, linear-gradient(90deg, #2563eb, #06b6d4)); }
  .p-feature-card:hover { border-color: #bfdbfe; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(37,99,235,0.1); }

  .p-step-card { background: white; border-radius: 14px; padding: 22px 24px; border: 1.5px solid #e2e8f0; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 16px; transition: all 0.2s; }
  .p-step-card:hover { border-color: #bfdbfe; box-shadow: 0 4px 16px rgba(37,99,235,0.08); }

  .p-step-num { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

  .p-screen { background: white; border-radius: 16px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
  .p-screen-bar { height: 36px; background: #f1f5f9; display: flex; align-items: center; padding: 0 14px; gap: 6px; border-bottom: 1px solid #e2e8f0; }
  .p-screen-dot { width: 10px; height: 10px; border-radius: 50%; }

  .p-module-tab { padding: 10px 20px; border: none; background: transparent; font-family: 'Cairo', sans-serif; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; border-radius: 9px; transition: all 0.2s; display: flex; align-items: center; gap: 7px; white-space: nowrap; }
  .p-module-tab.active { background: #eff6ff; color: #2563eb; }
  .p-module-tab:hover:not(.active) { background: #f8fafc; color: #334155; }

  .p-btn { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; border-radius: 10px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Cairo', sans-serif; transition: all 0.2s; text-decoration: none; }
  .p-btn-primary { background: #2563eb; color: white; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
  .p-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37,99,235,0.4); }
  .p-btn-secondary { background: white; color: #334155; border: 1.5px solid #e2e8f0; }
  .p-btn-secondary:hover { border-color: #bfdbfe; color: #2563eb; background: #f8fbff; }
`;

const FEATURES = [
  {
    icon: <FiUsers size={22} />, title: 'إدارة المرضى',
    desc: 'ملفات طبية كاملة لكل مريض تشمل التشخيص، خطة العلاج، الصور، الأشعة، وتاريخ العلاج بالكامل.',
    color: '#2563eb', bg: '#eff6ff',
    points: ['بحث سريع في قاعدة المرضى', 'رفع الصور والأشعة', 'تاريخ علاجي متكامل', 'ملاحظات وتقارير لكل جلسة'],
    gradient: 'linear-gradient(90deg, #2563eb, #3b82f6)',
  },
  {
    icon: <FiCalendar size={22} />, title: 'إدارة المواعيد',
    desc: 'جدول مواعيد ذكي بعرض يومي وأسبوعي وشهري. تعيين مواعيد مع تفاصيل النوع والملاحظات.',
    color: '#0891b2', bg: '#ecfeff',
    points: ['عرض تقويم تفاعلي', 'تصنيف المواعيد بالنوع', 'ربط المواعيد بملفات المرضى', 'تنبيهات وإشعارات فورية'],
    gradient: 'linear-gradient(90deg, #0891b2, #06b6d4)',
  },
  {
    icon: <FiDollarSign size={22} />, title: 'النظام المالي',
    desc: 'تتبع كامل للمدفوعات والمستحقات. سجل سداد لكل مريض مع حالة الحساب وتاريخ الدفعات.',
    color: '#16a34a', bg: '#f0fdf4',
    points: ['تسجيل الدفعات والأقساط', 'تتبع المبالغ المستحقة', 'تقارير مالية شهرية', 'إشعار عند تأخر السداد'],
    gradient: 'linear-gradient(90deg, #16a34a, #22c55e)',
  },
  {
    icon: <FiBarChart2 size={22} />, title: 'التقارير والإحصائيات',
    desc: 'لوحة تحليلية شاملة مع رسوم بيانية تفاعلية للإيرادات والمرضى والمواعيد عبر الزمن.',
    color: '#9333ea', bg: '#fdf4ff',
    points: ['رسوم بيانية للإيرادات', 'إحصائيات المرضى الجدد', 'تحليل معدل الإنجاز', 'تصدير التقارير'],
    gradient: 'linear-gradient(90deg, #9333ea, #a855f7)',
  },
  {
    icon: <FiSmartphone size={22} />, title: 'بوابة المريض',
    desc: 'واجهة مريض متكاملة يستطيع من خلالها مراجعة ملفه الطبي، مواعيده، حالته المالية، والجلسات.',
    color: '#ea580c', bg: '#fff7ed',
    points: ['عرض الملف الطبي والصور', 'كشف المواعيد والجلسات', 'الحالة المالية والمدفوعات', 'تسجيل دخول آمن بكلمة مرور'],
    gradient: 'linear-gradient(90deg, #ea580c, #f97316)',
  },
  {
    icon: <FiBell size={22} />, title: 'الإشعارات الفورية',
    desc: 'نظام إشعارات لحظية عبر WebSocket وPush Notifications للطبيب والمريض.',
    color: '#0284c7', bg: '#f0f9ff',
    points: ['تنبيهات لحظية للطبيب', 'إشعارات تثبيت التطبيق PWA', 'تاريخ الإشعارات', 'تنبيه تلقائي عند موعد جديد'],
    gradient: 'linear-gradient(90deg, #0284c7, #0ea5e9)',
  },
  {
    icon: <FiGlobe size={22} />, title: 'إدارة الموقع',
    desc: 'تحكم كامل في محتوى الصفحة الرئيسية: الخدمات، آراء المرضى، الأسئلة الشائعة، معلومات التواصل.',
    color: '#0f766e', bg: '#f0fdfa',
    points: ['تعديل الخدمات المعروضة', 'إضافة وتعديل آراء المرضى', 'تحديث الأسئلة الشائعة', 'تحديث بيانات التواصل'],
    gradient: 'linear-gradient(90deg, #0f766e, #14b8a6)',
  },
  {
    icon: <FiShield size={22} />, title: 'الأمان والمصادقة',
    desc: 'نظام مصادقة متعدد الطبقات: JWT، WebAuthn (بصمة/Face ID)، وتشفير كلمات المرور.',
    color: '#7c3aed', bg: '#ede9fe',
    points: ['تشفير كلمات المرور (bcrypt)', 'دخول بالبصمة أو Face ID', 'رمز JWT آمن (30 يوم)', 'صلاحيات مختلفة للطبيب والمريض'],
    gradient: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
  },
];

const DOCTOR_STEPS = [
  { icon: '🔑', title: 'تسجيل الدخول كطبيب', desc: 'استخدم رقم جوالك وكلمة المرور من صفحة تسجيل الدخول واختر "طبيب".' },
  { icon: '👤', title: 'إضافة مريض جديد', desc: 'اذهب لـ "المرضى" ← "مريض جديد"، أدخل البيانات الشخصية والمعلومات الطبية وخطة العلاج.' },
  { icon: '📅', title: 'إضافة موعد', desc: 'من قسم "المواعيد"، اضغط "موعد جديد"، اختر المريض والتاريخ والوقت والنوع.' },
  { icon: '💉', title: 'تسجيل جلسة علاجية', desc: 'في ملف المريض، أضف جلسة علاجية مع ملاحظات الجلسة والمبلغ المدفوع والخطوة القادمة.' },
  { icon: '💰', title: 'تسجيل دفعة مالية', desc: 'من قسم "المدفوعات"، أضف دفعة لأي مريض مع تاريخ وطريقة الدفع والملاحظات.' },
  { icon: '📊', title: 'مراجعة التقارير', desc: 'من قسم "التقارير"، اطلع على الإيرادات والمواعيد والمرضى الجدد لأي فترة زمنية.' },
];

const PATIENT_STEPS = [
  { icon: '📱', title: 'أول دخول للنظام', desc: 'اذهب لصفحة تسجيل الدخول، اختر "مريض"، أدخل رقم جوالك المسجل في العيادة وسيطلب منك إنشاء كلمة مرور.' },
  { icon: '🔐', title: 'نسيت كلمة المرور', desc: 'اضغط "نسيت كلمة المرور"، أدخل رقم الملف الطبي ورقم جوالك. لا تعرف رقم الملف؟ تواصل مع الدكتور على واتساب.' },
  { icon: '📋', title: 'مراجعة الملف الطبي', desc: 'بعد الدخول ستجد ملفك الطبي الكامل مع التشخيص وخطة العلاج والصور والأشعة.' },
  { icon: '📅', title: 'متابعة المواعيد', desc: 'اطلع على مواعيدك القادمة وتواريخ الجلسات وملاحظات الطبيب بعد كل جلسة.' },
  { icon: '💳', title: 'متابعة الحساب المالي', desc: 'تحقق من إجمالي تكلفة العلاج والمبلغ المدفوع والمتبقي وسجل جميع الدفعات.' },
  { icon: '📲', title: 'تثبيت التطبيق (PWA)', desc: 'يمكنك تثبيت النظام كتطبيق على هاتفك من المتصفح مباشرةً بدون متجر تطبيقات.' },
];

const MODULE_DETAILS = [
  {
    id: 'patients', icon: <FiUsers />, title: 'إدارة المرضى',
    color: '#2563eb', bg: '#eff6ff',
    content: (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '🔍', t: 'بحث بالاسم أو الجوال', c: '#eff6ff' },
            { icon: '📋', t: 'ملف طبي شامل', c: '#f0fdf4' },
            { icon: '🖼️', t: 'صور وجه وأشعة', c: '#fdf4ff' },
            { icon: '💊', t: 'تشخيص وخطة علاج', c: '#fff7ed' },
            { icon: '💉', t: 'جلسات علاجية', c: '#ecfeff' },
            { icon: '💰', t: 'متابعة مالية', c: '#f0fdf4' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 14px', background: item.c, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'appointments', icon: <FiCalendar />, title: 'المواعيد',
    color: '#0891b2', bg: '#ecfeff',
    content: (
      <div style={{ padding: '20px' }}>
        {['عرض أسبوعي وشهري وقائمة', 'تصنيف: كشف أولي / متابعة / تقويم / طوارئ', 'ربط كل موعد بملف مريض', 'إضافة وتعديل وإلغاء المواعيد', 'مواعيد اليوم في لوحة التحكم'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ecfeff', border: '1.5px solid #a5f3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiCheck size={12} style={{ color: '#0891b2' }} />
            </div>
            <span style={{ fontSize: '13.5px', color: '#334155' }}>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'finance', icon: <FiDollarSign />, title: 'المالية',
    color: '#16a34a', bg: '#f0fdf4',
    content: (
      <div style={{ padding: '20px' }}>
        {['تسجيل إجمالي تكلفة العلاج', 'تسجيل الدفعات مع التاريخ وطريقة الدفع', 'حساب المبلغ المتبقي تلقائياً', 'حالة الحساب: مدفوع / جزئي / متأخر', 'تقارير الإيرادات الشهرية مع رسوم بيانية', 'المحفظة: ملخص مالي إجمالي للعيادة'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiCheck size={12} style={{ color: '#16a34a' }} />
            </div>
            <span style={{ fontSize: '13.5px', color: '#334155' }}>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Presentation() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('patients');
  const [activeUserGuide, setActiveUserGuide] = useState('doctor');

  return (
    <>
      <style>{STYLE}</style>
      <div className="pres-root">

        {/* ── NAV ── */}
        <nav className="p-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(37,99,235,0.15)', border: '1px solid #e2e8f0' }}>
              <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '15px', color: '#0f172a' }}>دليل النظام</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>عيادة د. وسام يوسف</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => navigate('/')} className="p-btn p-btn-secondary" style={{ fontSize: '13px' }}>
              <FiArrowRight size={13} /> الصفحة الرئيسية
            </button>
            <button onClick={() => navigate('/login')} className="p-btn p-btn-primary" style={{ fontSize: '13px' }}>
              <FiLock size={13} /> دخول النظام
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ padding: '80px 6%', background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 50%, #f5f0ff 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 600px at 80% 50%, rgba(37,99,235,0.06), transparent)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', position: 'relative' }}>
            <div style={{ animation: 'fadeUp 0.6s ease-out' }}>
              <div className="p-tag"><FiStar size={12} /> دليل شامل للنظام</div>
              <h1 className="p-title" style={{ marginBottom: '16px' }}>
                كل ما تحتاج معرفته<br />
                عن <span style={{ color: '#2563eb' }}>نظام العيادة</span>
              </h1>
              <p className="p-sub" style={{ marginBottom: '28px' }}>
                نظام إدارة متكامل لعيادة تقويم الأسنان — يتيح للطبيب إدارة المرضى والمواعيد والمالية، وللمريض متابعة ملفه وعلاجه.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="p-btn p-btn-primary">
                  <FiZap size={14} /> استكشف المميزات
                </button>
                <button onClick={() => document.getElementById('howto')?.scrollIntoView({ behavior: 'smooth' })} className="p-btn p-btn-secondary">
                  كيفية الاستخدام
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', animation: 'fadeUp 0.7s ease-out 0.1s both' }}>
              {[
                { icon: '🦷', val: '8', label: 'وحدات رئيسية', color: '#2563eb', bg: '#eff6ff' },
                { icon: '👤', val: '2', label: 'نوع مستخدمين', color: '#9333ea', bg: '#fdf4ff' },
                { icon: '📱', val: 'PWA', label: 'تطبيق على الهاتف', color: '#0891b2', bg: '#ecfeff' },
                { icon: '🔒', val: '100%', label: 'أمان وتشفير', color: '#16a34a', bg: '#f0fdf4' },
                { icon: '🌐', val: 'RTL', label: 'واجهة عربية كاملة', color: '#ea580c', bg: '#fff7ed' },
                { icon: '⚡', val: 'Live', label: 'إشعارات لحظية', color: '#7c3aed', bg: '#ede9fe' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '18px 16px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="p-section">
          <div className="p-section-inner">
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <div className="p-tag"><FiActivity size={12} /> المميزات</div>
              <h2 className="p-title" style={{ marginBottom: '12px' }}>وحدات النظام</h2>
              <p className="p-sub" style={{ margin: '0 auto' }}>8 وحدات رئيسية متكاملة تغطي كل احتياجات عيادة تقويم الأسنان</p>
              <div className="p-underline" style={{ margin: '14px auto 0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="p-feature-card" style={{ '--card-gradient': f.gradient }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{f.title}</h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.75, marginBottom: '16px' }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {f.points.map((p, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FiCheck size={10} />
                        </div>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MODULE DEEP DIVE ── */}
        <section className="p-section" style={{ background: 'white' }}>
          <div className="p-section-inner">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="p-tag"><FiFileText size={12} /> تفاصيل الوحدات</div>
              <h2 className="p-title">داخل كل وحدة</h2>
              <div className="p-underline" style={{ margin: '14px auto 0' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto', flexWrap: 'wrap' }}>
              {MODULE_DETAILS.map(m => (
                <button key={m.id} onClick={() => setActiveModule(m.id)} className={`p-module-tab${activeModule === m.id ? ' active' : ''}`}>
                  {m.icon} {m.title}
                </button>
              ))}
            </div>

            {MODULE_DETAILS.filter(m => m.id === activeModule).map(m => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'slideLeft 0.3s ease-out' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                      {m.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>{m.title}</h3>
                      <div style={{ fontSize: '12px', color: m.color, fontWeight: 600 }}>وحدة متكاملة في النظام</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                    {m.content}
                  </div>
                </div>
                <div style={{ background: m.bg, borderRadius: '16px', border: `2px dashed ${m.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '56px', animation: 'float 3s ease-in-out infinite' }}>
                    {m.id === 'patients' ? '👤' : m.id === 'appointments' ? '📅' : '💰'}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: m.color }}>{m.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>اضغط على وحدة لرؤية تفاصيلها</div>
                  <button onClick={() => navigate('/login')} style={{ marginTop: '8px', padding: '10px 20px', background: m.color, color: 'white', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '13px' }}>
                    ابدأ الاستخدام
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW TO USE ── */}
        <section id="howto" className="p-section" style={{ background: '#f8fafc' }}>
          <div className="p-section-inner">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="p-tag">كيفية الاستخدام</div>
              <h2 className="p-title">خطوة بخطوة</h2>
              <p className="p-sub" style={{ margin: '10px auto 0' }}>دليل سريع لبدء استخدام النظام</p>
              <div className="p-underline" style={{ margin: '14px auto 0' }} />
            </div>

            {/* User type tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#e8f0fe', padding: '5px', borderRadius: '12px', width: 'fit-content', margin: '0 auto 32px' }}>
              {[
                { key: 'doctor', icon: '🩺', label: 'طبيب' },
                { key: 'patient', icon: '🧑‍⚕️', label: 'مريض' },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveUserGuide(t.key)} style={{
                  padding: '10px 28px', border: 'none', borderRadius: '9px',
                  background: activeUserGuide === t.key ? 'white' : 'transparent',
                  color: activeUserGuide === t.key ? '#2563eb' : '#475569',
                  fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s',
                  boxShadow: activeUserGuide === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ maxWidth: '720px', margin: '0 auto', animation: 'slideLeft 0.3s ease-out' }}>
              {(activeUserGuide === 'doctor' ? DOCTOR_STEPS : PATIENT_STEPS).map((step, i) => (
                <div key={i} className="p-step-card">
                  <div className="p-step-num">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{step.icon}</span>
                      <h4 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{step.title}</h4>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="p-section" style={{ background: 'white' }}>
          <div className="p-section-inner">
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <div className="p-tag">التقنيات المستخدمة</div>
              <h2 className="p-title">بُني بأحدث التقنيات</h2>
              <div className="p-underline" style={{ margin: '14px auto 0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { icon: '⚛️', name: 'React + Vite', desc: 'الواجهة الأمامية', color: '#61dafb', bg: '#f0fdfe' },
                { icon: '🟢', name: 'Node.js + Express', desc: 'الخادم والـ API', color: '#22c55e', bg: '#f0fdf4' },
                { icon: '🍃', name: 'MongoDB Atlas', desc: 'قاعدة البيانات', color: '#22c55e', bg: '#f0fdf4' },
                { icon: '🔐', name: 'JWT + bcrypt', desc: 'الأمان والتشفير', color: '#7c3aed', bg: '#ede9fe' },
                { icon: '⚡', name: 'WebSocket', desc: 'إشعارات لحظية', color: '#f59e0b', bg: '#fffbeb' },
                { icon: '📱', name: 'PWA', desc: 'تطبيق على الهاتف', color: '#2563eb', bg: '#eff6ff' },
                { icon: '🔑', name: 'WebAuthn', desc: 'بصمة / Face ID', color: '#0891b2', bg: '#ecfeff' },
                { icon: '📦', name: 'Push Notifications', desc: 'إشعارات الهاتف', color: '#ea580c', bg: '#fff7ed' },
              ].map((t, i) => (
                <div key={i} style={{ background: t.bg, borderRadius: '14px', padding: '20px 16px', border: `1.5px solid ${t.color}20`, textAlign: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${t.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{t.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '80px 6%', background: 'linear-gradient(135deg, #1e40af, #1d4ed8, #0891b2)' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🦷</div>
            <h2 style={{ color: 'white', fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>جاهز للبدء؟</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.7 }}>سجّل دخولك الآن وابدأ إدارة عيادتك باحترافية</p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} style={{ padding: '14px 32px', background: 'white', color: '#1d4ed8', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <FiLock size={15} /> دخول النظام
              </button>
              <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" style={{ padding: '14px 32px', background: '#25d366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,211,102,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <FaWhatsapp size={17} /> تواصل معنا
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div style={{ background: '#0f172a', color: 'rgba(255,255,255,0.5)', padding: '20px 6%', textAlign: 'center', fontSize: '13px' }}>
          عيادة د. وسام يوسف — دليل النظام © {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
