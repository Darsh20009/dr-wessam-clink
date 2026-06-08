import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiAlertCircle, FiUserPlus, FiClock, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontFamily: 'Cairo, sans-serif', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '15px' }}>{payload[0].value?.toLocaleString()} ج.م</div>
      </div>
    );
  }
  return null;
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/dashboard/stats'),
      axios.get('/dashboard/reports?period=month'),
    ]).then(([statsRes, reportRes]) => {
      setStats(statsRes.data);
      setReportData(reportRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>جاري التحميل...</div>
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'إجمالي المرضى',
      value: stats?.totalPatients || 0,
      icon: <FiUsers />,
      color: 'blue',
      trend: '+12%',
      trendUp: true,
      sub: 'منذ الشهر الماضي',
    },
    {
      label: 'مرضى هذا الشهر',
      value: stats?.newThisMonth || 0,
      icon: <FiUserPlus />,
      color: 'green',
      trend: '+8%',
      trendUp: true,
      sub: 'مقارنة بالشهر السابق',
    },
    {
      label: 'مواعيد اليوم',
      value: stats?.todayAppointments || 0,
      icon: <FiCalendar />,
      color: 'orange',
      trend: stats?.todayAppointments > 0 ? 'نشط' : 'لا يوجد',
      trendUp: stats?.todayAppointments > 0,
      sub: 'موعد اليوم',
    },
    {
      label: 'إيرادات الشهر',
      value: `${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      suffix: ' ج.م',
      icon: <FiDollarSign />,
      color: 'purple',
      trend: '+5%',
      trendUp: true,
      sub: 'مقارنة بالشهر السابق',
    },
    {
      label: 'المبالغ المستحقة',
      value: `${(stats?.totalOutstanding || 0).toLocaleString()}`,
      suffix: ' ج.م',
      icon: <FiAlertCircle />,
      color: 'red',
      trend: stats?.totalOutstanding > 0 ? 'يحتاج متابعة' : 'لا شيء',
      trendUp: false,
      sub: 'إجمالي المستحقات',
    },
  ];

  const chartData = reportData?.revenueByDay?.slice(-14) || [];
  const today = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '17px' }}>
              <FiActivity />
            </div>
            لوحة التحكم
          </h1>
          <p className="page-subtitle" style={{ marginTop: '4px', marginRight: '46px' }}>{today}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/doctor/patients/new')}>
          <FiUserPlus /> مريض جديد
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div className={`stat-icon ${s.color}`} style={{ width: '44px', height: '44px', borderRadius: '11px' }}>{s.icon}</div>
              <span style={{
                fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                background: s.trendUp ? '#f0fdf4' : '#fff5f5',
                color: s.trendUp ? '#16a34a' : '#dc2626',
                border: `1px solid ${s.trendUp ? '#bbf7d0' : '#fecaca'}`,
              }}>{s.trend}</span>
            </div>
            <div>
              <div className="stat-value">{s.value}<span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>{s.suffix || ''}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#2563eb' }}><FiTrendingUp /></span>
              الإيرادات — آخر 14 يوم
            </h3>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'Cairo', fill: '#94a3b8' }} tickFormatter={d => d.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'Cairo', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: 'white' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ minHeight: '200px' }}>
              <FiTrendingUp style={{ fontSize: '36px', opacity: 0.2 }} />
              <p>لا توجد بيانات للعرض</p>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#2563eb' }}><FiClock /></span>
              المواعيد القادمة
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/appointments')} style={{ fontSize: '12px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
              الكل <FiArrowLeft size={12} />
            </button>
          </div>

          {stats?.upcomingAppointments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.upcomingAppointments.slice(0, 5).map((apt, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 13px', background: '#f8fafc',
                  borderRadius: '10px', border: '1px solid #f1f5f9',
                  transition: 'all 0.15s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#dbeafe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                  onClick={() => navigate(`/doctor/patients/${apt.patientId?._id || apt.patientId}`)}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: '#eff6ff', color: '#2563eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FiCalendar size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {apt.patientId?.fullName || apt.patientName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                      {format(new Date(apt.date), 'EEEE d/M — h:mm a', { locale: ar })}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '11px', flexShrink: 0 }}>{apt.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: '180px' }}>
              <FiCalendar style={{ fontSize: '36px', opacity: 0.2 }} />
              <p>لا توجد مواعيد قادمة</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#2563eb' }}><FiTrendingUp /></span>
          ملخص الشهر الحالي
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          {[
            { label: 'إجمالي الإيرادات', value: `${(reportData?.totalRevenue || 0).toLocaleString()} ج.م`, color: '#2563eb', bg: '#eff6ff', icon: <FiDollarSign size={20}/> },
            { label: 'إجمالي المواعيد', value: reportData?.totalAppointments || 0, color: '#0891b2', bg: '#ecfeff', icon: <FiCalendar size={20}/> },
            { label: 'مواعيد مكتملة', value: reportData?.completedAppointments || 0, color: '#16a34a', bg: '#f0fdf4', icon: <FiActivity size={20}/> },
            { label: 'مرضى جدد', value: reportData?.newPatients || 0, color: '#9333ea', bg: '#fdf4ff', icon: <FiUserPlus size={20}/> },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '16px 18px', background: item.bg,
              borderRadius: '12px', border: `1.5px solid ${item.bg === '#eff6ff' ? '#bfdbfe' : item.bg === '#ecfeff' ? '#a5f3fc' : item.bg === '#f0fdf4' ? '#bbf7d0' : '#e9d5ff'}`,
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: item.color, lineHeight: 1.1 }}>{item.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
