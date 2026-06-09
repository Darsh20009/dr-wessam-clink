const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const { auth, doctorOnly } = require('../middleware/auth');

const router = express.Router();

const siteCache = { data: null, ts: 0 };
const SITE_CACHE_TTL = 5 * 60 * 1000;

const defaultSettings = {
  key: 'main',
  doctorName: 'د. وسام يوسف',
  doctorTitle: 'أخصائي تقويم الأسنان - بني مزار، المنيا',
  doctorBio: 'دكتور وسام يوسف أخصائي تقويم الأسنان في بني مزار، محافظة المنيا، مصر. خبرة أكثر من 10 سنوات في علاج حالات التقويم المختلفة للأطفال والبالغين. أكثر من 1000 حالة ناجحة بأحدث تقنيات التقويم وأعلى معايير الجودة.',
  doctorExperience: '+10 سنوات خبرة',
  doctorPatients: '+1000 مريض سعيد',
  doctorSuccess: '98% نسبة نجاح',
  phone: '01156798324',
  whatsapp: '201156798324',
  address: 'المنيا، بني مزار، شرق المحطة، ميدان 25 يناير، فوق مكتبة الأهرام',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=بني+مزار+شرق+المحطة+ميدان+25+يناير+المنيا+مصر',
  workingHours: 'السبت - الخميس: 10 ص - 8 م',
  heroTitle: 'ابتسامة أجمل تبدأ من هنا',
  heroSubtitle: 'د. وسام يوسف أخصائي تقويم الأسنان في بني مزار، المنيا — خبرة +10 سنوات بأحدث التقنيات وأعلى معايير الجودة',
  doctorUniversity: 'جامعة القاهرة',
  doctorGraduationYear: '2010',
  doctorEmail: '',
  doctorLanguages: 'العربية، الإنجليزية',
  certificates: [
    { title: 'بكالوريوس طب الأسنان', year: '2010', institution: 'جامعة القاهرة', imageUrl: '' },
    { title: 'ماجستير تقويم الأسنان', year: '2014', institution: 'جامعة القاهرة', imageUrl: '' },
    { title: 'زمالة التقويم', year: '2016', institution: 'الجمعية المصرية لتقويم الأسنان', imageUrl: '' },
  ],
  doctorTraining: [
    { title: 'دورة تقويم الأسنان المتقدم', institution: 'الجمعية المصرية لطب الأسنان', year: '2015' },
    { title: 'دورة التقويم الشفاف', institution: 'مركز التدريب الدولي', year: '2018' },
  ],
  achievements: [
    { title: '+1000 حالة تقويم ناجحة', description: 'علاج حالات متنوعة بنتائج متميزة' },
    { title: 'عضو جمعية التقويم المصرية', description: 'عضو فعّال في الجمعية العلمية' },
    { title: 'مدرب معتمد', description: 'تدريب أطباء الأسنان على التقويم' },
  ],
  services: [
    { icon: '🦷', title: 'تقويم الأسنان', description: 'تقويم احترافي بأحدث التقنيات وأفضل المواد العالمية', isActive: true },
    { icon: '💎', title: 'التقويم الشفاف', description: 'تقويم غير مرئي مريح وفعّال لنتائج مثالية', isActive: true },
    { icon: '🦴', title: 'علاج مشاكل الفك', description: 'تشخيص وعلاج شامل لاضطرابات المفصل الفكي', isActive: true },
    { icon: '👶', title: 'تقويم الأطفال', description: 'رعاية متخصصة لتقويم أسنان الأطفال في مرحلة النمو', isActive: true },
    { icon: '😁', title: 'تصميم الابتسامة', description: 'إعادة تصميم ابتسامتك لتكون أكثر جمالاً وتناسقاً', isActive: true },
  ],
  reviews: [
    { name: 'أحمد محمد', rating: 5, text: 'دكتور ممتاز، نتائج رائعة في وقت قياسي. أنصح الجميع بالتقويم عنده.', isActive: true },
    { name: 'سارة إبراهيم', rating: 5, text: 'تجربة احترافية من أول زيارة. الدكتور متميز ومتابعة ممتازة.', isActive: true },
    { name: 'محمد علي', rating: 5, text: 'الحمد لله انتهى التقويم والنتيجة فوق التوقعات. شكراً دكتور وسام.', isActive: true },
  ],
  faqs: [
    { question: 'أين عيادة دكتور وسام يوسف؟', answer: 'عيادة د. وسام يوسف في بني مزار، المنيا، شرق المحطة، ميدان 25 يناير، فوق مكتبة الأهرام. للتواصل والحجز: 01156798324.', isActive: true },
    { question: 'كم مدة علاج التقويم؟', answer: 'تتراوح مدة علاج التقويم عادةً بين 12 و24 شهراً حسب الحالة.', isActive: true },
    { question: 'هل التقويم مؤلم؟', answer: 'قد يكون هناك إحساس خفيف في الأيام الأولى ثم يختفي تدريجياً.', isActive: true },
    { question: 'ما الفرق بين التقويم العادي والشفاف؟', answer: 'التقويم الشفاف غير مرئي ومريح أكثر، لكن كلاهما فعّال حسب الحالة.', isActive: true },
    { question: 'كيف أحجز موعد مع دكتور وسام يوسف؟', answer: 'يمكنك الحجز عبر واتساب على الرقم 01156798324 أو من خلال نظام الحجز الإلكتروني على الموقع.', isActive: true },
    { question: 'هل أحتاج لحجز موعد مسبق؟', answer: 'نعم، يُفضّل حجز موعد مسبق لضمان الوقت المناسب.', isActive: true },
  ],
  systemName: 'نظام عيادة د. وسام يوسف',
  systemSubtitle: 'نظام إدارة العيادة المتكامل',
  portalWelcomeTitle: 'أهلاً بك في بوابتك الطبية',
  portalWelcomeMsg: 'تابع مواعيدك وجلساتك ومدفوعاتك بكل سهولة',
  bookingWhatsappMsg: 'مرحباً دكتور، أريد حجز موعد',
  appointmentLocation: 'بني مزار - المنيا - شرق المحطة فوق مكتبة الأهرام',
  clinicTagline: 'ابتسامة أجمل تبدأ من هنا',
  loginWelcomeMsg: 'سجل دخولك للوصول إلى حسابك',
};

router.get('/', async (req, res) => {
  try {
    if (siteCache.data && Date.now() - siteCache.ts < SITE_CACHE_TTL) {
      return res.json(siteCache.data);
    }
    let settings = await SiteSettings.findOne({ key: 'main' }).lean();
    if (!settings) {
      settings = await SiteSettings.create(defaultSettings);
    } else {
      const needsMigration =
        settings.address === 'القاهرة، مصر' ||
        settings.address === 'القاهرة' ||
        !settings.address?.includes('بني مزار') ||
        !settings.doctorBio?.includes('بني مزار');
      if (needsMigration) {
        await SiteSettings.findOneAndUpdate(
          { key: 'main' },
          {
            address: defaultSettings.address,
            googleMapsUrl: defaultSettings.googleMapsUrl,
            doctorTitle: settings.doctorTitle === 'أخصائي تقويم الأسنان' ? defaultSettings.doctorTitle : settings.doctorTitle,
            heroSubtitle: settings.heroSubtitle === 'خبرة متخصصة في تقويم الأسنان بأحدث التقنيات وأعلى معايير الجودة' ? defaultSettings.heroSubtitle : settings.heroSubtitle,
            doctorBio: !settings.doctorBio?.includes('بني مزار') ? defaultSettings.doctorBio : settings.doctorBio,
          },
          { new: true }
        );
        settings = await SiteSettings.findOne({ key: 'main' }).lean();
      }
    }
    siteCache.data = settings;
    siteCache.ts = Date.now();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', auth, doctorOnly, async (req, res) => {
  try {
    siteCache.data = null;
    let settings = await SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { ...req.body, key: 'main' },
      { new: true, upsert: true, runValidators: false }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
