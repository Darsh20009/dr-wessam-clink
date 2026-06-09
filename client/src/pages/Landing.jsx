import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaWhatsapp, FaStar, FaGraduationCap, FaPhone } from 'react-icons/fa';
import { FiCalendar, FiUser, FiCheck, FiArrowLeft, FiHeart, FiZap, FiShield, FiStar, FiMessageCircle, FiAward, FiGrid, FiMapPin, FiClock, FiChevronDown, FiPhone, FiUsers, FiTrendingUp, FiX, FiBookOpen, FiMail, FiGlobe, FiLock, FiFileText, FiSmartphone } from 'react-icons/fi';

const defaultSettings = {
  heroTitle: 'ابتسامة أجمل تبدأ من هنا',
  heroSubtitle: 'د. وسام يوسف أخصائي تقويم الأسنان في بني مزار، المنيا — خبرة +10 سنوات بأحدث التقنيات وأعلى معايير الجودة',
  doctorName: 'د. وسام يوسف',
  doctorTitle: 'أخصائي تقويم الأسنان - بني مزار، المنيا',
  doctorBio: 'دكتور وسام يوسف أخصائي تقويم الأسنان في بني مزار، محافظة المنيا. خبرة أكثر من 10 سنوات في علاج حالات التقويم المختلفة للأطفال والبالغين. أكثر من 1000 حالة ناجحة بأحدث تقنيات التقويم.',
  phone: '01156798324',
  whatsapp: '201156798324',
  address: 'المنيا، بني مزار، شرق المحطة، ميدان 25 يناير، فوق مكتبة الأهرام',
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
    { icon: 'braces', title: 'تقويم الأسنان', description: 'تقويم احترافي بأحدث التقنيات وأفضل المواد العالمية', isActive: true },
    { icon: 'clear', title: 'التقويم الشفاف', description: 'تقويم غير مرئي مريح وفعّال لنتائج مثالية', isActive: true },
    { icon: 'jaw', title: 'علاج مشاكل الفك', description: 'تشخيص وعلاج شامل لاضطرابات المفصل الفكي', isActive: true },
    { icon: 'child', title: 'تقويم الأطفال', description: 'رعاية متخصصة لتقويم أسنان الأطفال', isActive: true },
    { icon: 'smile', title: 'تصميم الابتسامة', description: 'إعادة تصميم ابتسامتك لتكون أكثر جمالاً', isActive: true },
    { icon: 'fast', title: 'العلاج السريع', description: 'بروتوكولات حديثة لتقليل مدة العلاج', isActive: true },
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
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

  html, body { overflow-x: hidden !important; max-width: 100vw !important; }
  .landing-root { font-family: 'Cairo', sans-serif; direction: rtl; color: #0f172a; background: #fff; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes shimmer-line { 0%{width:0} 100%{width:60px} }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes countUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* NAV */
  .l-nav {
    position: sticky; top:0; z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid #e2e8f0;
    padding: 0 6%;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
    transition: box-shadow 0.3s;
  }
  .l-nav.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }

  .l-nav-links { display: flex; align-items: center; gap: 4px; }
  .l-nav-link {
    padding: 7px 14px; border-radius: 8px;
    font-size: 14px; font-weight: 600; color: #475569;
    text-decoration: none; transition: all 0.18s;
    display: flex; align-items: center; gap: 6px;
  }
  .l-nav-link:hover { color: #2563eb; background: #eff6ff; }

  .l-nav-cta {
    background: #2563eb; color: white;
    padding: 9px 20px; border-radius: 9px;
    font-size: 14px; font-weight: 700;
    border: none; cursor: pointer;
    font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; gap: 7px;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(37,99,235,0.3);
    text-decoration: none;
  }
  .l-nav-cta:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }

  /* HERO */
  .l-hero {
    background: #0a1628;
    padding: 90px 6% 80px;
    position: relative; overflow: hidden;
    min-height: 88vh; display: flex; align-items: center;
  }

  .l-hero-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0.22;
    pointer-events: none;
    z-index: 0;
  }

  .l-hero-overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.75) 100%),
      radial-gradient(ellipse 900px 700px at 80% 50%, rgba(37,99,235,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 600px 500px at 15% 80%, rgba(6,182,212,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  .l-hero-grid {
    max-width: 1200px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center;
    position: relative; z-index:2;
  }

  .l-hero-tag {
    display: inline-flex; align-items: center; gap: 7px;
    background: white; color: #2563eb;
    border: 1.5px solid #bfdbfe; border-radius: 30px;
    padding: 6px 14px; font-size: 13px; font-weight: 700;
    margin-bottom: 22px; box-shadow: 0 2px 8px rgba(37,99,235,0.1);
    animation: fadeUp 0.5s ease-out;
  }
  .l-hero-tag .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #2563eb; animation: pulse-dot 1.5s infinite;
  }

  .l-hero-title {
    font-size: clamp(32px, 4.5vw, 58px); font-weight: 900;
    line-height: 1.18; color: #f1f5f9;
    margin-bottom: 20px; letter-spacing: -0.5px;
    animation: fadeUp 0.6s ease-out 0.1s both;
    text-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .l-hero-title .blue { color: #60a5fa; }
  .l-hero-title .teal { color: #22d3ee; }

  .l-hero-sub {
    font-size: 17px; color: #cbd5e1; line-height: 1.8;
    margin-bottom: 28px; max-width: 480px;
    animation: fadeUp 0.6s ease-out 0.2s both;
  }

  .l-hero-checks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; animation: fadeUp 0.6s ease-out 0.3s both; }
  .l-hero-check {
    display: flex; align-items: center; gap: 10px;
    font-size: 14.5px; font-weight: 500; color: #e2e8f0;
  }
  .l-hero-check-icon {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(37,99,235,0.35); color: #93c5fd;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 12px;
    border: 1px solid rgba(96,165,250,0.3);
  }

  .l-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; animation: fadeUp 0.6s ease-out 0.4s both; }

  .l-btn-primary {
    background: #2563eb; color: white;
    padding: 14px 28px; border-radius: 11px;
    font-size: 15px; font-weight: 800;
    border: none; cursor: pointer;
    font-family: 'Cairo', sans-serif;
    display: inline-flex; align-items: center; gap: 9px;
    text-decoration: none;
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
    transition: all 0.2s;
  }
  .l-btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,0.45); }

  .l-btn-secondary {
    background: white; color: #334155;
    padding: 14px 28px; border-radius: 11px;
    font-size: 15px; font-weight: 700;
    border: 1.5px solid #e2e8f0; cursor: pointer;
    font-family: 'Cairo', sans-serif;
    display: inline-flex; align-items: center; gap: 9px;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.2s;
  }
  .l-btn-secondary:hover { border-color: #bfdbfe; color: #2563eb; background: #f8fbff; transform: translateY(-1px); }

  /* HERO CARD */
  .l-hero-card {
    background: white; border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.08);
    padding: 32px; border: 1px solid #e8f0fe;
    animation: fadeUp 0.7s ease-out 0.2s both;
    position: relative;
  }
  .l-hero-card::before {
    content: ''; position: absolute; top: -1px; left: -1px; right: -1px;
    height: 4px; border-radius: 20px 20px 0 0;
    background: linear-gradient(90deg, #2563eb, #06b6d4);
  }

  /* STATS BAR */
  .l-stats-bar {
    background: white; border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 24px 32px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    max-width: 900px; margin: 0 auto;
    position: relative; z-index: 1;
  }
  .l-stat-item { text-align: center; }
  .l-stat-num { font-size: 32px; font-weight: 900; line-height: 1; color: #0f172a; letter-spacing: -1px; }
  .l-stat-label { font-size: 13px; color: #64748b; margin-top: 5px; font-weight: 500; }
  .l-stat-divider { width: 1px; background: #e2e8f0; }

  /* SECTION */
  .l-section { padding: 90px 6%; }
  .l-section-alt { background: #f8fafc; }
  .l-section-inner { max-width: 1200px; margin: 0 auto; }

  .l-section-header { text-align: center; margin-bottom: 56px; }
  .l-section-tag {
    display: inline-flex; align-items: center; gap: 7px;
    background: #eff6ff; color: #2563eb;
    border: 1px solid #bfdbfe; border-radius: 30px;
    padding: 5px 14px; font-size: 13px; font-weight: 700;
    margin-bottom: 14px;
  }
  .l-section-title {
    font-size: clamp(26px, 3vw, 40px); font-weight: 900;
    color: #0f172a; line-height: 1.25; letter-spacing: -0.3px;
    margin-bottom: 12px;
  }
  .l-section-sub { font-size: 16px; color: #64748b; max-width: 560px; margin: 0 auto; line-height: 1.7; }

  .l-underline {
    width: 60px; height: 4px; border-radius: 4px;
    background: linear-gradient(90deg, #2563eb, #06b6d4);
    margin: 14px auto 0;
  }

  /* SERVICE CARD */
  .l-service-card {
    background: white; border-radius: 16px;
    border: 1.5px solid #e2e8f0; padding: 28px 22px;
    text-align: center; transition: all 0.25s;
    position: relative; overflow: hidden;
  }
  .l-service-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: linear-gradient(90deg, #2563eb, #06b6d4);
    transform: scaleX(0); transition: transform 0.25s; transform-origin: right;
  }
  .l-service-card:hover { border-color: #bfdbfe; transform: translateY(-5px); box-shadow: 0 16px 40px rgba(37,99,235,0.1); }
  .l-service-card:hover::after { transform: scaleX(1); }

  .l-service-icon {
    width: 64px; height: 64px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin: 0 auto 18px;
  }

  /* REVIEW CARD */
  .l-review-card {
    background: white; border-radius: 16px;
    border: 1.5px solid #e2e8f0; padding: 26px;
    transition: all 0.2s; position: relative;
  }
  .l-review-card::before {
    content: '"'; position: absolute; top: 14px; right: 20px;
    font-size: 60px; color: #dbeafe; font-family: serif;
    line-height: 1; pointer-events: none;
  }
  .l-review-card:hover { border-color: #bfdbfe; box-shadow: 0 8px 24px rgba(37,99,235,0.08); }

  /* FAQ */
  .l-faq-item {
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    margin-bottom: 8px; overflow: hidden; transition: border-color 0.2s;
    background: white;
  }
  .l-faq-item.open { border-color: #bfdbfe; box-shadow: 0 4px 16px rgba(37,99,235,0.06); }
  .l-faq-btn {
    width: 100%; padding: 18px 22px; background: none; border: none;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px;
    color: #1e293b; cursor: pointer; text-align: right;
    transition: color 0.2s;
  }
  .l-faq-item.open .l-faq-btn { color: #2563eb; }
  .l-faq-answer { padding: 0 22px 18px; color: #64748b; font-size: 14.5px; line-height: 1.85; }
  .l-faq-chevron { transition: transform 0.25s; color: #94a3b8; flex-shrink: 0; }
  .l-faq-item.open .l-faq-chevron { transform: rotate(180deg); color: #2563eb; }

  /* DOCTOR SECTION */
  .l-doctor-card {
    background: white; border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    padding: 36px; box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  }
  .l-cert-item {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 14px 16px; border-radius: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    margin-bottom: 10px;
  }

  /* CONTACT CARD */
  .l-contact-card {
    background: white; border-radius: 14px;
    border: 1.5px solid #e2e8f0; padding: 24px 20px;
    text-align: center; text-decoration: none;
    display: block; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .l-contact-card:hover { border-color: #bfdbfe; box-shadow: 0 8px 24px rgba(37,99,235,0.1); transform: translateY(-3px); }
  .l-contact-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin: 0 auto 12px;
  }

  /* MENTORS */
  .l-mentors-section {
    padding: 80px 6%;
    background: linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%);
    text-align: center; position: relative; overflow: hidden;
  }
  .l-mentors-section::before {
    content: '❝';
    position: absolute; top: 20px; right: 6%;
    font-size: 160px; color: rgba(255,255,255,0.04);
    font-family: Georgia, serif; line-height: 1;
    pointer-events: none;
  }
  .l-mentor-card {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 32px 28px;
    transition: all 0.3s;
    backdrop-filter: blur(4px);
  }
  .l-mentor-card:hover {
    background: rgba(255,255,255,0.12);
    transform: translateY(-5px);
    border-color: rgba(255,255,255,0.3);
  }
  .l-mentor-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 28px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  /* FOOTER */
  .l-footer {
    background: #0f172a; color: rgba(255,255,255,0.65);
    padding: 48px 6% 24px;
  }

  /* TOOTH WA WIDGET */
  @keyframes waveSlide { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
  @keyframes toothBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .l-tooth-btn {
    position: fixed; bottom: 28px; right: 0; z-index: 9999;
    width: 46px; height: 52px;
    background: linear-gradient(145deg, #25d366, #128c7e);
    border: none; cursor: pointer;
    border-radius: 22px 0 0 22px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: -3px 4px 18px rgba(37,211,102,0.5);
    animation: toothBounce 3.5s ease-in-out infinite;
    transition: all 0.22s;
    padding: 0;
    outline: none;
  }
  .l-tooth-btn:hover {
    width: 52px;
    box-shadow: -4px 6px 24px rgba(37,211,102,0.65);
    animation: none;
  }

  .l-wa-popup {
    position: fixed; bottom: 90px; right: 16px; z-index: 9999;
    width: 290px;
    background: white; border-radius: 18px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(37,211,102,0.15);
    overflow: hidden;
    animation: popIn 0.25s ease-out;
    border: 1px solid #e2e8f0;
    font-family: 'Cairo', sans-serif;
    direction: rtl;
  }
  .l-wa-popup-head {
    background: linear-gradient(135deg, #25d366, #128c7e);
    padding: 14px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .l-wa-popup-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .l-wa-popup-name { font-size: 14px; font-weight: 800; color: white; }
  .l-wa-popup-status { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 1px; display: flex; align-items: center; gap: 4px; }
  .l-wa-popup-dot { width: 6px; height: 6px; border-radius: 50%; background: #a7f3d0; display: inline-block; animation: pulse-dot 1.5s infinite; }
  .l-wa-popup-body { padding: 14px 14px 12px; }
  .l-wa-popup-hint {
    background: #f1f5f9; border-radius: 10px 10px 10px 2px;
    padding: 9px 12px; font-size: 12.5px; color: #475569;
    margin-bottom: 12px; line-height: 1.6;
  }
  .l-wa-popup-textarea {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 9px 12px; font-family: 'Cairo', sans-serif;
    font-size: 13px; color: #0f172a; resize: none;
    outline: none; transition: border 0.18s;
    box-sizing: border-box; direction: rtl;
  }
  .l-wa-popup-textarea:focus { border-color: #25d366; }
  .l-wa-popup-send {
    width: 100%; margin-top: 10px;
    background: linear-gradient(135deg, #25d366, #128c7e);
    color: white; border: none; border-radius: 10px;
    padding: 10px; font-family: 'Cairo', sans-serif;
    font-size: 14px; font-weight: 800; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(37,211,102,0.35);
  }
  .l-wa-popup-send:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .l-wa-popup-send:disabled { opacity: 0.55; cursor: default; transform: none; }

  /* ═══ MOBILE NAV MENU ═══ */
  .l-mobile-menu-btn {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 8px;
  }
  .l-mobile-menu-btn span {
    display: block; width: 22px; height: 2px;
    background: #334155; border-radius: 2px; transition: all 0.25s;
  }
  .l-mobile-menu-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .l-mobile-menu-btn.open span:nth-child(2) { opacity: 0; }
  .l-mobile-menu-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .l-mobile-menu {
    position: fixed; top: 68px; left: 0; right: 0; z-index: 99;
    background: rgba(255,255,255,0.97); backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 5% 16px;
    display: flex; flex-direction: column; gap: 4px;
    animation: fadeUp 0.2s ease-out;
    box-shadow: 0 8px 28px rgba(0,0,0,0.1);
  }
  .l-mobile-menu a, .l-mobile-menu button {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px;
    font-size: 15px; font-weight: 700; color: #334155;
    text-decoration: none; border: none; background: none;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    transition: all 0.18s; width: 100%; text-align: right;
  }
  .l-mobile-menu a:hover, .l-mobile-menu button:hover { background: #eff6ff; color: #2563eb; }
  .l-mobile-menu .l-mobile-cta {
    background: #2563eb; color: white; border-radius: 10px;
    padding: 13px 16px; font-weight: 800; margin-top: 6px;
    box-shadow: 0 4px 14px rgba(37,99,235,0.3); justify-content: center;
  }
  .l-mobile-menu .l-mobile-cta:hover { background: #1d4ed8; color: white; }

  /* ═══ TABLET (≤ 900px) ═══ */
  @media (max-width: 900px) {
    .l-about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .l-about-grid > div:last-child { display: flex; justify-content: center; }
    .l-nav-links { display: none; }
    .l-nav > .l-nav-cta { display: none; }
    .l-mobile-menu-btn { display: flex; }

    .l-hero-grid { grid-template-columns: 1fr; gap: 32px; }
    .l-hero { padding: 60px 5% 60px; min-height: auto; }
    .l-hero-title { font-size: clamp(28px, 7vw, 44px); }
    .l-hero-sub { font-size: 15px; }
    .l-stats-bar { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 18px 20px; }
    .l-stat-divider { display: none; }
    .l-stat-num { font-size: 26px; }
    .l-section { padding: 60px 5%; }
    .l-section-title { font-size: clamp(22px, 5vw, 34px); }
  }

  /* ═══ MOBILE (≤ 640px) ═══ */
  @media (max-width: 640px) {
    .l-nav { padding: 0 4%; height: 60px; }

    /* ── Hero ── */
    .l-hero { padding: 52px 4% 36px; min-height: auto !important; }
    .l-hero-title { font-size: clamp(26px, 7.5vw, 36px); }
    .l-hero-sub { font-size: 14px; max-width: 100%; }
    .l-hero-checks { margin-bottom: 20px; }
    .l-hero-check { font-size: 13px; }
    .l-hero-btns { flex-direction: column; gap: 10px; }
    .l-hero-btns a, .l-hero-btns button { width: 100%; justify-content: center; }
    .l-btn-primary, .l-btn-secondary { padding: 13px 20px; font-size: 14px; }
    .l-hero-card { padding: 16px 14px; }

    /* ── Stats bar ── */
    .l-stats-bar {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px; padding: 14px 12px;
      border-radius: 12px; margin: 0 4px;
    }
    .l-stat-num { font-size: 22px; }
    .l-stat-label { font-size: 11px; }

    /* ── Sections ── */
    .l-section { padding: 44px 4%; }
    .l-section-header { margin-bottom: 28px; }
    .l-section-sub { font-size: 13.5px; }
    .l-section-title { font-size: clamp(20px, 6vw, 28px); }

    .l-service-card { padding: 20px 14px; }
    .l-service-icon { width: 52px; height: 52px; font-size: 20px; }

    .l-doctor-card { padding: 18px 14px; }
    .l-review-card { padding: 18px 14px; }

    /* ── About section doctor photo ── */
    .l-about-photo-outer { max-width: 100% !important; }
    .l-about-photo-outer img { width: 100% !important; max-width: 260px !important; }

    /* ── Portal section ── */
    .l-portal-split { grid-template-columns: 1fr !important; }
    .l-portal-divider { display: none !important; }
    .l-portal-col { padding-right: 0 !important; padding-left: 0 !important; }
    .l-portal-stats-grid { grid-template-columns: 1fr !important; border-radius: 12px; }
    .l-portal-stats-grid > div {
      padding: 14px 16px !important;
      border-left: none !important;
      border-bottom: 1px solid #e2e8f0;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      text-align: right !important;
    }
    .l-portal-stats-grid > div:last-child { border-bottom: none !important; }
    .l-portal-stats-grid > div > div:first-child { margin: 0 !important; }

    /* ── Thanks section ── */
    .l-thanks-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
    .l-about-grid { grid-template-columns: 1fr !important; gap: 28px !important; }

    /* ── CTA Banner ── */
    .l-cta-banner { flex-direction: column !important; padding: 22px 18px !important; text-align: center; gap: 16px !important; }
    .l-cta-banner h3 { font-size: 18px !important; }
    .l-cta-banner p { font-size: 13px !important; }
    .l-cta-banner a { width: 100% !important; justify-content: center !important; }

    /* ── Contact cards grid ── */
    .l-contact-grid-mobile { grid-template-columns: repeat(2, 1fr) !important; }
    .l-contact-card { padding: 16px 12px; }

    /* ── Mentors ── */
    .l-mentors-section { padding: 48px 4%; }
    .l-mentors-section::before { font-size: 80px; }

    /* ── Footer ── */
    .l-footer { padding: 32px 4% 20px; }

    /* ── WhatsApp widget ── */
    .l-wa-popup { width: calc(100vw - 32px); right: 8px; }
    .l-tooth-btn { bottom: 16px; }

    /* ── Mobile menu ── */
    .l-mobile-menu { top: 60px; }
  }

  /* ═══ SMALL (≤ 420px) ═══ */
  @media (max-width: 420px) {
    .l-hero { padding: 44px 4% 28px; }
    .l-hero-title { font-size: clamp(23px, 7vw, 30px); }
    .l-hero-card { padding: 14px 12px; }
    .l-stats-bar { grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 12px 10px; }
    .l-stat-num { font-size: 20px; }
    .l-section { padding: 36px 4%; }
    .l-btn-primary, .l-btn-secondary { padding: 12px 16px; font-size: 13.5px; }
  }
`;

const getServiceIcon = (key) => {
  const map = {
    braces: <FiAward size={22} />,
    clear:  <FiStar size={22} />,
    jaw:    <FiShield size={22} />,
    child:  <FiHeart size={22} />,
    smile:  <FiUser size={22} />,
    fast:   <FiZap size={22} />,
  };
  return map[key] || <FiAward size={22} />;
};

const SERVICE_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  { bg: '#f0fdfa', border: '#99f6e4', text: '#0d9488' },
  { bg: '#fdf4ff', border: '#e9d5ff', text: '#9333ea' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' },
  { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  { bg: '#fff1f2', border: '#fecdd3', text: '#e11d48' },
];

const WaveDivider = ({ from, to, variant = 'wave', flip = false, height = 70, animate = false }) => {
  const paths = {
    wave:     'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z',
    tilt:     'M0,0 C480,72 960,12 1440,58 L1440,0 Z',
    mountain: 'M0,58 L180,12 L360,52 L540,8 L720,48 L900,6 L1080,44 L1260,14 L1440,50 L1440,0 L0,0 Z',
    arc:      'M0,0 Q720,82 1440,0 L1440,0 Z',
    layered:  'M0,52 C300,8 600,80 900,38 C1100,12 1280,62 1440,28 L1440,0 L0,0 Z',
    peaks:    'M0,62 C150,18 300,72 500,22 C650,2 800,68 1000,18 C1150,0 1300,58 1440,28 L1440,0 L0,0 Z',
    gentle:   'M0,32 C400,82 800,0 1440,52 L1440,0 L0,0 Z',
    bubble:   'M0,8 C200,72 500,0 720,62 C900,92 1100,18 1440,52 L1440,0 L0,0 Z',
  };
  if (animate) {
    return (
      <div style={{ lineHeight: 0, background: to, overflow: 'hidden', position: 'relative' }}>
        <svg viewBox="0 0 2880 90" preserveAspectRatio="none"
          style={{ display: 'block', width: '200%', height: `${height}px`, animation: 'waveSlide 8s linear infinite' }}>
          <path d="M0,45 C240,88 480,4 720,45 C960,88 1200,4 1440,45 C1680,88 1920,4 2160,45 C2400,88 2640,4 2880,45 L2880,0 L0,0 Z" fill={from} />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ lineHeight: 0, background: to }}>
      <svg viewBox={`0 0 1440 ${height}`} preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: `${height}px`, transform: flip ? 'scaleX(-1)' : 'none' }}>
        <path d={paths[variant] || paths.wave} fill={from} />
      </svg>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [scrolled, setScrolled] = useState(false);
  const [certLightbox, setCertLightbox] = useState(null);
  const videoRef = React.useRef(null);
  const [waOpen, setWaOpen] = React.useState(false);
  const [waMsg, setWaMsg] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/site').then(r => {
      if (r.data && r.data._id) setSettings({ ...defaultSettings, ...r.data });
    }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = 3;
    const setSpeed = () => { vid.playbackRate = 3; };
    vid.addEventListener('ratechange', setSpeed);
    vid.addEventListener('play', setSpeed);
    return () => {
      vid.removeEventListener('ratechange', setSpeed);
      vid.removeEventListener('play', setSpeed);
    };
  }, []);

  const activeServices = (settings.services || []).filter(s => s.isActive !== false);
  const activeReviews = (settings.reviews || []).filter(r => r.isActive !== false);
  const activeFaqs = (settings.faqs || []).filter(f => f.isActive !== false);

  return (
    <>
      <style>{STYLE}</style>
      <div className="landing-root">

        {/* ── NAVBAR ── */}
        <nav className={`l-nav${scrolled ? ' scrolled' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '11px',
              background: 'white', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37,99,235,0.18)',
              border: '1.5px solid #e2e8f0', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>{settings.doctorName}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{settings.doctorTitle}</div>
            </div>
          </div>

          <div className="l-nav-links">
            <a href="#about" className="l-nav-link"><FiUser size={13} /> عن الطبيب</a>
            <a href="#services" className="l-nav-link"><FiGrid size={13} /> الخدمات</a>
            <a href="#reviews" className="l-nav-link"><FiStar size={13} /> آراء المرضى</a>
            <a href="#contact" className="l-nav-link"><FiMessageCircle size={13} /> تواصل معنا</a>
          </div>

          <button onClick={() => navigate('/login')} className="l-nav-cta">
            <FiUser size={13} /> دخول النظام
          </button>

          {/* Hamburger */}
          <button className={`l-mobile-menu-btn${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(o => !o)} aria-label="القائمة">
            <span /><span /><span />
          </button>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="l-mobile-menu" onClick={() => setMobileMenuOpen(false)}>
            <a href="#about"><FiUser size={15} /> عن الطبيب</a>
            <a href="#services"><FiGrid size={15} /> الخدمات</a>
            <a href="#reviews"><FiStar size={15} /> آراء المرضى</a>
            <a href="#contact"><FiMessageCircle size={15} /> تواصل معنا</a>
            <button className="l-mobile-cta" onClick={() => navigate('/login')}>
              <FiUser size={15} /> دخول النظام
            </button>
          </div>
        )}

        {/* ── HERO ── */}
        <section className="l-hero">
          <video
            ref={videoRef}
            className="l-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={e => { e.target.playbackRate = 3; }}
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="l-hero-overlay" />
          <div className="l-hero-grid">
            {/* LEFT CONTENT */}
            <div>
              <div className="l-hero-tag">
                <span className="dot" />
                عيادة د. وسام يوسف | بني مزار، المنيا
              </div>

              <h1 className="l-hero-title">
                ابتسامة أجمل<br />
                <span className="blue">تبدأ من </span>
                <span className="teal">هنا</span>
              </h1>

              <p className="l-hero-sub">{settings.heroSubtitle}</p>

              <div className="l-hero-checks">
                {['خبرة أكثر من 10 سنوات في تقويم الأسنان', 'أحدث التقنيات والمواد العالمية المعتمدة', 'رعاية شاملة ومتابعة دقيقة لكل مريض'].map((t, i) => (
                  <div key={i} className="l-hero-check">
                    <div className="l-hero-check-icon"><FiCheck /></div>
                    {t}
                  </div>
                ))}
              </div>

              <div className="l-hero-btns">
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="l-btn-primary">
                  <FaWhatsapp size={18} /> احجز موعدك الآن
                </a>
                <button onClick={() => navigate('/login')} className="l-btn-secondary">
                  <FiUser size={15} /> بوابة المريض
                </button>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div>
              <div className="l-hero-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '76px', height: '76px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                      padding: '3px',
                      boxShadow: '0 8px 28px rgba(37,99,235,0.35)',
                    }}>
                      <img
                        src="/doctor-photo.png"
                        alt="د. وسام يوسف"
                        style={{
                          width: '100%', height: '100%',
                          borderRadius: '50%', objectFit: 'cover',
                          objectPosition: 'center top',
                          border: '2px solid white',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '2px', left: '2px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#10b981', border: '2px solid white',
                      boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>{settings.doctorName}</div>
                    <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>{settings.doctorTitle}</div>
                    <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                      {[1,2,3,4,5].map(i => <FaStar key={i} style={{ color: '#f59e0b', fontSize: '12px' }} />)}
                      <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>5.0</span>
                    </div>
                  </div>
                </div>

                {[
                  { icon: <FiClock size={15} />, label: 'مواعيد العمل', value: settings.workingHours, color: '#2563eb', bg: '#eff6ff' },
                  { icon: <FiMapPin size={15} />, label: 'الموقع', value: settings.address, color: '#0891b2', bg: '#ecfeff', href: 'https://www.google.com/maps/search/?api=1&query=بني+مزار+شرق+المحطة+ميدان+25+يناير+المنيا+مصر' },
                  { icon: <FiPhone size={15} />, label: 'الاتصال', value: settings.phone, color: '#16a34a', bg: '#f0fdf4', href: `tel:${settings.phone}` },
                ].map((item, i) => {
                  const inner = (
                    <>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: item.bg, color: item.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: '13.5px', color: '#334155', fontWeight: 600, marginTop: '1px' }}>{item.value}</div>
                      </div>
                    </>
                  );
                  const rowStyle = {
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '10px',
                    background: '#f8fafc', border: '1px solid #f1f5f9',
                    marginBottom: '10px', textDecoration: 'none',
                    cursor: item.href ? 'pointer' : 'default',
                    transition: 'border-color 0.18s',
                  };
                  return item.href
                    ? <a key={i} href={item.href} target="_blank" rel="noreferrer" style={rowStyle}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#bfdbfe'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                      >{inner}</a>
                    : <div key={i} style={rowStyle}>{inner}</div>;
                })}

                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', borderRadius: '10px', marginTop: '14px',
                  background: 'linear-gradient(135deg, #25d366, #128c7e)', color: 'white',
                  fontWeight: 800, fontSize: '14.5px', textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                  transition: 'all 0.2s',
                }}>
                  <FaWhatsapp size={18} /> احجز عبر واتساب
                </a>
              </div>

              {/* Stats under card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                {[
                  { num: '+1000', label: 'مريض سعيد', icon: <FiUsers size={16}/>, bg: '#eff6ff', color: '#2563eb' },
                  { num: '98%', label: 'نسبة النجاح', icon: <FiTrendingUp size={16}/>, bg: '#fff7ed', color: '#ea580c' },
                  { num: '+10', label: 'سنوات خبرة', icon: <FiAward size={16}/>, bg: '#f0fdf4', color: '#16a34a' },
                  { num: '5★', label: 'تقييم المرضى', icon: <FiStar size={16}/>, bg: '#fdf4ff', color: '#9333ea' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.num}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Wave: Hero → Services */}
        <WaveDivider from="#0a1628" to="#f8fafc" animate height={90} />

        {/* ── SERVICES ── */}
        <section id="services" className="l-section l-section-alt">
          <div className="l-section-inner">
            <div className="l-section-header">
              <div className="l-section-tag"><FiAward size={13} /> خدماتنا</div>
              <h2 className="l-section-title">ماذا نقدم لك؟</h2>
              <p className="l-section-sub">نوفر مجموعة متكاملة من خدمات تقويم الأسنان بأحدث التقنيات العالمية</p>
              <div className="l-underline" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {activeServices.map((s, i) => {
                const c = SERVICE_COLORS[i % SERVICE_COLORS.length];
                return (
                  <div key={i} className="l-service-card">
                    <div className="l-service-icon" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                      <span style={{ color: c.text, display:'flex', alignItems:'center', justifyContent:'center' }}>{getServiceIcon(s.icon)}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>{s.title}</h3>
                    <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.7 }}>{s.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Wave: Services → About */}
        <WaveDivider from="#f8fafc" to="#ffffff" variant="tilt" height={60} />

        {/* ── ABOUT ── */}
        <section id="about" className="l-section">
          <div className="l-section-inner">
            <div className="l-about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>
              <div>
                <div className="l-section-tag" style={{ display: 'inline-flex' }}><FiUser size={13} /> عن الطبيب</div>
                <h2 className="l-section-title" style={{ textAlign: 'right', marginTop: '8px' }}>
                  {settings.doctorName}
                </h2>
                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>{settings.doctorTitle}</p>
                <p style={{ color: '#475569', lineHeight: 1.9, fontSize: '15px', marginBottom: '28px' }}>{settings.doctorBio}</p>

                <div className="l-about-mini-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
                  {[
                    { val: '+10', label: 'سنوات خبرة', color: '#2563eb', bg: '#eff6ff' },
                    { val: '+1K', label: 'مريض', color: '#0891b2', bg: '#ecfeff' },
                    { val: '98%', label: 'نجاح', color: '#16a34a', bg: '#f0fdf4' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '16px 10px', background: s.bg, borderRadius: '12px', border: `1.5px solid ${s.bg === '#eff6ff' ? '#bfdbfe' : s.bg === '#ecfeff' ? '#a5f3fc' : '#bbf7d0'}` }}>
                      <div style={{ fontSize: '26px', fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="l-btn-primary" style={{ fontSize: '14px' }}>
                  <FaWhatsapp size={16} /> تواصل الآن
                </a>
              </div>

              <div>
                {/* Doctor Photo — creative frame */}
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
                  <div className="l-about-photo-outer" style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    {/* Outer glow ring */}
                    <div style={{
                      position: 'absolute', inset: '-8px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.15))',
                      filter: 'blur(8px)',
                    }} />
                    {/* Gradient border frame */}
                    <div style={{
                      position: 'relative',
                      padding: '4px',
                      borderRadius: '22px',
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                      boxShadow: '0 16px 48px rgba(37,99,235,0.25)',
                    }}>
                      <img
                        src="/doctor-photo.png"
                        alt="د. وسام يوسف"
                        style={{
                          width: '100%',
                          maxWidth: '340px',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '18px',
                          display: 'block',
                        }}
                      />
                      {/* Badge overlay */}
                      <div style={{
                        position: 'absolute', bottom: '14px', left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'white',
                        borderRadius: '30px',
                        padding: '6px 16px',
                        display: 'flex', alignItems: 'center', gap: '7px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>أخصائي تقويم الأسنان | المنيا</span>
                      </div>
                    </div>
                    {/* Corner decoration */}
                    <div style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                      fontSize: '16px',
                    }}>⭐</div>
                  </div>
                </div>

                {/* Personal info tags */}
                {(settings.doctorUniversity || settings.doctorGraduationYear || settings.doctorLanguages || settings.doctorEmail) && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                      <FiUser style={{ color: '#2563eb' }} /> البيانات الشخصية
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {settings.doctorUniversity && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', padding: '5px 12px' }}>
                          <FaGraduationCap size={13} style={{ color: '#2563eb' }} />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e40af' }}>{settings.doctorUniversity}{settings.doctorGraduationYear ? ` — ${settings.doctorGraduationYear}` : ''}</span>
                        </div>
                      )}
                      {settings.doctorLanguages && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 12px' }}>
                          <FiGlobe size={13} style={{ color: '#16a34a' }} />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#15803d' }}>{settings.doctorLanguages}</span>
                        </div>
                      )}
                      {settings.doctorEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '20px', padding: '5px 12px' }}>
                          <FiMail size={13} style={{ color: '#9333ea' }} />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#7e22ce' }}>{settings.doctorEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {settings.certificates?.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                      <FaGraduationCap style={{ color: '#2563eb' }} /> المؤهلات والشهادات
                    </h4>
                    {settings.certificates.map((c, i) => (
                      <div key={i} className="l-cert-item" style={{ cursor: c.imageUrl ? 'pointer' : 'default' }}
                        onClick={() => c.imageUrl && setCertLightbox(c)}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: c.imageUrl ? '#eff6ff' : '#f8fafc', border: `1.5px solid ${c.imageUrl ? '#bfdbfe' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.imageUrl ? '#2563eb' : '#94a3b8', flexShrink: 0, overflow: 'hidden' }}>
                          {c.imageUrl
                            ? <img src={c.imageUrl} alt="شهادة" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            : <FiAward size={17} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{c.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.institution}{c.year && ` — ${c.year}`}</div>
                        </div>
                        {c.imageUrl && (
                          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }}>عرض</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {settings.doctorTraining?.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                      <FiBookOpen style={{ color: '#0891b2' }} /> الدورات التدريبية
                    </h4>
                    {settings.doctorTraining.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '10px', background: '#ecfeff', border: '1.5px solid #a5f3fc', marginBottom: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0891b2', marginTop: '7px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#164e63' }}>{t.title}</div>
                          <div style={{ fontSize: '12px', color: '#0e7490', marginTop: '2px' }}>{t.institution}{t.year && ` — ${t.year}`}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {settings.achievements?.length > 0 && (
                  <div>
                    <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                      <FiAward style={{ color: '#2563eb' }} /> الإنجازات
                    </h4>
                    {settings.achievements.map((a, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        padding: '14px 16px', borderRadius: '10px',
                        background: 'white', border: '1.5px solid #e2e8f0',
                        marginBottom: '10px', transition: 'all 0.2s',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', marginTop: '6px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{a.title}</div>
                          <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{a.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Wave: About → Reviews */}
        <WaveDivider from="#ffffff" to="#f8fafc" variant="mountain" flip height={65} />

        {/* ── REVIEWS ── */}
        {activeReviews.length > 0 && (
          <section id="reviews" className="l-section l-section-alt">
            <div className="l-section-inner">
              <div className="l-section-header">
                <div className="l-section-tag"><FiStar size={13} /> آراء المرضى</div>
                <h2 className="l-section-title">ماذا يقول مرضانا؟</h2>
                <div className="l-underline" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {activeReviews.map((r, i) => (
                  <div key={i} className="l-review-card">
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                      {[1,2,3,4,5].map(s => <FaStar key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#e2e8f0', fontSize: '14px' }} />)}
                    </div>
                    <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '14.5px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
                      {r.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '14px',
                      }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{r.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>مريض</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Wave: Reviews → FAQ */}
        <WaveDivider from="#f8fafc" to="#ffffff" variant="arc" height={60} />

        {/* ── FAQ ── */}
        {activeFaqs.length > 0 && (
          <section className="l-section">
            <div className="l-section-inner" style={{ maxWidth: '780px' }}>
              <div className="l-section-header">
                <div className="l-section-tag">الأسئلة الشائعة</div>
                <h2 className="l-section-title">أسئلة يسألها مرضانا</h2>
                <div className="l-underline" />
              </div>

              {activeFaqs.map((f, i) => (
                <div key={i} className={`l-faq-item${openFaq === i ? ' open' : ''}`}>
                  <button className="l-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.question}</span>
                    <FiChevronDown className="l-faq-chevron" size={18} />
                  </button>
                  {openFaq === i && (
                    <div className="l-faq-answer">{f.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SPECIAL THANKS ── */}
        <section className="l-section" style={{ overflow: 'hidden', position: 'relative', background: '#fff' }}>
          {/* Background video */}
          <video
            autoPlay muted loop playsInline preload="none"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          {/* Subtle white overlay so text stays crisp */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)', zIndex: 1, pointerEvents: 'none' }} />

          <div className="l-section-inner" style={{ position: 'relative', zIndex: 2 }}>
            {/* Header */}
            <div className="l-section-header">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)',
                borderRadius: '30px', padding: '6px 18px',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>فخر واعتزاز</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                فخور بأساتذتي الكرام
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                فخور بكوني تعلّمت التقويم على يد أشطر دكاترة التقويم في مصر والعالم العربي
              </p>
              <div style={{ width: '60px', height: '4px', borderRadius: '4px', background: 'linear-gradient(90deg, #f59e0b, #f97316)', margin: '16px auto 0' }} />
            </div>

            {/* Main content — photo + names */}
            <div className="l-thanks-grid" style={{
              display: 'grid', gridTemplateColumns: '1.1fr 0.9fr',
              gap: '56px', alignItems: 'center', marginTop: '8px',
            }}>
              {/* Photo with creative frame */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {/* Outer glow */}
                  <div style={{
                    position: 'absolute', inset: '-12px', borderRadius: '28px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(37,99,235,0.2))',
                    filter: 'blur(14px)',
                  }} />
                  {/* Gold gradient border */}
                  <div style={{
                    position: 'relative', padding: '4px', borderRadius: '24px',
                    background: 'linear-gradient(135deg, #f59e0b, #2563eb, #06b6d4)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                  }}>
                    <img
                      src="/dr-visit.png"
                      alt="زيارة د. بسمة و د. فادي للعيادة"
                      style={{
                        width: '100%', maxWidth: '420px',
                        height: '340px', objectFit: 'cover',
                        objectPosition: 'center top',
                        borderRadius: '20px', display: 'block',
                      }}
                    />
                    {/* Overlay label at bottom */}
                    <div style={{
                      position: 'absolute', bottom: '14px', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '30px', padding: '8px 20px',
                      border: '1px solid rgba(245,158,11,0.35)',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', fontFamily: 'Cairo, sans-serif' }}>
                        زيارة كريمة للعيادة
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Names & thank-you cards */}
              <div>
                {/* Quote */}
                <div style={{
                  padding: '20px 24px', borderRadius: '16px', marginBottom: '28px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  borderLeft: '1px solid #e2e8f0',
                  borderRight: '4px solid #f59e0b',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                  <p style={{
                    color: '#334155', fontSize: '15px', lineHeight: 1.9,
                    fontStyle: 'italic', margin: 0,
                  }}>
                    "Proud of being a student of such great mentors — فخور بكوني تعلّمت على يد هؤلاء العظماء."
                  </p>
                  <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 700, color: '#d97706' }}>
                    — د. وسام يوسف
                  </div>
                </div>

                {/* Dr. Basma card */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px 20px', borderRadius: '14px', marginBottom: '14px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(236,72,153,0.08)',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ec4899, #f97316)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 6px 18px rgba(236,72,153,0.3)',
                  }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '15px' }}>ب</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', marginBottom: '3px' }}>
                      دكتورة بسمة نبيل
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      أستاذتي في تقويم الأسنان — شكراً على كل ما علّمتِني
                    </div>
                  </div>
                </div>

                {/* Dr. Fadi card */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px 20px', borderRadius: '14px', marginBottom: '14px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 6px 18px rgba(37,99,235,0.3)',
                  }}>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '15px' }}>ف</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', marginBottom: '3px' }}>
                      البروفيسور د. فادي حسين
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      أستاذي في تقويم الأسنان — شكراً على كل ما علّمتني
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── PATIENT PORTAL CTA ── */}
        <section className="l-section" style={{ background: '#fff', overflow: 'hidden', position: 'relative' }}>
          {/* subtle bg blobs */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="l-section-inner" style={{ position: 'relative', zIndex: 1 }}>
            {/* Section header */}
            <div className="l-section-header">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '30px', padding: '6px 18px', marginBottom: '16px' }}>
                <FiUser size={13} style={{ color: '#2563eb' }} />
                <span style={{ color: '#2563eb', fontSize: '13px', fontWeight: 700 }}>بوابة المرضى الإلكترونية</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '12px' }}>
                عندك ملف طبي؟ <span style={{ color: '#2563eb' }}>تابع رحلتك العلاجية</span>
              </h2>
              <p style={{ fontSize: '15.5px', color: '#64748b', maxWidth: '540px', margin: '0 auto', lineHeight: 1.8 }}>
                من لوحة تحكمك الخاصة تابع جلساتك وخطة علاجك ومواعيدك وحسابك المالي في أي وقت
              </p>
              <div style={{ width: '60px', height: '4px', borderRadius: '4px', background: 'linear-gradient(90deg, #2563eb, #06b6d4)', margin: '16px auto 0' }} />
            </div>

            {/* Split layout: checklist | divider | action cards */}
            <div className="l-portal-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0', alignItems: 'stretch', marginTop: '8px' }}>

              {/* ── LEFT: checklist features ── */}
              <div className="l-portal-col" style={{ paddingLeft: '8px', paddingRight: '48px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a', marginBottom: '28px' }}>
                  كل ما تحتاجه في مكان واحد
                </h3>
                {[
                  { icon: <FiCalendar size={17} />, title: 'متابعة المواعيد', desc: 'عرض وإدارة كل مواعيدك القادمة بسهولة', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  { icon: <FiFileText size={17} />, title: 'الملف الطبي الكامل', desc: 'جلساتك وخطة علاجك وصور الأشعة في متناول يدك', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                  { icon: <FiTrendingUp size={17} />, title: 'متابعة تقدم العلاج', desc: 'تتبع مسيرتك العلاجية خطوة بخطوة', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
                  { icon: <FiShield size={17} />, title: 'بيانات محمية بالكامل', desc: 'حسابك آمن ومحمي بكلمة مرور خاصة بك', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < 3 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: item.bg, border: `1.5px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      {i < 3 && (
                        <div style={{ width: '1px', flex: 1, minHeight: '24px', background: 'linear-gradient(to bottom, #e2e8f0, transparent)', margin: '6px 0' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < 3 ? '18px' : '0' }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <FiCheck size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                        {item.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── VERTICAL DIVIDER ── */}
              <div className="l-portal-divider" style={{ background: 'linear-gradient(to bottom, transparent 5%, #e2e8f0 25%, #e2e8f0 75%, transparent 95%)', width: '1px' }} />

              {/* ── RIGHT: action cards ── */}
              <div className="l-portal-col" style={{ paddingRight: '8px', paddingLeft: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Login card */}
                <div
                  style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '22px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => navigate('/login')}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', flexShrink: 0 }}>
                      <FiLock size={20} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>تسجيل الدخول</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>عندك ملف بالفعل</div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>سجّل دخولك بجوالك وكلمة مرورك وتابع كل شيء في لوحتك</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                    دخول البوابة <FiArrowLeft size={13} />
                  </div>
                </div>

                {/* Register card */}
                <div
                  style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '22px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                  onClick={() => navigate('/register')}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px' }}>جديد</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', flexShrink: 0 }}>
                      <FiFileText size={20} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>افتح ملفك الآن</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>مريض جديد</div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '13px', lineHeight: 1.7, margin: '0 0 14px' }}>سجّل بياناتك وافتح ملفك الطبي بنفسك في ثوانٍ — كشف أو استشارة</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#16a34a', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                    إنشاء ملف جديد <FiArrowLeft size={13} />
                  </div>
                </div>

                {/* Forgot Password link */}
                <button
                  onClick={() => navigate('/forgot-password')}
                  style={{ background: 'none', border: '1.5px dashed #e2e8f0', borderRadius: '12px', padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '13.5px', fontWeight: 600, transition: 'all 0.2s', fontFamily: 'Cairo, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#7c3aed'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <FiLock size={15} />
                  نسيت كلمة مرورك؟ استعدها بسهولة
                </button>
              </div>
            </div>

            {/* Bottom stats bar */}
            <div className="l-portal-stats-grid" style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {[
                { icon: <FiShield size={20} />, label: 'بيانات محمية', val: '100%', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                { icon: <FiSmartphone size={20} />, label: 'يعمل على الجوال', val: 'كاملاً', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                { icon: <FiZap size={20} />, label: 'تحديث فوري للبيانات', val: 'لحظي', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '24px 20px', borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, margin: '0 auto 10px' }}>
                    {s.icon}
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 900, fontSize: '20px', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wave: Special Thanks → Contact */}
        <WaveDivider from="#ffffff" to="#f8fafc" variant="gentle" height={60} />

        {/* ── CONTACT ── */}
        <section id="contact" className="l-section l-section-alt">
          <div className="l-section-inner">
            <div className="l-section-header">
              <div className="l-section-tag"><FiMessageCircle size={13} /> تواصل معنا</div>
              <h2 className="l-section-title">عيادة د. وسام يوسف — بني مزار، المنيا</h2>
              <p className="l-section-sub">احجز موعدك في عيادة تقويم الأسنان — بني مزار، شرق المحطة، ميدان 25 يناير</p>
              <div className="l-underline" />
            </div>

            <div className="l-contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', maxWidth: '1060px', margin: '0 auto' }}>
              {[
                { icon: <FaWhatsapp size={24} />, label: 'واتساب', value: `+${settings.whatsapp}`, href: `https://wa.me/${settings.whatsapp}`, bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                { icon: <FaPhone size={22} />, label: 'اتصل بنا', value: settings.phone, href: `tel:${settings.phone}`, bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
                { icon: <FiMapPin size={22} />, label: 'الموقع', value: settings.address, href: 'https://www.google.com/maps/search/?api=1&query=بني+مزار+شرق+المحطة+ميدان+25+يناير+المنيا+مصر', bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
                { icon: <FiClock size={22} />, label: 'ساعات العمل', value: settings.workingHours, href: '#', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
                { icon: <span style={{ fontSize: '22px', lineHeight: 1 }}>⚡</span>, label: 'إنستا باي', value: '01156798324', href: '#', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
              ].map((c, i) => (
                <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="l-contact-card" onClick={c.href === '#' ? e => e.preventDefault() : undefined}>
                  <div className="l-contact-icon" style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>{c.label}</div>
                  <div style={{ fontSize: '14px', color: '#334155', fontWeight: 700 }}>{c.value}</div>
                </a>
              ))}
            </div>

            {/* CTA Banner */}
            <div className="l-cta-banner" style={{
              marginTop: '48px', background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
              borderRadius: '20px', padding: '40px 48px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '24px', flexWrap: 'wrap',
            }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>جاهز لابتسامة أجمل؟</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14.5px' }}>احجز استشارتك المجانية الآن ودعنا نبدأ رحلتك معنا</p>
              </div>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" style={{
                background: 'white', color: '#2563eb',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px',
                textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                <FaWhatsapp size={18} /> احجز الآن
              </a>
            </div>
          </div>
        </section>


        {/* ── SEO RICH TEXT SECTION ── */}
        <section style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '48px 24px 32px', direction: 'rtl' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px' }}>

              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #2563eb', paddingBottom: '8px', display: 'inline-block' }}>
                  عيادة د. وسام يوسف لتقويم الأسنان
                </h2>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 2 }}>
                  دكتور وسام يوسف أخصائي تقويم الأسنان في بني مزار، محافظة المنيا، مصر.
                  خبرة أكثر من 10 سنوات في تقويم الأسنان للأطفال والبالغين.
                  يقدم أفضل خدمات تقويم الأسنان في المنيا بأحدث التقنيات وأعلى معايير الجودة.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #0891b2', paddingBottom: '8px', display: 'inline-block' }}>
                  خدمات تقويم الأسنان
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['تقويم الأسنان التقليدي', 'التقويم الشفاف (Invisalign)', 'تصميم الابتسامة', 'تقويم أسنان الأطفال في المنيا', 'علاج مشاكل الفك', 'العلاج السريع للتقويم'].map((s, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#64748b', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#2563eb', fontSize: '10px' }}>●</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
                  معلومات العيادة
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    { label: 'العنوان', val: 'بني مزار، المنيا، شرق المحطة، ميدان 25 يناير' },
                    { label: 'الهاتف', val: '01156798324' },
                    { label: 'المواعيد', val: 'السبت - الخميس: 10 ص - 8 م' },
                    { label: 'التخصص', val: 'تقويم الأسنان — Orthodontics' },
                  ].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#64748b', padding: '5px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                      <span style={{ fontWeight: 700, color: '#374151' }}>{item.label}: </span>{item.val}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              عيادة د. وسام يوسف لتقويم الأسنان — بني مزار، المنيا، مصر | أخصائي تقويم الأسنان للأطفال والبالغين | Orthodontist Beni Mazar El Minya Egypt
            </p>
          </div>
        </section>

        {/* Wave: SEO → Footer */}
        <WaveDivider from="#f8fafc" to="#0f172a" variant="bubble" height={75} />

        {/* ── FOOTER ── */}
        <footer className="l-footer">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800 }}>{settings.doctorName}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>{settings.doctorTitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {['#about', '#services', '#reviews', '#contact'].map((h, i) => (
                  <a key={i} href={h} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                    {['الطبيب', 'الخدمات', 'المرضى', 'تواصل'][i]}
                  </a>
                ))}
              </div>
            </div>
            <div style={{ paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ fontSize: '13px' }}>جميع الحقوق محفوظة © {new Date().getFullYear()} — عيادة {settings.doctorName}</p>
              <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <FiUser size={13} /> دخول النظام
              </button>
            </div>
            <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>
                صنع عبر كيروكس استوديو | Qirox Studio
              </a>
            </div>
          </div>
        </footer>

        {/* Tooth WhatsApp Widget */}
        {waOpen && (
          <div className="l-wa-popup">
            <div className="l-wa-popup-head">
              <div className="l-wa-popup-avatar"><FiUser size={18} color="white" /></div>
              <div>
                <div className="l-wa-popup-name">{settings.doctorName}</div>
                <div className="l-wa-popup-status">
                  <span className="l-wa-popup-dot" /> متاح الآن
                </div>
              </div>
            </div>
            <div className="l-wa-popup-body">
              <div className="l-wa-popup-hint">
                أهلاً، اكتب رسالتك وسنرد عليك في أقرب وقت.
              </div>
              <textarea
                className="l-wa-popup-textarea"
                rows={3}
                placeholder="اكتب رسالتك هنا..."
                value={waMsg}
                onChange={e => setWaMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && waMsg.trim()) {
                    e.preventDefault();
                    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(waMsg.trim())}`, '_blank');
                    setWaMsg(''); setWaOpen(false);
                  }
                }}
                autoFocus
              />
              <button
                className="l-wa-popup-send"
                disabled={!waMsg.trim()}
                onClick={() => {
                  window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(waMsg.trim())}`, '_blank');
                  setWaMsg(''); setWaOpen(false);
                }}
              >
                <FaWhatsapp size={16} /> إرسال عبر واتساب
              </button>
            </div>
          </div>
        )}

        {/* Certificate Lightbox */}
        {certLightbox && (
          <div
            onClick={() => setCertLightbox(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(6px)' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', maxWidth: '680px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.3s ease-out' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>{certLightbox.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '2px' }}>{certLightbox.institution}{certLightbox.year ? ` — ${certLightbox.year}` : ''}</div>
                </div>
                <button onClick={() => setCertLightbox(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiX size={18} />
                </button>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc' }}>
                {certLightbox.imageUrl?.match(/\.(pdf)$/i) ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '12px' }}>ملف PDF</div>
                    <a href={certLightbox.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '10px', fontFamily: 'Cairo, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
                      فتح الشهادة
                    </a>
                  </div>
                ) : (
                  <img src={certLightbox.imageUrl} alt={certLightbox.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
                )}
              </div>
            </div>
          </div>
        )}

        <button className="l-tooth-btn" onClick={() => setWaOpen(o => !o)} title="تواصل عبر واتساب">
          <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2C10.5 2 8.5 3.5 7.5 5.5C6.8 4.8 5.8 4.5 4.8 4.8C3.2 5.3 2.2 7 2.5 8.8C1.5 9.8 1 11.2 1 12.5C1 15 2.5 17.2 4.5 18.3C5 20.5 5.8 22.5 7 24C8 25.3 9 26 10 25.8C10.8 25.6 11.5 24.8 12 23.5C12.3 22.7 12.7 22 13 22C13.3 22 13.7 22.7 14 23.5C14.5 24.8 15.2 25.6 16 25.8C17 26 18 25.3 19 24C20.2 22.5 21 20.5 21.5 18.3C23.5 17.2 25 15 25 12.5C25 11.2 24.5 9.8 23.5 8.8C23.8 7 22.8 5.3 21.2 4.8C20.2 4.5 19.2 4.8 18.5 5.5C17.5 3.5 15.5 2 13 2Z" fill="white" fillOpacity="0.92"/>
            <path d="M9.5 10.5C9.5 9.4 10.2 8.5 11 8.5C11.8 8.5 12.5 9.4 12.5 10.5" stroke="rgba(37,211,102,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M13.5 10.5C13.5 9.4 14.2 8.5 15 8.5C15.8 8.5 16.5 9.4 16.5 10.5" stroke="rgba(37,211,102,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}
