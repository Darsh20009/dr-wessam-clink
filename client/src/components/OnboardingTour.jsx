import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    id: 1,
    emoji: '👋',
    title: 'أهلاً وسهلاً يا دكتور!',
    subtitle: 'نظام عيادتك جاهز ليك',
    desc: 'هنعمل جولة سريعة مع بعض عشان تعرف كل حاجة في النظام ده. مش هياخد أكتر من دقيقتين!',
    color: '#2563eb',
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    route: null,
  },
  {
    id: 2,
    emoji: '📊',
    title: 'لوحة التحكم',
    subtitle: 'شايف كل حاجة في مكان واحد',
    desc: 'من لوحة التحكم هتشوف إجمالي مرضاك، المواعيد اللي جاية النهارده، وإيرادات الشهر الجاري — كل ده دفعة واحدة من غير ما تدور.',
    color: '#0891b2',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
    route: '/doctor',
    highlight: '👆 افتح لوحة التحكم من القايمة الجانبية',
  },
  {
    id: 3,
    emoji: '👥',
    title: 'ملفات المرضى',
    subtitle: 'كل بيانات مرضاك في إيدك',
    desc: 'تقدر تضيف مرضى جدد، تفتح ملف كل مريض وتشوف تاريخه الطبي، صور الأسنان، الأشعة، وكل الجلسات اللي اتعملت.',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    route: '/doctor/patients',
    highlight: '👆 افتح قسم المرضى من القايمة',
  },
  {
    id: 4,
    emoji: '🦷',
    title: 'جلسات العلاج',
    subtitle: 'سجّل كل جلسة بالتفاصيل',
    desc: 'جوه ملف كل مريض، تقدر تسجل الجلسات، تكتب الملاحظات الطبية، وتتابع مراحل العلاج. كمان تقدر ترفع صور وأشعة.',
    color: '#059669',
    bg: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    route: '/doctor/patients',
    highlight: '👆 ادخل على أي ملف مريض وضغط "جلسة جديدة"',
  },
  {
    id: 5,
    emoji: '📅',
    title: 'المواعيد',
    subtitle: 'جدول مواعيدك بسهولة',
    desc: 'صفحة المواعيد فيها تقويم يومي وأسبوعي وشهري. تقدر تحدد مواعيد جديدة، تشوف المواعيد القادمة، وتعدل أو تلغي أي موعد.',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    route: '/doctor/appointments',
    highlight: '👆 افتح قسم المواعيد من القايمة',
  },
  {
    id: 6,
    emoji: '💳',
    title: 'المدفوعات',
    subtitle: 'تابع فلوسك بسهولة',
    desc: 'من هنا هتشوف كل المدفوعات والمستحقات، تسجل دفعات جديدة، وتعرف إيه المبالغ اللي لسه معلقة لكل مريض.',
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    route: '/doctor/payments',
    highlight: '👆 افتح قسم المدفوعات من القايمة',
  },
  {
    id: 7,
    emoji: '💰',
    title: 'المحفظة',
    subtitle: 'إيرادات العيادة كلها هنا',
    desc: 'المحفظة بتعرضلك إجمالي إيرادات العيادة، مقارنة الشهور، وإحصائيات مالية مفصلة. تقدر كمان تعمل إيداع وسحب.',
    color: '#0d9488',
    bg: 'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)',
    route: '/doctor/wallet',
    highlight: '👆 افتح قسم المحفظة من القايمة',
  },
  {
    id: 8,
    emoji: '🔔',
    title: 'الإشعارات',
    subtitle: 'ماتفوتكش حاجة',
    desc: 'هتوصلك إشعارات للمواعيد الجديدة، تذكير بالمواعيد القادمة، والتحديثات المهمة — سواء على الجهاز أو في التطبيق.',
    color: '#9333ea',
    bg: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
    route: '/doctor/notifications',
    highlight: '👆 افتح الإشعارات من القايمة أو الجرس في الأعلى',
  },
  {
    id: 9,
    emoji: '🌐',
    title: 'موقع العيادة',
    subtitle: 'عدّل موقعك في ثواني',
    desc: 'من إدارة الموقع تقدر تعدل محتوى الموقع الإلكتروني بتاع العيادة — النصوص، الصور، خدمات العيادة، وآراء المرضى.',
    color: '#2563eb',
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    route: '/doctor/site',
    highlight: '👆 افتح إدارة الموقع من القايمة',
  },
  {
    id: 10,
    emoji: '🎉',
    title: 'خلاص، جاهز تبدأ!',
    subtitle: 'النظام في إيدك',
    desc: 'كده اتعرفت على كل حاجة في النظام! لو محتاج بطاقة هويتك الطبية، هتلاقيها في "بطاقة التوظيف". وأي إعدادات من قسم "الإعدادات". يلا نبدأ! 💪',
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
    route: null,
  },
];

export default function OnboardingTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');
  const { user } = useAuth();
  const navigate = useNavigate();

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const goTo = (idx, dir = 'forward') => {
    if (animating || idx < 0 || idx >= steps.length) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(idx);
      setAnimating(false);
      if (steps[idx].route) navigate(steps[idx].route);
    }, 280);
  };

  const next = () => goTo(step + 1, 'forward');
  const prev = () => goTo(step - 1, 'backward');

  const finish = () => {
    localStorage.setItem('onboardingDone', 'true');
    if (onFinish) onFinish();
  };

  const skip = () => {
    localStorage.setItem('onboardingDone', 'true');
    if (onFinish) onFinish();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} />

      <div style={styles.card}>
        {/* Header progress */}
        <div style={styles.progressBar}>
          {steps.map((s, i) => (
            <div
              key={s.id}
              onClick={() => goTo(i, i > step ? 'forward' : 'backward')}
              style={{
                ...styles.progressDot,
                background: i <= step ? current.color : '#e5e7eb',
                width: i === step ? 28 : 10,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <div style={styles.counter}>
          <span style={{ color: current.color, fontWeight: 700 }}>{step + 1}</span>
          <span style={{ color: '#9ca3af' }}> / {steps.length}</span>
        </div>

        {/* Main content */}
        <div
          style={{
            ...styles.content,
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === 'forward' ? '-30px' : '30px'})`
              : 'translateX(0)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}
        >
          {/* Emoji circle */}
          <div style={{ ...styles.emojiCircle, background: current.bg }}>
            <span style={styles.emoji}>{current.emoji}</span>
          </div>

          {/* Text */}
          <h2 style={styles.title}>{current.title}</h2>
          <p style={{ ...styles.subtitle, color: current.color }}>{current.subtitle}</p>
          <p style={styles.desc}>{current.desc}</p>

          {/* Highlight hint */}
          {current.highlight && (
            <div style={{ ...styles.hint, borderColor: current.color + '40', background: current.color + '0d' }}>
              <span style={{ color: current.color, fontSize: 13 }}>{current.highlight}</span>
            </div>
          )}

          {/* Step-specific content */}
          {isFirst && user?.name && (
            <div style={{ ...styles.welcomeBadge, background: current.color + '15', border: `1px solid ${current.color}30` }}>
              <span style={{ fontSize: 20 }}>🩺</span>
              <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 15 }}>د. {user.name}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          {!isFirst && (
            <button onClick={prev} style={styles.btnSecondary}>
              ← السابق
            </button>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={skip} style={styles.btnSkip}>
            تخطى الجولة
          </button>

          {isLast ? (
            <button onClick={finish} style={{ ...styles.btnPrimary, background: current.bg }}>
              🚀 يلا نبدأ!
            </button>
          ) : (
            <button onClick={next} style={{ ...styles.btnPrimary, background: current.bg }}>
              التالي ←
            </button>
          )}
        </div>

        {/* Side nav dots (desktop) */}
        <div style={styles.sideNav}>
          {steps.map((s, i) => (
            <div
              key={s.id}
              onClick={() => goTo(i, i > step ? 'forward' : 'backward')}
              title={s.title}
              style={{
                ...styles.sideDot,
                background: i === step ? current.color : i < step ? current.color + '60' : '#e5e7eb',
                transform: i === step ? 'scale(1.3)' : 'scale(1)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    direction: 'rtl',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(6px)',
  },
  card: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: 24,
    padding: '32px 36px 28px',
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: 420,
  },
  progressBar: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDot: {
    height: 10,
    borderRadius: 999,
    transition: 'all 0.3s ease',
  },
  counter: {
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 20,
    color: '#64748b',
    direction: 'ltr',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    gap: 10,
    paddingBottom: 16,
  },
  emojiCircle: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },
  emoji: {
    fontSize: 40,
    lineHeight: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    fontFamily: 'inherit',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 1.75,
    margin: 0,
    maxWidth: 420,
  },
  hint: {
    padding: '10px 16px',
    borderRadius: 12,
    border: '1.5px dashed',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  welcomeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 50,
    marginTop: 6,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
  },
  btnPrimary: {
    padding: '10px 22px',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  },
  btnSecondary: {
    padding: '10px 16px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSkip: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px 8px',
    textDecoration: 'underline',
  },
  sideNav: {
    position: 'absolute',
    right: -20,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    '@media(max-width:600px)': { display: 'none' },
  },
  sideDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
};
