import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSave, FiGlobe, FiUser, FiPhone, FiStar, FiHelpCircle, FiPlus, FiTrash2 } from 'react-icons/fi';

const tabs = [
  { id: 'hero', label: 'الرئيسية', icon: <FiGlobe /> },
  { id: 'doctor', label: 'الطبيب', icon: <FiUser /> },
  { id: 'services', label: 'الخدمات', icon: <FiStar /> },
  { id: 'reviews', label: 'آراء المرضى', icon: <FiStar /> },
  { id: 'faqs', label: 'الأسئلة الشائعة', icon: <FiHelpCircle /> },
  { id: 'contact', label: 'التواصل', icon: <FiPhone /> },
];

export default function SiteManager() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    axios.get('/site').then(r => { setSettings(r.data); setLoading(false); }).catch(() => { toast.error('خطأ في التحميل'); setLoading(false); });
  }, []);

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const setArr = (key, idx, subKey, value) => setSettings(s => {
    const arr = [...(s[key] || [])];
    arr[idx] = { ...arr[idx], [subKey]: value };
    return { ...s, [key]: arr };
  });

  const addItem = (key, template) => setSettings(s => ({ ...s, [key]: [...(s[key] || []), template] }));
  const removeItem = (key, idx) => setSettings(s => ({ ...s, [key]: (s[key] || []).filter((_, i) => i !== idx) }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.put('/site', settings);
      toast.success('تم حفظ التغييرات بنجاح');
    } catch { toast.error('خطأ في الحفظ'); }
    setSaving(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!settings) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الموقع</h1>
          <p className="page-subtitle">تعديل محتوى الموقع الإلكتروني</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '10px', border: 'none',
            background: activeTab === t.id ? '#2563eb' : 'white',
            color: activeTab === t.id ? 'white' : '#475569',
            fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: activeTab === t.id ? '0 2px 8px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div className="card">
        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div>
            <h3 className="section-title">إعدادات الصفحة الرئيسية</h3>
            <div className="form-group">
              <label>العنوان الرئيسي</label>
              <input className="form-control" value={settings.heroTitle || ''} onChange={e => set('heroTitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label>العنوان الفرعي</label>
              <textarea className="form-control" value={settings.heroSubtitle || ''} onChange={e => set('heroSubtitle', e.target.value)} rows={2} />
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label>إجمالي المرضى</label>
                <input className="form-control" value={settings.doctorPatients || ''} onChange={e => set('doctorPatients', e.target.value)} placeholder="+1000 مريض" />
              </div>
              <div className="form-group">
                <label>سنوات الخبرة</label>
                <input className="form-control" value={settings.doctorExperience || ''} onChange={e => set('doctorExperience', e.target.value)} placeholder="+10 سنوات" />
              </div>
              <div className="form-group">
                <label>نسبة النجاح</label>
                <input className="form-control" value={settings.doctorSuccess || ''} onChange={e => set('doctorSuccess', e.target.value)} placeholder="98% نجاح" />
              </div>
            </div>
            <div className="form-group">
              <label>عنوان SEO (للمحركات)</label>
              <input className="form-control" value={settings.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label>وصف SEO</label>
              <textarea className="form-control" value={settings.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} rows={2} />
            </div>
            <div className="form-group">
              <label>الكلمات المفتاحية</label>
              <input className="form-control" value={settings.seoKeywords || ''} onChange={e => set('seoKeywords', e.target.value)} placeholder="تقويم أسنان, أسنان, مصر..." />
            </div>
          </div>
        )}

        {/* Doctor Tab */}
        {activeTab === 'doctor' && (
          <div>
            <h3 className="section-title">بيانات الطبيب</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>اسم الطبيب</label>
                <input className="form-control" value={settings.doctorName || ''} onChange={e => set('doctorName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>التخصص</label>
                <input className="form-control" value={settings.doctorTitle || ''} onChange={e => set('doctorTitle', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>نبذة مختصرة</label>
              <textarea className="form-control" value={settings.doctorBio || ''} onChange={e => set('doctorBio', e.target.value)} rows={4} />
            </div>
            <h4 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 700, color: '#1e3a8a' }}>الشهادات والمؤهلات</h4>
            {(settings.certificates || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label>الشهادة</label>
                  <input className="form-control" value={c.title || ''} onChange={e => setArr('certificates', i, 'title', e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>السنة</label>
                  <input className="form-control" value={c.year || ''} onChange={e => setArr('certificates', i, 'year', e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label>الجهة</label>
                  <input className="form-control" value={c.institution || ''} onChange={e => setArr('certificates', i, 'institution', e.target.value)} />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem('certificates', i)}><FiTrash2 /></button>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('certificates', { title: '', year: '', institution: '' })}><FiPlus /> إضافة شهادة</button>

            <h4 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 700, color: '#1e3a8a' }}>الإنجازات</h4>
            {(settings.achievements || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>العنوان</label>
                  <input className="form-control" value={a.title || ''} onChange={e => setArr('achievements', i, 'title', e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label>الوصف</label>
                  <input className="form-control" value={a.description || ''} onChange={e => setArr('achievements', i, 'description', e.target.value)} />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem('achievements', i)}><FiTrash2 /></button>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('achievements', { title: '', description: '' })}><FiPlus /> إضافة إنجاز</button>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <h3 className="section-title">الخدمات</h3>
            {(settings.services || []).map((s, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{s.icon}</span>
                    <strong style={{ color: '#1e3a8a' }}>{s.title || `خدمة ${i + 1}`}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                      <input type="checkbox" checked={s.isActive !== false} onChange={e => setArr('services', i, 'isActive', e.target.checked)} />
                      نشط
                    </label>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem('services', i)}><FiTrash2 /></button>
                  </div>
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label>الأيقونة (emoji)</label>
                    <input className="form-control" value={s.icon || ''} onChange={e => setArr('services', i, 'icon', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>اسم الخدمة</label>
                    <input className="form-control" value={s.title || ''} onChange={e => setArr('services', i, 'title', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>الوصف</label>
                    <input className="form-control" value={s.description || ''} onChange={e => setArr('services', i, 'description', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('services', { icon: '🦷', title: '', description: '', isActive: true })}><FiPlus /> إضافة خدمة</button>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h3 className="section-title">آراء المرضى</h3>
            {(settings.reviews || []).map((r, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', marginLeft: '12px' }}>
                    <input type="checkbox" checked={r.isActive !== false} onChange={e => setArr('reviews', i, 'isActive', e.target.checked)} />
                    نشط
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem('reviews', i)}><FiTrash2 /></button>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>اسم المريض</label>
                    <input className="form-control" value={r.name || ''} onChange={e => setArr('reviews', i, 'name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>التقييم (1-5)</label>
                    <input className="form-control" type="number" min={1} max={5} value={r.rating || 5} onChange={e => setArr('reviews', i, 'rating', parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>التقييم / الرأي</label>
                  <textarea className="form-control" value={r.text || ''} onChange={e => setArr('reviews', i, 'text', e.target.value)} rows={2} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('reviews', { name: '', rating: 5, text: '', isActive: true })}><FiPlus /> إضافة تقييم</button>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div>
            <h3 className="section-title">الأسئلة الشائعة</h3>
            {(settings.faqs || []).map((f, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', marginLeft: '12px' }}>
                    <input type="checkbox" checked={f.isActive !== false} onChange={e => setArr('faqs', i, 'isActive', e.target.checked)} />
                    نشط
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem('faqs', i)}><FiTrash2 /></button>
                </div>
                <div className="form-group">
                  <label>السؤال</label>
                  <input className="form-control" value={f.question || ''} onChange={e => setArr('faqs', i, 'question', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>الإجابة</label>
                  <textarea className="form-control" value={f.answer || ''} onChange={e => setArr('faqs', i, 'answer', e.target.value)} rows={2} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('faqs', { question: '', answer: '', isActive: true })}><FiPlus /> إضافة سؤال</button>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div>
            <h3 className="section-title">بيانات التواصل</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input className="form-control" value={settings.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="01000000000" />
              </div>
              <div className="form-group">
                <label>رقم واتساب (بالكود الدولي)</label>
                <input className="form-control" value={settings.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="201000000000" />
              </div>
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input className="form-control" value={settings.address || ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label>رابط خرائط جوجل</label>
              <input className="form-control" value={settings.googleMapsUrl || ''} onChange={e => set('googleMapsUrl', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
            <div className="form-group">
              <label>مواعيد العمل</label>
              <input className="form-control" value={settings.workingHours || ''} onChange={e => set('workingHours', e.target.value)} placeholder="السبت - الخميس: 10 ص - 8 م" />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>
          <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
        </button>
      </div>
    </div>
  );
}
