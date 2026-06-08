const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  doctorName: { type: String, default: 'د. وسام يوسف' },
  doctorTitle: { type: String, default: 'أخصائي تقويم الأسنان' },
  doctorBio: { type: String, default: 'طبيب متخصص في تقويم الأسنان بخبرة أكثر من 10 سنوات.' },
  doctorExperience: { type: String, default: '+10 سنوات خبرة' },
  doctorPatients: { type: String, default: '+1000 مريض' },
  doctorSuccess: { type: String, default: '98% نسبة نجاح' },
  phone: { type: String, default: '01156798324' },
  whatsapp: { type: String, default: '201156798324' },
  address: { type: String, default: 'القاهرة، مصر' },
  googleMapsUrl: String,
  workingHours: { type: String, default: 'السبت - الخميس: 10 ص - 8 م' },
  heroTitle: { type: String, default: 'ابتسامة أجمل تبدأ من د. وسام يوسف' },
  heroSubtitle: { type: String, default: 'خبرة متخصصة في تقويم الأسنان بأحدث التقنيات' },
  doctorUniversity: { type: String, default: '' },
  doctorGraduationYear: { type: String, default: '' },
  doctorEmail: { type: String, default: '' },
  doctorLanguages: { type: String, default: '' },
  certificates: [{ title: String, year: String, institution: String, imageUrl: String }],
  achievements: [{ title: String, description: String }],
  doctorTraining: [{ title: String, institution: String, year: String }],
  services: [{
    icon: String,
    title: String,
    description: String,
    isActive: { type: Boolean, default: true },
  }],
  reviews: [{
    name: String,
    rating: { type: Number, default: 5 },
    text: String,
    isActive: { type: Boolean, default: true },
  }],
  faqs: [{
    question: String,
    answer: String,
    isActive: { type: Boolean, default: true },
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
